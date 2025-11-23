// Electron API wrapper for frontend
class ElectronAPI {
  // Project Management
  async selectProjectFolder() {
    return await window.require('electron').ipcRenderer.invoke('select-project-folder');
  }

  async analyzeProject(projectPath) {
    return await window.require('electron').ipcRenderer.invoke('analyze-project', projectPath);
  }

  // System Dependencies
  async checkSystemDependencies() {
    return await window.require('electron').ipcRenderer.invoke('check-system-dependencies');
  }

  // Dependencies Installation
  async installDependencies(projectPath) {
    return await window.require('electron').ipcRenderer.invoke('install-dependencies', projectPath);
  }

  // Project Control
  async startProject(projectPath) {
    return await window.require('electron').ipcRenderer.invoke('start-project', projectPath);
  }

  async stopProject() {
    return await window.require('electron').ipcRenderer.invoke('stop-project');
  }

  async getProjectStatus() {
    return await window.require('electron').ipcRenderer.invoke('get-project-status');
  }

  // Terminal
  async getTerminalHistory() {
    return await window.require('electron').ipcRenderer.invoke('get-terminal-history');
  }

  async clearTerminal() {
    return await window.require('electron').ipcRenderer.invoke('clear-terminal');
  }

  // Event Listeners
  onTerminalOutput(callback) {
    const ipcRenderer = window.require('electron').ipcRenderer;
    ipcRenderer.on('terminal-output', (event, output) => callback(output));
    
    return () => {
      ipcRenderer.removeAllListeners('terminal-output');
    };
  }

  // Window Controls
  minimizeWindow() {
    window.require('electron').ipcRenderer.send('minimize-window');
  }

  maximizeWindow() {
    window.require('electron').ipcRenderer.send('maximize-window');
  }

  closeWindow() {
    window.require('electron').ipcRenderer.send('close-window');
  }
}

export default new ElectronAPI();