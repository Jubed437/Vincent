const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

class CodeSearch {
  constructor() {
    this.projectFiles = [];
    this.searchIndex = null;
  }

  async indexProject(projectPath) {
    try {
      this.projectFiles = [];
      await this.scanDirectory(projectPath, projectPath);
      
      // Create search index
      const fuseOptions = {
        keys: ['content', 'filename', 'path'],
        threshold: 0.3,
        includeScore: true,
        includeMatches: true
      };
      
      this.searchIndex = new Fuse(this.projectFiles, fuseOptions);
      
      return {
        success: true,
        data: {
          filesIndexed: this.projectFiles.length,
          message: `Indexed ${this.projectFiles.length} files`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Indexing failed: ${error.message}`
      };
    }
  }

  async scanDirectory(dirPath, rootPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
          await this.scanDirectory(fullPath, rootPath);
        } else if (this.isSearchableFile(item) && stat.size < 1024 * 1024) { // Skip files > 1MB
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const relativePath = path.relative(rootPath, fullPath);
            
            this.projectFiles.push({
              filename: item,
              path: relativePath,
              fullPath: fullPath,
              content: content,
              size: stat.size,
              extension: path.extname(item)
            });
          } catch (readError) {
            // Skip files we can't read
          }
        }
      }
    } catch (error) {
      // Skip directories we can't access
    }
  }

  searchCode(query, options = {}) {
    if (!this.searchIndex || !query.trim()) {
      return {
        success: false,
        message: 'No search index or empty query'
      };
    }

    try {
      const results = this.searchIndex.search(query);
      const maxResults = options.limit || 50;
      
      const searchResults = results.slice(0, maxResults).map(result => {
        const file = result.item;
        const matches = this.findLineMatches(file.content, query);
        
        return {
          filename: file.filename,
          path: file.path,
          fullPath: file.fullPath,
          score: result.score,
          matches: matches.slice(0, 5), // Limit to 5 matches per file
          extension: file.extension
        };
      });
      
      return {
        success: true,
        data: {
          query,
          results: searchResults,
          totalResults: results.length,
          resultCount: searchResults.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Search failed: ${error.message}`
      };
    }
  }

  findLineMatches(content, query) {
    const lines = content.split('\n');
    const matches = [];
    const queryLower = query.toLowerCase();
    
    lines.forEach((line, index) => {
      const lineLower = line.toLowerCase();
      if (lineLower.includes(queryLower)) {
        const startIndex = Math.max(0, lineLower.indexOf(queryLower) - 20);
        const endIndex = Math.min(line.length, startIndex + query.length + 40);
        
        matches.push({
          lineNumber: index + 1,
          line: line.trim(),
          preview: line.substring(startIndex, endIndex),
          column: lineLower.indexOf(queryLower) + 1
        });
      }
    });
    
    return matches;
  }

  searchFiles(filename) {
    if (!filename.trim()) {
      return { success: false, message: 'Empty filename query' };
    }

    try {
      const results = this.projectFiles.filter(file => 
        file.filename.toLowerCase().includes(filename.toLowerCase()) ||
        file.path.toLowerCase().includes(filename.toLowerCase())
      );
      
      return {
        success: true,
        data: {
          query: filename,
          results: results.slice(0, 20).map(file => ({
            filename: file.filename,
            path: file.path,
            fullPath: file.fullPath,
            size: file.size,
            extension: file.extension
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `File search failed: ${error.message}`
      };
    }
  }

  shouldSkipDirectory(dirname) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.vscode'];
    return skipDirs.includes(dirname);
  }

  isSearchableFile(filename) {
    const searchableExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', 
      '.md', '.txt', '.yml', '.yaml', '.xml', '.svg', '.vue', '.py', 
      '.java', '.c', '.cpp', '.h', '.php', '.rb', '.go', '.rs'
    ];
    return searchableExtensions.some(ext => filename.endsWith(ext));
  }

  getStats() {
    return {
      filesIndexed: this.projectFiles.length,
      totalSize: this.projectFiles.reduce((sum, file) => sum + file.size, 0),
      extensions: [...new Set(this.projectFiles.map(f => f.extension))]
    };
  }
}

module.exports = new CodeSearch();