import { useAppStore } from '../../store/appStore';
import Header from './Header';
import TopBar from './TopBar';
import BottomPanel from './BottomPanel';
import FileViewer from '../FileViewer';
import UploadModal from '../UploadModal';
import FileExplorer from '../panels/FileExplorer';
import ProjectSummary from '../panels/ProjectSummary';
import DependenciesPanel from '../panels/DependenciesPanel';
import AIActionsPanel from '../panels/AIActionsPanel';
import EditorsPanel from '../panels/EditorsPanel';

const AppLayout = () => {
  const { activeView } = useAppStore();

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
    <div className="h-screen bg-vscode-bg flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Top Bar */}
      <TopBar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Active View */}
        <div className="w-80 bg-vscode-sidebar border-r border-vscode-border flex flex-col">
          {renderActivePanel()}
        </div>
        
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col bg-vscode-bg">
          {/* Workspace Content */}
          <div className="flex-1 overflow-hidden">
            <FileViewer />
          </div>
          
          {/* Bottom Panel */}
          <BottomPanel />
        </div>
      </div>
      
      {/* Modals */}
      <UploadModal />
    </div>
  );
};

export default AppLayout;