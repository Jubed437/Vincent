import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, File, Code, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import electronAPI from '../../utils/electronAPI';

const CodeSearchPanel = () => {
  const { project, setSelectedFile } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState('code'); // 'code' or 'files'
  const [isIndexed, setIsIndexed] = useState(false);

  useEffect(() => {
    if (project?.path) {
      indexProject();
    }
  }, [project]);

  const indexProject = async () => {
    if (!project?.path) return;
    
    try {
      const result = await electronAPI.indexProject(project.path);
      if (result.success) {
        setIsIndexed(true);
      }
    } catch (error) {
      console.error('Indexing failed:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !isIndexed) return;
    
    setIsSearching(true);
    try {
      const result = searchType === 'code' 
        ? await electronAPI.searchCode(searchQuery)
        : await electronAPI.searchFiles(searchQuery);
        
      if (result.success) {
        setSearchResults(result.data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openFile = (result) => {
    setSelectedFile({
      name: result.filename,
      path: result.fullPath,
      type: 'file'
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['js', 'jsx', 'ts', 'tsx'].includes(ext) ? Code : File;
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <h3 className="text-vscode-text font-medium">Code Search</h3>

      {/* Search Input */}
      <Card>
        <div className="space-y-3">
          {/* Search Type Toggle */}
          <div className="flex gap-1 bg-vscode-hover rounded p-1">
            <button
              onClick={() => setSearchType('code')}
              className={`flex-1 px-3 py-1 text-sm rounded transition-colors ${
                searchType === 'code' 
                  ? 'bg-vscode-accent text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code size={14} className="inline mr-1" />
              Code
            </button>
            <button
              onClick={() => setSearchType('files')}
              className={`flex-1 px-3 py-1 text-sm rounded transition-colors ${
                searchType === 'files' 
                  ? 'bg-vscode-accent text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <File size={14} className="inline mr-1" />
              Files
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={searchType === 'code' ? 'Search in code...' : 'Search filenames...'}
                className="w-full pl-10 pr-3 py-2 bg-vscode-hover border border-vscode-border rounded text-vscode-text text-sm focus:outline-none focus:border-vscode-accent"
                disabled={!isIndexed}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearch}
              disabled={!searchQuery.trim() || !isIndexed || isSearching}
              icon={isSearching ? Loader2 : Search}
              className={isSearching ? 'animate-pulse' : ''}
            >
              Search
            </Button>
          </div>

          {!isIndexed && (
            <div className="text-xs text-yellow-400 flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" />
              Indexing project files...
            </div>
          )}
        </div>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <h4 className="text-vscode-text font-medium mb-3">
            Results ({searchResults.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => {
              const Icon = getFileIcon(result.filename);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-vscode-hover rounded cursor-pointer hover:bg-vscode-border transition-colors"
                  onClick={() => openFile(result)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className="text-vscode-accent" />
                    <span className="text-vscode-text font-medium text-sm">
                      {result.filename}
                    </span>
                    <span className="text-vscode-text-muted text-xs">
                      {result.path}
                    </span>
                  </div>
                  
                  {/* Code matches */}
                  {result.matches && result.matches.length > 0 && (
                    <div className="space-y-1">
                      {result.matches.slice(0, 3).map((match, matchIndex) => (
                        <div key={matchIndex} className="text-xs">
                          <span className="text-gray-400">Line {match.lineNumber}:</span>
                          <pre className="text-gray-300 mt-1 whitespace-pre-wrap font-mono">
                            {match.preview}
                          </pre>
                        </div>
                      ))}
                      {result.matches.length > 3 && (
                        <div className="text-xs text-gray-400">
                          +{result.matches.length - 3} more matches
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <Card>
          <div className="text-center py-8">
            <AlertCircle size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-vscode-text-muted">No results found</p>
            <p className="text-vscode-text-muted text-sm mt-1">
              Try different search terms
            </p>
          </div>
        </Card>
      )}

      {/* No Project */}
      {!project && (
        <Card>
          <div className="text-center py-8">
            <Search size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-vscode-text-muted">No project loaded</p>
            <p className="text-vscode-text-muted text-sm mt-1">
              Load a project to search code
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CodeSearchPanel;