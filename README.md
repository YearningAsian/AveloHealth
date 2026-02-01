# AveloHealth CRM Platform
## "The Pulse of Intelligent Patient Care"

**Intelligence-First Patient CRM** bridging clinical data and human interaction using advanced AI technologies.

---

## 🏗️ Architecture Overview

AveloHealth follows an **Intelligence-First architecture** designed to prevent patients from "falling through the cracks" through proactive AI-driven outreach and risk assessment.

### Core Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: FastAPI (Python) for async API processing
- **Database**: Snowflake for secure, scalable clinical data warehousing
- **AI Intelligence**:
  - **Gemini AI**: Predictive triage and risk assessment
  - **Teli AI**: Voice interactions and automated scheduling
- **UI Components**: Radix UI (Progress, Slot), shadcn/ui patterns

---

## 🔄 Core Workflows

### 1. **Teli AI → FastAPI → Snowflake**
Inbound onboarding calls feeding structured data into the clinical warehouse:
```
Patient Call → Teli AI Processing → Extract Data → FastAPI Webhook → Snowflake Storage
```

### 2. **FastAPI ↔ Gemini AI**
Intelligent scanning of patient records to identify high-risk individuals:
```
Snowflake Query → Clinical Data → Gemini Analysis → Risk Scoring → Proactive Outreach Triggers
```

### 3. **Next.js Dashboard**
Real-time visualization of predictive triage results for care teams:
```
Dashboard Request → FastAPI → Aggregated Insights → Interactive UI → Action Items
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ and npm
- **Python**: 3.9+ and pip
- **Snowflake Account**: With proper credentials
- **API Keys**: Gemini AI and Teli AI

### Installation

1. **Clone and navigate to the project**:
```bash
cd /home/colin/AveloHealth
```

2. **Install frontend dependencies**:
```bash
npm install
```

3. **Install backend dependencies**:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

4. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Snowflake Configuration
SNOWFLAKE_ACCOUNT=your_account.region
SNOWFLAKE_USER=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=AVELOHEALTH_DB
SNOWFLAKE_SCHEMA=PUBLIC

# AI Services
GEMINI_API_KEY=your_gemini_api_key
TELI_AI_API_KEY=your_teli_ai_api_key

# Security (generate secure keys)
JWT_SECRET_KEY=your_jwt_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Running the Application

1. **Start the FastAPI backend**:
```bash
npm run backend
# or
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Start the Next.js frontend** (in a new terminal):
```bash
npm run dev
```

3. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

---

## 📁 Project Structure

```
AveloHealth/
├── src/                          # Next.js Frontend
│   ├── app/                      # App Router pages
│   │   ├── dashboard/           # Main dashboard
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   └── ui/                  # Reusable UI components
│   ├── lib/                     # Utilities
│   │   ├── api-client.ts       # Backend API client
│   │   └── utils.ts            # Helper functions
│   └── types/                   # TypeScript definitions
│       ├── patient.ts          # Patient data types
│       ├── ai-analysis.ts      # AI analysis types
│       ├── teli-ai.ts          # Teli AI types
│       ├── appointment.ts      # Appointment types
│       ├── auth.ts             # Authentication types
│       ├── dashboard.ts        # Dashboard types
│       └── api.ts              # API response types
│
├── backend/                      # FastAPI Backend
│   ├── main.py                  # Application entry point
│   ├── requirements.txt         # Python dependencies
│   ├── app/
│   │   ├── core/               # Core functionality
│   │   │   ├── config.py      # Configuration management
│   │   │   ├── auth.py        # JWT authentication
│   │   │   └── hipaa.py       # HIPAA compliance utilities
│   │   ├── db/                # Database layer
│   │   │   └── snowflake_client.py  # Snowflake integration
│   │   ├── services/          # Business logic
│   │   │   ├── gemini_service.py    # Gemini AI integration
│   │   │   └── teli_service.py      # Teli AI integration
│   │   └── api/
│   │       └── routes/        # API endpoints
│   │           ├── auth.py           # Authentication routes
│   │           ├── patients.py       # Patient management
│   │           ├── ai_analysis.py    # AI-powered triage
│   │           ├── teli.py           # Voice interactions
│   │           └── appointments.py   # Scheduling
│
├── .env.example                 # Environment template
├── package.json                 # Node.js dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS config
└── next.config.js               # Next.js configuration
```

---

## 🔐 HIPAA Compliance

AveloHealth implements **HIPAA-compliant security** measures:

### Data Protection
- **Encryption at Rest**: AES-256 encryption for all PHI (Protected Health Information)
- **Encryption in Transit**: TLS 1.3 for all API communications
- **Data Minimization**: Only essential PHI is collected and stored
- **Access Controls**: Role-based permissions enforced at API level

### Audit Trails
Every access to PHI is logged with:
- User ID and session
- Timestamp
- Action performed
- Resource accessed
- IP address

### Error Handling
All error messages are sanitized to prevent PHI leakage in logs or responses.

---

## 🧠 AI Integration Details

### Gemini AI - Predictive Triage

**Purpose**: Analyze patient data to identify risk factors and prevent complications

**Key Features**:
- Risk scoring (0-100 scale)
- Multi-factor risk assessment
- Actionable recommendations
- Proactive outreach suggestions
- Clinical summary generation

**Example Analysis**:
```typescript
{
  "risk_score": 78,
  "risk_level": "high",
  "risk_factors": [
    {
      "factor": "Missed 3 consecutive appointments",
      "severity": "high",
      "impact_score": 85
    }
  ],
  "suggested_outreach": {
    "should_contact": true,
    "urgency": "urgent",
    "preferred_method": "teli-ai-call"
  }
}
```

### Teli AI - Voice Interactions

**Purpose**: Automated, empathetic patient communication

**Call Types**:
- **Onboarding**: Welcome new patients, collect information
- **Follow-up**: Check on patient status and medication compliance
- **Appointment Reminders**: Reduce no-shows
- **Health Checks**: Monitor chronic conditions

**Data Extraction**:
- Structured information from natural conversation
- Sentiment analysis
- Compliance assessment
- Concerns and follow-up needs

---

## 📊 Dashboard Features

### Key Metrics
- Total patients and active count
- High-risk patient identification
- AI analysis activity
- Teli AI call volume

### Predictive Triage
- Real-time risk assessment
- Outreach queue management
- Priority-based patient list
- Automated action triggers

### System Health
- Snowflake connection status
- Gemini AI availability
- Teli AI operational status
- Engagement metrics

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients/` - List patients
- `GET /api/patients/{id}` - Get patient details
- `GET /api/patients/high-risk/list` - Get high-risk patients

### AI Analysis
- `POST /api/ai/analyze-patient` - Analyze single patient
- `POST /api/ai/predictive-triage` - Batch risk assessment
- `POST /api/ai/generate-outreach-script` - Create call script

### Teli AI
- `POST /api/teli/initiate-call` - Start immediate call
- `POST /api/teli/schedule-call` - Schedule future call
- `POST /api/teli/webhook` - Receive call results
- `GET /api/teli/call/{id}/status` - Check call status

### Dashboard
- `GET /api/appointments/dashboard` - Get dashboard stats
- `GET /api/appointments/stats` - Get appointment statistics

---

## 🛠️ Development

### Type Safety
All components use TypeScript with strict mode enabled. Types are centralized in `/src/types/`.

### Code Organization
- **Frontend**: Feature-based components
- **Backend**: Service-oriented architecture
- **Shared**: TypeScript interfaces mirror Python models

### Testing
```bash
# Frontend
npm run type-check

# Backend
cd backend
python -m pytest
```

---

## 🚀 Deployment

### Environment Setup
1. Configure production environment variables
2. Update CORS origins
3. Enable SSL/TLS certificates
4. Configure Snowflake production warehouse

### Build
```bash
# Frontend
npm run build
npm start

# Backend
cd backend
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Docker (Optional)
```dockerfile
# Dockerfile examples can be created for containerized deployment
```

---

## 🔄 Core Philosophy: Intelligence-First

### What This Means:
1. **Proactive, not Reactive**: AI identifies risks before they escalate
2. **Data-Driven Decisions**: Every action informed by clinical data
3. **Human-AI Collaboration**: Technology augments, not replaces, care teams
4. **Patient-Centric**: All intelligence focused on improving outcomes

### Social Impact:
- **Prevent Patient Abandonment**: No one falls through the cracks
- **Reduce Healthcare Disparities**: Equitable AI-driven outreach
- **Improve Chronic Care**: Continuous monitoring and engagement
- **Optimize Resources**: Focus human effort where it matters most

---

## 📝 Demo Credentials

For testing purposes:
- **Email**: demo@avelohealth.com
- **Password**: demo123

---

## 🤝 Contributing

This is a production-grade healthcare platform. All contributions must:
1. Maintain HIPAA compliance
2. Include comprehensive tests
3. Follow TypeScript strict mode
4. Document AI decision logic
5. Preserve audit trails

---

## 📄 License

Proprietary - AveloHealth CRM Platform

---

## 📞 Support

For issues or questions:
- Technical: Open a GitHub issue
- Security: Contact security team immediately
- Clinical: Consult with medical advisory board

---

**Built with ❤️ for healthcare providers who care about every patient.**
