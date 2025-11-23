const { app, BrowserWindow, ipcMain } = require('electron');
const VincentEngine = require('./backend/engine');

let mainWindow;
let vincentEngine;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#1e1e1e'
  });

  // Initialize Vincent Engine
  vincentEngine = new VincentEngine(mainWindow);
  
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
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});