const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Project Management
  selectProjectFolder: () => ipcRenderer.invoke('select-project-folder'),
  scanProject: (projectPath) => ipcRenderer.invoke('scan:project', projectPath),
  analyzeProject: (projectPath) => ipcRenderer.invoke('analyze-project', projectPath),
  
  // File Operations
  readFile: (filePath) => {
    console.log('preload: readFile called with', filePath);
    return ipcRenderer.invoke('file:read', { filePath });
  },
  
  // System Dependencies
  checkSystemDependencies: () => ipcRenderer.invoke('check-system-dependencies'),
  
  // Dependencies Installation
  installDependencies: (projectPath) => ipcRenderer.invoke('install-dependencies', projectPath),
  
  // Project Control
  startProject: (projectPath) => ipcRenderer.invoke('start-project', projectPath),
  stopProject: () => ipcRenderer.invoke('stop-project'),
  getProjectStatus: () => ipcRenderer.invoke('get-project-status'),
  
  // Terminal
  getTerminalHistory: () => ipcRenderer.invoke('get-terminal-history'),
  clearTerminal: () => ipcRenderer.invoke('clear-terminal'),
  
  // Event Listeners
  onTerminalOutput: (callback) => {
    ipcRenderer.on('terminal-output', (event, output) => callback(output));
    return () => ipcRenderer.removeAllListeners('terminal-output');
  },
  
  // AI Agent
  aiAnalyzeProject: (projectPath) => ipcRenderer.invoke('ai:analyze-project', { projectPath }),
  aiGetQuickInsights: (projectPath) => ipcRenderer.invoke('ai:quick-insights', { projectPath }),
  aiGetRecommendations: (projectPath) => ipcRenderer.invoke('ai:get-recommendations', { projectPath }),
  
  // Database
  getProjectHistory: (projectId) => ipcRenderer.invoke('get-project-history', projectId),
  cleanupDatabase: () => ipcRenderer.invoke('cleanup-database'),
  
  // Window Controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});

// Also expose as window.api for compatibility
contextBridge.exposeInMainWorld('api', {
  readFile: (filePath) => {
    console.log('preload: api.readFile called with', filePath);
    return ipcRenderer.invoke('file:read', { filePath });
  }
});