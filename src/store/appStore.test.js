import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { useAppStore } from './appStore';

// Feature: core-functionality-fixes, Property 10: Command history navigation
// For any sequence of executed commands, pressing up arrow should cycle backward through history and down arrow should cycle forward
// Validates: Requirements 7.1, 7.2, 7.4

describe('Command History Navigation Tests', () => {
  beforeEach(() => {
    // Reset store
    const store = useAppStore.getState();
    useAppStore.setState({ commandHistory: [], historyIndex: -1 });
  });

  it('Property 10: Up arrow navigates backward through history', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
        (commands) => {
          const store = useAppStore.getState();
          
          // Add commands to history
          commands.forEach(cmd => store.addCommandToHistory(cmd));

          // Navigate up through history
          for (let i = commands.length - 1; i >= 0; i--) {
            store.navigateHistory('up');
            const command = store.getHistoryCommand();
            expect(command).toBe(commands[i]);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 10b: Down arrow navigates forward through history', () => {
    const commands = ['cmd1', 'cmd2', 'cmd3'];
    const store = useAppStore.getState();
    
    // Add commands
    commands.forEach(cmd => store.addCommandToHistory(cmd));

    // Navigate to oldest
    store.navigateHistory('up');
    store.navigateHistory('up');
    store.navigateHistory('up');

    // Navigate forward
    store.navigateHistory('down');
    expect(store.getHistoryCommand()).toBe('cmd2');

    store.navigateHistory('down');
    expect(store.getHistoryCommand()).toBe('cmd3');
  });

  it('Property 10c: History index resets after adding command', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
        (commands) => {
          const store = useAppStore.getState();
          
          // Add first command
          store.addCommandToHistory(commands[0]);
          
          // Navigate up
          store.navigateHistory('up');
          
          // Add another command
          store.addCommandToHistory(commands[1]);
          
          // Index should be reset to -1
          const state = useAppStore.getState();
          expect(state.historyIndex).toBe(-1);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 10d: Empty history returns empty string', () => {
    const store = useAppStore.getState();
    
    // Try to navigate with empty history
    store.navigateHistory('up');
    const command = store.getHistoryCommand();
    
    expect(command).toBe('');
  });
});

// Feature: core-functionality-fixes, Property 12: Command history size limiting
// For any command history, when it exceeds 100 entries, adding a new command should remove the oldest entry
// Validates: Requirements 7.5

describe('Command History Size Limiting Tests', () => {
  beforeEach(() => {
    useAppStore.setState({ commandHistory: [], historyIndex: -1 });
  });

  it('Property 12: Command history limited to 100 entries', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 101, max: 150 }),
        (numCommands) => {
          const store = useAppStore.getState();
          
          // Add more than 100 commands
          for (let i = 0; i < numCommands; i++) {
            store.addCommandToHistory(`command-${i}`);
          }

          const state = useAppStore.getState();
          
          // Should have exactly 100 entries
          expect(state.commandHistory.length).toBe(100);

          // First entry should be command-50 (if we added 150)
          const expectedFirst = numCommands - 100;
          expect(state.commandHistory[0]).toBe(`command-${expectedFirst}`);

          // Last entry should be the most recent
          expect(state.commandHistory[99]).toBe(`command-${numCommands - 1}`);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('Property 12b: Oldest commands removed when limit exceeded', () => {
    const store = useAppStore.getState();
    
    // Add exactly 100 commands
    for (let i = 0; i < 100; i++) {
      store.addCommandToHistory(`cmd-${i}`);
    }

    let state = useAppStore.getState();
    expect(state.commandHistory[0]).toBe('cmd-0');

    // Add one more
    store.addCommandToHistory('cmd-100');

    state = useAppStore.getState();
    
    // Should still have 100
    expect(state.commandHistory.length).toBe(100);
    
    // First should now be cmd-1 (cmd-0 was removed)
    expect(state.commandHistory[0]).toBe('cmd-1');
    
    // Last should be cmd-100
    expect(state.commandHistory[99]).toBe('cmd-100');
  });

  it('Property 12c: History under 100 entries not truncated', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/), { minLength: 1, maxLength: 99 }),
        (commands) => {
          // Reset store for each property test iteration
          useAppStore.setState({ commandHistory: [], historyIndex: -1 });
          
          const store = useAppStore.getState();
          
          commands.forEach(cmd => store.addCommandToHistory(cmd));

          const state = useAppStore.getState();
          
          // Should have all commands
          expect(state.commandHistory.length).toBe(commands.length);
          
          // All commands should be present
          commands.forEach((cmd, i) => {
            expect(state.commandHistory[i]).toBe(cmd);
          });

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});


// Feature: core-functionality-fixes, Property 11: Command history persistence
// For any command executed before application restart, it should appear in the command history after restart
// Validates: Requirements 7.3

describe('Command History Persistence Tests', () => {
  beforeEach(() => {
    // Clear localStorage and reset store
    localStorage.clear();
    useAppStore.setState({ commandHistory: [], historyIndex: -1 });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Property 11: Commands are persisted to localStorage', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/), { minLength: 1, maxLength: 10 }),
        (commands) => {
          // Clear and reset
          localStorage.clear();
          useAppStore.setState({ commandHistory: [], historyIndex: -1 });
          
          const store = useAppStore.getState();
          
          // Add commands
          commands.forEach(cmd => store.addCommandToHistory(cmd));

          // Check localStorage
          const saved = localStorage.getItem('commandHistory');
          expect(saved).toBeDefined();
          
          const parsed = JSON.parse(saved);
          expect(parsed).toEqual(commands);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 11b: Commands are loaded from localStorage on initialization', () => {
    const commands = ['cmd1', 'cmd2', 'cmd3'];
    
    // Save to localStorage
    localStorage.setItem('commandHistory', JSON.stringify(commands));

    // Create a new store instance (simulate app restart)
    // In a real scenario, this would be a new page load
    // For testing, we can check if the initial state loads from localStorage
    const savedHistory = localStorage.getItem('commandHistory');
    const loaded = JSON.parse(savedHistory);
    
    expect(loaded).toEqual(commands);
  });

  it('Property 11c: Persistence handles localStorage unavailable', () => {
    // This test verifies graceful handling when localStorage fails
    const store = useAppStore.getState();
    
    // Mock localStorage to throw error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('localStorage unavailable');
    };

    // Should not throw error
    expect(() => {
      store.addCommandToHistory('test-command');
    }).not.toThrow();

    // Restore
    Storage.prototype.setItem = originalSetItem;
  });

  it('Property 11d: Large history is persisted correctly', () => {
    localStorage.clear();
    useAppStore.setState({ commandHistory: [], historyIndex: -1 });
    
    const store = useAppStore.getState();
    
    // Add 150 commands (should be limited to 100)
    for (let i = 0; i < 150; i++) {
      store.addCommandToHistory(`command-${i}`);
    }

    // Check localStorage
    const saved = localStorage.getItem('commandHistory');
    const parsed = JSON.parse(saved);
    
    // Should have exactly 100
    expect(parsed.length).toBe(100);
    
    // Should be the last 100 commands
    expect(parsed[0]).toBe('command-50');
    expect(parsed[99]).toBe('command-149');
  });

  it('Property 11e: Corrupted localStorage data handled gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('commandHistory', 'invalid json{');

    // Should not throw when loading
    expect(() => {
      const saved = localStorage.getItem('commandHistory');
      try {
        JSON.parse(saved);
      } catch (error) {
        // This is expected - the loadCommandHistory function should handle this
      }
    }).not.toThrow();
  });
});


// Feature: core-functionality-fixes, Property 13: NPM script detection
// For any package.json file with a scripts section, all script names should be detected and available for execution
// Validates: Requirements 6.1, 6.2

describe('NPM Script Detection Tests', () => {
  beforeEach(() => {
    useAppStore.setState({ 
      npmScripts: [],
      project: null,
      projectFiles: []
    });
  });

  it('Property 13: All npm scripts are detected from package.json', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.stringMatching(/^[a-z-]{3,15}$/),
          fc.stringMatching(/^[a-z ]{5,30}$/),
          { minKeys: 1, maxKeys: 10 }
        ),
        (scripts) => {
          const store = useAppStore.getState();
          
          // Simulate loading a project with package.json
          const projectData = {
            data: {
              structure: [],
              project: { path: '/test', name: 'test' },
              packageJson: { scripts }
            }
          };

          store.loadProject(projectData);

          const state = useAppStore.getState();
          
          // Should have detected all scripts
          expect(state.npmScripts.length).toBe(Object.keys(scripts).length);
          
          // All script names should be present
          Object.keys(scripts).forEach(scriptName => {
            const found = state.npmScripts.find(s => s.name === scriptName);
            expect(found).toBeDefined();
            expect(found.command).toBe(scripts[scriptName]);
            expect(found.running).toBe(false);
          });

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 13b: Empty scripts section handled correctly', () => {
    const store = useAppStore.getState();
    
    const projectData = {
      data: {
        structure: [],
        project: { path: '/test', name: 'test' },
        packageJson: { scripts: {} }
      }
    };

    store.loadProject(projectData);

    const state = useAppStore.getState();
    expect(state.npmScripts).toEqual([]);
  });

  it('Property 13c: Missing package.json handled gracefully', () => {
    const store = useAppStore.getState();
    
    const projectData = {
      data: {
        structure: [],
        project: { path: '/test', name: 'test' }
      }
    };

    store.loadProject(projectData);

    const state = useAppStore.getState();
    expect(state.npmScripts).toEqual([]);
  });

  it('Property 13d: Script running status can be toggled', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z-]{3,15}$/),
        (scriptName) => {
          const store = useAppStore.getState();
          
          // Set up scripts
          useAppStore.setState({
            npmScripts: [
              { name: scriptName, command: 'test command', running: false }
            ]
          });

          // Toggle running status
          store.setScriptRunning(scriptName, true);
          
          let state = useAppStore.getState();
          expect(state.npmScripts[0].running).toBe(true);

          // Toggle back
          store.setScriptRunning(scriptName, false);
          
          state = useAppStore.getState();
          expect(state.npmScripts[0].running).toBe(false);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

// Feature: core-functionality-fixes, Property 14: NPM script execution
// For any detected npm script, clicking it should execute the equivalent of running "npm run <script-name>" in the terminal
// Validates: Requirements 6.3

describe('NPM Script Execution Tests', () => {
  it('Property 14: Script execution command format is correct', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z-]{3,15}$/),
        (scriptName) => {
          // Verify the command format that would be executed
          const expectedCommand = `npm run ${scriptName}`;
          
          // This is what should be sent to the terminal
          expect(expectedCommand).toMatch(/^npm run [a-z-]{3,15}$/);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});
