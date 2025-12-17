require('dotenv').config();
const ollamaClient = require('./backend/modules/ollamaClient');

async function testOllama() {
  console.log('🔍 Testing Ollama Connection...\n');
  
  // Check connection
  console.log('1. Checking connection...');
  const connectionResult = await ollamaClient.checkConnection();
  
  if (connectionResult.connected) {
    console.log('✅ Ollama is connected!');
    console.log(`📦 Available models: ${connectionResult.availableModels.join(', ')}`);
    console.log(`🔗 URL: ${ollamaClient.baseURL}`);
    console.log(`🤖 Default model: ${ollamaClient.model}\n`);
    
    // Test generation
    console.log('2. Testing text generation...');
    const generateResult = await ollamaClient.generate(
      'Say "Hello from Ollama!" in one sentence.',
      'You are a helpful assistant.'
    );
    
    if (generateResult.success) {
      console.log('✅ Generation successful!');
      console.log(`Response: ${generateResult.response}\n`);
    } else {
      console.log('❌ Generation failed:', generateResult.error);
    }
  } else {
    console.log('❌ Ollama is not connected');
    console.log(`Error: ${connectionResult.error}`);
    if (connectionResult.suggestion) {
      console.log(`💡 ${connectionResult.suggestion}`);
    }
  }
}

testOllama().catch(console.error);
