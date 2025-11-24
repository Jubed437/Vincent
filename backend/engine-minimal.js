const { ipcMain } = require('electron');

class VincentEngineMinimal {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupBasicHandlers();
    console.log('Minimal Vincent Engine initialized');
  }

  setupBasicHandlers() {
    // Basic test handler
    ipcMain.handle('test-connection', async () => {
      return { success: true, message: 'Connection working' };
    });

    // Select project folder handler
    ipcMain.handle('select-project-folder', async () => {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Project Folder'
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        const projectPath = result.filePaths[0];
        console.log('Selected project folder:', projectPath);
        return {
          success: true,
          message: 'Project loaded successfully',
          data: {
            structure: [],
            project: { 
              path: projectPath, 
              name: require('path').basename(projectPath),
              rootPath: projectPath
            }
          }
        };
      }
      
      return { success: false, message: 'No folder selected' };
    });

    // Load project handler (minimal)
    ipcMain.handle('load-project', async (event, projectPath) => {
      console.log('Load project called:', projectPath);
      return {
        success: true,
        message: 'Project loaded (minimal)',
        data: {
          structure: [],
          project: { path: projectPath, name: 'Test Project' }
        }
      };
    });

    // File reading handler (minimal)
    ipcMain.handle('read-file-content', async (event, filePath) => {
      console.log('Read file called:', filePath);
      return {
        success: true,
        data: {
          content: 'File content placeholder',
          path: filePath
        }
      };
    });

    // Terminal handlers (minimal)
    ipcMain.handle('create-terminal', async () => {
      console.log('Create terminal called');
      return { success: true, terminalId: 'test-terminal' };
    });

    ipcMain.handle('terminal-input', async (event, input) => {
      console.log('Terminal input:', input);
      return { success: true };
    });

    ipcMain.handle('kill-terminal', async () => {
      console.log('Kill terminal called');
      return { success: true };
    });

    // Tech stack detection (minimal)
    ipcMain.handle('detect-tech-stack', async () => {
      console.log('Detect tech stack called');
      return {
        success: true,
        message: 'Tech stack detected (minimal)',
        data: {
          techStack: ['JavaScript', 'Node.js'],
          projectType: 'JavaScript'
        }
      };
    });

    // Install dependencies (minimal)
    ipcMain.handle('install-dependencies', async () => {
      console.log('Install dependencies called');
      return {
        success: true,
        message: 'Dependencies installed (minimal)'
      };
    });

    // Start/stop project (minimal)
    ipcMain.handle('start-project', async (event, projectPath) => {
      console.log('Start project called:', projectPath);
      return {
        success: true,
        message: 'Project started (minimal)',
        data: { url: 'http://localhost:3000' }
      };
    });

    ipcMain.handle('stop-project', async () => {
      console.log('Stop project called');
      return {
        success: true,
        message: 'Project stopped (minimal)'
      };
    });
  }
}

module.exports = VincentEngineMinimal;