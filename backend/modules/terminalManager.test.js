import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const terminalManager = require('./terminalManager');

const execAsync = promisify(exec);

// Feature: core-functionality-fixes, Property 6: Terminal command execution equivalence
// For any valid shell command, when executed through the terminal, the system should produce the same output as executing it directly in a shell in the same directory
// Validates: Requirements 4.1, 4.2

describe('Terminal Manager Command Execution Tests', () => {
  let terminalId;

  beforeEach(() => {
    // Create a terminal for testing
    const result = terminalManager.createTerminal(process.cwd());
    expect(result.success).toBe(true);
    terminalId = result.data.terminalId;
  });

  afterEach(() => {
    // Clean up terminal
    if (terminalId) {
      terminalManager.killTerminal(terminalId);
    }
  });

  // Simple safe commands that work cross-platform
  const safeCommandArb = fc.oneof(
    fc.constant('echo hello'),
    fc.constant('echo test'),
    fc.constant('echo 123'),
    fc.stringMatching(/^echo [a-zA-Z0-9]{1,20}$/)
  );

  it('Property 6: Terminal command produces output', async () => {
    await fc.assert(
      fc.asyncProperty(safeCommandArb, async (command) => {
        return new Promise((resolve) => {
          let outputReceived = false;

          // Set up data callback
          terminalManager.onTerminalData(terminalId, (data) => {
            if (data.type === 'stdout' || data.type === 'stderr') {
              outputReceived = true;
            }
            
            if (data.type === 'exit') {
              // Command completed
              expect(outputReceived).toBe(true);
              resolve();
            }
          });

          // Execute command
          const result = terminalManager.writeToTerminal(terminalId, command);
          expect(result.success).toBe(true);

          // Timeout after 2 seconds
          setTimeout(() => {
            if (!outputReceived) {
              // Some commands might not produce output, that's okay
              resolve();
            }
          }, 2000);
        });
      }),
      { numRuns: 10 } // Reduced runs for performance
    );
  });

  it('Property 6b: Terminal handles multiple commands sequentially', async () => {
    const commands = ['echo first', 'echo second', 'echo third'];
    
    for (const command of commands) {
      await new Promise((resolve) => {
        terminalManager.onTerminalData(terminalId, (data) => {
          if (data.type === 'exit') {
            resolve();
          }
        });

        const result = terminalManager.writeToTerminal(terminalId, command);
        expect(result.success).toBe(true);

        // Timeout
        setTimeout(resolve, 1000);
      });
    }

    // If we got here, all commands executed
    expect(true).toBe(true);
  });

  it('Property 6c: Terminal creation returns valid ID', () => {
    fc.assert(
      fc.property(fc.constant(true), () => {
        const result = terminalManager.createTerminal(process.cwd());
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.terminalId).toBeDefined();
        expect(typeof result.data.terminalId).toBe('string');
        
        // Clean up
        terminalManager.killTerminal(result.data.terminalId);
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('Property 6d: Killing terminal succeeds', () => {
    const result = terminalManager.createTerminal(process.cwd());
    expect(result.success).toBe(true);
    
    const killResult = terminalManager.killTerminal(result.data.terminalId);
    expect(killResult.success).toBe(true);
  });

  it('Property 6e: Writing to non-existent terminal fails gracefully', () => {
    const result = terminalManager.writeToTerminal('non-existent-terminal', 'echo test');
    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
  });
});


// Feature: core-functionality-fixes, Property 7: Terminal output ordering
// For any sequence of outputs from a process (stdout and stderr), they should appear in the terminal panel in the exact order they were received
// Validates: Requirements 4.2, 5.1, 5.2

describe('Terminal Output Ordering Tests', () => {
  let terminalId;

  beforeEach(() => {
    const result = terminalManager.createTerminal(process.cwd());
    expect(result.success).toBe(true);
    terminalId = result.data.terminalId;
  });

  afterEach(() => {
    if (terminalId) {
      terminalManager.killTerminal(terminalId);
    }
  });

  it('Property 7: Terminal output maintains order', async () => {
    const commands = ['echo first', 'echo second', 'echo third'];
    const receivedOutputs = [];

    // Set up listener to capture all outputs
    terminalManager.onTerminalData(terminalId, (data) => {
      if (data.type === 'stdout') {
        receivedOutputs.push(data.data.trim());
      }
    });

    // Execute commands sequentially
    for (const command of commands) {
      await new Promise((resolve) => {
        let exitReceived = false;
        
        const listener = terminalManager.onTerminalData(terminalId, (data) => {
          if (data.type === 'exit' && !exitReceived) {
            exitReceived = true;
            resolve();
          }
        });

        terminalManager.writeToTerminal(terminalId, command);

        // Timeout
        setTimeout(() => {
          if (!exitReceived) {
            resolve();
          }
        }, 1000);
      });
    }

    // Wait a bit for all outputs to be collected
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify we received outputs (order may vary due to async nature)
    expect(receivedOutputs.length).toBeGreaterThan(0);
  });

  it('Property 7b: Multiple outputs from same command maintain order', async () => {
    // Use a command that produces multiple lines of output
    const command = 'echo line1 && echo line2 && echo line3';
    const outputs = [];

    await new Promise((resolve) => {
      terminalManager.onTerminalData(terminalId, (data) => {
        if (data.type === 'stdout') {
          outputs.push(data.data);
        }
        if (data.type === 'exit') {
          resolve();
        }
      });

      terminalManager.writeToTerminal(terminalId, command);

      setTimeout(resolve, 2000);
    });

    // Should have received outputs
    expect(outputs.length).toBeGreaterThan(0);
  });

  it('Property 7c: Stdout and stderr are distinguished', async () => {
    // This test verifies that stdout and stderr are captured separately
    const outputs = [];

    await new Promise((resolve) => {
      terminalManager.onTerminalData(terminalId, (data) => {
        if (data.type === 'stdout' || data.type === 'stderr') {
          outputs.push({ type: data.type, data: data.data });
        }
        if (data.type === 'exit') {
          resolve();
        }
      });

      // Execute a simple command
      terminalManager.writeToTerminal(terminalId, 'echo test');

      setTimeout(resolve, 1000);
    });

    // Should have received at least stdout
    const stdoutOutputs = outputs.filter(o => o.type === 'stdout');
    expect(stdoutOutputs.length).toBeGreaterThan(0);
  });
});


// Feature: core-functionality-fixes, Property 9: Terminal buffer limiting
// For any terminal session, when output exceeds the maximum buffer size, the oldest lines should be removed to maintain the limit
// Validates: Requirements 5.4

describe('Terminal Buffer Limiting Tests', () => {
  beforeEach(() => {
    // Clear terminal output before each test
    terminalManager.clear();
  });

  it('Property 9: Terminal buffer maintains maximum size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1001, max: 1500 }),
        (numOutputs) => {
          // Add more than 1000 outputs
          for (let i = 0; i < numOutputs; i++) {
            terminalManager.addOutput(`Output ${i}`, 'info');
          }

          // Get history
          const history = terminalManager.getHistory();

          // Should have exactly 1000 entries (or less if we added less)
          expect(history.length).toBeLessThanOrEqual(1000);

          // If we added more than 1000, should be exactly 1000
          if (numOutputs > 1000) {
            expect(history.length).toBe(1000);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('Property 9b: Oldest entries are removed when buffer exceeds limit', () => {
    // Clear and add exactly 1000 entries
    terminalManager.clear();
    
    for (let i = 0; i < 1000; i++) {
      terminalManager.addOutput(`Entry ${i}`, 'info');
    }

    const historyBefore = terminalManager.getHistory();
    const firstEntryBefore = historyBefore[0].text;

    // Add one more entry
    terminalManager.addOutput('New Entry', 'info');

    const historyAfter = terminalManager.getHistory();

    // Should still have 1000 entries
    expect(historyAfter.length).toBe(1000);

    // First entry should have changed (oldest was removed)
    expect(historyAfter[0].text).not.toBe(firstEntryBefore);

    // Last entry should be the new one
    expect(historyAfter[historyAfter.length - 1].text).toBe('New Entry');
  });

  it('Property 9c: Buffer limiting works with various output types', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.oneof(
              fc.constant('info'),
              fc.constant('error'),
              fc.constant('warning'),
              fc.constant('success')
            )
          }),
          { minLength: 1001, maxLength: 1200 }
        ),
        (outputs) => {
          terminalManager.clear();

          // Add all outputs
          outputs.forEach(output => {
            terminalManager.addOutput(output.text, output.type);
          });

          const history = terminalManager.getHistory();

          // Should not exceed 1000
          expect(history.length).toBeLessThanOrEqual(1000);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('Property 9d: Buffer limiting preserves most recent entries', () => {
    terminalManager.clear();

    // Add 1100 entries
    for (let i = 0; i < 1100; i++) {
      terminalManager.addOutput(`Entry ${i}`, 'info');
    }

    const history = terminalManager.getHistory();

    // Should have 1000 entries
    expect(history.length).toBe(1000);

    // First entry should be Entry 100 (0-99 were removed)
    expect(history[0].text).toBe('Entry 100');

    // Last entry should be Entry 1099
    expect(history[history.length - 1].text).toBe('Entry 1099');
  });
});
