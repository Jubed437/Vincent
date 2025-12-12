require('dotenv').config();
const { app, BrowserWindow, ipcMain, shell } = require('electron');
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
  ipcMain.on('close-window', () => {
    // Clean up any running processes before closing
    if (vincentEngine) {
      const projectRunner = require('./backend/modules/projectRunner');
      projectRunner.stopProject();
    }
    mainWindow.close();
  });

  // Handle external URL opening
  ipcMain.handle('open:external', (_, url) => {
    shell.openExternal(url);
  });
  


  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173').then(() => {
      console.log('Dev server loaded successfully');
      mainWindow.show();
      mainWindow.maximize();
    }).catch(err => {
      console.error('Failed to load dev server:', err);
      // Show window anyway and retry
      mainWindow.show();
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:5173');
      }, 2000);
    });
  } else {
    mainWindow.loadFile('dist/index.html').then(() => {
      mainWindow.show();
      mainWindow.maximize();
    });
  }

  // Fallback: show window after 3 seconds if not shown yet
  setTimeout(() => {
    if (!mainWindow.isVisible()) {
      console.log('Fallback: showing window');
      mainWindow.show();
    }
  }, 3000);
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