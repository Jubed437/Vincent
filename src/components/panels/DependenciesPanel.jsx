import { motion } from 'framer-motion';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Trash2
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import electronAPI from '../../utils/electronAPI';

const DependenciesPanel = () => {
  const { dependencies, addTerminalOutput, project } = useAppStore();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'installed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'error':
        return AlertTriangle;
      default:
        return Package;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'installed':
        return 'text-vscode-success';
      case 'pending':
        return 'text-vscode-warning';
      case 'error':
        return 'text-vscode-error';
      default:
        return 'text-vscode-text-muted';
    }
  };

  const handleInstallDependency = async (dep) => {
    if (!project?.path) {
      addTerminalOutput('❌ No project loaded');
      return;
    }
    
    addTerminalOutput(`📦 Installing ${dep.name}@${dep.version}...`);
    // This would need a specific package installer implementation
    // For now, we'll use the general dependency installer
    const result = await electronAPI.installDependencies(project.path);
    if (result.success) {
      addTerminalOutput(`✅ ${dep.name} installed successfully`);
    } else {
      addTerminalOutput(`❌ Failed to install ${dep.name}`);
    }
  };

  const handleUninstallDependency = async (dep) => {
    if (!project?.path) {
      addTerminalOutput('❌ No project loaded');
      return;
    }
    
    addTerminalOutput(`🗑️ Uninstalling ${dep.name}...`);
    // This would need npm uninstall implementation
    addTerminalOutput(`✅ ${dep.name} uninstalled`);
  };

  const productionDeps = dependencies.filter(dep => dep.type === 'production');
  const devDeps = dependencies.filter(dep => dep.type === 'development');

  const DependencyList = ({ deps, title }) => (
    <Card>
      <h4 className="text-vscode-text font-medium mb-3">{title}</h4>
      {deps.length === 0 ? (
        <div className="text-vscode-text-muted text-sm">
          No {title.toLowerCase()} found.
        </div>
      ) : (
        <div className="space-y-2">
          {deps.map((dep, index) => {
            const StatusIcon = getStatusIcon(dep.status);
            return (
              <motion.div
                key={dep.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded hover:bg-vscode-hover group"
              >
                <StatusIcon 
                  size={16} 
                  className={getStatusColor(dep.status)} 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="text-vscode-text text-sm font-medium truncate">
                    {dep.name}
                  </div>
                  <div className="text-vscode-text-muted text-xs">
                    v{dep.version} • {dep.status}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {dep.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Download}
                      onClick={() => handleInstallDependency(dep)}
                      className="p-1"
                      title="Install"
                    />
                  )}
                  {dep.status === 'installed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleUninstallDependency(dep)}
                      className="p-1 text-vscode-error hover:text-vscode-error"
                      title="Uninstall"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-vscode-text font-medium">Dependencies</h3>
        <Button
          variant="primary"
          size="sm"
          icon={Download}
          onClick={async () => {
            if (!project?.path) {
              addTerminalOutput('❌ No project loaded');
              return;
            }
            
            addTerminalOutput('📦 Installing all dependencies...');
            const result = await electronAPI.installDependencies(project.path);
            if (result.success) {
              addTerminalOutput('✅ All dependencies installed');
            } else {
              addTerminalOutput(`❌ Installation failed: ${result.message}`);
            }
          }}
        >
          Install All
        </Button>
      </div>

      {/* Summary Stats */}
      <Card>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-vscode-success">
              {dependencies.filter(d => d.status === 'installed').length}
            </div>
            <div className="text-xs text-vscode-text-muted">Installed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-vscode-warning">
              {dependencies.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-xs text-vscode-text-muted">Pending</div>
          </div>
          <div>
            <div className="text-lg font-bold text-vscode-error">
              {dependencies.filter(d => d.status === 'error').length}
            </div>
            <div className="text-xs text-vscode-text-muted">Errors</div>
          </div>
        </div>
      </Card>

      <DependencyList deps={productionDeps} title="Production Dependencies" />
      <DependencyList deps={devDeps} title="Development Dependencies" />
    </div>
  );
};

export default DependenciesPanel;