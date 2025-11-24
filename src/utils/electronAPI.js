// Electron API wrapper for frontend
class ElectronAPI {
  // Project Management
  async selectProjectFolder() {
    return await window.electronAPI.selectProjectFolder();
  }

  async loadProject(projectPath) {
    return await window.electronAPI.loadProject(projectPath);
  }

  async detectTechStack() {
    try {
      return await window.electronAPI.detectTechStack();
    } catch (error) {
      console.error('Error detecting tech stack:', error);
      return { success: false, message: error.message };
    }
  }

  async installDependencies() {
    try {
      return await window.electronAPI.installDependencies();
    } catch (error) {
      console.error('Error installing dependencies:', error);
      return { success: false, message: error.message };
    }
  }

  async startProject(projectPath) {
    try {
      return await window.electronAPI.startProject(projectPath);
    } catch (error) {
      console.error('Error starting project:', error);
      return { success: false, message: error.message };
    }
  }

  async stopProject() {
    try {
      return await window.electronAPI.stopProject();
    } catch (error) {
      console.error('Error stopping project:', error);
      return { success: false, message: error.message };
    }
  }

  // File Reading
  async readFileContent(filePath) {
    try {
      return await window.electronAPI.readFileContent(filePath);
    } catch (error) {
      console.error('Error reading file:', error);
      return { success: false, message: error.message };
    }
  }

  // Terminal
  async createTerminal() {
    try {
      return await window.electronAPI.createTerminal();
    } catch (error) {
      console.error('Error creating terminal:', error);
      return { success: false, message: error.message };
    }
  }

  async terminalInput(input) {
    try {
      return await window.electronAPI.terminalInput(input);
    } catch (error) {
      console.error('Error sending terminal input:', error);
      return { success: false, message: error.message };
    }
  }

  async killTerminal() {
    try {
      return await window.electronAPI.killTerminal();
    } catch (error) {
      console.error('Error killing terminal:', error);
      return { success: false, message: error.message };
    }
  }

  async getTerminalHistory() {
    try {
      return await window.electronAPI.getTerminalHistory();
    } catch (error) {
      console.error('Error getting terminal history:', error);
      return { success: false, message: error.message };
    }
  }

  async getProjectStatus() {
    try {
      return await window.electronAPI.getProjectStatus();
    } catch (error) {
      console.error('Error getting project status:', error);
      return { success: false, message: error.message };
    }
  }

  // Editor Management
  async detectEditors() {
    try {
      return await window.electronAPI.detectEditors();
    } catch (error) {
      console.error('Error detecting editors:', error);
      return { success: false, message: error.message };
    }
  }

  async getEditors() {
    try {
      return await window.electronAPI.getEditors();
    } catch (error) {
      console.error('Error getting editors:', error);
      return { success: false, message: error.message };
    }
  }

  async openEditor(editorPath, projectPath) {
    try {
      return await window.electronAPI.openEditor(editorPath, projectPath);
    } catch (error) {
      console.error('Error opening editor:', error);
      return { success: false, message: error.message };
    }
  }

  // Event listeners
  onTerminalData(callback) {
    window.electronAPI.onTerminalData(callback);
  }

  onTerminalOutput(callback) {
    return window.electronAPI.onTerminalOutput(callback);
  }

  onProjectLoaded(callback) {
    window.electronAPI.onProjectLoaded(callback);
  }

  onTechStackDetected(callback) {
    window.electronAPI.onTechStackDetected(callback);
  }

  onDependenciesInstalled(callback) {
    window.electronAPI.onDependenciesInstalled(callback);
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