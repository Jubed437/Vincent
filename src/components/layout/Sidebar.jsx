import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  FileText, 
  Package, 
  Bot,
  Code2
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useUIStore } from '../../store/uiStore';
import SidebarItem from '../ui/SidebarItem';
import FileExplorer from '../panels/FileExplorer';
import ProjectSummary from '../panels/ProjectSummary';
import DependenciesPanel from '../panels/DependenciesPanel';
import AIActionsPanel from '../panels/AIActionsPanel';
import EditorsPanel from '../panels/EditorsPanel';

const Sidebar = () => {
  const { activeView, setActiveView, project } = useAppStore();
  const { sidebarWidth, setSidebarWidth, isIconOnlyMode } = useUIStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const iconOnly = isIconOnlyMode();

  // Handle resize dragging
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setSidebarWidth(e.clientX);
  }, [isDragging, setSidebarWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const projectLoaded = !!project;

  const sidebarItems = [
    { 
      id: 'explorer', 
      label: 'Explorer', 
      icon: FolderOpen,
      disabled: false
    },
    { 
      id: 'summary', 
      label: 'Summary', 
      icon: FileText,
      disabled: !projectLoaded
    },
    { 
      id: 'dependencies', 
      label: 'Dependencies', 
      icon: Package,
      disabled: !projectLoaded
    },
    { 
      id: 'editors', 
      label: 'Editors', 
      icon: Code2,
      disabled: false
    },
    { 
      id: 'actions', 
      label: 'AI Actions', 
      icon: Bot,
      disabled: !projectLoaded
    }
  ];

  const renderActivePanel = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />;
      case 'summary':
        return <ProjectSummary />;
      case 'dependencies':
        return <DependenciesPanel />;
      case 'editors':
        return <EditorsPanel />;
      case 'actions':
        return <AIActionsPanel />;
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div className="relative flex">
      <motion.div
        style={{ width: sidebarWidth }}
        className="bg-vscode-sidebar border-r border-vscode-border flex flex-col h-full transition-all duration-200 ease-in-out"
      >
        {/* Sidebar Navigation */}
        <div className={`${iconOnly ? 'p-2' : 'p-3'} border-b border-vscode-border`}>
          {iconOnly ? (
            <div className="flex flex-col gap-1">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  {...item}
                  isActive={activeView === item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      setActiveView(item.id);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div>
              <h3 className="text-vscode-text font-medium mb-2 text-sm truncate overflow-hidden text-ellipsis whitespace-nowrap">
                Vincent Explorer
              </h3>
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <SidebarItem
                    key={item.id}
                    {...item}
                    isActive={activeView === item.id}
                    onClick={() => {
                      if (!item.disabled) {
                        setActiveView(item.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {renderActivePanel()}
        </div>
      </motion.div>
      
      {/* Resize Handle */}
      <div
        className="resize-handle w-1 bg-transparent hover:bg-vscode-accent cursor-col-resize transition-colors flex-shrink-0"
        onMouseDown={handleMouseDown}
        style={{
          backgroundColor: isDragging ? '#007acc' : 'transparent'
        }}
      />
    </div>
  );
};

export default Sidebar;