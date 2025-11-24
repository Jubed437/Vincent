import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  FileText, 
  Package, 
  Bot,
  Code2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import FileExplorer from '../panels/FileExplorer';
import ProjectSummary from '../panels/ProjectSummary';
import DependenciesPanel from '../panels/DependenciesPanel';
import AIActionsPanel from '../panels/AIActionsPanel';
import EditorsPanel from '../panels/EditorsPanel';

const Sidebar = () => {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    activeView, 
    setActiveView,
    project
  } = useAppStore();
  
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newWidth = Math.max(200, Math.min(600, e.clientX));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const projectLoaded = !!project;

  const tabs = [
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
        initial={false}
        animate={{ width: sidebarCollapsed ? 48 : sidebarWidth }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="bg-vscode-sidebar border-r border-vscode-border flex flex-col h-full"
      >
      {/* Sidebar Header */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-vscode-border">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            <Tabs
              tabs={tabs.map(tab => ({
                ...tab,
                className: tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }))}
              activeTab={activeView}
              onTabChange={(tabId) => {
                const tab = tabs.find(t => t.id === tabId);
                if (!tab?.disabled) {
                  setActiveView(tabId);
                }
              }}
              className="border-none"
            />
          </motion.div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          icon={sidebarCollapsed ? ChevronRight : ChevronLeft}
          onClick={toggleSidebar}
          className="p-1"
        />
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center py-4 gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeView === tab.id ? "secondary" : "ghost"}
                size="sm"
                icon={tab.icon}
                onClick={() => {
                  if (!tab.disabled) {
                    setActiveView(tab.id);
                  }
                }}
                className={`p-2 ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={tab.disabled ? `${tab.label} (No project loaded)` : tab.label}
                disabled={tab.disabled}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {renderActivePanel()}
          </motion.div>
        )}
      </div>
      </motion.div>
      
      {!sidebarCollapsed && (
        <div
          className="w-1 bg-transparent hover:bg-vscode-accent cursor-col-resize transition-colors"
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
};

export default Sidebar;