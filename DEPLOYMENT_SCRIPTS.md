# 🚀 Deployment Scripts Guide

**Status**: Complete deployment automation scripts  
**Date**: January 17, 2026  
**Scripts**: Bash, Batch, NPM

---

## Overview

Comprehensive deployment scripts for both server and client applications. Choose from shell scripts, batch files, or npm commands based on your preference.

---

## 📋 Available Scripts

### Full Deployment (Both Server + Client)

**Bash/Linux/macOS**:
```bash
./deploy.sh                          # Build both (no deploy)
./deploy.sh -s render -c vercel      # Deploy server to Render, client to Vercel
./deploy.sh -s railway -c netlify    # Deploy server to Railway, client to Netlify
./deploy.sh -s fly -c static         # Deploy server to Fly.io, client to static host
```

**Windows**:
```batch
deploy.bat                           # Build both (no deploy)
```

**NPM**:
```bash
npm run deploy:all                   # Build both applications
```

---

## 🖥️ Server Deployment

### Using Shell Script (Recommended)

```bash
# Just build (prepare for manual deployment)
./deploy-server.sh

# Deploy to specific platform
./deploy-server.sh render            # Render deployment
./deploy-server.sh railway           # Railway deployment
./deploy-server.sh fly               # Fly.io deployment
```

### Using npm commands

```bash
cd server

# Install & build
npm install
npm run db:migrate                   # Run database migrations
npm run build

# Deployment platform scripts
npm run deploy:render                # Render (push to GitHub)
npm run deploy:railway               # Railway (push to GitHub)
npm run deploy:fly                   # Fly.io (requires flyctl)
```

### Manual Deployment Steps

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Ensure environment variables are set
# Create .env file with required variables
# Or set them in platform dashboard

# 4. Run migrations (if database exists)
npx prisma migrate deploy

# 5. Generate Prisma client
npx prisma generate

# 6. Push to GitHub
git push origin full-developer

# 7. Deploy on platform dashboard or CLI
```

---

## 🎨 Client Deployment

### Using Shell Script (Recommended)

```bash
# Just build (prepare for manual deployment)
./deploy-client.sh

# Deploy to specific platform
./deploy-client.sh vercel            # Vercel deployment
./deploy-client.sh netlify           # Netlify deployment
./deploy-client.sh github            # GitHub Pages
./deploy-client.sh static            # Static hosting (manual)
```

### Using npm commands

```bash
cd client

# Build only
npm run build

# Deployment platform scripts
npm run deploy:vercel                # Vercel
npm run deploy:netlify               # Netlify
npm run deploy:static                # Static hosting
```

### Manual Deployment Steps

```bash
# 1. Navigate to client directory
cd client

# 2. Install dependencies
npm install

# 3. Create .env.production
# VITE_API_URL=https://your-backend-url.com

# 4. Build
npm run build

# 5. Deploy dist/ folder to platform
# - Vercel: Push to GitHub, auto-deploys
# - Netlify: Push to GitHub or drag dist/
# - Static: Upload dist/ to S3, GCS, etc.
```

---

## 🎯 Deployment Platform Guides

### Render (Server)

```bash
# 1. Build & push
./deploy-server.sh

# 2. Go to render.com
# 3. Create new Web Service
# 4. Connect GitHub repo
# 5. Configure:
#    Build: cd server && npm install
#    Start: npm start
# 6. Add environment variables
# 7. Deploy
```

### Railway (Server)

```bash
# 1. Build & push
./deploy-server.sh

# 2. Go to railway.app
# 3. Create new project
# 4. Import from GitHub
# 5. Add PostgreSQL database
# 6. Set environment variables
# 7. Deploy
```

### Fly.io (Server)

```bash
# Install flyctl first
curl -L https://fly.io/install.sh | sh

# Then deploy
./deploy-server.sh fly

# Or manual:
cd server
flyctl launch
flyctl deploy
```

### Vercel (Client)

```bash
# Using script
./deploy-client.sh vercel

# Or manual:
npm install -g vercel
cd client
vercel --prod
```

### Netlify (Client)

```bash
# Using script
./deploy-client.sh netlify

# Or manual:
npm install -g netlify-cli
cd client
netlify deploy --prod --dir=dist
```

---

## 📦 Full Deployment Example

### Deploy Everything in 10 Minutes

```bash
# 1. Start from project root
cd ~/projects/aiCompanionStudio

# 2. Build both applications
./deploy.sh

# 3. Set environment variables on platforms

# 4. Deploy server
./deploy-server.sh fly

# 5. Deploy client
./deploy-client.sh vercel

# Done! ✅
```

---

## 🔧 Environment Configuration

### Server Environment Variables

Create `server/.env`:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=https://yourdomain.com
NODE_ENV=production
LOG_LEVEL=info
PORT=3000
```

### Client Environment Variables

Create `client/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

---

## 🐛 Troubleshooting

### "Script not found"
```bash
# Make scripts executable on Linux/macOS
chmod +x deploy.sh
chmod +x deploy-server.sh
chmod +x deploy-client.sh
```

### "Node not found"
```bash
# Ensure Node.js is installed
node --version
npm --version

# Install from nodejs.org if missing
```

### "Database error"
```bash
# Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy
```

### "Build failed"
```bash
# Clear cache and rebuild
rm -rf node_modules dist .next
npm install
npm run build
```

### "Deployment failed"
```bash
# Check platform-specific logs
# Render: https://render.com/dashboard
# Railway: https://railway.app/project
# Fly.io: flyctl logs
```

---

## 📊 Script Features

### Full Deploy Script (`deploy.sh`)
- ✅ Checks Node.js installation
- ✅ Installs dependencies for both apps
- ✅ Runs database migrations
- ✅ Generates Prisma client
- ✅ Builds React app
- ✅ Pushes to GitHub
- ✅ Deploys to chosen platforms
- ✅ Provides clear feedback with colors

### Server Deploy Script (`deploy-server.sh`)
- ✅ Verifies Node.js
- ✅ Installs dependencies
- ✅ Validates environment variables
- ✅ Sets up database
- ✅ Builds for production
- ✅ Platform-specific deployment
- ✅ Error handling

### Client Deploy Script (`deploy-client.sh`)
- ✅ Verifies Node.js
- ✅ Installs dependencies
- ✅ Checks environment config
- ✅ Builds React app
- ✅ Platform-specific deployment
- ✅ Size reporting

---

## 🎓 Best Practices

### Before Deploying

- [ ] Test locally: `npm run dev` (server), `npm run dev` (client)
- [ ] Check all environment variables
- [ ] Verify database connection
- [ ] Run linting: `npm run lint`
- [ ] Test API endpoints
- [ ] Review error handling

### During Deployment

- [ ] Monitor build logs
- [ ] Check for deployment errors
- [ ] Verify health endpoints
- [ ] Test core functionality
- [ ] Monitor error tracking

### After Deployment

- [ ] Test health check endpoint
- [ ] Test authentication flow
- [ ] Test chat functionality
- [ ] Monitor logs
- [ ] Check error tracking (Sentry, etc.)

---

## 📱 Platform Comparison

| Platform | Server | Client | Setup | Cost | Notes |
|----------|--------|--------|-------|------|-------|
| Render | ✅ | ✅ | 5m | $7/mo | Auto-deploy from GitHub |
| Railway | ✅ | ✅ | 5m | $5/mo | Very beginner-friendly |
| Fly.io | ✅ | ✅ | 10m | Free | Global, fast |
| Vercel | ❌ | ✅ | 5m | Free | Best for React |
| Netlify | ❌ | ✅ | 5m | Free | Easy deployment |
| GitHub Pages | ❌ | ✅ | 5m | Free | Static only |

---

## 🚀 CI/CD Integration

### GitHub Actions

Add to `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [full-developer]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: ./deploy.sh render vercel
```

---

## 📞 Support

### Script Documentation
- `deploy.sh --help`
- `deploy-server.sh --help`
- `deploy-client.sh --help`

### Platform Documentation
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Fly.io Docs](https://fly.io/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

---

## 📝 File Manifest

**Scripts Created**:
- ✅ `deploy.sh` - Full deployment (Bash)
- ✅ `deploy-server.sh` - Server deployment (Bash)
- ✅ `deploy-client.sh` - Client deployment (Bash)
- ✅ `deploy.bat` - Full deployment (Windows)

**Updated**:
- ✅ `server/package.json` - Added deploy scripts
- ✅ `client/package.json` - Added deploy scripts

---

**Status**: ✅ Ready to Deploy  
**Total Scripts**: 4  
**Supported Platforms**: 6  
**Automation**: Full  

🚀 **Ready to deploy!**
