# Getting Started with Unmotivated Hero

The fastest way to get your full-stack social media automation platform running!

---

## 🎯 Choose Your Path

### Option 1: Full Stack (Frontend + Backend) 🚀

**Perfect for:** Full development experience

```bash
# One command to rule them all
./start-dev.sh
```

This script:
- ✅ Starts Docker (PostgreSQL + Redis)
- ✅ Installs dependencies if needed
- ✅ Runs database migrations
- ✅ Starts backend API
- ✅ Starts frontend app
- ✅ Shows you the URLs

**Then:** Open http://localhost:3000

---

### Option 2: Frontend Only (PWA) 🌐

**Perfect for:** UI development, testing PWA features

```bash
cd frontend
npm install
npm run dev
```

**Then:** Open http://localhost:3000

**Note:** API calls will fail without backend, but UI works fine!

**OR Deploy to Vercel:**
- Click the deploy button in README.md
- Get a live link in 3 minutes

---

### Option 3: Backend Only (API) 🔧

**Perfect for:** API development, mobile app testing

```bash
# Start Docker services
docker-compose up -d

# Setup and start backend
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

**Then:**
- API: http://localhost:3001
- Docs: http://localhost:3001/api-docs

---

### Option 4: Mobile App 📱

**Perfect for:** Native mobile development

```bash
cd mobile
npm install
npm start
```

**Then:** Scan QR code with Expo Go app

**With Backend:**
Update `mobile/.env`:
```env
API_URL=http://YOUR_COMPUTER_IP:3001/api/v1
```

---

## 📋 Prerequisites

### For Full Stack:
- ✅ Node.js 18+
- ✅ Docker Desktop
- ✅ Git

### For Frontend Only:
- ✅ Node.js 18+

### For Backend Only:
- ✅ Node.js 18+
- ✅ Docker Desktop

### For Mobile:
- ✅ Node.js 18+
- ✅ Expo Go app on your phone

---

## 🚀 Quick Start Scripts

We've created helpful scripts for you:

### `./start-dev.sh` (Recommended)
Automated full-stack startup:
- Checks Docker
- Installs dependencies
- Runs migrations
- Starts both services
- Shows logs

```bash
chmod +x start-dev.sh
./start-dev.sh
```

### `./start-dev-simple.sh`
Opens separate terminals for backend and frontend:

```bash
chmod +x start-dev-simple.sh
./start-dev-simple.sh
```

### Manual (Three Terminals)

**Terminal 1 - Docker:**
```bash
docker-compose up
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🎯 What to Do After Starting

### 1. Create Your First Account

1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
4. Click "Register"

✅ You're redirected to the dashboard!

### 2. Explore the Features

**Dashboard:**
- See stats overview
- Quick actions
- Platform status

**Settings:**
- Toggle dark/light mode
- Manage connected accounts
- Configure preferences

**Schedule:**
- Create posts
- Set publish times
- Select platforms

**Analytics:**
- View performance
- Track engagement
- See trends

### 3. Install as PWA (Optional)

**On Desktop:**
- Look for install icon in address bar
- Click to install
- App opens in standalone window

**On Mobile:**
- Safari → Share → Add to Home Screen
- Chrome → Menu → Install app

---

## 🔍 Verify Everything Works

### Backend Health Check

```bash
curl http://localhost:3001
```

Should return: `{"message":"Unmotivated Hero API is running"}`

### Frontend Check

Open http://localhost:3000 - should see landing page

### Database Check

```bash
cd backend
npx prisma studio
```

Opens database GUI at http://localhost:5555

### API Documentation

Visit: http://localhost:3001/api-docs

Test endpoints directly in Swagger UI!

---

## 🐛 Troubleshooting

### Docker not running

```bash
# Start Docker Desktop
# Then:
docker-compose up -d
```

### Port already in use

**Backend (3001):**
```bash
lsof -ti:3001 | xargs kill -9
```

**Frontend (3000):**
```bash
lsof -ti:3000 | xargs kill -9
```

### Database connection error

```bash
# Reset database
docker-compose down
docker-compose up -d

# Wait 10 seconds, then:
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### "Cannot find module" error

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation Index

### Quick Guides:
- **[This File]** - Getting started overview
- [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) - Detailed integration guide
- [backend/QUICK_START.md](./backend/QUICK_START.md) - Backend-specific setup
- [frontend/PWA_SETUP.md](./frontend/PWA_SETUP.md) - PWA installation guide
- [mobile/TESTING.md](./mobile/TESTING.md) - Mobile app testing
- [QUICK_START.md](./QUICK_START.md) - Vercel deployment

### Complete Documentation:
- [README.md](./README.md) - Project overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Architecture & patterns
- [BACKEND_STATUS.md](./BACKEND_STATUS.md) - Backend implementation status
- [MOBILE_APP_GUIDE.md](./MOBILE_APP_GUIDE.md) - Mobile development guide

---

## ✅ Success Checklist

Before you start coding, verify:

- [ ] Docker is running (`docker ps`)
- [ ] Backend started (`http://localhost:3001` works)
- [ ] Frontend started (`http://localhost:3000` loads)
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard shows

**All checked?** You're ready to build! 🎉

---

## 🎯 Next Steps

1. **Explore the UI** - Click around, try features
2. **Read API Docs** - http://localhost:3001/api-docs
3. **Connect Social Accounts** - Set up OAuth (optional)
4. **Deploy** - Get it online with Vercel
5. **Build Features** - Start adding your ideas!

---

## 💡 Development Tips

### Hot Reload is Enabled
- **Backend:** Edit code → Server auto-restarts
- **Frontend:** Edit code → Browser auto-refreshes

### View Logs
- **Backend:** Check terminal running `npm run start:dev`
- **Frontend:** Check browser console (F12)

### Database Changes
```bash
# 1. Edit backend/prisma/schema.prisma
# 2. Run migration:
cd backend
npx prisma migrate dev --name your_change
npx prisma generate
```

### Clear Everything and Start Fresh
```bash
# Stop all
docker-compose down
rm -rf backend/node_modules frontend/node_modules mobile/node_modules

# Start over
docker-compose up -d
cd backend && npm install && npx prisma migrate dev
cd ../frontend && npm install
```

---

## 🎉 You're All Set!

Your social media automation platform is ready to go!

**Pick a path above and start coding!** 🚀

---

**Questions?** Check the documentation or the troubleshooting section!
