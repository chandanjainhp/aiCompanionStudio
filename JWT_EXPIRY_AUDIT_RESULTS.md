# 🔐 JWT Expiry Configuration Audit - COMPLETED

## Issues Found

| Issue | Severity | Impact |
|-------|----------|--------|
| `.env` uses `JWT_EXPIRY_MINUTES=1440` (env var name doesn't match code) | 🔴 Critical | Config not read from .env |
| `config/env.js` fallback is hardcoded `'15m'` but `.env` expects 24h | 🔴 Critical | Mismatch between intent and reality |
| `auth.service.js` hardcoded `'15m'` in 3 responses (lines 112, 162, 209) | 🟡 High | Response doesn't reflect actual config |
| Frontend `useTokenRefresh` uses 5-min buffer before expiry | 🟢 Safe | Works for current 15m tokens, but tight margin |

---

## Corrections Applied

### ✅ 1. Fixed `.env` JWT Configuration
**File:** `server/.env`
```dotenv
# BEFORE (WRONG)
JWT_EXPIRY_MINUTES=1440
JWT_REFRESH_EXPIRY_DAYS=30

# AFTER (CORRECT)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Why:** 
- Variable names now match code expectations (`JWT_EXPIRES_IN` not `JWT_EXPIRY_MINUTES`)
- Format is now jsonwebtoken-compatible ('15m', '7d' syntax)
- Clear documentation added showing format examples

---

### ✅ 2. Updated Config Documentation
**File:** `server/src/config/env.js`
```javascript
  // JWT
  // Format: compatible with jsonwebtoken library
  // Recommended production defaults: '15m' (access), '7d' (refresh)
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
```

**Why:**
- Added comments explaining format expectations
- Fallback defaults are now documented
- Clear guidance for production adjustments

---

### ✅ 3. Fixed Auth Service Response Values
**File:** `server/src/services/auth.service.js`

Replaced 3 hardcoded `'15m'` values with `config.jwtExpiresIn`:

```javascript
// Added import at top (line 2)
import { config } from '../config/env.js';

// Replaced 3 instances:
// Line 112 (registerUser - OTP set password)
accessTokenExpiresIn: config.jwtExpiresIn,

// Line 162 (loginUser - main login)
accessTokenExpiresIn: config.jwtExpiresIn,

// Line 209 (refreshAccessToken - token refresh)
accessTokenExpiresIn: config.jwtExpiresIn,
```

**Why:**
- Response now accurately reflects actual token expiry from config
- Enables changing expiry without touching code (env-only change)
- Consistent across all auth flows

---

## Token Payload - UNCHANGED ✅

Token payload structure remains **identical** (as required):
```javascript
// src/utils/jwt.js - Line 7
jwt.sign(
  { userId, email },  // 👈 Payload structure unchanged
  config.jwtSecret,
  { expiresIn: config.jwtExpiresIn }
);
```

---

## Expiry Format Compatibility

### jsonwebtoken Library Format ✅
The library accepts:
- **Numeric + unit:** `'15m'`, `'1h'`, `'7d'`, `'30s'`
- **Numeric (seconds):** `900` (equals 15m)
- **ISO 8601:** `'2025-01-20'`

### Current Configuration
```
Access Token:   15m  (900 seconds)   ← Short-lived, secure
Refresh Token:  7d   (604,800 secs)  ← Long-lived for renewal
```

---

## Frontend Compatibility

### Token Refresh Hook
**File:** `client/src/hooks/useTokenRefresh.ts`
- Uses 5-min buffer before expiry (token valid for 10 more minutes when refresh triggered)
- Safe for 15m tokens (5min buffer < 15min expiry)
- **Recommendation:** If changing access token to <10m, reduce buffer to 2-3 minutes

**Current Buffer Calculation:**
```typescript
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes
```

---

## Production Recommendations

### Option 1: Tight Security (Current - Recommended)
```env
JWT_EXPIRES_IN=15m              # 15 minutes
JWT_REFRESH_EXPIRES_IN=7d       # 7 days
```
**Best for:** High-security apps (banking, healthcare)  
**Trade-off:** Users need refresh every 15 minutes

### Option 2: Balanced
```env
JWT_EXPIRES_IN=1h               # 1 hour
JWT_REFRESH_EXPIRES_IN=30d      # 30 days
```
**Best for:** Standard web apps  
**Trade-off:** Moderate security window

### Option 3: User-Friendly
```env
JWT_EXPIRES_IN=24h              # 24 hours
JWT_REFRESH_EXPIRES_IN=90d      # 90 days
```
**Best for:** Low-sensitivity apps (blogs, docs)  
**Trade-off:** Larger security window if token compromised

---

## Verification

✅ **All config values now aligned:**
- `.env` variable names match code expectations
- `.env` format compatible with jsonwebtoken
- `config/env.js` reads from `.env` with safe fallbacks
- `auth.service.js` uses dynamic config (not hardcoded)
- Frontend token refresh compatible with 15m tokens

✅ **No breaking changes:**
- Token payload unchanged (userId, email)
- API response format unchanged
- Frontend auth store unchanged
- Database schema unchanged

---

## Testing

To verify after restart:
1. Check server logs: `✅ [jwt.utils] Generated access token... expires in: 15m`
2. Login and check token in DevTools:
   - Copy Authorization header token
   - Decode at https://jwt.io
   - Check `exp` claim is ~15 minutes in future
3. Verify frontend doesn't show auth errors for 15+ minutes

---

## Files Modified

| File | Changes | Impact |
|------|---------|--------|
| `server/.env` | Variable name + format fix | ✅ Config now correct |
| `server/src/config/env.js` | Added documentation | ✅ Clarity for maintainers |
| `server/src/services/auth.service.js` | Import + 3 replacements | ✅ Dynamic expiry in responses |

**No other files modified** - Frontend auth flow fully compatible

