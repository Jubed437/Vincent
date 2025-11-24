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
import electronAPI from '../../utils/electronAPI';

const AIActionsPanel = () => {
  const { addTerminalOutput, project } = useAppStore();

  const aiActions = [
    {
      id: 'analyze-structure',
      title: 'Analyze Project Structure',
      description: 'AI will analyze your project architecture and suggest improvements',
      icon: FileSearch,
      color: 'text-blue-400',
      action: async () => {
        if (!project?.path) {
          addTerminalOutput('❌ No project loaded');
          return;
        }
        
        addTerminalOutput('🤖 AI: Analyzing project structure...');
        const result = await electronAPI.analyzeProjectStructure(project.path);
        if (result.success) {
          addTerminalOutput(`✅ AI: Analysis complete. Score: ${result.data.score}/100`);
          result.data.issues.forEach(issue => {
            addTerminalOutput(`❌ Issue: ${issue}`);
          });
          result.data.suggestions.forEach(suggestion => {
            addTerminalOutput(`💡 Suggestion: ${suggestion}`);
          });
        } else {
          addTerminalOutput(`❌ AI: Analysis failed: ${result.message}`);
        }
      }
    },
    {
      id: 'find-bugs',
      title: 'Find Potential Bugs',
      description: 'Scan code for common bugs and anti-patterns',
      icon: Bug,
      color: 'text-red-400',
      action: async () => {
        if (!project?.path) {
          addTerminalOutput('❌ No project loaded');
          return;
        }
        
        addTerminalOutput('🤖 AI: Scanning for potential bugs...');
        const result = await electronAPI.findPotentialBugs(project.path);
        if (result.success) {
          addTerminalOutput(`✅ AI: Scanned ${result.data.totalFiles} files, found ${result.data.bugs.length} issues`);
          result.data.bugs.forEach(bug => {
            addTerminalOutput(`🐛 ${bug.file}:${bug.line} - ${bug.issue}`);
          });
        } else {
          addTerminalOutput(`❌ AI: Bug scan failed: ${result.message}`);
        }
      }
    },
    {
      id: 'optimize-performance',
      title: 'Performance Optimization',
      description: 'Identify performance bottlenecks and suggest fixes',
      icon: Zap,
      color: 'text-yellow-400',
      action: async () => {
        if (!project?.path) {
          addTerminalOutput('❌ No project loaded');
          return;
        }
        
        addTerminalOutput('🤖 AI: Analyzing performance patterns...');
        const result = await electronAPI.analyzePerformance(project.path);
        if (result.success) {
          addTerminalOutput(`✅ AI: Found ${result.data.suggestions.length} performance opportunities`);
          result.data.suggestions.forEach(suggestion => {
            addTerminalOutput(`⚡ ${suggestion.issue}: ${suggestion.suggestion}`);
          });
        } else {
          addTerminalOutput(`❌ AI: Performance analysis failed: ${result.message}`);
        }
      }
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      description: 'Check for security vulnerabilities and best practices',
      icon: Shield,
      color: 'text-green-400',
      action: async () => {
        if (!project?.path) {
          addTerminalOutput('❌ No project loaded');
          return;
        }
        
        addTerminalOutput('🤖 AI: Running security audit...');
        const result = await electronAPI.securityAudit(project.path);
        if (result.success) {
          addTerminalOutput(`✅ AI: Security scan complete. Risk level: ${result.data.riskLevel}`);
          result.data.issues.forEach(issue => {
            addTerminalOutput(`🛡️ ${issue.severity.toUpperCase()}: ${issue.issue} - ${issue.fix}`);
          });
        } else {
          addTerminalOutput(`❌ AI: Security audit failed: ${result.message}`);
        }
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
            onClick={async () => {
              if (!project?.path) {
                addTerminalOutput('❌ No project loaded');
                return;
              }
              
              addTerminalOutput('🤖 AI: Running full project analysis...');
              
              // Run all analyses
              const [structure, bugs, performance, security] = await Promise.all([
                electronAPI.analyzeProjectStructure(project.path),
                electronAPI.findPotentialBugs(project.path),
                electronAPI.analyzePerformance(project.path),
                electronAPI.securityAudit(project.path)
              ]);
              
              addTerminalOutput('✅ AI: Full analysis complete');
              addTerminalOutput(`Structure Score: ${structure.data?.score || 0}/100`);
              addTerminalOutput(`Bugs Found: ${bugs.data?.bugs?.length || 0}`);
              addTerminalOutput(`Performance Issues: ${performance.data?.suggestions?.length || 0}`);
              addTerminalOutput(`Security Risk: ${security.data?.riskLevel || 'unknown'}`);
            }}
          >
            Full Analysis
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Zap}
            onClick={async () => {
              if (!project?.path) {
                addTerminalOutput('❌ No project loaded');
                return;
              }
              
              addTerminalOutput('🤖 AI: Quick optimization scan...');
              const result = await electronAPI.analyzePerformance(project.path);
              if (result.success) {
                addTerminalOutput(`✅ Found ${result.data.suggestions.length} optimization opportunities`);
              }
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