import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';
import Card from '../ui/Card';

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
      const detectedEditors = await window.api.getEditors();
      console.log('Detected editors:', detectedEditors);
      setEditors(detectedEditors);
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
      const result = await window.api.openEditor(editor.path, project.path);
      console.log('Open editor result:', result);
      if (!result.success) {
        console.error('Failed to open editor:', result.error);
      } else {
        console.log('Editor opened successfully');
      }
    } catch (error) {
      console.error('Error opening editor:', error);
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
            <div>
              <h3 className="text-vscode-text font-semibold">Code Editors</h3>
              <p className="text-vscode-text-muted text-xs">Launch project in your favorite editor</p>
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
        {editors.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-vscode-border">
            <div className="bg-vscode-panel rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Code2 size={24} className="text-vscode-text-muted" />
            </div>
            <p className="text-vscode-text text-sm font-medium mb-2">No editors detected</p>
            <p className="text-vscode-text-muted text-xs leading-relaxed">
              Install VS Code, WebStorm, or other supported editors<br/>
              and click refresh to detect them
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-vscode-accent" />
              <span className="text-vscode-text-muted text-xs font-medium">
                {editors.length} editor{editors.length !== 1 ? 's' : ''} detected
              </span>
            </div>
            {editors.map((editor, index) => (
              <motion.div
                key={editor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              >
                <Card className="p-4 hover:bg-vscode-panel-hover hover:border-vscode-accent/30 transition-all duration-200 group cursor-pointer border border-vscode-border hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getEditorIcon(editor.name)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-vscode-text text-sm font-semibold group-hover:text-vscode-accent transition-colors">
                            {editor.name}
                          </p>
                          {editor.name.toLowerCase().includes('vs code') && (
                            <span className="bg-vscode-accent/20 text-vscode-accent text-xs px-2 py-0.5 rounded-full font-medium">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-vscode-text-muted text-xs mt-1 font-mono truncate max-w-[220px]">
                          {editor.path.split('\\').pop()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={project?.path ? "primary" : "secondary"}
                      size="sm"
                      icon={ExternalLink}
                      onClick={() => openEditor(editor)}
                      disabled={!project?.path}
                      className="text-xs font-medium px-4 group-hover:scale-105 transition-transform"
                      title={!project?.path ? 'Load a project first' : `Open in ${editor.name}`}
                    >
                      {project?.path ? 'Open' : 'Load Project'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorsPanel;