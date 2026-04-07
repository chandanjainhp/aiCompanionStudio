# 🚀 AI Companion Studio - Complete Project Documentation

**Document Version:** 1.0
**Date:** April 7, 2026
**Purpose:** Comprehensive guide to project structure, initialization flow, and all scripts

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Complete File Structure](#complete-file-structure)
3. [Startup Flow (Start Method)](#startup-flow-start-method)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Database Schema](#database-schema)
8. [Scripts & Commands](#scripts--commands)

---

## 📌 Project Overview

### What is AI Companion Studio?

AI Companion Studio is a **full-stack SaaS platform** that allows users to:
- Create custom AI projects with personalized configurations
- Chat with multiple AI models (OpenAI, Anthropic, Meta Llama, Mistral)
- Manage conversation history
- Track API usage with quota limits
- Upload user avatars
- Manage core memories for persistent context

### Core Technologies

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18, Vite, Zustand, Tailwind CSS, Shadcn/ui |
| **Backend** | Node.js, Express, Prisma ORM, PostgreSQL |
| **External APIs** | OpenRouter.ai, Cloudinary, Gmail SMTP |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 📂 Complete File Structure

### Root Directory Structure

```
aiCompanionStudio-full-developer/
├── docker-compose.yml          # Orchestrates Docker containers
├── nginx_host.conf             # Nginx reverse proxy config
├── README.md                   # Project readme
├── ARCHITECTURE.md             # System architecture docs
│
├── client/                     # React frontend application
│   ├── package.json
│   ├── vite.config.js         # Vite build config
│   ├── vitest.config.js       # Test config
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── eslint.config.js       # Linting rules
│   ├── postcss.config.js      # CSS processing
│   ├── Dockerfile             # Docker image for frontend
│   ├── nginx.conf             # Nginx config for frontend
│   ├── index.html             # Entry HTML
│   ├── public/                # Static assets
│   │   └── vite.svg
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── index.css          # Global styles
│       ├── App.jsx            # Main App component
│       ├── App.css
│       ├── components/        # Reusable UI components
│       │   ├── ErrorBoundary.jsx
│       │   ├── ErrorPage.jsx
│       │   ├── NavLink.jsx
│       │   ├── auth/          # Auth components (Login, Register, OTP, etc)
│       │   ├── chat/          # Chat interface components
│       │   ├── common/        # Common components (Header, Footer, etc)
│       │   ├── examples/      # Example components
│       │   ├── layout/        # Layout wrapper components
│       │   ├── projects/      # Project management components
│       │   └── ui/            # Shadcn UI components
│       ├── hooks/             # Custom React hooks
│       │   ├── use-mobile.jsx
│       │   ├── use-toast.jsx
│       │   ├── useApiErrorHandler.jsx
│       │   ├── useAuthGuard.jsx
│       │   ├── useDevTools.jsx
│       │   ├── useErrorHandler.jsx
│       │   └── useTokenRefresh.jsx
│       ├── lib/               # Utility functions
│       │   ├── api.jsx        # Axios API client
│       │   ├── appStateReset.jsx
│       │   ├── request-audit.jsx
│       │   ├── tokenUtils.js  # JWT token management
│       │   └── utils.jsx      # Helper functions
│       ├── pages/             # Page components (routes)
│       │   ├── ChatPage.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Profile.jsx
│       │   ├── ProjectSettings.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── OTPLogin.jsx
│       │   ├── VerifyOTP.jsx
│       │   ├── VerifyRegistration.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── TermsOfService.jsx
│       │   ├── LandingPage.jsx
│       │   ├── NotFound.jsx
│       │   └── Settings/
│       ├── routes/            # Route definitions & protection
│       │   ├── index.jsx      # Main router setup
│       │   ├── AuthInitializer.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── PublicRoute.jsx
│       │   ├── OTPVerifyRoute.jsx
│       │   └── VerifyRegistrationRoute.jsx
│       ├── store/             # Zustand state management
│       │   ├── authStore.jsx  # Auth state (user, tokens)
│       │   ├── projectsStore.jsx # Projects state
│       │   └── uiStore.jsx    # UI state (theme, toast)
│       ├── test/              # Testing setup
│       │   ├── setup.jsx
│       │   └── example.test.jsx
│       └── types/             # TypeScript/JSDoc types
│           └── project.js
│
└── server/                    # Node.js backend application
    ├── package.json
    ├── Dockerfile             # Docker image for backend
    ├── docker-compose.yml
    ├── Readme.md
    │
    ├── prisma/                # Database ORM
    │   ├── schema.prisma      # Database schema definition
    │   ├── seed.js            # Database seeding script
    │   ├── backfill-quota.sql # SQL data migration
    │   └── migrations/        # Database migrations history
    │       ├── migration_lock.toml
    │       ├── 20260116065808_add_user_id_to_conversation_and_user_indexes/
    │       ├── 20260116102851_add_soft_delete_to_projects/
    │       ├── 20260116110040_add_conversations_soft_delete_and_model/
    │       └── 20260407120000_add_core_memory_to_projects/
    │
    ├── email/                 # Email configuration & templates
    │   ├── email.config.js    # Email setup (Gmail SMTP, Nodemailer)
    │   ├── emails.js          # Email sending logic
    │   ├── emailTemplates.js  # HTML email templates
    │   ├── setupTestEmail.js  # Email testing utilities
    │   ├── testEmail.js
    │   └── testEmailConfig.js
    │
    ├── uploads/               # Local file storage
    │   └── [uploaded files]   # User avatars before Cloudinary upload
    │
    └── src/                   # Main application code
        ├── index.js           # ⭐ SERVER ENTRY POINT (START METHOD)
        ├── app.js             # Express app initialization
        ├── constants.js       # Global constants
        ├── firsttypeindex.js  # Type indexing utility
        ├── config/            # Configuration files
        │   ├── env.js         # Environment variables validation
        │   ├── database.js    # Prisma client initialization
        │   ├── email.js       # Email transporter setup
        │   ├── cloudinary.js  # Cloudinary SDK config
        │   ├── gemini.js      # Gemini API config (local LLM)
        │   └── openai.js      # OpenAI API config
        ├── constants/         # Application constants
        ├── controllers/       # Request handlers
        │   ├── auth.controller.js    # Authentication logic
        │   ├── user.controller.js    # User profile logic
        │   ├── chat.controller.js    # Chat/conversation logic
        │   ├── project.controller.js # Project management logic
        │   ├── ai.controller.js      # AI model integration logic
        │   ├── prompt.controller.js  # Prompt management logic
        │   ├── file.controller.js    # File upload logic
        │   └── use.controller.js
        ├── services/          # Business logic layer
        │   ├── auth.service.js       # Auth business logic
        │   ├── chat.service.js       # Chat business logic
        │   ├── openrouter.service.js # OpenRouter API client
        │   ├── gemini-api.service.js # Gemini local LLM client
        │   ├── local-llm.service.js  # Local LLM integration
        │   ├── otp.service.js        # OTP generation/verification
        │   ├── project.service.js    # Project business logic
        │   ├── prompt.service.js     # Prompt management logic
        │   ├── memory.service.js     # Core memory service
        │   ├── quota.service.js      # Usage quota tracking
        │   ├── file.service.js       # File operations
        │   └── statistics.service.js # Usage statistics
        ├── middlewares/       # Express middleware
        │   ├── auth.middle.js         # JWT verification middleware
        │   ├── error-handler.js       # Global error handler
        │   ├── cloudinary-upload.middleware.js # Cloudinary upload handling
        │   ├── multer.middleware.js   # File upload (multipart/form-data)
        │   ├── data-validation.js     # Input validation
        │   └── rate-limit.js          # Rate limiting
        ├── routes/            # API route definitions
        │   ├── index.js       # Route aggregator
        │   ├── auth.router.js        # Auth endpoints
        │   ├── user.router.js        # User endpoints
        │   ├── chat.router.js        # Chat/conversation endpoints
        │   ├── project.router.js     # Project endpoints
        │   ├── ai.router.js          # AI endpoints
        │   ├── prompt.router.js      # Prompt endpoints
        │   ├── file.router.js        # File upload endpoints
        │   └── test.router.js        # Testing endpoints
        ├── models/            # Prisma models (in schema.prisma)
        ├── db/                # Database utilities
        ├── utils/             # Helper utilities
        │   ├── errors.js      # Custom error classes
        │   ├── validation.js  # Input validation functions
        │   ├── cache.js       # Redis/in-memory caching
        │   ├── jwt.utils.js   # JWT token utilities
        │   └── logger.js      # Logging utilities
        └── uploads/           # Local file storage

```

---

## 🚀 Startup Flow (Start Method)

### What Happens When The Server Starts?

The server initialization follows a **3-phase startup process**:

#### **Phase 1: Environment Setup** (`server/src/index.js`)

```javascript
// 1. Load environment variables
dotenv.config();

// 2. Validate production environment
validateProductionEnv();

// 3. Create uploads directory if not exists
const uploadDir = path.resolve(config.fileUploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
```

**What happens:**
- Reads `.env` file for configuration
- Validates required production variables
- Creates `/uploads` folder for temporary file storage

#### **Phase 2: Server Initialization** (`server/src/app.js`)

```javascript
// 1. Create Express app instance
const app = express();

// 2. Setup security middleware (Helmet)
app.use(helmet());

// 3. Setup CORS for cross-origin requests
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

// 4. Setup body parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// 5. Setup compression
app.use(compression());

// 6. Initialize email transporter
initializeEmailTransporter();

// 7. Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// 8. Register all routes
app.use(`${apiV1}/auth`, authRouter);
app.use(`${apiV1}/projects`, projectRouter);
app.use(`${apiV1}/users`, userRouter);
app.use(`${apiV1}/ai`, aiRouter);
// ... more routes

// 9. Setup error handlers
app.use(notFoundHandler);
app.use(errorHandler);
```

**What happens:**
- Initializes Express application
- Registers all security & parsing middleware
- Sets up CORS for frontend communication
- Initializes email transporter for sending verification emails
- Registers all API route handlers
- Sets up error handling

#### **Phase 3: Database Connection & Server Listen** (Back in `index.js`)

```javascript
const startServer = async () => {
  try {
    // 1. Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');

    // 2. Listen on port 3000
    const server = app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });

    // 3. Add error handlers
    server.on('error', (error) => {
      console.error('❌ Server Error:', error.message);
    });

    // 4. Graceful shutdown handlers
    const shutdown = async () => {
      console.log('⏹️  Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('❌ Server stopped');
        process.exit(0);
      });
    };

    // Listen for termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Execute startup
startServer();
```

**What happens:**
- Connects to PostgreSQL database
- Starts Express server on port 3000
- Sets up graceful shutdown (closes connections before exiting)
- Logs startup information

### Complete Startup Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                   SERVER STARTUP FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. npm/bun run dev
   └─→ node -r dotenv/config src/index.js

2. Load Environment Variables
   └─→ dotenv.config()
   └─→ validateProductionEnv()

3. Create Upload Directory
   └─→ fs.mkdirSync(uploadDir)

4. Initialize Express App (app.js)
   └─→ Middleware Setup
       ├─ Helmet (Security)
       ├─ CORS
       ├─ Body Parser
       ├─ Compression
       └─ Morgan (Logging)
   └─→ Initialize Email Transporter
   └─→ Register Routes
       ├─ /api/v1/auth
       ├─ /api/v1/projects
       ├─ /api/v1/users
       ├─ /api/v1/chat
       ├─ /api/v1/ai
       └─ ... more routes
   └─→ Setup Error Handlers

5. Database Connection
   └─→ prisma.$queryRaw`SELECT 1`
   └─→ console.log('✅ Database connected')

6. Listen on Port 3000
   └─→ app.listen(3000, '0.0.0.0')
   └─→ console.log('🚀 Server is running')

7. Setup Graceful Shutdown
   └─→ SIGTERM/SIGINT handlers
   └─→ Close database connections
   └─→ Exit process

✅ SERVER READY
Available at: http://localhost:3000
Health Check: http://localhost:3000/health
API Base: http://localhost:3000/api/v1
```

---

## 🏗️ Backend Architecture

### Layer 1: Routes (API Endpoints Definition)

**File:** `server/src/routes/*.router.js`

Routes define the **API contract** - what endpoints are available and what middleware to apply.

#### Example: Auth Routes (`auth.router.js`)

```javascript
router.post('/register',
  authRateLimiter,      // Rate limit: max 5 requests per 15 min
  validateRegister,     // Validate user input
  handleValidationErrors,
  authController.register // Call controller handler
);

router.post('/login',
  authRateLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

router.get('/me',
  verifyJWT,            // Middleware: Check JWT token
  authController.getMe
);
```

**Key Route Files:**

| Route | Purpose | Protected |
|-------|---------|-----------|
| `auth.router.js` | Register, Login, OTP, Password Reset | Some |
| `user.router.js` | Profile, Avatar Upload | Yes |
| `project.router.js` | Create/Read/Update/Delete Projects | Yes |
| `chat.router.js` | Conversations, Messages, Chat | Yes |
| `ai.router.js` | AI Model Selection, Settings | Yes |
| `prompt.router.js` | Custom System Prompts | Yes |
| `file.router.js` | File Upload Handling | Yes |

### Layer 2: Controllers (Request Handlers)

**File:** `server/src/controllers/*.controller.js`

Controllers execute the **business logic** - they handle client requests and orchestrate services.

#### Example: Chat Controller (`chat.controller.js`)

```javascript
export const sendMessage = async (req, res, next) => {
  try {
    // 1. Extract request data
    const { projectId, conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // 2. Validate user owns project
    const project = await projectService.validateProjectOwnership(projectId, userId);

    // 3. Check quota
    const canChat = await quotaService.checkUserQuota(userId);
    if (!canChat) throw new Error('Quota exceeded');

    // 4. Call service to send message
    const response = await chatService.sendMessage({
      projectId,
      conversationId,
      userId,
      content,
      model: project.model
    });

    // 5. Return response
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

**Key Controllers:**

| Controller | Methods | Purpose |
|-----------|---------|---------|
| `auth.controller.js` | register, login, logout, refreshToken, getMe, sendOTP, verifyOTP | Authentication |
| `user.controller.js` | getProfile, updateProfile, uploadAvatar | User management |
| `project.controller.js` | listProjects, createProject, updateProject, deleteProject | Project CRUD |
| `chat.controller.js` | createConversation, getConversation, sendMessage, stopMessage | Chat operations |
| `ai.controller.js` | getAvailableModels, testConnection | AI integration |

### Layer 3: Services (Business Logic)

**File:** `server/src/services/*.service.js`

Services contain **complex business logic** - they work with databases, external APIs, and other services.

#### Example: Chat Service (`chat.service.js`)

```javascript
export const sendMessage = async ({
  projectId, conversationId, userId, content, model
}) => {
  // 1. Retrieve project configuration
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { systemPrompt: true, temperature: true, maxTokens: true }
  });

  // 2. Get system prompt (with core memory)
  const systemPrompt = await getActiveSystemPrompt(projectId);

  // 3. Retrieve conversation history
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 50 // Last 50 messages
      }
    }
  });

  // 4. Format messages for AI API
  const messages = conversation.messages.map(m => ({
    role: m.role,
    content: m.content
  }));
  messages.push({ role: 'user', content });

  // 5. Call OpenRouter API
  const aiResponse = await openRouterService.chat({
    model,
    messages,
    systemPrompt,
    temperature: project.temperature,
    maxTokens: project.maxTokens
  });

  // 6. Save messages to database
  await prisma.message.createMany({
    data: [
      { conversationId, role: 'user', content, model },
      { conversationId, role: 'assistant', content: aiResponse.text, model }
    ]
  });

  // 7. Update quota
  await quotaService.updateUsage(userId, aiResponse.tokensUsed);

  // 8. Invalidate cache
  invalidateUserConversationsCache(userId);

  return {
    userMessage: content,
    assistantMessage: aiResponse.text,
    tokensUsed: aiResponse.tokensUsed
  };
};
```

**Key Services:**

| Service | Purpose |
|---------|---------|
| `auth.service.js` | Hash passwords, verify credentials, JWT handling |
| `chat.service.js` | Format messages, call AI APIs, save conversations |
| `openrouter.service.js` | OpenRouter API client for multiple AI models |
| `gemini-api.service.js` | Google Gemini API integration |
| `project.service.js` | Project creation, configuration management |
| `quota.service.js` | Track API usage and enforce limits |
| `otp.service.js` | Generate and verify OTP codes |
| `memory.service.js` | Core memory injection into prompts |

### Layer 4: Middlewares (Request Processing)

**File:** `server/src/middlewares/*.js`

Middlewares process requests **before** they reach controllers.

#### Key Middlewares:

```javascript
// 1. JWT Verification (auth.middle.js)
export const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded; // Attach user to request
    next();
  });
};

// 2. Rate Limiting (rate-limit.js)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 requests max
  message: 'Too many attempts'
});

// 3. Input Validation (data-validation.js)
export const validateRegister = [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty()
];

// 4. File Upload (multer.middleware.js)
export const uploadAvatar = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

// 5. Error Handler (error-handler.js)
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    errorCode: err.errorCode
  });
};
```

### Layer 5: Database (Prisma ORM)

**File:** `server/prisma/schema.prisma`

Prisma is an ORM that maps JavaScript objects to database tables.

#### Key Models:

```prisma
// User model
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String    // bcrypt hashed
  name              String
  phoneNumber       String?
  avatarUrl         String?   // Cloudinary URL
  isVerified        Boolean   @default(false)
  chatLimit         Int       @default(10)
  chatUsageCount    Int       @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  projects          Project[]
  conversations     Conversation[]
  messages          Message[]
}

// Project model
model Project {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  name              String
  description       String?
  model             String    // e.g., "gpt-3.5-turbo"
  temperature       Float     @default(0.7)
  maxTokens         Int       @default(2048)
  systemPrompt      String    // Custom AI behavior
  coreMemory        String?   // Persistent facts
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  conversations     Conversation[]
  prompts           Prompt[]
}

// Conversation model
model Conversation {
  id                String    @id @default(cuid())
  projectId         String
  project           Project   @relation(fields: [projectId], references: [id])
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  title             String    // Auto-generated or manual
  messages          Message[]
  deletedAt         DateTime? // Soft delete
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

// Message model
model Message {
  id                String    @id @default(cuid())
  conversationId    String
  conversation      Conversation @relation(fields: [conversationId], references: [id])
  role              String    // "user" or "assistant"
  content           String
  model             String?   // Which model generated this
  tokensUsed        Int?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

// Prompt model (versioning)
model Prompt {
  id                String    @id @default(cuid())
  projectId         String
  project           Project   @relation(fields: [projectId], references: [id])
  content           String    // System prompt text
  version           Int       @default(1)
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
}
```

---

## 💻 Frontend Architecture

### Page Flow & Components

#### 1. **Landing Page** → **Authentication** → **Dashboard** → **Chat**

##### Step 1: Landing Page (`LandingPage.jsx`)
- Unauthenticated users see landing page
- Links to Login/Register

##### Step 2: Authentication Routes (`routes/index.jsx`)
```javascript
// Routes configuration
const routes = [
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: '/chat/:projectId',
    element: <ProtectedRoute><ChatPage /></ProtectedRoute>
  }
];
```

##### Step 3: Login/Register Flow
1. User enters email/password
2. Validation on frontend (Zod schema)
3. Send to `/api/v1/auth/login`
4. Server returns JWT token + user data
5. Token stored in localStorage & Zustand store
6. Redirect to `/dashboard`

##### Step 4: Dashboard (`Dashboard.jsx`)
- Displays all user projects
- Create new project button
- Navigation to chat

##### Step 5: Chat Page (`ChatPage.jsx`)
- Message input + send button
- AI response display
- Conversation history

### State Management (Zustand)

#### Auth Store (`client/src/store/authStore.jsx`)

```javascript
export const useAuthStore = create((set) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // Actions
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token, user, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));
```

#### Projects Store (`client/src/store/projectsStore.jsx`)

```javascript
export const useProjectsStore = create((set) => ({
  projects: [],
  currentProject: null,

  fetchProjects: async () => {
    const response = await api.get('/projects');
    set({ projects: response.data.projects });
  },

  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    set((state) => ({
      projects: [...state.projects, response.data.project]
    }));
  }
}));
```

#### UI Store (`client/src/store/uiStore.jsx`)

```javascript
export const useUIStore = create((set) => ({
  theme: 'light',
  toasts: [],

  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light'
    }));
  },

  showToast: (message, type = 'info') => {
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), message, type }]
    }));
  }
}));
```

### API Client (`client/src/lib/api.jsx`)

```javascript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const response = await api.post('/auth/refresh');
        localStorage.setItem('token', response.data.token);
        // Retry original request
        return api(error.config);
      } catch (err) {
        // Logout user
        useAuthStore.setState({ isAuthenticated: false });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Key Frontend Components

| Component | Purpose |
|-----------|---------|
| `Auth/Login.jsx` | Email/password login form |
| `Auth/Register.jsx` | Registration form with validation |
| `Auth/OTPLogin.jsx` | OTP verification flow |
| `Chat/ChatWindow.jsx` | Message display + input |
| `Chat/ChatHistory.jsx` | Conversation list |
| `Projects/ProjectCard.jsx` | Individual project card |
| `Projects/ProjectList.jsx` | Grid of all projects |
| `Layout/Header.jsx` | Navigation header |
| `UI/Button.jsx` | Shadcn button component |
| `UI/Input.jsx` | Shadcn input component |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuthGuard()` | Protect routes requiring auth |
| `useTokenRefresh()` | Automatically refresh expired tokens |
| `useApiErrorHandler()` | Handle and display API errors |
| `useErrorHandler()` | ErrorBoundary error handling |
| `useDevTools()` | Development debugging tools |
| `use-toast()` | Show toast notifications |
| `use-mobile()` | Detect mobile devices |

---

## 🔌 API Endpoints Reference

### Authentication Endpoints

```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login user
POST   /api/v1/auth/refresh           # Refresh JWT token
POST   /api/v1/auth/logout            # Logout user
GET    /api/v1/auth/me                # Get current user profile

POST   /api/v1/auth/send-otp          # Send OTP email
POST   /api/v1/auth/verify-otp        # Verify OTP code
POST   /api/v1/auth/resend-otp        # Resend OTP

POST   /api/v1/auth/forgot-password   # Send password reset email
POST   /api/v1/auth/reset-password    # Reset password with token
```

### Project Endpoints

```
GET    /api/v1/projects               # List all user projects
POST   /api/v1/projects               # Create new project
GET    /api/v1/projects/:projectId    # Get project details
PATCH  /api/v1/projects/:projectId    # Update project
DELETE /api/v1/projects/:projectId    # Delete project
```

### Chat Endpoints

```
GET    /api/v1/projects/:projectId/conversations
       # List all conversations in project

POST   /api/v1/projects/:projectId/conversations
       # Create new conversation

GET    /api/v1/projects/:projectId/conversations/:conversationId
       # Get conversation with message history

PATCH  /api/v1/projects/:projectId/conversations/:conversationId
       # Update conversation (rename, etc)

DELETE /api/v1/projects/:projectId/conversations/:conversationId
       # Delete conversation (soft delete)

POST   /api/v1/projects/:projectId/conversations/:conversationId/messages
       # Send message and get AI response

POST   /api/v1/projects/:projectId/conversations/:conversationId/stop
       # Stop streaming AI response
```

### User Endpoints

```
GET    /api/v1/users/profile          # Get user profile
PATCH  /api/v1/users/profile          # Update user profile
POST   /api/v1/users/avatar           # Upload user avatar
```

### AI Endpoints

```
GET    /api/v1/ai/models              # List available AI models
POST   /api/v1/ai/test-connection     # Test API connection
```

### Prompt Endpoints

```
GET    /api/v1/prompts                # List all prompts
POST   /api/v1/prompts                # Create new prompt
GET    /api/v1/prompts/:promptId      # Get prompt details
PATCH  /api/v1/prompts/:promptId      # Update prompt
DELETE /api/v1/prompts/:promptId      # Delete prompt
```

---

## 💾 Database Schema

### Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────┘

User (1)
  ├─── (1:N) ──→ Project
  │              └─── (1:N) ──→ Conversation
  │                            └─── (1:N) ──→ Message
  │                                            ├─ role (user/assistant)
  │                                            └─ content
  │
  ├─── (1:N) ──→ Conversation
  │
  ├─── (1:N) ──→ Message
  │
  └─── (1:N) ──→ OTPToken (for email verification)

Project (1)
  ├─── (1:N) ──→ Prompt (versioned system prompts)
  │
  ├─── (1:N) ──→ Conversation
  │
  └─ Fields:
     - model (gpt-3.5-turbo, claude-3, etc)
     - temperature (0.0 - 1.0)
     - maxTokens (256 - 8192)
     - systemPrompt (custom AI behavior)
     - coreMemory (persistent facts)
```

### Key Fields Explanation

#### User Table
- `id`: Unique identifier (CUID)
- `email`: Unique email for login
- `password`: bcrypt hashed password
- `isVerified`: Email verification status
- `chatLimit`: Max API calls per month
- `chatUsageCount`: Current month's API calls

#### Project Table
- `systemPrompt`: Instructions for AI (e.g., "You are a helpful assistant")
- `temperature`: 0.0 = deterministic, 1.0 = creative
- `maxTokens`: Max response length
- `coreMemory`: Facts to remember across conversations
- `model`: Selected AI model

#### Message Table
- `role`: "user" or "assistant"
- `content`: The actual message text
- `tokensUsed`: For quota tracking

---

## 🎯 Scripts & Commands

### Backend Commands

```bash
# Install dependencies
cd server && bun install

# Development
bun run dev          # Start with nodemon (auto-reload)

# Production
npm start            # Start production server

# Database
npx prisma migrate dev         # Create new migration
npx prisma db push           # Sync schema with DB
npx prisma db seed           # Run seed script
npx prisma studio           # GUI for database

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting errors
```

### Frontend Commands

```bash
# Install dependencies
cd client && bun install

# Development
bun run dev          # Start Vite dev server (hot reload)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run Vitest
npm run test:ui      # UI test runner

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting errors
```

### Docker Commands

```bash
# Build and start all containers
docker-compose up -d

# View logs
docker-compose logs -f server    # Backend logs
docker-compose logs -f client    # Frontend logs

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up --build
```

---

## 🔄 Complete Request/Response Flow

### Example: User Sends Chat Message

```
USER SIDE (Frontend)
├─ User types message in ChatWindow
├─ Presses Send button
├─ React component triggers API call
│  └─ api.post('/chat/messages', { content: '...' })
└─ Zustand store updates to show loading

          ↓

NETWORK (HTTP POST)
GET /api/v1/projects/:projectId/conversations/:conversationId/messages
Body: { content: "Hello AI" }
Headers: { Authorization: Bearer <JWT_TOKEN> }

          ↓

SERVER SIDE (Backend)
├─ Request arrives at Express
├─ Morgan logs the request
├─ verifyJWT middleware checks token
├─ Rate limiter checks quota
├─ chatController.sendMessage() called
│  ├─ Validates project ownership
│  ├─ Calls chatService.sendMessage()
│  │  ├─ Retrieves project config
│  │  ├─ Gets system prompt + core memory
│  │  ├─ Fetches conversation history
│  │  ├─ Calls openRouterService.chat()
│  │  │  └─ Makes API call to OpenRouter
│  │  │     └─ Returns AI response
│  │  ├─ Saves both messages to database
│  │  ├─ Updates user quota
│  │  └─ Returns formatted response
│  └─ errorHandler catches any errors
└─ Response sent to client

          ↓

USER SIDE (Frontend)
├─ Response arrives
├─ Zustand store updates conversation
├─ ChatWindow re-renders with both messages
├─ Scroll animates to bottom
└─ User sees AI response
```

---

## 🏆 Key Design Patterns

### 1. **Middleware Chain Pattern**
Requests flow through middleware before reaching controllers:
```
Request → Auth Middleware → Validation Middleware → Rate Limit → Controller
```

### 2. **Service Layer Pattern**
Controllers delegate to services for business logic:
```
Controller → Service → Database/API
```

### 3. **Zustand State Management**
Central state store with React hooks:
```
Component A → useAuthStore.getState() → Update state
Component B → useAuthStore.getState() → Read updated state
```

### 4. **Protected Routes Pattern**
Routes check authentication before rendering:
```
<ProtectedRoute>
  ├─ Check token exists
  ├─ Verify token valid
  └─ Render component or redirect to login
</ProtectedRoute>
```

### 5. **Error Propagation Pattern**
Errors flow from service → controller → global error handler:
```
Service throws error → Controller catches → Global error handler → JSON response
```

---

## 📊 Data Flow Summary

### Authentication Flow
```
User Input → Validation → Hash Password → Save to DB → Generate JWT → Return Token
```

### Chat Flow
```
User Message → Service → Format History → Call OpenRouter API →
Save Messages → Update Quota → Cache Invalidation → Return Response
```

### Project Creation Flow
```
Project Form → Validation → Create in DB → Associate with User →
Add to Cache → Update Zustand Store → UI Refresh
```

---

## 🚨 Error Handling

### Types of Errors

1. **Validation Errors** (400)
   - Invalid email format
   - Password too short
   - Missing required fields

2. **Authentication Errors** (401)
   - Token expired
   - Token invalid
   - Not authenticated

3. **Authorization Errors** (403)
   - Trying to access other user's project
   - Insufficient permissions

4. **Not Found Errors** (404)
   - Project doesn't exist
   - Conversation doesn't exist

5. **Server Errors** (500)
   - Database connection failed
   - API integration failure

### Error Response Format

```json
{
  "success": false,
  "message": "Error while uploading avatar",
  "errorCode": "VAL_001",
  "statusCode": 400
}
```

---

## 🔐 Security Features

1. **JWT Authentication**
   - Access tokens (15 minutes expiry)
   - Refresh tokens (7 days expiry)

2. **Password Security**
   - bcrypt hashing with salt rounds
   - Minimum 8 characters required

3. **Rate Limiting**
   - Auth endpoints: 5 requests per 15 min
   - Chat endpoints: 30 requests per min

4. **CORS Protection**
   - Whitelist allowed origins
   - Credentials only from allowed domains

5. **Helmet Security**
   - XSS protection
   - CSRF protection
   - Content Security Policy

6. **Input Validation**
   - Zod schema validation
   - Sanitization of inputs

---

## 🎓 Learning Path

To understand this project:

1. **Start with:** `server/src/index.js` (startup flow)
2. **Then:** `server/src/app.js` (middleware setup)
3. **Then:** `server/src/routes/*.js` (endpoint definitions)
4. **Then:** `server/src/controllers/*.js` (request handling)
5. **Then:** `server/src/services/*.js` (business logic)
6. **Then:** `server/prisma/schema.prisma` (database)
7. **Then:** `client/src/main.jsx` (frontend entry)
8. **Then:** `client/src/store/*.jsx` (state management)
9. **Then:** `client/src/pages/*.jsx` (pages/routes)

---

## 📝 Summary

**AI Companion Studio** is a full-stack SaaS platform with:
- ✅ Multi-model AI support via OpenRouter
- ✅ User authentication with JWT + OTP
- ✅ Project-based organization
- ✅ Persistent conversation history
- ✅ API quota management
- ✅ Responsive React frontend
- ✅ Secure Node.js backend
- ✅ PostgreSQL database
- ✅ Docker containerization

The startup flow initializes environment → Express app → middleware stack → database connection → listening on port 3000, ready to handle API requests!

---

**Document Created:** April 7, 2026
**Project Status:** Active Development
**Last Updated:** 2026-04-07
