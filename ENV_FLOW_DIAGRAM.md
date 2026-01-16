# 🔗 Environment Variables Flow Diagram

---

## How Environment Variables Flow in Your Server

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. .env File                                  │
│  ────────────────────────────────────────────────────────────   │
│  DATABASE_URL=postgresql://...                                   │
│  JWT_SECRET=your-secret                                          │
│  OPENROUTER_API_KEY=sk-or-v1-...                                │
│  PORT=3000                                                       │
│  NODE_ENV=development                                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ dotenv.config()
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│          2. process.env (Node.js Global)                         │
│  ────────────────────────────────────────────────────────────   │
│  process.env.DATABASE_URL                                        │
│  process.env.JWT_SECRET                                          │
│  process.env.OPENROUTER_API_KEY                                 │
│  process.env.PORT                                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ src/config/env.js
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│          3. config Object (Centralized)                          │
│  ────────────────────────────────────────────────────────────   │
│  config = {                                                      │
│    databaseUrl: process.env.DATABASE_URL                        │
│    jwtSecret: process.env.JWT_SECRET                            │
│    openrouterApiKey: process.env.OPENROUTER_API_KEY            │
│    port: parseInt(process.env.PORT)                            │
│  }                                                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬──────────────┐
        │             │             │              │
        ▼             ▼             ▼              ▼
    ┌────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐
    │ Routes │  │Services │  │Database │  │Middlewares   │
    │        │  │         │  │         │  │              │
    │config  │  │config   │  │config   │  │config        │
    └────────┘  └─────────┘  └─────────┘  └──────────────┘
```

---

## File Structure

```
server/
├── .env                          ← ① Env file (git ignored)
├── src/
│   ├── index.js                  ← ② Loads config & starts server
│   ├── config/
│   │   └── env.js                ← ③ Centralizes all env vars
│   │   └── database.js           ← Uses: config.databaseUrl
│   ├── services/
│   │   └── openrouter.service.js ← Uses: config.openrouterApiKey
│   ├── middlewares/
│   │   └── auth.js               ← Uses: config.jwtSecret
│   └── routes/
│       └── auth.routes.js         ← Uses: config.port
```

---

## Step-by-Step Flow

### Step 1: Server Starts

```bash
npm run dev
```

### Step 2: Load Environment Variables

**File**: `server/src/index.js`
```javascript
import dotenv from 'dotenv';

// This loads all variables from .env file
dotenv.config();

console.log('✅ Environment loaded');
```

### Step 3: Access Through Config

**File**: `server/src/config/env.js`
```javascript
export const config = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  // ... more variables
};
```

### Step 4: Use in Application

**Example 1 - Database Connection**:
```javascript
// server/src/config/database.js
import { config } from './env.js';

const prisma = new PrismaClient({
  datasources: {
    db: { url: config.databaseUrl }  // ← Uses config
  }
});
```

**Example 2 - API Call**:
```javascript
// server/src/services/openrouter.service.js
import { config } from '../config/env.js';

const response = await fetch(config.openrouterBaseUrl, {
  headers: {
    'Authorization': `Bearer ${config.openrouterApiKey}`  // ← Uses config
  }
});
```

**Example 3 - JWT Authentication**:
```javascript
// server/src/middlewares/auth.js
import { config } from '../config/env.js';

const token = jwt.sign(payload, config.jwtSecret);  // ← Uses config
```

---

## Real Example from Your Code

### Your .env File
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_companion_studio
JWT_SECRET=d4c8e9f2a5b1c3e7d9a2f4c6e8b0a2d4c6e8f0a2b4d6e8f0a2c4e6f8a0b2d4
OPENROUTER_API_KEY=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
APP_URL=http://localhost:5173
PORT=3000
```

### Your Config File
```javascript
// src/config/env.js
export const config = {
  databaseUrl: process.env.DATABASE_URL,
  // Result: "postgresql://postgres:postgres@localhost:5432/ai_companion_studio"
  
  jwtSecret: process.env.JWT_SECRET,
  // Result: "d4c8e9f2a5b1c3e7d9a2f4c6e8b0a2d4c6e8f0a2b4d6e8f0a2c4e6f8a0b2d4"
  
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  // Result: "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"
  
  port: parseInt(process.env.PORT || '3000'),
  // Result: 3000
};
```

### Using in Application
```javascript
// Any file in the app
import { config } from './config/env.js';

// Access the actual values:
console.log(config.port);                // 3000
console.log(config.databaseUrl);         // postgresql://...
console.log(config.openrouterApiKey);    // sk-or-v1-...
```

---

## Why This Approach?

| Benefit | Reason |
|---------|--------|
| **Centralized** | All config in one place (`src/config/env.js`) |
| **Type-safe** | IDE autocomplete for `config.*` properties |
| **Validation** | Check variables at startup, not at runtime |
| **Security** | No hardcoded secrets in code |
| **Flexible** | Easy to add/modify environment variables |
| **Production-ready** | Works with all deployment platforms |

---

## Verification

### Check All Variables Are Loaded

```bash
cd server
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ [Config] Production environment validation passed
🚀 Server is running on 0.0.0.0:3000
```

### Verify Variable Access

Add this test to any file:
```javascript
import { config } from './config/env.js';

console.log('🔑 Variables loaded:');
console.log('✅ PORT:', config.port);
console.log('✅ DATABASE:', config.databaseUrl ? 'configured' : 'missing');
console.log('✅ JWT_SECRET:', config.jwtSecret ? 'configured' : 'missing');
console.log('✅ OPENROUTER_KEY:', config.openrouterApiKey ? 'configured' : 'missing');
```

---

## Summary

**Your Server Environment Setup**:
1. ✅ `.env` file contains all secrets
2. ✅ `dotenv` loads them into `process.env`
3. ✅ `src/config/env.js` centralizes access
4. ✅ All files import from `config/env.js`
5. ✅ Validation ensures everything is configured

**It's already working!** No additional setup needed. Just start your server:

```bash
cd server
npm run dev
```

🚀 Ready to go!
