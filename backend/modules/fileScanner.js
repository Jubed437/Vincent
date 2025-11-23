const fs = require('fs');
const path = require('path');

class FileScanner {
  scanProject(projectPath) {
    try {
      console.log('FileScanner: scanning', projectPath);
      const files = this.scanDirectory(projectPath);
      const tree = this.buildTree(files);
      const packageJson = this.readPackageJson(projectPath);
      
      const result = {
        success: true,
        data: {
          files,
          tree,
          packageJson,
          rootPath: projectPath,
          projectName: path.basename(projectPath),
          projectPath: projectPath,
          metadata: {
            totalFiles: this.countFiles(files),
            totalFolders: this.countFolders(tree),
            lastScanned: new Date().toISOString(),
            entryFile: this.findEntryFile(packageJson),
            buildTool: this.detectBuildTool(projectPath, packageJson)
          }
        }
      };
      
      console.log('FileScanner: result', { fileCount: result.data.files.length });
      return result;
    } catch (error) {
      console.error('FileScanner: error', error);
      return {
        success: false,
        message: `Failed to scan project: ${error.message}`
      };
    }
  }

  scanDirectory(dirPath, depth = 0, maxDepth = 4) {
    if (depth > maxDepth) return [];
    
    const items = [];
    const ignoredDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    const allowedExts = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', '.md'];
    
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.env') continue;
        if (ignoredDirs.includes(entry.name)) continue;
        
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(dirPath, fullPath);
        
        const item = {
          id: `${Date.now()}-${Math.random()}`,
          name: entry.name,
          path: fullPath, // This is already absolute
          absolutePath: fullPath, // Explicit absolute path
          relativePath,
          type: entry.isDirectory() ? 'folder' : 'file'
        };
        
        if (entry.isDirectory()) {
          item.children = this.scanDirectory(fullPath, depth + 1, maxDepth);
          if (item.children.length > 0) {
            items.push(item);
          }
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (allowedExts.includes(ext) || entry.name === 'package.json') {
            item.size = this.getFileSize(fullPath);
            item.extension = ext;
            items.push(item);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
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

  buildTree(files) {
    // Convert flat file list to tree structure for UI
    const tree = [];
    const pathMap = new Map();
    
    files.forEach(file => {
      const parts = file.relativePath.split(path.sep);
      let currentLevel = tree;
      let currentPath = '';
      
      parts.forEach((part, index) => {
        currentPath = currentPath ? path.join(currentPath, part) : part;
        
        if (!pathMap.has(currentPath)) {
          const isLast = index === parts.length - 1;
          const node = {
            id: file.id,
            name: part,
            path: file.path, // Absolute path
            absolutePath: file.path, // Explicit absolute path
            type: isLast ? file.type : 'folder',
            children: isLast ? undefined : []
          };
          
          if (isLast && file.type === 'file') {
            node.size = file.size;
            node.extension = file.extension;
          }
          
          pathMap.set(currentPath, node);
          currentLevel.push(node);
          currentLevel = node.children || [];
        } else {
          currentLevel = pathMap.get(currentPath).children || [];
        }
      });
    });
    
    return tree;
  }

  countFiles(files) {
    return files.filter(f => f.type === 'file').length;
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

  countFolders(tree) {
    let count = 0;
    const traverse = (items) => {
      items.forEach(item => {
        if (item.type === 'folder') {
          count++;
          if (item.children) traverse(item.children);
        }
      });
    };
    traverse(tree);
    return count;
  }

  findEntryFile(packageJson) {
    if (packageJson?.main) return packageJson.main;
    if (fs.existsSync(path.join(process.cwd(), 'index.js'))) return 'index.js';
    if (fs.existsSync(path.join(process.cwd(), 'src/index.js'))) return 'src/index.js';
    return null;
  }

  detectBuildTool(projectPath, packageJson) {
    if (fs.existsSync(path.join(projectPath, 'vite.config.js'))) return 'Vite';
    if (fs.existsSync(path.join(projectPath, 'webpack.config.js'))) return 'Webpack';
    if (packageJson?.scripts?.build) return 'npm';
    return null;
  }
}

module.exports = new FileScanner();