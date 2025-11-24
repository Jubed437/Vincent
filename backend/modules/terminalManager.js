const os = require('os');
let pty = null;

// Try to load node-pty, fall back to child_process if not available
try {
  pty = require('node-pty');
  console.log('✅ node-pty loaded successfully - Full terminal support enabled');
} catch (error) {
  console.warn('⚠️ node-pty not available - Using fallback terminal (limited functionality)');
  console.warn('To enable full terminal support, install Visual Studio Build Tools and run: npm rebuild node-pty');
  pty = null;
}

class TerminalManager {
  constructor() {
    this.outputs = [];
    this.listeners = [];
    this.terminals = new Map(); // Store active terminal processes
    this.terminalIdCounter = 0;
    this.usePty = pty !== null;
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

  // Terminal process management
  createTerminal(cwd = process.cwd()) {
    const terminalId = `terminal-${++this.terminalIdCounter}`;
    console.log(`Creating terminal ${terminalId} in directory: ${cwd}`);
    
    // Determine shell based on platform
    const isWindows = os.platform() === 'win32';
    const shell = isWindows ? 'powershell.exe' : '/bin/bash';
    console.log(`Using shell: ${shell}, PTY available: ${this.usePty}`);

    try {
      let ptyProcess = null;

      if (this.usePty) {
        // Use node-pty for real terminal
        ptyProcess = pty.spawn(shell, [], {
          name: 'xterm-color',
          cols: 80,
          rows: 24,
          cwd: cwd,
          env: process.env
        });

        console.log(`PTY process created successfully`);
        this.logInfo(`PTY Terminal created: ${terminalId} (${shell})`);
      } else {
        console.log(`Using fallback terminal mode`);
        this.logWarning(`Fallback terminal created: ${terminalId} (limited functionality)`);
      }

      const terminal = {
        id: terminalId,
        cwd: cwd,
        shell: shell,
        process: ptyProcess,
        dataCallbacks: [],
        usePty: this.usePty
      };

      // Set up data handler for PTY
      if (ptyProcess) {
        ptyProcess.onData((data) => {
          console.log(`PTY data received:`, data);
          // Send data to all callbacks
          terminal.dataCallbacks.forEach(callback => {
            callback({ type: 'data', data: data });
          });
        });

        ptyProcess.onExit(({ exitCode, signal }) => {
          console.log(`Terminal ${terminalId} exited with code ${exitCode}`);
          this.logInfo(`Terminal ${terminalId} exited with code ${exitCode}`);
          terminal.dataCallbacks.forEach(callback => {
            callback({ type: 'exit', code: exitCode, signal: signal });
          });
        });
        
        // Send initial prompt
        setTimeout(() => {
          terminal.dataCallbacks.forEach(callback => {
            callback({ type: 'data', data: `PS ${cwd}> ` });
          });
        }, 100);
      } else {
        // For fallback mode, send initial prompt
        setTimeout(() => {
          terminal.dataCallbacks.forEach(callback => {
            callback({ type: 'data', data: `PS ${cwd}> ` });
          });
        }, 100);
      }

      this.terminals.set(terminalId, terminal);
      
      return {
        success: true,
        data: {
          terminalId: terminalId,
          shell: shell,
          cwd: cwd,
          usePty: this.usePty
        }
      };
    } catch (error) {
      this.logError(`Failed to create terminal: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  writeToTerminal(terminalId, data) {
    const terminal = this.terminals.get(terminalId);
    
    if (!terminal) {
      return {
        success: false,
        message: 'Terminal not found'
      };
    }

    try {
      if (terminal.usePty && terminal.process) {
        // Write directly to PTY (supports interactive input)
        terminal.process.write(data);
        return {
          success: true,
          message: 'Data written to terminal'
        };
      } else {
        // Fallback: execute as command if it's a complete command (ends with \r)
        if (data.includes('\r') || data.includes('\n')) {
          const command = data.replace(/[\r\n]/g, '').trim();
          if (command) {
            this.logCommand(command);
            const { spawn } = require('child_process');
            const isWindows = os.platform() === 'win32';
            const args = isWindows ? ['/c', command] : ['-c', command];
            
            const proc = spawn(terminal.shell, args, {
              cwd: terminal.cwd,
              env: process.env,
              windowsHide: true
            });

            proc.stdout.on('data', (output) => {
              const text = output.toString();
              terminal.dataCallbacks.forEach(callback => {
                callback({ type: 'data', data: text });
              });
            });

            proc.stderr.on('data', (output) => {
              const text = output.toString();
              terminal.dataCallbacks.forEach(callback => {
                callback({ type: 'data', data: text });
              });
            });

            proc.on('close', (code) => {
              terminal.dataCallbacks.forEach(callback => {
                callback({ type: 'exit', code: code });
              });
            });
          }
        }

        return {
          success: true,
          message: 'Data processed'
        };
      }
    } catch (error) {
      this.logError(`Failed to write to terminal: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  onTerminalData(terminalId, callback) {
    const terminal = this.terminals.get(terminalId);
    
    if (!terminal) {
      return {
        success: false,
        message: 'Terminal not found'
      };
    }

    terminal.dataCallbacks.push(callback);
    
    return {
      success: true,
      unsubscribe: () => {
        terminal.dataCallbacks = terminal.dataCallbacks.filter(cb => cb !== callback);
      }
    };
  }

  killTerminal(terminalId) {
    const terminal = this.terminals.get(terminalId);
    
    if (!terminal) {
      return {
        success: false,
        message: 'Terminal not found'
      };
    }

    try {
      // Kill the PTY process if it exists
      if (terminal.process) {
        if (terminal.usePty) {
          terminal.process.kill();
        } else if (!terminal.process.killed) {
          terminal.process.kill();
        }
      }

      // Remove from map
      this.terminals.delete(terminalId);
      
      this.logInfo(`Terminal closed: ${terminalId}`);
      
      return {
        success: true,
        message: 'Terminal closed'
      };
    } catch (error) {
      this.logError(`Failed to kill terminal: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Resize terminal (for PTY)
  resizeTerminal(terminalId, cols, rows) {
    const terminal = this.terminals.get(terminalId);
    
    if (!terminal) {
      return {
        success: false,
        message: 'Terminal not found'
      };
    }

    try {
      if (terminal.usePty && terminal.process) {
        terminal.process.resize(cols, rows);
        return {
          success: true,
          message: 'Terminal resized'
        };
      }
      return {
        success: false,
        message: 'Terminal does not support resizing'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  getTerminalHistory(terminalId) {
    // For now, return global history
    // In a more advanced implementation, we could track per-terminal history
    return this.outputs;
  }

  // Simple command execution without terminal session
  executeCommand(command, cwd = process.cwd()) {
    return new Promise((resolve) => {
      try {
        const { spawn } = require('child_process');
        const isWindows = os.platform() === 'win32';
        const shell = isWindows ? 'powershell.exe' : '/bin/bash';
        const args = isWindows ? ['-Command', command] : ['-c', command];
        
        const proc = spawn(shell, args, {
          cwd: cwd,
          env: process.env,
          windowsHide: true
        });

        let output = '';
        let error = '';

        proc.stdout.on('data', (data) => {
          output += data.toString();
        });

        proc.stderr.on('data', (data) => {
          error += data.toString();
        });

        proc.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              output: output || 'Command executed successfully',
              code: code
            });
          } else {
            resolve({
              success: false,
              message: error || `Command failed with code ${code}`,
              output: output,
              code: code
            });
          }
        });

        proc.on('error', (err) => {
          resolve({
            success: false,
            message: `Failed to execute command: ${err.message}`
          });
        });
      } catch (error) {
        resolve({
          success: false,
          message: `Error: ${error.message}`
        });
      }
    });
  }
}

module.exports = new TerminalManager();