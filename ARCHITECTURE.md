# 🏗️ AI Companion Studio - Architecture & Design

## System Overview

AI Companion Studio is a full-stack web application that enables users to create AI-powered projects and have conversations with multiple AI models via OpenRouter.ai.

### Core Vision
- **Multi-tenant SaaS**: Isolated user accounts with quota-based usage limits
- **Model Agnostic**: Support multiple AI providers (OpenAI, Anthropic, Meta, Mistral) through OpenRouter
- **Project-based Organization**: Users create projects, each with unique AI configurations
- **Conversation Management**: Full chat history with persistent storage

---

## 🏛️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React Components • Zustand Store • UI Components (Shadcn)  │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (HTTP/JSON)
┌──────────────────────┴──────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  Controllers • Services • Business Logic • Validators        │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries (Prisma)
┌──────────────────────┴──────────────────────────────────────┐
│                    DATA LAYER                                │
│  PostgreSQL Database • Schema • Migrations                   │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│  OpenRouter API • Cloudinary • Gmail SMTP                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model

### Core Entities

```
User
├── id (UUID)
├── email (unique)
├── password (hashed bcrypt)
├── name
├── avatar (Cloudinary URL)
├── isVerified (boolean)
├── chatUsageCount (quota tracking)
├── chatLimit (quota ceiling)
└── createdAt, updatedAt

Project (belongs to User)
├── id (UUID)
├── userId (FK)
├── name
├── description
├── model (AIModel: 'openai/gpt-3.5-turbo', etc)
├── temperature (0.0-1.0)
├── maxTokens (256-8192)
├── systemPrompt (custom AI behavior)
├── isActive (boolean)
└── createdAt, updatedAt

Conversation (belongs to Project & User)
├── id (UUID)
├── projectId (FK)
├── userId (FK)
├── title (auto-generated or manual)
├── messages[] (relationship)
└── createdAt, updatedAt

Message (belongs to Conversation)
├── id (UUID)
├── conversationId (FK)
├── role ('user' | 'assistant')
├── content (text)
├── model (which model generated this)
├── tokensUsed (for quota tracking)
└── createdAt

Prompt (belongs to Project)
├── id (UUID)
├── projectId (FK)
├── content (system prompt)
├── version (versioning)
├── isActive (current version flag)
└── createdAt
```

---

## 🔄 Data Flow

### Chat Message Flow

```
1. USER SENDS MESSAGE
   ├─ Frontend: Capture message in ChatPage
   ├─ Zustand: Store optimistic update
   └─ API: POST /api/v1/projects/:id/conversations/:id/messages

2. BACKEND PROCESSING
   ├─ Controller: Verify JWT token
   ├─ Middleware: Check project ownership
   ├─ Quota Check: Verify user has remaining quota
   ├─ Database: Save user message to Message table
   ├─ OpenRouter: Call LLM API with:
   │  ├─ Model (from Project.model)
   │  ├─ System prompt (from Prompt table)
   │  ├─ Conversation history (last 10 messages)
   │  ├─ User message (current)
   │  └─ Temperature & maxTokens (from Project)
   ├─ Database: Save assistant message
   ├─ Quota: Increment chatUsageCount
   └─ Response: Return both messages + success flag

3. FRONTEND RECEIVES RESPONSE
   ├─ Check success flag
   ├─ Update store with real message IDs
   ├─ Update quota display
   └─ Render message in chat UI

4. ERROR HANDLING
   ├─ Validation errors → 400 Bad Request
   ├─ Auth errors → 401 Unauthorized
   ├─ Permission errors → 403 Forbidden
   ├─ OpenRouter errors → Save with fallback message
   └─ Database errors → 500 Internal Server Error
```

### Authentication Flow

```
1. REGISTRATION
   └─ Email → Verification code → Database record → JWT token

2. LOGIN
   ├─ Email + Password → Verify password
   ├─ Generate JWT (accessToken, refreshToken)
   └─ Store in localStorage & httpOnly cookie

3. REQUEST WITH AUTH
   ├─ Include JWT in Authorization header
   ├─ Middleware verifies signature
   ├─ Extract user ID from token
   └─ Proceed with request

4. TOKEN REFRESH
   ├─ AccessToken expires → Use refreshToken
   ├─ Generate new accessToken
   └─ Continue session
```

---

## 🗂️ Project Structure

### Frontend (`client/`)

```
src/
├── pages/
│   ├── ChatPage.tsx           # Main chat interface
│   ├── Dashboard.tsx          # Project list
│   ├── ProjectSettings.tsx    # Config AI model, temperature, etc
│   ├── Profile.tsx            # User profile
│   ├── Settings/
│   │   ├── SettingsLayout.tsx # Settings wrapper
│   │   ├── SecurityPage.tsx   # Change password
│   │   └── PreferencesPage.tsx# Theme selection
│   ├── Login.tsx, Register.tsx, etc
│   └── ...routes

├── components/
│   ├── chat/                  # Chat UI components
│   ├── projects/              # Project cards, modals
│   ├── ui/                    # Shadcn UI components
│   ├── layout/                # AppSidebar, AppHeader
│   └── common/                # Shared components

├── store/
│   ├── projectsStore.ts       # Project & conversation state
│   ├── authStore.ts           # Auth & user state
│   └── uiStore.ts             # Theme & UI state

├── hooks/
│   ├── useAuthGuard.ts        # Protect routes
│   ├── useTokenRefresh.ts     # Auto-refresh tokens
│   └── useErrorHandler.ts     # Global error handling

├── lib/
│   ├── api.ts                 # API client with interceptors
│   └── utils.ts               # Helper functions

├── types/
│   ├── project.ts             # Project, Conversation, Message types
│   └── auth.ts                # Auth types

└── routes/
    └── index.tsx              # Route definitions
```

### Backend (`server/`)

```
src/
├── index.js                   # Entry point, server startup

├── config/
│   ├── database.js            # Prisma client
│   ├── gemini.js              # (legacy, can remove)
│   └── auth.config.js         # JWT secrets, options

├── routes/
│   ├── index.js               # Route aggregator
│   ├── auth.router.js         # /api/v1/auth/*
│   ├── user.router.js         # /api/v1/users/*
│   ├── project.router.js      # /api/v1/projects/*
│   └── chat.router.js         # /api/v1/projects/:id/conversations/*

├── controllers/
│   ├── auth.controller.js     # Login, register, verify
│   ├── user.controller.js     # Profile, password, preferences
│   ├── project.controller.js  # CRUD projects
│   └── chat.controller.js     # Send message, get history

├── services/
│   ├── auth.service.js        # JWT, password hashing
│   ├── user.service.js        # User business logic
│   ├── project.service.js     # Project management
│   ├── chat.service.js        # Message handling, OpenRouter calls
│   ├── openrouter.service.js  # OpenRouter.ai integration
│   ├── quota.service.js       # Usage quota tracking
│   └── email.service.js       # Email sending

├── middlewares/
│   ├── errorHandler.js        # Global error handling
│   ├── asyncHandler.js        # Async/await wrapper
│   ├── cors.js                # CORS configuration
│   ├── auth.middleware.js     # JWT verification
│   └── validation.js          # Input validation

├── models/
│   └── (Prisma handles all DB models)

├── utils/
│   ├── jwt.utils.js           # JWT helper functions
│   ├── password.utils.js      # Bcrypt helpers
│   ├── errors.js              # Custom error classes
│   └── cache.js               # In-memory caching

├── db/
│   └── (database utilities)

└── prisma/
    ├── schema.prisma          # Database schema
    └── migrations/            # Schema change history
```

---

## 🔐 Security Architecture

### Authentication & Authorization

```
┌─────────────────┐
│  User Login     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Verify Email + Password            │
│  (bcrypt comparison)                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Generate JWT Tokens                │
│  ├─ accessToken (15 min)            │
│  └─ refreshToken (7 days)           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Return Tokens                      │
│  ├─ Authorization header (access)   │
│  └─ httpOnly cookie (refresh)       │
└─────────────────────────────────────┘
```

### API Security

```
Request Flow:
1. Client includes JWT in Authorization header
2. Middleware extracts and verifies JWT signature
3. Extract user ID from token payload
4. Verify request targets user's own resources
5. Check specific permissions if needed
6. Process request with user context
7. Return response or error

Key Principles:
- ✅ User ID from token (not from request body)
- ✅ Verify ownership before returning data
- ✅ Validate all inputs on server
- ✅ No sensitive data in response unless needed
- ✅ HTTPS only in production
- ✅ Rate limiting per user
```

---

## 🤖 OpenRouter Integration

### Architecture

```
┌──────────────────────────────────────────┐
│  Chat Service                            │
│  (server/src/services/chat.service.js)   │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  OpenRouter Service                      │
│  (server/src/services/openrouter.service.js)
│                                          │
│  Configuration:                          │
│  ├─ baseURL: https://openrouter.ai/api/v1
│  ├─ apiKey: from .env                   │
│  ├─ defaultHeaders:                     │
│  │  ├─ HTTP-Referer: app URL            │
│  │  └─ X-Title: app name                │
│  └─ Uses official OpenAI SDK v6.16.0    │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  OpenRouter.ai API                       │
│                                          │
│  Request:                                │
│  ├─ Model: openai/gpt-3.5-turbo, etc   │
│  ├─ Messages: [system, history, user]   │
│  ├─ Temperature & maxTokens             │
│  └─ Headers: API key, referer, title    │
│                                          │
│  Response:                               │
│  ├─ Assistant message content            │
│  ├─ Token usage (prompt + completion)   │
│  └─ Model info                          │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│  Chat Service                            │
│  ├─ Save message to database            │
│  ├─ Update quota usage                  │
│  └─ Return response to controller       │
└──────────────────────────────────────────┘
```

### Supported Models

```
OpenAI:
  ├─ openai/gpt-4-turbo
  ├─ openai/gpt-4
  └─ openai/gpt-3.5-turbo

Anthropic:
  ├─ anthropic/claude-3-opus-20250219
  └─ anthropic/claude-3-sonnet-20250229

Meta:
  └─ meta-llama/llama-3.1-405b

Mistral:
  └─ mistralai/mistral-large
```

---

## 📈 Scalability Considerations

### Current State
- ✅ In-memory caching (conversation lists)
- ✅ Database indexing on foreign keys
- ✅ Efficient Prisma queries
- ✅ JWT-based stateless auth

### Future Improvements
- 🔄 Redis caching for frequently accessed data
- 🔄 Message pagination (currently loads all)
- 🔄 Background jobs for email/cleanup
- 🔄 WebSocket for real-time chat
- 🔄 CDN for static assets
- 🔄 Database read replicas for reports

---

## 🔄 Key Workflows

### Creating a Project

```
User → Frontend Form → Validation (Zod)
                    ↓
           POST /api/v1/projects
                    ↓
Backend: Validate input, Verify user auth
                    ↓
         Create Project in database
                    ↓
      Return project with default values
                    ↓
Frontend: Update store, Navigate to project
```

### Starting a Conversation

```
Click "New Conversation" 
              ↓
POST /api/v1/projects/:id/conversations
              ↓
Backend: Create in DB, return ID
              ↓
Frontend: Navigate to conversation, focus input
              ↓
Ready to send first message
```

### Sending a Message

```
User types message, clicks send
              ↓
Optimistic update in Zustand (shows immediately)
              ↓
POST to /api/v1/.../messages with:
  - conversationId
  - messageContent
  - projectId (for context)
              ↓
Backend receives → Saves user message
              ↓
Call OpenRouter with:
  - Model from project config
  - System prompt from database
  - Last 10 messages (conversation history)
  - Current user message
              ↓
OpenRouter processes → Returns response
              ↓
Backend saves assistant message
              ↓
Increment user's quota
              ↓
Return response to frontend
              ↓
Frontend updates store with real data
              ↓
Display both messages in chat
```

---

## 🧪 Testing Strategy

### Frontend Testing
- Component unit tests (Vitest)
- Store state tests
- API client mocks
- Form validation tests

### Backend Testing
- Route integration tests
- Service unit tests
- Database transaction tests
- Error handling tests
- OpenRouter mock tests

### E2E Testing
- Auth flow (register → login → verify)
- Project creation and management
- Full chat conversation flow
- Quota enforcement
- Error scenarios

---

## 📋 Performance Metrics

### Current Optimizations
- Database queries: ~20-50ms
- OpenRouter API: ~1-3 seconds (model dependent)
- Frontend rendering: <100ms
- JWT verification: <1ms
- Cache hits: Instant (in-memory)

### Monitoring Endpoints
- `/health` - Server status
- Database connection pool monitoring
- OpenRouter API rate limit tracking
- User quota tracking per request

---

## 🚀 Deployment Architecture

### Development
```
Client: http://localhost:5173 (Vite dev server)
Server: http://localhost:3000 (Node.js)
DB: PostgreSQL (local)
```

### Production Ready
```
Client: React app → CDN
Server: Node.js → Load balancer → Multiple instances
DB: PostgreSQL → Read replicas
Cache: Redis cluster
Monitoring: Logging + alerting
```

---

## 📦 Technology Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **State**: Zustand
- **UI**: Shadcn/ui (Tailwind CSS)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Build**: Vite
- **Package Manager**: Bun

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Email**: Nodemailer (Gmail SMTP)
- **File Storage**: Cloudinary
- **LLM**: OpenRouter.ai (OpenAI SDK)

### Infrastructure
- **Database**: PostgreSQL 14+
- **API**: REST (HTTP/JSON)
- **Caching**: In-memory (upgradeable to Redis)
- **External Services**:
  - OpenRouter.ai (LLM proxy)
  - Cloudinary (image hosting)
  - Gmail (email sending)

---

## 🔗 Key Integration Points

### OpenRouter Integration
- **Purpose**: Access multiple AI models from one API
- **Why**: Cost-effective, model variety, unified interface
- **Server-only**: API key never exposed to frontend
- **Configuration**: Base URL + API key from environment

### Cloudinary Integration
- **Purpose**: Avatar image upload and hosting
- **Why**: Reliable, fast CDN, easy integration
- **Configuration**: API key in frontend (public-safe)

### Gmail Integration
- **Purpose**: Send verification emails
- **Why**: Reliable, free, good deliverability
- **Configuration**: App-specific password in .env

---

## 🎯 Design Principles

1. **Security First**: Auth on every endpoint, server-side validation, secrets in .env
2. **User-Centric**: Responsive design, fast feedback, clear error messages
3. **Scalable**: Stateless architecture, database optimization, caching ready
4. **Maintainable**: Clear separation of concerns, documented code, type safety
5. **Resilient**: Error handling, graceful degradation, fallback messages
6. **Efficient**: Minimal API calls, smart caching, optimized queries

---

## 📚 Related Documentation

- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification
- [QUOTA_SYSTEM_DOCUMENTATION.md](./server/QUOTA_SYSTEM_DOCUMENTATION.md) - Quota details
- [AUTH_FLOW_GUIDE.md](./AUTH_FLOW_GUIDE.md) - Authentication details
- [README.md](./README.md) - Getting started

---

**Version**: 1.0  
**Last Updated**: January 17, 2026  
**Status**: Production Ready ✅
