const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const VincentEngine = require('./backend/engine');

let mainWindow;
let vincentEngine;

function createWindow() {
  console.log('Creating Electron window...');
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1e1e1e',
    show: false // Don't show until ready
  });

  // Initialize Vincent Engine
  try {
    vincentEngine = new VincentEngine(mainWindow);
    console.log('Vincent Engine initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Vincent Engine:', error);
  }
  
  // IPC handlers for window controls
  ipcMain.on('minimize-window', () => mainWindow.minimize());
  ipcMain.on('maximize-window', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  });
  ipcMain.on('close-window', () => mainWindow.close());
  


  // Show window when ready to prevent white/black screen
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
    mainWindow.maximize();
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.error('Failed to load dev server:', err);
      // Retry after a short delay
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173');
      }, 1000);
    });
  } else {
    mainWindow.loadFile('dist/index.html');
  }
}

app.whenReady().then(() => {
  console.log('Electron app ready');
  createWindow();
});

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