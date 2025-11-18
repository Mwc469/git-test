#!/bin/bash

# Unmotivated Hero - Development Startup Script
# This script starts both frontend and backend in development mode

set -e

echo "🚀 Starting Unmotivated Hero Development Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "🐳 Checking Docker services..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker first.${NC}"
    echo "   Then run: docker-compose up -d"
    exit 1
fi

# Check if PostgreSQL and Redis are running
if ! docker-compose ps | grep -q "postgres.*Up"; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting services...${NC}"
    docker-compose up -d
    echo "   Waiting for services to be ready..."
    sleep 5
fi

echo -e "${GREEN}✓${NC} Docker services are running"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
fi

# Check if Prisma client is generated
if [ ! -d "backend/node_modules/.prisma" ]; then
    echo "⚙️  Generating Prisma client..."
    cd backend
    npx prisma generate
    cd ..
    echo -e "${GREEN}✓${NC} Prisma client generated"
fi

# Check if database migrations are applied
echo "🗄️  Checking database migrations..."
cd backend
if ! npx prisma migrate status > /dev/null 2>&1; then
    echo "   Running database migrations..."
    npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init
    echo -e "${GREEN}✓${NC} Database migrations applied"
else
    echo -e "${GREEN}✓${NC} Database is up to date"
fi
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Starting Development Servers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:3001"
echo -e "${BLUE}API Docs:${NC} http://localhost:3001/api-docs"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start backend in background
echo "🔧 Starting backend..."
cd backend
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for both services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Backend is running (PID: $BACKEND_PID)"
else
    echo -e "${YELLOW}⚠️  Backend failed to start. Check backend.log${NC}"
fi

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Frontend is running (PID: $FRONTEND_PID)"
else
    echo -e "${YELLOW}⚠️  Frontend failed to start. Check frontend.log${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Development environment is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Open your browser to: http://localhost:3000"
echo ""
echo "📊 View logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""

# Keep script running and show combined logs
tail -f backend.log frontend.log &
TAIL_PID=$!

# Wait for user interrupt
wait $BACKEND_PID $FRONTEND_PID

# Cleanup
kill $TAIL_PID 2>/dev/null
cleanup
