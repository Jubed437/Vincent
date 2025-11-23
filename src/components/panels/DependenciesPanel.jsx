import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Download,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import electronAPI from '../../utils/electronAPI';

const DependenciesPanel = () => {
  const { dependencies, addTerminalOutput, project, isLoading } = useAppStore();
  const [installing, setInstalling] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'installed':
        return CheckCircle;
      case 'pending':
      case 'missing':
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
      case 'missing':
        return 'text-vscode-warning';
      case 'error':
        return 'text-vscode-error';
      default:
        return 'text-vscode-text-muted';
    }
  };

  const handleInstallAll = async () => {
    if (!project?.path || installing) return;
    
    setInstalling(true);
    addTerminalOutput('📦 Installing all dependencies...');
    
    try {
      const result = await electronAPI.installDependencies(project.path);
      if (result.success) {
        addTerminalOutput('✅ All dependencies installed successfully');
      } else {
        addTerminalOutput(`❌ Installation failed: ${result.message}`);
      }
    } catch (error) {
      addTerminalOutput(`❌ Installation error: ${error.message}`);
    } finally {
      setInstalling(false);
    }
  };

  const productionDeps = dependencies.filter(dep => dep.type === 'production');
  const devDeps = dependencies.filter(dep => dep.type === 'development');

  const DependencyList = ({ deps, title, icon: Icon }) => (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-vscode-accent" />
        <h4 className="text-vscode-text font-medium">{title}</h4>
        <span className="text-vscode-text-muted text-xs">({deps.length})</span>
      </div>
      {deps.length === 0 ? (
        <div className="text-vscode-text-muted text-sm text-center py-4">
          <Package size={32} className="mx-auto mb-2 opacity-50" />
          <p>No {title.toLowerCase()} found</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
          {deps.map((dep, index) => {
            const StatusIcon = getStatusIcon(dep.status);
            return (
              <motion.div
                key={`${dep.name}-${dep.type || 'unknown'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center gap-3 p-2 rounded hover:bg-vscode-hover group"
              >
                <StatusIcon 
                  size={14} 
                  className={getStatusColor(dep.status)} 
                />
                
                <div className="flex-1 min-w-0">
                  <div className="text-vscode-text text-sm font-medium truncate">
                    {dep.name}
                  </div>
                  <div className="text-vscode-text-muted text-xs">
                    v{dep.version}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => window.open(`https://npmjs.com/package/${dep.name}`, '_blank')}
                    className="p-1"
                    title="View on npm"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
        <h3 className="text-vscode-text font-medium">Dependencies</h3>
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <div className="h-32 bg-vscode-hover rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin p-3">
        <h3 className="text-vscode-text font-medium mb-4">Dependencies</h3>
        <div className="text-vscode-text-muted text-sm text-center py-8">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p>No project loaded</p>
          <p className="text-xs mt-1">Upload a project to view dependencies</p>
        </div>
      </div>
    );
  }

  const installedCount = dependencies.filter(d => d.status === 'installed').length;
  const pendingCount = dependencies.filter(d => d.status === 'pending' || d.status === 'missing').length;
  const errorCount = dependencies.filter(d => d.status === 'error').length;

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-vscode-text font-medium">Dependencies</h3>
        <Button
          variant="primary"
          size="sm"
          icon={installing ? RefreshCw : Download}
          onClick={handleInstallAll}
          disabled={installing || !project?.path}
          className={installing ? 'animate-spin' : ''}
        >
          {installing ? 'Installing...' : 'Install All'}
        </Button>
      </div>

      {/* Summary Stats */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Status Overview</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-vscode-success">
              {installedCount}
            </div>
            <div className="text-xs text-vscode-text-muted">Installed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-vscode-warning">
              {pendingCount}
            </div>
            <div className="text-xs text-vscode-text-muted">Missing</div>
          </div>
          <div>
            <div className="text-lg font-bold text-vscode-error">
              {errorCount}
            </div>
            <div className="text-xs text-vscode-text-muted">Errors</div>
          </div>
        </div>
      </Card>

      <DependencyList 
        deps={productionDeps} 
        title="Production Dependencies" 
        icon={Package}
      />
      <DependencyList 
        deps={devDeps} 
        title="Development Dependencies" 
        icon={RefreshCw}
      />
    </div>
  );
};

export default DependenciesPanel;