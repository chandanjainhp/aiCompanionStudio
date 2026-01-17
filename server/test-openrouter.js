/**
 * Test OpenRouter Integration
 * Run with: node test-openrouter.js
 */

import dotenv from 'dotenv';
dotenv.config();

import { callOpenRouter, callOpenRouterWithContext } from './src/services/openrouter.service.js';

console.log('🧪 [TEST] OpenRouter Service Test\n');

// Test Configuration
console.log('📋 Configuration Check:');
console.log('  OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('  OPENROUTER_BASE_URL:', process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1');
console.log('  APP_URL:', process.env.APP_URL || 'http://localhost:5173');
console.log('  APP_NAME:', process.env.APP_NAME || 'AI Companion Studio');
console.log('');

// Test 1: Basic API Call
async function testBasicCall() {
  console.log('🧪 TEST 1: Basic OpenRouter Call');
  console.log('─'.repeat(50));
  
  try {
    const response = await callOpenRouter(
      'openai/gpt-3.5-turbo',
      [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ],
      0.7,
      100
    );
    
    console.log('✅ SUCCESS');
    console.log('Response:', response);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ FAILED');
    console.error('Error:', error.message);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    console.log('');
    return false;
  }
}

// Test 2: With Context
async function testContextCall() {
  console.log('🧪 TEST 2: OpenRouter Call with Context');
  console.log('─'.repeat(50));
  
  try {
    const project = {
      model: 'openai/gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 100,
    };
    
    const userMessage = 'What is 2+2?';
    const conversationHistory = [];
    const systemPrompt = 'You are a helpful math tutor.';
    
    const response = await callOpenRouterWithContext(
      project,
      userMessage,
      conversationHistory,
      systemPrompt
    );
    
    console.log('✅ SUCCESS');
    console.log('Response:', response);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ FAILED');
    console.error('Error:', error.message);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    console.log('');
    return false;
  }
}

// Run Tests
async function runTests() {
  console.log('🚀 Starting OpenRouter Integration Tests\n');
  
  const test1 = await testBasicCall();
  const test2 = await testContextCall();
  
  console.log('📊 Test Results:');
  console.log('  Test 1 (Basic Call):', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('  Test 2 (With Context):', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('');
  
  if (test1 && test2) {
    console.log('✅ All tests passed! OpenRouter is working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
