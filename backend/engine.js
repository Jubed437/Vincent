const { ipcMain, dialog } = require('electron');
const fileScanner = require('./modules/fileScanner');
const techDetector = require('./modules/techDetector');
const dependencyInstaller = require('./modules/dependencyInstaller');
const projectRunner = require('./modules/projectRunner');
const terminalManager = require('./modules/terminalManager');

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
        return await this.loadProject(result.filePaths[0]);
      }
      
      return { success: false, message: 'No folder selected' };
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

      this.currentProject = {
        path: projectPath,
        ...scanResult.data
      };

      terminalManager.logSuccess('Project loaded successfully');
      
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

  getCurrentProject() {
    return this.currentProject;
  }
}

module.exports = VincentEngine;