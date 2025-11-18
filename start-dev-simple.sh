#!/bin/bash

# Simple startup script - starts backend and frontend
# Run this in tmux or with separate terminals

echo "🚀 Unmotivated Hero - Quick Start"
echo ""
echo "This will open two terminals:"
echo "  1. Backend  (http://localhost:3001)"
echo "  2. Frontend (http://localhost:3000)"
echo ""
echo "Starting Docker services..."

# Start Docker services
docker-compose up -d

echo ""
echo "Opening terminals..."
echo ""

# Detect OS and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/backend && npm run start:dev"'
    osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/frontend && npm run dev"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd backend && npm run start:dev; exec bash"
        gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd backend && npm run start:dev" &
        xterm -e "cd frontend && npm run dev" &
    else
        echo "Please run these commands in separate terminals:"
        echo ""
        echo "Terminal 1:"
        echo "  cd backend && npm run start:dev"
        echo ""
        echo "Terminal 2:"
        echo "  cd frontend && npm run dev"
    fi
else
    echo "Please run these commands in separate terminals:"
    echo ""
    echo "Terminal 1:"
    echo "  cd backend && npm run start:dev"
    echo ""
    echo "Terminal 2:"
    echo "  cd frontend && npm run dev"
fi

echo ""
echo "✅ Services starting..."
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
