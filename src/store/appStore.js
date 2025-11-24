import { create } from 'zustand';

// Load command history from localStorage
const loadCommandHistory = () => {
  try {
    const saved = localStorage.getItem('commandHistory');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load command history:', error);
    return [];
  }
};

// Save command history to localStorage
const saveCommandHistory = (history) => {
  try {
    localStorage.setItem('commandHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save command history:', error);
  }
};

export const useAppStore = create((set, get) => ({
  // Project State
  project: null,
  projectFiles: [],
  selectedFile: null,
  techStack: [],
  dependencies: [],
  npmScripts: [],
  
  // UI State
  sidebarCollapsed: false,
  activePanel: 'terminal', // 'terminal' | 'logs'
  activeView: 'explorer', // 'explorer' | 'summary' | 'dependencies' | 'actions'
  
  // Terminal State (kept for compatibility)
  terminalOutput: [],
  isProjectRunning: false,
  commandHistory: loadCommandHistory(),
  historyIndex: -1,
  
  // Modal State
  showUploadModal: false,
  
  // Actions
  setProject: (project) => set({ project }),
  
  loadProject: async (projectData) => {
    // Handle different response formats with fallback logic
    const structure = projectData.data?.structure || 
                     projectData.project?.structure || 
                     projectData.structure || 
                     [];
    
    const project = projectData.data?.project || 
                   projectData.project || 
                   null;
    
    const analysis = projectData.data?.analysis || 
                    projectData.analysis || 
                    {};
    
    // Extract npm scripts from package.json
    const packageJson = projectData.data?.packageJson || analysis.packageJson;
    const scripts = packageJson?.scripts || {};
    const npmScripts = Object.entries(scripts).map(([name, command]) => ({
      name,
      command,
      running: false
    }));
    
    set({ 
      project: project,
      projectFiles: structure,
      techStack: analysis.techStack || [],
      dependencies: analysis.dependencies?.production || [],
      npmScripts: npmScripts
    });
  },
  
  setProjectFiles: (files) => set({ projectFiles: files }),
  
  setSelectedFile: (file) => set({ selectedFile: file }),
  
  setTechStack: (stack) => set({ techStack: stack }),
  
  setDependencies: (deps) => set({ dependencies: deps }),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  setActiveView: (view) => set({ activeView: view }),
  
  addTerminalOutput: (output) => set((state) => {
    const newOutput = {
      id: Date.now() + Math.random(),
      text: output,
      timestamp: new Date().toLocaleTimeString()
    };
    const newTerminalOutput = [...state.terminalOutput, newOutput];
    // Limit to 1000 lines
    return {
      terminalOutput: newTerminalOutput.length > 1000 ? newTerminalOutput.slice(-1000) : newTerminalOutput
    };
  }),
  
  clearTerminalOutput: () => set({ terminalOutput: [] }),
  
  setTerminalHistory: (history) => set({ 
    terminalOutput: history.map(item => ({
      id: item.id,
      text: item.text,
      timestamp: item.timestamp
    }))
  }),
  
  setProjectRunning: (running) => set({ isProjectRunning: running }),
  
  setShowUploadModal: (show) => set({ showUploadModal: show }),
  
  // Command History
  addCommandToHistory: (command) => set((state) => {
    const newHistory = [...state.commandHistory, command];
    // Limit to 100 entries
    const limitedHistory = newHistory.length > 100 ? newHistory.slice(-100) : newHistory;
    
    // Save to localStorage
    saveCommandHistory(limitedHistory);
    
    return {
      commandHistory: limitedHistory,
      historyIndex: -1 // Reset index after adding
    };
  }),
  
  navigateHistory: (direction) => set((state) => {
    if (state.commandHistory.length === 0) return state;
    
    let newIndex = state.historyIndex;
    
    if (direction === 'up') {
      // Move backward in history (older commands)
      newIndex = newIndex === -1 
        ? state.commandHistory.length - 1 
        : Math.max(0, newIndex - 1);
    } else if (direction === 'down') {
      // Move forward in history (newer commands)
      if (newIndex === -1) {
        return state; // Already at the end
      }
      
      newIndex = newIndex + 1;
      
      // If we go past the end, reset to -1
      if (newIndex >= state.commandHistory.length) {
        newIndex = -1;
      }
    }
    
    return { historyIndex: newIndex };
  }),
  
  getHistoryCommand: () => {
    const state = get();
    if (state.historyIndex === -1 || state.commandHistory.length === 0) {
      return '';
    }
    return state.commandHistory[state.historyIndex] || '';
  },
  
  // NPM Scripts
  setNpmScripts: (scripts) => set({ npmScripts: scripts }),
  
  setScriptRunning: (scriptName, running) => set((state) => ({
    npmScripts: state.npmScripts.map(script =>
      script.name === scriptName ? { ...script, running } : script
    )
  })),
  
  // Clear all data
  clearProject: () => set({
    project: null,
    projectFiles: [],
    selectedFile: null,
    techStack: [],
    dependencies: [],
    npmScripts: []
  })
}));