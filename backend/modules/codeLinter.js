const { ESLint } = require('eslint');
const fs = require('fs');
const path = require('path');

class CodeLinter {
  constructor() {
    this.eslint = null;
    this.initializeESLint();
  }

  async initializeESLint() {
    try {
      this.eslint = new ESLint({
        baseConfig: {
          env: {
            browser: true,
            es2021: true,
            node: true
          },
          extends: ['eslint:recommended'],
          parserOptions: {
            ecmaVersion: 12,
            sourceType: 'module'
          },
          rules: {
            'no-unused-vars': 'warn',
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-alert': 'error',
            'eqeqeq': 'error',
            'curly': 'error'
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize ESLint:', error);
    }
  }

  async lintFile(filePath) {
    if (!this.eslint) {
      return { success: false, message: 'ESLint not initialized' };
    }

    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const results = await this.eslint.lintText(code, { filePath });
      
      const issues = results[0]?.messages || [];
      
      return {
        success: true,
        data: {
          filePath,
          issues: issues.map(issue => ({
            line: issue.line,
            column: issue.column,
            message: issue.message,
            severity: issue.severity === 2 ? 'error' : 'warning',
            rule: issue.ruleId
          })),
          errorCount: results[0]?.errorCount || 0,
          warningCount: results[0]?.warningCount || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Linting failed: ${error.message}`
      };
    }
  }

  async lintProject(projectPath) {
    if (!this.eslint) {
      return { success: false, message: 'ESLint not initialized' };
    }

    try {
      const jsFiles = this.findJSFiles(projectPath);
      const results = [];
      
      for (const file of jsFiles.slice(0, 20)) { // Limit to 20 files
        const result = await this.lintFile(file);
        if (result.success && result.data.issues.length > 0) {
          results.push(result.data);
        }
      }
      
      const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
      const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
      
      return {
        success: true,
        data: {
          files: results,
          summary: {
            filesLinted: jsFiles.length,
            totalErrors,
            totalWarnings,
            totalIssues: totalErrors + totalWarnings
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Project linting failed: ${error.message}`
      };
    }
  }

  findJSFiles(dir, files = []) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
          this.findJSFiles(fullPath, files);
        } else if (this.isJSFile(item)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }

  shouldSkipDirectory(dirname) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    return skipDirs.includes(dirname);
  }

  isJSFile(filename) {
    const jsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
    return jsExtensions.some(ext => filename.endsWith(ext));
  }
}

module.exports = new CodeLinter();