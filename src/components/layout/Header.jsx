import { Upload, Search, Download, Play, Square, Settings, Minus, Maximize2, X, ExternalLink, Database } from 'lucide-react';
import Button from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import electronAPI from '../../utils/electronAPI';
import { useState, useEffect } from 'react';

const Header = () => {
  const { 
    isProjectRunning, 
    setProjectRunning, 
    setShowUploadModal,
    loadProject,
    project,
    serverURL,
    setServerURL,
    addTerminalOutput
  } = useAppStore();
  
  // Check if electronAPI is available
  useEffect(() => {
    console.log('ElectronAPI available:', !!electronAPI);
    console.log('ElectronAPI methods:', Object.keys(electronAPI || {}));
    if (typeof window !== 'undefined') {
      console.log('Window.electronAPI:', !!window.electronAPI);
    }
  }, []);
  
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Listen for project URL updates
  useEffect(() => {
    const unsubscribe = electronAPI.onProjectURL?.((url) => {
      setServerURL(url);
    });
    return unsubscribe;
  }, [setServerURL]);

  const handleUpload = async () => {
    try {
      addTerminalOutput('📁 Selecting project folder...');
      
      const result = await electronAPI.selectProjectFolder();
      console.log('Dialog result:', result);
      
      if (result.success && result.path) {
        addTerminalOutput(`📂 Loading project: ${result.path}`);
        
        // Load the project
        const projectData = await electronAPI.loadProject(result.path);
        console.log('Project data:', projectData);
        
        if (projectData.success) {
          await loadProject(projectData);
          addTerminalOutput('✅ Project loaded successfully');
          
          // Auto-detect tech stack
          addTerminalOutput('🔍 Auto-detecting technologies...');
          try {
            const techResult = await electronAPI.detectTechStack();
            if (techResult.success) {
              const { techStack, projectType } = techResult.data;
              addTerminalOutput(`📊 Project Type: ${projectType}`);
              addTerminalOutput(`🔧 Found ${techStack.length} technologies`);
            }
          } catch (error) {
            addTerminalOutput(`⚠️ Auto-detection failed: ${error.message}`);
          }
        } else {
          addTerminalOutput(`❌ Failed to load project: ${projectData.message}`);
        }
      } else {
        addTerminalOutput('❌ No folder selected');
      }
    } catch (error) {
      console.error('Upload error:', error);
      addTerminalOutput(`❌ Error: ${error.message}`);
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

  const handleDetectDatabase = async () => {
    if (!project?.path) {
      addTerminalOutput('❌ No project loaded');
      return;
    }

    try {
      addTerminalOutput('🔍 Analyzing database and backend technologies...');
      
      const result = await electronAPI.detectTechStack();
      if (result.success) {
        const { techStack, projectType } = result.data;
        
        addTerminalOutput(`📊 Project Type: ${projectType}`);
        
        // Filter and display backend frameworks
        const backends = techStack.filter(tech => 
          tech.category === 'Backend' && 
          (tech.type === 'framework' || tech.type === 'server')
        );
        
        if (backends.length > 0) {
          addTerminalOutput('🔧 Backend Frameworks:');
          backends.forEach(backend => {
            addTerminalOutput(`  ✓ ${backend.name} ${backend.version !== 'detected' ? `v${backend.version}` : '(detected)'}`);
          });
        }
        
        // Filter and display databases
        const databases = techStack.filter(tech => 
          tech.type === 'database' || tech.type === 'database-connection'
        );
        
        if (databases.length > 0) {
          addTerminalOutput('🗄️ Databases:');
          databases.forEach(db => {
            addTerminalOutput(`  ✓ ${db.name} ${db.version !== 'detected' ? `v${db.version}` : '(detected)'}`);
            if (db.file) {
              addTerminalOutput(`    📁 Found in: ${db.file}`);
            }
          });
        } else {
          addTerminalOutput('🗄️ No databases detected');
        }
        
        // Show API endpoints if detected
        const apis = techStack.filter(tech => 
          tech.type === 'api' || tech.type === 'api-structure'
        );
        
        if (apis.length > 0) {
          addTerminalOutput('🌐 API Endpoints:');
          apis.forEach(api => {
            addTerminalOutput(`  ✓ ${api.name} (${api.file})`);
          });
        }
        
        addTerminalOutput('✅ Database and backend analysis completed!');
      } else {
        addTerminalOutput(`❌ Detection failed: ${result.message}`);
      }
    } catch (error) {
      addTerminalOutput(`❌ Error: ${error.message}`);
    }
  };

  const handleStartProject = async () => {
    try {
      if (isProjectRunning) {
        setIsStopping(true);
        addTerminalOutput('🛑 Stopping project...');
        
        const result = await electronAPI.stopProject();
        if (result.success) {
          setProjectRunning(false);
          setServerURL(null);
          addTerminalOutput('✅ Project stopped successfully');
        } else {
          addTerminalOutput(`❌ Failed to stop project: ${result.message}`);
        }
        setIsStopping(false);
      } else {
        if (!project?.path) {
          addTerminalOutput('❌ No project loaded');
          alert('Please load a project first');
          return;
        }
        
        setIsStarting(true);
        addTerminalOutput('🚀 Starting project...');
        
        const result = await electronAPI.startProject(project.path);
        if (result.success) {
          setProjectRunning(true);
          addTerminalOutput('✅ Project started successfully');
          if (result.data?.url) {
            setServerURL(result.data.url);
          }
        } else {
          addTerminalOutput(`❌ Failed to start project: ${result.message}`);
        }
        setIsStarting(false);
      }
    } catch (error) {
      addTerminalOutput(`❌ Error: ${error.message}`);
      setIsStarting(false);
      setIsStopping(false);
    }
  };

  const openServer = () => {
    if (serverURL) {
      electronAPI.openExternal(serverURL);
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
          icon={Database}
          onClick={handleDetectDatabase}
          disabled={!project?.path}
        >
          Detect Database & Backend
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
          disabled={isStarting || isStopping}
        >
          {isStarting ? 'Starting...' : isStopping ? 'Stopping...' : isProjectRunning ? 'Stop' : 'Start'} Project
        </Button>
        
        {serverURL && (
          <Button
            variant="ghost"
            size="sm"
            icon={ExternalLink}
            onClick={openServer}
            className="text-blue-400 hover:text-blue-300"
          >
            Open Server
          </Button>
        )}
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