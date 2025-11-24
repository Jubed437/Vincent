const { ipcMain, dialog } = require('electron');
const fileScanner = require('./modules/fileScanner');
const techDetector = require('./modules/techDetector');
const dependencyInstaller = require('./modules/dependencyInstaller');
const projectRunner = require('./modules/projectRunner');
const terminalManager = require('./modules/terminalManager');
const aiAnalyzer = require('./modules/aiAnalyzer');
const editorManager = require('./modules/editorManager');

class VincentEngine {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.currentProject = null;
    this.setupIpcHandlers();
    this.setupTerminalListener();
  }

  setupIpcHandlers() {
    // Project Upload
    ipcMain.handle('select-project-folder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Project Folder'
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return { success: true, path: result.filePaths[0] };
      }
      
      return { success: false, message: 'No folder selected' };
    });

    // Load Project
    ipcMain.handle('load-project', async (event, projectPath) => {
      return await this.loadProject(projectPath);
    });

    // Project Analysis
    ipcMain.handle('analyze-project', async (event, projectPath) => {
      return await this.analyzeProject(projectPath);
    });

    // Tech Stack Detection (uses current project)
    ipcMain.handle('detect-tech-stack', async () => {
      if (!this.currentProject) {
        return { success: false, message: 'No project loaded' };
      }
      return await this.analyzeProject(this.currentProject.path);
    });

    // System Dependencies
    ipcMain.handle('check-system-dependencies', async () => {
      return await dependencyInstaller.checkSystemDependencies();
    });

    // Install Dependencies
    ipcMain.handle('install-dependencies', async (event, projectPath) => {
      // If no projectPath provided, use current project
      const targetPath = projectPath || this.currentProject?.path;
      if (!targetPath) {
        return { success: false, message: 'No project loaded' };
      }
      return await this.installProjectDependencies(targetPath);
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

    // File Reading
    ipcMain.handle('read-file-content', async (event, filePath) => {
      return await this.readFileContent(filePath);
    });

    // Terminal
    ipcMain.handle('create-terminal', async (event, cwd) => {
      const workingDir = cwd || this.currentProject?.path || process.cwd();
      const result = terminalManager.createTerminal(workingDir);
      if (result.success) {
        this.setupTerminalDataListener(result.data.terminalId);
      }
      return result;
    });

    ipcMain.handle('terminal-input', async (event, command) => {
      const workingDir = this.currentProject?.path || process.cwd();
      return await terminalManager.executeCommand(command, workingDir);
    });

    ipcMain.handle('kill-terminal', async () => {
      // Kill all terminals (simplified)
      const terminals = Array.from(terminalManager.terminals.keys());
      terminals.forEach(terminalId => {
        terminalManager.killTerminal(terminalId);
      });
      return { success: true };
    });

    ipcMain.handle('get-terminal-history', async () => {
      return terminalManager.getHistory();
    });

    ipcMain.handle('clear-terminal', async () => {
      terminalManager.clear();
      return { success: true };
    });

    ipcMain.handle('resize-terminal', async (event, terminalId, cols, rows) => {
      return terminalManager.resizeTerminal(terminalId, cols, rows);
    });

    // Add missing resize terminal method to electronAPI
    ipcMain.handle('resize-terminal', async (event, terminalId, cols, rows) => {
      return terminalManager.resizeTerminal(terminalId, cols, rows);
    });

    // AI Analysis
    ipcMain.handle('ai-analyze-structure', async (event, projectPath) => {
      return await aiAnalyzer.analyzeProjectStructure(projectPath);
    });

    ipcMain.handle('ai-find-bugs', async (event, projectPath) => {
      return await aiAnalyzer.findPotentialBugs(projectPath);
    });

    ipcMain.handle('ai-analyze-performance', async (event, projectPath) => {
      return await aiAnalyzer.analyzePerformance(projectPath);
    });

    ipcMain.handle('ai-security-audit', async (event, projectPath) => {
      return await aiAnalyzer.securityAudit(projectPath);
    });

    // Editor Management
    ipcMain.handle('detect-editors', async () => {
      return await editorManager.detectEditors();
    });

    ipcMain.handle('get-editors', async () => {
      return editorManager.getEditors();
    });

    ipcMain.handle('open-editor', async (event, editorPath, projectPath) => {
      return await editorManager.openEditor(editorPath, projectPath);
    });
  }

  setupTerminalListener() {
    terminalManager.addListener((output) => {
      this.mainWindow.webContents.send('terminal-output', output);
    });
  }

  setupTerminalDataListener(terminalId) {
    console.log(`Setting up terminal data listener for: ${terminalId}`);
    const result = terminalManager.onTerminalData(terminalId, (data) => {
      console.log(`Terminal data received:`, data);
      this.mainWindow.webContents.send('terminal-data', {
        terminalId: terminalId,
        text: data.data || data.text,
        type: data.type || 'output',
        ...data
      });
    });
    return result;
  }

  async loadProject(projectPath) {
    try {
      terminalManager.logInfo(`Loading project: ${projectPath}`);
      
      const scanResult = fileScanner.scanProject(projectPath);
      if (!scanResult.success) {
        terminalManager.logError(scanResult.message);
        return scanResult;
      }

      this.currentProject = {
        path: projectPath,
        name: require('path').basename(projectPath),
        rootPath: scanResult.data.rootPath,
        structure: scanResult.data.structure
      };

      terminalManager.logSuccess('Project loaded successfully');
      
      // Auto-analyze the project
      const analysisResult = await this.analyzeProject(projectPath);
      
      return {
        success: true,
        message: 'Project loaded successfully',
        data: {
          structure: scanResult.data.structure,
          project: {
            path: projectPath,
            name: require('path').basename(projectPath),
            rootPath: scanResult.data.rootPath,
            structure: scanResult.data.structure
          },
          analysis: analysisResult.success ? analysisResult.data : null
        }
      };
    } catch (error) {
      const errorMsg = `Failed to load project: ${error.message}`;
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg,
        data: null
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

      terminalManager.logSuccess(`Detected: ${techResult.data.projectType}`);
      terminalManager.logInfo(`Found ${techResult.data.techStack.length} technologies`);

      return {
        success: true,
        message: 'Project analysis completed',
        data: {
          ...scanResult.data,
          ...techResult.data
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

  async readFileContent(filePath) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      // Validate file path exists
      const stats = await fs.stat(filePath);
      
      if (!stats.isFile()) {
        return {
          success: false,
          message: 'Path is not a file'
        };
      }

      // Read file with UTF-8 encoding
      const content = await fs.readFile(filePath, 'utf8');
      
      return {
        success: true,
        data: {
          content: content,
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          encoding: 'utf8'
        }
      };
    } catch (error) {
      // Handle specific error cases
      if (error.code === 'ENOENT') {
        return {
          success: false,
          message: 'File not found'
        };
      } else if (error.code === 'EACCES') {
        return {
          success: false,
          message: 'Permission denied'
        };
      } else if (error.message.includes('invalid') || error.message.includes('decode')) {
        // Binary file or encoding issue
        return {
          success: false,
          message: 'Unable to read file - may be a binary file',
          isBinary: true
        };
      } else {
        return {
          success: false,
          message: `Failed to read file: ${error.message}`
        };
      }
    }
  }

  getCurrentProject() {
    return this.currentProject;
  }
}

module.exports = VincentEngine;