import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';
import Card from '../ui/Card';
import electronAPI from '../../utils/electronAPI';

const EditorsPanel = () => {
  const { editors, setEditors, project } = useAppStore();

  const getEditorIcon = (editorName) => {
    const name = editorName.toLowerCase();
    if (name.includes('vs code')) return '🔵';
    if (name.includes('webstorm')) return '🟡';
    if (name.includes('intellij')) return '🔴';
    if (name.includes('sublime')) return '🟠';
    if (name.includes('notepad')) return '📝';
    return '💻';
  };

  const loadEditors = async () => {
    try {
      console.log('Loading editors...');
      const result = await electronAPI.detectEditors();
      if (result.success) {
        console.log('Detected editors:', result.data);
        setEditors(result.data);
      }
    } catch (error) {
      console.error('Failed to load editors:', error);
    }
  };

  const openEditor = async (editor) => {
    if (!project?.path) {
      console.warn('No project loaded');
      return;
    }

    try {
      console.log('Opening editor:', editor.name, 'at path:', editor.path);
      console.log('Project path:', project.path);
      const result = await electronAPI.openEditor(editor.path, project.path);
      console.log('Open editor result:', result);
      if (!result.success) {
        console.error('Failed to open editor:', result.message);
      } else {
        console.log('Editor opened successfully');
      }
    } catch (error) {
      console.error('Error opening editor:', error);
    }
  };

  const openVSCode = async () => {
    if (!project?.path) return;
    
    const vscodeEditor = editors.find(e => e.name.includes('Visual Studio Code'));
    if (vscodeEditor) {
      await openEditor(vscodeEditor);
    } else {
      // Try to open with 'code' command
      try {
        const result = await electronAPI.openEditor('code', project.path);
        if (!result.success) {
          console.error('VS Code not found');
        }
      } catch (error) {
        console.error('Error opening VS Code:', error);
      }
    }
  };

  const loadProject = async () => {
    try {
      const result = await electronAPI.selectProjectFolder();
      if (result.success) {
        const projectResult = await electronAPI.loadProject(result.path);
        if (projectResult.success) {
          const { loadProject: storeLoadProject } = useAppStore.getState();
          storeLoadProject(projectResult);
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  useEffect(() => {
    loadEditors();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-vscode-border bg-gradient-to-r from-vscode-sidebar to-vscode-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-vscode-accent/20 p-2 rounded-lg">
              <Code2 size={16} className="text-vscode-accent" />
            </div>
            <div className="min-w-0 overflow-hidden">
              <h3 className="text-vscode-text font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap">
                Code Editors
              </h3>
              <p className="text-vscode-text-muted text-xs truncate overflow-hidden text-ellipsis whitespace-nowrap">
                Launch project in your favorite editor
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={loadEditors}
            className="p-2 hover:bg-vscode-accent/20 hover:text-vscode-accent transition-colors"
            title="Scan for editors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <Card className="p-4 hover:bg-vscode-panel-hover hover:border-vscode-accent/30 transition-all duration-200 group cursor-pointer border border-vscode-border hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" fill="#007ACC"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-vscode-text text-sm font-semibold group-hover:text-vscode-accent transition-colors">
                      Visual Studio Code
                    </p>
                    <span className="bg-vscode-accent/20 text-vscode-accent text-xs px-2 py-0.5 rounded-full font-medium">
                      Popular
                    </span>
                  </div>
                  <p className="text-vscode-text-muted text-xs mt-1">
                    Click to open project in VS Code
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!project?.path && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={loadProject}
                      className="text-xs font-medium px-3"
                      title="Select a project folder"
                    >
                      Load Project
                    </Button>
                  )}
                  <Button
                    variant={project?.path ? "primary" : "ghost"}
                    size="sm"
                    icon={ExternalLink}
                    onClick={openVSCode}
                    disabled={!project?.path}
                    className="text-xs font-medium px-4 group-hover:scale-105 transition-transform"
                    title={!project?.path ? 'Load a project first' : 'Open in VS Code'}
                  >
                    Open
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditorsPanel;