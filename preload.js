const { contextBridge, ipcRenderer, shell } = require('electron');

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
  
  // Code Linting
  lintFile: (filePath) => ipcRenderer.invoke('lint-file', filePath),
  lintProject: (projectPath) => ipcRenderer.invoke('lint-project', projectPath),
  
  // Vulnerability Scanning
  scanVulnerabilities: (projectPath) => ipcRenderer.invoke('scan-vulnerabilities', projectPath),
  scanPackageJson: (projectPath) => ipcRenderer.invoke('scan-package-json', projectPath),
  
  // Code Search
  indexProject: (projectPath) => ipcRenderer.invoke('index-project', projectPath),
  searchCode: (query, options) => ipcRenderer.invoke('search-code', query, options),
  searchFiles: (filename) => ipcRenderer.invoke('search-files', filename),
  getSearchStats: () => ipcRenderer.invoke('get-search-stats'),
  
  // Event listeners
  onTerminalData: (callback) => {
    ipcRenderer.on('terminal-data', (event, data) => callback(data));
  },
  onTerminalOutput: (callback) => {
    ipcRenderer.on('terminal-output', (event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('terminal-output');
  },
  onProjectURL: (callback) => {
    ipcRenderer.on('project:url', (event, url) => callback(url));
    return () => ipcRenderer.removeAllListeners('project:url');
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
  
  // External URLs
  openExternal: (url) => ipcRenderer.invoke('open:external', url),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});