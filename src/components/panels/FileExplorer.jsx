import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen 
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const FileItem = ({ file, level = 0, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedFile } = useAppStore();
  
  const isSelected = selectedFile?.id === file.id;
  const hasChildren = file.children && file.children.length > 0;

  const handleClick = () => {
    if (file.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(file);
    }
  };

  const getIcon = () => {
    if (file.type === 'folder') {
      return isExpanded ? FolderOpen : Folder;
    }
    return File;
  };

  const Icon = getIcon();

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
        
        <span className="text-vscode-text flex-1">{file.name}</span>
        
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
                key={child.id}
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
  const { projectFiles, setSelectedFile } = useAppStore();

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-3">
        <h3 className="text-vscode-text font-medium mb-3">Project Files</h3>
        
        {projectFiles.length === 0 ? (
          <div className="text-vscode-text-muted text-sm">
            No project loaded. Upload a project to explore files.
          </div>
        ) : (
          <div className="space-y-1">
            {projectFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onSelect={setSelectedFile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;