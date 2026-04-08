# Quick Start - Project Settings Tests

## TL;DR - Run Tests in 3 Steps

### Step 1: Install Dependencies
```bash
cd server
npm install
```

### Step 2: Set Up Database
```bash
# Ensure DATABASE_URL is in .env
npm run db:migrate
```

### Step 3: Run Tests
```bash
npm test
```

## Common Commands

| Command | What it does |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests & watch for changes |
| `npm run test:run` | Run tests once with full output |
| `npm run test:ui` | Run tests with visual UI |
| `npm test -- project-settings.test.js` | Run only project settings tests |
| `npm test -- -t "Creation"` | Run tests matching "Creation" |

## What Gets Tested

### ✅ Feature: Per-Project AI Settings
Each project has its own independent configuration:
- **Model**: GPT-4, Claude, Llama, etc.
- **Temperature**: Randomness of responses (0.0-1.0)
- **Max Tokens**: Response length limit
- **System Prompt**: Instructions for the AI
- **Core Memory**: Persistent facts about user

### ✅ Test Coverage (17 tests total)

**Creation & Defaults** (3 tests)
- Custom settings
- Default settings
- Different settings per project

**Retrieval & Independence** (2 tests)
- Single project retrieval
- Multiple projects isolation

**Updates** (3 tests)
- Update settings independently
- Don't affect other projects
- Partial updates work

**System Prompt** (3 tests)
- Retrieve system prompt
- Core memory injection
- Default prompts

**Security** (2 tests)
- User isolation
- Multi-user independence

**Boundaries & Scale** (2 tests)
- Temperature (0.0-1.0)
- Token counts (256-8192)

**API Integration** (2 tests)
- Settings ready for AI API
- Multiple projects work

## Expected Output

Green checkmarks ✅ for all tests = Everything works!

```
✓ Project Settings - Per-Project AI Configuration
  ✓ 1. Project Creation (3 tests)
  ✓ 2. Project Retrieval (2 tests)
  ✓ 3. Project Settings Update (3 tests)
  ✓ 4. System Prompt Handling (3 tests)
  ✓ 5. Data Integrity (2 tests)
  ✓ 6. Settings Range Validation (2 tests)

✓ Project Settings - AI API Integration (2 tests)

Test Files  2 passed (2)
     Tests  17 passed (17)
```

## Troubleshooting

### "PRISMA_CLIENT_ENGINE_TYPE" error
```bash
npm run db:generate
```

### "Cannot find module 'vitest'"
```bash
npm install --save-dev vitest
```

### "DATABASE_URL not set"
Create `.env` in server directory:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### Tests timeout
1. Check database is running
2. Check DATABASE_URL is correct
3. Increase timeout in vitest.config.js

## Files Changed/Created

✅ **Created:**
- `server/src/test/project-settings.test.js` - Comprehensive test suite (400+ lines)
- `server/vitest.config.js` - Vitest configuration
- `server/TEST_GUIDE.md` - Detailed test documentation
- `server/QUICK_START.md` - This file

✅ **Updated:**
- `server/package.json` - Added vitest, updated test scripts

## What This Verifies

### ✅ Database Level
- Prisma schema correctly stores per-project settings
- userId isolation works (multi-tenant)
- Indexes are optimized

### ✅ Service Layer
- projectService.createProject() handles settings
- projectService.updateProject() updates independently
- projectService.getProjectById() retrieves all settings
- chatService.getActiveSystemPrompt() includes core memory

### ✅ API Level
- POST /api/v1/projects creates with settings
- PUT /api/v1/projects/:id updates settings
- GET /api/v1/projects/:id retrieves settings with all fields

### ✅ AI Integration
- callOpenRouterWithContext() uses project model
- callOpenRouterWithContext() uses project temperature
- callOpenRouterWithContext() uses project maxTokens
- callOpenRouterWithContext() uses project systemPrompt

### ✅ Security
- Users can only access their own projects
- Settings are user-isolated
- No data leakage between users

## Next: Integration Testing

To test with real AI API:
1. Set `OPENROUTER_API_KEY` in .env
2. Create conversation and send message
3. Verify response uses project settings

## Success Criteria

✅ All 17 tests pass
✅ No red/failed tests
✅ No timeout errors
✅ Execution time < 30 seconds

## More Info

See `TEST_GUIDE.md` for:
- Detailed test explanations
- How settings flow through system
- Expected test data
- Troubleshooting guide
