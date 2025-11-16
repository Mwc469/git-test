# Social Media Autopilot - Setup Guide

This guide will walk you through setting up the Social Media Autopilot platform from scratch.

## Prerequisites

Make sure you have the following installed:
- **Node.js 20+** and npm
- **Docker Desktop** (for PostgreSQL and Redis)
- **Git**

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd git-test

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Start Infrastructure

Start PostgreSQL and Redis using Docker Compose:

```bash
# From project root
docker compose up -d

# Verify containers are running
docker compose ps
```

You should see:
- `social-autopilot-db` (PostgreSQL) running on port 5432
- `social-autopilot-redis` (Redis) running on port 6379

## Step 3: Configure Environment Variables

### Backend Configuration

The backend already has a `.env` file. You need to update it with your OAuth credentials:

```bash
cd backend
# Edit .env file
```

**Required OAuth Setup:**

#### 1. Google (YouTube + Drive)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs:
   - YouTube Data API v3
   - Google Drive API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
7. Copy Client ID and Client Secret

Update in `.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

#### 2. Facebook/Meta (Facebook + Instagram)

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app (Consumer type)
3. Add Products:
   - Facebook Login
   - Instagram Basic Display
4. Configure OAuth redirect: `http://localhost:3000/auth/facebook/callback`
5. Go to Settings → Basic → Copy App ID and App Secret

Update in `.env`:
```env
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here
```

#### 3. TikTok

1. Go to [TikTok Developers](https://developers.tiktok.com)
2. Create a new app
3. Request access to:
   - Content Posting API
   - Research API (for analytics)
4. Configure redirect URI: `http://localhost:3000/auth/tiktok/callback`
5. Copy Client Key and Client Secret

Update in `.env`:
```env
TIKTOK_CLIENT_KEY=your-tiktok-client-key-here
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret-here
```

#### 4. Security Keys

Generate secure random keys for JWT and encryption:

```bash
# Generate JWT secret (any random string)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (must be 32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Update in `.env`:
```env
JWT_SECRET=<your-generated-jwt-secret>
ENCRYPTION_KEY=<your-generated-32-char-key>
```

## Step 4: Database Setup

Run Prisma migrations to create the database schema:

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (Note: requires database to be running)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view database
npx prisma studio
```

**Note:** If Docker is not available in your environment, you can:
1. Install PostgreSQL locally
2. Update `DATABASE_URL` in `.env` to point to your local PostgreSQL
3. Run the migrations

## Step 5: Start the Development Servers

### Terminal 1: Backend

```bash
cd backend
npm run start:dev
```

The API will be available at:
- API: `http://localhost:3001`
- API Prefix: `http://localhost:3001/api/v1`

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Step 6: Verify Setup

### Test Backend

```bash
# Check health (update with your actual endpoint once created)
curl http://localhost:3001/api/v1

# Test registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Test OAuth Flow

1. Open `http://localhost:3000` in your browser
2. Navigate to Settings → Connect Accounts
3. Click "Connect YouTube"
4. You should be redirected to Google OAuth
5. After authorization, you'll be redirected back with credentials

## Project Structure

```
git-test/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication & OAuth
│   │   ├── users/             # User management
│   │   ├── social/            # Social account connections
│   │   ├── prisma/            # Prisma service
│   │   └── common/            # Shared utilities
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── .env                   # Environment variables
├── frontend/
│   ├── app/                   # Next.js app directory
│   └── components/            # React components
├── docker-compose.yml         # Infrastructure
└── README.md                  # Main documentation
```

## Common Issues

### Issue: Prisma Client not found

```bash
cd backend
npx prisma generate
```

### Issue: Database connection failed

1. Check Docker containers are running: `docker compose ps`
2. Verify DATABASE_URL in `.env`
3. Restart containers: `docker compose restart`

### Issue: OAuth redirect mismatch

Make sure redirect URIs in OAuth provider settings match exactly:
- Google: `http://localhost:3000/auth/google/callback`
- Facebook: `http://localhost:3000/auth/facebook/callback`
- TikTok: `http://localhost:3000/auth/tiktok/callback`

### Issue: Port already in use

```bash
# Check what's using the port
lsof -i :3001  # backend
lsof -i :3000  # frontend
lsof -i :5432  # postgres
lsof -i :6379  # redis

# Kill the process or change PORT in .env
```

## Next Steps

Once setup is complete:

1. **Connect Your Accounts**: Use the UI to connect your social media accounts
2. **Link Google Drive**: Connect a Google Drive folder for content
3. **Create Posting Rules**: Set up automated posting schedules
4. **Upload Content**: Add videos/images to your Drive folder
5. **Schedule Posts**: Create and schedule posts across platforms

## Development Commands

### Backend

```bash
# Development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint
```

### Frontend

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Database

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Format schema file
npx prisma format
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Support

For issues, questions, or contributions:
- GitHub Issues: [repo-url]/issues
- Documentation: [docs-url]

## Security Notes

- Never commit `.env` files to version control
- Rotate your JWT_SECRET and ENCRYPTION_KEY regularly
- Use strong, unique passwords for production databases
- Enable 2FA on all OAuth provider accounts
- Review OAuth scopes and only request what you need
- Regularly update dependencies: `npm audit fix`
