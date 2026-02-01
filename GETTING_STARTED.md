# 🚀 Getting Started with AveloHealth CRM

Welcome to AveloHealth - The Pulse of Intelligent Patient Care. This guide will help you set up and run the application locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Python** 3.9 or higher ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/downloads))

### Verify Installation

```bash
node --version   # Should be v18.0.0 or higher
npm --version    # Should be 9.0.0 or higher
python3 --version # Should be 3.9.0 or higher
git --version    # Any recent version
```

## 🔧 Installation

### Option 1: Automated Setup (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YearningAsian/AveloHealth.git
   cd AveloHealth
   ```

2. **Run the setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   The script will:
   - ✅ Verify Node.js and Python versions
   - 📦 Install all frontend dependencies (Next.js, React, Tailwind CSS)
   - 📦 Install backend dependencies (FastAPI, Snowflake, etc.)
   - 📝 Create `.env` file from template
   - 🔧 Configure Python module structure

### Option 2: Manual Setup

1. **Clone and navigate:**
   ```bash
   git clone https://github.com/YearningAsian/AveloHealth.git
   cd AveloHealth
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   pip3 install -r requirements.txt
   cd ..
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

## ⚙️ Configuration

### 1. Edit `.env` File

Open `.env` in your text editor and configure the following:

```bash
# Snowflake Database Configuration
SNOWFLAKE_ACCOUNT=your-account
SNOWFLAKE_USER=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_DATABASE=AVELOHEALTH_DB
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_WAREHOUSE=COMPUTE_WH

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Teli AI Configuration
TELI_API_KEY=your-teli-api-key
TELI_API_URL=https://api.teli.ai

# Application Settings
NEXT_PUBLIC_API_URL=http://localhost:8000
JWT_SECRET=your-secret-key-change-in-production
```

### 2. API Keys Setup

#### Snowflake (Database)
1. Sign up at [Snowflake](https://signup.snowflake.com/)
2. Create a database named `AVELOHEALTH_DB`
3. Note your account identifier, username, and password

#### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `.env`

#### Teli AI (Voice)
1. Contact Teli AI for API access
2. Add your API key to `.env`

## 🚀 Running the Application

### Start Development Servers

You'll need **two terminal windows**:

#### Terminal 1: Backend Server
```bash
npm run backend
```
- Backend runs on: `http://localhost:8000`
- API docs available at: `http://localhost:8000/docs`

#### Terminal 2: Frontend Server
```bash
npm run dev
```
- Frontend runs on: `http://localhost:3000`
- Auto-reloads on file changes

### Access the Application

1. **Main Website:** `http://localhost:3000`
2. **Login Page:** `http://localhost:3000/login`
3. **QuickDiagnosis:** `http://localhost:3000/quick-diagnosis`
4. **API Documentation:** `http://localhost:8000/docs`

## 👥 User Roles & Demo Access

### Administrator Role
- **Capabilities:**
  - Configure AI and Teli AI settings
  - Customize system fields and workflows
  - View all appointments across providers
  - Access system-wide analytics and audit logs
  - Manage users and permissions

- **Demo Login:**
  1. Go to `/login`
  2. Click "Login as Administrator"
  3. Access full system configuration

### Professional Role
- **Capabilities:**
  - Schedule appointments for doctors
  - View AI-generated call insights
  - Manually input patient data
  - Access assigned patient information

- **Demo Login:**
  1. Go to `/login`
  2. Click "Login as Professional"
  3. Access clinical operations dashboard

## 📁 Project Structure

```
AveloHealth/
├── src/
│   ├── app/                    # Next.js app routes
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── dashboard/         # Main dashboard
│   │   ├── quick-diagnosis/   # Public diagnosis tool
│   │   └── solutions/         # Solution pages
│   ├── components/
│   │   ├── Header.tsx         # Navigation header
│   │   ├── dashboards/        # Role-specific dashboards
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utilities and API client
│   └── types/                 # TypeScript type definitions
├── backend/
│   ├── main.py               # FastAPI application entry
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── core/             # Core utilities (auth, config)
│   │   ├── db/               # Database clients
│   │   └── services/         # AI and external services
│   └── requirements.txt      # Python dependencies
├── public/                   # Static assets
├── .env                      # Environment variables (create from .env.example)
└── package.json              # Node.js dependencies
```

## 🛠️ Common Tasks

### Running Tests
```bash
npm run lint              # Check code quality
npm run type-check        # TypeScript validation
```

### Building for Production
```bash
npm run build            # Build optimized production bundle
npm start                # Start production server
```

### Clean Restart
```bash
# Stop all servers (Ctrl+C in both terminals)
rm -rf node_modules .next
npm install
npm run dev
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 8000 (backend)
npx kill-port 8000
```

### Database Connection Issues
- Verify Snowflake credentials in `.env`
- Check network connectivity
- Ensure Snowflake warehouse is running

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Python Package Issues
```bash
cd backend
pip3 install -r requirements.txt --upgrade
```

## 📚 Technology Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.4** - UI library
- **Tailwind CSS 4.1.18** - Utility-first CSS
- **TypeScript 5.3.3** - Type safety
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Modern Python web framework
- **Snowflake** - Cloud data warehouse
- **Google Gemini AI** - AI analysis and triage
- **Teli AI** - Voice interaction platform

## 🔒 Security Notes

- Never commit `.env` file to version control
- Change `JWT_SECRET` in production
- Use environment-specific API keys
- Keep dependencies updated

## 🆘 Getting Help

- **Documentation:** See `README.md` and `ARCHITECTURE.md`
- **Issues:** [GitHub Issues](https://github.com/YearningAsian/AveloHealth/issues)
- **API Docs:** `http://localhost:8000/docs` (when backend is running)

## 🎯 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`./setup.sh` or manual)
- [ ] `.env` file configured with API keys
- [ ] Backend running (`npm run backend`)
- [ ] Frontend running (`npm run dev`)
- [ ] Accessed `http://localhost:3000`

## 🚀 Next Steps

Once everything is running:

1. **Explore the landing page** at `http://localhost:3000`
2. **Try QuickDiagnosis** - No login required
3. **Login as Administrator** to see system configuration
4. **Login as Professional** to see clinical operations
5. **Review the API docs** at `http://localhost:8000/docs`
6. **Check the dashboard features** for both roles

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.

**Ready to contribute?** See `ARCHITECTURE.md` for system design details.
