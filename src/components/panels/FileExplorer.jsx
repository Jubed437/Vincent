import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  File, 
  Folder, 
  FolderOpen,
  FileText,
  Code,
  Image,
  Settings
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const FileItem = ({ file, level = 0, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedFile } = useAppStore();
  
  const isSelected = selectedFile?.path === file.path;
  const hasChildren = file.children && file.children.length > 0;

  const handleClick = async () => {
    if (file.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(file);
    }
  };

  const getFileIcon = (fileName, type) => {
    if (type === 'folder') {
      return isExpanded ? FolderOpen : Folder;
    }
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': case 'ts': case 'tsx':
        return Code;
      case 'json': case 'md': case 'txt':
        return FileText;
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg':
        return Image;
      case 'config': case 'env':
        return Settings;
      default:
        return File;
    }
  };

  const Icon = getFileIcon(file.name, file.type);

  return (
    <div>
      <motion.div
        whileHover={{ backgroundColor: '#2a2d2e' }}
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer text-sm ${
          isSelected ? 'bg-vscode-active' : ''
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={14} className="text-vscode-text-muted" />
          </motion.div>
        )}
        
        {!hasChildren && <div className="w-3.5" />}
        
        <Icon 
          size={16} 
          className={file.type === 'folder' ? 'text-blue-400' : 'text-vscode-text-muted'} 
        />
        
        <span className="text-vscode-text flex-1 truncate">{file.name}</span>
        
        {file.size && (
          <span className="text-vscode-text-muted text-xs">{file.size}</span>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {file.children.map((child) => (
              <FileItem
                key={child.path || `${file.path}/${child.name}`}
                file={child}
                level={level + 1}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FileExplorer = () => {
  const { 
    projectFiles, 
    setSelectedFile, 
    setFileContent, 
    setLoadingFile,
    project, 
    isLoading 
  } = useAppStore();

  const handleFileSelect = async (file) => {
    if (file.type !== 'file') return;
    
    const absolutePath = file.path || file.absolutePath;
    console.log('renderer: selected file', absolutePath);
    
    setSelectedFile(file);
    setLoadingFile(true);
    
    try {
      // Use window.api.readFile for compatibility
      const result = await window.api.readFile(absolutePath);
      console.log('renderer: file read result', result);
      
      if (result.success) {
        setFileContent(absolutePath, result.content);
      } else {
        setFileContent(absolutePath, `Error loading file: ${result.error}`);
      }
    } catch (error) {
      console.error('renderer: file read error', error);
      setFileContent(absolutePath, `Error loading file: ${error.message}`);
    } finally {
      setLoadingFile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin p-3">
        <h3 className="text-vscode-text font-medium mb-3">Project Files</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-vscode-hover rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin p-3">
        <h3 className="text-vscode-text font-medium mb-3">Project Files</h3>
        <div className="text-vscode-text-muted text-sm text-center py-8">
          <Folder size={48} className="mx-auto mb-3 opacity-50" />
          <p>No project loaded</p>
          <p className="text-xs mt-1">Upload a project to explore files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-vscode-text font-medium">Explorer</h3>
          <span className="text-vscode-text-muted text-xs">({projectFiles.length})</span>
        </div>
        
        <div className="text-vscode-text-muted text-xs mb-2 truncate" title={project.name}>
          {project.name}
        </div>
        
        {projectFiles.length === 0 ? (
          <div className="text-vscode-text-muted text-sm text-center py-4">
            <File size={32} className="mx-auto mb-2 opacity-50" />
            <p>No files found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {projectFiles.map((file) => (
              <FileItem
                key={file.path || file.name}
                file={file}
                onSelect={handleFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;