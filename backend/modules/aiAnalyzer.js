const fs = require('fs');
const path = require('path');

class AIAnalyzer {
  async analyzeProjectStructure(projectPath) {
    try {
      const analysis = {
        issues: [],
        suggestions: [],
        score: 0
      };

      // Check for common project structure patterns
      const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
      const hasReadme = fs.existsSync(path.join(projectPath, 'README.md'));
      const hasSrcFolder = fs.existsSync(path.join(projectPath, 'src'));
      const hasGitignore = fs.existsSync(path.join(projectPath, '.gitignore'));

      if (!hasPackageJson) {
        analysis.issues.push('Missing package.json file');
      } else {
        analysis.score += 25;
      }

      if (!hasReadme) {
        analysis.suggestions.push('Add README.md for project documentation');
      } else {
        analysis.score += 15;
      }

      if (!hasSrcFolder) {
        analysis.suggestions.push('Consider organizing code in a src/ folder');
      } else {
        analysis.score += 20;
      }

      if (!hasGitignore) {
        analysis.suggestions.push('Add .gitignore to exclude unnecessary files');
      } else {
        analysis.score += 10;
      }

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async findPotentialBugs(projectPath) {
    try {
      const bugs = [];
      
      // Simple static analysis - look for common patterns
      const jsFiles = this.findJSFiles(projectPath);
      
      for (const filePath of jsFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for console.log statements
        if (content.includes('console.log')) {
          bugs.push({
            file: path.relative(projectPath, filePath),
            line: this.findLineNumber(content, 'console.log'),
            issue: 'Console.log statement found',
            severity: 'low'
          });
        }

        // Check for == instead of ===
        if (content.includes(' == ') && !content.includes(' === ')) {
          bugs.push({
            file: path.relative(projectPath, filePath),
            line: this.findLineNumber(content, ' == '),
            issue: 'Use === instead of == for comparison',
            severity: 'medium'
          });
        }

        // Check for var usage
        if (content.includes('var ')) {
          bugs.push({
            file: path.relative(projectPath, filePath),
            line: this.findLineNumber(content, 'var '),
            issue: 'Consider using let/const instead of var',
            severity: 'low'
          });
        }
      }

      return {
        success: true,
        data: { bugs, totalFiles: jsFiles.length }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async analyzePerformance(projectPath) {
    try {
      const suggestions = [];
      
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Check for heavy dependencies
        const heavyDeps = ['lodash', 'moment', 'jquery'];
        heavyDeps.forEach(dep => {
          if (deps[dep]) {
            suggestions.push({
              type: 'dependency',
              issue: `${dep} is a heavy dependency`,
              suggestion: `Consider lighter alternatives for ${dep}`,
              impact: 'medium'
            });
          }
        });

        // Check bundle size
        if (Object.keys(deps).length > 50) {
          suggestions.push({
            type: 'bundle',
            issue: 'Large number of dependencies',
            suggestion: 'Review and remove unused dependencies',
            impact: 'high'
          });
        }
      }

      return {
        success: true,
        data: { suggestions }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async securityAudit(projectPath) {
    try {
      const issues = [];
      
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Check for known vulnerable packages (simplified)
        const vulnerablePackages = ['node-uuid', 'request'];
        vulnerablePackages.forEach(pkg => {
          if (deps[pkg]) {
            issues.push({
              package: pkg,
              severity: 'high',
              issue: 'Package has known vulnerabilities',
              fix: `Update or replace ${pkg}`
            });
          }
        });
      }

      // Check for exposed secrets in files
      const jsFiles = this.findJSFiles(projectPath);
      for (const filePath of jsFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('password') || content.includes('secret') || content.includes('api_key')) {
          issues.push({
            file: path.relative(projectPath, filePath),
            severity: 'medium',
            issue: 'Potential hardcoded secrets',
            fix: 'Use environment variables for sensitive data'
          });
        }
      }

      return {
        success: true,
        data: { issues, riskLevel: issues.length > 0 ? 'medium' : 'low' }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  findJSFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.findJSFiles(fullPath, files);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  findLineNumber(content, searchString) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i + 1;
      }
    }
    return 1;
  }
}

module.exports = new AIAnalyzer();