import { Upload, Search, Download, Play, Square, Settings, Minus, Maximize2, X } from 'lucide-react';
import Button from '../ui/Button';
import { useAppStore } from '../../store/appStore';

const Header = () => {
  const { 
    isProjectRunning, 
    setProjectRunning, 
    setShowUploadModal,
    addTerminalOutput 
  } = useAppStore();

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleDetectTechStack = () => {
    addTerminalOutput('🔍 Detecting technology stack...');
    setTimeout(() => {
      addTerminalOutput('✅ Tech stack detected: React, Express, MongoDB');
    }, 1500);
  };

  const handleInstallDependencies = () => {
    addTerminalOutput('📦 Installing dependencies...');
    setTimeout(() => {
      addTerminalOutput('✅ Dependencies installed successfully');
    }, 2000);
  };

  const handleStartProject = () => {
    if (isProjectRunning) {
      setProjectRunning(false);
      addTerminalOutput('🛑 Project stopped');
    } else {
      setProjectRunning(true);
      addTerminalOutput('🚀 Starting project...');
      setTimeout(() => {
        addTerminalOutput('✅ Project running on http://localhost:3000');
      }, 1000);
    }
  };

  return (
    <header className="h-12 bg-vscode-panel border-b border-vscode-border flex items-center justify-between px-4" style={{ WebkitAppRegion: 'drag' }}>
      {/* Left side - Logo and title */}
      <div className="flex items-center gap-3 min-w-0">
        <img src="/icon.png" alt="Vincent" className="w-6 h-6" />
        <h1 className="text-vscode-text font-semibold">Vincent</h1>
      </div>

      {/* Center - Action buttons */}
      <div className="flex items-center gap-2 flex-1 justify-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <Button
          variant="secondary"
          size="sm"
          icon={Upload}
          onClick={handleUpload}
        >
          Upload Project
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          icon={Search}
          onClick={handleDetectTechStack}
        >
          Detect Tech Stack
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          icon={Download}
          onClick={handleInstallDependencies}
        >
          Install Dependencies
        </Button>
        
        <div className="w-px h-6 bg-vscode-border mx-2" />
        
        <Button
          variant={isProjectRunning ? "danger" : "primary"}
          size="sm"
          icon={isProjectRunning ? Square : Play}
          onClick={handleStartProject}
        >
          {isProjectRunning ? 'Stop' : 'Start'} Project
        </Button>
      </div>

      {/* Right side - Window Controls */}
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <Button
          variant="ghost"
          size="sm"
          icon={Settings}
        />
        <div className="w-px h-6 bg-vscode-border mx-2" />
        <Button
          variant="ghost"
          size="sm"
          icon={Minus}
          onClick={() => window.require('electron').ipcRenderer.send('minimize-window')}
          className="hover:bg-vscode-hover p-2"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={Maximize2}
          onClick={() => window.require('electron').ipcRenderer.send('maximize-window')}
          className="hover:bg-vscode-hover p-2"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          onClick={() => window.require('electron').ipcRenderer.send('close-window')}
          className="hover:bg-red-600 p-2"
        />
      </div>
    </header>
  );
};

export default Header;