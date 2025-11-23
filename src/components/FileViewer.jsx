import { motion } from 'framer-motion';
import { File, Code, Image, FileText, Archive } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import Card from './ui/Card';

const FileViewer = () => {
  const { selectedFile } = useAppStore();

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
  const content = '// File content will be displayed here';

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
              <pre className="p-4 text-sm font-mono text-vscode-text leading-relaxed">
                <code>{content}</code>
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default FileViewer;