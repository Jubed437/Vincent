class OllamaClient {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama2';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT) || 60000;
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return {
          connected: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        connected: true,
        models: data.models || [],
        availableModels: (data.models || []).map(m => m.name)
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        suggestion: 'Make sure Ollama is running. Start it with: ollama serve'
      };
    }
  }

  async generate(prompt, systemPrompt = '') {
    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          system: systemPrompt,
          stream: false
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response,
        model: data.model,
        context: data.context
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async chat(messages) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: false
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        model: data.model
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OllamaClient();
