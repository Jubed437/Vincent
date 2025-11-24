const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class VincentDB {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      // Create data directory in user data folder
      const userDataPath = app.getPath('userData');
      const dbDir = path.join(userDataPath, 'vincent-data');
      
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const dbPath = path.join(dbDir, 'vincent.db');
      this.db = new Database(dbPath);
      
      // Enable WAL mode for better performance
      this.db.pragma('journal_mode = WAL');
      
      this.createTables();
      console.log('Vincent database initialized:', dbPath);
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }

  createTables() {
    const tables = [
      // Projects table
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      )`,
      
      // Scans table
      `CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        tech_stack TEXT,
        file_count INTEGER,
        structure TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )`,
      
      // Dependencies table
      `CREATE TABLE IF NOT EXISTS dependencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        name TEXT NOT NULL,
        version TEXT,
        type TEXT,
        status TEXT,
        installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )`,
      
      // Runs table
      `CREATE TABLE IF NOT EXISTS runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        command TEXT,
        status TEXT,
        output TEXT,
        url TEXT,
        pid INTEGER,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        stopped_at DATETIME,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )`,
      
      // Errors table
      `CREATE TABLE IF NOT EXISTS errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        type TEXT,
        message TEXT,
        stack TEXT,
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )`,
      
      // AI Insights table
      `CREATE TABLE IF NOT EXISTS ai_insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        type TEXT,
        summary TEXT,
        recommendations TEXT,
        confidence REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id)
      )`
    ];

    tables.forEach(sql => {
      this.db.exec(sql);
    });
  }

  // Project Management
  saveProjectMetadata(projectPath, data) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO projects (path, name, type, metadata, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(
        projectPath,
        data.name || path.basename(projectPath),
        data.type || 'Unknown',
        JSON.stringify(data)
      );

      return {
        success: true,
        data: { id: result.lastInsertRowid, path: projectPath },
        message: 'Project metadata saved'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save project: ${error.message}`
      };
    }
  }

  getProject(projectPath) {
    try {
      const stmt = this.db.prepare('SELECT * FROM projects WHERE path = ?');
      const project = stmt.get(projectPath);
      
      if (project && project.metadata) {
        project.metadata = JSON.parse(project.metadata);
      }
      
      return {
        success: true,
        data: project,
        message: project ? 'Project found' : 'Project not found'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get project: ${error.message}`
      };
    }
  }

  // Scan Results
  saveScanResults(projectId, data) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scans (project_id, tech_stack, file_count, structure)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        projectId,
        JSON.stringify(data.techStack || []),
        data.fileCount || 0,
        JSON.stringify(data.structure || [])
      );

      return {
        success: true,
        data: { id: result.lastInsertRowid },
        message: 'Scan results saved'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save scan: ${error.message}`
      };
    }
  }

  // Dependencies
  saveDependencyStatus(projectId, dependencies) {
    try {
      // Clear existing dependencies for this project
      const deleteStmt = this.db.prepare('DELETE FROM dependencies WHERE project_id = ?');
      deleteStmt.run(projectId);

      // Insert new dependencies
      const insertStmt = this.db.prepare(`
        INSERT INTO dependencies (project_id, name, version, type, status)
        VALUES (?, ?, ?, ?, ?)
      `);

      const transaction = this.db.transaction((deps) => {
        for (const dep of deps) {
          insertStmt.run(projectId, dep.name, dep.version, dep.type, dep.status);
        }
      });

      transaction(dependencies);

      return {
        success: true,
        data: { count: dependencies.length },
        message: 'Dependencies saved'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save dependencies: ${error.message}`
      };
    }
  }

  getDependencies(projectId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM dependencies WHERE project_id = ?');
      const dependencies = stmt.all(projectId);
      
      return {
        success: true,
        data: dependencies,
        message: 'Dependencies retrieved'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get dependencies: ${error.message}`
      };
    }
  }

  // Run Logs
  saveRunLog(projectId, data) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO runs (project_id, command, status, output, url, pid)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        projectId,
        data.command,
        data.status,
        data.output?.slice(-10000) || '', // Keep last 10k chars
        data.url,
        data.pid
      );

      return {
        success: true,
        data: { id: result.lastInsertRowid },
        message: 'Run log saved'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save run log: ${error.message}`
      };
    }
  }

  updateRunStatus(runId, status, output) {
    try {
      const stmt = this.db.prepare(`
        UPDATE runs 
        SET status = ?, output = ?, stopped_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      stmt.run(status, output?.slice(-10000) || '', runId);

      return {
        success: true,
        message: 'Run status updated'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update run: ${error.message}`
      };
    }
  }

  // Error Logging
  saveErrors(projectId, errors) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO errors (project_id, type, message, stack, context)
        VALUES (?, ?, ?, ?, ?)
      `);

      const transaction = this.db.transaction((errorList) => {
        for (const error of errorList) {
          stmt.run(
            projectId,
            error.type || 'unknown',
            error.message,
            error.stack,
            JSON.stringify(error.context || {})
          );
        }
      });

      transaction(errors);

      return {
        success: true,
        data: { count: errors.length },
        message: 'Errors saved'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save errors: ${error.message}`
      };
    }
  }

  // AI Insights
  saveAIInsights(projectId, summary) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO ai_insights (project_id, type, summary, recommendations, confidence)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        projectId,
        summary.type || 'analysis',
        summary.summary,
        JSON.stringify(summary.recommendations || []),
        summary.confidence || 0.8
      );

      return {
        success: true,
        data: { id: result.lastInsertRowid },
        message: 'AI insights saved'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to save AI insights: ${error.message}`
      };
    }
  }

  // Utility Functions
  getProjectHistory(projectId, limit = 50) {
    try {
      const queries = {
        scans: this.db.prepare('SELECT * FROM scans WHERE project_id = ? ORDER BY created_at DESC LIMIT ?'),
        runs: this.db.prepare('SELECT * FROM runs WHERE project_id = ? ORDER BY started_at DESC LIMIT ?'),
        errors: this.db.prepare('SELECT * FROM errors WHERE project_id = ? ORDER BY created_at DESC LIMIT ?'),
        insights: this.db.prepare('SELECT * FROM ai_insights WHERE project_id = ? ORDER BY created_at DESC LIMIT ?')
      };

      const history = {
        scans: queries.scans.all(projectId, limit),
        runs: queries.runs.all(projectId, limit),
        errors: queries.errors.all(projectId, limit),
        insights: queries.insights.all(projectId, limit)
      };

      return {
        success: true,
        data: history,
        message: 'Project history retrieved'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get history: ${error.message}`
      };
    }
  }

  cleanup() {
    try {
      // Keep only last 500 terminal logs per project
      this.db.exec(`
        DELETE FROM runs 
        WHERE id NOT IN (
          SELECT id FROM runs 
          ORDER BY started_at DESC 
          LIMIT 500
        )
      `);

      // Keep only last 100 errors per project
      this.db.exec(`
        DELETE FROM errors 
        WHERE id NOT IN (
          SELECT id FROM errors 
          ORDER BY created_at DESC 
          LIMIT 100
        )
      `);

      return {
        success: true,
        message: 'Database cleaned up'
      };
    } catch (error) {
      return {
        success: false,
        message: `Cleanup failed: ${error.message}`
      };
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = new VincentDB();