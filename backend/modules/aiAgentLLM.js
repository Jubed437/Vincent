const fs = require('fs');
const path = require('path');
const { SYSTEM_PROMPT, ANALYSIS_PROMPT_TEMPLATE, REACT_SPECIFIC_QUESTIONS, NODE_SPECIFIC_QUESTIONS } = require('../ai/promptTemplates');

class AIAgentLLM {
  constructor() {
    // Check for valid API keys (not placeholders)
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    const isValidAnthropicKey = anthropicKey && !anthropicKey.includes('your_anthropic_api_key_here');
    const isValidOpenaiKey = openaiKey && openaiKey.startsWith('sk-');
    
    if (isValidAnthropicKey) {
      this.apiKey = anthropicKey;
      this.provider = 'anthropic';
    } else if (isValidOpenaiKey) {
      this.apiKey = openaiKey;
      this.provider = 'openai';
    } else {
      this.apiKey = null;
      this.provider = 'none';
    }
    
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS) || 4000;
    this.timeout = parseInt(process.env.LLM_TIMEOUT) || 30000;
    
    if (this.apiKey) {
      console.log(`✅ LLM initialized with ${this.provider} provider`);
    } else {
      console.log('⚠️ No valid API key found, LLM analysis will use fallback mode');
    }
  }

  async runSemanticAnalysis(staticAnalysisResult) {
    try {
      if (!this.apiKey) {
        console.warn('No API key found, falling back to stub analysis');
        return this.getFallbackAnalysis(staticAnalysisResult);
      }

      const prompt = this.buildAnalysisPrompt(staticAnalysisResult);
      const response = await this.callLLM(prompt);
      
      return {
        success: true,
        data: this.parseResponse(response),
        source: 'llm'
      };
    } catch (error) {
      console.error('LLM analysis failed:', error);
      return this.getFallbackAnalysis(staticAnalysisResult);
    }
  }

  buildAnalysisPrompt(analysis) {
    const { fileBreakdown, dependencyGraph, techStack, scripts, issues, projectSummary } = analysis;
    
    // Limit file content to prevent token overflow
    const limitedFiles = this.limitFileContent(fileBreakdown);
    
    // Detect project type for framework-specific questions
    const isReact = techStack.some(tech => tech.name?.toLowerCase().includes('react'));
    const isNode = techStack.some(tech => tech.name?.toLowerCase().includes('node') || tech.name?.toLowerCase().includes('express'));
    
    let frameworkQuestions = '';
    if (isReact) frameworkQuestions += REACT_SPECIFIC_QUESTIONS;
    if (isNode) frameworkQuestions += NODE_SPECIFIC_QUESTIONS;
    
    return ANALYSIS_PROMPT_TEMPLATE
      .replace('{{projectName}}', projectSummary.name || 'Unknown')
      .replace('{{projectType}}', projectSummary.type || 'Unknown')
      .replace('{{fileCount}}', projectSummary.fileCount || 0)
      .replace('{{techStack}}', JSON.stringify(techStack, null, 2))
      .replace('{{dependencies}}', JSON.stringify(dependencyGraph, null, 2))
      .replace('{{scripts}}', JSON.stringify(scripts, null, 2))
      .replace('{{fileBreakdown}}', JSON.stringify(limitedFiles, null, 2))
      .replace('{{staticIssues}}', JSON.stringify(issues, null, 2))
      + '\n\n' + frameworkQuestions;
  }

  limitFileContent(fileBreakdown) {
    const limited = {};
    
    Object.entries(fileBreakdown).forEach(([filePath, fileData]) => {
      const lines = fileData.content ? fileData.content.split('\n') : [];
      
      if (lines.length > 100) {
        // Take first 50 and last 50 lines for large files
        const excerpt = [
          ...lines.slice(0, 50),
          '... [truncated] ...',
          ...lines.slice(-50)
        ].join('\n');
        
        limited[filePath] = {
          ...fileData,
          content: excerpt,
          truncated: true,
          originalLines: lines.length
        };
      } else {
        limited[filePath] = fileData;
      }
    });
    
    return limited;
  }

  async callLLM(prompt) {
    if (this.provider === 'anthropic') {
      return await this.callClaude(prompt);
    } else {
      return await this.callOpenAI(prompt);
    }
  }

  async callClaude(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: this.maxTokens,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callOpenAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [{
          role: 'system',
          content: SYSTEM_PROMPT
        }, {
          role: 'user',
          content: prompt
        }],
        max_tokens: this.maxTokens,
        temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.1
      }),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  parseResponse(response) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return this.getEmptyAnalysis();
    }
  }

  getFallbackAnalysis(staticAnalysis) {
    return {
      success: true,
      data: {
        semanticInsights: "Analysis performed using static heuristics (LLM unavailable)",
        fileDescriptions: this.generateBasicFileDescriptions(staticAnalysis.fileBreakdown),
        apiFlow: "API flow analysis requires LLM integration",
        componentFlow: "Component flow analysis requires LLM integration", 
        criticalIssues: staticAnalysis.issues || [],
        recommendations: this.generateBasicRecommendations(staticAnalysis),
        missingDependencies: [],
        frameworkInsights: "Framework-specific insights require LLM integration"
      },
      source: 'fallback'
    };
  }

  generateBasicFileDescriptions(fileBreakdown) {
    const descriptions = {};
    
    Object.entries(fileBreakdown || {}).forEach(([filePath, fileData]) => {
      const fileName = path.basename(filePath);
      const ext = path.extname(fileName);
      
      if (ext === '.js' || ext === '.jsx') {
        descriptions[filePath] = `JavaScript${ext === '.jsx' ? ' React' : ''} file: ${fileName}`;
      } else if (ext === '.json') {
        descriptions[filePath] = `Configuration file: ${fileName}`;
      } else {
        descriptions[filePath] = `File: ${fileName}`;
      }
    });
    
    return descriptions;
  }

  generateBasicRecommendations(staticAnalysis) {
    const recommendations = [];
    
    if (staticAnalysis.issues?.length > 0) {
      recommendations.push({
        category: 'code-quality',
        priority: 'medium',
        description: 'Address static analysis issues found',
        implementation: 'Review and fix the identified code quality issues'
      });
    }
    
    return recommendations;
  }

  getEmptyAnalysis() {
    return {
      semanticInsights: "Analysis failed - unable to process response",
      fileDescriptions: {},
      apiFlow: "Unable to analyze API flow",
      componentFlow: "Unable to analyze component flow",
      criticalIssues: [],
      recommendations: [],
      missingDependencies: [],
      frameworkInsights: "Unable to provide framework insights"
    };
  }
}

module.exports = new AIAgentLLM();