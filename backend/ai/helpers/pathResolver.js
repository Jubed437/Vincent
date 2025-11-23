const path = require('path');
const fs = require('fs');

class PathResolver {
  /**
   * Resolve import path to actual file path
   */
  resolveImport(importSource, currentFile, projectRoot) {
    // Skip node_modules imports
    if (!importSource.startsWith('.')) {
      return null;
    }

    const currentDir = path.dirname(path.join(projectRoot, currentFile));
    let resolvedPath = path.resolve(currentDir, importSource);

    // Make relative to project root
    resolvedPath = path.relative(projectRoot, resolvedPath);

    // Try different extensions
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
    for (const ext of extensions) {
      const fullPath = path.join(projectRoot, resolvedPath + ext);
      if (fs.existsSync(fullPath)) {
        return resolvedPath + ext;
      }
    }

    // Try index files
    for (const ext of extensions) {
      const indexPath = path.join(projectRoot, resolvedPath, 'index' + ext);
      if (fs.existsSync(indexPath)) {
        return path.join(resolvedPath, 'index' + ext);
      }
    }

    return null;
  }

  /**
   * Check if path is external dependency
   */
  isExternalDependency(importSource) {
    return !importSource.startsWith('.') && !importSource.startsWith('/');
  }

  /**
   * Normalize path separators
   */
  normalizePath(filePath) {
    return filePath.replace(/\\/g, '/');
  }
}

module.exports = new PathResolver();