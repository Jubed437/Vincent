// Electron API wrapper using secure contextBridge
class ElectronAPI {
  // Project Management
  async selectProjectFolder() {
    return await window.electronAPI.selectProjectFolder();
  }

  async scanProject(projectPath) {
    console.log('electronAPI: scan started', projectPath);
    const result = await window.electronAPI.scanProject(projectPath);
    console.log('electronAPI: scan result', result);
    return result;
  }

  async analyzeProject(projectPath) {
    return await window.electronAPI.analyzeProject(projectPath);
  }

  async readFile(filePath) {
    return await window.electronAPI.readFile(filePath);
  }

  // System Dependencies
  async checkSystemDependencies() {
    return await window.electronAPI.checkSystemDependencies();
  }

  // Dependencies Installation
  async installDependencies(projectPath) {
    return await window.electronAPI.installDependencies(projectPath);
  }

  // Project Control
  async startProject(projectPath) {
    return await window.electronAPI.startProject(projectPath);
  }

  async stopProject() {
    return await window.electronAPI.stopProject();
  }

  async getProjectStatus() {
    return await window.electronAPI.getProjectStatus();
  }

  // Terminal
  async getTerminalHistory() {
    return await window.electronAPI.getTerminalHistory();
  }

  async clearTerminal() {
    return await window.electronAPI.clearTerminal();
  }

  // Event Listeners
  onTerminalOutput(callback) {
    return window.electronAPI.onTerminalOutput(callback);
  }

  // AI Agent
  async aiAnalyzeProject(projectPath) {
    return await window.electronAPI.aiAnalyzeProject(projectPath);
  }

  async aiGetQuickInsights(projectPath) {
    return await window.electronAPI.aiGetQuickInsights(projectPath);
  }

  async aiGetRecommendations(projectPath) {
    return await window.electronAPI.aiGetRecommendations(projectPath);
  }

  // Database
  async getProjectHistory(projectId) {
    return await window.electronAPI.getProjectHistory(projectId);
  }

  async cleanupDatabase() {
    return await window.electronAPI.cleanupDatabase();
  }

  // Window Controls
  minimizeWindow() {
    window.electronAPI.minimizeWindow();
  }

  maximizeWindow() {
    window.electronAPI.maximizeWindow();
  }

  closeWindow() {
    window.electronAPI.closeWindow();
  }
}

export default new ElectronAPI();