const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class EditorManager {
  constructor() {
    this.editors = [];
  }

  async detectEditors() {
    const editors = [];
    
    // VS Code detection
    const vscodeLocations = [
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
      'C:\\Program Files\\Microsoft VS Code\\Code.exe',
      'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe'
    ];

    for (const location of vscodeLocations) {
      const expandedPath = location.replace('%USERNAME%', process.env.USERNAME);
      if (fs.existsSync(expandedPath)) {
        editors.push({
          name: 'Visual Studio Code',
          path: expandedPath,
          command: 'code',
          args: ['{projectPath}']
        });
        break;
      }
    }

    // Notepad++ detection
    const notepadLocations = [
      'C:\\Program Files\\Notepad++\\notepad++.exe',
      'C:\\Program Files (x86)\\Notepad++\\notepad++.exe'
    ];

    for (const location of notepadLocations) {
      if (fs.existsSync(location)) {
        editors.push({
          name: 'Notepad++',
          path: location,
          command: location,
          args: ['{projectPath}']
        });
        break;
      }
    }

    this.editors = editors;
    return { success: true, data: editors };
  }

  async openEditor(editorPath, projectPath) {
    try {
      const { exec } = require('child_process');
      
      if (editorPath === 'code') {
        exec(`code "${projectPath}"`, (error) => {
          if (error) {
            console.log('Code command failed, trying direct path');
          }
        });
        return { success: true, message: 'Opening VS Code...' };
      }

      exec(`"${editorPath}" "${projectPath}"`, (error) => {
        if (error) {
          console.error('Editor open error:', error.message);
        }
      });
      
      return { success: true, message: 'Opening editor...' };
    } catch (error) {
      console.error('Editor manager error:', error);
      return { success: false, message: error.message };
    }
  }

  getEditors() {
    return { success: true, data: this.editors };
  }
}

module.exports = new EditorManager();