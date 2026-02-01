# AveloHealth - Digital Health Diary

A modern, HIPAA-compliant digital health diary application that helps patients track symptoms, monitor health progress, and share meaningful insights with healthcare providers.

![AveloHealth](https://img.shields.io/badge/version-1.0.0-teal.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)

## ✨ Features

### For Patients
- **Digital Health Diary**: Log symptoms, medications, and health notes
- **Visual Progress Tracking**: Beautiful charts showing health trends over time
- **Severity Tracking**: Categorize symptoms as High/Medium/Low
- **Historical Insights**: Look back at your health journey and identify patterns

### For Healthcare Providers
- **Doctor-Ready Reports**: Generate summaries that help providers understand recent history
- **Quick Patient Overview**: See the complete picture of patient health between visits

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd AveloHealth2
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Frontend
cp .env.local.example .env.local

# Backend
cp backend/.env.example backend/.env
```

4. **Start the development servers**

**Frontend (Terminal 1):**
```bash
npm run dev
```

**Backend (Terminal 2):**
```bash
npm run backend
# Or manually:
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

5. **Open the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📱 Demo Credentials

To test the application, use these demo credentials:

- **Email**: `demo@avelohealth.com`
- **Password**: `demo123`

## 📁 Project Structure

```
AveloHealth2/
├── src/                      # Next.js frontend
│   ├── app/                  # App router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── signup/           # Sign up flow
│   │   └── dashboard/        # Patient dashboard
│   ├── components/           # React components
│   │   ├── ui/               # UI primitives
│   │   ├── Logo.tsx
│   │   └── Footer.tsx
│   └── lib/                  # Utilities & API
│       ├── api.ts
│       └── utils.ts
├── backend/                  # FastAPI backend
│   ├── main.py               # Application entry
│   ├── app/
│   │   ├── api/routes/       # API endpoints
│   │   ├── core/             # Auth, config, HIPAA
│   │   ├── db/               # Database clients
│   │   └── services/         # Business logic
│   └── requirements.txt
└── package.json
```

## 🔐 Security & Compliance

- **HIPAA Compliant**: Built with healthcare data security in mind
- **JWT Authentication**: Secure token-based auth
- **Data Encryption**: Sensitive data is encrypted at rest
- **Audit Logging**: All data access is logged for compliance

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **Pydantic** - Data validation
- **Snowflake** - Data warehouse (optional)
- **Google Gemini** - AI analysis (optional)

## 📊 Dashboard Features

The patient dashboard includes:

1. **Patient Summary Card**
   - Name and date of birth (age)
   - Quick stats: total entries, high/low severity counts

2. **Recent Entries Table**
   - Last 5 entries with date, symptoms, category, severity
   - Filter by severity (high/medium/low)
   - Sort by date (newest/oldest)

3. **Health Trends Charts**
   - Line chart showing entries over time by severity
   - Pie chart showing symptom distribution by category
   - Advanced filtering:
     - Date range (1 week, 1 month, 3 months, 1 year, custom)
     - Severity filter
     - Category filter

4. **Severity Distribution**
   - Visual breakdown of high/medium/low severity entries

## 🎨 Color Coding

- 🔴 **High Severity** - Red (#ef4444)
- 🟡 **Medium Severity** - Yellow (#eab308)
- 🟢 **Low Severity** - Green (#22c55e)

## 📝 License

Copyright © 2026 AveloHealth. All rights reserved.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.
