import { callLocalLLM } from './src/services/local-llm.service.js';
import { config } from './src/config/env.js';

console.log('🧪 Testing Local LLM Integration\n');
console.log('📋 Configuration:');
console.log('  - Local LLM Enabled:', config.localLLMEnabled);
console.log('  - Endpoint:', config.localLLMEndpoint);
console.log('  - Model:', config.localLLMModel);
console.log('');

if (!config.localLLMEnabled) {
  console.error('❌ Local LLM is disabled in config');
  process.exit(1);
}

try {
  console.log('🔍 Testing Local LLM API call...\n');
  
  const userMessage = 'What is 2+2?';
  const history = [];
  const systemPrompt = 'You are a helpful AI assistant. Answer questions concisely.';
  
  console.log('📤 Sending request:');
  console.log('  User: ' + userMessage);
  console.log('  Endpoint: ' + config.localLLMEndpoint);
  console.log('');
  
  const response = await callLocalLLM(userMessage, history, systemPrompt);
  
  console.log('✅ Success!\n');
  console.log('📥 AI Response:');
  console.log('  ' + response);
  console.log('');
  console.log('✨ Local LLM integration is working!');
} catch (error) {
  console.error('❌ Error testing Local LLM:');
  console.error('  ' + error.message);
  console.error('');
  console.error('💡 Make sure:');
  console.error('  1. Local LLM is running on ' + config.localLLMEndpoint);
  console.error('  2. .env has LOCAL_LLM_ENABLED=true');
  console.error('  3. Network connection is working');
  process.exit(1);
}
