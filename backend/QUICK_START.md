# Backend Quick Start Guide

Get the Unmotivated Hero API running in **5 minutes**!

## ✅ Prerequisites

- Node.js 18+ installed
- PostgreSQL running (or use Docker)
- Redis running (or use Docker)

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies (2 minutes)

```bash
cd backend
npm install
```

### Step 2: Start Database & Redis (1 minute)

**Option A: Using Docker (Easiest)**
```bash
# From project root
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

**Option B: Local Installation**
- PostgreSQL: Make sure it's running on port 5432
- Redis: Make sure it's running on port 6379

### Step 3: Configure Environment (30 seconds)

Environment file `.env` is already created with defaults.

**For basic testing**, the defaults work! You only need to configure OAuth if you want to connect social accounts.

### Step 4: Set Up Database (1 minute)

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

### Step 5: Start the API! (30 seconds)

```bash
npm run start:dev
```

**Your API is now running!**
- API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api-docs

## ✅ Test It Works

### 1. Health Check

```bash
curl http://localhost:3001
```

Should return: `{"message":"Unmotivated Hero API is running"}`

### 2. Create an Account

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

You'll get an `accessToken` - copy it for the next step!

### 4. Get Your Profile

```bash
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**If you see your profile, everything works!** 🎉

## 📊 What's Available

### Core Endpoints

- **Auth**: `/api/v1/auth/*`
  - POST `/register` - Create account
  - POST `/login` - Login
  - GET `/me` - Get profile
  - GET `/google` - OAuth with Google
  - GET `/facebook` - OAuth with Facebook

- **Users**: `/api/v1/users/*`
  - GET `/` - List users
  - GET `/:id` - Get user
  - PATCH `/:id` - Update user

- **Social Accounts**: `/api/v1/social/*`
  - GET `/` - List connected accounts
  - POST `/connect` - Connect new account
  - DELETE `/:id` - Disconnect account

- **Posts**: `/api/v1/posts/*`
  - GET `/` - List posts
  - POST `/` - Create post
  - GET `/:id` - Get post
  - PATCH `/:id` - Update post
  - DELETE `/:id` - Delete post
  - POST `/:id/publish` - Publish post

- **Content**: `/api/v1/content/*`
  - GET `/` - List content
  - POST `/upload` - Upload file
  - GET `/:id` - Get content
  - DELETE `/:id` - Delete content

- **Analytics**: `/api/v1/analytics/*`
  - GET `/` - Get analytics
  - GET `/summary` - Get summary
  - POST `/sync` - Sync latest data

- **Recommendations**: `/api/v1/recommendations/*`
  - GET `/` - Get recommendations
  - POST `/generate` - Generate new recommendations

## 🔧 Configuration

### Database

Default connection (already in `.env`):
```
DATABASE_URL="postgresql://unmotivated_hero:dev_password_only@localhost:5432/unmotivated_hero?schema=public"
```

### OAuth (Optional - for social media connections)

To connect real social media accounts, add to `.env`:

**Google (YouTube)**
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

Get credentials: https://console.cloud.google.com

**Facebook (Instagram)**
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

Get credentials: https://developers.facebook.com

**TikTok**
```env
TIKTOK_CLIENT_KEY=your-client-key
TIKTOK_CLIENT_SECRET=your-client-secret
```

Get credentials: https://developers.tiktok.com

## 🐛 Troubleshooting

### "Database connection error"
→ Make sure PostgreSQL is running
→ Check `DATABASE_URL` in `.env`
→ Try: `docker-compose up -d` to start services

### "Redis connection error"
→ Make sure Redis is running
→ Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### "Port 3001 already in use"
→ Change `PORT` in `.env` to another port
→ Or kill the process: `lsof -ti:3001 | xargs kill -9`

### "Prisma Client not generated"
→ Run: `npx prisma generate`

### "Migration failed"
→ Reset database: `npx prisma migrate reset`
→ Then run: `npx prisma migrate dev`

## 📚 API Documentation

Once the server is running, visit:

**Swagger UI**: http://localhost:3001/api-docs

Try out endpoints directly from the browser!

## 🛠️ Development Commands

```bash
# Start development server (with hot reload)
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## 🎯 Next Steps

1. **Connect Frontend**: Update `FRONTEND_URL` in `.env` if needed
2. **Set up OAuth**: Add OAuth credentials for social platforms
3. **Test Endpoints**: Use Swagger UI to explore the API
4. **Deploy**: See [DEPLOY.md](./DEPLOY.md) for deployment guide

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] `.env` file configured
- [ ] Prisma client generated
- [ ] Migrations applied
- [ ] Server starts successfully
- [ ] Can create and login users
- [ ] Swagger docs accessible

**Everything checked? You're ready to build!** 🚀

## 📖 More Documentation

- [Full Setup Guide](./README.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Developer Guide](../DEVELOPER_GUIDE.md)
- [Database Schema](./prisma/schema.prisma)

---

**Need help?** Check the troubleshooting section or see the full documentation!
