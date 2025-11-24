# Terminal Setup for Vincent

Vincent uses `node-pty` to provide a real interactive terminal like VS Code. This requires native compilation on Windows.

## Windows Setup

### Option 1: Install Visual Studio Build Tools (Recommended)

1. Download and install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. During installation, select "Desktop development with C++"
3. After installation, run:
   ```bash
   npm install
   ```

### Option 2: Use windows-build-tools (Automated)

Run PowerShell as Administrator and execute:
```powershell
npm install --global --production windows-build-tools
```

Then run:
```bash
npm install
```

### Option 3: Use Prebuilt Binaries

If you can't install build tools, Vincent will fall back to a limited terminal mode automatically.

## Mac/Linux Setup

No additional setup required. Just run:
```bash
npm install
```

## Verify Installation

After installation, start Vincent:
```bash
npm start
```

The terminal should show:
- ✅ `PTY Terminal created` - Full interactive terminal (PowerShell on Windows)
- ⚠️ `Fallback terminal created` - Limited functionality (if node-pty failed to install)

## Features

With node-pty installed, you get:
- ✅ Real interactive PowerShell/Bash terminal
- ✅ Full command history with arrow keys
- ✅ Tab completion
- ✅ Color output
- ✅ Interactive prompts (like npm init)
- ✅ Long-running processes (like dev servers)

Without node-pty:
- ⚠️ Basic command execution only
- ⚠️ No interactive features
- ⚠️ Limited to one command at a time
