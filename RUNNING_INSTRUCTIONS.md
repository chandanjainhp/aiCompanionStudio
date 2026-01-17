# AI Companion Studio - Running Instructions

Complete guide to set up and run the AI Companion Studio application locally.

## Prerequisites

Before starting, ensure you have:

```bash
✓ Node.js v20+ (https://nodejs.org/)
✓ PostgreSQL 12+ (https://www.postgresql.org/)
✓ Git (https://git-scm.com/)
✓ npm or yarn package manager
```

Verify installation:
```bash
node --version    # Should be v20+
npm --version     # Should be v9+
psql --version    # Should be 12+
```

## Quick Start (5 minutes)

### 1. Clone Repository

```bash
git clone https://github.com/chandanjainhp/aiCompanionStudio.git
cd aiCompanionStudio
```

### 2. Setup Database

```bash
# Create database
createdb ai_companion_studio

# Verify PostgreSQL is running
psql -U postgres -d ai_companion_studio -c "SELECT 1;"
```

### 3. Server Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration (see Environment Setup section)

# Run migrations
npx prisma migrate deploy

# Start server (should see: Server running on port 3000)
npm run dev
```

**Expected output:**
```
Server running on port 3000
Connected to database
```

### 4. Client Setup (in new terminal)

```bash
cd client

# Install dependencies
npm install

# Start development server (should see: http://localhost:5173)
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

### 5. Access Application

Open browser: **http://localhost:5173**

---

## Detailed Setup Instructions

### Environment Configuration

#### Server (.env)

Create `server/.env`:

```dotenv
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_companion_studio
DIRECT_DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_companion_studio

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Services
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=http://localhost:5173
APP_NAME=AI Companion Studio

# Local LLM (Optional Fallback)
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1/chat/completions
LOCAL_LLM_MODEL=minimaxai_synlogic-7b
LOCAL_LLM_ENABLED=true

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=AI Companion Studio
EMAIL_FROM_EMAIL=your-email@gmail.com

# CORS
CORS_ORIGIN=http://localhost:5173

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Client (.env)

Create `client/.env.local`:

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=AI Companion Studio
```

### Generate JWT Secrets

```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the output for both JWT_SECRET and JWT_REFRESH_SECRET.

### Get OpenRouter API Key

1. Visit: https://openrouter.ai
2. Sign up / Log in
3. Go to: https://openrouter.ai/keys
4. Copy your API key starting with `sk-or-v1-`
5. Add to `server/.env` as `OPENROUTER_API_KEY`

---

## Running the Application

### Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Access:** http://localhost:5173

### Production Mode

```bash
# Server
cd server
npm run build
npm start

# Client
cd client
npm run build
npm run preview
```

---

## Available Scripts

### Server Scripts

```bash
# Development with auto-reload
npm run dev

# Production build & start
npm start

# Database commands
npx prisma migrate dev    # Create & run migrations
npx prisma studio         # Open Prisma UI
npx prisma db seed        # Seed database
npm run seed              # Run seed script

# Testing
npm run test
node test-openrouter.js   # Test AI integration
```

### Client Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint & format
npm run lint
npm run format
```

---

## Troubleshooting

### 1. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### 2. Database Connection Failed

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check PostgreSQL is running
psql --version

# Start PostgreSQL (if not running)
# macOS with Homebrew
brew services start postgresql

# Windows
# Start PostgreSQL service from Services or:
psql -U postgres

# Verify connection
psql -U postgres -d ai_companion_studio -c "SELECT 1;"
```

### 3. OpenRouter API Error

**Error:** `OpenRouter API failed: 401 Unauthorized`

**Solution:**
1. Verify API key at: https://openrouter.ai/keys
2. Check key format starts with `sk-or-v1-`
3. Ensure account has credits
4. Restart server after updating .env

**Test:**
```bash
cd server
node test-openrouter.js
```

### 4. Email Not Sending

**Error:** `Email failed to send` or `SMTP Error`

**Solution:**
1. Use Gmail App Password (not regular password)
2. Enable 2-Factor Authentication on Gmail
3. Generate app password: https://support.google.com/accounts/answer/185833
4. Use the 16-character app password in EMAIL_PASSWORD

### 5. CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
```bash
# In server/.env, ensure:
CORS_ORIGIN=http://localhost:5173

# Restart server
```

### 6. Dependencies Not Installed

**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## First Time Setup Checklist

- [ ] Node.js v20+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] Repository cloned
- [ ] Database created: `ai_companion_studio`
- [ ] `server/.env` configured
- [ ] `client/.env.local` configured
- [ ] Server dependencies installed: `npm install`
- [ ] Client dependencies installed: `npm install`
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] OpenRouter API key added
- [ ] Both servers running on ports 3000 & 5173
- [ ] Application accessible at http://localhost:5173

---

## Testing the Setup

### Test Backend

```bash
cd server

# Test database connection
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? '✓ DB configured' : '✗ DB not configured')"

# Test AI integration
node test-openrouter.js

# Test server startup
npm run dev
# Should show: "Server running on port 3000"
```

### Test Frontend

```bash
cd client

# Check dependencies
npm list react react-dom

# Start dev server
npm run dev
# Should show: "http://localhost:5173"
```

### Test Full Application

1. Open http://localhost:5173
2. Register new account
3. Verify email (check console/spam folder)
4. Log in
5. Create a project
6. Start a conversation
7. Send message to AI (should get response)

---

## Default Login (if seed script ran)

```
Email: demo@example.com
Password: demo@123456
```

---

## Performance Optimization Tips

- Use local PostgreSQL (not cloud) for development
- Run `npm install` with `--legacy-peer-deps` if needed
- Clear browser cache if UI not updating
- Check browser DevTools console for errors
- Use Vite dev mode for faster rebuilds

---

## Getting Help

### Check Logs

**Server logs:**
```bash
# Run with debug mode
DEBUG=* npm run dev
```

**Browser console:**
- Press F12 in browser
- Check Console tab for errors
- Check Network tab for API responses

### Common Resources

- OpenRouter Docs: https://openrouter.ai/docs
- Prisma Docs: https://www.prisma.io/docs/
- React Docs: https://react.dev
- Express Docs: https://expressjs.com

### Report Issues

- GitHub Issues: https://github.com/chandanjainhp/aiCompanionStudio/issues
- Include logs and `.env` details (without secrets)
- Describe steps to reproduce

---

## Next Steps

- [ ] Read [server/Readme.md](server/Readme.md) for backend details
- [ ] Read [client/README.md](client/README.md) for frontend details
- [ ] Review API endpoints in backend README
- [ ] Explore Prisma Studio: `npx prisma studio`
- [ ] Deploy to production (see backend README)

---

## Support

For issues or questions:
1. Check this file's Troubleshooting section
2. Review server and client README files
3. Open GitHub issue with logs and setup details
