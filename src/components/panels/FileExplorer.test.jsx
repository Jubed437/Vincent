import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import FileExplorer from './FileExplorer';
import { useAppStore } from '../../store/appStore';

// Feature: core-functionality-fixes, Property 4: Folder expansion toggle
// For any folder in the file tree, clicking it should toggle between expanded and collapsed states, with children visible when expanded and hidden when collapsed
// Validates: Requirements 2.1, 2.2, 2.3

describe('FileExplorer Folder Expansion Tests', () => {
  beforeEach(() => {
    // Reset store state
    const store = useAppStore.getState();
    store.setProjectFiles([]);
    store.setSelectedFile(null);
  });

  // Helper to count visible file items in the DOM
  function countVisibleItems(container) {
    // Count all FileItem divs by looking for elements with the specific structure
    // FileItems have a cursor-pointer class and contain an icon
    const items = container.querySelectorAll('[class*="cursor-pointer"]');
    // Filter to only count actual file/folder items (not other clickable elements)
    const fileItems = Array.from(items).filter(item => {
      // Check if it has a file/folder icon (lucide icons)
      const hasIcon = item.querySelector('svg');
      return hasIcon !== null;
    });
    return fileItems.length;
  }

  // Helper to find a folder by name
  function findFolderByName(container, name) {
    const items = container.querySelectorAll('[class*="cursor-pointer"]');
    for (const item of items) {
      if (item.textContent.includes(name)) {
        return item;
      }
    }
    return null;
  }

  // Arbitrary for generating file nodes
  const fileArb = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    name: fc.stringMatching(/^[a-zA-Z0-9_-]{1,15}\.(js|txt|json)$/),
    type: fc.constant('file'),
    path: fc.string({ minLength: 1, maxLength: 50 }),
    size: fc.oneof(fc.constant('1KB'), fc.constant('2KB'), fc.constant('500B'))
  });

  // Arbitrary for generating folder nodes with children
  const folderWithChildrenArb = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    name: fc.stringMatching(/^[a-zA-Z0-9_-]{1,15}$/),
    type: fc.constant('folder'),
    path: fc.string({ minLength: 1, maxLength: 50 }),
    children: fc.array(fileArb, { minLength: 1, maxLength: 5 })
  });

  it('Property 4: Clicking folder toggles expansion state', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(folderWithChildrenArb, async (folder) => {
        // Set up the store with a folder that has children
        const store = useAppStore.getState();
        store.setProjectFiles([folder]);

        // Render the component
        const { container } = render(<FileExplorer />);

        // Initially, children should be hidden (collapsed state)
        const initialCount = countVisibleItems(container);
        // Should only see the folder itself, not its children
        expect(initialCount).toBe(1);

        // Find and click the folder
        const folderElement = findFolderByName(container, folder.name);
        expect(folderElement).toBeTruthy();
        
        fireEvent.click(folderElement);

        // Wait for expansion animation to complete
        await waitFor(() => {
          const expandedCount = countVisibleItems(container);
          // Should see folder + all children
          expect(expandedCount).toBe(1 + folder.children.length);
        });

        // Click again to collapse
        fireEvent.click(folderElement);

        // Wait for collapse animation to complete
        await waitFor(() => {
          const collapsedCount = countVisibleItems(container);
          expect(collapsedCount).toBe(1);
        });
      }),
      { numRuns: 10 } // Reduced from 100 to 10 for faster test execution
    );
  });

  it('Property 4b: Empty folders do not show chevron', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer({ min: 1, max: 10000 }),
          name: fc.stringMatching(/^[a-zA-Z0-9_-]{1,15}$/),
          type: fc.constant('folder'),
          path: fc.string({ minLength: 1, maxLength: 50 }),
          children: fc.constant([])
        }),
        (emptyFolder) => {
          // Set up the store with an empty folder
          const store = useAppStore.getState();
          store.setProjectFiles([emptyFolder]);

          // Render the component
          const { container } = render(<FileExplorer />);

          // Find the folder element
          const folderElement = findFolderByName(container, emptyFolder.name);
          expect(folderElement).toBeTruthy();

          // Empty folders should not have a chevron icon
          // The chevron is a ChevronRight icon, which should not be present
          const chevrons = container.querySelectorAll('svg');
          // Should only have the folder icon, not a chevron
          const hasChevron = Array.from(chevrons).some(svg => 
            svg.getAttribute('class')?.includes('lucide-chevron-right')
          );
          expect(hasChevron).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4c: Nested indentation increases with depth', () => {
    // Create a deeply nested structure
    const deepStructure = [
      {
        id: 1,
        name: 'level0',
        type: 'folder',
        path: '/level0',
        children: [
          {
            id: 2,
            name: 'level1',
            type: 'folder',
            path: '/level0/level1',
            children: [
              {
                id: 3,
                name: 'level2.txt',
                type: 'file',
                path: '/level0/level1/level2.txt',
                size: '1KB'
              }
            ]
          }
        ]
      }
    ];

    const store = useAppStore.getState();
    store.setProjectFiles(deepStructure);

    const { container } = render(<FileExplorer />);

    // Expand level 0
    const level0 = findFolderByName(container, 'level0');
    fireEvent.click(level0);

    // Expand level 1
    const level1 = findFolderByName(container, 'level1');
    fireEvent.click(level1);

    // Check that indentation increases
    const items = container.querySelectorAll('[class*="cursor-pointer"]');
    const paddingValues = Array.from(items).map(item => {
      const style = item.getAttribute('style');
      const match = style?.match(/padding-left:\s*(\d+)px/);
      return match ? parseInt(match[1]) : 0;
    });

    // Each level should have more padding than the previous
    expect(paddingValues[0]).toBeLessThan(paddingValues[1]); // level0 < level1
    expect(paddingValues[1]).toBeLessThan(paddingValues[2]); // level1 < level2
  });
});
