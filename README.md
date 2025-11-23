# Vincent - AI-Powered JavaScript Project Analyzer

Vincent is a desktop application built with Electron + React + TailwindCSS that helps developers upload JavaScript-based projects and automatically analyzes their structure, installs dependencies, and provides AI-powered insights.

## Features

### 🎨 VS Code-like Interface
- Dark theme with familiar VS Code styling
- Collapsible sidebar with multiple panels
- Integrated terminal and logs
- Smooth animations with Framer Motion

### 📁 Project Management
- Drag & drop project upload
- File explorer with folder navigation
- Real-time file viewing
- Project structure analysis

### 🤖 AI-Powered Analysis
- Automatic tech stack detection
- Dependency management
- Code quality analysis
- Security auditing
- Performance optimization suggestions

### 🛠️ Developer Tools
- Integrated terminal
- Real-time logs
- Project statistics
- Dependency visualization

## Tech Stack

- **Frontend**: React 18, TailwindCSS, Framer Motion
- **Desktop**: Electron
- **State Management**: Zustand
- **Icons**: Lucide React
- **Styling**: Custom VS Code theme

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd vincent
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm start
\`\`\`

4. In another terminal, start Electron:
\`\`\`bash
npm run electron-dev
\`\`\`

### Building for Production

1. Build the React app:
\`\`\`bash
npm run build
\`\`\`

2. Package the Electron app:
\`\`\`bash
npm run dist
\`\`\`

## Project Structure

\`\`\`
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx      # Main application layout
│   │   ├── Header.jsx         # Top header with actions
│   │   ├── Sidebar.jsx        # Collapsible sidebar
│   │   └── BottomPanel.jsx    # Terminal and logs panel
│   ├── panels/
│   │   ├── FileExplorer.jsx   # File tree navigation
│   │   ├── ProjectSummary.jsx # Project statistics
│   │   ├── DependenciesPanel.jsx # Dependency management
│   │   └── AIActionsPanel.jsx # AI-powered features
│   ├── ui/
│   │   ├── Button.jsx         # Reusable button component
│   │   ├── Card.jsx           # Card container component
│   │   ├── Modal.jsx          # Modal dialog component
│   │   └── Tabs.jsx           # Tab navigation component
│   ├── FileViewer.jsx         # File content viewer
│   └── UploadModal.jsx        # Project upload dialog
├── store/
│   └── appStore.js            # Zustand global state
├── styles/
│   └── index.css              # Global styles and Tailwind
└── App.js                     # Main React component
\`\`\`

## Key Components

### AppLayout
Main application shell that coordinates all layout components with responsive behavior.

### Sidebar
Collapsible sidebar with four main panels:
- **File Explorer**: Navigate project files and folders
- **Project Summary**: View project statistics and analysis progress  
- **Dependencies**: Manage project dependencies
- **AI Actions**: Access AI-powered analysis tools

### Header
Top navigation bar with project action buttons:
- Upload Project
- Detect Tech Stack  
- Install Dependencies
- Start/Stop Project

### Bottom Panel
Expandable terminal and logs panel for real-time output.

## State Management

The application uses Zustand for state management with the following key stores:

- **Project State**: Current project, files, tech stack
- **UI State**: Sidebar collapse, active panels, modals
- **Terminal State**: Output logs, project running status

## Styling

The application uses a custom VS Code dark theme implemented with TailwindCSS:

- **Background**: `#1e1e1e`
- **Sidebar**: `#252526` 
- **Panel**: `#2d2d30`
- **Border**: `#3e3e42`
- **Text**: `#cccccc`
- **Accent**: `#007acc`

## Development Notes

### Mock Data
The application includes mock data for development and testing. Remove the `initializeMockData()` call in production.

### File Operations
File upload and project analysis are currently simulated. Integrate with actual file system APIs for production use.

### AI Integration
AI features are placeholder implementations. Connect to actual AI services for production functionality.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.