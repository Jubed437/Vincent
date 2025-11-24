import { motion } from 'framer-motion';
import { File, Code, Image, FileText, Archive, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Card from './ui/Card';

// Safe syntax highlighter without HTML injection
const highlightSyntax = (code, language) => {
  try {
    if (!code || typeof code !== 'string') return 'File is empty';
    
    // Return plain text without HTML injection for security
    return code;
  } catch (error) {
    console.error('Syntax highlighting error:', error);
    return code || 'Error loading file content';
  }
};

const getLanguageFromExtension = (fileName) => {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  const langMap = {
    'js': 'js', 'jsx': 'jsx', 'ts': 'ts', 'tsx': 'tsx',
    'css': 'css', 'scss': 'css', 'sass': 'css', 'less': 'css',
    'html': 'html', 'htm': 'html',
    'json': 'json',
    'md': 'md', 'markdown': 'md',
    'py': 'python', 'rb': 'ruby', 'php': 'php',
    'java': 'java', 'c': 'c', 'cpp': 'cpp', 'cs': 'cs',
    'go': 'go', 'rs': 'rust', 'swift': 'swift'
  };
  return langMap[ext] || 'text';
};

const FileViewer = () => {
  const { selectedFile, selectedFileContent, selectedFilePath, isLoadingFile } = useAppStore();

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

  const isImageFile = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
  };

  const isBinaryFile = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    return ['zip', 'tar', 'gz', 'exe', 'dll', 'bin'].includes(ext);
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <File size={48} className="text-vscode-text-muted mx-auto mb-4" />
          <h3 className="text-vscode-text font-medium mb-2">Select a file...</h3>
          <p className="text-vscode-text-muted text-sm">
            Choose a file from the explorer to view its contents
          </p>
        </div>
      </div>
    );
  }

  const Icon = getFileIcon(selectedFile.name);
  
  const renderFileContent = () => {
    if (isLoadingFile) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-2 text-vscode-text-muted">
            <Loader2 size={20} className="animate-spin" />
            <span>Loading file...</span>
          </div>
        </div>
      );
    }

    if (isImageFile(selectedFile.name)) {
      return (
        <div className="h-full flex items-center justify-center p-4">
          <img 
            src={`file://${selectedFile.path}`} 
            alt={selectedFile.name}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden text-vscode-text-muted">
            Cannot display image: {selectedFile.name}
          </div>
        </div>
      );
    }

    if (isBinaryFile(selectedFile.name)) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-vscode-text-muted">
            <Archive size={48} className="mx-auto mb-4 opacity-50" />
            <p>Binary file cannot be displayed</p>
            <p className="text-sm mt-2">{selectedFile.name}</p>
          </div>
        </div>
      );
    }

    const language = getLanguageFromExtension(selectedFile.name);
    const highlightedCode = highlightSyntax(selectedFileContent, language);
    
    return (
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="relative">
          {/* Language indicator */}
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-vscode-panel text-vscode-text-muted text-xs px-2 py-1 rounded border border-vscode-border">
              {language.toUpperCase()}
            </span>
          </div>
          
          {/* Line numbers and code */}
          <div className="flex bg-[#1e1e1e] code-viewer">
            {/* Line numbers */}
            <div className="line-numbers text-xs font-mono p-4">
              {selectedFileContent?.split('\n').map((_, index) => (
                <div key={index} className="leading-5">
                  {index + 1}
                </div>
              )) || <div>1</div>}
            </div>
            
            {/* Code content */}
            <pre className="flex-1 p-4 pl-3 text-sm whitespace-pre-wrap text-gray-200 font-mono leading-5">
              <code className="block">
                {highlightedCode}
              </code>
            </pre>
          </div>
        </div>
      </div>
    );
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
          {selectedFilePath || selectedFile.path}
        </span>
      </div>

      {/* File Content */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full m-4" padding="none">
          {renderFileContent()}
        </Card>
      </div>
    </motion.div>
  );
};

export default FileViewer;