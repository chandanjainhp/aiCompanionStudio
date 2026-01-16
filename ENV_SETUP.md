# 🔧 Environment Configuration Guide

**Status**: Setup Instructions  
**Date**: January 17, 2026  

---

## Quick Setup

### Server .env File

1. **Navigate to server directory**:
```bash
cd server
```

2. **Create `.env` file** (copy from `.env.example`):
```bash
cp .env.example .env
```

3. **Edit `.env`** with your values:
```env
# DATABASE
DATABASE_URL=postgresql://user:password@localhost:5432/aicompanion

# AUTHENTICATION
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-12345
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long-12345

# OPENROUTER (Get from https://openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# APPLICATION
APP_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# EMAIL (Optional - for registration verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=AI Companion
EMAIL_FROM_EMAIL=noreply@aicompanion.com

# FILE UPLOAD (Optional)
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

---

### Client .env File

1. **Navigate to client directory**:
```bash
cd client
```

2. **Create `.env.production` file**:
```bash
# Linux/macOS
cat > .env.production << EOF
VITE_API_URL=http://localhost:3000
EOF

# Windows PowerShell
@'
VITE_API_URL=http://localhost:3000
'@ | Out-File -Encoding UTF8 .env.production
```

3. **For local development, create `.env.development`** (optional):
```bash
VITE_API_URL=http://localhost:3000
```

---

## 🔐 Getting API Keys

### OpenRouter API Key

1. **Go to**: https://openrouter.ai/keys
2. **Create new key**:
   - Click "Create New Key"
   - Give it a name like "AI Companion"
   - Copy the key (starts with `sk-or-v1-`)
3. **Paste in `.env`**:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

### JWT Secrets

Generate secure random strings (minimum 32 characters):

**Linux/macOS**:
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

**Windows PowerShell**:
```powershell
# Generate random string
$bytes = New-Object Byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

## 📱 Database Setup

### Local Development (SQLite/PostgreSQL)

**Option 1: Use Local PostgreSQL**
```bash
# Install PostgreSQL
# macOS: brew install postgresql@15
# Windows: Download from https://www.postgresql.org/download/windows/
# Linux: sudo apt-get install postgresql

# Start PostgreSQL
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql

# Create database
createdb aicompanion

# Create user
createuser aicompanion
psql -U postgres -d postgres -c "ALTER USER aicompanion WITH PASSWORD 'your-password';"

# Set DATABASE_URL
DATABASE_URL=postgresql://aicompanion:your-password@localhost:5432/aicompanion
```

**Option 2: Use Cloud Database (Production)**
```bash
# Railway, Render, or Fly.io provide managed PostgreSQL
# They give you a DATABASE_URL like:
DATABASE_URL=postgresql://user:password@host.railway.internal:5432/railway
```

---

## 📝 Complete Server .env Template

Create `server/.env`:

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================

# NODE ENVIRONMENT
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/aicompanion

# ============================================
# JWT AUTHENTICATION
# ============================================
# Generate with: openssl rand -base64 32
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# OPENROUTER.AI LLM PROVIDER
# ============================================
# Get API key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# ============================================
# APPLICATION URLs
# ============================================
APP_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# ============================================
# FILE UPLOAD
# ============================================
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# ============================================
# EMAIL (Optional - for verification emails)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=AI Companion
EMAIL_FROM_EMAIL=noreply@aicompanion.com

# ============================================
# OPTIONAL: CLOUDINARY (for image storage)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# OPTIONAL: LOCAL LLM (fallback)
# ============================================
LOCAL_LLM_ENABLED=false
LOCAL_LLM_ENDPOINT=http://localhost:11434
LOCAL_LLM_MODEL=mistral
```

---

## 📝 Complete Client .env Template

Create `client/.env.production`:

```bash
# ============================================
# CLIENT CONFIGURATION - PRODUCTION
# ============================================

# Backend API URL
VITE_API_URL=https://your-backend-domain.com

# Optional: Analytics, tracking, etc.
# VITE_ANALYTICS_ID=your-id
```

Create `client/.env.development` (optional, for local development):

```bash
# ============================================
# CLIENT CONFIGURATION - DEVELOPMENT
# ============================================

# Local backend API
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Using Environment Files

### Development

**Server**:
```bash
cd server
npm run dev
# Uses .env automatically
```

**Client**:
```bash
cd client
npm run dev
# Uses .env.development automatically
```

### Production Build

**Server**:
```bash
cd server
NODE_ENV=production npm start
# Uses .env with NODE_ENV=production
```

**Client**:
```bash
cd client
npm run build
# Uses .env.production automatically
```

---

## 🔒 Security Best Practices

### Do ✅
- ✅ Store `.env` in `.gitignore` (never commit secrets)
- ✅ Use strong random secrets (32+ characters)
- ✅ Use different keys for dev and production
- ✅ Rotate API keys periodically
- ✅ Use environment variables on deployment platform

### Don't ❌
- ❌ Commit `.env` files to Git
- ❌ Share secrets via email or chat
- ❌ Use same secrets across environments
- ❌ Hardcode secrets in code
- ❌ Push keys to GitHub

---

## 📋 .gitignore Check

Verify `.env` files are ignored:

```bash
# Check if .env is in .gitignore
grep "^.env" .gitignore

# Should see:
# .env
# .env.local
# .env.*.local
# .env.production
```

---

## 🧪 Testing Environment Variables

### Server

```bash
cd server

# Check if env vars are loaded
npm run dev

# You should see:
# ✅ [Config] Production environment validation passed
# 🚀 Server is running on 0.0.0.0:3000
```

### Client

```bash
cd client

# Build and check
npm run build

# You should see:
# ✓ built in XX.XXs
# Output at: dist/
```

---

## 🌐 Platform Environment Setup

### Render

1. Go to **Render Dashboard**
2. Select your service
3. Click **Settings** → **Environment**
4. Add each variable:
   - `DATABASE_URL`: PostgreSQL URL
   - `JWT_SECRET`: Your secret
   - `JWT_REFRESH_SECRET`: Your refresh secret
   - `OPENROUTER_API_KEY`: API key
   - `APP_URL`: Your domain
   - `NODE_ENV`: production

### Railway

1. Go to **Railway Dashboard**
2. Select your project
3. Click **Variables**
4. Add raw environment variables

### Fly.io

```bash
# Set secrets
flyctl secrets set DATABASE_URL=postgresql://...
flyctl secrets set JWT_SECRET=your-secret
flyctl secrets set JWT_REFRESH_SECRET=your-refresh
flyctl secrets set OPENROUTER_API_KEY=sk-or-v1-...
flyctl secrets set APP_URL=https://yourdomain.com
```

### Vercel (Client)

1. Go to **Vercel Dashboard**
2. Select your project
3. **Settings** → **Environment Variables**
4. Add `VITE_API_URL=https://your-backend.com`

### Netlify (Client)

1. Go to **Netlify Dashboard**
2. **Site settings** → **Build & deploy** → **Environment**
3. Add `VITE_API_URL=https://your-backend.com`

---

## ✅ Verification Checklist

### Before Starting Development

- [ ] `server/.env` created and configured
- [ ] `client/.env.production` created
- [ ] Database connection verified: `psql "DATABASE_URL"`
- [ ] OpenRouter API key valid: https://openrouter.ai/keys
- [ ] JWT secrets are strong (32+ characters)
- [ ] `.env` files added to `.gitignore`

### Before Deployment

- [ ] All env vars set on platform
- [ ] Database URL points to production database
- [ ] OpenRouter API key is valid and funded
- [ ] App URL matches your domain
- [ ] JWT secrets are different from development
- [ ] NODE_ENV=production in server env

---

## 🆘 Troubleshooting

### "Missing required environment variable"

**Problem**: Error says `Missing required env vars for production`

**Solution**:
```bash
# Check .env file exists
test -f .env && echo "✅ .env exists" || echo "❌ .env missing"

# Check required vars
grep -E "DATABASE_URL|JWT_SECRET|OPENROUTER_API_KEY" .env

# Verify variables are set
echo $DATABASE_URL
```

### "Database connection failed"

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:password@host:port/database

# Verify PostgreSQL is running
psql -U postgres -d postgres -c "SELECT 1"

# Test connection
psql "$DATABASE_URL"
```

### "OpenRouter API key invalid"

**Problem**: `401 Unauthorized` from OpenRouter

**Solution**:
1. Get new key from: https://openrouter.ai/keys
2. Verify key starts with `sk-or-v1-`
3. Check API key is funded
4. Update `.env` and restart

### "Client shows blank page"

**Problem**: React app won't load, shows blank page

**Solution**:
```bash
# Check VITE_API_URL is set in .env.production
grep VITE_API_URL .env.production

# Rebuild with correct env
npm run build

# Check dist/index.html was created
ls dist/index.html
```

---

## 📞 Need Help?

1. Check `.env.example` files in each directory
2. Review platform-specific docs above
3. Test connection: `curl http://localhost:3000/health`
4. Check logs: `npm run dev` shows errors
5. Verify API key works: https://openrouter.ai/activity

---

**Status**: ✅ Ready to Configure  
**Files Needed**: 2 (.env files)  
**Time Required**: ~5 minutes  

Start with server setup, then client setup! 🚀
