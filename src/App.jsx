import { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import AppInitializer from './components/AppInitializer';
import './styles/index.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simple initialization check
    try {
      // Check if we're in Electron environment
      const isElectron = typeof window !== 'undefined' && window.electronAPI;
      console.log('Electron environment:', isElectron);
      
      // Simulate brief loading time to ensure everything is ready
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (err) {
      console.error('App initialization error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div className="h-screen bg-vscode-bg text-vscode-text flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Initialization Error</h1>
          <p className="text-vscode-text-muted mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-vscode-accent text-white rounded hover:bg-blue-600"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-vscode-bg text-vscode-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vscode-accent mb-4 mx-auto"></div>
          <p className="text-vscode-text-muted">Loading Vincent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <AppInitializer>
        <AppLayout />
      </AppInitializer>
    </div>
  );
}

export default App;