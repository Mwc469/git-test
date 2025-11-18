# Frontend + Backend Integration Guide

Complete guide to running your frontend and backend together!

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Database & Redis (1 minute)

```bash
# From project root
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

### Step 2: Setup & Start Backend (2 minutes)

```bash
# Terminal 1
cd backend

# First time only: Set up database
npx prisma migrate dev --name init

# Start backend API
npm run start:dev
```

✅ **Backend running at:** http://localhost:3001
✅ **API docs at:** http://localhost:3001/api-docs

### Step 3: Start Frontend (1 minute)

```bash
# Terminal 2 (new terminal)
cd frontend
npm run dev
```

✅ **Frontend running at:** http://localhost:3000

### Step 4: Test It! (1 minute)

1. **Open** http://localhost:3000
2. **Click** "Create Account"
3. **Fill in** your details
4. **Register** and you're in!

**You're now running the full stack!** 🎉

---

## 📊 What's Connected

### Frontend → Backend API Calls

The frontend automatically connects to the backend on `localhost:3001`.

**Authentication:**
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get profile

**Social Accounts:**
- `GET /api/v1/social/accounts` - List connected platforms
- `DELETE /api/v1/social/accounts/:id` - Disconnect

**Posts:**
- `GET /api/v1/posts` - List posts
- `POST /api/v1/posts` - Create post
- `DELETE /api/v1/posts/:id` - Delete post

**Content:**
- `GET /api/v1/content` - List media files
- `GET /api/v1/content/:id` - Get file details
- `DELETE /api/v1/content/:id` - Delete file

**Analytics:**
- `GET /api/v1/analytics/summary` - Get overview
- `GET /api/v1/analytics/posts/:id` - Post metrics

**Recommendations:**
- `GET /api/v1/recommendations` - Get AI suggestions
- `POST /api/v1/recommendations/generate` - Generate new ones

---

## 🔧 Configuration

### Frontend Environment

File: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**For production:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api/v1
```

### Backend Environment

File: `backend/.env`

```env
# Already configured!
DATABASE_URL="postgresql://unmotivated_hero:dev_password_only@localhost:5432/unmotivated_hero?schema=public"
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## ✅ Full Setup Checklist

### First Time Setup

- [ ] Clone repository
- [ ] Install dependencies:
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```
- [ ] Start Docker services:
  ```bash
  docker-compose up -d
  ```
- [ ] Setup database:
  ```bash
  cd backend
  npx prisma migrate dev
  ```

### Every Time You Code

- [ ] Start backend: `cd backend && npm run start:dev`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Open http://localhost:3000

---

## 🎯 Testing the Integration

### 1. Create an Account

1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Register"

✅ **Should:** Redirect to dashboard

### 2. Login

1. Go to http://localhost:3000/login
2. Enter credentials
3. Click "Sign In"

✅ **Should:** See your dashboard

### 3. Check API Connection

Open browser DevTools (F12) → Network tab

You should see successful API calls:
- `POST /api/v1/auth/register` - 200 OK
- `POST /api/v1/auth/login` - 200 OK
- `GET /api/v1/auth/me` - 200 OK

---

## 🐛 Troubleshooting

### "API request failed" / Network Error

**Problem:** Frontend can't reach backend

**Solutions:**
1. Check backend is running:
   ```bash
   curl http://localhost:3001
   ```
   Should return: `{"message":"Unmotivated Hero API is running"}`

2. Check frontend env:
   ```bash
   cat frontend/.env.local
   ```
   Should have: `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`

3. Restart frontend after env changes:
   ```bash
   # Stop frontend (Ctrl+C)
   npm run dev
   ```

### "Database connection error"

**Problem:** Backend can't connect to PostgreSQL

**Solutions:**
1. Check Docker is running:
   ```bash
   docker ps
   ```
   Should see `postgres` container

2. Restart Docker services:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. Check database URL in `backend/.env`

### "CORS error" in browser console

**Problem:** CORS not configured properly

**Solution:**
Backend already has CORS enabled for `http://localhost:3000`. If you changed the port, update `FRONTEND_URL` in `backend/.env`.

### "Token expired" / "Unauthorized"

**Problem:** JWT token expired or invalid

**Solution:**
1. Logout and login again
2. Or clear localStorage:
   ```javascript
   // In browser console
   localStorage.clear()
   location.reload()
   ```

### "Port already in use"

**Backend (3001):**
```bash
lsof -ti:3001 | xargs kill -9
```

**Frontend (3000):**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📝 Development Workflow

### Recommended Setup

**Three Terminals:**

1. **Terminal 1 - Backend**
   ```bash
   cd backend
   npm run start:dev
   ```
   Hot reload enabled - backend restarts on code changes

2. **Terminal 2 - Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Fast refresh enabled - instant UI updates

3. **Terminal 3 - Commands**
   ```bash
   # Use for git, testing, etc.
   ```

### Making Changes

**Backend changes:**
- Edit files in `backend/src/`
- Backend auto-restarts
- API changes available immediately

**Frontend changes:**
- Edit files in `frontend/app/` or `frontend/components/`
- Browser auto-refreshes
- Changes visible instantly

**Database schema changes:**
```bash
# Edit backend/prisma/schema.prisma
# Then run:
cd backend
npx prisma migrate dev --name your_change_description
npx prisma generate
```

---

## 🔍 Monitoring

### View Backend Logs

Backend logs show API requests:
```
[Nest] 12345  - 11/18/2024, 10:30:00 AM     LOG [NestApplication] Nest application successfully started
POST /api/v1/auth/register +5ms
POST /api/v1/auth/login +12ms
GET /api/v1/auth/me +3ms
```

### View Frontend Logs

Frontend logs in browser console (F12):
```
API Client: Initializing...
Auth: Checking user session...
Auth: User logged in
```

### Check Database

```bash
cd backend
npx prisma studio
```

Opens database GUI at http://localhost:5555

---

## 🚀 Production Deployment

### Backend

**Option 1: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
cd backend
railway up
```

**Option 2: Render**
1. Go to https://render.com
2. Connect repository
3. Create "Web Service"
4. Root directory: `backend`
5. Build: `npm install && npx prisma generate`
6. Start: `npm run start:prod`

### Frontend

**Vercel (Recommended):**

1. Update frontend env for production:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
   ```

2. Deploy:
   - Click deploy button in README
   - Or: `npx vercel --prod`

### Environment Variables

**Backend (Production):**
```env
DATABASE_URL=your-production-database-url
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
JWT_SECRET=change-this-to-a-strong-random-string
```

**Frontend (Production):**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
```

---

## 📊 Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                 │  HTTP   │                  │         │              │
│  Next.js        ├────────▶│  NestJS API      ├────────▶│  PostgreSQL  │
│  Frontend       │         │  Backend         │         │  Database    │
│  (Port 3000)    │◀────────┤  (Port 3001)     │         │              │
│                 │  JSON   │                  │         └──────────────┘
└─────────────────┘         └──────────────────┘                 │
                                     │                            │
                                     │                            │
                                     ▼                            │
                             ┌──────────────┐                    │
                             │              │                    │
                             │    Redis     │◀───────────────────┘
                             │  (Port 6379) │
                             │              │
                             └──────────────┘
```

**Flow:**
1. User visits frontend (Next.js)
2. Frontend calls backend API (NestJS)
3. Backend queries database (PostgreSQL)
4. Backend processes with Redis queue
5. Backend returns data to frontend
6. Frontend displays to user

---

## ✅ Success Indicators

**Backend Running:**
- ✅ Terminal shows "Nest application successfully started"
- ✅ http://localhost:3001 returns success message
- ✅ http://localhost:3001/api-docs shows Swagger UI

**Frontend Running:**
- ✅ Terminal shows "ready started server on http://localhost:3000"
- ✅ http://localhost:3000 loads the app
- ✅ No errors in browser console

**Integration Working:**
- ✅ Can create account
- ✅ Can login
- ✅ See user profile in dashboard
- ✅ Network tab shows successful API calls

---

## 🎉 You're All Set!

Your full-stack application is now running:

- **Frontend:** Beautiful Next.js UI with PWA
- **Backend:** Powerful NestJS API
- **Database:** PostgreSQL with Prisma
- **Queue:** Redis for background jobs

**Everything is connected and working together!**

---

## 📚 More Documentation

- [Backend Quick Start](./backend/QUICK_START.md)
- [Frontend PWA Setup](./frontend/PWA_SETUP.md)
- [Mobile App Guide](./MOBILE_APP_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

---

**Ready to build?** Start coding and watch your changes appear instantly! 🚀
