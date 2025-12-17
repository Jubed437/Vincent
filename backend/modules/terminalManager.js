const os = require('os');
const { spawn } = require('child_process');

class TerminalManager {
  constructor() {
    this.outputs = [];
    this.listeners = [];
    this.terminals = new Map();
    this.terminalIdCounter = 0;
  }

  addOutput(text, type = 'info') {
    const output = {
      id: Date.now(),
      text,
      type,
      timestamp: new Date().toISOString()
    };
    
    this.outputs.push(output);
    
    // Keep only last 1000 entries
    if (this.outputs.length > 1000) {
      this.outputs = this.outputs.slice(-1000);
    }
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(output));
    
    return output;
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  clear() {
    this.outputs = [];
    this.addOutput('Terminal cleared', 'system');
  }

  getHistory() {
    return this.outputs;
  }

  formatOutput(text, prefix = '') {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => `${prefix}${line}`).join('\n');
  }

  logSuccess(message) {
    return this.addOutput(`✅ ${message}`, 'success');
  }

  logError(message) {
    return this.addOutput(`❌ ${message}`, 'error');
  }

  logWarning(message) {
    return this.addOutput(`⚠️ ${message}`, 'warning');
  }

  logInfo(message) {
    return this.addOutput(`ℹ️ ${message}`, 'info');
  }

  logCommand(command) {
    return this.addOutput(`$ ${command}`, 'command');
  }

  // Start project using old terminal system
  startProject(projectPath, command) {
    this.logCommand(command);
    return this.executeCommand(command, projectPath);
  }



  stopProject() {
    this.logInfo('Project stopped');
    return { success: true };
  }



  executeCommand(command, cwd = process.cwd()) {
    this.logCommand(`Executing: ${command} in ${cwd}`);
    
    return new Promise((resolve) => {
      try {
        const isWindows = os.platform() === 'win32';
        const shell = isWindows ? 'cmd' : 'bash';
        const args = isWindows ? ['/c', command] : ['-c', command];
        
        const proc = spawn(shell, args, {
          cwd: cwd,
          env: process.env,
          windowsHide: true
        });

        let output = '';
        let error = '';

        proc.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          this.addOutput(text, 'info');
        });

        proc.stderr.on('data', (data) => {
          const text = data.toString();
          error += text;
          this.addOutput(text, 'error');
        });

        proc.on('close', (code) => {
          if (code === 0) {
            this.logSuccess(`Command completed successfully`);
            resolve({
              success: true,
              output: output || 'Command executed successfully',
              code: code
            });
          } else {
            this.logError(`Command failed with code ${code}`);
            resolve({
              success: false,
              message: error || `Command failed with code ${code}`,
              output: output,
              code: code
            });
          }
        });

        proc.on('error', (err) => {
          this.logError(`Failed to execute command: ${err.message}`);
          resolve({
            success: false,
            message: `Failed to execute command: ${err.message}`
          });
        });
      } catch (error) {
        this.logError(`Error: ${error.message}`);
        resolve({
          success: false,
          message: `Error: ${error.message}`
        });
      }
    });
  }

  // Terminal management methods for compatibility
  createTerminal(cwd) {
    const terminalId = `terminal_${++this.terminalIdCounter}`;
    this.terminals.set(terminalId, { cwd, active: true });
    return {
      success: true,
      data: { terminalId }
    };
  }

  killTerminal(terminalId) {
    this.terminals.delete(terminalId);
    return { success: true };
  }

  resizeTerminal(terminalId, cols, rows) {
    return { success: true };
  }

  onTerminalData(terminalId, callback) {
    return { success: true };
  }

  sendInputToProcess(input) {
    return { success: false, message: 'Use executeCommand instead' };
  }

  interruptProcess() {
    return { success: false, message: 'Not supported in old terminal' };
  }
}

module.exports = new TerminalManager();