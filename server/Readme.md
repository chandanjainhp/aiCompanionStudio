# AI Companion Studio - Backend

Production-ready Express.js backend for AI-powered chat platform with Prisma ORM and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **AI Integration**: OpenRouter.ai (primary) + Local LLM (fallback)
- **Language**: JavaScript (ES Modules)

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files (database, email, env)
│   ├── controllers/      # Route handlers (auth, chat, projects, users)
│   ├── services/         # Business logic (auth, chat, AI services)
│   ├── middlewares/      # Express middlewares (auth, rate-limit, error)
│   ├── models/           # Database models/schemas
│   ├── routes/           # API routes
│   ├── utils/            # Utilities (JWT, validation, errors, helpers)
│   ├── db/               # Database utilities
│   ├── app.js            # Express app setup
│   └── index.js          # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.js           # Database seeding
│   └── migrations/       # Database migrations
├── .env                  # Environment variables
├── package.json          # Dependencies
└── Readme.md            # This file
```

## Setup Instructions

### 1. Prerequisites

```bash
# Required
- Node.js v20+
- PostgreSQL 12+
- npm or yarn

# Optional (for local AI)
- Ollama or similar for Local LLM on port 1234
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create `.env` file with required variables:

```dotenv
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_companion_studio
DIRECT_DATABASE_URL=postgresql://user:password@localhost:5432/ai_companion_studio

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Services
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=http://localhost:5173
APP_NAME=AI Companion Studio

# Local LLM (Fallback)
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1/chat/completions
LOCAL_LLM_MODEL=minimaxai_synlogic-7b
LOCAL_LLM_ENABLED=true

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_EMAIL=your-email@gmail.com

# CORS
CORS_ORIGIN=http://localhost:5173

# Cloudinary (optional, for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Database Setup

```bash
# Create database
createdb ai_companion_studio

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

### 5. Start Development Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run start

# Just build
npm run build
```

## Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-reload)

# Production
npm run start        # Start production server
npm run build        # Build TypeScript (if applicable)

# Database
npm run seed         # Seed initial data
npx prisma studio   # Open Prisma Studio UI

# Testing
npm run test         # Run tests
node test-openrouter.js  # Test OpenRouter API integration
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (protected)
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/send-otp` - Send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP

### Projects
- `GET /api/v1/projects` - List user's projects (protected)
- `POST /api/v1/projects` - Create project (protected)
- `GET /api/v1/projects/:id` - Get project details (protected)
- `PUT /api/v1/projects/:id` - Update project (protected)
- `DELETE /api/v1/projects/:id` - Delete project (protected)

### Conversations
- `GET /api/v1/projects/:projectId/conversations` - List conversations (protected)
- `POST /api/v1/projects/:projectId/conversations` - Create conversation (protected)
- `GET /api/v1/projects/:projectId/conversations/:id/messages` - Get messages (protected)
- `POST /api/v1/projects/:projectId/conversations/:id/messages` - Send message (protected)
- `DELETE /api/v1/projects/:projectId/conversations/:id` - Delete conversation (protected)

### Users
- `GET /api/v1/users/profile` - Get user profile (protected)
- `PUT /api/v1/users/profile` - Update user profile (protected)

## Key Features

### ✅ Authentication
- JWT-based authentication with refresh tokens
- Email/password login and registration
- OTP verification for enhanced security
- Protected routes with middleware
- HTTP-only cookies for refresh tokens

### ✅ AI Integration
- **Primary**: OpenRouter.ai (40+ models)
- **Fallback**: Local LLM (http://localhost:1234)
- Automatic model selection based on project settings
- Temperature and max tokens configuration
- Error handling with graceful fallback

### ✅ Database
- PostgreSQL with Prisma ORM
- Soft delete support
- Efficient querying with indexes
- Transaction support
- Auto-migrations

### ✅ Security
- Rate limiting on auth endpoints
- Input validation and sanitization
- Password hashing with bcrypt
- CSRF protection
- Error messages don't leak sensitive info

### ✅ Logging
- Structured logging with prefixes
- Debug mode for development
- Error tracking and reporting
- API request logging

## Configuration

### Supported AI Models

OpenRouter provides access to 40+ models:
- OpenAI: gpt-4-turbo, gpt-4, gpt-3.5-turbo
- Anthropic: claude-3-opus, claude-3-sonnet
- Meta: llama-3.1-405b
- Mistral: mistral-large
- Google: gemini-pro, gemini-2.0-flash

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# View migration status
npx prisma migrate status

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

## Troubleshooting

### OpenRouter API Failing (401/403)

**Problem**: AI responses returning error message

**Solution**:
1. Verify API key: https://openrouter.ai/keys
2. Check account has credits
3. Confirm key is not expired/revoked
4. Update `.env` with new key
5. Restart server

**Test**:
```bash
node test-openrouter.js
```

### Database Connection Error

**Problem**: Cannot connect to PostgreSQL

**Solution**:
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env is correct
# Ensure database exists
createdb ai_companion_studio
npx prisma migrate deploy
```

### Email Not Sending

**Problem**: OTP/email verification not working

**Solution**:
1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
2. Use Gmail App Password (not regular password)
3. Enable "Less secure app access" if needed
4. Check SMTP settings

## Performance Optimization

- Database query optimization with indexes
- Conversation history limited to 10 most recent messages
- User quota system to prevent abuse
- Rate limiting on auth endpoints
- Connection pooling with Prisma

## Production Deployment

### Before Deploying

```bash
# Set production environment
NODE_ENV=production

# Update environment variables
# - Set secure JWT secrets
# - Configure production database
# - Use production email credentials
# - Generate secure API keys

# Build and test
npm run build
npm run start

# Run tests
npm run test
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrated to production
- [ ] CORS origins restricted
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] HTTPS enabled
- [ ] API keys rotated
- [ ] Database backups scheduled

## Development Guidelines

### Code Style
- ES Modules throughout
- Async/await for async operations
- Consistent error handling
- Comprehensive logging

### Adding New Features

1. **Model**: Update `prisma/schema.prisma`
2. **Migration**: Run `npx prisma migrate dev`
3. **Service**: Add business logic in `services/`
4. **Controller**: Add route handler in `controllers/`
5. **Routes**: Add endpoint in `routes/`
6. **Middleware**: Add validation/auth as needed
7. **Tests**: Add integration tests

### Error Handling

All errors use custom error classes:
- `BadRequestError` - 400
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `NotFoundError` - 404
- `ConflictError` - 409

## Support & Documentation

- **API Docs**: http://localhost:3000/api/docs (if Swagger configured)
- **Prisma Studio**: `npx prisma studio`
- **OpenRouter Docs**: https://openrouter.ai/docs

## License

MIT

## Contributors

- Backend: JavaScript/Express.js
- Database: Prisma with PostgreSQL
- AI: OpenRouter API Integration 