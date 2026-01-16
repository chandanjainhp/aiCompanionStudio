# 🚀 Quick Deploy Guide

**Status**: Ready to Deploy  
**Scripts**: 4 (Bash + Windows)  
**Platforms Supported**: 6  

---

## ⚡ 30-Second Quick Start

### Build Everything
```bash
# Linux/macOS
./deploy.sh

# Windows
deploy.bat
```

### Deploy Server Only
```bash
./deploy-server.sh fly      # to Fly.io
./deploy-server.sh render   # to Render
./deploy-server.sh railway  # to Railway
```

### Deploy Client Only
```bash
./deploy-client.sh vercel   # to Vercel
./deploy-client.sh netlify  # to Netlify
```

---

## 📋 Full Deployment (5-10 Minutes)

### Step 1: Build Both Apps
```bash
./deploy.sh
# or for Windows: deploy.bat
```

### Step 2: Push to GitHub
```bash
git push origin full-developer
```

### Step 3: Deploy Server (Choose One)

**Option A: Render** (Easiest)
```bash
# 1. Go to render.com
# 2. New Web Service → GitHub
# 3. Build: cd server && npm install
# 4. Start: npm start
# 5. Add env vars, deploy
```

**Option B: Railway** (Fast)
```bash
# 1. Go to railway.app
# 2. New Project → GitHub
# 3. Add PostgreSQL database
# 4. Set env vars, deploy
```

**Option C: Fly.io** (Global)
```bash
./deploy-server.sh fly
```

### Step 4: Deploy Client (Choose One)

**Option A: Vercel** (Easiest React)
```bash
./deploy-client.sh vercel
```

**Option B: Netlify** (Easy)
```bash
./deploy-client.sh netlify
```

**Option C: Static Host**
```bash
./deploy-client.sh static
# Then upload dist/ to S3, GCS, etc.
```

### Step 5: Verify
```bash
curl https://your-backend.com/health
# Should return: {"success": true}
```

---

## 🎯 Platform Choice Matrix

| Need | Platform | Time | Cost |
|------|----------|------|------|
| Fastest | Render | 5m | $7/mo |
| Cheapest | Fly.io | 10m | Free tier |
| Easiest React | Vercel | 5m | Free |
| Best Client | Netlify | 5m | Free |

---

## 📦 Environment Variables

### Server Needs
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh
OPENROUTER_API_KEY=sk-or-v1-...
APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Client Needs
```env
VITE_API_URL=https://your-backend.com
```

---

## ✅ Deployment Checklist

- [ ] Environment variables set on platform
- [ ] Database created and accessible
- [ ] `./deploy.sh` runs successfully
- [ ] `git push origin full-developer` succeeds
- [ ] Server deployed and health check passes
- [ ] Client deployed and loads
- [ ] Backend API responds to requests
- [ ] Test login flow works
- [ ] Test chat with LLM works

---

## 🔗 Platform Links

- **Render**: https://render.com
- **Railway**: https://railway.app
- **Fly.io**: https://fly.io
- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com

---

## 🆘 Quick Troubleshooting

**Scripts won't run?**
```bash
chmod +x deploy.sh deploy-server.sh deploy-client.sh
```

**Node not found?**
```bash
# Install: https://nodejs.org
node --version  # Verify
```

**Build failed?**
```bash
rm -rf node_modules
npm install
npm run build
```

**Deploy failed?**
- Check platform logs
- Verify env variables
- Check database connection
- Review error messages

---

## 📞 Full Documentation

See:
- `DEPLOYMENT_SCRIPTS.md` - Detailed guide
- `PRODUCTION_READY.md` - Complete setup
- `DEPLOYMENT_STATUS.md` - Overview

---

**Ready to deploy?** Run: `./deploy.sh` ✅
