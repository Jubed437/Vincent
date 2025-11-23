const fs = require('fs');
const path = require('path');

class IssueDetector {
  /**
   * Detect various project issues
   */
  detectIssues(fileBreakdown, packageJson, projectPath, dependencyGraph) {
    const issues = [];

    // Check for missing dependencies
    issues.push(...this.checkMissingDependencies(fileBreakdown, packageJson));
    
    // Check for missing scripts
    issues.push(...this.checkMissingScripts(packageJson));
    
    // Check for circular dependencies
    issues.push(...this.checkCircularDependencies(dependencyGraph));
    
    // Check for project structure issues
    issues.push(...this.checkProjectStructure(fileBreakdown, projectPath));
    
    // Check for common anti-patterns
    issues.push(...this.checkAntiPatterns(fileBreakdown));

    return issues;
  }

  /**
   * Check for imported packages not in package.json
   */
  checkMissingDependencies(fileBreakdown, packageJson) {
    const issues = [];
    const installedDeps = new Set([
      ...Object.keys(packageJson?.dependencies || {}),
      ...Object.keys(packageJson?.devDependencies || {})
    ]);

    const externalImports = new Set();
    
    Object.entries(fileBreakdown).forEach(([filePath, analysis]) => {
      if (analysis.imports) {
        analysis.imports.forEach(imp => {
          // Extract package name from import
          const packageName = this.extractPackageName(imp.source);
          if (packageName && !packageName.startsWith('.')) {
            externalImports.add(packageName);
          }
        });
      }
    });

    externalImports.forEach(pkg => {
      if (!installedDeps.has(pkg)) {
        issues.push({
          type: 'missing-dependency',
          severity: 'high',
          file: 'package.json',
          issue: `Package '${pkg}' is imported but not listed in dependencies`,
          fix: `Run: npm install ${pkg}`
        });
      }
    });

    return issues;
  }

  /**
   * Check for missing essential scripts
   */
  checkMissingScripts(packageJson) {
    const issues = [];
    const scripts = packageJson?.scripts || {};
    
    if (!scripts.start && !scripts.dev) {
      issues.push({
        type: 'missing-script',
        severity: 'medium',
        file: 'package.json',
        issue: 'No start or dev script found',
        fix: 'Add "start" or "dev" script to package.json'
      });
    }

    if (!scripts.test) {
      issues.push({
        type: 'missing-script',
        severity: 'low',
        file: 'package.json',
        issue: 'No test script found',
        fix: 'Add "test" script to package.json'
      });
    }

    return issues;
  }

  /**
   * Check for circular dependencies
   */
  checkCircularDependencies(dependencyGraph) {
    const issues = [];
    
    if (dependencyGraph.patterns?.circularDependencies) {
      dependencyGraph.patterns.circularDependencies.forEach(cycle => {
        if (cycle.files.length > 1) {
          issues.push({
            type: 'circular-dependency',
            severity: 'high',
            file: cycle.files[0],
            issue: `Circular dependency detected: ${cycle.files.join(' → ')}`,
            fix: 'Refactor to remove circular dependency'
          });
        }
      });
    }

    return issues;
  }

  /**
   * Check project structure issues
   */
  checkProjectStructure(fileBreakdown, projectPath) {
    const issues = [];
    const files = Object.keys(fileBreakdown);
    
    // Check for missing entry point
    const hasEntryPoint = files.some(f => 
      ['index.js', 'app.js', 'server.js', 'main.js'].includes(path.basename(f))
    );
    
    if (!hasEntryPoint) {
      issues.push({
        type: 'missing-entry-point',
        severity: 'medium',
        file: 'project-root',
        issue: 'No clear entry point found (index.js, app.js, server.js)',
        fix: 'Create a main entry point file'
      });
    }

    // Check for empty important directories
    const srcFiles = files.filter(f => f.startsWith('src/'));
    if (srcFiles.length === 0 && files.length > 5) {
      issues.push({
        type: 'no-src-directory',
        severity: 'low',
        file: 'project-root',
        issue: 'No src/ directory found for larger project',
        fix: 'Consider organizing code in src/ directory'
      });
    }

    return issues;
  }

  /**
   * Check for common anti-patterns
   */
  checkAntiPatterns(fileBreakdown) {
    const issues = [];

    Object.entries(fileBreakdown).forEach(([filePath, analysis]) => {
      // Check for files with too many imports
      if (analysis.imports && analysis.imports.length > 20) {
        issues.push({
          type: 'too-many-imports',
          severity: 'medium',
          file: filePath,
          issue: `File has ${analysis.imports.length} imports (consider refactoring)`,
          fix: 'Break down into smaller modules'
        });
      }

      // Check for Express routes in wrong files
      if (analysis.routes && analysis.routes.length > 0 && 
          !filePath.includes('route') && !filePath.includes('server')) {
        issues.push({
          type: 'misplaced-routes',
          severity: 'low',
          file: filePath,
          issue: 'Express routes found outside route files',
          fix: 'Move routes to dedicated route files'
        });
      }

      // Check for Mongoose models without proper export
      if (analysis.schemas && analysis.schemas.length > 0 && 
          analysis.exports.length === 0) {
        issues.push({
          type: 'unexported-model',
          severity: 'high',
          file: filePath,
          issue: 'Mongoose schema defined but not exported',
          fix: 'Export the model: module.exports = mongoose.model(...)'
        });
      }
    });

    return issues;
  }

  /**
   * Extract package name from import source
   */
  extractPackageName(source) {
    if (source.startsWith('.') || source.startsWith('/')) {
      return null; // Local import
    }
    
    // Handle scoped packages (@scope/package)
    if (source.startsWith('@')) {
      const parts = source.split('/');
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : source;
    }
    
    // Handle regular packages
    return source.split('/')[0];
  }

  /**
   * Categorize issues by severity
   */
  categorizeIssues(issues) {
    return {
      critical: issues.filter(i => i.severity === 'critical'),
      high: issues.filter(i => i.severity === 'high'),
      medium: issues.filter(i => i.severity === 'medium'),
      low: issues.filter(i => i.severity === 'low')
    };
  }
}

module.exports = new IssueDetector();