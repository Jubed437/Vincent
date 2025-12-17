import { motion } from 'framer-motion';
import { 
  Code, 
  Package, 
  Database, 
  Server, 
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Loader2,
  Brain,
  FileText,
  GitBranch,
  Shield
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import electronAPI from '../../utils/electronAPI';

const ProjectSummary = () => {
  const { 
    project, 
    projectFiles, 
    techStack,
    npmScripts,
    dependencies,
    semanticInsights,
    fileDescriptions,
    apiFlow,
    componentFlow,
    criticalIssues,
    recommendations,
    frameworkInsights
  } = useAppStore();

  const countFiles = (files) => {
    if (!files || !Array.isArray(files)) return 0;
    return files.reduce((count, file) => {
      if (file.type === 'file') {
        return count + 1;
      } else if (file.children) {
        return count + countFiles(file.children);
      }
      return count;
    }, 0);
  };

  const handleRunScript = async (scriptName) => {
    if (!project?.path) return;

    try {
      console.log(`Running npm script: ${scriptName}`);
      
      const result = await electronAPI.terminalInput(`npm run ${scriptName}`);
      if (result.success) {
        console.log(`Script ${scriptName} executed`);
      } else {
        console.error(`Script ${scriptName} failed:`, result.message);
      }
    } catch (error) {
      console.error(`Error running script: ${error.message}`);
    }
  };

  const getStackIcon = (type, category) => {
    if (category === 'Backend') {
      switch (type) {
        case 'framework':
        case 'server':
          return Server;
        case 'database':
        case 'database-connection':
          return Database;
        case 'api':
        case 'api-structure':
          return Globe;
        default:
          return Server;
      }
    }
    
    switch (type) {
      case 'framework':
        return Code;
      case 'database':
        return Database;
      case 'build-tool':
        return Package;
      default:
        return Package;
    }
  };
  
  const getStackColor = (category, type) => {
    if (category === 'Backend') {
      return 'text-green-400';
    }
    if (category === 'Frontend') {
      return 'text-blue-400';
    }
    if (category === 'Database') {
      return 'text-yellow-400';
    }
    return 'text-vscode-accent';
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

  const safeArray = (arr) => arr || [];
  const safeTechStack = safeArray(techStack);
  const safeNpmScripts = safeArray(npmScripts);
  const safeDependencies = safeArray(dependencies);
  const safeCriticalIssues = safeArray(criticalIssues);
  const safeRecommendations = safeArray(recommendations);

  const projectStats = {
    totalFiles: projectFiles ? countFiles(projectFiles) : 0,
    linesOfCode: 0,
    dependencies: safeDependencies.filter(d => d.type === 'production').length,
    devDependencies: safeDependencies.filter(d => d.type === 'development').length
  };

  const analysisSteps = [
    { id: 1, name: 'Project Structure Analysis', status: project ? 'completed' : 'pending' },
    { id: 2, name: 'Dependency Detection', status: safeDependencies.length > 0 ? 'completed' : 'pending' },
    { id: 3, name: 'Tech Stack Identification', status: safeTechStack.length > 0 ? 'completed' : 'pending' },
    { id: 4, name: 'Semantic Analysis', status: semanticInsights ? 'completed' : 'pending' },
    { id: 5, name: 'Security Scan', status: safeCriticalIssues.length > 0 ? 'completed' : 'pending' },
    { id: 6, name: 'Performance Analysis', status: 'pending' }
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <h3 className="text-vscode-text font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap">
        Project Summary
      </h3>

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
        {safeTechStack.length === 0 ? (
          <div className="text-vscode-text-muted text-sm">
            No tech stack detected yet.
          </div>
        ) : (
          <div className="space-y-2">
            {safeTechStack.map((tech, index) => {
              const Icon = getStackIcon(tech.type, tech.category);
              const colorClass = getStackColor(tech.category, tech.type);
              return (
                <motion.div
                  key={`${tech.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded bg-vscode-hover"
                >
                  <Icon size={16} className={colorClass} />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="text-vscode-text text-sm font-medium truncate overflow-hidden text-ellipsis max-w-full">
                      {tech.name}
                    </div>
                    <div className="text-vscode-text-muted text-xs truncate overflow-hidden text-ellipsis max-w-full">
                      {tech.version !== 'detected' ? `v${tech.version}` : 'detected'} - {tech.category} {tech.type}
                      {tech.file && ` - ${tech.file}`}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* NPM Scripts */}
      {safeNpmScripts.length > 0 && (
        <Card>
          <h4 className="text-vscode-text font-medium mb-3">NPM Scripts</h4>
          <div className="space-y-2">
            {safeNpmScripts.map((script, index) => (
              <motion.div
                key={script.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded bg-vscode-hover"
              >
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="text-vscode-text text-sm font-medium truncate overflow-hidden text-ellipsis max-w-full">
                    {script.name}
                  </div>
                  <div className="text-vscode-text-muted text-xs font-mono truncate overflow-hidden text-ellipsis max-w-full">
                    {script.command}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={script.running ? Loader2 : Play}
                  onClick={() => handleRunScript(script.name)}
                  disabled={script.running}
                  className={script.running ? 'animate-spin' : ''}
                >
                  {script.running ? 'Running' : 'Run'}
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

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
                <span className="text-vscode-text text-sm flex-1 truncate overflow-hidden text-ellipsis max-w-full">
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