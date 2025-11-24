const path = require('path');
const pathResolver = require('./helpers/pathResolver');

class GraphBuilder {
  /**
   * Build dependency graph from file breakdown
   */
  buildDependencyGraph(fileBreakdown, projectPath) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // Create nodes for each file
    Object.entries(fileBreakdown).forEach(([filePath, analysis]) => {
      const nodeId = this.normalizeFilePath(filePath);
      const node = {
        id: nodeId,
        label: path.basename(filePath),
        type: analysis.type,
        path: filePath,
        imports: analysis.imports?.length || 0,
        exports: analysis.exports?.length || 0
      };
      
      nodes.push(node);
      nodeMap.set(nodeId, node);
    });

    // Create edges based on imports
    Object.entries(fileBreakdown).forEach(([filePath, analysis]) => {
      const fromNode = this.normalizeFilePath(filePath);
      
      if (analysis.imports) {
        analysis.imports.forEach(importDecl => {
          const resolvedPath = pathResolver.resolveImport(
            importDecl.source, 
            filePath, 
            projectPath
          );
          
          if (resolvedPath) {
            const toNode = this.normalizeFilePath(resolvedPath);
            
            // Only create edge if target node exists
            if (nodeMap.has(toNode)) {
              edges.push({
                from: fromNode,
                to: toNode,
                type: 'import',
                source: importDecl.source
              });
            }
          }
        });
      }
    });

    return {
      nodes,
      edges,
      stats: {
        totalFiles: nodes.length,
        totalConnections: edges.length,
        isolatedFiles: nodes.filter(n => 
          !edges.some(e => e.from === n.id || e.to === n.id)
        ).length
      }
    };
  }

  /**
   * Analyze graph for patterns and insights
   */
  analyzeGraphPatterns(graph) {
    const patterns = {
      entryPoints: this.findEntryPoints(graph),
      hubs: this.findHubs(graph),
      clusters: this.findClusters(graph),
      circularDependencies: this.detectCircularDependencies(graph)
    };

    return patterns;
  }

  /**
   * Find entry point files (files with no incoming dependencies)
   */
  findEntryPoints(graph) {
    const hasIncoming = new Set(graph.edges.map(e => e.to));
    return graph.nodes
      .filter(node => !hasIncoming.has(node.id))
      .map(node => ({
        file: node.path,
        type: node.type,
        outgoingConnections: graph.edges.filter(e => e.from === node.id).length
      }));
  }

  /**
   * Find hub files (files with many connections)
   */
  findHubs(graph) {
    const connectionCounts = new Map();
    
    graph.nodes.forEach(node => {
      const incoming = graph.edges.filter(e => e.to === node.id).length;
      const outgoing = graph.edges.filter(e => e.from === node.id).length;
      connectionCounts.set(node.id, incoming + outgoing);
    });

    return graph.nodes
      .filter(node => connectionCounts.get(node.id) > 3)
      .map(node => ({
        file: node.path,
        type: node.type,
        connections: connectionCounts.get(node.id)
      }))
      .sort((a, b) => b.connections - a.connections);
  }

  /**
   * Simple cluster detection based on file paths
   */
  findClusters(graph) {
    const clusters = new Map();
    
    graph.nodes.forEach(node => {
      const dir = path.dirname(node.path);
      if (!clusters.has(dir)) {
        clusters.set(dir, []);
      }
      clusters.get(dir).push(node);
    });

    return Array.from(clusters.entries())
      .filter(([dir, files]) => files.length > 1)
      .map(([dir, files]) => ({
        directory: dir,
        fileCount: files.length,
        types: [...new Set(files.map(f => f.type))]
      }));
  }

  /**
   * Simple circular dependency detection
   */
  detectCircularDependencies(graph) {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (nodeId, path = []) => {
      if (recursionStack.has(nodeId)) {
        // Found cycle
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart).concat(nodeId));
        }
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = graph.edges.filter(e => e.from === nodeId);
      outgoingEdges.forEach(edge => {
        dfs(edge.to, [...path, nodeId]);
      });

      recursionStack.delete(nodeId);
    };

    graph.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });

    return cycles.map(cycle => ({
      files: cycle.map(nodeId => 
        graph.nodes.find(n => n.id === nodeId)?.path
      ).filter(Boolean),
      length: cycle.length - 1
    }));
  }

  /**
   * Normalize file path for consistent node IDs
   */
  normalizeFilePath(filePath) {
    return filePath.replace(/\\/g, '/').toLowerCase();
  }
}

module.exports = new GraphBuilder();