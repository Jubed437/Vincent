import { useState } from 'react';
import { Upload, Search, Download, Play, Square, Settings, Minus, Maximize2, X, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import electronAPI from '../../utils/electronAPI';

const Header = () => {
  const { 
    isProjectRunning, 
    setProjectRunning, 
    setShowUploadModal,
    addTerminalOutput,
    project,
    hasProject,
    loadProject,
    setLoading
  } = useAppStore();
  
  const [installing, setInstalling] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleDetectTechStack = async () => {
    if (!hasProject()) {
      addTerminalOutput('⚠️ Please upload a project first');
      return;
    }
    
    setAnalyzing(true);
    addTerminalOutput('🔍 Re-analyzing project...');
    
    try {
      const result = await electronAPI.analyzeProject(project.path);
      if (result.success) {
        await loadProject(result);
        addTerminalOutput('✅ Tech stack detection completed');
      } else {
        addTerminalOutput(`❌ Analysis failed: ${result.message}`);
      }
    } catch (error) {
      addTerminalOutput(`❌ Error: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInstallDependencies = async () => {
    if (!hasProject()) {
      addTerminalOutput('⚠️ Please upload a project first');
      return;
    }
    
    setInstalling(true);
    addTerminalOutput('📦 Installing dependencies...');
    
    try {
      const result = await electronAPI.installDependencies(project.path);
      if (result.success) {
        addTerminalOutput('✅ Dependencies installed successfully');
      } else {
        addTerminalOutput(`❌ Installation failed: ${result.message}`);
      }
    } catch (error) {
      addTerminalOutput(`❌ Installation error: ${error.message}`);
    } finally {
      setInstalling(false);
    }
  };

  const handleStartProject = async () => {
    if (!hasProject()) {
      addTerminalOutput('⚠️ Please upload a project first');
      return;
    }
    
    if (isProjectRunning) {
      addTerminalOutput('🛑 Stopping project...');
      const result = await electronAPI.stopProject();
      if (result.success) {
        setProjectRunning(false);
        addTerminalOutput('✅ Project stopped');
      } else {
        addTerminalOutput(`❌ Failed to stop: ${result.message}`);
      }
    } else {
      addTerminalOutput('🚀 Starting project...');
      const result = await electronAPI.startProject(project.path);
      if (result.success) {
        setProjectRunning(true);
        addTerminalOutput('✅ Project started successfully');
        if (result.data?.url) {
          addTerminalOutput(`🌐 Server running at: ${result.data.url}`);
        }
      } else {
        addTerminalOutput(`❌ Failed to start: ${result.message}`);
      }
    }
  };

  return (
    <header className="h-12 bg-vscode-panel border-b border-vscode-border flex items-center justify-between px-4" style={{ WebkitAppRegion: 'drag' }}>
      {/* Left side - Logo and title */}
      <div className="flex items-center gap-3 min-w-0">
        <img src="/icon.png" alt="Vincent" className="w-6 h-6" />
        <div className="flex items-center gap-2">
          <h1 className="text-vscode-text font-semibold">Vincent</h1>
          <span className="px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded-full">BETA</span>
        </div>
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
          icon={analyzing ? RefreshCw : Search}
          onClick={handleDetectTechStack}
          disabled={analyzing || !hasProject()}
          className={analyzing ? 'animate-spin' : ''}
        >
          {analyzing ? 'Analyzing...' : 'Re-analyze'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          icon={installing ? RefreshCw : Download}
          onClick={handleInstallDependencies}
          disabled={installing || !hasProject()}
          className={installing ? 'animate-spin' : ''}
        >
          {installing ? 'Installing...' : 'Install Deps'}
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
          onClick={() => electronAPI.minimizeWindow()}
          className="hover:bg-vscode-hover p-2"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={Maximize2}
          onClick={() => electronAPI.maximizeWindow()}
          className="hover:bg-vscode-hover p-2"
        />
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          onClick={() => electronAPI.closeWindow()}
          className="hover:bg-red-600 p-2"
        />
      </div>
    </header>
  );
};

export default Header;