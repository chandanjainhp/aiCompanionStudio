# 🔧 How to Use Environment Variables in Server

**Status**: Configuration Guide  
**Date**: January 17, 2026  

---

## 📝 Quick Start - Already Done!

Your server already loads environment variables automatically. No additional setup needed! 

The server uses:
- ✅ `dotenv` package (loads from `.env` file)
- ✅ `src/config/env.js` (centralized config)
- ✅ Automatic validation on startup

---

## 🎯 How It Works

### 1. Load Environment Variables (Already Configured)

**File**: `server/src/index.js`
```javascript
import dotenv from 'dotenv';
import { config } from './config/env.js';

// Load .env file automatically
dotenv.config();

// Validate environment variables
validateProductionEnv();
```

### 2. Central Configuration (Already Configured)

**File**: `server/src/config/env.js`
```javascript
export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  
  // OpenRouter
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  openrouterBaseUrl: process.env.OPENROUTER_BASE_URL,
  
  // Application
  appUrl: process.env.APP_URL,
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};
```

---

## ✅ Current Setup Verification

### Check Server Config File

```bash
cd server
cat src/config/env.js | grep -A 30 "export const config"
```

You should see all variables like:
- `databaseUrl`
- `jwtSecret`
- `openrouterApiKey`
- etc.

### Check .env File

```bash
cd server
cat .env
```

You should see all configured values:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## 🚀 How to Use in Your Code

### In Express Routes

```javascript
import { config } from './config/env.js';

// Example: API Route
router.post('/api/v1/chat/send', async (req, res) => {
  const { message, projectId } = req.body;
  
  // Use config variables
  const apiKey = config.openrouterApiKey;
  const baseUrl = config.openrouterBaseUrl;
  
  // Make API call to OpenRouter
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ... })
  });
});
```

### In Services

**File**: `server/src/services/openrouter.service.js`
```javascript
import { config } from '../config/env.js';

export const sendMessage = async (message, model) => {
  // Access environment variables via config
  const client = new OpenAI({
    apiKey: config.openrouterApiKey,
    baseURL: config.openrouterBaseUrl,
  });
  
  const response = await client.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: message }],
  });
  
  return response;
};
```

### In Database

**File**: `server/src/config/database.js`
```javascript
import { config } from './env.js';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
});
```

---

## 🔑 All Available Variables

| Variable | Usage | Example |
|----------|-------|---------|
| `DATABASE_URL` | Connect to PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server listening port | `3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `JWT_SECRET` | Sign access tokens | `random-32-chars` |
| `JWT_REFRESH_SECRET` | Sign refresh tokens | `random-32-chars` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |
| `OPENROUTER_BASE_URL` | OpenRouter API URL | `https://openrouter.ai/api/v1` |
| `APP_URL` | Application URL | `http://localhost:5173` |
| `CORS_ORIGIN` | CORS allowed origins | `http://localhost:5173` |
| `EMAIL_USER` | Email username | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Email password | `app-specific-password` |

---

## ✨ How to Add New Environment Variable

### Step 1: Add to `.env` File

```bash
cd server

# Edit .env and add:
MY_NEW_VAR=my-value
```

### Step 2: Add to Config File

**File**: `server/src/config/env.js`
```javascript
export const config = {
  // ... existing variables
  
  // Add your new variable
  myNewVar: process.env.MY_NEW_VAR,
};
```

### Step 3: Use in Code

```javascript
import { config } from './config/env.js';

// Use it anywhere
console.log(config.myNewVar);
```

### Step 4: (Production) Add to Deployment Platform

Go to your deployment platform (Render, Railway, Fly.io) and add the variable there too.

---

## 🧪 Test Environment Variables

### Verify Server Can Access Variables

```bash
cd server

# Start server
npm run dev

# You should see messages like:
# ✅ Database connected successfully
# ✅ [Config] Production environment validation passed
# 🚀 Server is running on 0.0.0.0:3000
```

### Check if Variables are Loaded

```bash
cd server

# In your code, add debug logging
import { config } from './config/env.js';

console.log('🔑 Config loaded:');
console.log('  PORT:', config.port);
console.log('  DATABASE:', config.databaseUrl ? '✅' : '❌');
console.log('  OPENROUTER:', config.openrouterApiKey ? '✅' : '❌');
```

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'dotenv'"

**Solution**:
```bash
cd server
npm install dotenv
```

### Issue: "Missing required environment variable"

**Cause**: Variable not set in `.env` file

**Solution**:
```bash
cd server

# Check if .env exists
test -f .env && echo "✅ .env exists" || echo "❌ .env missing"

# Check if variable is set
grep DATABASE_URL .env

# If empty, add it:
echo "DATABASE_URL=postgresql://..." >> .env
```

### Issue: "Process exits with code 1"

**Cause**: Missing required environment variables

**Solution**:
```bash
# Verify all required variables
grep -E "DATABASE_URL|JWT_SECRET|OPENROUTER_API_KEY" server/.env

# All three should have values (not empty)
```

### Issue: "Cannot connect to database"

**Cause**: DATABASE_URL is incorrect

**Solution**:
```bash
# Test connection
psql "$DATABASE_URL"

# Should connect successfully
# If not, check the URL format:
# postgresql://user:password@host:port/database
```

---

## 📋 Complete Setup Checklist

- [x] `.env` file created in `server/` directory
- [x] All required variables added to `.env`
- [x] `config/env.js` exports all variables
- [x] `index.js` loads environment variables
- [x] Production validation enabled
- [x] Server starts without errors

---

## 🚀 Next Steps

1. **Start the server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Verify all variables loaded**:
   Check console output for ✅ success messages

3. **Test an endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```

4. **Ready to deploy!**
   All environment variables will be set on deployment platform

---

**Status**: ✅ Environment Variables Ready  
**Configuration**: Centralized in `src/config/env.js`  
**Validation**: Automatic on server startup  
**Deployment**: Ready for production  

🎉 Your server is fully configured and ready to use!
