// Test: User Registration -> Project Creation -> Chat Flow
const BASE_URL = 'http://localhost:3000/api/v1';

let accessToken = '';
let userId = '';
let projectId = '';
let conversationId = '';

async function testUserFlow() {
  console.log('🎯 COMPLETE USER FLOW TEST\n');
  console.log('═'.repeat(70));

  try {
    // ============ STEP 1: REGISTER USER ============
    console.log('\n1️⃣  REGISTERING NEW USER');
    console.log('─'.repeat(70));

    const testEmail = `flow-test-${Date.now()}@example.com`;
    const testPassword = 'SecurePass123!@';
    const testName = 'Flow Test User';

    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
    });

    if (!registerRes.ok) {
      throw new Error(`Registration failed: ${registerRes.statusText}`);
    }

    const registerData = await registerRes.json();
    userId = registerData.data.user.id;
    accessToken = registerData.data.accessToken;

    console.log('✅ User registered successfully');
    console.log('   Email:', testEmail);
    console.log('   User ID:', userId);
    console.log('   Token:', accessToken.substring(0, 30) + '...');

    // ============ STEP 2: CREATE PROJECT ============
    console.log('\n2️⃣  CREATING PROJECT');
    console.log('─'.repeat(70));

    const projectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Test Chat Project',
        description: 'Testing chat functionality',
      }),
    });

    if (!projectRes.ok) {
      const errorData = await projectRes.json();
      throw new Error(`Project creation failed: ${errorData.message || projectRes.statusText}`);
    }

    const projectData = await projectRes.json();
    projectId = projectData.data.id;

    console.log('✅ Project created successfully');
    console.log('   Project ID:', projectId);
    console.log('   Project Name:', projectData.data.name);

    // ============ STEP 3: CREATE CONVERSATION ============
    console.log('\n3️⃣  CREATING CONVERSATION');
    console.log('─'.repeat(70));

    const convRes = await fetch(`${BASE_URL}/projects/${projectId}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: 'Test Chat Conversation',
      }),
    });

    if (!convRes.ok) {
      const errorData = await convRes.json();
      throw new Error(`Conversation creation failed: ${errorData.message || convRes.statusText}`);
    }

    const convData = await convRes.json();
    conversationId = convData.data.id;

    console.log('✅ Conversation created successfully');
    console.log('   Conversation ID:', conversationId);
    console.log('   Title:', convData.data.title);

    // ============ STEP 4: SEND MESSAGE ============
    console.log('\n4️⃣  SENDING MESSAGE');
    console.log('─'.repeat(70));

    const messageRes = await fetch(
      `${BASE_URL}/projects/${projectId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: 'Hello, test message!',
        }),
      }
    );

    if (!messageRes.ok) {
      const errorData = await messageRes.json();
      throw new Error(`Message sending failed: ${errorData.message || messageRes.statusText}`);
    }

    const messageData = await messageRes.json();

    console.log('✅ Message sent successfully');
    console.log('   Message ID:', messageData.data.id);
    console.log('   Content:', messageData.data.content);
    console.log('   User Message ID:', messageData.data.userMessageId);

    // ============ STEP 5: VERIFY DATA ============
    console.log('\n5️⃣  VERIFYING DATA');
    console.log('─'.repeat(70));

    // Get all conversations
    const getConvRes = await fetch(`${BASE_URL}/projects/${projectId}/conversations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const getConvData = await getConvRes.json();
    console.log('✅ Retrieved conversations:');
    console.log(`   Total: ${getConvData.data.length}`);
    getConvData.data.forEach(conv => {
      console.log(`   - ${conv.title} (${conv.id})`);
    });

    // Get specific conversation
    const getSpecificRes = await fetch(`${BASE_URL}/projects/${projectId}/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const getSpecificData = await getSpecificRes.json();
    console.log('\n✅ Retrieved specific conversation:');
    console.log(`   Title: ${getSpecificData.data.title}`);
    console.log(`   Messages: ${getSpecificData.data.messages?.length || 0}`);

    // ============ RESULTS ============
    console.log('\n' + '═'.repeat(70));
    console.log('✅ COMPLETE USER FLOW TEST SUCCESSFUL');
    console.log('═'.repeat(70));

    console.log('\n📊 SUMMARY:');
    console.log('   User Registration: ✅');
    console.log('   Project Creation: ✅');
    console.log('   Conversation Creation: ✅');
    console.log('   Message Sending: ✅');
    console.log('   Data Retrieval: ✅');

    console.log('\n🔑 TEST DATA:');
    console.log('   Email:', testEmail);
    console.log('   User ID:', userId);
    console.log('   Project ID:', projectId);
    console.log('   Conversation ID:', conversationId);

    console.log('\n✨ RESULT: Complete workflow is working end-to-end!');
    console.log('═'.repeat(70) + '\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\n📊 Failed at:');
    if (!userId) console.error('   - User registration');
    else if (!projectId) console.error('   - Project creation');
    else if (!conversationId) console.error('   - Conversation creation');
    else console.error('   - Message sending');
    process.exit(1);
  }
}

testUserFlow();
