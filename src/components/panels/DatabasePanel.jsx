import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Server, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Search,
  FileText,
  Code
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import electronAPI from '../../utils/electronAPI';

const DatabasePanel = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { project, techStack, addTerminalOutput } = useAppStore();

  const handleAnalyze = async () => {
    if (!project?.path) {
      addTerminalOutput('❌ No project loaded');
      return;
    }

    setIsAnalyzing(true);
    try {
      addTerminalOutput('🔍 Analyzing database and backend technologies...');
      
      const result = await electronAPI.detectTechStack();
      if (result.success) {
        setAnalysisResult(result.data);
        addTerminalOutput('✅ Analysis completed!');
      } else {
        addTerminalOutput(`❌ Analysis failed: ${result.message}`);
      }
    } catch (error) {
      addTerminalOutput(`❌ Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIcon = (type, category) => {
    if (category === 'Backend') {
      switch (type) {
        case 'database':
        case 'database-connection':
          return Database;
        case 'framework':
        case 'server':
          return Server;
        case 'api':
        case 'api-structure':
          return Globe;
        default:
          return Code;
      }
    }
    return Code;
  };

  const getColor = (type, category) => {
    if (category === 'Backend') {
      switch (type) {
        case 'database':
        case 'database-connection':
          return 'text-yellow-400';
        case 'framework':
        case 'server':
          return 'text-green-400';
        case 'api':
        case 'api-structure':
          return 'text-blue-400';
        default:
          return 'text-gray-400';
      }
    }
    return 'text-gray-400';
  };

  const backendTech = analysisResult?.techStack?.filter(tech => 
    tech.category === 'Backend'
  ) || techStack?.filter(tech => tech.category === 'Backend') || [];

  const databases = backendTech.filter(tech => 
    tech.type === 'database' || tech.type === 'database-connection'
  );

  const frameworks = backendTech.filter(tech => 
    tech.type === 'framework' || tech.type === 'server'
  );

  const apis = backendTech.filter(tech => 
    tech.type === 'api' || tech.type === 'api-structure'
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-vscode-text font-medium">Database & Backend</h3>
        <Button
          variant="primary"
          size="sm"
          icon={isAnalyzing ? Loader2 : Search}
          onClick={handleAnalyze}
          disabled={!project?.path || isAnalyzing}
          className={isAnalyzing ? 'animate-spin' : ''}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {!project && (
        <Card>
          <div className="text-center py-8">
            <Database size={48} className="text-vscode-text-muted mx-auto mb-4" />
            <p className="text-vscode-text-muted">
              Upload a project to detect databases and backend technologies
            </p>
          </div>
        </Card>
      )}

      {project && analysisResult && (
        <>
          {/* Project Type */}
          <Card>
            <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              Project Type
            </h4>
            <div className="text-lg font-medium text-vscode-accent">
              {analysisResult.projectType}
            </div>
          </Card>

          {/* Databases */}
          <Card>
            <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
              <Database size={16} className="text-yellow-400" />
              Databases ({databases.length})
            </h4>
            {databases.length === 0 ? (
              <div className="text-vscode-text-muted text-sm">
                No databases detected
              </div>
            ) : (
              <div className="space-y-2">
                {databases.map((db, index) => {
                  const Icon = getIcon(db.type, db.category);
                  const colorClass = getColor(db.type, db.category);
                  return (
                    <motion.div
                      key={`${db.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded bg-vscode-hover"
                    >
                      <Icon size={20} className={colorClass} />
                      <div className="flex-1">
                        <div className="text-vscode-text font-medium">
                          {db.name}
                        </div>
                        <div className="text-vscode-text-muted text-xs">
                          {db.version !== 'detected' ? `v${db.version}` : 'detected'}
                          {db.file && ` • ${db.file}`}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Backend Frameworks */}
          <Card>
            <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
              <Server size={16} className="text-green-400" />
              Backend Frameworks ({frameworks.length})
            </h4>
            {frameworks.length === 0 ? (
              <div className="text-vscode-text-muted text-sm">
                No backend frameworks detected
              </div>
            ) : (
              <div className="space-y-2">
                {frameworks.map((framework, index) => {
                  const Icon = getIcon(framework.type, framework.category);
                  const colorClass = getColor(framework.type, framework.category);
                  return (
                    <motion.div
                      key={`${framework.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded bg-vscode-hover"
                    >
                      <Icon size={20} className={colorClass} />
                      <div className="flex-1">
                        <div className="text-vscode-text font-medium">
                          {framework.name}
                        </div>
                        <div className="text-vscode-text-muted text-xs">
                          {framework.version !== 'detected' ? `v${framework.version}` : 'detected'}
                          {framework.file && ` • ${framework.file}`}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* API Endpoints */}
          {apis.length > 0 && (
            <Card>
              <h4 className="text-vscode-text font-medium mb-3 flex items-center gap-2">
                <Globe size={16} className="text-blue-400" />
                API Structure ({apis.length})
              </h4>
              <div className="space-y-2">
                {apis.map((api, index) => {
                  const Icon = getIcon(api.type, api.category);
                  const colorClass = getColor(api.type, api.category);
                  return (
                    <motion.div
                      key={`${api.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded bg-vscode-hover"
                    >
                      <Icon size={20} className={colorClass} />
                      <div className="flex-1">
                        <div className="text-vscode-text font-medium">
                          {api.name}
                        </div>
                        <div className="text-vscode-text-muted text-xs">
                          {api.file && `Found in: ${api.file}`}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}

      {project && !analysisResult && !isAnalyzing && (
        <Card>
          <div className="text-center py-8">
            <Search size={48} className="text-vscode-text-muted mx-auto mb-4" />
            <p className="text-vscode-text-muted mb-4">
              Click "Analyze" to detect databases and backend technologies
            </p>
            <Button
              variant="primary"
              icon={Search}
              onClick={handleAnalyze}
            >
              Start Analysis
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DatabasePanel;