const staticParser = require('./staticParser');
const graphBuilder = require('./graphBuilder');
const issueDetector = require('./issueDetector');
const workflowTemplates = require('./workflowTemplates');

class AIAgentStub {
  /**
   * Main entry point - runs complete AI analysis
   */
  async runLocalAIStub(projectPath) {
    try {
      console.log(`🤖 AI Agent analyzing project: ${projectPath}`);
      
      // Step 1: Static analysis
      const staticAnalysis = staticParser.analyzeProject(projectPath);
      
      // Step 2: Build dependency graph
      const dependencyGraph = graphBuilder.buildDependencyGraph(
        staticAnalysis.fileBreakdown, 
        projectPath
      );
      
      // Step 3: Analyze graph patterns
      const graphPatterns = graphBuilder.analyzeGraphPatterns(dependencyGraph);
      dependencyGraph.patterns = graphPatterns;
      
      // Step 4: Generate workflow
      const workflow = workflowTemplates.generateWorkflow(
        staticAnalysis.detectedTechStack,
        staticAnalysis.fileBreakdown
      );
      
      // Step 5: Detect issues
      const issues = issueDetector.detectIssues(
        staticAnalysis.fileBreakdown,
        staticParser.readPackageJson(projectPath),
        projectPath,
        dependencyGraph
      );
      
      // Step 6: Generate development workflow
      const devWorkflow = workflowTemplates.generateDevWorkflow(
        staticAnalysis.detectedTechStack,
        staticParser.readPackageJson(projectPath)
      );
      
      // Step 7: Generate deployment recommendations
      const deploymentRecs = workflowTemplates.generateDeploymentRecommendations(
        staticAnalysis.detectedTechStack,
        workflow
      );

      // Compile final analysis
      const analysis = {
        projectSummary: this.generateProjectSummary(staticAnalysis, workflow),
        techStack: staticAnalysis.detectedTechStack,
        fileBreakdown: this.summarizeFileBreakdown(staticAnalysis.fileBreakdown),
        workflow: workflow,
        dependencyGraph: {
          nodes: dependencyGraph.nodes,
          edges: dependencyGraph.edges,
          stats: dependencyGraph.stats,
          patterns: graphPatterns
        },
        issues: this.categorizeIssues(issues),
        recommendedCommands: staticAnalysis.recommendedCommands,
        devWorkflow: devWorkflow,
        deploymentRecommendations: deploymentRecs,
        metadata: {
          analyzedAt: new Date().toISOString(),
          analysisVersion: '1.0.0',
          projectPath: projectPath,
          confidence: this.calculateConfidence(staticAnalysis, issues)
        }
      };

      console.log(`✅ AI Analysis complete - found ${staticAnalysis.detectedTechStack.length} technologies, ${issues.length} issues`);
      
      return {
        success: true,
        data: analysis
      };

    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
      return {
        success: false,
        message: `AI analysis failed: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * Generate comprehensive project summary
   */
  generateProjectSummary(staticAnalysis, workflow) {
    const { projectTypeSummary, detectedTechStack, fileBreakdown } = staticAnalysis;
    
    const fileCount = Object.keys(fileBreakdown).length;
    const componentCount = Object.values(fileBreakdown)
      .filter(f => f.type === 'react-component').length;
    const routeCount = Object.values(fileBreakdown)
      .reduce((sum, f) => sum + (f.routes?.length || 0), 0);
    const modelCount = Object.values(fileBreakdown)
      .filter(f => f.type === 'mongoose-model').length;

    let summary = `This is a ${projectTypeSummary} with ${fileCount} JavaScript/TypeScript files. `;
    
    if (componentCount > 0) {
      summary += `Contains ${componentCount} React components. `;
    }
    
    if (routeCount > 0) {
      summary += `Defines ${routeCount} API routes. `;
    }
    
    if (modelCount > 0) {
      summary += `Uses ${modelCount} Mongoose models. `;
    }

    summary += `Built with ${detectedTechStack.map(t => t.name).join(', ')}. `;
    summary += `Follows ${workflow.type} architecture pattern.`;

    return summary;
  }

  /**
   * Summarize file breakdown for cleaner output
   */
  summarizeFileBreakdown(fileBreakdown) {
    const summary = {};
    
    Object.entries(fileBreakdown).forEach(([filePath, analysis]) => {
      summary[filePath] = {
        type: analysis.type,
        summary: analysis.summary,
        imports: analysis.imports?.length || 0,
        exports: analysis.exports?.length || 0,
        functions: analysis.functions?.length || 0,
        components: analysis.components?.length || 0,
        routes: analysis.routes?.length || 0
      };
    });

    return summary;
  }

  /**
   * Categorize issues by severity and type
   */
  categorizeIssues(issues) {
    const categorized = {
      critical: issues.filter(i => i.severity === 'critical'),
      high: issues.filter(i => i.severity === 'high'),
      medium: issues.filter(i => i.severity === 'medium'),
      low: issues.filter(i => i.severity === 'low'),
      byType: {}
    };

    // Group by type
    issues.forEach(issue => {
      if (!categorized.byType[issue.type]) {
        categorized.byType[issue.type] = [];
      }
      categorized.byType[issue.type].push(issue);
    });

    return categorized;
  }

  /**
   * Calculate analysis confidence score
   */
  calculateConfidence(staticAnalysis, issues) {
    let confidence = 0.8; // Base confidence
    
    const fileCount = Object.keys(staticAnalysis.fileBreakdown).length;
    const techStackCount = staticAnalysis.detectedTechStack.length;
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    
    // Adjust based on project size
    if (fileCount > 10) confidence += 0.1;
    if (fileCount > 50) confidence += 0.05;
    
    // Adjust based on tech stack detection
    if (techStackCount > 0) confidence += 0.05;
    if (techStackCount > 3) confidence += 0.05;
    
    // Reduce confidence for critical issues
    confidence -= criticalIssues * 0.1;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Generate quick insights for dashboard
   */
  generateQuickInsights(analysis) {
    const insights = [];
    
    // Tech stack insight
    if (analysis.techStack.length > 0) {
      insights.push({
        type: 'tech-stack',
        message: `Uses modern stack: ${analysis.techStack.slice(0, 3).map(t => t.name).join(', ')}`,
        icon: '🚀'
      });
    }

    // Issues insight
    const criticalIssues = analysis.issues.critical.length;
    if (criticalIssues > 0) {
      insights.push({
        type: 'issues',
        message: `${criticalIssues} critical issues need attention`,
        icon: '⚠️'
      });
    } else {
      insights.push({
        type: 'health',
        message: 'No critical issues detected',
        icon: '✅'
      });
    }

    // Architecture insight
    insights.push({
      type: 'architecture',
      message: `Follows ${analysis.workflow.type} pattern`,
      icon: '🏗️'
    });

    return insights;
  }
}

module.exports = new AIAgentStub();