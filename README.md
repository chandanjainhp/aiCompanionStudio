# 🚀 AI Companion Studio

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)
![Status](https://img.shields.io/badge/Status-Active%20Development-success)
![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)

**An open-source, full-stack platform for building and interacting with custom AI agents — powered by [OpenRouter](https://openrouter.ai).**

[Live Demo](https://aicompanionstudio.chandanjainhp.in) • [Architecture Docs](./ARCHITECTURE.md) • [Report a Bug](https://github.com/chandanjainhp/aiCompanionStudio/issues)

</div>

---

## ✨ What is AI Companion Studio?

AI Companion Studio lets you create **project-scoped AI agents** with custom system prompts, models, and settings — then have full, persistent conversations with them. Think of it as a self-hostable, multi-model ChatGPT workspace.

### Key Features

- 🤖 **Multi-Model Support** — Access OpenAI, Anthropic, Meta Llama, and Mistral models through a single OpenRouter API key
- 📁 **Project-Based Organization** — Each project has its own AI model, temperature, max tokens, and system prompt
- 💬 **Persistent Conversations** — Full chat history saved per project
- 📊 **Quota Management** — Per-user API usage tracking with configurable limits
- 🔐 **Secure Auth** — JWT access/refresh tokens, bcrypt passwords, email OTP verification
- 🖼️ **Avatar Uploads** — Cloudinary-powered profile pictures
- 🌗 **Light/Dark Theme** — User-level theme preference
- 🐳 **Docker Ready** — One-command deployment with `docker-compose`

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Zustand, Shadcn/ui, Tailwind CSS, Framer Motion, Axios, Zod |
| **Backend** | Node.js, Express, JavaScript (ESM), Prisma ORM, PostgreSQL, JWT, bcrypt, Zod |
| **External** | OpenRouter.ai (LLM proxy), Cloudinary (image storage), Gmail SMTP (email) |
| **Infra** | Docker, Docker Compose, Nginx, PostgreSQL 16 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 14+
- **OpenRouter API Key** → [openrouter.ai](https://openrouter.ai)
- **Cloudinary Account** → [cloudinary.com](https://cloudinary.com) *(for avatar uploads)*
- **Gmail App Password** → *(for email verification, optional)*

---

### 1. Clone the Repository

```bash
git clone https://github.com/chandanjainhp/aiCompanionStudio.git
cd aiCompanionStudio
```

### 2. Install Dependencies

```bash
# Backend
cd server && bun install && cd ..

# Frontend
cd client && bun install && cd ..
```

> Using npm? Replace `bun install` with `npm install`.

### 3. Configure Environment Variables

#### Backend — `server/.env`

```env
# Database
DATABASE_URL="postgresql://admin:password@localhost:5432/ai_companion_studio"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
JWT_EXPIRE="15m"
REFRESH_TOKEN_EXPIRE="7d"

# OpenRouter (required)
OPENROUTER_API_KEY="sk-or-v1-your-key"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
APP_URL="http://localhost:5173"
APP_NAME="AI Companion Studio"

# Cloudinary (avatar uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@aicompanionstudio.com"

# Server
NODE_ENV="development"
PORT=3000
```

> A full example is available at [`server/.env.example`](./server/.env.example).

#### Frontend — `client/.env.local`

```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
VITE_APP_NAME="AI Companion Studio"
VITE_APP_VERSION="1.0.0"
```

### 4. Set Up the Database

```bash
cd server

# Run migrations
npx prisma migrate deploy

# (Optional) Seed sample data
npx prisma db seed

# (Optional) Open DB GUI
npx prisma studio
```

### 5. Start the Application

**Terminal 1 — Backend:**
```bash
cd server && npm run dev
# → http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
# → http://localhost:5173
```

**Terminal 3 — (Optional) DB GUI:**
```bash
cd server && npx prisma studio
# → http://localhost:5555
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services (PostgreSQL, backend, frontend)
docker-compose up --build -d

# Stop services
docker-compose down
```

The `docker-compose.yml` spins up:
- **PostgreSQL 16** (with health checks and persistent volume)
- **Backend** on port `3000`
- **Frontend** (Nginx) on port `3001`

> For production, update `CORS_ORIGIN` and `APP_URL` in `docker-compose.yml` and `server/.env`.

---

## 📁 Project Structure

```
aiCompanionStudio/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Route-level pages (Chat, Dashboard, Settings...)
│   │   ├── components/       # Reusable UI components
│   │   ├── store/            # Zustand state slices
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client, utilities
│   │   └── types/            # TypeScript type definitions
│   ├── Dockerfile
│   └── vite.config.ts
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── routes/           # Express route definitions
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic (OpenRouter, quota, email...)
│   │   ├── middlewares/      # Auth, CORS, validation, error handling
│   │   └── utils/            # JWT helpers, custom errors, caching
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Migration history
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
├── nginx_host.conf
├── ARCHITECTURE.md
└── README.md
```

---

## 🔗 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive tokens |
| `POST` | `/api/v1/auth/verify-otp` | Verify email with OTP |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Invalidate session |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/projects` | List user's projects |
| `POST` | `/api/v1/projects` | Create a project |
| `PATCH` | `/api/v1/projects/:id` | Update project settings |
| `DELETE` | `/api/v1/projects/:id` | Delete a project |

### Conversations & Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/projects/:id/conversations` | List conversations |
| `POST` | `/api/v1/projects/:id/conversations` | Create a conversation |
| `GET` | `/api/v1/projects/:id/conversations/:cid/messages` | Get messages |
| `POST` | `/api/v1/projects/:id/conversations/:cid/messages` | Send a message |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |

All protected routes require `Authorization: Bearer <token>`.

---

## 🤖 Supported AI Models

Via OpenRouter, the following models are available out of the box:

| Provider | Model ID |
|----------|----------|
| OpenAI | `openai/gpt-4-turbo`, `openai/gpt-4`, `openai/gpt-3.5-turbo` |
| Anthropic | `anthropic/claude-3-opus-20250219`, `anthropic/claude-3-sonnet-20250229` |
| Meta | `meta-llama/llama-3.1-405b` |
| Mistral | `mistralai/mistral-large` |

---

## 🛠️ Available Commands

### Backend (`server/`)

```bash
npm run dev                    # Start with auto-reload
npm start                      # Production mode
npx prisma migrate deploy      # Apply migrations
npx prisma studio              # Open DB GUI
npx prisma db seed             # Seed sample data
npx prisma generate            # Regenerate Prisma client
```

### Frontend (`client/`)

```bash
npm run dev                    # Dev server with HMR
npm run build                  # Production build
npm run preview                # Preview production build
npm run test                   # Run tests (Vitest)
npm run lint                   # ESLint
```

---

## 🧪 Testing

### Project Settings Tests

The backend includes comprehensive tests for **per-project AI configuration** to ensure each project maintains its own independent model, temperature, max tokens, and system prompt settings.

**Run Tests:**
```bash
cd server
npm install
npm run db:migrate
npm test
```

**Test Coverage:**
- ✅ Project creation with custom/default settings
- ✅ Project retrieval and independence verification
- ✅ Project settings updates (full and partial)
- ✅ System prompt and core memory handling
- ✅ Multi-user isolation and data security
- ✅ Temperature and token boundary validation
- ✅ AI API integration readiness

**Expected Result:** All 17 tests pass ✅

**Documentation:**
- [TEST_GUIDE.md](./server/TEST_GUIDE.md) — Detailed test documentation
- [QUICK_START.md](./server/QUICK_START.md) — Quick reference guide
- [VERIFICATION_SUMMARY.md](./server/VERIFICATION_SUMMARY.md) — Complete verification summary

---

## 🐛 Troubleshooting

**Database connection refused (`ECONNREFUSED 127.0.0.1:5432`)**
```bash
sudo systemctl start postgresql
```

**Port 3000 already in use (`EADDRINUSE`)**
```bash
lsof -i :3000 && kill -9 <PID>
# or: PORT=3001 npm run dev
```

**OpenRouter 401 Unauthorized**
- Check `OPENROUTER_API_KEY` in `server/.env`
- Verify the key is active at [openrouter.ai/keys](https://openrouter.ai/keys)

**JWT token errors in browser**
- Clear `localStorage` tokens in DevTools → Application → Local Storage, then log in again

**Email not sending**
- Enable Gmail 2FA and generate an [app-specific password](https://myaccount.google.com/apppasswords)
- Use that password (not your account password) as `EMAIL_PASS`

**Frontend can't reach backend**
- Verify `VITE_API_BASE_URL` in `client/.env.local`
- Check browser console for CORS errors

---

## 🗺️ Roadmap

- [ ] WebSocket streaming for real-time responses
- [ ] Advanced conversation search
- [ ] Conversation sharing & collaboration
- [ ] Voice input / output
- [ ] Export conversations to PDF / Markdown
- [ ] Team / organization workspaces
- [ ] Analytics dashboard

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m 'feat: add your feature'`
4. **Push** and open a **Pull Request**

Please follow the existing code style (TypeScript strict mode, ESLint, Prettier).

---

## 📄 License

MIT © [Chandan Jain](https://github.com/chandanjainhp)

---

## 📚 Additional Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, data model, and flows
- [server/QUOTA_SYSTEM_DOCUMENTATION.md](./server/QUOTA_SYSTEM_DOCUMENTATION.md) — Quota system details
- [server/CHANGELOG.md](./server/CHANGELOG.md) — Backend changelog

---

## 💬 Support

- **Bugs & Feature Requests**: [GitHub Issues](https://github.com/chandanjainhp/aiCompanionStudio/issues)
- **Email**: chandanjaincj93@gmail.com
