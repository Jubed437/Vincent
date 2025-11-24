import { Upload, Search, Download, Play, Square, Settings, Minus, Maximize2, X } from 'lucide-react';
import Button from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import electronAPI from '../../utils/electronAPI';

const Header = () => {
  const { 
    isProjectRunning, 
    setProjectRunning, 
    setShowUploadModal,
    loadProject,
    project
  } = useAppStore();

  const handleUpload = async () => {
    try {
      const result = await electronAPI.selectProjectFolder();
      if (result.success && result.path) {
        const projectData = await electronAPI.loadProject(result.path);
        if (projectData.success) {
          await loadProject(projectData);
          console.log('Project loaded:', projectData);
        } else {
          console.error('Failed to load project:', projectData.message);
        }
      } else {
        console.error('Failed to select project folder:', result.message || 'No folder selected');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDetectTechStack = async () => {
    try {
      const result = await electronAPI.detectTechStack();
      if (result.success) {
        console.log('Tech stack detected:', result);
      } else {
        console.error('Tech stack detection failed:', result.message);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleInstallDependencies = async () => {
    try {
      const result = await electronAPI.installDependencies();
      if (result.success) {
        console.log('Dependencies installed successfully');
      } else {
        console.error('Installation failed:', result.message);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleStartProject = async () => {
    try {
      if (isProjectRunning) {
        const result = await electronAPI.stopProject();
        if (result.success) {
          setProjectRunning(false);
          console.log('Project stopped');
        }
      } else {
        if (!project?.path) {
          console.error('No project loaded');
          alert('Please load a project first');
          return;
        }
        
        const result = await electronAPI.startProject(project.path);
        if (result.success) {
          setProjectRunning(true);
          console.log('Project started');
        } else {
          console.error('Failed to start project:', result.message);
        }
      }
    } catch (error) {
      console.error('Project control error:', error);
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