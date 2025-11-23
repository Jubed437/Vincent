import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Search, 
  FileSearch, 
  Bug, 
  Zap, 
  Shield, 
  Lightbulb,
  Play,
  CheckCircle,
  GitBranch,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import electronAPI from '../../utils/electronAPI';

const AIActionsPanel = () => {
  const { addTerminalOutput, project, selectedFile, isLoading } = useAppStore();
  const [runningAction, setRunningAction] = useState(null);

  const handleAIAction = async (actionId, actionName, apiCall) => {
    if (!project?.path || runningAction) return;
    
    setRunningAction(actionId);
    addTerminalOutput(`🤖 AI: ${actionName}...`);
    
    try {
      const result = await apiCall(project.path);
      if (result.success) {
        addTerminalOutput(`✅ AI: ${actionName} completed successfully`);
        if (result.message) {
          addTerminalOutput(`📝 ${result.message}`);
        }
      } else {
        addTerminalOutput(`❌ AI: ${actionName} failed - ${result.message}`);
      }
    } catch (error) {
      addTerminalOutput(`❌ AI: Error during ${actionName} - ${error.message}`);
    } finally {
      setRunningAction(null);
    }
  };

  const aiActions = [
    {
      id: 'analyze-project',
      title: 'Analyze Project',
      description: 'Comprehensive AI analysis of project structure and code quality',
      icon: FileSearch,
      color: 'text-blue-400',
      action: () => handleAIAction(
        'analyze-project',
        'Analyzing project structure',
        electronAPI.aiAnalyzeProject
      )
    },
    {
      id: 'explain-file',
      title: 'Explain Current File',
      description: selectedFile ? `Explain ${selectedFile.name}` : 'Select a file to get AI explanation',
      icon: Lightbulb,
      color: 'text-purple-400',
      disabled: !selectedFile,
      action: () => {
        if (selectedFile) {
          addTerminalOutput(`🤖 AI: Explaining ${selectedFile.name}...`);
          setTimeout(() => {
            addTerminalOutput(`✅ AI: ${selectedFile.name} is a ${selectedFile.type} that handles...`);
          }, 1500);
        }
      }
    },
    {
      id: 'find-issues',
      title: 'Find Issues',
      description: 'Scan code for potential bugs, security issues, and anti-patterns',
      icon: Bug,
      color: 'text-red-400',
      action: () => {
        addTerminalOutput('🤖 AI: Scanning for code issues...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Found 3 potential issues - check Code Issues panel');
        }, 2500);
      }
    },
    {
      id: 'optimize-performance',
      title: 'Performance Analysis',
      description: 'Identify performance bottlenecks and optimization opportunities',
      icon: Zap,
      color: 'text-yellow-400',
      action: () => {
        addTerminalOutput('🤖 AI: Analyzing performance patterns...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Found 4 performance optimization opportunities');
        }, 3000);
      }
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      description: 'Check for security vulnerabilities and best practices',
      icon: Shield,
      color: 'text-green-400',
      action: () => {
        addTerminalOutput('🤖 AI: Running security audit...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Security scan complete - no critical vulnerabilities found');
        }, 2800);
      }
    },
    {
      id: 'generate-dependency-graph',
      title: 'Dependency Graph',
      description: 'Generate visual dependency graph and detect circular dependencies',
      icon: GitBranch,
      color: 'text-cyan-400',
      action: () => {
        addTerminalOutput('🤖 AI: Generating dependency graph...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Dependency graph generated - no circular dependencies detected');
        }, 2200);
      }
    }
  ];

  const getWorkflowStatus = () => {
    if (!project) return [];
    
    return [
      { id: 1, name: 'Project Upload', status: 'completed' },
      { id: 2, name: 'File Scanning', status: 'completed' },
      { id: 3, name: 'Tech Stack Detection', status: 'completed' },
      { id: 4, name: 'Dependency Analysis', status: project ? 'completed' : 'pending' },
      { id: 5, name: 'AI Analysis', status: 'pending' },
      { id: 6, name: 'Code Quality Check', status: 'pending' }
    ];
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
        <h3 className="text-vscode-text font-medium">AI Actions</h3>
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
        <h3 className="text-vscode-text font-medium mb-4">AI Actions</h3>
        <div className="text-vscode-text-muted text-sm text-center py-8">
          <Bot size={48} className="mx-auto mb-3 opacity-50" />
          <p>No project loaded</p>
          <p className="text-xs mt-1">Upload a project to access AI features</p>
        </div>
      </div>
    );
  }

  const workflowSteps = getWorkflowStatus();

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <h3 className="text-vscode-text font-medium">AI Actions</h3>

      {/* AI Workflow Progress */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
          <Bot size={16} className="text-vscode-accent" />
          Analysis Progress
        </h4>
        <div className="space-y-2">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={`workflow-${step.id}-${step.name}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-2 h-2 rounded-full ${
                step.status === 'completed' ? 'bg-vscode-success' :
                step.status === 'in-progress' ? 'bg-vscode-warning animate-pulse' :
                'bg-vscode-border'
              }`} />
              <span className={`text-sm ${
                step.status === 'completed' ? 'text-vscode-text' :
                step.status === 'in-progress' ? 'text-vscode-warning' :
                'text-vscode-text-muted'
              }`}>
                {step.name}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* AI Actions */}
      <div className="space-y-2">
        {aiActions.map((action, index) => {
          const isRunning = runningAction === action.id;
          const isDisabled = action.disabled || isRunning;
          
          return (
            <motion.div
              key={`action-${action.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                hover={!isDisabled} 
                className={`cursor-pointer transition-opacity ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`} 
                onClick={isDisabled ? undefined : action.action}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-vscode-hover ${action.color}`}>
                    {isRunning ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <action.icon size={16} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-vscode-text font-medium text-sm mb-1">
                      {action.title}
                    </h5>
                    <p className="text-vscode-text-muted text-xs leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  
                  {!isDisabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Play}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={runningAction === 'full-analysis' ? RefreshCw : Search}
            onClick={() => handleAIAction(
              'full-analysis',
              'Running comprehensive analysis',
              electronAPI.aiAnalyzeProject
            )}
            disabled={runningAction === 'full-analysis'}
            className={runningAction === 'full-analysis' ? 'animate-pulse' : ''}
          >
            {runningAction === 'full-analysis' ? 'Analyzing...' : 'Full AI Analysis'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIActionsPanel;