const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class StaticParser {
  constructor() {
    this.ignoredDirs = ['node_modules', '.git', 'build', 'dist', '.next', 'coverage'];
    this.jsExtensions = ['.js', '.jsx', '.ts', '.tsx'];
  }

  /**
   * Main entry point - analyzes entire project
   */
  analyzeProject(projectPath) {
    try {
      const packageJson = this.readPackageJson(projectPath);
      const files = this.scanDirectory(projectPath);
      const fileBreakdown = this.analyzeFiles(files);
      
      const analysis = {
        projectPath,
        projectTypeSummary: this.determineProjectType(fileBreakdown, packageJson),
        detectedTechStack: this.detectTechStack(fileBreakdown, packageJson),
        fileBreakdown,
        recommendedCommands: this.generateCommands(packageJson, fileBreakdown)
      };

      return analysis;
    } catch (error) {
      throw new Error(`Project analysis failed: ${error.message}`);
    }
  }

  /**
   * Recursively scan directory for JS/TS files
   */
  scanDirectory(dirPath, relativePath = '') {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (this.ignoredDirs.includes(entry.name)) continue;
        
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          files.push(...this.scanDirectory(fullPath, relPath));
        } else if (this.jsExtensions.includes(path.extname(entry.name))) {
          files.push({
            name: entry.name,
            path: fullPath,
            relativePath: relPath,
            extension: path.extname(entry.name)
          });
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }

  /**
   * Analyze all JavaScript files
   */
  analyzeFiles(files) {
    const breakdown = {};
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const analysis = this.analyzeFile(content, file);
        breakdown[file.relativePath] = analysis;
      } catch (error) {
        // Skip files we can't parse
        breakdown[file.relativePath] = {
          type: 'unparseable',
          error: error.message,
          imports: [],
          exports: []
        };
      }
    }
    
    return breakdown;
  }

  /**
   * Analyze single JavaScript file using Babel AST
   */
  analyzeFile(content, fileInfo) {
    const analysis = {
      type: 'unknown',
      summary: '',
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      routes: [],
      schemas: [],
      components: []
    };

    try {
      const ast = parse(content, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        plugins: ['jsx', 'typescript', 'decorators-legacy']
      });

      traverse(ast, {
        // Import declarations
        ImportDeclaration: (nodePath) => {
          analysis.imports.push({
            source: nodePath.node.source.value,
            specifiers: nodePath.node.specifiers.map(spec => ({
              type: spec.type,
              name: spec.local.name,
              imported: spec.imported?.name
            }))
          });
        },

        // Export declarations
        ExportNamedDeclaration: (nodePath) => {
          if (nodePath.node.declaration) {
            const decl = nodePath.node.declaration;
            if (decl.type === 'FunctionDeclaration') {
              analysis.exports.push({ type: 'function', name: decl.id.name });
            } else if (decl.type === 'VariableDeclaration') {
              decl.declarations.forEach(d => {
                analysis.exports.push({ type: 'variable', name: d.id.name });
              });
            }
          }
        },

        // Function declarations
        FunctionDeclaration: (nodePath) => {
          analysis.functions.push(nodePath.node.id.name);
        },

        // Class declarations
        ClassDeclaration: (nodePath) => {
          analysis.classes.push(nodePath.node.id.name);
        },

        // Express routes (app.get, app.post, etc.)
        CallExpression: (nodePath) => {
          const { callee, arguments: args } = nodePath.node;
          
          if (callee.type === 'MemberExpression' && 
              callee.object.name === 'app' &&
              ['get', 'post', 'put', 'delete', 'patch'].includes(callee.property.name)) {
            
            const route = args[0]?.value || 'unknown';
            analysis.routes.push({
              method: callee.property.name.toUpperCase(),
              path: route
            });
          }

          // Mongoose Schema detection
          if (callee.type === 'MemberExpression' &&
              callee.object.name === 'mongoose' &&
              callee.property.name === 'Schema') {
            analysis.schemas.push({ type: 'mongoose' });
          }
        },

        // React components (function components)
        VariableDeclarator: (nodePath) => {
          const { id, init } = nodePath.node;
          if (init && init.type === 'ArrowFunctionExpression' && 
              this.isReactComponent(id.name)) {
            analysis.components.push(id.name);
          }
        }
      });

      // Determine file type and generate summary
      analysis.type = this.determineFileType(analysis, fileInfo);
      analysis.summary = this.generateFileSummary(analysis, fileInfo);

    } catch (parseError) {
      analysis.type = 'parse-error';
      analysis.summary = `Failed to parse: ${parseError.message}`;
    }

    return analysis;
  }

  /**
   * Determine file type based on analysis
   */
  determineFileType(analysis, fileInfo) {
    if (analysis.routes.length > 0) return 'express-server';
    if (analysis.schemas.length > 0) return 'mongoose-model';
    if (analysis.components.length > 0) return 'react-component';
    if (fileInfo.name === 'package.json') return 'package-config';
    if (fileInfo.name.includes('config')) return 'config';
    if (fileInfo.name.includes('test') || fileInfo.name.includes('spec')) return 'test';
    if (analysis.functions.length > 0 || analysis.classes.length > 0) return 'module';
    return 'unknown';
  }

  /**
   * Generate human-readable file summary
   */
  generateFileSummary(analysis, fileInfo) {
    const { type, functions, classes, routes, components, imports } = analysis;
    
    switch (type) {
      case 'express-server':
        return `Express server with ${routes.length} routes, imports ${imports.length} modules`;
      case 'react-component':
        return `React component file with ${components.length} components`;
      case 'mongoose-model':
        return `Mongoose model file with ${analysis.schemas.length} schemas`;
      case 'module':
        return `JavaScript module with ${functions.length} functions, ${classes.length} classes`;
      default:
        return `${type} file with ${imports.length} imports`;
    }
  }

  /**
   * Determine overall project type
   */
  determineProjectType(fileBreakdown, packageJson) {
    const hasExpress = Object.values(fileBreakdown).some(f => f.type === 'express-server');
    const hasReact = Object.values(fileBreakdown).some(f => f.type === 'react-component');
    const hasMongoose = Object.values(fileBreakdown).some(f => f.type === 'mongoose-model');
    const hasNext = packageJson?.dependencies?.next || packageJson?.devDependencies?.next;

    if (hasNext) return 'Next.js Fullstack Application';
    if (hasExpress && hasReact && hasMongoose) return 'MERN Stack Application';
    if (hasExpress && hasMongoose) return 'Express + MongoDB Backend';
    if (hasReact) return 'React Frontend Application';
    if (hasExpress) return 'Express.js Backend';
    return 'JavaScript Project';
  }

  /**
   * Detect technology stack
   */
  detectTechStack(fileBreakdown, packageJson) {
    const stack = [];
    const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies };

    // Framework detection
    if (deps?.react) stack.push({ name: 'React', version: deps.react, category: 'Frontend' });
    if (deps?.next) stack.push({ name: 'Next.js', version: deps.next, category: 'Fullstack' });
    if (deps?.express) stack.push({ name: 'Express', version: deps.express, category: 'Backend' });
    if (deps?.mongoose) stack.push({ name: 'Mongoose', version: deps.mongoose, category: 'Database' });

    // Build tools
    if (deps?.vite) stack.push({ name: 'Vite', version: deps.vite, category: 'Build' });
    if (deps?.webpack) stack.push({ name: 'Webpack', version: deps.webpack, category: 'Build' });

    // Testing
    if (deps?.jest) stack.push({ name: 'Jest', version: deps.jest, category: 'Testing' });

    return stack;
  }

  /**
   * Generate recommended commands
   */
  generateCommands(packageJson, fileBreakdown) {
    const commands = [];
    const scripts = packageJson?.scripts || {};

    if (scripts.dev) commands.push({ command: 'npm run dev', description: 'Start development server' });
    if (scripts.start) commands.push({ command: 'npm start', description: 'Start production server' });
    if (scripts.build) commands.push({ command: 'npm run build', description: 'Build for production' });
    if (scripts.test) commands.push({ command: 'npm test', description: 'Run tests' });

    // Default fallbacks
    if (commands.length === 0) {
      commands.push({ command: 'npm install', description: 'Install dependencies' });
    }

    return commands;
  }

  /**
   * Helper methods
   */
  readPackageJson(projectPath) {
    try {
      const packagePath = path.join(projectPath, 'package.json');
      return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    } catch {
      return null;
    }
  }

  isReactComponent(name) {
    return /^[A-Z]/.test(name); // React components start with uppercase
  }
}

module.exports = new StaticParser();