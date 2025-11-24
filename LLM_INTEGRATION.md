# Vincent LLM Integration Guide

## Overview

Vincent now includes a hybrid AI analysis engine that combines static code analysis with real LLM-powered semantic reasoning. This provides deep insights into JavaScript/Node.js projects beyond simple pattern matching.

## Features

### 🧠 LLM-Powered Analysis
- **Semantic Code Understanding**: Real AI comprehension of code purpose and architecture
- **Cross-file Relationship Mapping**: Understanding how components interact
- **Framework-specific Insights**: Tailored analysis for React, Express, Node.js
- **Architectural Pattern Detection**: Identifies design patterns and anti-patterns
- **Intelligent Recommendations**: Context-aware suggestions for improvements

### 🔄 Hybrid Approach
- **Static Analysis First**: Fast heuristic-based analysis for immediate feedback
- **LLM Enhancement**: Deep semantic analysis when API keys are available
- **Graceful Fallback**: Works without LLM integration using static analysis only

## Setup

### 1. API Key Configuration

Create a `.env` file in the project root:

```bash
# For Claude (Anthropic) - Recommended
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OR for OpenAI GPT-4
OPENAI_API_KEY=your_openai_api_key_here

# Optional configuration
LLM_MAX_TOKENS=4000
LLM_TIMEOUT=30000
LLM_TEMPERATURE=0.1
```

### 2. Get API Keys

**Claude (Anthropic)** - Recommended:
- Visit: https://console.anthropic.com/
- Create account and get API key
- Better for code analysis and structured output

**OpenAI GPT-4**:
- Visit: https://platform.openai.com/
- Create account and get API key
- Requires paid plan for GPT-4 access

## Usage

### In the UI

1. **Load a Project**: Upload any JavaScript/Node.js project
2. **Run Deep Analysis**: Click "Deep AI Analysis" in the AI Actions panel
3. **View Results**: Enhanced insights appear in the Project Summary panel

### Analysis Output

The LLM provides structured insights including:

- **Semantic Insights**: Overall architecture and purpose explanation
- **File Descriptions**: Detailed role of each file in the project
- **API Flow**: Request/response patterns and endpoint mapping
- **Component Flow**: React component hierarchy and state management
- **Critical Issues**: Security, performance, and architectural problems
- **Recommendations**: Prioritized improvement suggestions
- **Framework Insights**: Technology-specific best practices

## Technical Implementation

### Architecture

```
Static Analysis → LLM Processing → Enhanced Results → UI Display
     ↓               ↓                ↓              ↓
File Scanning → Prompt Building → JSON Parsing → Panel Updates
Tech Detection → API Calls → Response Validation → State Updates
```

### Key Components

- **`aiAgentLLM.js`**: Core LLM integration module
- **`promptTemplates.js`**: Structured prompts for consistent analysis
- **Enhanced IPC handlers**: Backend integration points
- **Updated UI panels**: Display semantic analysis results

### Prompt Engineering

The system uses carefully crafted prompts that include:
- Project metadata and structure
- Code excerpts and file relationships
- Technology stack information
- Framework-specific analysis questions
- Structured JSON output requirements

## Example Output

```json
{
  "semanticInsights": "Modern React app with Electron integration...",
  "fileDescriptions": {
    "src/App.jsx": "Main entry point handling initialization...",
    "src/store/appStore.js": "Zustand state management..."
  },
  "apiFlow": "IPC communication between renderer and main process...",
  "componentFlow": "Hierarchical React components with Zustand state...",
  "criticalIssues": [
    {
      "type": "security",
      "severity": "high", 
      "description": "API keys may be exposed...",
      "recommendation": "Use environment variables properly..."
    }
  ],
  "recommendations": [
    {
      "category": "performance",
      "priority": "high",
      "description": "Implement code splitting...",
      "implementation": "Use React.lazy() and Suspense..."
    }
  ]
}
```

## Performance Considerations

### Token Management
- Large files are automatically truncated (first/last 50 lines)
- File content is limited to prevent API token overflow
- Intelligent code summarization for complex projects

### Caching
- Analysis results are stored in application state
- No automatic re-analysis unless explicitly triggered
- Results persist until project is changed

### Fallback Behavior
- Works without API keys using static analysis
- Graceful degradation when LLM calls fail
- Clear indication of analysis source (LLM vs fallback)

## Troubleshooting

### Common Issues

**"LLM unavailable" message**:
- Check API key configuration in `.env` file
- Verify API key is valid and has sufficient credits
- Check network connectivity

**Analysis fails or returns empty results**:
- Project may be too large for token limits
- Try with smaller projects first
- Check console for detailed error messages

**Slow analysis performance**:
- Large projects take longer to analyze
- Consider upgrading to faster LLM models
- Reduce file content by excluding non-essential files

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This will show:
- Prompt content sent to LLM
- Raw LLM responses
- Token usage statistics
- Fallback triggers

## Limitations

- **Language Support**: Currently optimized for JavaScript/Node.js projects
- **Token Limits**: Very large projects may hit API token limits
- **API Costs**: LLM calls consume API credits/tokens
- **Network Dependency**: Requires internet connection for LLM features
- **Response Time**: LLM analysis takes 10-30 seconds depending on project size

## Future Enhancements

- **Multi-language Support**: Python, Java, C# analysis
- **Local LLM Integration**: Offline analysis with local models
- **Incremental Analysis**: Only analyze changed files
- **Custom Prompts**: User-defined analysis templates
- **Analysis History**: Track insights over time
- **Team Collaboration**: Share analysis results

## Security Notes

- API keys are stored in environment variables only
- No code is permanently stored by LLM providers
- Analysis happens in real-time, no data persistence
- Consider using API key rotation for production use