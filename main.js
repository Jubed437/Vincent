const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const VincentEngine = require('./backend/engine');
const EditorDetector = require('./backend/modules/editorDetector');
const db = require('./backend/db');

let mainWindow;
let vincentEngine;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1e1e1e'
  });

  // Initialize Vincent Engine (includes all IPC handlers)
  vincentEngine = new VincentEngine(mainWindow);

  // Editor detection handlers
  const editorDetector = new EditorDetector();
  
  ipcMain.handle('editors:list', async () => {
    try {
      console.log('IPC: editors:list called');
      const editors = await editorDetector.detectEditors();
      console.log('IPC: returning editors:', editors);
      return editors;
    } catch (error) {
      console.error('Error detecting editors:', error);
      return [];
    }
  });
  
  ipcMain.handle('editor:open', async (_, { editorPath, projectPath }) => {
    try {
      console.log(`IPC: Opening editor ${editorPath} with project ${projectPath}`);
      
      const child = spawn(editorPath, [projectPath], { 
        shell: true, 
        detached: true,
        stdio: 'ignore'
      });
      
      child.unref();
      console.log('IPC: Editor launched successfully');
      return { success: true };
    } catch (error) {
      console.error('Error opening editor:', error);
      return { success: false, error: error.message };
    }
  });

  // IPC handlers for window controls
  ipcMain.on('minimize-window', () => mainWindow.minimize());
  ipcMain.on('maximize-window', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on('close-window', () => mainWindow.close());

  mainWindow.loadURL('http://localhost:5173');
  mainWindow.maximize();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close();
    app.quit();
  }
});

app.on('before-quit', () => {
  db.close();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});