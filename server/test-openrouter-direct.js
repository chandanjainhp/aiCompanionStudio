import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
    'X-Title': process.env.APP_NAME || 'AI Companion Studio',
  },
});

async function testOpenRouter() {
  try {
    console.log('🧪 Testing OpenRouter API...\n');
    console.log('Configuration:');
    console.log('  Base URL:', process.env.OPENROUTER_BASE_URL);
    console.log('  API Key:', process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ NOT SET');
    console.log('  App URL:', process.env.APP_URL);
    console.log('  App Name:', process.env.APP_NAME);
    console.log('');

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ OPENROUTER_API_KEY is not set!');
      process.exit(1);
    }

    console.log('📤 Sending test message to OpenRouter...\n');

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello and tell me your model name.' }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log('✅ OpenRouter API Response:\n');
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('\n📝 Assistant Message:');
    console.log(response.choices[0].message.content);
    console.log('\n📊 Tokens used:');
    console.log(`   Prompt: ${response.usage.prompt_tokens}`);
    console.log(`   Completion: ${response.usage.completion_tokens}`);
    console.log(`   Total: ${response.usage.total_tokens}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ OpenRouter API Error:\n');
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testOpenRouter();
