const fs = require('fs');
const path = require('path');

class FileScanner {
  scanProject(projectPath) {
    try {
      const structure = this.scanDirectory(projectPath);
      const packageJson = this.readPackageJson(projectPath);
      
      return {
        success: true,
        data: {
          structure,
          packageJson,
          rootPath: projectPath
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to scan project: ${error.message}`
      };
    }
  }

  scanDirectory(dirPath, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return null;
    
    const items = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      
      const fullPath = path.join(dirPath, entry.name);
      const item = {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'folder' : 'file'
      };
      
      if (entry.isDirectory()) {
        item.children = this.scanDirectory(fullPath, depth + 1, maxDepth);
      } else {
        item.size = this.getFileSize(fullPath);
      }
      
      items.push(item);
    }
    
    return items;
  }

  readPackageJson(projectPath) {
    try {
      const packagePath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const bytes = stats.size;
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    } catch {
      return '0B';
    }
  }
}

module.exports = new FileScanner();