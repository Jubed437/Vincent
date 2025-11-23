const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProjectRunner {
  constructor() {
    this.activeProcess = null;
    this.projectPath = null;
  }

  async startProject(projectPath, onOutput) {
    return new Promise((resolve) => {
      try {
        const packageJson = this.readPackageJson(projectPath);
        if (!packageJson) {
          return resolve({
            success: false,
            message: 'No package.json found'
          });
        }

        const script = this.determineStartScript(packageJson);
        if (!script) {
          return resolve({
            success: false,
            message: 'No suitable start script found'
          });
        }

        onOutput?.(`🚀 Starting project with: ${script.command}`);
        
        this.projectPath = projectPath;
        this.activeProcess = spawn('npm', ['run', script.name], {
          cwd: projectPath,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let hasStarted = false;

        this.activeProcess.stdout.on('data', (data) => {
          const text = data.toString();
          onOutput?.(text);
          
          // Detect server start
          if (!hasStarted && this.detectServerStart(text)) {
            hasStarted = true;
            const url = this.extractUrl(text);
            resolve({
              success: true,
              message: 'Project started successfully',
              data: { 
                url,
                script: script.name,
                pid: this.activeProcess.pid
              }
            });
          }
        });

        this.activeProcess.stderr.on('data', (data) => {
          const text = data.toString();
          onOutput?.(text);
        });

        this.activeProcess.on('close', (code) => {
          this.activeProcess = null;
          onOutput?.(`🛑 Project stopped with code ${code}`);
          if (!hasStarted) {
            resolve({
              success: false,
              message: `Project failed to start (exit code ${code})`
            });
          }
        });

        this.activeProcess.on('error', (error) => {
          this.activeProcess = null;
          onOutput?.(`❌ Error: ${error.message}`);
          if (!hasStarted) {
            resolve({
              success: false,
              message: `Failed to start: ${error.message}`
            });
          }
        });

        // Timeout fallback
        setTimeout(() => {
          if (!hasStarted) {
            resolve({
              success: true,
              message: 'Project started (no URL detected)',
              data: { 
                script: script.name,
                pid: this.activeProcess?.pid
              }
            });
          }
        }, 10000);

      } catch (error) {
        resolve({
          success: false,
          message: `Failed to start project: ${error.message}`
        });
      }
    });
  }

  stopProject() {
    if (this.activeProcess) {
      this.activeProcess.kill('SIGTERM');
      this.activeProcess = null;
      return {
        success: true,
        message: 'Project stopped successfully'
      };
    }
    return {
      success: false,
      message: 'No running project'
    };
  }

  readPackageJson(projectPath) {
    try {
      const packagePath = path.join(projectPath, 'package.json');
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch {
      return null;
    }
  }

  determineStartScript(packageJson) {
    const scripts = packageJson.scripts || {};
    
    // Priority order for start scripts
    const priorities = ['dev', 'start', 'serve', 'build'];
    
    for (const scriptName of priorities) {
      if (scripts[scriptName]) {
        return {
          name: scriptName,
          command: scripts[scriptName]
        };
      }
    }
    
    return null;
  }

  detectServerStart(output) {
    const indicators = [
      'Local:',
      'localhost:',
      'Server running',
      'Development server',
      'ready on',
      'started on'
    ];
    
    return indicators.some(indicator => 
      output.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  extractUrl(output) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = output.match(urlRegex);
    if (matches) {
      return matches[0];
    }
    
    const localhostRegex = /localhost:(\d+)/;
    const portMatch = output.match(localhostRegex);
    if (portMatch) {
      return `http://localhost:${portMatch[1]}`;
    }
    
    return null;
  }

  getStatus() {
    return {
      isRunning: !!this.activeProcess,
      pid: this.activeProcess?.pid,
      projectPath: this.projectPath
    };
  }
}

module.exports = new ProjectRunner();