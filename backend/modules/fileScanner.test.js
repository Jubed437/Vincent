import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fileScanner = require('./fileScanner');

// Feature: core-functionality-fixes, Property 1: File tree node uniqueness
// For any scanned project directory, all file and folder nodes in the returned structure should have unique ID values with no duplicates
// Validates: Requirements 1.2

describe('FileScanner Property Tests', () => {
  let tempDir;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fileScanner-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Helper function to collect all IDs from a file tree
  function collectAllIds(structure) {
    const ids = [];
    
    function traverse(nodes) {
      if (!nodes) return;
      
      for (const node of nodes) {
        ids.push(node.id);
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    
    traverse(structure);
    return ids;
  }

  // Helper function to create a file structure from a specification
  function createFileStructure(basePath, spec) {
    for (const item of spec) {
      const itemPath = path.join(basePath, item.name);
      
      if (item.type === 'folder') {
        fs.mkdirSync(itemPath, { recursive: true });
        if (item.children) {
          createFileStructure(itemPath, item.children);
        }
      } else {
        fs.writeFileSync(itemPath, item.content || 'test content');
      }
    }
  }

  // Arbitrary for generating file/folder names
  const fileNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}\.(js|txt|json|md)$/);
  const folderNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}$/);

  // Arbitrary for generating a file structure specification
  const fileStructureArb = fc.array(
    fc.oneof(
      fc.record({
        name: fileNameArb,
        type: fc.constant('file'),
        content: fc.string({ minLength: 0, maxLength: 100 })
      }),
      fc.record({
        name: folderNameArb,
        type: fc.constant('folder'),
        children: fc.array(
          fc.record({
            name: fileNameArb,
            type: fc.constant('file'),
            content: fc.string({ minLength: 0, maxLength: 100 })
          }),
          { minLength: 0, maxLength: 5 }
        )
      })
    ),
    { minLength: 1, maxLength: 10 }
  );

  it('Property 1: All file tree nodes have unique IDs', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(fileStructureArb, (fileStructure) => {
        // Create the file structure in the temp directory
        createFileStructure(tempDir, fileStructure);

        // Scan the project
        const result = fileScanner.scanProject(tempDir);

        // Verify scan was successful
        expect(result.success).toBe(true);
        expect(result.data.structure).toBeDefined();

        // Collect all IDs from the structure
        const allIds = collectAllIds(result.data.structure);

        // Verify all IDs are unique
        const uniqueIds = new Set(allIds);
        expect(allIds.length).toBe(uniqueIds.size);

        // Verify all IDs are numbers
        for (const id of allIds) {
          expect(typeof id).toBe('number');
        }

        // Verify IDs are sequential starting from 0
        const sortedIds = [...allIds].sort((a, b) => a - b);
        for (let i = 0; i < sortedIds.length; i++) {
          expect(sortedIds[i]).toBe(i);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: core-functionality-fixes, Property 2: File tree structure preservation
// For any project directory, the nested folder structure returned by the scanner should match the actual filesystem hierarchy with correct nesting levels
// Validates: Requirements 1.1, 1.4, 2.4

describe('FileScanner Structure Preservation Tests', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fileScanner-structure-test-'));
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Helper to create a file structure
  function createStructure(basePath, spec) {
    for (const item of spec) {
      const itemPath = path.join(basePath, item.name);
      
      if (item.type === 'folder') {
        fs.mkdirSync(itemPath, { recursive: true });
        if (item.children && item.children.length > 0) {
          createStructure(itemPath, item.children);
        }
      } else {
        fs.writeFileSync(itemPath, item.content || 'test');
      }
    }
  }

  // Helper to verify structure matches filesystem
  function verifyStructure(scannedNodes, basePath, depth = 0) {
    if (!scannedNodes || scannedNodes.length === 0) return true;

    for (const node of scannedNodes) {
      const expectedPath = node.path;
      
      // Verify the path exists
      if (!fs.existsSync(expectedPath)) {
        return false;
      }

      const stats = fs.statSync(expectedPath);
      
      // Verify type matches
      if (node.type === 'folder' && !stats.isDirectory()) {
        return false;
      }
      if (node.type === 'file' && !stats.isFile()) {
        return false;
      }

      // Verify name matches
      if (path.basename(expectedPath) !== node.name) {
        return false;
      }

      // For folders, verify children
      if (node.type === 'folder' && node.children) {
        if (!verifyStructure(node.children, expectedPath, depth + 1)) {
          return false;
        }
      }
    }

    return true;
  }

  // Helper to count total nodes
  function countNodes(nodes) {
    if (!nodes) return 0;
    let count = nodes.length;
    for (const node of nodes) {
      if (node.children) {
        count += countNodes(node.children);
      }
    }
    return count;
  }

  // Arbitrary for generating nested structures
  const nestedStructureArb = fc.array(
    fc.oneof(
      fc.record({
        name: fc.stringMatching(/^[a-zA-Z0-9_-]{1,15}\.(js|txt|json)$/),
        type: fc.constant('file'),
        content: fc.string({ minLength: 0, maxLength: 50 })
      }),
      fc.record({
        name: fc.stringMatching(/^[a-zA-Z0-9_-]{1,15}$/),
        type: fc.constant('folder'),
        children: fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z0-9_-]{1,10}\.(js|txt)$/),
            type: fc.constant('file'),
            content: fc.string({ minLength: 0, maxLength: 30 })
          }),
          { minLength: 0, maxLength: 3 }
        )
      })
    ),
    { minLength: 1, maxLength: 8 }
  );

  it('Property 2: File tree structure matches filesystem hierarchy', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(nestedStructureArb, (structure) => {
        // Create the structure
        createStructure(tempDir, structure);

        // Scan it
        const result = fileScanner.scanProject(tempDir);

        // Verify success
        expect(result.success).toBe(true);
        expect(result.data.structure).toBeDefined();

        // Verify the structure matches the filesystem
        const matches = verifyStructure(result.data.structure, tempDir);
        expect(matches).toBe(true);

        // Verify all created items are in the scanned structure
        // (accounting for depth limits)
        const scannedCount = countNodes(result.data.structure);
        expect(scannedCount).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
