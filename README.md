# 🚀 AI Companion Studio

A full-stack web application for creating AI-powered projects and conversations with multiple LLM models via OpenRouter.ai.

**Live Demo**: Coming soon  
**Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design  
**Status**: ✅ Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

AI Companion Studio lets users:
- ✅ Create projects with custom AI configurations
- ✅ Start conversations with various AI models
- ✅ Manage chat history across conversations
- ✅ Track API usage with quota limits
- ✅ Switch between 7+ AI models from different providers
- ✅ Customize system prompts per project

### Key Features

- **Multi-Model Support**: OpenAI, Anthropic, Meta, Mistral
- **Project Management**: Create, configure, and organize projects
- **Conversation History**: Full chat persistence
- **Quota System**: Track and limit API usage per user
- **User Authentication**: Secure JWT-based auth with email verification
- **Responsive Design**: Mobile, tablet, and desktop support
- **Real-time Updates**: Optimistic UI updates

---

## 🛠️ Tech Stack

### Frontend
```
React 18 + TypeScript
Vite (build tool)
Zustand (state management)
Shadcn/ui (component library)
Tailwind CSS (styling)
Axios (HTTP client)
Zod (validation)
Framer Motion (animations)
Bun (package manager)
```

### Backend
```
Node.js + Express
TypeScript (ES6+)
PostgreSQL + Prisma ORM
JWT + bcrypt (authentication)
OpenRouter.ai API (LLM proxy)
Nodemailer (email)
Cloudinary (image hosting)
```

### Infrastructure
```
PostgreSQL 14+
Redis (optional, for caching)
Docker (optional)
```

---

## ✅ Prerequisites

### Required
- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 14+
- **Git**

### Required API Keys
- **OpenRouter API Key** - Get from https://openrouter.ai
- **Cloudinary Account** - Get from https://cloudinary.com
- **Gmail App Password** - For email notifications (optional)

### Recommended
- **Git** for version control
- **VS Code** with recommended extensions
- **Postman** or **Thunder Client** for API testing

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/aiCompanionStudio.git
cd aiCompanionStudio
```

### 2. Install Dependencies

#### Using Bun (Recommended)
```bash
# Install frontend dependencies
cd client
bun install
cd ..

# Install backend dependencies
cd server
bun install
cd ..
```

#### Using npm
```bash
# Frontend
cd client && npm install && cd ..

# Backend
cd server && npm install && cd ..
```

### 3. Set Up PostgreSQL

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL 14+
# macOS with Homebrew:
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Verify installation
psql --version
```

#### Option B: Docker
```bash
docker run --name ai-companion-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=aicompanion \
  -p 5432:5432 \
  -d postgres:14
```

---

## 🔑 Environment Setup

### Backend Environment Variables

Create `server/.env`:

```bash
# Database
DATABASE_URL="postgresql://admin:password@localhost:5432/aicompanion"

# JWT & Security
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-change-this"
JWT_EXPIRE="15m"
REFRESH_TOKEN_EXPIRE="7d"

# OpenRouter API (Required)
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
APP_URL="http://localhost:5173"
APP_NAME="AI Companion Studio"

# Cloudinary (For avatar uploads)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="noreply@aicompanionstudio.com"

# Environment
NODE_ENV="development"
PORT=3000
```

### Frontend Environment Variables

Create `client/.env` (or `.env.local`):

```bash
VITE_API_BASE_URL="http://localhost:3000/api/v1"
VITE_APP_NAME="AI Companion Studio"
VITE_APP_VERSION="1.0.0"
```

### Database Setup

```bash
cd server

# Run migrations (creates schema)
npx prisma migrate deploy

# Seed database (optional - creates sample data)
npx prisma db seed

# View database in Prisma Studio
npx prisma studio
```

---

## 🚀 Running the Application

### Development Mode

#### Terminal 1: Start Backend Server

```bash
cd server

# Using Bun
bun run dev

# Using npm
npm run dev

# Expected output:
# 🚀 Server is running
# 📍 Host: 0.0.0.0
# 📍 Port: 3000
# 🌍 Environment: development
# 🔗 API: http://localhost:3000/api/v1
# 💻 Health Check: http://localhost:3000/health
```

#### Terminal 2: Start Frontend Dev Server

```bash
cd client

# Using Bun
bun run dev

# Using npm
npm run dev

# Expected output:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Press h + enter to show help
```

#### Terminal 3: Optional - Prisma Studio

```bash
cd server
npx prisma studio

# Opens database GUI at http://localhost:5555
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Database Studio**: http://localhost:5555 (optional)
- **Health Check**: http://localhost:3000/health

---

## 📝 First Steps

### 1. Create an Account
- Click "Sign Up" on login page
- Enter email and password
- Check email for verification code
- Verify and log in

### 2. Create a Project
- Click "New Project" on Dashboard
- Fill in project name
- Select AI model (OpenAI, Anthropic, etc.)
- Configure settings (temperature, max tokens)
- Set system prompt (AI behavior)
- Click "Create Project"

### 3. Start Chatting
- Click project to open
- Click "New Conversation"
- Type your message
- Press Enter or click Send
- Wait for AI response

### 4. Explore Settings
- **Profile**: Update name and avatar
- **Security**: Change password
- **Preferences**: Switch theme (light/dark)

---

## 🏗️ Project Structure

```
aiCompanionStudio/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── pages/            # Route pages
│   │   ├── components/       # React components
│   │   ├── store/            # Zustand state
│   │   ├── lib/              # Utilities
│   │   ├── types/            # TypeScript types
│   │   └── hooks/            # Custom hooks
│   ├── public/               # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # Backend Node.js app
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   ├── middlewares/      # Express middleware
│   │   ├── config/           # Configuration
│   │   └── utils/            # Utilities
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Schema history
│   ├── package.json
│   └── .env                  # Environment variables
│
├── ARCHITECTURE.md           # System design
├── AUTH_FLOW_GUIDE.md        # Authentication details
├── DEPLOYMENT_CHECKLIST.md   # Pre-deployment checklist
└── README.md                 # This file
```

---

## 🔗 API Documentation

### Authentication Endpoints

#### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Verify Email
```bash
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Project Endpoints

#### Create Project
```bash
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description",
  "model": "openai/gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 2048,
  "systemPrompt": "You are a helpful assistant."
}
```

#### Get Projects
```bash
GET /api/v1/projects
Authorization: Bearer <token>
```

#### Update Project
```bash
PATCH /api/v1/projects/:projectId
Authorization: Bearer <token>
Content-Type: application/json
```

### Chat Endpoints

#### Send Message
```bash
POST /api/v1/projects/:projectId/conversations/:conversationId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, how are you?"
}
```

#### Get Conversations
```bash
GET /api/v1/projects/:projectId/conversations
Authorization: Bearer <token>
```

#### Get Messages
```bash
GET /api/v1/projects/:projectId/conversations/:conversationId/messages
Authorization: Bearer <token>
```

### Health Check
```bash
GET /health

Response: { status: "ok" }
```

---

## 📊 Build for Production

### Frontend Build

```bash
cd client

# Using Bun
bun run build

# Using npm
npm run build

# Output: dist/ folder with optimized files
```

### Backend Build

```bash
cd server

# Create production build (if needed)
# Node.js handles ES6+ natively, no build required

# But optimize dependencies:
npm ci --only=production
```

### Environment Variables for Production

Update `server/.env`:

```bash
NODE_ENV="production"
JWT_SECRET="use-a-very-strong-random-string"
DATABASE_URL="your-production-database-url"
# ... other production values
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error: `connect ECONNREFUSED 127.0.0.1:5432`**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Or with Homebrew
brew services start postgresql
```

### OpenRouter API Errors

**Error: `401 Unauthorized`**
- Verify `OPENROUTER_API_KEY` in `.env`
- Check API key at https://openrouter.ai
- Make sure it's not expired or revoked

**Error: `400 Model not found`**
- Verify model name format: `provider/model-name`
- Valid models: see [ARCHITECTURE.md](./ARCHITECTURE.md#supported-models)

### JWT Token Issues

**Error: `401 Invalid Token`**
```bash
# Clear browser storage
# Open DevTools → Application → LocalStorage
# Delete 'token' and 'refreshToken' entries

# Then log in again
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Email Not Sending

**Check Gmail settings:**
- Enable 2-factor authentication
- Generate app-specific password
- Use app password in `.env`, not account password

### Frontend Can't Connect to Backend

**Check CORS:**
- Backend should allow `http://localhost:5173`
- Verify `VITE_API_BASE_URL` in frontend `.env`
- Check browser console for CORS errors

---

## 🔄 Common Commands

### Development

```bash
# Start all services (in separate terminals)
cd server && npm run dev
cd client && npm run dev
cd server && npx prisma studio

# View database
npx prisma studio

# Check database migrations
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name add_new_field
```

### Testing

```bash
# Frontend tests
cd client && npm run test

# Backend tests (if implemented)
cd server && npm run test
```

### Linting & Formatting

```bash
# Frontend
cd client && npm run lint
cd client && npm run format

# Backend
cd server && npm run lint
```

### Database

```bash
# Reset database (WARNING: deletes all data)
cd server && npx prisma migrate reset

# Seed database
cd server && npx prisma db seed

# Generate Prisma client after schema changes
npx prisma generate
```

---

## 🚢 Deployment

For production deployment, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Quick Deploy with Vercel (Frontend)

```bash
cd client
npm install -g vercel
vercel login
vercel
```

### Quick Deploy with Railway (Backend)

```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

---

## 📚 Additional Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and components
- **[AUTH_FLOW_GUIDE.md](./AUTH_FLOW_GUIDE.md)** - Authentication details
- **[QUOTA_SYSTEM_DOCUMENTATION.md](./server/QUOTA_SYSTEM_DOCUMENTATION.md)** - Usage quota system
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Commit**: `git commit -m 'Add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Create** a Pull Request

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Meaningful commit messages
- Tests for new features

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 💬 Support

- **Issues**: Create a GitHub issue for bugs
- **Discussions**: GitHub Discussions for questions
- **Email**: support@aicompanionstudio.com

---

## 🙏 Acknowledgments

- **OpenRouter.ai** - LLM proxy service
- **Shadcn/ui** - Component library
- **Prisma** - ORM and database tools
- **Vercel** - Deployment platform

---

## 📈 Roadmap

- [ ] WebSocket support for real-time chat
- [ ] Advanced conversation search
- [ ] Conversation sharing & collaboration
- [ ] Custom model fine-tuning
- [ ] Voice input/output
- [ ] Export conversations to PDF
- [ ] Team/organization support
- [ ] Advanced analytics dashboard

---

**Version**: 1.0.0  
**Last Updated**: January 17, 2026  
**Status**: ✅ Production Ready

---

## ⚡ Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] Repository cloned
- [ ] Dependencies installed (`bun install` or `npm install`)
- [ ] `.env` files created with API keys
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Backend started (`npm run dev` in server/)
- [ ] Frontend started (`npm run dev` in client/)
- [ ] Accessed http://localhost:5173
- [ ] Created an account and first project
- [ ] Sent your first message! 🎉

**Happy coding! 🚀**
