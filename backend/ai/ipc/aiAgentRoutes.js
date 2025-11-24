const { ipcMain } = require('electron');
const aiAgentStub = require('../aiAgentStub');

class AIAgentRoutes {
  /**
   * Setup IPC handlers for AI agent
   */
  setupRoutes() {
    // Main AI analysis endpoint
    ipcMain.handle('ai:analyze-project', async (event, { projectPath }) => {
      try {
        console.log(`🤖 IPC: AI analysis requested for ${projectPath}`);
        const result = await aiAgentStub.runLocalAIStub(projectPath);
        return result;
      } catch (error) {
        console.error('AI analysis IPC error:', error);
        return {
          success: false,
          message: `AI analysis failed: ${error.message}`,
          data: null
        };
      }
    });

    // Quick project insights
    ipcMain.handle('ai:quick-insights', async (event, { projectPath }) => {
      try {
        const analysis = await aiAgentStub.runLocalAIStub(projectPath);
        if (analysis.success) {
          const insights = aiAgentStub.generateQuickInsights(analysis.data);
          return {
            success: true,
            data: insights
          };
        }
        return analysis;
      } catch (error) {
        return {
          success: false,
          message: `Quick insights failed: ${error.message}`
        };
      }
    });

    // Get project recommendations
    ipcMain.handle('ai:get-recommendations', async (event, { projectPath }) => {
      try {
        const analysis = await aiAgentStub.runLocalAIStub(projectPath);
        if (analysis.success) {
          return {
            success: true,
            data: {
              commands: analysis.data.recommendedCommands,
              workflow: analysis.data.devWorkflow,
              deployment: analysis.data.deploymentRecommendations,
              issues: analysis.data.issues
            }
          };
        }
        return analysis;
      } catch (error) {
        return {
          success: false,
          message: `Recommendations failed: ${error.message}`
        };
      }
    });

    console.log('🤖 AI Agent IPC routes registered');
  }
}

module.exports = new AIAgentRoutes();