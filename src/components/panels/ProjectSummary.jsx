import { motion } from 'framer-motion';
import { 
  Code, 
  Package, 
  Database, 
  Server, 
  Globe,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';

const ProjectSummary = () => {
  const { techStack, project } = useAppStore();

  const getStackIcon = (type) => {
    switch (type) {
      case 'framework':
        return Code;
      case 'backend':
        return Server;
      case 'database':
        return Database;
      default:
        return Package;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const projectStats = {
    totalFiles: 24,
    linesOfCode: 1847,
    dependencies: 12,
    devDependencies: 8
  };

  const analysisSteps = [
    { id: 1, name: 'Project Structure Analysis', status: 'completed' },
    { id: 2, name: 'Dependency Detection', status: 'completed' },
    { id: 3, name: 'Tech Stack Identification', status: 'completed' },
    { id: 4, name: 'Security Scan', status: 'in-progress' },
    { id: 5, name: 'Performance Analysis', status: 'pending' }
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <h3 className="text-vscode-text font-medium">Project Summary</h3>

      {/* Project Stats */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Project Statistics</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-vscode-accent">
              {projectStats.totalFiles}
            </div>
            <div className="text-xs text-vscode-text-muted">Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-vscode-success">
              {projectStats.linesOfCode.toLocaleString()}
            </div>
            <div className="text-xs text-vscode-text-muted">Lines of Code</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-vscode-warning">
              {projectStats.dependencies}
            </div>
            <div className="text-xs text-vscode-text-muted">Dependencies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {projectStats.devDependencies}
            </div>
            <div className="text-xs text-vscode-text-muted">Dev Dependencies</div>
          </div>
        </div>
      </Card>

      {/* Tech Stack */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Technology Stack</h4>
        {techStack.length === 0 ? (
          <div className="text-vscode-text-muted text-sm">
            No tech stack detected yet.
          </div>
        ) : (
          <div className="space-y-2">
            {techStack.map((tech, index) => {
              const Icon = getStackIcon(tech.type);
              return (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded bg-vscode-hover"
                >
                  <Icon size={16} className="text-vscode-accent" />
                  <div className="flex-1">
                    <div className="text-vscode-text text-sm font-medium">
                      {tech.name}
                    </div>
                    <div className="text-vscode-text-muted text-xs">
                      v{tech.version} • {tech.type}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Analysis Progress */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Analysis Progress</h4>
        <div className="space-y-2">
          {analysisSteps.map((step, index) => {
            const StatusIcon = getStatusIcon(step.status);
            const statusColors = {
              completed: 'text-vscode-success',
              'in-progress': 'text-vscode-warning',
              pending: 'text-vscode-text-muted',
              error: 'text-vscode-error'
            };

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-2"
              >
                <StatusIcon 
                  size={16} 
                  className={statusColors[step.status]} 
                />
                <span className="text-vscode-text text-sm flex-1">
                  {step.name}
                </span>
                <span className={`text-xs capitalize ${statusColors[step.status]}`}>
                  {step.status.replace('-', ' ')}
                </span>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ProjectSummary;