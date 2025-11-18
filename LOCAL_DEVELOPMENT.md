# Local Development Guide - Unmotivated Hero

Get your local development environment up and running!

## Prerequisites

- **Node.js 18+** installed
- **Docker Desktop** installed and running
- **Git** installed

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > frontend/.env.local
```

### 3. Check OAuth Setup

```bash
# Verify configuration
node scripts/check-oauth-setup.js
```

This will show which OAuth platforms are configured and which need setup.

### 4. Start Development Servers

#### **Recommended: Use the startup script**

```bash
./scripts/dev-start.sh
```

This automatically:
- ✅ Checks OAuth configuration
- ✅ Starts PostgreSQL & Redis (Docker)
- ✅ Runs database migrations
- ✅ Starts backend (port 3001)
- ✅ Starts frontend (port 3000)

#### **Manual start (alternative)**

```bash
# Terminal 1: Docker services
docker-compose up -d

# Terminal 2: Backend
cd backend
npx prisma migrate deploy
npm run start:dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **API Docs**: http://localhost:3001/api

## OAuth Setup (Optional)

The app works without OAuth for testing, but to connect real social media accounts:

### Quick Version

1. Create OAuth apps:
   - [Google Cloud Console](https://console.cloud.google.com/) (for YouTube)
   - [Facebook Developers](https://developers.facebook.com/) (for Facebook/Instagram)
   - [TikTok Developers](https://developers.tiktok.com/)

2. Add credentials to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret

   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret

   TIKTOK_CLIENT_KEY=your-client-key
   TIKTOK_CLIENT_SECRET=your-client-secret
   ```

3. Restart backend: `cd backend && npm run start:dev`

### Detailed Guide

See **[OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)** for step-by-step instructions.

## Verify Setup

Run the verification script:

```bash
node scripts/check-oauth-setup.js
```

Expected output:
- ✅ Database configured
- ✅ Redis configured
- ✅ Security (ENCRYPTION_KEY, JWT_SECRET)
- ⚠️ OAuth platforms (optional for local testing)

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill processes on ports 3000 and 3001
npx kill-port 3000 3001
```

### Docker Not Running

1. Start Docker Desktop
2. Run: `docker-compose up -d`

### Database Connection Error

```bash
# Reset everything
docker-compose down -v
docker-compose up -d
cd backend && npx prisma migrate deploy
```

### "redirect_uri_mismatch" OAuth Error

Ensure your OAuth app redirect URIs **exactly** match:
- Google: `http://localhost:3001/api/v1/auth/google/callback`
- Facebook: `http://localhost:3001/api/v1/auth/facebook/callback`
- TikTok: `http://localhost:3001/api/v1/auth/tiktok/callback`

### ENCRYPTION_KEY Length Error

The encryption key must be exactly 32 characters:

```bash
# Generate a new key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Add to backend/.env
ENCRYPTION_KEY=your-32-character-key-here
```

## Development Workflow

### Daily Startup

```bash
# One command to start everything
./scripts/dev-start.sh
```

### Stop Services

Press `Ctrl+C` in the terminal running dev-start.sh

Or manually:
```bash
docker-compose down
npx kill-port 3000 3001
```

### Database Management

```bash
cd backend

# Create migration
npx prisma migrate dev --name your-migration-name

# Reset database
npx prisma migrate reset

# Open database GUI
npx prisma studio
```

### Run Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Check TypeScript

```bash
# Backend
cd backend && npx tsc --noEmit

# Frontend
cd frontend && npm run build
```

## Project Structure

```
git-test/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Authentication & OAuth
│   │   ├── social/            # Social accounts
│   │   ├── posts/             # Post scheduling
│   │   ├── content/           # Media management
│   │   ├── analytics/         # Analytics tracking
│   │   ├── recommendations/   # AI recommendations
│   │   └── publishing/        # Publishing jobs
│   ├── prisma/schema.prisma   # Database schema
│   └── .env                   # Backend config
│
├── frontend/                   # Next.js app
│   ├── app/                   # Pages (App Router)
│   │   ├── dashboard/         # Dashboard
│   │   ├── connect/           # OAuth connections
│   │   ├── schedule/          # Post scheduling
│   │   ├── content/           # Content library
│   │   ├── analytics/         # Analytics view
│   │   └── auth/callback/     # OAuth callback
│   ├── components/            # React components
│   ├── lib/                   # API client & utils
│   └── .env.local             # Frontend config
│
├── scripts/                    # Development scripts
│   ├── check-oauth-setup.js   # Verify OAuth config
│   └── dev-start.sh           # Start dev servers
│
├── OAUTH_SETUP_GUIDE.md       # OAuth setup instructions
├── LOCAL_DEVELOPMENT.md       # This file
└── QUICK_START.md             # Vercel deployment guide
```

## Testing OAuth Flow

1. Start the app: `./scripts/dev-start.sh`
2. Register an account: http://localhost:3000/register
3. Log in
4. Go to: http://localhost:3000/connect
5. Click "Connect" on any platform
6. You'll see an error if OAuth isn't configured (expected)
7. Configure OAuth (see `OAUTH_SETUP_GUIDE.md`)
8. Try again - you'll be redirected to the platform's OAuth page
9. Approve permissions
10. You'll be redirected back with the account connected!

## Environment Variables Reference

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-character-key

# OAuth (leave blank if not using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/auth/google/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:3001/api/v1/auth/facebook/callback

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=http://localhost:3001/api/v1/auth/tiktok/callback

# API
PORT=3001
NODE_ENV=development
API_PREFIX=api/v1
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Production Deployment

See production deployment guides:

### Frontend (Vercel)
- See `QUICK_START.md` for one-click Vercel deployment
- Or deploy manually to Vercel, Netlify, or Cloudflare Pages

### Backend (Railway/Render)
1. Deploy PostgreSQL database
2. Deploy Redis instance
3. Deploy backend with environment variables
4. Update OAuth redirect URIs to production domain
5. Generate new ENCRYPTION_KEY and JWT_SECRET

**Important production checklist:**
- [ ] Generate new ENCRYPTION_KEY (32 chars)
- [ ] Generate new JWT_SECRET (64+ chars)
- [ ] Update all OAuth redirect URIs to production domain
- [ ] Update FRONTEND_URL to production domain
- [ ] Set NODE_ENV=production
- [ ] Use managed PostgreSQL (not localhost)
- [ ] Use managed Redis (not localhost)
- [ ] Enable HTTPS
- [ ] Submit OAuth apps for review (if needed)

## Getting Help

- 📖 **OAuth Setup**: See `OAUTH_SETUP_GUIDE.md`
- ⚡ **Quick Deploy**: See `QUICK_START.md`
- 🐛 **Common Issues**: Check section above
- 💬 **Support**: Open an issue on GitHub

---

**Happy coding! 🚀**

For OAuth setup, see [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)
