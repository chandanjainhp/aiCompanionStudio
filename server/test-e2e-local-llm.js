// Complete E2E test: Auth -> Project -> Conversation -> Message with Local LLM

const BASE_URL = 'http://localhost:3000/api/v1';
let token = null;

async function request(method, endpoint, body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  
  return { status: res.status, data };
}

async function runTest() {
  console.log('🧪 Testing Complete Chat Flow with Local LLM\n');
  
  try {
    // 1. Register
    console.log('1️⃣  Registering user...');
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test@123456';
    
    const registerRes = await request('POST', '/auth/register', {
      email,
      password,
      name: 'Test User',
    });
    
    if (registerRes.status !== 201) {
      throw new Error(`Register failed: ${registerRes.status} ${JSON.stringify(registerRes.data)}`);
    }
    console.log('✅ Registration successful\n');
    
    // Use the token from registration
    token = registerRes.data.data.accessToken;
    
    // 2. Login (optional - we already have a token, but let's test login too)
    console.log('2️⃣  Logging in with same credentials...');
    const loginRes = await request('POST', '/auth/login', { email, password });
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.data)}`);
    }
    console.log('✅ Login successful\n');
    
    // Update token from login response (should be the same or refreshed)
    token = loginRes.data.data.accessToken;
    
    // 3. Create Project
    console.log('3️⃣  Creating project...');
    const projectRes = await request('POST', '/projects', {
      name: 'Local LLM Test Project',
      description: 'Testing local LLM integration',
    });
    
    if (projectRes.status !== 201) {
      throw new Error(`Project creation failed: ${projectRes.status} ${JSON.stringify(projectRes.data)}`);
    }
    console.log('✅ Project created\n');
    
    const projectId = projectRes.data.data.id;
    
    // 4. Create Conversation
    console.log('4️⃣  Creating conversation...');
    const convRes = await request('POST', `/projects/${projectId}/conversations`, {
      title: 'Local LLM Test Conversation',
    });
    
    if (convRes.status !== 201) {
      throw new Error(`Conversation creation failed: ${convRes.status} ${JSON.stringify(convRes.data)}`);
    }
    console.log('✅ Conversation created\n');
    
    const conversationId = convRes.data.data.id;
    
    // 5. Send Message (This will trigger Local LLM)
    console.log('5️⃣  Sending message to Local LLM...');
    console.log('   Message: "What are the benefits of using local LLMs?"\n');
    
    const msgRes = await request('POST', `/projects/${projectId}/conversations/${conversationId}/messages`, {
      content: 'What are the benefits of using local LLMs?',
    });
    
    if (msgRes.status !== 201) {
      throw new Error(`Message send failed: ${msgRes.status} ${JSON.stringify(msgRes.data)}`);
    }
    console.log('✅ Message sent successfully!\n');
    
    const messages = msgRes.data.data;
    
    console.log('📨 Conversation Messages:');
    console.log('─'.repeat(70));
    
    messages.forEach((msg, i) => {
      const prefix = msg.role === 'user' ? '👤 You' : '🤖 AI';
      const content = msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '');
      console.log(`${i + 1}. ${prefix}: ${content}`);
    });
    
    console.log('─'.repeat(70));
    console.log('');
    console.log('✨ Complete E2E flow successful!');
    console.log('✨ Local LLM is integrated and responding!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest();
