# 🚀 OpenRouter Integration - Deployment Checklist

## Pre-Deployment (Local Testing)

### ✅ Setup Phase
- [ ] Read `OPENROUTER_QUICK_REF.md` (quick understanding)
- [ ] Got OpenRouter API key from https://openrouter.ai
- [ ] Added `OPENROUTER_API_KEY=sk-...` to `server/.env`
- [ ] Verified `server/.env` has all required variables:
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_BASE_URL` (if not using default)
  - `APP_URL` (if not using default)

### ✅ Backend Testing
- [ ] Backend starts: `cd server && npm run dev`
- [ ] No errors in backend console
- [ ] Console shows: "✅ [OpenRouter] Backend started successfully" (or similar)
- [ ] Can connect to http://localhost:3000/api/v1/health (if endpoint exists)

### ✅ Frontend Testing
- [ ] Frontend starts: `cd client && npm run dev`
- [ ] No errors in frontend console
- [ ] Can connect to http://localhost:5173
- [ ] Can login/create account
- [ ] Can create new project
- [ ] Can select model in project settings

### ✅ Integration Testing
- [ ] Send message to AI
- [ ] Backend logs show: "✅ [OpenRouter] Calling API with model: ..."
- [ ] Response received successfully
- [ ] Message appears in conversation
- [ ] Backend logs show: "✅ [OpenRouter] API call successful"
- [ ] Try multiple models (GPT-4, Claude, etc.) - all work
- [ ] Token usage logged correctly

### ✅ Error Handling
- [ ] Test 1: Stop backend, try sending message
  - Expected: Clear error message, no crash
- [ ] Test 2: Set wrong API key, restart backend
  - Expected: Error on startup or first request
- [ ] Test 3: Delete `OPENROUTER_API_KEY` from `.env`
  - Expected: Error: "AI service is not configured on the server"
- [ ] Test 4: Set invalid model name in database
  - Expected: Clear error from OpenRouter, not a crash

### ✅ Security Verification
- [ ] Inspect Network tab in DevTools
  - [ ] No direct calls to openrouter.ai
  - [ ] All AI requests go to `/api/v1/...`
- [ ] Search browser Storage/SessionStorage
  - [ ] No OpenRouter API key found
  - [ ] No model credentials stored
- [ ] Check browser console
  - [ ] No API key logged
  - [ ] No sensitive data exposed
- [ ] Server `.env` file
  - [ ] API key not in version control
  - [ ] `.gitignore` includes `.env`

### ✅ Performance Testing
- [ ] Send 5 consecutive messages
  - Expected: All succeed without rate limiting
  - Response time: 2-15 seconds normal
- [ ] Send long message (1000+ characters)
  - Expected: Handled correctly
- [ ] Send multiple projects in parallel
  - Expected: All work independently

---

## Production Deployment

### 📋 Pre-Deployment Checklist

#### Code Review
- [ ] All changes reviewed and approved
- [ ] No hardcoded API keys in code
- [ ] No console.log of sensitive data
- [ ] Error messages don't expose secrets
- [ ] All old Gemini/Local LLM imports removed or unused

#### Environment Setup
- [ ] Production OpenRouter API key obtained
  - [ ] Different from development key
  - [ ] Rate limits appropriate for production volume
- [ ] `.env.production` created (or environment variables set)
  - [ ] `OPENROUTER_API_KEY` = production key
  - [ ] `APP_URL` = production domain
  - [ ] Other variables configured
- [ ] `.env` file is in `.gitignore` (double-check)

#### Database
- [ ] Database backed up (if migrating from Gemini)
- [ ] All existing projects have valid models set
  - [ ] Run: Check all projects have `model` field populated
  - [ ] Update any NULL or invalid models to valid OpenRouter model
- [ ] Migrations run successfully

#### Backend
- [ ] Latest code pulled from main branch
- [ ] Dependencies installed: `npm install`
- [ ] Build successful: `npm run build` (if applicable)
- [ ] Environment variables set on hosting platform
- [ ] Backend service configured to start on boot
- [ ] Logs configured and monitored
- [ ] Health check endpoint working (if available)

#### Frontend
- [ ] Latest code pulled from main branch
- [ ] Dependencies installed: `npm install`
- [ ] Build successful: `npm run build`
- [ ] Build output has no errors or warnings
- [ ] API endpoint configured (if different from localhost)
- [ ] Deploy to hosting platform
- [ ] Can load application and login

#### Monitoring
- [ ] Logging enabled for:
  - [ ] Backend errors
  - [ ] OpenRouter API calls
  - [ ] Token usage
  - [ ] Failed requests
- [ ] Error alerts configured
  - [ ] Alert on 429 (rate limiting)
  - [ ] Alert on 401 (invalid API key)
  - [ ] Alert on repeated errors
- [ ] Uptime monitoring enabled

### 🚀 Deployment Steps

#### Step 1: Prepare Backend (30 mins)
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run migrations (if any)
npm run migrate

# 4. Set environment variables on hosting platform
# (Use platform's secret/environment variable management)
# - OPENROUTER_API_KEY
# - OPENROUTER_BASE_URL
# - APP_URL
# - DATABASE_URL
# - etc.

# 5. Verify locally if possible
OPENROUTER_API_KEY=sk-... npm run dev
# Should start without errors

# 6. Deploy backend
# (Push to main/production branch, triggering CI/CD)
```

#### Step 2: Prepare Frontend (30 mins)
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Update API endpoint (if needed)
# Usually already configured in src/lib/api.ts

# 4. Build
npm run build
# Should complete without errors

# 5. Deploy frontend
# (Deploy dist/ folder to hosting)
```

#### Step 3: Monitor Deployment (15 mins)
```bash
# 1. Check backend is running
curl https://yourdomain.com/api/v1/health

# 2. Check frontend loads
# Open https://yourdomain.com in browser

# 3. Monitor logs
# Watch for:
# - "✅ [OpenRouter] API call successful"
# - Any error messages
# - Rate limit warnings

# 4. Test with real request
# Send message from frontend
# Check backend logs
```

#### Step 4: Post-Deployment (15 mins)
```bash
# 1. Send test message
# - Should work normally
# - Should see response

# 2. Check logs for errors
# - No "OPENROUTER_API_KEY not configured"
# - No "Invalid API key"
# - Just normal operation logs

# 3. Verify metrics
# - Check OpenRouter dashboard for token usage
# - Should see recent API calls

# 4. Set up alerts
# - High token usage
# - API errors
# - Downtime
```

---

## Deployment Environments

### Local Development
```bash
OPENROUTER_API_KEY=sk-test-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=http://localhost:5173
NODE_ENV=development
```
**Status:** ✅ Fully tested
**API Key:** Test/development key
**Users:** 1 (you)

### Staging/QA
```bash
OPENROUTER_API_KEY=sk-staging-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=https://staging.yourdomain.com
NODE_ENV=staging
```
**Status:** ✅ Ready for QA testing
**API Key:** Staging key (rate-limited)
**Users:** QA team + testers

### Production
```bash
OPENROUTER_API_KEY=sk-production-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=https://yourdomain.com
NODE_ENV=production
```
**Status:** ✅ Production ready
**API Key:** Production key (full limits)
**Users:** All customers

---

## Rollback Plan

**If deployment fails:**

### Option 1: Quick Rollback (5 mins)
1. Revert backend to previous tag: `git checkout v1.0.0`
2. Redeploy backend
3. Revert frontend to previous tag
4. Redeploy frontend
5. Verify system works with previous version

### Option 2: Data Integrity Check
1. Verify database wasn't corrupted
2. Check all conversations still exist
3. Verify message history intact
4. Run data validation queries

### Option 3: Debug Current Deployment
1. Check backend logs for errors
2. Check environment variables set correctly
3. Check database connectivity
4. Verify OpenRouter API key valid
5. See `OPENROUTER_INTEGRATION.md` troubleshooting section

---

## Post-Deployment Verification

### ✅ Day 1 (Immediate)
- [ ] Users can login
- [ ] Users can create projects
- [ ] Users can send messages
- [ ] Messages get responses from OpenRouter
- [ ] No errors in logs
- [ ] No rate limiting
- [ ] Frontend loads quickly
- [ ] Backend responds quickly

### ✅ Day 3 (First Week)
- [ ] Multiple users can work simultaneously
- [ ] Long conversations work
- [ ] Different models work
- [ ] Error handling works (network down, etc.)
- [ ] Token usage is within budget
- [ ] No memory leaks

### ✅ Week 1 (First Month)
- [ ] No degradation in performance
- [ ] All features working smoothly
- [ ] Users reporting no issues
- [ ] System stable under load
- [ ] Costs within budget
- [ ] Monitoring alerts working

---

## Communication

### Notify Before Deployment
**Audience:** Admin users / managers
```
Subject: Scheduled Maintenance - AI System Upgrade

We're upgrading our AI system to use OpenRouter.ai for improved 
performance and reliability. Service will be unavailable for 1-2 hours.

Time: [Date] [Time] UTC
Expected duration: 1-2 hours
Impact: Chat feature will be unavailable

We appreciate your patience!
```

### Notify After Deployment
**Audience:** All users
```
Subject: AI System Upgraded ✅

Great news! We've upgraded our AI system to use OpenRouter.ai.
You'll notice:

✅ Faster response times
✅ More model options (GPT-4, Claude, Gemini, etc.)
✅ Improved reliability
✅ Better error handling

No action needed on your part - just enjoy the improvements!
```

---

## Success Criteria

### ✅ Deployment Successful If:
- Backend starts without errors
- Frontend loads and displays correctly
- Users can send messages
- Responses arrive from OpenRouter
- Logs show "✅ [OpenRouter] API call successful"
- No API key leakage
- Performance is normal or better
- No crashes or exceptions

### ❌ Deployment Failed If:
- Backend won't start (check logs)
- Frontend shows errors (check console)
- Messages don't get responses
- API key is exposed
- Rate limiting occurs immediately
- System crashes under normal load

---

## Support Contacts

| Issue | Contact | Time |
|-------|---------|------|
| OpenRouter API down | OpenRouter support | Check status.openrouter.ai |
| Backend errors | Backend dev team | Check logs and restart |
| Frontend errors | Frontend dev team | Check browser console |
| Database issues | Database admin | Check DB connectivity |
| Cost overruns | Finance/Operations | Review token usage |

---

## Documentation References

| Document | Purpose |
|----------|---------|
| `OPENROUTER_QUICK_REF.md` | One-page quick setup |
| `OPENROUTER_INTEGRATION.md` | Complete setup guide |
| `OPENROUTER_VERIFICATION.md` | Implementation details |
| `CHANGELOG_OPENROUTER.md` | What changed |
| `.env.example` | Configuration template |

---

## Final Sign-Off

- [ ] Backend developer: ✅ Code reviewed and tested
- [ ] Frontend developer: ✅ Code reviewed and tested
- [ ] DevOps engineer: ✅ Infrastructure ready
- [ ] QA engineer: ✅ Testing complete
- [ ] Product manager: ✅ Approved for release
- [ ] Security team: ✅ Security verified

**Status:** 🟢 **Ready for Production Deployment**

**Deploy Date:** ________________  
**Deployed By:** ________________  
**Verified By:** ________________  

---

**Good luck with deployment! 🚀**
