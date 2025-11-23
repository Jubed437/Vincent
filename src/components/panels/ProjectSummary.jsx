import { motion } from 'framer-motion';
import { 
  Code, 
  Package, 
  Database, 
  Server, 
  Folder,
  FileText,
  Play,
  Settings
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';

const ProjectSummary = () => {
  const { 
    techStack, 
    project, 
    projectMetadata, 
    dependencies, 
    getProjectScripts,
    isLoading 
  } = useAppStore();

  const getStackIcon = (type) => {
    switch (type) {
      case 'framework':
        return Code;
      case 'backend':
      case 'build-tool':
        return Server;
      case 'database':
        return Database;
      default:
        return Package;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Frontend':
        return 'text-blue-400';
      case 'Backend':
        return 'text-green-400';
      case 'Development':
        return 'text-yellow-400';
      case 'Fullstack':
        return 'text-purple-400';
      default:
        return 'text-vscode-accent';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
        <h3 className="text-vscode-text font-medium">Project Summary</h3>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <div className="h-20 bg-vscode-hover rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin p-3">
        <h3 className="text-vscode-text font-medium mb-4">Project Summary</h3>
        <div className="text-vscode-text-muted text-sm text-center py-8">
          <Package size={48} className="mx-auto mb-3 opacity-50" />
          <p>No project loaded</p>
          <p className="text-xs mt-1">Upload a project to view summary</p>
        </div>
      </div>
    );
  }

  const projectScripts = getProjectScripts();
  const prodDeps = dependencies.filter(d => d.type === 'production');
  const devDeps = dependencies.filter(d => d.type === 'development');

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <h3 className="text-vscode-text font-medium">Project Summary</h3>

      {/* Project Info */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Project Information</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-vscode-text-muted text-sm">Name:</span>
            <span className="text-vscode-text text-sm font-medium">{project.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-vscode-text-muted text-sm">Type:</span>
            <span className="text-vscode-text text-sm">{project.type}</span>
          </div>
          {projectMetadata?.lastScanned && (
            <div className="flex justify-between">
              <span className="text-vscode-text-muted text-sm">Last Scanned:</span>
              <span className="text-vscode-text text-sm">
                {new Date(projectMetadata.lastScanned).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Project Stats */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Statistics</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-vscode-accent">
              {projectMetadata?.totalFiles || 0}
            </div>
            <div className="text-xs text-vscode-text-muted">Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {projectMetadata?.totalFolders || 0}
            </div>
            <div className="text-xs text-vscode-text-muted">Folders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-vscode-warning">
              {prodDeps.length}
            </div>
            <div className="text-xs text-vscode-text-muted">Dependencies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {devDeps.length}
            </div>
            <div className="text-xs text-vscode-text-muted">Dev Dependencies</div>
          </div>
        </div>
      </Card>

      {/* Tech Stack */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Technology Stack</h4>
        {techStack.length === 0 ? (
          <div className="text-vscode-text-muted text-sm text-center py-4">
            <Code size={32} className="mx-auto mb-2 opacity-50" />
            <p>No technologies detected</p>
          </div>
        ) : (
          <div className="space-y-2">
            {techStack.map((tech, index) => {
              const Icon = getStackIcon(tech.type);
              return (
                <motion.div
                  key={`tech-${tech.name}-${tech.type}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded bg-vscode-hover"
                >
                  <Icon size={16} className={getCategoryColor(tech.category)} />
                  <div className="flex-1">
                    <div className="text-vscode-text text-sm font-medium">
                      {tech.name}
                    </div>
                    <div className="text-vscode-text-muted text-xs">
                      {tech.version !== 'detected' ? `v${tech.version}` : 'detected'} • {tech.category}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Available Scripts */}
      {Object.keys(projectScripts).length > 0 && (
        <Card>
          <h4 className="text-vscode-text font-medium mb-3">Available Scripts</h4>
          <div className="space-y-2">
            {Object.entries(projectScripts).map(([name, command], index) => (
              <motion.div
                key={`script-${name}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded bg-vscode-hover"
              >
                <Play size={14} className="text-vscode-success" />
                <div className="flex-1 min-w-0">
                  <div className="text-vscode-text text-sm font-medium">
                    npm run {name}
                  </div>
                  <div className="text-vscode-text-muted text-xs truncate">
                    {command}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectSummary;