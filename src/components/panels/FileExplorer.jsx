import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { getFileIcon } from '../../utils/fileIcons';

const FileItem = ({ file, level = 0, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedFile } = useAppStore();
  
  const isSelected = selectedFile?.id === file.id;
  const isFolder = file.type === 'folder';
  const hasChildren = isFolder && file.children && file.children.length > 0;

  const handleClick = () => {
    if (isFolder) {
      // Only toggle expansion if folder has children
      if (hasChildren) {
        setIsExpanded(!isExpanded);
      }
    } else {
      onSelect(file);
    }
  };

  // Get the appropriate icon based on file type and name
  const IconComponent = getFileIcon(file.name, file.type, isExpanded);

  return (
    <div>
      <motion.div
        whileHover={{ backgroundColor: '#2a2d2e' }}
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer text-sm group ${
          isSelected ? 'bg-vscode-active' : ''
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={handleClick}
      >
        {/* Only show chevron for folders with children */}
        {hasChildren ? (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronRight size={14} className="text-vscode-text-muted" />
          </motion.div>
        ) : (
          <div className="w-3.5 flex-shrink-0" />
        )}
        
        {/* File/Folder Icon */}
        <div className="flex-shrink-0">
          <IconComponent size={16} className="transition-transform group-hover:scale-110" />
        </div>
        
        {/* File Name */}
        <span className="text-vscode-text flex-1 truncate overflow-hidden text-ellipsis max-w-full">
          {file.name}
        </span>
        
        {/* File Size (optional) */}
        {file.size && !isFolder && (
          <span className="text-vscode-text-muted text-xs truncate overflow-hidden flex-shrink-0 ml-2">
            {file.size}
          </span>
        )}
      </motion.div>

      {/* Show children when expanded */}
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
        <h3 className="text-vscode-text font-medium mb-3 truncate overflow-hidden text-ellipsis whitespace-nowrap">
          Project Files
        </h3>
        
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