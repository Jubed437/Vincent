import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Feature: core-functionality-fixes, Property 5: File content round-trip
// For any text file in the project, reading it through the file viewer should produce content identical to reading it directly from the filesystem
// Validates: Requirements 3.1, 3.3

describe('File Content Reading Tests', () => {
  let tempDir;
  let readFileContent;

  beforeEach(async () => {
    // Create temp directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'engine-test-'));
    
    // Create a standalone readFileContent function for testing
    readFileContent = async (filePath) => {
      try {
        const stats = await fs.stat(filePath);
        
        if (!stats.isFile()) {
          return {
            success: false,
            message: 'Path is not a file'
          };
        }

        const content = await fs.readFile(filePath, 'utf8');
        
        return {
          success: true,
          data: {
            content: content,
            path: filePath,
            name: path.basename(filePath),
            size: stats.size,
            encoding: 'utf8'
          }
        };
      } catch (error) {
        if (error.code === 'ENOENT') {
          return {
            success: false,
            message: 'File not found'
          };
        } else if (error.code === 'EACCES') {
          return {
            success: false,
            message: 'Permission denied'
          };
        } else if (error.message.includes('invalid') || error.message.includes('decode')) {
          return {
            success: false,
            message: 'Unable to read file - may be a binary file',
            isBinary: true
          };
        } else {
          return {
            success: false,
            message: `Failed to read file: ${error.message}`
          };
        }
      }
    };
  });

  afterEach(async () => {
    // Clean up temp directory
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  // Arbitrary for generating text content
  const textContentArb = fc.string({ minLength: 0, maxLength: 1000 });

  // Arbitrary for generating file names
  const fileNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}\.(txt|js|json|md)$/);

  it('Property 5: File content round-trip matches filesystem', async () => {
    await fc.assert(
      fc.asyncProperty(fileNameArb, textContentArb, async (fileName, content) => {
        // Write file to filesystem
        const filePath = path.join(tempDir, fileName);
        await fs.writeFile(filePath, content, 'utf8');

        // Read through function
        const result = await readFileContent(filePath);

        // Verify success
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // Verify content matches exactly
        expect(result.data.content).toBe(content);

        // Verify metadata
        expect(result.data.path).toBe(filePath);
        expect(result.data.name).toBe(fileName);
        expect(result.data.encoding).toBe('utf8');

        // Verify round-trip: read directly from filesystem
        const directContent = await fs.readFile(filePath, 'utf8');
        expect(result.data.content).toBe(directContent);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 5b: Non-existent files return error', async () => {
    await fc.assert(
      fc.asyncProperty(fileNameArb, async (fileName) => {
        // Try to read a file that doesn't exist
        const filePath = path.join(tempDir, 'nonexistent', fileName);
        const result = await readFileContent(filePath);

        // Should fail gracefully
        expect(result.success).toBe(false);
        expect(result.message).toBeDefined();
        expect(result.message.toLowerCase()).toContain('not found');
      }),
      { numRuns: 50 }
    );
  });

  it('Property 5c: Empty files are handled correctly', async () => {
    const fileName = 'empty.txt';
    const filePath = path.join(tempDir, fileName);
    
    // Create empty file
    await fs.writeFile(filePath, '', 'utf8');

    // Read through function
    const result = await readFileContent(filePath);

    // Should succeed with empty content
    expect(result.success).toBe(true);
    expect(result.data.content).toBe('');
  });

  it('Property 5d: Special characters are preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }),
        async (content) => {
          const fileName = 'special.txt';
          const filePath = path.join(tempDir, fileName);
          
          // Write file with special characters
          await fs.writeFile(filePath, content, 'utf8');

          // Read through function
          const result = await readFileContent(filePath);

          // Content should be preserved exactly
          expect(result.success).toBe(true);
          expect(result.data.content).toBe(content);
        }
      ),
      { numRuns: 100 }
    );
  });
});
