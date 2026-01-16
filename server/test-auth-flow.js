// Test authentication flow
const BASE_URL = 'http://localhost:3000/api/v1';

async function testAuthFlow() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  console.log('🧪 Starting Auth Flow Test\n');
  console.log('📧 Test Email:', testEmail);
  console.log('🔐 Test Password:', testPassword);
  console.log('👤 Test Name:', testName);
  console.log('\n');

  try {
    // Test 1: Register
    console.log('📝 [TEST 1] Registering user...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: testName,
      }),
    });

    console.log('Status:', registerResponse.status);
    const registerData = await registerResponse.json();
    console.log('Response:', JSON.stringify(registerData, null, 2));

    if (!registerData.success) {
      throw new Error(`Registration failed: ${registerData.error?.message}`);
    }

    console.log('✅ Registration successful!');
    console.log('User ID:', registerData.data.user.id);
    console.log('Access Token:', registerData.data.accessToken?.substring(0, 20) + '...');
    console.log('\n');

    // Test 2: Login
    console.log('🔑 [TEST 2] Logging in with new credentials...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log('Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Response:', JSON.stringify(loginData, null, 2));

    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.error?.message}`);
    }

    console.log('✅ Login successful!');
    console.log('User ID:', loginData.data.user.id);
    console.log('Access Token:', loginData.data.accessToken?.substring(0, 20) + '...');
    console.log('\n');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuthFlow();
