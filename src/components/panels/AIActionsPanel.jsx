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
  Square,
  CheckCircle,
  Brain,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import electronAPI from '../../utils/electronAPI';
import { useState, useEffect } from 'react';

const AIActionsPanel = () => {
  const { 
    addTerminalOutput, 
    project, 
    setSemanticAnalysis, 
    semanticInsights,
    isProjectRunning,
    setProjectRunning,
    serverURL,
    setServerURL,
    techStack,
    dependencies
  } = useAppStore();
  const [isRunningDeepAnalysis, setIsRunningDeepAnalysis] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [checkingOllama, setCheckingOllama] = useState(false);
  const [analysisState, setAnalysisState] = useState({
    structureAnalyzed: false,
    dependenciesDetected: false,
    techStackIdentified: false,
    securityScanned: false,
    performanceAnalyzed: false
  });

  // Listen for project URL updates
  useEffect(() => {
    const unsubscribe = electronAPI.onProjectURL?.((url) => {
      setServerURL(url);
    });
    return unsubscribe;
  }, [setServerURL]);

  // Check Ollama connection on mount
  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    setCheckingOllama(true);
    addTerminalOutput('🔍 Checking Ollama connection...');
    
    try {
      const result = await electronAPI.checkOllamaConnection();
      setOllamaStatus(result);
      
      if (result.connected) {
        addTerminalOutput(`✅ Ollama is connected!`);
        addTerminalOutput(`📦 Available models: ${result.availableModels?.join(', ') || 'none'}`);
      } else {
        addTerminalOutput(`❌ Ollama is not connected`);
        addTerminalOutput(`⚠️ ${result.error || 'Unknown error'}`);
        if (result.suggestion) {
          addTerminalOutput(`💡 ${result.suggestion}`);
        }
      }
    } catch (error) {
      addTerminalOutput(`❌ Failed to check Ollama: ${error.message}`);
      setOllamaStatus({ connected: false, error: error.message });
    } finally {
      setCheckingOllama(false);
    }
  };

  const startProject = async () => {
    if (!project?.path) {
      addTerminalOutput('❌ No project loaded');
      return;
    }

    setIsStarting(true);
    addTerminalOutput('🚀 Starting project...');
    
    try {
      const result = await electronAPI.startProject(project.path);
      setIsStarting(false);
      
      if (result.success) {
        addTerminalOutput('✅ Project started successfully');
        if (result.data?.url) {
          setServerURL(result.data.url);
        }
        setProjectRunning(true);
      } else {
        const errorMsg = result.message || '';
        if (errorMsg.includes('Cannot find module') || errorMsg.includes('ENOENT')) {
          addTerminalOutput(`❌ Failed to start: ${result.message}`);
          addTerminalOutput('💡 Tip: Install dependencies first using "Install Dependencies" button');
        } else {
          addTerminalOutput(`❌ Failed to start project: ${result.message}`);
        }
      }
    } catch (error) {
      addTerminalOutput(`❌ Error starting project: ${error.message}`);
      setIsStarting(false);
    }
  };

  const stopProject = async () => {
    setIsStopping(true);
    addTerminalOutput('🛑 Stopping project...');
    
    try {
      const result = await electronAPI.stopProject();
      
      if (result.success) {
        setProjectRunning(false);
        setServerURL(null);
        addTerminalOutput('✅ Project stopped successfully');
      } else {
        addTerminalOutput(`❌ Failed to stop project: ${result.message}`);
      }
    } catch (error) {
      addTerminalOutput(`❌ Error stopping project: ${error.message}`);
    } finally {
      setIsStopping(false);
    }
  };

  const openServer = () => {
    if (serverURL) {
      electronAPI.openExternal(serverURL);
    }
  };

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
        
        try {
          addTerminalOutput('📁 Analyzing project structure...');
          const result = await electronAPI.analyzeProjectStructure(project.path);
          if (result && result.success) {
            setAnalysisState(prev => ({ ...prev, structureAnalyzed: true }));
            addTerminalOutput(`✅ Structure analysis complete. Score: ${result.data?.score || 0}/100`);
            if (result.data?.issues && result.data.issues.length > 0) {
              result.data.issues.forEach(issue => {
                addTerminalOutput(`❌ Issue: ${issue}`);
              });
            }
            if (result.data?.suggestions && result.data.suggestions.length > 0) {
              result.data.suggestions.forEach(suggestion => {
                addTerminalOutput(`💡 Suggestion: ${suggestion}`);
              });
            }
            if (result.data?.issues?.length === 0 && result.data?.suggestions?.length === 0) {
              addTerminalOutput('✅ No structural issues found');
            }
          } else {
            addTerminalOutput(`❌ Structure analysis failed: ${result?.message || 'Unknown error'}`);
          }
        } catch (error) {
          addTerminalOutput(`❌ Error: ${error.message}`);
          console.error('Structure analysis error:', error);
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
        
        try {
          addTerminalOutput('🐛 Scanning for potential bugs...');
          const result = await electronAPI.findPotentialBugs(project.path);
          if (result && result.success) {
            const { bugs, totalFiles } = result.data || {};
            addTerminalOutput(`✅ Scanned ${totalFiles || 0} files`);
            if (bugs && bugs.length > 0) {
              addTerminalOutput(`🐛 Found ${bugs.length} potential issues`);
              bugs.slice(0, 5).forEach(bug => {
                addTerminalOutput(`⚠️ ${bug.file}:${bug.line} - ${bug.issue} (${bug.severity})`);
              });
              if (bugs.length > 5) {
                addTerminalOutput(`... and ${bugs.length - 5} more issues`);
              }
            } else {
              addTerminalOutput('✅ No potential bugs found');
            }
          } else {
            addTerminalOutput(`❌ Bug scan failed: ${result?.message || 'Unknown error'}`);
          }
        } catch (error) {
          addTerminalOutput(`❌ Error: ${error.message}`);
          console.error('Bug scan error:', error);
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
        
        try {
          addTerminalOutput('⚡ Analyzing performance patterns...');
          const result = await electronAPI.analyzePerformance(project.path);
          if (result && result.success) {
            setAnalysisState(prev => ({ ...prev, performanceAnalyzed: true }));
            const { suggestions } = result.data || {};
            if (suggestions && suggestions.length > 0) {
              addTerminalOutput(`✅ Found ${suggestions.length} performance opportunities`);
              suggestions.forEach(suggestion => {
                addTerminalOutput(`⚡ ${suggestion.issue}: ${suggestion.suggestion}`);
              });
            } else {
              addTerminalOutput('✅ No performance issues detected');
            }
          } else {
            addTerminalOutput(`❌ Performance analysis failed: ${result?.message || 'Unknown error'}`);
          }
        } catch (error) {
          addTerminalOutput(`❌ Error: ${error.message}`);
          console.error('Performance analysis error:', error);
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
        
        try {
          addTerminalOutput('🛡️ Running security audit...');
          const result = await electronAPI.securityAudit(project.path);
          if (result && result.success) {
            setAnalysisState(prev => ({ ...prev, securityScanned: true }));
            const { issues, riskLevel } = result.data || {};
            addTerminalOutput(`✅ Security audit complete. Risk level: ${riskLevel || 'unknown'}`);
            if (issues && issues.length > 0) {
              addTerminalOutput(`📊 Found ${issues.length} security issues`);
              issues.forEach(issue => {
                addTerminalOutput(`🛡️ ${issue.severity?.toUpperCase()}: ${issue.issue} - ${issue.fix}`);
              });
            } else {
              addTerminalOutput('✅ No security issues found');
            }
          } else {
            addTerminalOutput(`❌ Security audit failed: ${result?.message || 'Unknown error'}`);
          }
        } catch (error) {
          addTerminalOutput(`❌ Error: ${error.message}`);
          console.error('Security audit error:', error);
        }
      }
    },
    {
      id: 'suggest-improvements',
      title: 'Code Improvements',
      description: 'Get AI suggestions for code quality improvements',
      icon: Lightbulb,
      color: 'text-purple-400',
      action: async () => {
        if (!project?.path) {
          addTerminalOutput('❌ No project loaded');
          return;
        }
        
        addTerminalOutput('💡 Analyzing code quality...');
        const [lintResult, structureResult] = await Promise.all([
          electronAPI.lintProject(project.path),
          electronAPI.analyzeProjectStructure(project.path)
        ]);
        
        let suggestions = 0;
        if (lintResult.success) {
          const { summary } = lintResult.data;
          if (summary.totalIssues > 0) {
            addTerminalOutput(`📝 Fix ${summary.totalErrors} ESLint errors and ${summary.totalWarnings} warnings`);
            suggestions++;
          }
        }
        
        if (structureResult.success) {
          addTerminalOutput(`📁 Project structure analysis complete`);
          suggestions++;
        }
        
        addTerminalOutput(`✅ Generated ${suggestions} improvement categories`);
      }
    },
    {
      id: 'generate-tests',
      title: 'Generate Tests',
      description: 'Auto-generate unit tests for your components',
      icon: CheckCircle,
      color: 'text-cyan-400',
      action: async () => {
        if (!project?.path) {
          addTerminalOutput('❌ No project loaded');
          return;
        }
        
        addTerminalOutput('🧪 Scanning for testable files...');
        const searchResult = await electronAPI.indexProject(project.path);
        if (searchResult.success) {
          const statsResult = await electronAPI.getSearchStats();
          if (statsResult.success) {
            const { extensions } = statsResult.data;
            const testableFiles = extensions.filter(ext => ['.js', '.jsx', '.ts', '.tsx'].includes(ext)).length;
            addTerminalOutput(`📄 Found ${testableFiles} testable file types`);
            addTerminalOutput(`✅ Test generation analysis complete`);
            addTerminalOutput(`💡 Recommend adding Jest/Vitest configuration`);
          }
        } else {
          addTerminalOutput('❌ Failed to analyze project for testing');
        }
      }
    },
    {
      id: 'scan-vulnerabilities',
      title: 'Vulnerability Scan',
      description: 'Scan dependencies for security vulnerabilities',
      icon: Shield,
      color: 'text-red-400',
      action: async () => {
        if (!project?.path) {
          addTerminalOutput('❌ No project loaded');
          return;
        }
        
        addTerminalOutput('🔍 Scanning for vulnerabilities...');
        const result = await electronAPI.scanVulnerabilities(project.path);
        if (result.success) {
          setAnalysisState(prev => ({ ...prev, securityScanned: true }));
          const { summary } = result.data;
          addTerminalOutput(`✅ Vulnerability scan complete`);
          addTerminalOutput(`📊 Found ${summary.total} vulnerabilities`);
          if (summary.critical > 0) addTerminalOutput(`⚠️ Critical: ${summary.critical}`);
          if (summary.high > 0) addTerminalOutput(`🔴 High: ${summary.high}`);
          if (summary.moderate > 0) addTerminalOutput(`🟡 Moderate: ${summary.moderate}`);
          if (summary.low > 0) addTerminalOutput(`🟢 Low: ${summary.low}`);
        } else {
          addTerminalOutput(`❌ Vulnerability scan failed: ${result.message}`);
        }
      }
    }
  ];

  const runDeepAnalysis = async () => {
    if (!project?.path) {
      addTerminalOutput('❌ No project loaded');
      return;
    }
    
    setIsRunningDeepAnalysis(true);
    addTerminalOutput('🧠 AI: Starting deep semantic analysis...');
    
    try {
      const result = await electronAPI.analyzeProjectEnhanced(project.path);
      
      if (result.success) {
        const analysis = result.data.semanticAnalysis || {};
        setSemanticAnalysis(analysis);
        
        // Create analysis report
        const report = generateAnalysisReport(result.data, analysis);
        
        // Display in editor by setting a virtual file
        useAppStore.getState().setSelectedFile({
          name: 'AI_Analysis_Report.md',
          path: 'AI Analysis Report',
          type: 'file',
          content: report
        });
        
        addTerminalOutput('✅ AI: Deep analysis completed with LLM insights');
        addTerminalOutput(`📊 Found ${analysis.criticalIssues?.length || 0} critical issues`);
        addTerminalOutput(`💡 Generated ${analysis.recommendations?.length || 0} recommendations`);
        addTerminalOutput('📄 Analysis report displayed in editor');
      } else {
        addTerminalOutput('⚠️ AI: Analysis completed with basic insights (LLM unavailable)');
      }
    } catch (error) {
      addTerminalOutput(`❌ AI: Deep analysis failed: ${error.message}`);
    } finally {
      setIsRunningDeepAnalysis(false);
    }
  };
  
  const generateMermaidDiagram = async () => {
    if (!project?.path) {
      addTerminalOutput('❌ No project loaded');
      return;
    }
    
    addTerminalOutput('📊 Generating project flow diagram...');
    
    try {
      const result = await electronAPI.analyzeProjectEnhanced(project.path);
      
      if (result.success) {
        const diagramData = generateDiagramData(result.data);
        
        // Display in editor
        useAppStore.getState().setSelectedFile({
          name: 'Project_Flow_Diagram',
          path: 'Visual Diagram',
          type: 'file',
          diagramData: diagramData,
          isMermaid: true
        });
        
        addTerminalOutput('✅ Flow diagram generated successfully');
        addTerminalOutput('📄 Diagram displayed in editor');
      }
    } catch (error) {
      addTerminalOutput(`❌ Failed to generate diagram: ${error.message}`);
    }
  };
  
  const generateDiagramData = (data) => {
    const nodes = [];
    
    // Start node
    nodes.push({
      type: 'start',
      icon: '🚀',
      title: 'Project Start',
      subtitle: data.projectType || 'Application'
    });
    
    // Tech Stack
    if (data.techStack?.length > 0) {
      nodes.push({
        type: 'tech',
        icon: '🔧',
        title: 'Tech Stack',
        subtitle: `${data.techStack.length} technologies`
      });
      
      data.techStack.slice(0, 3).forEach(tech => {
        nodes.push({
          type: 'tech',
          icon: '⚡',
          title: tech.name,
          subtitle: `v${tech.version}`
        });
      });
    }
    
    // Dependencies
    if (data.dependencies?.production?.length > 0) {
      nodes.push({
        type: 'dep',
        icon: '📦',
        title: 'Dependencies',
        subtitle: `${data.dependencies.production.length} packages`
      });
    }
    
    // API/Backend Flow
    if (data.projectType?.includes('Backend') || data.projectType?.includes('Express')) {
      nodes.push({
        type: 'api',
        icon: '🌐',
        title: 'API Layer',
        subtitle: 'Routes & Controllers'
      });
      
      nodes.push({
        type: 'db',
        icon: '💾',
        title: 'Database',
        subtitle: 'Data Storage'
      });
    }
    
    // Frontend Flow
    if (data.projectType?.includes('React') || data.projectType?.includes('Frontend')) {
      nodes.push({
        type: 'api',
        icon: '🎨',
        title: 'UI Components',
        subtitle: 'User Interface'
      });
      
      nodes.push({
        type: 'tech',
        icon: '🔄',
        title: 'State Management',
        subtitle: 'Application State'
      });
    }
    
    // End node
    nodes.push({
      type: 'end',
      icon: '✅',
      title: 'Output',
      subtitle: 'Production Ready'
    });
    
    return nodes;
  };
  
  const generateAnalysisReport = (data, semanticAnalysis) => {
    const report = [];
    
    report.push('# 🧠 AI Deep Analysis Report\n');
    report.push(`**Project:** ${project?.name || 'Unknown'}\n`);
    report.push(`**Analysis Date:** ${new Date().toLocaleString()}\n`);
    report.push('\n---\n\n');
    
    // Project Overview
    report.push('## 📊 Project Overview\n\n');
    report.push(`- **Type:** ${data.projectType || 'Unknown'}\n`);
    report.push(`- **Technologies:** ${data.techStack?.length || 0} detected\n`);
    report.push(`- **Dependencies:** ${data.dependencies?.production?.length || 0} production, ${data.dependencies?.development?.length || 0} development\n`);
    report.push('\n');
    
    // Tech Stack
    if (data.techStack?.length > 0) {
      report.push('## 🔧 Technology Stack\n\n');
      data.techStack.forEach(tech => {
        report.push(`- **${tech.name}** (${tech.category}) - v${tech.version}\n`);
      });
      report.push('\n');
    }
    
    // Critical Issues
    if (semanticAnalysis.criticalIssues?.length > 0) {
      report.push('## ⚠️ Critical Issues\n\n');
      semanticAnalysis.criticalIssues.forEach((issue, i) => {
        report.push(`### ${i + 1}. ${issue.title || issue}\n`);
        if (typeof issue === 'object') {
          report.push(`${issue.description || ''}\n`);
          if (issue.severity) report.push(`**Severity:** ${issue.severity}\n`);
          if (issue.file) report.push(`**File:** ${issue.file}\n`);
        }
        report.push('\n');
      });
    }
    
    // Recommendations
    if (semanticAnalysis.recommendations?.length > 0) {
      report.push('## 💡 Recommendations\n\n');
      semanticAnalysis.recommendations.forEach((rec, i) => {
        report.push(`${i + 1}. ${rec}\n`);
      });
      report.push('\n');
    }
    
    // Framework Insights
    if (semanticAnalysis.frameworkInsights) {
      report.push('## 🎯 Framework Insights\n\n');
      report.push(JSON.stringify(semanticAnalysis.frameworkInsights, null, 2));
      report.push('\n\n');
    }
    
    report.push('---\n\n');
    report.push('*Generated by SnapSetup AI Analysis*\n');
    
    return report.join('');
  };

  const workflowSteps = [
    { id: 1, name: 'Project Upload', status: project ? 'completed' : 'pending' },
    { id: 2, name: 'Project Structure Analysis', status: analysisState.structureAnalyzed ? 'completed' : 'pending' },
    { id: 3, name: 'Dependency Detection', status: dependencies?.length > 0 ? 'completed' : 'pending' },
    { id: 4, name: 'Tech Stack Identification', status: techStack?.length > 0 ? 'completed' : 'pending' },
    { id: 5, name: 'Semantic Analysis', status: semanticInsights ? 'completed' : 'pending' },
    { id: 6, name: 'Security Scan', status: analysisState.securityScanned ? 'completed' : 'pending' },
    { id: 7, name: 'Performance Analysis', status: analysisState.performanceAnalyzed ? 'completed' : 'pending' }
  ];

  // Update analysis state when project loads
  useEffect(() => {
    if (project) {
      setAnalysisState(prev => ({
        ...prev,
        structureAnalyzed: true
      }));
    }
  }, [project]);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <h3 className="text-vscode-text font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap">
        Project Actions
      </h3>

      {/* Project Control */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
          <Play size={16} className="text-vscode-accent" />
          Project Control
        </h4>
        
        <div className="space-y-3">
          {/* Start/Stop Button */}
          <div className="flex gap-2">
            {!isProjectRunning ? (
              <Button
                variant="primary"
                icon={isStarting ? Loader2 : Play}
                onClick={startProject}
                disabled={isStarting || !project}
                className={`flex-1 ${isStarting ? 'animate-pulse' : ''}`}
              >
                {isStarting ? 'Starting...' : 'Start Project'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                icon={isStopping ? Loader2 : Square}
                onClick={stopProject}
                disabled={isStopping}
                className={`flex-1 ${isStopping ? 'animate-pulse' : ''}`}
              >
                {isStopping ? 'Stopping...' : 'Stop Project'}
              </Button>
            )}
            
            {serverURL && (
              <Button
                variant="ghost"
                icon={ExternalLink}
                onClick={openServer}
                className="text-blue-400 hover:text-blue-300"
              >
                Open
              </Button>
            )}
          </div>
          
          {/* Server Status */}
          {isProjectRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 bg-green-900/20 border border-green-700/30 rounded text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">Project Running</span>
              </div>
              {serverURL && (
                <div className="mt-1 text-gray-300">
                  Server: <code className="text-white">{serverURL}</code>
                </div>
              )}
            </motion.div>
          )}
          
          {!project && (
            <div className="text-xs text-vscode-text-muted bg-vscode-hover p-2 rounded">
              ⚠️ Load a project first to start development server
            </div>
          )}
        </div>
      </Card>

      {/* Ollama Connection Status */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
          <Bot size={16} className="text-blue-400" />
          Ollama Status
        </h4>
        <div className="space-y-3">
          {ollamaStatus && (
            <div className={`p-2 rounded text-xs ${
              ollamaStatus.connected 
                ? 'bg-green-900/20 border border-green-700/30' 
                : 'bg-red-900/20 border border-red-700/30'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  ollamaStatus.connected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className={ollamaStatus.connected ? 'text-green-400' : 'text-red-400'}>
                  {ollamaStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {ollamaStatus.connected && ollamaStatus.availableModels?.length > 0 && (
                <div className="mt-1 text-gray-300">
                  Models: {ollamaStatus.availableModels.slice(0, 2).join(', ')}
                  {ollamaStatus.availableModels.length > 2 && ` +${ollamaStatus.availableModels.length - 2} more`}
                </div>
              )}
              {!ollamaStatus.connected && ollamaStatus.error && (
                <div className="mt-1 text-gray-300">
                  {ollamaStatus.error}
                </div>
              )}
            </div>
          )}
          <Button
            variant="secondary"
            icon={checkingOllama ? Loader2 : Bot}
            onClick={checkOllamaConnection}
            disabled={checkingOllama}
            className={`w-full ${checkingOllama ? 'animate-pulse' : ''}`}
          >
            {checkingOllama ? 'Checking...' : 'Check Connection'}
          </Button>
        </div>
      </Card>

      {/* Deep AI Analysis */}
      <Card>
        <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
          <Brain size={16} className="text-purple-400" />
          LLM-Powered Analysis
        </h4>
        <div className="space-y-3">
          <Button
            variant="primary"
            icon={isRunningDeepAnalysis ? Loader2 : Brain}
            onClick={runDeepAnalysis}
            disabled={isRunningDeepAnalysis || !project}
            className={`w-full ${isRunningDeepAnalysis ? 'animate-pulse' : ''}`}
          >
            {isRunningDeepAnalysis ? 'Running Deep Analysis...' : 'Deep AI Analysis'}
          </Button>
          
          <Button
            variant="secondary"
            icon={FileSearch}
            onClick={generateMermaidDiagram}
            disabled={!project}
            className="w-full"
          >
            Generate Flow Diagram
          </Button>
          
          {semanticInsights && (
            <div className="text-xs text-vscode-text-muted bg-vscode-hover p-2 rounded">
              ✅ Enhanced analysis available - check Project Summary for insights
            </div>
          )}
          
          {!ollamaStatus?.connected && (
            <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border border-yellow-700/30">
              ⚠️ Using Grok API (Ollama not connected)
            </div>
          )}
        </div>
      </Card>


    </div>
  );
};

export default AIActionsPanel;