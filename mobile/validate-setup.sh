#!/bin/bash

echo "🔍 Validating Unmotivated Hero Mobile App Setup..."
echo ""

# Check if we're in the mobile directory
if [ ! -f "package.json" ]; then
  echo "❌ Not in mobile directory. Please run from /mobile"
  exit 1
fi

echo "✅ In mobile directory"

# Check node_modules
if [ -d "node_modules" ]; then
  echo "✅ Dependencies installed"
else
  echo "❌ Dependencies not installed. Run: npm install"
  exit 1
fi

# Check for .env file
if [ -f ".env" ]; then
  echo "✅ Environment file exists"
else
  echo "⚠️  No .env file. Copying from .env.example..."
  cp .env.example .env
  echo "✅ Created .env file"
fi

# Check TypeScript compilation
echo ""
echo "🔍 Checking TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
  echo "✅ TypeScript: No errors"
else
  echo "❌ TypeScript errors found. Run: npx tsc --noEmit"
  exit 1
fi

# Check project structure
echo ""
echo "🔍 Checking project structure..."
REQUIRED_DIRS=("src/screens" "src/components" "src/navigation" "src/services" "src/theme" "src/types")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir exists"
  else
    echo "❌ Missing directory: $dir"
    exit 1
  fi
done

# Check Expo CLI
echo ""
echo "🔍 Checking Expo CLI..."
if npx expo --version > /dev/null 2>&1; then
  VERSION=$(npx expo --version)
  echo "✅ Expo CLI installed (v$VERSION)"
else
  echo "❌ Expo CLI not found"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup validation complete! Everything looks good."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Ready to test! Choose a method:"
echo ""
echo "  1. Physical Device (Easiest):"
echo "     npm start"
echo "     → Scan QR code with Expo Go app"
echo ""
echo "  2. iOS Simulator (Mac only):"
echo "     npm run ios"
echo ""
echo "  3. Android Emulator:"
echo "     npm run android"
echo ""
echo "  4. Web Browser:"
echo "     npm run web"
echo ""
echo "📖 For detailed instructions, see TESTING.md"
echo ""
