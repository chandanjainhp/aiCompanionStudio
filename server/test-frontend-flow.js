// Simulate exactly what frontend does
const BASE_URL = 'http://localhost:3000/api/v1';

async function testFrontendFlow() {
  console.log('🧪 SIMULATING FRONTEND REGISTRATION & LOGIN FLOW\n');

  const testEmail = `frontend-test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!@';
  const testName = 'Frontend Test User';

  try {
    // Step 1: Frontend Register
    console.log('1️⃣  Frontend REGISTER step...');
    console.log('   Sending:', { name: testName, email: testEmail, password: testPassword });

    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
      credentials: 'include',
    });

    console.log('   Response status:', registerRes.status);
    const registerData = await registerRes.json();
    console.log('   Response:', JSON.stringify(registerData, null, 2));

    if (!registerData.success) {
      throw new Error(`Registration failed: ${registerData.message || registerData.error?.message}`);
    }

    console.log('   ✅ Registration successful');
    console.log('   User ID:', registerData.data.user.id);
    console.log('   Access Token:', registerData.data.accessToken?.substring(0, 30) + '...');
    console.log();

    // Step 2: Logout (simulate user closing browser)
    console.log('2️⃣  Simulating user logout/close browser...');
    console.log('   (Frontend would clear tokens from localStorage)\n');

    // Step 3: Frontend Login with same credentials
    console.log('3️⃣  Frontend LOGIN step with same credentials...');
    console.log('   Sending:', { email: testEmail, password: testPassword });

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
      credentials: 'include',
    });

    console.log('   Response status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('   Response:', JSON.stringify(loginData, null, 2));

    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.message || 'Unknown error'}`);
    }

    console.log('   ✅ Login successful');
    console.log('   User ID:', loginData.data.user.id);
    console.log('   Same user:', registerData.data.user.id === loginData.data.user.id ? '✅ YES' : '❌ NO');
    console.log('   Access Token:', loginData.data.accessToken?.substring(0, 30) + '...');

    console.log('\n✅✅✅ FRONTEND FLOW WORKS CORRECTLY ✅✅✅');

  } catch (error) {
    console.error('\n❌ Frontend flow failed:', error.message);
    process.exit(1);
  }
}

testFrontendFlow();
