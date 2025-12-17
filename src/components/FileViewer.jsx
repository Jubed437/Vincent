import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { File, Code, Image, FileText, Archive, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from '../store/appStore';
import Card from './ui/Card';
import Button from './ui/Button';
import electronAPI from '../utils/electronAPI';
import MermaidViewer from './MermaidViewer';

const FileViewer = () => {
  const { selectedFile } = useAppStore();
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBinary, setIsBinary] = useState(false);
  const [lintResults, setLintResults] = useState(null);
  const [showLinting, setShowLinting] = useState(false);

  const canLint = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    return ['js', 'jsx', 'ts', 'tsx'].includes(ext);
  };

  const isCodeFile = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    return ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'scss', 'md', 'py', 'java', 'c', 'cpp'].includes(ext);
  };

  // Load file content when selectedFile changes
  useEffect(() => {
    const loadFileContent = async () => {
      if (!selectedFile || selectedFile.type === 'folder') {
        setFileContent('');
        setError(null);
        setIsBinary(false);
        return;
      }

      // Check if this is a virtual file with embedded content
      if (selectedFile.content) {
        setFileContent(selectedFile.content);
        setIsLoading(false);
        setError(null);
        setIsBinary(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsBinary(false);

      try {
        if (!electronAPI || !electronAPI.readFileContent) {
          throw new Error('File reading API not available');
        }
        const result = await electronAPI.readFileContent(selectedFile.path);
        
        if (result.success) {
          setFileContent(result.data.content);
          // Load lint results for code files
          if (canLint(selectedFile.name)) {
            loadLintResults(selectedFile.path);
          }
        } else {
          setError(result.message);
          if (result.isBinary) {
            setIsBinary(true);
          }
        }
      } catch (err) {
        setError(`Failed to read file: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [selectedFile]);

  const loadLintResults = async (filePath) => {
    try {
      const result = await electronAPI.lintFile(filePath);
      if (result.success) {
        setLintResults(result.data);
      }
    } catch (error) {
      console.error('Linting failed:', error);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return Code;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return Image;
      case 'md':
      case 'txt':
        return FileText;
      case 'zip':
      case 'tar':
      case 'gz':
        return Archive;
      default:
        return File;
    }
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <File size={48} className="text-vscode-text-muted mx-auto mb-4" />
          <h3 className="text-vscode-text font-medium mb-2">No File Selected</h3>
          <p className="text-vscode-text-muted text-sm">
            Select a file from the explorer to view its contents
          </p>
        </div>
      </div>
    );
  }
  
  // Render visual diagram if it's a diagram file
  if (selectedFile.isMermaid || selectedFile.diagramData) {
    return <MermaidViewer data={selectedFile.diagramData} />;
  }

  const Icon = getFileIcon(selectedFile.name);
  
  const getLanguage = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'css': 'css',
      'html': 'html',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };
    return langMap[ext] || 'text';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      {/* File Header */}
      <div className="h-12 bg-vscode-panel border-b border-vscode-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-vscode-accent" />
          <span className="text-vscode-text font-medium">{selectedFile.name}</span>
          <span className="text-vscode-text-muted text-sm">
            {selectedFile.path}
          </span>
          {lintResults && (
            <div className="flex items-center gap-2">
              {lintResults.errorCount > 0 && (
                <span className="text-red-400 text-xs">{lintResults.errorCount} errors</span>
              )}
              {lintResults.warningCount > 0 && (
                <span className="text-yellow-400 text-xs">{lintResults.warningCount} warnings</span>
              )}
            </div>
          )}
        </div>
        {canLint(selectedFile.name) && (
          <Button
            variant={showLinting ? "primary" : "ghost"}
            size="sm"
            icon={AlertTriangle}
            onClick={() => setShowLinting(!showLinting)}
          >
            Lint
          </Button>
        )}
      </div>

      {/* File Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Lint Results */}
          {showLinting && lintResults && lintResults.issues.length > 0 && (
            <Card padding="sm">
              <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" />
                Code Issues ({lintResults.issues.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {lintResults.issues.map((issue, index) => (
                  <div key={index} className={`p-2 rounded text-sm ${
                    issue.severity === 'error' ? 'bg-red-900/20 border-l-2 border-red-400' : 'bg-yellow-900/20 border-l-2 border-yellow-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={issue.severity === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                        Line {issue.line}:{issue.column}
                      </span>
                      <span className="text-xs text-gray-400">{issue.rule}</span>
                    </div>
                    <p className="text-gray-300 mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="flex-1" padding="none">
            <div className="h-full overflow-auto scrollbar-thin scrollbar-track-vscode-hover scrollbar-thumb-vscode-border hover:scrollbar-thumb-vscode-accent">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={32} className="text-vscode-accent mx-auto mb-2 animate-spin" />
                    <p className="text-vscode-text-muted text-sm">Loading file...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
                    <p className="text-vscode-text font-medium mb-2">
                      {isBinary ? 'Binary File' : 'Error Reading File'}
                    </p>
                    <p className="text-vscode-text-muted text-sm">{error}</p>
                    {isBinary && (
                      <p className="text-vscode-text-muted text-xs mt-2">
                        This file cannot be displayed as text
                      </p>
                    )}
                  </div>
                </div>
              ) : isCodeFile(selectedFile.name) ? (
                <div className="overflow-auto max-h-full">
                  <SyntaxHighlighter
                    language={getLanguage(selectedFile.name)}
                    style={vscDarkPlus}
                    showLineNumbers={true}
                    wrapLines={true}
                    customStyle={{
                      margin: 0,
                      background: 'transparent',
                      fontSize: '0.875rem',
                      maxHeight: 'none'
                    }}
                  >
                    {fileContent || '// Empty file'}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <div className="overflow-auto max-h-full">
                  <pre className="p-4 text-sm font-mono text-vscode-text leading-relaxed whitespace-pre-wrap break-words">
                    {fileContent || '// Empty file'}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default FileViewer;