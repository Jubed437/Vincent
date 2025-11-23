const { ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fileScanner = require('./modules/fileScanner');
const techDetector = require('./modules/techDetector');
const dependencyInstaller = require('./modules/dependencyInstaller');
const projectRunner = require('./modules/projectRunner');
const terminalManager = require('./modules/terminalManager');
const db = require('./db');
const aiAgentRoutes = require('./ai/ipc/aiAgentRoutes');

class VincentEngine {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.currentProject = null;
    this.setupIpcHandlers();
    this.setupTerminalListener();
  }

  setupIpcHandlers() {
    // Setup AI Agent routes
    aiAgentRoutes.setupRoutes();
    
    // File Operations
    ipcMain.handle('file:read', async (event, { filePath }) => {
      console.log('main: reading file', filePath);
      try {
        // Security check: ensure file path is absolute and exists
        if (!path.isAbsolute(filePath)) {
          throw new Error('File path must be absolute');
        }
        
        const content = await fs.readFile(filePath, 'utf8');
        console.log('main: file read success, length:', content.length);
        return { success: true, content };
      } catch (error) {
        console.error('main: file read error:', error);
        return { success: false, error: error.message };
      }
    });
    
    // Project Upload
    ipcMain.handle('select-project-folder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Project Folder'
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return await this.loadProject(result.filePaths[0]);
      }
      
      return { success: false, message: 'No folder selected' };
    });

    // Project Scanning
    ipcMain.handle('scan:project', async (event, projectPath) => {
      console.log('scan: started', projectPath);
      const result = fileScanner.scanProject(projectPath);
      console.log('scan: completed', result.success);
      return result;
    });

    // Project Analysis
    ipcMain.handle('analyze-project', async (event, projectPath) => {
      return await this.analyzeProject(projectPath);
    });

    // System Dependencies
    ipcMain.handle('check-system-dependencies', async () => {
      return await dependencyInstaller.checkSystemDependencies();
    });

    // Install Dependencies
    ipcMain.handle('install-dependencies', async (event, projectPath) => {
      return await this.installProjectDependencies(projectPath);
    });

    // Project Control
    ipcMain.handle('start-project', async (event, projectPath) => {
      return await this.startProject(projectPath);
    });

    ipcMain.handle('stop-project', async () => {
      return projectRunner.stopProject();
    });

    ipcMain.handle('get-project-status', async () => {
      return projectRunner.getStatus();
    });

    // Terminal
    ipcMain.handle('get-terminal-history', async () => {
      return terminalManager.getHistory();
    });

    ipcMain.handle('clear-terminal', async () => {
      terminalManager.clear();
      return { success: true };
    });

    // Database
    ipcMain.handle('get-project-history', async (event, projectId) => {
      return db.getProjectHistory(projectId);
    });

    ipcMain.handle('cleanup-database', async () => {
      return db.cleanup();
    });
  }

  setupTerminalListener() {
    terminalManager.addListener((output) => {
      this.mainWindow.webContents.send('terminal-output', output);
    });
  }

  async loadProject(projectPath) {
    try {
      terminalManager.logInfo(`Loading project: ${projectPath}`);
      
      const scanResult = fileScanner.scanProject(projectPath);
      if (!scanResult.success) {
        terminalManager.logError(scanResult.message);
        return scanResult;
      }

      // Save project to database
      const projectResult = db.saveProjectMetadata(projectPath, {
        name: path.basename(projectPath),
        type: 'JavaScript Project',
        ...scanResult.data
      });

      this.currentProject = {
        id: projectResult.data?.id,
        path: projectPath,
        ...scanResult.data
      };

      terminalManager.logSuccess('Project loaded and saved to database');
      
      // Auto-analyze the project
      const analysisResult = await this.analyzeProject(projectPath);
      
      return {
        success: true,
        message: 'Project loaded successfully',
        data: {
          project: this.currentProject,
          analysis: analysisResult.data
        }
      };
    } catch (error) {
      const errorMsg = `Failed to load project: ${error.message}`;
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  }

  async analyzeProject(projectPath) {
    try {
      terminalManager.logInfo('🔍 Analyzing project structure and dependencies...');
      
      const scanResult = fileScanner.scanProject(projectPath);
      if (!scanResult.success) {
        return scanResult;
      }

      const techResult = techDetector.detectTechStack(
        projectPath, 
        scanResult.data.packageJson
      );
      
      if (!techResult.success) {
        return techResult;
      }

      // Save scan results to database
      if (this.currentProject?.id) {
        db.saveScanResults(this.currentProject.id, {
          techStack: techResult.data.techStack,
          fileCount: this.countFiles(scanResult.data.structure),
          structure: scanResult.data.structure
        });

        // Save dependencies
        const allDeps = [
          ...(techResult.data.dependencies?.production || []),
          ...(techResult.data.dependencies?.development || [])
        ];
        if (allDeps.length > 0) {
          db.saveDependencyStatus(this.currentProject.id, allDeps);
        }
      }

      terminalManager.logSuccess(`Detected: ${techResult.data.projectType}`);
      terminalManager.logInfo(`Found ${techResult.data.techStack.length} technologies`);

      return {
        success: true,
        message: 'Project analysis completed',
        data: {
          ...scanResult.data,
          ...techResult.data,
          scripts: scanResult.data.packageJson?.scripts || {}
        }
      };
    } catch (error) {
      const errorMsg = `Analysis failed: ${error.message}`;
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  }

  async installProjectDependencies(projectPath) {
    try {
      terminalManager.logCommand('npm install');
      
      const result = await dependencyInstaller.installDependencies(
        projectPath,
        (output) => terminalManager.addOutput(output)
      );

      return result;
    } catch (error) {
      const errorMsg = `Installation failed: ${error.message}`;
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  }

  async startProject(projectPath) {
    try {
      const result = await projectRunner.startProject(
        projectPath,
        (output) => terminalManager.addOutput(output)
      );

      if (result.success && result.data?.url) {
        terminalManager.logSuccess(`Server running at: ${result.data.url}`);
      }

      return result;
    } catch (error) {
      const errorMsg = `Failed to start project: ${error.message}`;
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  }

  getCurrentProject() {
    return this.currentProject;
  }

  countFiles(structure, count = 0) {
    if (!structure) return count;
    for (const item of structure) {
      if (item.type === 'file') {
        count++;
      } else if (item.children) {
        count = this.countFiles(item.children, count);
      }
    }
    return count;
  }
}

module.exports = VincentEngine;