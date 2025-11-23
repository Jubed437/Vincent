import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import electronAPI from '../utils/electronAPI';

const AppInitializer = ({ children }) => {
  const { addTerminalOutput, setTerminalHistory, setProjectRunning } = useAppStore();

  useEffect(() => {
    // Set up terminal output listener
    const removeListener = electronAPI.onTerminalOutput((output) => {
      addTerminalOutput(output.text);
    });

    // Load terminal history on startup
    const loadHistory = async () => {
      try {
        const history = await electronAPI.getTerminalHistory();
        if (history.success && history.data) {
          setTerminalHistory(history.data);
        }
      } catch (error) {
        console.error('Failed to load terminal history:', error);
      }
    };

    // Check project status on startup
    const checkProjectStatus = async () => {
      try {
        const status = await electronAPI.getProjectStatus();
        if (status.success && status.data) {
          setProjectRunning(status.data.isRunning);
        }
      } catch (error) {
        console.error('Failed to check project status:', error);
      }
    };

    loadHistory();
    checkProjectStatus();

    // Welcome message
    addTerminalOutput('🎉 Vincent AI Project Analyzer started');
    addTerminalOutput('📁 Upload a project to begin analysis');

    // Cleanup listener on unmount
    return () => {
      if (removeListener) {
        removeListener();
      }
    };
  }, [addTerminalOutput, setTerminalHistory, setProjectRunning]);

  return children;
};

export default AppInitializer;