class TerminalManager {
  constructor() {
    this.outputs = [];
    this.listeners = [];
  }

  addOutput(text, type = 'info') {
    const output = {
      id: Date.now(),
      text,
      type,
      timestamp: new Date().toLocaleTimeString()
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
}

module.exports = new TerminalManager();