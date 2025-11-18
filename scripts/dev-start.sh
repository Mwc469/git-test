#!/bin/bash

# Development Start Script for Unmotivated Hero
# Starts both backend and frontend in development mode

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Unmotivated Hero - Development Startup  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found!${NC}"
    echo -e "${YELLOW}📝 Creating from .env.example...${NC}"
    cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env"
    echo -e "${GREEN}✅ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  Please configure OAuth credentials in backend/.env${NC}"
    echo -e "${CYAN}   See OAUTH_SETUP_GUIDE.md for instructions${NC}\n"
fi

# Check OAuth configuration
echo -e "${CYAN}🔍 Checking OAuth configuration...${NC}"
node "$SCRIPT_DIR/check-oauth-setup.js"

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  Press Ctrl+C to continue without OAuth check${NC}"
echo -e "${YELLOW}   or fix the configuration and run again${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

read -p "Continue anyway? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}👋 Exiting. Configure OAuth and try again.${NC}"
    exit 0
fi

# Check if Docker is running
echo -e "\n${CYAN}🐳 Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running${NC}"
    echo -e "${CYAN}   Starting PostgreSQL and Redis with Docker...${NC}"
    echo -e "${YELLOW}   If this fails, start Docker manually and run again${NC}\n"
fi

# Start Docker services
cd "$PROJECT_ROOT"
if [ -f "docker-compose.yml" ]; then
    echo -e "${CYAN}🚀 Starting PostgreSQL and Redis...${NC}"
    docker-compose up -d postgres redis 2>&1 | grep -v "is up-to-date" || true
    echo -e "${GREEN}✅ Database services started${NC}\n"

    # Wait for PostgreSQL to be ready
    echo -e "${CYAN}⏳ Waiting for PostgreSQL...${NC}"
    sleep 3
fi

# Install backend dependencies if needed
cd "$PROJECT_ROOT/backend"
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}📦 Installing backend dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}\n"
fi

# Run database migrations
echo -e "${CYAN}🗄️  Running database migrations...${NC}"
npx prisma generate > /dev/null 2>&1 || true
npx prisma migrate deploy 2>&1 | tail -5 || true
echo -e "${GREEN}✅ Database ready${NC}\n"

# Install frontend dependencies if needed
cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}📦 Installing frontend dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}\n"
fi

# Create frontend .env.local if it doesn't exist
if [ ! -f "$PROJECT_ROOT/frontend/.env.local" ]; then
    echo -e "${CYAN}📝 Creating frontend/.env.local...${NC}"
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > "$PROJECT_ROOT/frontend/.env.local"
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}\n"
fi

# Start the servers
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Starting development servers...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${CYAN}📍 Backend:  ${NC}http://localhost:3001${NC}"
echo -e "${CYAN}📍 Frontend: ${NC}http://localhost:3000${NC}"
echo -e "${CYAN}📍 API Docs: ${NC}http://localhost:3001/api${NC}\n"

echo -e "${YELLOW}💡 Tip: Open http://localhost:3000/connect to test OAuth${NC}\n"

echo -e "${CYAN}Press Ctrl+C to stop all servers${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${GREEN}✅ Stopped${NC}"
    exit 0
}

trap cleanup EXIT INT TERM

# Start backend in background
cd "$PROJECT_ROOT/backend"
echo -e "${BLUE}[Backend]${NC} Starting..."
npm run start:dev 2>&1 | sed "s/^/$(echo -e ${BLUE})[Backend]$(echo -e ${NC}) /" &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
cd "$PROJECT_ROOT/frontend"
echo -e "${GREEN}[Frontend]${NC} Starting..."
npm run dev 2>&1 | sed "s/^/$(echo -e ${GREEN})[Frontend]$(echo -e ${NC}) /" &
FRONTEND_PID=$!

# Wait for both processes
wait
