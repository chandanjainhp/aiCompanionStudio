# 🚀 AI Companion Studio

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)
![Status](https://img.shields.io/badge/Status-Active%20Development-success)
![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)

**An open-source, full-stack platform for building and interacting with custom AI agents — powered by [OpenRouter](https://openrouter.ai).**

 • [Architecture Docs](./ARCHITECTURE.md) • [Report a Bug](https://github.com/chandanjainhp/aiCompanionStudio/issues)

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
- 🐳 **Docker Ready** — One-command deployment with `docker-compose` and Cloudflare Tunnel integration

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Zustand, Shadcn/ui, Tailwind CSS, Framer Motion, Axios, Zod |
| **Backend** | Node.js, Express, JavaScript (ESM), Prisma ORM, PostgreSQL, JWT, bcrypt, Zod |
| **External** | OpenRouter.ai (LLM proxy), Cloudinary (image storage), Gmail SMTP (email) |
| **Infra** | Docker, Docker Compose, Nginx, PostgreSQL 16, Cloudflare Tunnel |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 14+
- **OpenRouter API Key** → [openrouter.ai](https://openrouter.ai)
- **Cloudinary Account** → [cloudinary.com](https://cloudinary.com) *(for avatar uploads)*
- **Gmail App Password** → *(for email verification)*

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

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
JWT_EXPIRE="15m"
REFRESH_TOKEN_EXPIRE="7d"

# OpenRouter Configuration
OPENROUTER_API_KEY="sk-or-v1-your-key"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
APP_URL="http://localhost:5173"
APP_NAME="AI Companion Studio"

# Cloudinary (for avatar uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email Configuration (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@aicompanionstudio.com"

# Server environment
NODE_ENV="development"
PORT=3000
```

#### Frontend — `client/.env.local`

> [!IMPORTANT]
> Ensure the variable name is `VITE_API_URL` (not `VITE_API_BASE_URL`) to match the API library import in the frontend source code.

```env
VITE_API_URL="http://localhost:3000/api/v1"
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

### 5. Start the Application Locally

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

---

## 🐳 Docker & Cloudflare Tunnel Deployment

The repository includes a ready-to-use Docker environment designed with **Single Subdomain Routing** and **Cloudflare Tunnel integration** for secure public hosting without exposing local ports.

### Architectural Flow

When deploying behind a Cloudflare Tunnel under a single subdomain (e.g. `aicompanionstudio.chandanjainhp.in`), all public traffic is securely tunneled to the **React Client Nginx Container** (internal port `80`).

```
Public Internet ➔ Cloudflare Tunnel ➔ Client Nginx (Port 80)
                                           ├── Static Files (HTML, JS, CSS)
                                           └── /api/* requests ➔ Server (Port 3000)
```

The frontend Nginx acts as a reverse proxy using [client/nginx.conf](./client/nginx.conf), intercepting all API traffic starting with `/api/` and forwarding it directly to the Express backend container, eliminating all CORS issues and complex multi-subdomain configurations.

### Deploying the Stack

1. **Configure Environment Variables**:
   Update `CORS_ORIGIN` and `APP_URL` in `docker-compose.yml` and `server/.env` to reflect your production domain name:
   ```env
   CORS_ORIGIN=https://aicompanionstudio.chandanjainhp.in
   APP_URL=https://aicompanionstudio.chandanjainhp.in
   ```

2. **Map Public Hostname in Cloudflare**:
   In your **Cloudflare Zero Trust Dashboard**, map your subdomain to the internal client service name and port:
   
   | Public Hostname | Service Type | URL |
   | :--- | :--- | :--- |
   | `aicompanionstudio.chandanjainhp.in` | **HTTP** | `http://client:80` |

3. **Start the Stack**:
   Start all services (PostgreSQL database, Node backend, client container with reverse proxy, and Cloudflare Tunnel client) in detached mode:
   ```bash
   docker-compose up --build -d
   ```

4. **Re-applying Nginx or Build Configuration changes**:
   If you modify `client/nginx.conf` or frontend environment variables, rebuild the image and recreate the container using:
   ```bash
   docker-compose up -d --build client
   ```

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
│   ├── nginx.conf            # SPA server with reverse-proxy for API
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
├── docker-compose.yml         # Combined local & prod deployment stack
├── nginx_host.conf            # Optional host-level Nginx template
├── ARCHITECTURE.md            # System design, data model, and flows
└── README.md
```

---

## 🔗 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive JWT tokens |
| `POST` | `/api/v1/auth/send-otp` | Send email verification OTP |
| `POST` | `/api/v1/auth/verify-otp` | Verify email with OTP |
| `POST` | `/api/v1/auth/refresh` | Refresh JWT access token |
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
| `GET` | `/api/v1/projects/:id/conversations` | List conversations (paginated) |
| `POST` | `/api/v1/projects/:id/conversations` | Create a conversation |
| `GET` | `/api/v1/projects/:id/conversations/:cid/messages` | Get conversation message history |
| `POST` | `/api/v1/projects/:id/conversations/:cid/messages` | Send message and get AI response |

---

## 🤖 Supported AI Models

Through the OpenRouter proxy, you can interact with any state-of-the-art model. Default models available include:

| Provider | Model ID |
|----------|----------|
| OpenAI | `openai/gpt-4-turbo`, `openai/gpt-4`, `openai/gpt-3.5-turbo` |
| Anthropic | `anthropic/claude-3-opus-20250219`, `anthropic/claude-3-sonnet-20250229` |
| Meta | `meta-llama/llama-3.1-405b` |
| Mistral | `mistralai/mistral-large` |

---

## 🧪 Testing & Verification

The backend includes a robust and complete test suite written in Vitest covering all core services, route isolations, range boundaries, and integrations.

### Running Tests

```bash
cd server
npm test
```

### Verified Test Suites

- **Project Settings & Boundary Limits**:
  - Validates independent AI model, prompt, and token boundary settings.
  - Correctly verifies and maintains decimal boundary values (e.g. `0.0` and `1.0` temperatures) using precise nullish operators.
- **Chat Memory & Pagination**:
  - Confirms ordered message flow storage and correct chronological retrieval.
  - Verifies multi-tenant database isolation.
  - Confirms total message pagination metadata reporting across service APIs.
  
**Current Test Status**: `37 / 37 passed` (100% SUCCESS) ✅

---

## 🐛 Troubleshooting

**SyntaxError: Unexpected token '<', "<html>... is not valid JSON"**
- Rebuild the frontend client container. This occurs when the client's `nginx.conf` has the API proxy block disabled, causing Nginx to serve the HTML SPA entry point for `/api` requests. Run `docker-compose up -d --build client` to fix this.

**Database connection refused (`ECONNREFUSED 127.0.0.1:5432`)**
- Make sure PostgreSQL is started locally (`sudo systemctl start postgresql`) or ensure you don't have host port binding conflicts when starting `docker-compose.yml` if port 5432 is already bound.

**JWT token errors in browser**
- Clear `localStorage` tokens in DevTools ➔ Application ➔ Local Storage, then log in again.

**Email not sending**
- Enable Gmail 2FA and generate an app-specific password in your Google Account. Use that app-specific password as `EMAIL_PASS` in your `.env`.

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
