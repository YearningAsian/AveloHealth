#!/bin/bash

echo "🚀 AveloHealth CRM Setup Script"
echo "================================"
echo ""
echo "This script will set up your AveloHealth development environment"
echo "Required: Node.js 18+, Python 3.9+"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node --version)"
    exit 1
fi
echo "✅ Node.js $(node --version) detected"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    echo "   Visit: https://www.python.org/downloads/"
    exit 1
fi
echo "✅ Python $(python3 --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi
echo "✅ npm $(npm --version) detected"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
echo "   Packages: Next.js 16.1.6, React 19.2.4, Tailwind CSS 4.1.18"
npm install

if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi
cd ..
echo "✅ Backend dependencies installed"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Edit .env with your credentials before running the app"
else
    echo ""
    echo "ℹ️  .env file already exists"
fi

# Create empty __init__.py files for Python modules
echo ""
echo "🔧 Setting up Python module structure..."
touch backend/app/__init__.py
touch backend/app/core/__init__.py
touch backend/app/db/__init__.py
touch backend/app/services/__init__.py
touch backend/app/api/__init__.py
touch backend/app/api/routes/__init__.py
echo "✅ Python modules configured"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Snowflake, Gemini, and Teli AI credentials"
echo "2. Start the backend: npm run backend"
echo "3. Start the frontend (in new terminal): npm run dev"
echo "4. Access at http://localhost:3000"
echo ""
echo "📚 For more information, see README.md"
