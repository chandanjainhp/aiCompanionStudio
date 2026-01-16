# 🚀 QUICK START - Stale Data Fix

## After Database Wipe

```bash
# Terminal 1: Clear and restart backend
cd server
node delete-all-data.js
npm run dev

# Terminal 2: Restart frontend
cd client
bun run dev
```

## In Browser Console

```javascript
// Full nuclear option
window.devTools.resetApp()
location.reload()

// Just clear projects
window.devTools.resetProjects()

// Check what's wrong
window.devTools.validateState()

// Show current state
window.devTools.showState()
```

## Visual Checklist

- [ ] Projects empty after logout
- [ ] localStorage cleared (F12 → Application → Storage)
- [ ] Can login again with fresh credentials
- [ ] `window.devTools.validateState()` returns `valid: true`

---

## What Was Fixed

| Issue | Was | Now |
|-------|-----|-----|
| After logout → projects gone | ❌ No | ✅ Yes |
| After DB wipe → projects gone | ❌ No | ✅ Yes |
| After 401 error → logout | ❌ No | ✅ Yes |
| Browser console tools | ❌ No | ✅ Yes |

---

## Files Changed

```
client/src/
├── lib/
│   ├── appStateReset.ts      ✨ NEW (reset utility)
│   └── api.ts                🔴 +401/403 handler
├── store/
│   ├── authStore.ts          🔄 +reset on logout
│   └── projectsStore.ts      🔍 +empty check
├── hooks/
│   └── useDevTools.ts        ✨ NEW (console tools)
└── App.tsx                   🪝 +hook init
```

---

## Two Reset Modes

### Mode 1: Full Reset (Nuclear)
```javascript
// When: Major issues, need complete clean slate
// Effect: Clears auth + projects, requires reload
window.devTools.resetApp()
location.reload()
```

### Mode 2: Soft Reset (Surgical)
```javascript
// When: Just clear projects, keep user logged in
// Effect: Projects gone, user stays authenticated
window.devTools.resetProjects()
```

---

## Automatic Triggers

These happen automatically - no action needed:

| When | What | Result |
|------|------|--------|
| User logs out | `resetProjectsData()` called | Projects cleared |
| API returns 401 | `resetProjectsData()` called | Projects cleared |
| API returns 403 | `resetProjectsData()` called | Projects cleared |
| Backend returns `[]` | Cache vs response compared | Stale data cleared |

---

## Dev Tools Help

```javascript
// Show all available commands
window.devTools.help()

// Output:
// resetApp()       → Clear ALL (auth + projects)
// resetProjects()  → Clear just projects
// validateState()  → Check for issues
// showState()      → Display current state
// getStorage()     → Show localStorage data
// checkPersisted() → What's in storage
// clearStorage()   → Nuke all storage
// help()           → This help
```

---

## Troubleshooting Checklist

| Problem | Command |
|---------|---------|
| Projects still showing | `window.devTools.resetProjects()` |
| User still logged in but shouldn't be | `window.devTools.resetApp()` then reload |
| State validation fails | `window.devTools.validateState()` to see issues |
| localStorage has old data | `window.devTools.clearStorage()` |
| Want to see what's stored | `window.devTools.getStorage()` |

---

## Storage Keys

```javascript
// What gets cleared on reset
localStorage.removeItem('auth-storage')         // User + token
localStorage.removeItem('projects-storage')     // Projects + conversations  
localStorage.removeItem('accessToken')          // Backup token
localStorage.removeItem('refreshToken')         // Refresh token

// What stays (UI preferences)
localStorage.getItem('ui-storage')              // Theme, sidebar state
```

---

## Success = ✅

After fix, this should work:

1. **Logout Test:**
   - Login → Create project → Logout
   - Page refreshes → Projects empty ✓

2. **DB Wipe Test:**
   - Create projects → Drop database → Refresh
   - Auto-detects empty response → Clears cache ✓

3. **API Error Test:**
   - Create projects → Invalid token → API call
   - 401 caught → Projects cleared ✓

4. **Dev Tools Test:**
   ```javascript
   window.devTools.validateState()
   // Should return: { valid: true, issues: [] }
   ```

---

## Reference Docs

- **Comprehensive Guide:** FRONTEND_STATE_RESET_GUIDE.md
- **Implementation Details:** STALE_DATA_FIX_SUMMARY.md
- **Code Locations:** appStateReset.ts, useDevTools.ts

---

## Key Insight

```
Before: localStorage outlives API responses
        → Stale data persists after DB wipe

After:  4-point reset system
        1. Logout clears projects ✓
        2. API errors clear projects ✓  
        3. Empty responses clear cache ✓
        4. Dev tools for manual reset ✓
        → No stale data possible
```

