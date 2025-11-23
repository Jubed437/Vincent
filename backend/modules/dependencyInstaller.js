const { spawn } = require('child_process');
const path = require('path');

class DependencyInstaller {
  constructor() {
    this.activeProcess = null;
  }

  async installDependencies(projectPath, onProgress) {
    return new Promise((resolve) => {
      try {
        onProgress?.('📦 Starting dependency installation...');
        
        this.activeProcess = spawn('npm', ['install'], {
          cwd: projectPath,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        
        this.activeProcess.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          onProgress?.(text.trim());
        });

        this.activeProcess.stderr.on('data', (data) => {
          const text = data.toString();
          if (!text.includes('WARN')) {
            onProgress?.(`❌ ${text.trim()}`);
          }
        });

        this.activeProcess.on('close', (code) => {
          this.activeProcess = null;
          if (code === 0) {
            onProgress?.('✅ Dependencies installed successfully');
            resolve({
              success: true,
              message: 'Dependencies installed successfully',
              data: { output }
            });
          } else {
            onProgress?.(`❌ Installation failed with code ${code}`);
            resolve({
              success: false,
              message: `Installation failed with exit code ${code}`,
              data: { output }
            });
          }
        });

        this.activeProcess.on('error', (error) => {
          this.activeProcess = null;
          onProgress?.(`❌ Installation error: ${error.message}`);
          resolve({
            success: false,
            message: `Installation error: ${error.message}`
          });
        });

      } catch (error) {
        resolve({
          success: false,
          message: `Failed to start installation: ${error.message}`
        });
      }
    });
  }

  async checkSystemDependencies() {
    const results = {};
    
    // Check Node.js
    results.node = await this.checkCommand('node', ['--version']);
    
    // Check npm
    results.npm = await this.checkCommand('npm', ['--version']);
    
    // Check MongoDB (optional)
    results.mongodb = await this.checkCommand('mongo', ['--version']);
    
    return {
      success: true,
      data: results
    };
  }

  checkCommand(command, args) {
    return new Promise((resolve) => {
      const process = spawn(command, args, { shell: true });
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        resolve({
          available: code === 0,
          version: code === 0 ? output.trim() : null,
          command
        });
      });
      
      process.on('error', () => {
        resolve({
          available: false,
          version: null,
          command
        });
      });
    });
  }

  stopInstallation() {
    if (this.activeProcess) {
      this.activeProcess.kill('SIGTERM');
      this.activeProcess = null;
      return { success: true, message: 'Installation stopped' };
    }
    return { success: false, message: 'No active installation' };
  }
}

module.exports = new DependencyInstaller();