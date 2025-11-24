const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // Project operations
  selectProjectFolder: () => ipcRenderer.invoke('select-project-folder'),
  loadProject: (projectPath) => ipcRenderer.invoke('load-project', projectPath),
  detectTechStack: () => ipcRenderer.invoke('detect-tech-stack'),
  installDependencies: () => ipcRenderer.invoke('install-dependencies'),
  startProject: (projectPath) => ipcRenderer.invoke('start-project', projectPath),
  stopProject: () => ipcRenderer.invoke('stop-project'),
  
  // File operations
  readFileContent: (filePath) => ipcRenderer.invoke('read-file-content', filePath),
  
  // Terminal operations
  createTerminal: () => ipcRenderer.invoke('create-terminal'),
  terminalInput: (input) => ipcRenderer.invoke('terminal-input', input),
  killTerminal: () => ipcRenderer.invoke('kill-terminal'),
  getTerminalHistory: () => ipcRenderer.invoke('get-terminal-history'),
  getProjectStatus: () => ipcRenderer.invoke('get-project-status'),
  
  // Event listeners
  onTerminalData: (callback) => {
    ipcRenderer.on('terminal-data', (event, data) => callback(data));
  },
  onTerminalOutput: (callback) => {
    ipcRenderer.on('terminal-output', (event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('terminal-output');
  },
  onProjectLoaded: (callback) => {
    ipcRenderer.on('project-loaded', (event, data) => callback(data));
  },
  onTechStackDetected: (callback) => {
    ipcRenderer.on('tech-stack-detected', (event, data) => callback(data));
  },
  onDependenciesInstalled: (callback) => {
    ipcRenderer.on('dependencies-installed', (event, data) => callback(data));
  },
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});