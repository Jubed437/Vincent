// LLM Prompt Templates for Vincent AI Analysis

const SYSTEM_PROMPT = `You are an expert software architect and code analyst specializing in JavaScript/Node.js projects. 

Your task is to perform deep semantic analysis of codebases and provide actionable insights about:
- Project architecture and design patterns
- Component relationships and data flow
- API structure and endpoints
- Security vulnerabilities and best practices
- Performance optimization opportunities
- Code quality and maintainability issues

Always respond with valid JSON only, following the exact schema provided.`;

const ANALYSIS_PROMPT_TEMPLATE = `
Analyze this JavaScript/Node.js project and provide comprehensive insights:

PROJECT METADATA:
- Name: {{projectName}}
- Type: {{projectType}}
- File Count: {{fileCount}}

TECHNOLOGY STACK:
{{techStack}}

DEPENDENCIES:
{{dependencies}}

NPM SCRIPTS:
{{scripts}}

FILE STRUCTURE & CODE SAMPLES:
{{fileBreakdown}}

EXISTING ISSUES DETECTED:
{{staticIssues}}

Please analyze and provide insights in this exact JSON format:
{
  "semanticInsights": "Overall project analysis explaining architecture, purpose, and key patterns",
  "fileDescriptions": {
    "path/to/file.js": "Detailed explanation of this file's role and functionality"
  },
  "apiFlow": "Description of API endpoints, routes, middleware, and request/response flow",
  "componentFlow": "React/Vue component hierarchy, state management, and data flow patterns",
  "criticalIssues": [
    {
      "type": "security|performance|architecture|bug",
      "severity": "high|medium|low", 
      "description": "Clear description of the issue",
      "file": "path/to/affected/file.js",
      "recommendation": "Specific steps to resolve this issue"
    }
  ],
  "recommendations": [
    {
      "category": "architecture|dependencies|performance|security|testing",
      "priority": "high|medium|low",
      "description": "What should be improved and why",
      "implementation": "Concrete steps to implement this recommendation"
    }
  ],
  "missingDependencies": ["package-name"],
  "frameworkInsights": "Framework-specific observations, best practices, and optimization suggestions"
}`;

const REACT_SPECIFIC_QUESTIONS = `
For React projects, also analyze:
- Component composition and reusability
- State management patterns (useState, useContext, Redux, Zustand)
- Effect dependencies and cleanup
- Performance optimization opportunities (useMemo, useCallback, React.memo)
- Accessibility compliance
- Bundle size optimization
`;

const NODE_SPECIFIC_QUESTIONS = `
For Node.js/Express projects, also analyze:
- Route organization and middleware usage
- Database connection patterns and query optimization
- Error handling and logging strategies
- Security middleware and validation
- API design and RESTful principles
- Authentication and authorization patterns
`;

module.exports = {
  SYSTEM_PROMPT,
  ANALYSIS_PROMPT_TEMPLATE,
  REACT_SPECIFIC_QUESTIONS,
  NODE_SPECIFIC_QUESTIONS
};