const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProjectRunner {
  constructor() {
    this.activeProcess = null;
    this.projectPath = null;
    this.serverUrl = null;
    this.onOutputCallback = null;
    this.onUrlDetectedCallback = null;
  }

  async startProject(projectPath, onOutput, onUrlDetected = null) {
    return new Promise((resolve) => {
      try {
        // Stop any existing process
        if (this.activeProcess) {
          this.stopProject();
        }

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
            message: 'No suitable start script found. Available scripts: ' + Object.keys(packageJson.scripts || {}).join(', ')
          });
        }

        this.onOutputCallback = onOutput;
        this.onUrlDetectedCallback = onUrlDetected;
        this.projectPath = projectPath;
        this.serverUrl = null;

        onOutput?.(`🚀 Starting project with: ${script.command}`);
        onOutput?.(`📁 Working directory: ${projectPath}`);
        
        // Determine package manager and command
        const { manager, command } = this.determinePackageManager(projectPath, script.name);
        
        this.activeProcess = spawn(manager, command, {
          cwd: projectPath,
          shell: true,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, FORCE_COLOR: '1' }
        });

        let hasStarted = false;
        let outputBuffer = '';

        // Handle stdout with line buffering
        this.activeProcess.stdout.on('data', (data) => {
          const text = data.toString();
          outputBuffer += text;
          
          // Process complete lines
          const lines = outputBuffer.split('\n');
          outputBuffer = lines.pop() || ''; // Keep incomplete line
          
          lines.forEach(line => {
            if (line.trim()) {
              onOutput?.(line);
              
              // Detect server start and URL
              if (!hasStarted && this.detectServerStart(line)) {
                hasStarted = true;
                const url = this.extractUrl(line);
                if (url) {
                  this.serverUrl = url;
                  onOutput?.('🌐 Server running at: ' + url);
                  onUrlDetected?.(url);
                }
                
                resolve({
                  success: true,
                  message: 'Project started successfully',
                  data: { 
                    url,
                    script: script.name,
                    pid: this.activeProcess.pid,
                    command: `${manager} ${command.join(' ')}`
                  }
                });
              }
            }
          });
        });

        // Handle stderr with line buffering
        this.activeProcess.stderr.on('data', (data) => {
          const text = data.toString();
          const lines = text.split('\n').filter(line => line.trim());
          
          lines.forEach(line => {
            onOutput?.(line);
            
            // Some servers output URL to stderr
            if (!hasStarted && this.detectServerStart(line)) {
              hasStarted = true;
              const url = this.extractUrl(line);
              if (url) {
                this.serverUrl = url;
                onOutput?.('🌐 Server running at: ' + url);
                onUrlDetected?.(url);
              }
              
              resolve({
                success: true,
                message: 'Project started successfully',
                data: { 
                  url,
                  script: script.name,
                  pid: this.activeProcess.pid,
                  command: `${manager} ${command.join(' ')}`
                }
              });
            }
          });
        });

        this.activeProcess.on('close', (code) => {
          this.activeProcess = null;
          this.serverUrl = null;
          onOutput?.(`🛑 Project stopped with exit code ${code}`);
          
          if (!hasStarted) {
            resolve({
              success: false,
              message: `Project failed to start (exit code ${code})`
            });
          }
        });

        this.activeProcess.on('error', (error) => {
          this.activeProcess = null;
          this.serverUrl = null;
          onOutput?.(`❌ Error: ${error.message}`);
          
          if (!hasStarted) {
            resolve({
              success: false,
              message: `Failed to start: ${error.message}`
            });
          }
        });

        // Timeout fallback (increased to 15 seconds)
        setTimeout(() => {
          if (!hasStarted && this.activeProcess) {
            hasStarted = true;
            resolve({
              success: true,
              message: 'Project started (server URL not detected)',
              data: { 
                script: script.name,
                pid: this.activeProcess.pid,
                command: `${manager} ${command.join(' ')}`
              }
            });
          }
        }, 15000);

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
      const pid = this.activeProcess.pid;
      
      try {
        // Kill the process tree synchronously on Windows
        const { execSync } = require('child_process');
        execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
        
        // Also kill by port if we have a server URL
        if (this.serverUrl) {
          const portMatch = this.serverUrl.match(/:([0-9]+)/);
          if (portMatch) {
            this.killProcessByPort(portMatch[1]);
          }
        }
        
        this.activeProcess = null;
        this.serverUrl = null;
        this.onOutputCallback?.('🛑 Project stopped');
        
        return {
          success: true,
          message: 'Project stopped successfully'
        };
      } catch (error) {
        // Fallback: try to kill directly
        try {
          this.activeProcess?.kill('SIGKILL');
          this.activeProcess = null;
          this.serverUrl = null;
          this.onOutputCallback?.('🛑 Project stopped (forced)');
          
          return {
            success: true,
            message: 'Project stopped (forced)'
          };
        } catch (killError) {
          return {
            success: false,
            message: `Failed to stop project: ${killError.message}`
          };
        }
      }
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
    
    // Priority order for start scripts (dev scripts first)
    const priorities = ['dev', 'start', 'serve', 'preview', 'develop'];
    
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

  determinePackageManager(projectPath, scriptName) {
    // Check for lock files to determine package manager
    const lockFiles = {
      'pnpm-lock.yaml': { manager: 'pnpm', command: ['run', scriptName] },
      'yarn.lock': { manager: 'yarn', command: [scriptName] },
      'package-lock.json': { manager: 'npm', command: ['run', scriptName] }
    };

    for (const [lockFile, config] of Object.entries(lockFiles)) {
      if (fs.existsSync(path.join(projectPath, lockFile))) {
        return config;
      }
    }

    // Default to npm
    return { manager: 'npm', command: ['run', scriptName] };
  }

  detectServerStart(output) {
    const indicators = [
      'Local:',
      'localhost:',
      'Server running',
      'Development server',
      'ready on',
      'started on',
      'running at',
      'available on',
      'listening on',
      'server started',
      'dev server running',
      'compiled successfully',
      'webpack compiled',
      'vite.*ready',
      'next.*ready',
      'react.*compiled'
    ];
    
    const lowerOutput = output.toLowerCase();
    return indicators.some(indicator => {
      if (indicator.includes('.*')) {
        // Handle regex patterns
        const regex = new RegExp(indicator, 'i');
        return regex.test(output);
      }
      return lowerOutput.includes(indicator.toLowerCase());
    });
  }

  extractUrl(output) {
    // Clean ANSI color codes first
    const cleanOutput = output.replace(/\u001b\[.*?m/g, '').trim();
    
    // Robust URL regex for localhost variants
    const urlRegex = /(https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):\d+\/?)/i;
    const matches = cleanOutput.match(urlRegex);
    
    if (matches) {
      return matches[1].replace(/\/$/, ''); // Remove trailing slash
    }
    
    // Fallback: extract port and construct URL
    const portRegex = /(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/i;
    const portMatch = cleanOutput.match(portRegex);
    
    if (portMatch) {
      return `http://localhost:${portMatch[1]}`;
    }
    
    return null;
  }

  killProcessByPort(port) {
    try {
      const { execSync } = require('child_process');
      // Find process using the port
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.split('\n');
      
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            execSync(`taskkill /pid ${pid} /F`, { stdio: 'ignore' });
            this.onOutputCallback?.(`🛑 Killed process ${pid} on port ${port}`);
          }
        }
      }
    } catch (error) {
      console.log('No process found on port', port);
    }
  }

  getStatus() {
    return {
      isRunning: !!this.activeProcess,
      pid: this.activeProcess?.pid,
      projectPath: this.projectPath,
      serverUrl: this.serverUrl
    };
  }
}

module.exports = new ProjectRunner();