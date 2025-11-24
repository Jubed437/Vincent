import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { File, Code, Image, FileText, Archive, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Card from './ui/Card';
import electronAPI from '../utils/electronAPI';

const FileViewer = () => {
  const { selectedFile } = useAppStore();
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBinary, setIsBinary] = useState(false);

  // Load file content when selectedFile changes
  useEffect(() => {
    const loadFileContent = async () => {
      if (!selectedFile || selectedFile.type === 'folder') {
        setFileContent('');
        setError(null);
        setIsBinary(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsBinary(false);

      try {
        const result = await electronAPI.readFileContent(selectedFile.path);
        
        if (result.success) {
          setFileContent(result.data.content);
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
      <div className="h-12 bg-vscode-panel border-b border-vscode-border flex items-center px-4 gap-3">
        <Icon size={16} className="text-vscode-accent" />
        <span className="text-vscode-text font-medium">{selectedFile.name}</span>
        <span className="text-vscode-text-muted text-sm">
          {selectedFile.path}
        </span>
      </div>

      {/* File Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <Card className="h-full" padding="none">
            <div className="h-full overflow-auto scrollbar-thin">
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
              ) : (
                <pre className="p-4 text-sm font-mono text-vscode-text leading-relaxed whitespace-pre-wrap break-words">
                  <code className={`language-${getLanguage(selectedFile.name)}`}>
                    {fileContent || '// Empty file'}
                  </code>
                </pre>
              )}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default FileViewer;