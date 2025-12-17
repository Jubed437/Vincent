const { ipcMain, dialog } = require('electron');
const fileScanner = require('./modules/fileScanner');
const techDetector = require('./modules/techDetector');
const dependencyInstaller = require('./modules/dependencyInstaller');
const projectRunner = require('./modules/projectRunner');
const terminalManager = require('./modules/terminalManager');
const aiAnalyzer = require('./modules/aiAnalyzer');
const aiAgentLLM = require('./modules/aiAgentLLM');
const editorManager = require('./modules/editorManager');
const codeLinter = require('./modules/codeLinter');
const vulnerabilityScanner = require('./modules/vulnerabilityScanner');
const codeSearch = require('./modules/codeSearch');

class VincentEngine {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.currentProject = null;
    
    try {
      this.setupIpcHandlers();
      this.setupTerminalListener();
      terminalManager.logInfo('Vincent Engine initialized successfully');
      console.log('Vincent Engine ready');
    } catch (error) {
      console.error('Failed to initialize Vincent Engine:', error);
      terminalManager.logError(`Engine initialization failed: ${error.message}`);
    }
  }

  setupIpcHandlers() {
    // Project Upload
    ipcMain.handle('select-project-folder', async () => {
      console.log('IPC: select-project-folder called');
      try {
        const result = await dialog.showOpenDialog(this.mainWindow, {
          properties: ['openDirectory'],
          title: 'Select Project Folder'
        });
        
        console.log('Dialog result:', result);
        
        if (!result.canceled && result.filePaths.length > 0) {
          console.log('Folder selected:', result.filePaths[0]);
          return { success: true, path: result.filePaths[0] };
        }
        
        console.log('No folder selected or dialog canceled');
        return { success: false, message: 'No folder selected' };
      } catch (error) {
        console.error('Error in select-project-folder:', error);
        return { success: false, message: error.message };
      }
    });

    // Load Project
    ipcMain.handle('load-project', async (event, projectPath) => {
      return await this.loadProject(projectPath);
    });

    // Project Analysis
    ipcMain.handle('analyze-project', async (event, projectPath) => {
      return await this.analyzeProject(projectPath);
    });

    // Tech Stack Detection (uses current project)
    ipcMain.handle('detect-tech-stack', async () => {
      if (!this.currentProject) {
        return { success: false, message: 'No project loaded' };
      }
      return await this.analyzeProject(this.currentProject.path);
    });

    // System Dependencies
    ipcMain.handle('check-system-dependencies', async () => {
      return await dependencyInstaller.checkSystemDependencies();
    });

    // Install Dependencies
    ipcMain.handle('install-dependencies', async (event, projectPath) => {
      // If no projectPath provided, use current project
      const targetPath = projectPath || this.currentProject?.path;
      if (!targetPath) {
        return { success: false, message: 'No project loaded' };
      }
      return await this.installProjectDependencies(targetPath);
    });

    // Project Control
    ipcMain.handle('start-project', async (event, projectPath) => {
      return await this.startProject(projectPath);
    });

    ipcMain.handle('stop-project', async () => {
      return terminalManager.stopProject();
    });

    ipcMain.handle('get-project-status', async () => {
      return projectRunner.getStatus();
    });

    // File Reading
    ipcMain.handle('read-file-content', async (event, filePath) => {
      return await this.readFileContent(filePath);
    });

    // Terminal
    ipcMain.handle('create-terminal', async (event, cwd) => {
      const workingDir = cwd || this.currentProject?.path || process.cwd();
      const result = terminalManager.createTerminal(workingDir);
      if (result.success) {
        this.setupTerminalDataListener(result.data.terminalId);
      }
      return result;
    });

    ipcMain.handle('terminal-input', async (event, command) => {
      const workingDir = this.currentProject?.path || process.cwd();
      return await terminalManager.executeCommand(command, workingDir);
    });

    ipcMain.handle('kill-terminal', async () => {
      // Kill all terminals (simplified)
      const terminals = Array.from(terminalManager.terminals.keys());
      terminals.forEach(terminalId => {
        terminalManager.killTerminal(terminalId);
      });
      return { success: true };
    });

    ipcMain.handle('get-terminal-history', async () => {
      return terminalManager.getHistory();
    });

    ipcMain.handle('clear-terminal', async () => {
      terminalManager.clear();
      return { success: true };
    });

    ipcMain.handle('resize-terminal', async (event, terminalId, cols, rows) => {
      return terminalManager.resizeTerminal(terminalId, cols, rows);
    });



    // AI Analysis
    ipcMain.handle('ai-analyze-structure', async (event, projectPath) => {
      return await aiAnalyzer.analyzeProjectStructure(projectPath);
    });

    ipcMain.handle('ai-find-bugs', async (event, projectPath) => {
      return await aiAnalyzer.findPotentialBugs(projectPath);
    });

    ipcMain.handle('ai-analyze-performance', async (event, projectPath) => {
      return await aiAnalyzer.analyzePerformance(projectPath);
    });

    ipcMain.handle('ai-security-audit', async (event, projectPath) => {
      return await aiAnalyzer.securityAudit(projectPath);
    });

    // LLM Semantic Analysis
    ipcMain.handle('ai-semantic-analysis', async (event, staticResult) => {
      return await aiAgentLLM.runSemanticAnalysis(staticResult);
    });

    // Editor Management
    ipcMain.handle('detect-editors', async () => {
      return await editorManager.detectEditors();
    });

    ipcMain.handle('get-editors', async () => {
      return editorManager.getEditors();
    });

    ipcMain.handle('open-editor', async (event, editorPath, projectPath) => {
      return await editorManager.openEditor(editorPath, projectPath);
    });

    // Enhanced project analysis with LLM
    ipcMain.handle('analyze-project-enhanced', async (event, projectPath) => {
      const staticResult = await this.analyzeProject(projectPath);
      if (staticResult.success && staticResult.data.staticAnalysis) {
        const llmResult = await aiAgentLLM.runSemanticAnalysis(staticResult.data.staticAnalysis);
        return {
          ...staticResult,
          data: {
            ...staticResult.data,
            semanticAnalysis: llmResult.data
          }
        };
      }
      return staticResult;
    });

    // Code Linting
    ipcMain.handle('lint-file', async (event, filePath) => {
      return await codeLinter.lintFile(filePath);
    });

    ipcMain.handle('lint-project', async (event, projectPath) => {
      return await codeLinter.lintProject(projectPath);
    });

    // Vulnerability Scanning
    ipcMain.handle('scan-vulnerabilities', async (event, projectPath) => {
      return await vulnerabilityScanner.scanDependencies(projectPath);
    });

    ipcMain.handle('scan-package-json', async (event, projectPath) => {
      return await vulnerabilityScanner.scanPackageJson(projectPath);
    });

    // Code Search
    ipcMain.handle('index-project', async (event, projectPath) => {
      return await codeSearch.indexProject(projectPath);
    });

    ipcMain.handle('search-code', async (event, query, options) => {
      return codeSearch.searchCode(query, options);
    });

    ipcMain.handle('search-files', async (event, filename) => {
      return codeSearch.searchFiles(filename);
    });

    ipcMain.handle('get-search-stats', async () => {
      return { success: true, data: codeSearch.getStats() };
    });

    // Terminal command execution
    ipcMain.handle('execute-terminal-command', async (event, command, cwd) => {
      const workingDir = cwd || this.currentProject?.path || process.cwd();
      return await terminalManager.executeCommand(command, workingDir);
    });
  }

  setupTerminalListener() {
    terminalManager.addListener((output) => {
      this.mainWindow.webContents.send('terminal-output', output);
    });
  }

  setupTerminalDataListener(terminalId) {
    console.log(`Setting up terminal data listener for: ${terminalId}`);
    const result = terminalManager.onTerminalData(terminalId, (data) => {
      console.log(`Terminal data received:`, data);
      this.mainWindow.webContents.send('terminal-data', {
        terminalId: terminalId,
        text: data.data || data.text,
        type: data.type || 'output',
        ...data
      });
    });
    return result;
  }

  async loadProject(projectPath) {
    try {
      terminalManager.logInfo(`Loading project: ${projectPath}`);
      
      const scanResult = fileScanner.scanProject(projectPath);
      if (!scanResult.success) {
        terminalManager.logError(scanResult.message);
        return scanResult;
      }

      this.currentProject = {
        path: projectPath,
        name: require('path').basename(projectPath),
        rootPath: scanResult.data.rootPath,
        structure: scanResult.data.structure
      };

      terminalManager.logSuccess('Project loaded successfully');
      
      // Auto-analyze the project
      const analysisResult = await this.analyzeProject(projectPath);
      
      return {
        success: true,
        message: 'Project loaded successfully',
        data: {
          structure: scanResult.data.structure,
          project: {
            path: projectPath,
            name: require('path').basename(projectPath),
            rootPath: scanResult.data.rootPath,
            structure: scanResult.data.structure
          },
          analysis: analysisResult.success ? analysisResult.data : null
        }
      };
    } catch (error) {
      const errorMsg = `Failed to load project: ${error.message}`;
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg,
        data: null
      };
    }
  }

  async analyzeProject(projectPath) {
    try {
      terminalManager.logInfo('🔍 Analyzing project structure and dependencies...');
      
      const scanResult = fileScanner.scanProject(projectPath);
      if (!scanResult.success) {
        return scanResult;
      }

      const techResult = techDetector.detectTechStack(
        projectPath, 
        scanResult.data.packageJson
      );
      
      if (!techResult.success) {
        return techResult;
      }

      // Prepare static analysis for LLM
      const staticAnalysis = {
        fileBreakdown: scanResult.data.fileBreakdown || {},
        dependencyGraph: scanResult.data.dependencies || {},
        techStack: techResult.data.techStack || [],
        scripts: scanResult.data.packageJson?.scripts || {},
        issues: [],
        projectSummary: {
          name: require('path').basename(projectPath),
          type: techResult.data.projectType,
          fileCount: scanResult.data.structure?.length || 0
        }
      };

      terminalManager.logSuccess(`Detected: ${techResult.data.projectType}`);
      terminalManager.logInfo(`Found ${techResult.data.techStack.length} technologies`);

      return {
        success: true,
        message: 'Project analysis completed',
        data: {
          ...scanResult.data,
          ...techResult.data,
          staticAnalysis
        }
      };
    } catch (error) {
      const errorMsg = `Analysis failed: ${error.message}`;
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  }

  async installProjectDependencies(projectPath) {
    try {
      terminalManager.logCommand('npm install');
      
      const result = await dependencyInstaller.installDependencies(
        projectPath,
        (output) => terminalManager.addOutput(output)
      );

      return result;
    } catch (error) {
      const errorMsg = `Installation failed: ${error.message}`;
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  }

  async startProject(projectPath) {
    try {
      console.log('=== START PROJECT CALLED ===');
      console.log('Project path:', projectPath);
      
      // Check if project path exists
      const fs = require('fs');
      if (!fs.existsSync(projectPath)) {
        console.log('Project path does not exist!');
        return { success: false, message: 'Project path does not exist' };
      }
      
      // Detect project type and determine start command
      const packageJsonPath = require('path').join(projectPath, 'package.json');
      let startCommand = 'npm start';
      
      console.log('Looking for package.json at:', packageJsonPath);
      
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        console.log('Package.json found, scripts:', packageJson.scripts);
        
        if (packageJson.scripts) {
          if (packageJson.scripts.dev) {
            startCommand = 'npm run dev';
          } else if (packageJson.scripts.start) {
            startCommand = 'npm start';
          } else if (packageJson.scripts.serve) {
            startCommand = 'npm run serve';
          }
        }
      } catch (error) {
        console.log('Could not read package.json:', error.message);
        terminalManager.logWarning('No package.json found, using default start command');
      }

      console.log('Final start command:', startCommand);
      
      // Use terminal manager to execute the start command
      const result = await terminalManager.executeCommand(startCommand, projectPath);
      console.log('Terminal manager result:', result);
      
      if (result.success) {
        terminalManager.logSuccess(`Project started with: ${startCommand}`);
        
        // Try to detect server URL from output
        let serverURL = null;
        if (result.output) {
          const urlMatch = result.output.match(/https?:\/\/localhost:\d+/i);
          if (urlMatch) {
            serverURL = urlMatch[0];
            terminalManager.logInfo(`Server detected at: ${serverURL}`);
          }
        }
        
        return {
          success: true,
          message: 'Project started successfully',
          data: {
            command: startCommand,
            url: serverURL
          },
          output: result.output
        };
      } else {
        console.log('Terminal manager failed:', result.message);
        return result;
      }
    } catch (error) {
      const errorMsg = `Failed to start project: ${error.message}`;
      console.log('Start project error:', errorMsg);
      terminalManager.logError(errorMsg);
      return {
        success: false,
        message: errorMsg
      };
    }
  }

  async readFileContent(filePath) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      // Validate file path exists
      const stats = await fs.stat(filePath);
      
      if (!stats.isFile()) {
        return {
          success: false,
          message: 'Path is not a file'
        };
      }

      // Read file with UTF-8 encoding
      const content = await fs.readFile(filePath, 'utf8');
      
      return {
        success: true,
        data: {
          content: content,
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          encoding: 'utf8'
        }
      };
    } catch (error) {
      // Handle specific error cases
      if (error.code === 'ENOENT') {
        return {
          success: false,
          message: 'File not found'
        };
      } else if (error.code === 'EACCES') {
        return {
          success: false,
          message: 'Permission denied'
        };
      } else if (error.message.includes('invalid') || error.message.includes('decode')) {
        // Binary file or encoding issue
        return {
          success: false,
          message: 'Unable to read file - may be a binary file',
          isBinary: true
        };
      } else {
        return {
          success: false,
          message: `Failed to read file: ${error.message}`
        };
      }
    }
  }

  getCurrentProject() {
    return this.currentProject;
  }
}

module.exports = VincentEngine;