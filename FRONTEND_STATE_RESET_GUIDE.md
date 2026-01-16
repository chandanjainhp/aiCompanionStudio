# 🧹 Frontend State Reset - Stale Data Fix

## Problem Analysis

When PostgreSQL database is wiped, frontend still displays:
- Old projects
- Old conversations  
- Old chat messages
- User stays "logged in" with cached token

**Root Cause:** Zustand persist middleware stores everything in localStorage, surviving page reloads.

---

## Architecture: 3-Layer Persistence

### Layer 1: Zustand Persist (localStorage)
```
- auth-storage       → User, token, login state
- projects-storage   → Projects, conversations, messages  
- ui-storage         → Theme, sidebar state
```

### Layer 2: API Client (in-memory)
```
- Cached responses
- Token in memory
```

### Layer 3: React State (in-memory)
```
- Component state
- Current user/project
```

**Problem:** Layers 1-3 don't communicate when DB wipes. Frontend thinks it's still valid.

---

## Solutions Implemented

### ✅ 1. Global Reset Utility
**File:** `client/src/lib/appStateReset.ts`

```typescript
// Full reset: clears auth + projects
resetAppState(reason: string)

// Soft reset: clears projects only, keeps user logged in
resetProjectsData(reason: string)

// Validation: detect stale state
validateStoredState()
```

**Usage:**
```typescript
import { resetAppState, resetProjectsData } from '@/lib/appStateReset';

// On logout or API 401
resetAppState('user_logout');

// When backend returns empty but cache has data
resetProjectsData('database_wiped');
```

---

### ✅ 2. Auto-Reset on Logout
**File:** `client/src/store/authStore.ts`

When user calls `logout()`:
1. Calls API logout endpoint
2. Clears auth state (user, token)
3. **NEW:** Calls `resetProjectsData()` to clear cached projects
4. Removes localStorage tokens

```typescript
logout: async () => {
  // ... logout logic ...
  resetProjectsData('user_logout');  // Clear stale projects
  console.log('✅ User logged out successfully - all data cleared');
}
```

---

### ✅ 3. Auto-Reset on 401/403 API Errors
**File:** `client/src/lib/api.ts`

When API returns 401 (unauthorized) or 403 (forbidden):
- Automatically clears cached project data
- Prevents "ghost" projects from appearing

```typescript
private async handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 || response.status === 403) {
    console.error(`🔴 Auth error (${response.status}). Clearing cached project data...`);
    resetProjectsData(`api_${response.status}`);
  }
  // ... rest of handling ...
}
```

---

### ✅ 4. Clear Cache on Empty Response
**File:** `client/src/store/projectsStore.ts`

When backend returns empty projects array:
- Compare with cached projects
- If cache has data but backend returns empty → **clear cache**
- Prevents stale data from being rendered

```typescript
fetchProjects: async () => {
  const response = await apiClient.getProjects();
  
  // 🔴 CRITICAL: If backend empty but cache has data, clear cache
  if (response.projects.length === 0) {
    const currentState = get();
    if (currentState.projects.length > 0) {
      console.warn('⚠️  Backend empty but cache has data - clearing cache');
      set({ 
        projects: [], 
        currentProject: null,
        conversations: [],
        currentConversation: null,
      });
      return;
    }
  }
}
```

---

## Development Tools

### Browser Console Access
```javascript
// Full help
window.devTools.help()

// Reset everything (requires reload)
window.devTools.resetApp()

// Clear projects only
window.devTools.resetProjects()

// Check for stale data
window.devTools.validateState()

// Show current state
window.devTools.showState()

// Display what's in localStorage
window.devTools.getStorage()

// Clear all storage
window.devTools.clearStorage()
```

---

## Database Wipe Workflow

### Development Best Practice

**After dropping PostgreSQL:**

1. **Stop frontend dev server** (Ctrl+C)
2. **Stop backend dev server** (Ctrl+C)
3. **Drop database:**
   ```bash
   node delete-all-data.js  # Clears data, keeps schema
   ```
   Or full reset:
   ```bash
   npx prisma migrate reset  # Drops schema, reapplies migrations
   ```
4. **Start backend:** `npm run dev` (recreates schema)
5. **Start frontend:** `bun run dev`
6. **In browser console:**
   ```javascript
   window.devTools.resetApp()
   location.reload()  // Page reload
   ```
7. **Login again** with fresh credentials

---

## Reset Triggers

### Automatic Resets

| Trigger | Action | Reason |
|---------|--------|--------|
| User clicks "Logout" | `resetProjectsData()` | Clear cached projects |
| API returns 401 | `resetProjectsData()` | Token expired or invalid |
| API returns 403 | `resetProjectsData()` | User lost permission |
| `fetchProjects()` returns `[]` | Soft reset | Detect DB wipe |

### Manual Resets (Dev Tools)

```javascript
// Full reset
window.devTools.resetApp()

// Projects only
window.devTools.resetProjects()
```

---

## Persistence Settings

### What Gets Persisted

```typescript
// authStore: Selective persistence
{
  user,                  // ✅ Persist
  accessToken,           // ✅ Persist
  isAuthenticated,       // ✅ Persist
  loginMethod,           // ❌ Don't persist (fresh selection)
  otpState,              // ❌ Don't persist (security)
  registerData,          // ✅ Persist (form recovery)
}

// projectsStore: Full persistence
{
  projects,              // ✅ Persist all
  conversations,         // ✅ Persist all
  currentProject,        // ✅ Persist
  currentConversation,   // ✅ Persist
}

// uiStore: Preferences only
{
  theme,                 // ✅ Persist (UX)
  sidebarOpen,           // ✅ Persist (UX)
}
```

---

## State Validation Logic

### validateStoredState() Checks

```typescript
// Check 1: User authenticated but no token
if (authState.isAuthenticated && !authState.accessToken) {
  issue: 'Authentication state mismatch'
}

// Check 2: Projects cached but not authenticated
if (projectsState.projects.length > 0 && !authState.isAuthenticated) {
  issue: 'Stale data: projects cached but user not authenticated'
}

// Check 3: Conversations without current project
if (projectsState.conversations.length > 0 && !projectsState.currentProject) {
  issue: 'Stale data: conversations cached but no current project'
}
```

---

## API Error Handling Flow

```
API Call Made
    ↓
Response Received
    ↓
Status Check:
  ├─ 200-399 ✅ → Return data normally
  ├─ 401 🔴 → resetProjectsData() + throw error
  ├─ 403 🔴 → resetProjectsData() + throw error
  └─ 400,404+ → throw error
    ↓
Route Guard Catches Error
    ↓
If 401: Redirect to /login
If 403: Redirect to /dashboard or error page
```

---

## Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `lib/appStateReset.ts` | ✨ NEW | Global reset utility |
| `lib/api.ts` | 🔴 API error handling | Auto-reset on 401/403 |
| `store/authStore.ts` | 🔄 Logout + import | Reset projects on logout |
| `store/projectsStore.ts` | 🔍 Empty response check | Detect DB wipe |
| `hooks/useDevTools.ts` | ✨ NEW | Browser console debugging |
| `App.tsx` | 🪝 Add hook | Initialize dev tools |

---

## Testing the Fix

### Test 1: Logout Clears Cache
```
1. Login and create a project
2. Logout
3. Open DevTools → Application → localStorage
4. Verify 'projects-storage' is EMPTY
5. Login again - projects list should be empty
```

### Test 2: Database Wipe
```
1. Login and create projects
2. In new terminal: node delete-all-data.js
3. Refresh browser
4. If projects still show: run window.devTools.resetApp()
5. Refresh again - should be empty
```

### Test 3: API 401 Error
```
1. Manually set invalid token: 
   localStorage.setItem('accessToken', 'invalid')
2. Refresh page
3. Try to access /dashboard
4. Should trigger 401 and clear cache
5. Should redirect to /login
```

### Test 4: Validate State
```
1. In console: window.devTools.validateState()
2. Should return { valid: true, issues: [] }
3. If issues found, data is stale
```

---

## Troubleshooting

### Projects still appear after logout
**Cause:** Reset didn't run or store didn't clear  
**Fix:** 
```javascript
window.devTools.resetProjects()
location.reload()
```

### User stays "logged in" after DB wipe
**Cause:** Token still in localStorage, valid but user deleted  
**Fix:** Happens on next API call → auto-redirects to login

### State validation shows issues
**Cause:** Inconsistent state (user auth but no projects)  
**Fix:**
```javascript
window.devTools.resetApp()
location.reload()
```

### localStorage still has old data
**Cause:** Reset didn't clear storage  
**Fix:**
```javascript
window.devTools.clearStorage()
location.reload()
```

---

## Best Practices

### ✅ DO

- ✅ Call `resetProjectsData()` after auth changes
- ✅ Call `resetAppState()` on critical errors
- ✅ Validate state after backend changes
- ✅ Use dev tools for testing in development
- ✅ Clear cache when DB is wiped

### ❌ DON'T

- ❌ Manually edit localStorage (use dev tools)
- ❌ Clear state without clearing storage
- ❌ Keep old localStorage keys when upgrading
- ❌ Assume persistent data matches backend
- ❌ Skip validation on empty responses

---

## Security Considerations

### Sensitive Data NOT Persisted
- OTP codes (requested fresh each time)
- Login method selection (fresh each session)
- Temporary passwords during registration

### Sensitive Data Persisted (with expiry)
- accessToken (validated on startup, can expire)
- user object (validated with backend on init)
- Registration state (only until verified)

### Best Practice
- Tokens include expiry claim
- `initializeAuth()` validates token on app load
- 401 responses trigger token removal
- No sensitive data in plain text localStorage

---

## Summary

| Component | Role | Trigger |
|-----------|------|---------|
| `appStateReset.ts` | Coordinator | Manual or automatic reset |
| `authStore.logout()` | Auth trigger | User logout event |
| `api.handleResponse()` | API trigger | 401/403 response |
| `projectsStore.fetchProjects()` | Data trigger | Empty response |
| `useDevTools` | Manual trigger | Browser console |

**Result:** No stale data after DB wipes. Frontend always matches backend reality.

