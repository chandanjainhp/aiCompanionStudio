# ⚡ Quick Environment Setup

**Status**: Ready to Configure  
**Time**: ~5 minutes  

---

## 🚀 Fastest Way (Copy & Paste)

### Windows PowerShell

```powershell
# Navigate to project
cd C:\Users\chand\programing\projects\aiCompanionStudio

# Run setup script
.\setup-env.bat

# Follow the menu
```

### Linux/macOS

```bash
# Navigate to project
cd ~/projects/aiCompanionStudio

# Make script executable
chmod +x setup-env.sh

# Run setup script
./setup-env.sh both

# Or interactive menu
./setup-env.sh
```

---

## 📝 Manual Setup (2 Minutes)

### Server .env

```bash
cd server
cp .env.example .env

# Edit .env and update these:
DATABASE_URL=postgresql://localhost:5432/aicompanion
JWT_SECRET=your-32-char-secret-generated-randomly
JWT_REFRESH_SECRET=your-32-char-refresh-secret-randomly
OPENROUTER_API_KEY=sk-or-v1-your-api-key-from-openrouter
APP_URL=http://localhost:5173
```

### Client .env

```bash
cd client

# Create .env.production
echo "VITE_API_URL=http://localhost:3000" > .env.production

# Create .env.development
echo "VITE_API_URL=http://localhost:3000" > .env.development
```

---

## 🔑 Get Your API Keys

### OpenRouter API Key (1 minute)

1. Go to https://openrouter.ai/keys
2. Click "Create New Key"
3. Copy the key (starts with `sk-or-v1-`)
4. Paste in `server/.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key
   ```

### Generate JWT Secrets

**Linux/macOS**:
```bash
openssl rand -base64 32
```

**Windows PowerShell**:
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## 🗄️ Database URL

### Local PostgreSQL
```
DATABASE_URL=postgresql://user:password@localhost:5432/aicompanion
```

### Railway (managed)
```
DATABASE_URL=postgresql://user:pass@host.railway.internal:5432/railway
```

### Render (managed)
```
DATABASE_URL=postgresql://user:pass@host:5432/database
```

---

## ✅ Verify Setup

### Check Server .env
```bash
cd server
grep -E "DATABASE_URL|OPENROUTER_API_KEY" .env
# Should show your configured values
```

### Check Client .env
```bash
cd client
cat .env.production
# Should show VITE_API_URL
```

### Test Server
```bash
cd server
npm run dev
# Should start without errors
```

### Test Client
```bash
cd client
npm run dev
# Should open in browser
```

---

## 📋 All Files Needed

```
server/
├── .env                 ← CREATE THIS
└── .env.example        (copy this)

client/
├── .env.production      ← CREATE THIS
└── .env.development     ← CREATE THIS (optional)
```

---

## 🔒 Security Checklist

- [ ] `.env` is in `.gitignore` (never commit)
- [ ] JWT secrets are 32+ characters
- [ ] OPENROUTER_API_KEY is valid
- [ ] DATABASE_URL works
- [ ] Different secrets for dev/prod
- [ ] Secrets not shared via email/chat

---

## ⚡ Automated Setup (Recommended)

```bash
# Linux/macOS - Interactive menu
./setup-env.sh

# Linux/macOS - Auto setup both
./setup-env.sh both

# Linux/macOS - Generate secrets
./setup-env.sh generate

# Windows - Interactive menu
setup-env.bat

# NPM (coming soon)
npm run setup:env
```

---

## 🆘 Stuck?

1. **Run automated setup**:
   ```bash
   ./setup-env.sh both    # Linux/macOS
   setup-env.bat          # Windows
   ```

2. **Manual steps in ENV_SETUP.md**:
   - Full environment configuration guide
   - Platform-specific setup
   - Troubleshooting

3. **View example files**:
   ```bash
   cat server/.env.example
   ```

---

## 📊 What Each Variable Does

| Variable | Purpose | Example |
|----------|---------|---------|
| DATABASE_URL | Connect to database | postgresql://... |
| JWT_SECRET | Secure auth tokens | random-32-chars |
| OPENROUTER_API_KEY | Access LLM models | sk-or-v1-... |
| APP_URL | Server URL for client | http://localhost:3000 |
| VITE_API_URL | Backend URL for client | http://localhost:3000 |

---

**Next Steps**:
1. ✅ Run setup script
2. ✅ Verify .env files created
3. ✅ Start development: `npm run dev`
4. 📘 See ENV_SETUP.md for detailed guide

---

**Status**: Ready to Setup ⚡  
**Time**: ~5 minutes  
**Next**: Run `./setup-env.sh` or `setup-env.bat`
