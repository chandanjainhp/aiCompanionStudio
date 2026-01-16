# ⚡ IMMEDIATE ACTION PLAN
**Critical Fixes Required to Enable Chat Functionality**

---

## 🔴 FIX #1: Detect Temporary Conversation IDs (5 min)

**Problem:** User can't send messages - backend says "Conversation not found"  
**Root Cause:** Frontend uses temporary timestamp IDs before creating real conversations

**File to Edit:** [server/src/controllers/chat.controller.js](server/src/controllers/chat.controller.js#L76-90)

**Current Code (Line ~76):**
```javascript
export const sendMessage = asyncHandler(async (req, res) => {
  const { projectId, conversationId } = req.params;
  const { content, stream } = req.body;
  const userId = req.user.userId;

  if (!content || content.trim().length === 0) {
    throw new BadRequestError('Message content cannot be empty');
  }
  // ← INSERT CODE HERE
```

**Replace With:**
```javascript
export const sendMessage = asyncHandler(async (req, res) => {
  const { projectId, conversationId } = req.params;
  const { content, stream } = req.body;
  const userId = req.user.userId;

  if (!content || content.trim().length === 0) {
    throw new BadRequestError('Message content cannot be empty');
  }

  // 🔴 CHECK FOR TEMPORARY ID (ALL DIGITS, TIMESTAMP-LIKE)
  if (/^\d{13,}$/.test(conversationId)) {
    throw new BadRequestError(
      'Conversation does not exist yet. Please click "New Conversation" button first.'
    );
  }

  // Check quota
  console.log(`🔍 [sendMessage] Checking quota for user ${userId}...`);
  const quotaCheck = await quotaService.checkChatQuota(userId);
  console.log(`✅ [sendMessage] Quota check passed:`, quotaCheck);

  // ... rest remains same
```

---

## 🔴 FIX #2: Fix JWT Expiry Configuration (2 min)

**Problem:** Tokens expire after 15 minutes despite setting 1440 in .env  
**Root Cause:** Code reads `JWT_EXPIRES_IN` but .env only sets `JWT_EXPIRY_MINUTES`

**File to Edit:** [server/.env](server/.env)

**Current Content:**
```env
JWT_EXPIRY_MINUTES=1440
JWT_REFRESH_EXPIRY_MINUTES=10080
```

**Add This Line:**
```env
JWT_EXPIRES_IN=1440m
JWT_EXPIRY_MINUTES=1440
JWT_REFRESH_EXPIRY_MINUTES=10080
```

---

## 🔴 FIX #3: Frontend Must Store Conversation ID After Creation (10 min)

**Problem:** Frontend creates conversation but doesn't use the returned ID  
**Root Cause:** Missing state update after API call

**Files to Check/Edit:**
- [client/src/pages/ChatPage.tsx](client/src/pages/ChatPage.tsx) (not visible in attachments)

**What to Add:**

After calling `apiClient.createConversation()`, you MUST:

```typescript
const handleCreateConversation = async (title?: string) => {
  try {
    // Call API
    const newConversation = await apiClient.createConversation(projectId, title);
    
    // 🔴 CRITICAL: Store the REAL ID (not temp ID)
    setConversationId(newConversation.id);  // ← This is the key line
    
    // Reset messages for new conversation
    setMessages([]);
    
    // Optionally update projects store
    // projectsStore.addConversationToProject(projectId, newConversation);
    
  } catch (error) {
    // Handle error
    console.error('Failed to create conversation:', error);
  }
};
```

Then when sending message:
```typescript
const handleSendMessage = async (content: string) => {
  try {
    // ✅ NOW uses real conversation ID (stored in state)
    const result = await apiClient.sendMessage(
      projectId,
      conversationId,  // ← This is now the REAL ID
      content
    );
    
    // Process response
    setMessages(prev => [...prev, result.userMessage, result.assistantMessage]);
    
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
```

---

## 🟠 FIX #4: Add Rate Limiting to Auth Endpoints (15 min)

**Problem:** Attackers can brute force passwords  
**Files to Edit:**
- [server/src/routes/auth.router.js](server/src/routes/auth.router.js)
- [server/src/middlewares/rate-limit.js](server/src/middlewares/rate-limit.js)

**Check if rate-limit.js exists and has auth limiters:**

First, check what's in rate-limit.js. If not present, create it:

```javascript
// server/src/middlewares/rate-limit.js
import rateLimit from 'express-rate-limit';

// Auth endpoints: 5 attempts per 15 minutes per IP
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // 5 attempts
  message: 'Too many login attempts. Try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP endpoints: 3 attempts per 10 minutes per email
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutes
  max: 3,                      // 3 attempts
  keyGenerator: (req) => req.body.email,  // Rate limit per email
  message: 'Too many OTP attempts. Try again later.',
});

// Chat: already exists, keep it
export const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 20,              // 20 messages per minute
  message: 'Too many messages. Slow down.',
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 requests per minute
  message: 'Too many requests. Try again later.',
});
```

**Then in auth.router.js, add the limiter:**

```javascript
import { loginRateLimiter, otpRateLimiter } from '../middlewares/rate-limit.js';

// Add before each endpoint:
router.post('/login', loginRateLimiter, login);
router.post('/send-otp', otpRateLimiter, sendOTP);
router.post('/verify-otp', otpRateLimiter, verifyOTP);
router.post('/resend-otp', otpRateLimiter, resendOTP);
```

---

## 🟠 FIX #5: Implement Token Refresh on Frontend (20 min)

**Problem:** After 15 (or 1440) minutes, user is automatically logged out  
**File to Edit:** [client/src/store/authStore.ts](client/src/store/authStore.ts)

**Add Token Refresh Timer:**

Add this at the end of the auth store (after all methods):

```typescript
// Auto-refresh token before expiry
const scheduleTokenRefresh = (token: string, expiresIn?: number) => {
  try {
    // Try to decode token to get expiry
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = (decoded.exp || 0) * 1000;  // Convert to ms
    const now = Date.now();
    const refreshIn = Math.max(60000, expiresAt - now - 60000);  // Refresh 1 min before expiry
    
    if (refreshIn > 0) {
      console.log(`⏱️ Token refresh scheduled in ${Math.round(refreshIn / 1000)} seconds`);
      
      setTimeout(() => {
        console.log('🔄 Auto-refreshing token...');
        get().refreshAccessToken().catch((error) => {
          console.error('Failed to auto-refresh token:', error);
        });
      }, refreshIn);
    }
  } catch (error) {
    console.warn('Could not schedule token refresh:', error);
  }
};

// Call this after successful login or refresh
// In the login method, after setting state:
set({
  user,
  accessToken: token,
  isAuthenticated: true,
  isLoading: false,
});

// Then call:
scheduleTokenRefresh(token);
```

**Better approach - Add 401 Interceptor:**

When API returns 401, trigger refresh:

```typescript
// In api.ts - in handleResponse method
if (!response.ok) {
  if (response.status === 401) {
    console.log('🔄 Got 401 - refreshing token and retrying...');
    
    try {
      await authStore.refreshAccessToken();
      
      // Retry the original request with new token
      const retryResponse = await fetch(response.url, {
        method: response.method,
        headers: this.getHeaders(),  // ← Now has new token
        body: /* original body */
      });
      
      return this.handleResponse(retryResponse);
    } catch (refreshError) {
      // If refresh fails, logout user
      authStore.logout();
      throw new Error('Session expired. Please login again.');
    }
  }
  
  // ... rest of error handling
}
```

---

## 📋 VERIFICATION CHECKLIST

After making fixes, verify:

- [ ] **FIX #1:** Server restarted, `npm run dev` in server folder
- [ ] **FIX #2:** Restart server after .env change
- [ ] **FIX #3:** Frontend code updated and compiled
- [ ] **FIX #4:** Rate limiter installed: `npm install express-rate-limit` in server
- [ ] **FIX #5:** Token refresh logic added to frontend

**Test Flow:**
1. ✅ Login with `backupid849@gmail.com` / password
2. ✅ Click "New Conversation" button
3. ✅ Verify real conversation ID appears in URL/state
4. ✅ Type message and send
5. ✅ Verify AI response appears
6. ✅ Wait 15+ min → Token expires → Try to send message → Should auto-refresh

---

## 🎯 NEXT STEPS AFTER URGENT FIXES

Once the 4 CRITICAL bugs are fixed:

1. **Standardize Error Responses** (30 min)
   - All endpoints return `{ success, message, errorCode }`
   - Frontend can handle consistently

2. **Add Input Validation** (1 hour)
   - Validate all POST body inputs
   - Use Zod or Joi

3. **Add Tests** (2 hours)
   - Unit tests for auth flow
   - Integration tests for chat

4. **Documentation** (1 hour)
   - API docs with Swagger
   - Setup guide for new developers

---

## 📞 QUICK REFERENCE

**Quick Test Commands:**

```bash
# Test conversation creation
curl -X POST http://localhost:3000/api/v1/projects/cmk123/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# Response should have real UUID ID (not timestamp)

# Test message send (use real ID from above)
curl -X POST http://localhost:3000/api/v1/projects/cmk123/conversations/REAL_ID/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello"}'

# Should succeed now!
```

