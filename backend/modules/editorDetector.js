const fs = require('fs');
const path = require('path');
const os = require('os');

class EditorDetector {
  constructor() {
    this.editors = [
      {
        name: 'VS Code',
        executable: 'Code.exe',
        paths: [
          path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Microsoft VS Code', 'Code.exe'),
          'C:\Program Files\Microsoft VS Code\Code.exe',
          'C:\Program Files (x86)\Microsoft VS Code\Code.exe'
        ]
      },
      {
        name: 'VS Code Insiders',
        executable: 'Code - Insiders.exe',
        paths: [
          path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Microsoft VS Code Insiders', 'Code - Insiders.exe'),
          'C:\Program Files\Microsoft VS Code Insiders\Code - Insiders.exe'
        ]
      },
      {
        name: 'WebStorm',
        executable: 'webstorm64.exe',
        paths: [
          path.join(os.homedir(), 'AppData', 'Local', 'JetBrains', 'Toolbox', 'apps', 'WebStorm'),
          'C:\Program Files\JetBrains\WebStorm'
        ]
      },
      {
        name: 'IntelliJ IDEA',
        executable: 'idea64.exe',
        paths: [
          path.join(os.homedir(), 'AppData', 'Local', 'JetBrains', 'Toolbox', 'apps', 'IDEA-U'),
          'C:\Program Files\JetBrains\IntelliJ IDEA'
        ]
      },
      {
        name: 'Sublime Text',
        executable: 'sublime_text.exe',
        paths: [
          'C:\Program Files\Sublime Text\sublime_text.exe',
          'C:\Program Files (x86)\Sublime Text\sublime_text.exe'
        ]
      },
      {
        name: 'Notepad++',
        executable: 'notepad++.exe',
        paths: [
          'C:\Program Files\Notepad++\notepad++.exe',
          'C:\Program Files (x86)\Notepad++\notepad++.exe'
        ]
      }
    ];
  }

  async detectEditors() {
    const installedEditors = [];
    console.log('Detecting editors...');

    for (const editor of this.editors) {
      try {
        const editorPath = await this.findEditor(editor);
        if (editorPath) {
          console.log(`Found ${editor.name} at: ${editorPath}`);
          installedEditors.push({
            name: editor.name,
            path: editorPath
          });
        }
      } catch (error) {
        console.error(`Error detecting ${editor.name}:`, error);
      }
    }

    console.log(`Total editors found: ${installedEditors.length}`);
    return installedEditors;
  }

  async findEditor(editor) {
    // Check predefined paths
    for (const editorPath of editor.paths) {
      if (await this.fileExists(editorPath)) {
        return editorPath;
      }
    }

    // For JetBrains editors, search in Toolbox structure
    if (editor.name.includes('WebStorm') || editor.name.includes('IntelliJ')) {
      const toolboxPath = await this.findJetBrainsEditor(editor);
      if (toolboxPath) return toolboxPath;
    }

    return null;
  }

  async findJetBrainsEditor(editor) {
    const toolboxBase = path.join(os.homedir(), 'AppData', 'Local', 'JetBrains', 'Toolbox', 'apps');
    
    try {
      const appName = editor.name.includes('WebStorm') ? 'WebStorm' : 'IDEA-U';
      const appPath = path.join(toolboxBase, appName);
      
      if (await this.fileExists(appPath)) {
        const versions = await fs.promises.readdir(appPath);
        for (const version of versions) {
          const binPath = path.join(appPath, version, 'bin', editor.executable);
          if (await this.fileExists(binPath)) {
            return binPath;
          }
        }
      }
    } catch (error) {
      // Ignore errors and continue
    }

    return null;
  }

  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = EditorDetector;