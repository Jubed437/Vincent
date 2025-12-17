# Vincent Terminal Setup Instructions

## Overview
Vincent uses a simple IPC-based terminal system that provides:
- Command execution through Electron IPC
- Terminal output display in a simple text interface
- Project start/stop functionality
- Command history

## Architecture

### Backend Architecture

1. **TerminalManager** (`backend/modules/terminalManager.js`)
   - Manages terminal output history
   - Executes commands using `child_process.spawn()`
   - Provides logging utilities
   - Handles project start/stop operations

2. **IPC Communication**
   - Uses Electron's IPC system for communication
   - Commands sent from frontend to backend
   - Results returned synchronously

### Frontend Architecture

1. **TerminalPanel** (`src/components/TerminalPanel.jsx`)
   - Simple text-based terminal interface
   - Command input field
   - Scrollable output display
   - Project control buttons

## Usage

### Starting a Project

1. Upload a project folder
2. Click the "Start" button in the terminal header
3. The terminal will automatically detect and run:
   - `npm run dev` (if available)
   - `npm start` (fallback)
   - `npm run serve` (alternative)

### Terminal Features

- **Command Input**: Type commands in the input field
- **Output Display**: View command results in scrollable text area
- **Project Control**: Start/Stop buttons for project management
- **Clear**: Clear terminal output
- **Command History**: Stored in app state

## File Structure

```
Vincent/
├── backend/modules/
│   └── terminalManager.js     # Terminal management and command execution
├── src/components/
│   └── TerminalPanel.jsx      # Simple terminal UI component
└── package.json              # Dependencies (no WebSocket/xterm deps)
```

## Development Notes

- Terminal uses simple text display instead of xterm.js
- Commands executed synchronously through IPC
- No WebSocket server required
- Terminal state managed in Zustand store
- Output history limited to 1000 entries

## Troubleshooting

### Commands Not Executing

1. Check if project path is set correctly
2. Verify Electron IPC handlers are registered
3. Check terminal output for error messages

### Terminal Not Displaying Output

1. Verify terminal output is being added to store
2. Check React component state updates
3. Ensure terminal ref is properly set

## Future Enhancements

- Command auto-completion
- Better error handling
- Terminal themes
- Export terminal logs