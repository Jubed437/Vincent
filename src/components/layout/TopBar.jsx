import React from 'react';
import { 
  FolderOpen, 
  FileText, 
  Package, 
  Bot,
  Code2
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useUIStore } from '../../store/uiStore';
import TopBarItem from '../ui/TopBarItem';

const TopBar = () => {
  const { activeView, setActiveView, project } = useAppStore();
  const { topBarHeight } = useUIStore();

  const projectLoaded = !!project;

  const topBarItems = [
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

  return (
    <div 
      className="bg-vscode-sidebar border-b border-vscode-border flex items-center overflow-hidden"
      style={{ height: topBarHeight }}
    >
      <div className="flex items-center h-full px-4 gap-1">
        {topBarItems.map((item) => (
          <TopBarItem
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
  );
};

export default TopBar;