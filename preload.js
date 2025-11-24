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
  
  // Editor operations
  detectEditors: () => ipcRenderer.invoke('detect-editors'),
  getEditors: () => ipcRenderer.invoke('get-editors'),
  openEditor: (editorPath, projectPath) => ipcRenderer.invoke('open-editor', editorPath, projectPath),
  
  // LLM Analysis
  semanticAnalysis: (staticResult) => ipcRenderer.invoke('ai-semantic-analysis', staticResult),
  analyzeProjectEnhanced: (projectPath) => ipcRenderer.invoke('analyze-project-enhanced', projectPath),
  
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
  
  // AI Analysis (legacy)
  analyzeProjectStructure: (projectPath) => ipcRenderer.invoke('ai-analyze-structure', projectPath),
  findPotentialBugs: (projectPath) => ipcRenderer.invoke('ai-find-bugs', projectPath),
  analyzePerformance: (projectPath) => ipcRenderer.invoke('ai-analyze-performance', projectPath),
  securityAudit: (projectPath) => ipcRenderer.invoke('ai-security-audit', projectPath),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});