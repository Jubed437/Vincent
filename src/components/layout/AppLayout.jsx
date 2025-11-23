import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomPanel from './BottomPanel';
import FileViewer from '../FileViewer';
import UploadModal from '../UploadModal';

const AppLayout = () => {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="h-screen bg-vscode-bg flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Workspace */}
        <motion.div
          initial={false}
          animate={{ 
            marginLeft: 0,
            width: sidebarCollapsed ? 'calc(100% - 48px)' : 'calc(100% - 320px)'
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-1 flex flex-col bg-vscode-bg"
        >
          {/* Workspace Content */}
          <div className="flex-1 overflow-hidden">
            <FileViewer />
          </div>
          
          {/* Bottom Panel */}
          <BottomPanel />
        </motion.div>
      </div>
      
      {/* Modals */}
      <UploadModal />
    </div>
  );
};

export default AppLayout;