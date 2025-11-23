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
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AIActionsPanel = () => {
  const { addTerminalOutput } = useAppStore();

  const aiActions = [
    {
      id: 'analyze-structure',
      title: 'Analyze Project Structure',
      description: 'AI will analyze your project architecture and suggest improvements',
      icon: FileSearch,
      color: 'text-blue-400',
      action: () => {
        addTerminalOutput('🤖 AI: Analyzing project structure...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Analysis complete. Found 3 optimization opportunities.');
        }, 2000);
      }
    },
    {
      id: 'find-bugs',
      title: 'Find Potential Bugs',
      description: 'Scan code for common bugs and anti-patterns',
      icon: Bug,
      color: 'text-red-400',
      action: () => {
        addTerminalOutput('🤖 AI: Scanning for potential bugs...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Found 2 potential issues in src/components/');
        }, 2500);
      }
    },
    {
      id: 'optimize-performance',
      title: 'Performance Optimization',
      description: 'Identify performance bottlenecks and suggest fixes',
      icon: Zap,
      color: 'text-yellow-400',
      action: () => {
        addTerminalOutput('🤖 AI: Analyzing performance patterns...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Found 4 performance optimization opportunities.');
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
          addTerminalOutput('✅ AI: Security scan complete. No critical issues found.');
        }, 2800);
      }
    },
    {
      id: 'suggest-improvements',
      title: 'Code Improvements',
      description: 'Get AI suggestions for code quality improvements',
      icon: Lightbulb,
      color: 'text-purple-400',
      action: () => {
        addTerminalOutput('🤖 AI: Generating improvement suggestions...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Generated 7 code improvement suggestions.');
        }, 2200);
      }
    },
    {
      id: 'generate-tests',
      title: 'Generate Tests',
      description: 'Auto-generate unit tests for your components',
      icon: CheckCircle,
      color: 'text-cyan-400',
      action: () => {
        addTerminalOutput('🤖 AI: Generating unit tests...');
        setTimeout(() => {
          addTerminalOutput('✅ AI: Generated tests for 12 components.');
        }, 3500);
      }
    }
  ];

  const workflowSteps = [
    { id: 1, name: 'Project Upload', status: 'completed' },
    { id: 2, name: 'Structure Analysis', status: 'completed' },
    { id: 3, name: 'Dependency Resolution', status: 'in-progress' },
    { id: 4, name: 'Code Quality Check', status: 'pending' },
    { id: 5, name: 'Security Scan', status: 'pending' },
    { id: 6, name: 'Performance Analysis', status: 'pending' }
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <h3 className="text-vscode-text font-medium">AI Actions</h3>

      {/* AI Workflow Progress */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
          <Bot size={16} className="text-vscode-accent" />
          AI Workflow Progress
        </h4>
        <div className="space-y-2">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.id}
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
      <div className="space-y-3">
        {aiActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="cursor-pointer" onClick={action.action}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-vscode-hover ${action.color}`}>
                  <action.icon size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="text-vscode-text font-medium text-sm mb-1">
                    {action.title}
                  </h5>
                  <p className="text-vscode-text-muted text-xs leading-relaxed">
                    {action.description}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Play}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Search}
            onClick={() => {
              addTerminalOutput('🤖 AI: Running full project analysis...');
            }}
          >
            Full Analysis
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Zap}
            onClick={() => {
              addTerminalOutput('🤖 AI: Quick optimization scan...');
            }}
          >
            Quick Scan
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIActionsPanel;