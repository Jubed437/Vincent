import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Project State
  project: null,
  projectFiles: [],
  selectedFile: null,
  techStack: [],
  dependencies: [],
  
  // UI State
  sidebarCollapsed: false,
  activePanel: 'terminal', // 'terminal' | 'logs'
  activeView: 'explorer', // 'explorer' | 'summary' | 'dependencies' | 'actions'
  
  // Terminal State
  terminalOutput: [],
  isProjectRunning: false,
  
  // Modal State
  showUploadModal: false,
  
  // Actions
  setProject: (project) => set({ project }),
  
  setProjectFiles: (files) => set({ projectFiles: files }),
  
  setSelectedFile: (file) => set({ selectedFile: file }),
  
  setTechStack: (stack) => set({ techStack: stack }),
  
  setDependencies: (deps) => set({ dependencies: deps }),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  setActiveView: (view) => set({ activeView: view }),
  
  addTerminalOutput: (output) => set((state) => ({
    terminalOutput: [...state.terminalOutput, {
      id: Date.now(),
      text: output,
      timestamp: new Date().toLocaleTimeString()
    }]
  })),
  
  clearTerminalOutput: () => set({ terminalOutput: [] }),
  
  setProjectRunning: (running) => set({ isProjectRunning: running }),
  
  setShowUploadModal: (show) => set({ showUploadModal: show }),
  
  // Mock data initialization
  initializeMockData: () => set({
    projectFiles: [
      { id: 1, name: 'package.json', type: 'file', path: '/package.json', size: '1.2KB' },
      { id: 2, name: 'src', type: 'folder', path: '/src', children: [
        { id: 3, name: 'index.js', type: 'file', path: '/src/index.js', size: '856B' },
        { id: 4, name: 'components', type: 'folder', path: '/src/components', children: [
          { id: 5, name: 'App.js', type: 'file', path: '/src/components/App.js', size: '2.1KB' }
        ]}
      ]},
      { id: 6, name: 'README.md', type: 'file', path: '/README.md', size: '3.4KB' }
    ],
    techStack: [
      { name: 'React', version: '18.2.0', type: 'framework' },
      { name: 'Express', version: '4.18.2', type: 'backend' },
      { name: 'MongoDB', version: '5.0', type: 'database' }
    ],
    dependencies: [
      { name: 'react', version: '18.2.0', status: 'installed', type: 'production' },
      { name: 'express', version: '4.18.2', status: 'installed', type: 'production' },
      { name: 'mongoose', version: '7.4.0', status: 'pending', type: 'production' },
      { name: 'nodemon', version: '3.0.1', status: 'installed', type: 'development' }
    ]
  })
}));