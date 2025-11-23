import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Project State
  project: null,
  projectFiles: [],
  selectedFile: null,
  selectedFilePath: null,
  selectedFileContent: '',
  isLoadingFile: false,
  techStack: [],
  dependencies: [],
  projectMetadata: null,
  isLoading: false,
  
  // UI State
  sidebarCollapsed: false,
  activePanel: 'terminal',
  activeView: 'explorer',
  
  // Terminal State
  terminalOutput: [],
  isProjectRunning: false,
  
  // Modal State
  showUploadModal: false,
  
  // Actions
  setProject: (project) => set({ project }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  loadProject: async (projectData) => {
    console.log('store: loading project', projectData);
    const data = projectData.data || projectData;
    console.log('store: extracted data', data);
    
    const fileTree = data.tree || [];
    const { countFolders } = get();
    
    set({ 
      project: {
        name: data.project?.name || data.rootPath?.split('\\').pop() || 'Unknown Project',
        path: data.project?.path || data.rootPath,
        type: data.projectType || 'JavaScript Project'
      },
      projectFiles: fileTree,
      techStack: data.techStack || [],
      dependencies: [
        ...(data.dependencies?.production || []).map(d => ({ ...d, type: 'production' })),
        ...(data.dependencies?.development || []).map(d => ({ ...d, type: 'development' }))
      ],
      projectMetadata: {
        totalFiles: data.metadata?.totalFiles || get().countFiles(fileTree),
        totalFolders: data.metadata?.totalFolders || countFolders(fileTree),
        packageJson: data.packageJson,
        lastScanned: data.metadata?.lastScanned || new Date().toISOString()
      }
    });
  },

  setScanResult: (scanResult) => {
    console.log('store: setting scan result', scanResult);
    if (scanResult.success && scanResult.data) {
      set({
        projectFiles: scanResult.data.tree || [],
        project: {
          path: scanResult.data.rootPath,
          name: scanResult.data.rootPath.split('\\').pop(),
          type: 'JavaScript Project'
        },
        projectMetadata: {
          totalFiles: scanResult.data.metadata?.totalFiles || 0,
          totalFolders: get().countFolders(scanResult.data.tree || []),
          lastScanned: scanResult.data.metadata?.lastScanned
        }
      });
    }
  },
  
  setProjectFiles: (files) => set({ projectFiles: files }),
  setSelectedFile: (file) => set({ selectedFile: file, selectedFileContent: '', selectedFilePath: null }),
  setFileContent: (path, content) => set({ selectedFilePath: path, selectedFileContent: content }),
  setLoadingFile: (loading) => set({ isLoadingFile: loading }),
  setTechStack: (stack) => set({ techStack: stack }),
  setDependencies: (deps) => set({ dependencies: deps }),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setActiveView: (view) => set({ activeView: view }),
  
  addTerminalOutput: (output) => set((state) => ({
    terminalOutput: [...state.terminalOutput, {
      id: `terminal-${state.terminalOutput.length}-${Date.now()}`,
      text: output,
      timestamp: new Date().toLocaleTimeString()
    }]
  })),
  
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
  
  // Helper functions
  countFolders: (files) => {
    let count = 0;
    const traverse = (items) => {
      items.forEach(item => {
        if (item.type === 'folder') {
          count++;
          if (item.children) traverse(item.children);
        }
      });
    };
    traverse(files);
    return count;
  },
  
  countFiles: (files) => {
    let count = 0;
    const traverse = (items) => {
      items.forEach(item => {
        if (item.type === 'file') {
          count++;
        } else if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(files);
    return count;
  },
  
  getProjectScripts: () => {
    const state = get();
    return state.projectMetadata?.packageJson?.scripts || {};
  },
  
  hasProject: () => {
    const state = get();
    return !!state.project?.path;
  }
}));