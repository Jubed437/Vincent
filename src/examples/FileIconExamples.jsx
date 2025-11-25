/**
 * File Icon System - Quick Start Examples
 * Copy these examples to implement icons in your components
 */

// ============================================================
// EXAMPLE 1: Basic File Tree Item
// ============================================================

import { getFileIcon } from '../utils/fileIcons';

const FileTreeItem = ({ fileName, fileType, isExpanded = false }) => {
  const IconComponent = getFileIcon(fileName, fileType, isExpanded);
  
  return (
    <div className="flex items-center gap-2 p-2 hover:bg-vscode-hover">
      <IconComponent size={16} />
      <span className="text-vscode-text">{fileName}</span>
    </div>
  );
};

// Usage:
// <FileTreeItem fileName="app.js" fileType="file" />
// <FileTreeItem fileName="components" fileType="folder" isExpanded={true} />


// ============================================================
// EXAMPLE 2: File List with Multiple Files
// ============================================================

const FileList = ({ files }) => {
  return (
    <div className="space-y-1">
      {files.map((file) => {
        const IconComponent = getFileIcon(file.name, file.type);
        
        return (
          <div 
            key={file.id}
            className="flex items-center gap-2 px-3 py-2 hover:bg-vscode-active cursor-pointer rounded"
          >
            <IconComponent size={16} className="flex-shrink-0" />
            <span className="text-vscode-text truncate">{file.name}</span>
            {file.size && (
              <span className="text-vscode-text-muted text-xs ml-auto">
                {file.size}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Usage:
// <FileList files={[
//   { id: 1, name: 'app.js', type: 'file', size: '2.3 KB' },
//   { id: 2, name: 'package.json', type: 'file', size: '1.1 KB' },
//   { id: 3, name: 'components', type: 'folder' }
// ]} />


// ============================================================
// EXAMPLE 3: Expandable Folder Tree
// ============================================================

const FolderTree = ({ folder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = getFileIcon(folder.name, 'folder', isExpanded);
  
  return (
    <div>
      {/* Folder Header */}
      <div 
        className="flex items-center gap-2 px-2 py-1 hover:bg-vscode-hover cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight 
          size={14} 
          className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
        <IconComponent size={16} className="transition-transform hover:scale-110" />
        <span className="text-vscode-text">{folder.name}</span>
      </div>
      
      {/* Children */}
      {isExpanded && folder.children && (
        <div className="ml-4">
          {folder.children.map((child) => {
            const ChildIcon = getFileIcon(child.name, child.type);
            return (
              <div key={child.id} className="flex items-center gap-2 px-2 py-1">
                <ChildIcon size={16} />
                <span className="text-vscode-text">{child.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// ============================================================
// EXAMPLE 4: File Badge with Icon
// ============================================================

const FileBadge = ({ fileName, fileType }) => {
  const IconComponent = getFileIcon(fileName, fileType);
  
  return (
    <div className="inline-flex items-center gap-2 bg-vscode-sidebar px-3 py-1.5 rounded-md border border-vscode-border">
      <IconComponent size={16} />
      <span className="text-vscode-text text-sm">{fileName}</span>
    </div>
  );
};

// Usage:
// <FileBadge fileName="vite.config.js" fileType="file" />


// ============================================================
// EXAMPLE 5: File Upload Preview
// ============================================================

const FileUploadPreview = ({ uploadedFiles }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {uploadedFiles.map((file) => {
        const IconComponent = getFileIcon(file.name, 'file');
        
        return (
          <div 
            key={file.id}
            className="flex items-center gap-2 p-3 bg-vscode-sidebar rounded border border-vscode-border"
          >
            <IconComponent size={24} />
            <div className="flex-1 min-w-0">
              <p className="text-vscode-text text-sm truncate">{file.name}</p>
              <p className="text-vscode-text-muted text-xs">{file.size}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ============================================================
// EXAMPLE 6: Search Results with Icons
// ============================================================

const SearchResults = ({ results, searchTerm }) => {
  return (
    <div className="space-y-1">
      {results.map((result) => {
        const IconComponent = getFileIcon(result.fileName, result.fileType);
        
        return (
          <div 
            key={result.id}
            className="flex items-center gap-3 p-2 hover:bg-vscode-active cursor-pointer"
          >
            <IconComponent size={16} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-vscode-text text-sm truncate">
                {result.fileName}
              </p>
              <p className="text-vscode-text-muted text-xs truncate">
                {result.path}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ============================================================
// EXAMPLE 7: Recent Files List
// ============================================================

const RecentFilesList = ({ recentFiles }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-vscode-text font-semibold mb-2">Recent Files</h3>
      {recentFiles.map((file, index) => {
        const IconComponent = getFileIcon(file.name, 'file');
        
        return (
          <div 
            key={index}
            className="flex items-center gap-2 p-2 rounded hover:bg-vscode-hover cursor-pointer"
          >
            <IconComponent size={16} />
            <div className="flex-1">
              <p className="text-vscode-text text-sm">{file.name}</p>
              <p className="text-vscode-text-muted text-xs">
                {file.lastModified}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ============================================================
// EXAMPLE 8: File Tabs (like VS Code)
// ============================================================

const FileTabs = ({ openFiles, activeFileId, onFileClick, onFileClose }) => {
  return (
    <div className="flex border-b border-vscode-border bg-vscode-panel">
      {openFiles.map((file) => {
        const IconComponent = getFileIcon(file.name, 'file');
        const isActive = file.id === activeFileId;
        
        return (
          <div 
            key={file.id}
            className={`flex items-center gap-2 px-3 py-2 border-r border-vscode-border cursor-pointer
              ${isActive ? 'bg-vscode-bg' : 'hover:bg-vscode-hover'}`}
            onClick={() => onFileClick(file.id)}
          >
            <IconComponent size={14} />
            <span className={`text-sm ${isActive ? 'text-vscode-text' : 'text-vscode-text-muted'}`}>
              {file.name}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFileClose(file.id);
              }}
              className="ml-2 hover:bg-vscode-border rounded p-1"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};


// ============================================================
// EXAMPLE 9: File Context Menu
// ============================================================

const FileContextMenu = ({ fileName, fileType, position }) => {
  const IconComponent = getFileIcon(fileName, fileType);
  
  return (
    <div 
      className="absolute bg-vscode-sidebar border border-vscode-border rounded shadow-lg py-1 min-w-[180px]"
      style={{ top: position.y, left: position.x }}
    >
      {/* File info header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-vscode-border">
        <IconComponent size={16} />
        <span className="text-vscode-text text-sm truncate">{fileName}</span>
      </div>
      
      {/* Menu items */}
      <button className="w-full text-left px-3 py-1.5 text-sm text-vscode-text hover:bg-vscode-hover">
        Open
      </button>
      <button className="w-full text-left px-3 py-1.5 text-sm text-vscode-text hover:bg-vscode-hover">
        Rename
      </button>
      <button className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-vscode-hover">
        Delete
      </button>
    </div>
  );
};


// ============================================================
// EXAMPLE 10: Compact File List (Icon Only Mode)
// ============================================================

const CompactFileList = ({ files }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {files.map((file) => {
        const IconComponent = getFileIcon(file.name, file.type);
        
        return (
          <div 
            key={file.id}
            className="group relative p-2 hover:bg-vscode-hover rounded cursor-pointer"
            title={file.name} // Tooltip on hover
          >
            <IconComponent size={20} className="transition-transform group-hover:scale-110" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-vscode-panel text-vscode-text text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {file.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export {
  FileTreeItem,
  FileList,
  FolderTree,
  FileBadge,
  FileUploadPreview,
  SearchResults,
  RecentFilesList,
  FileTabs,
  FileContextMenu,
  CompactFileList
};
