# AveloHealth CRM - Technical Architecture

## System Overview

AveloHealth is an Intelligence-First Patient CRM designed to bridge clinical data and human interaction. This document outlines the technical architecture and design decisions.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend (Port 3000)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Patients │  │ Analytics│  │  Triage  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                          │                                   │
│                    API Client                                │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI Backend (Port 8000)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes Layer                         │  │
│  │  /auth  /patients  /ai  /teli  /appointments         │  │
│  └────┬─────────────┬──────────────┬──────────┬─────────┘  │
│       │             │              │          │             │
│  ┌────▼─────┐  ┌───▼────┐  ┌─────▼────┐  ┌──▼──────┐     │
│  │  Auth    │  │ HIPAA  │  │  Gemini  │  │  Teli   │     │
│  │ Service  │  │Compliance│ │ Service  │  │ Service │     │
│  └──────────┘  └────────┘  └─────┬────┘  └────┬────┘     │
│                                   │            │           │
│  ┌────────────────────────────────▼────────────▼────────┐ │
│  │           Snowflake Client                            │ │
│  │   (Connection Pool, Query Builder, Audit Logger)      │ │
│  └─────────────────────────┬─────────────────────────────┘ │
└────────────────────────────┼───────────────────────────────┘
                             │ Snowflake Connector
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Snowflake Data Warehouse                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Patients │  │AI Analysis│  │Teli Calls│  │  Audit   │  │
│  │  Table   │  │  Table    │  │  Table   │  │   Logs   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘

External AI Services:
┌──────────────┐        ┌──────────────┐
│  Gemini AI   │◄───────┤ HTTP/REST    │
│  (Google)    │        │ Async Calls  │
└──────────────┘        └──────────────┘

┌──────────────┐        ┌──────────────┐
│   Teli AI    │◄───────┤ Webhook      │
│  (Voice)     │────────►  Callbacks   │
└──────────────┘        └──────────────┘
```

---

## Technology Stack Details

### Frontend (Next.js)

**Framework**: Next.js 16 with App Router & Turbopack
- **Why**: Server-side rendering, automatic code splitting, optimized performance
- **Benefits**: SEO-friendly, fast initial load, Turbopack for faster builds

**Language**: TypeScript 5 (Strict Mode)
- **Why**: Type safety, better IDE support, fewer runtime errors
- **Benefits**: Catch errors at compile time, self-documenting code

**UI Library**: React 19
- **Why**: Latest React features, improved performance, better hydration
- **Benefits**: Server Components, improved ref handling, automatic batching

**Styling**: Tailwind CSS 4 + shadcn/ui patterns
- **Why**: Modern utility-first CSS with improved PostCSS architecture
- **Benefits**: Faster builds, better tree-shaking, cleaner CSS output
- **Components**: Minimal Radix UI footprint (Progress, Slot only)

**State Management**: React Hooks + API Client
- **Why**: Simple, built-in, no external dependencies
- **Benefits**: Less complexity, easier to understand

### Backend (FastAPI)

**Framework**: FastAPI
- **Why**: Async support, automatic API documentation, Pydantic validation
- **Benefits**: High performance, type hints, OpenAPI schema generation

**Language**: Python 3.9+
- **Why**: Rich ecosystem for data processing and AI integration
- **Benefits**: Easy integration with Gemini, extensive libraries

**Authentication**: JWT (JSON Web Tokens)
- **Why**: Stateless, secure, widely adopted
- **Benefits**: Scalable, works with SPA architecture

**Validation**: Pydantic Models
- **Why**: Type validation, automatic parsing, error messages
- **Benefits**: Data integrity, clear API contracts

### Database (Snowflake)

**Why Snowflake**:
1. **HIPAA Compliance**: Built-in encryption, audit trails, BAA available
2. **Scalability**: Separates compute and storage, auto-scaling
3. **Performance**: Optimized for analytics, fast queries
4. **Security**: Row-level security, data masking, multi-factor auth

**Schema Design**:
- **Normalized**: Separate tables for patients, analyses, calls
- **Encrypted Columns**: PHI data encrypted at rest
- **Audit Logs**: Every data access logged with user, time, action

### AI Services

**Gemini AI (Google)**:
- **Purpose**: Natural language understanding, risk assessment
- **Integration**: REST API with async calls
- **Prompt Engineering**: Structured JSON responses for reliability

**Teli AI**:
- **Purpose**: Voice interactions, call transcription
- **Integration**: Webhook-based for real-time updates
- **Data Flow**: Bidirectional (initiate calls, receive results)

---

## Security Architecture

### Authentication Flow

```
User Login
    │
    ├─► Frontend: Collects credentials
    │
    ├─► Backend: Validates against database
    │
    ├─► Creates JWT with user claims
    │
    └─► Returns token to client

Subsequent Requests
    │
    ├─► Frontend: Includes JWT in Authorization header
    │
    ├─► Backend: Validates token signature
    │
    ├─► Checks token expiration
    │
    ├─► Extracts user permissions
    │
    └─► Authorizes requested action
```

### Data Encryption

**In Transit**:
- TLS 1.3 for all communications
- Certificate pinning for mobile apps
- No sensitive data in URLs

**At Rest**:
- AES-256 for PHI fields
- Separate encryption keys per data type
- Key rotation every 90 days

**In Memory**:
- Minimize PHI in application memory
- Secure memory wiping after use
- No PHI in logs or error messages

### Access Control

**Role-Based Permissions**:
- `admin`: Full system access
- `physician`: View/edit patients, trigger AI
- `nurse`: View patients, schedule calls
- `care-coordinator`: View patients, manage outreach
- `receptionist`: View appointments, basic patient info
- `analyst`: View anonymized data only

---

## Data Flow: Predictive Triage

### Step-by-Step Process

1. **User Triggers Analysis**
   ```typescript
   POST /api/ai/predictive-triage
   ```

2. **Backend Queries Snowflake**
   ```sql
   SELECT * FROM patients 
   WHERE risk_level IN ('high', 'critical')
   AND (last_contact_date IS NULL 
        OR last_contact_date < DATEADD(day, -7, CURRENT_TIMESTAMP()))
   ORDER BY risk_score DESC
   LIMIT 50
   ```

3. **Gemini AI Analysis**
   - For each patient:
   - Builds clinical context
   - Sends to Gemini API
   - Receives structured risk assessment

4. **Save Results**
   - Updates patient risk scores in Snowflake
   - Creates AI analysis records
   - Logs audit trail

5. **Return to Frontend**
   - Sorted by risk score
   - Includes recommended actions
   - Shows outreach priority

---

## Performance Optimization

### Frontend
- **Code Splitting**: Lazy load routes and components
- **Image Optimization**: Next.js Image component
- **Caching**: Static pages cached, API responses cached in memory

### Backend
- **Async Operations**: FastAPI handles concurrent requests
- **Connection Pooling**: Reuse Snowflake connections
- **Batch Processing**: Group AI analyses when possible

### Database
- **Indexes**: On patient ID, risk level, contact date
- **Partitioning**: By date for time-series data
- **Query Optimization**: Limit result sets, use WHERE clauses

---

## Monitoring & Observability

### Metrics to Track

**Application**:
- API response times
- Error rates by endpoint
- Active user sessions

**AI Services**:
- Gemini API call success rate
- Average analysis time
- Teli AI call completion rate

**Database**:
- Query execution time
- Connection pool usage
- Data warehouse credit consumption

**Business**:
- Patients analyzed per day
- High-risk patients identified
- Outreach success rate

### Logging

**Structured Logging**:
```json
{
  "timestamp": "2025-01-31T10:30:00Z",
  "level": "INFO",
  "service": "gemini_service",
  "action": "analyze_patient",
  "patient_id": "patient_123",
  "duration_ms": 1250,
  "risk_score": 78
}
```

**HIPAA-Compliant**:
- No PHI in logs
- Sanitized error messages
- Separate audit log table

---

## Scalability Considerations

### Horizontal Scaling
- **Frontend**: Deploy to CDN (Vercel, Cloudflare)
- **Backend**: Multiple FastAPI instances behind load balancer
- **Database**: Snowflake auto-scales compute

### Vertical Scaling
- **Backend**: Increase worker processes per instance
- **Database**: Larger Snowflake warehouse size

### Caching Strategy
- **Redis**: For session data, frequent queries
- **In-Memory**: Short-lived API responses
- **CDN**: Static assets, public pages

---

## Disaster Recovery

### Backup Strategy
- **Snowflake**: Automatic continuous backup
- **Application State**: Stateless backend, no local data
- **Secrets**: Stored in secure vault (AWS Secrets Manager, etc.)

### Recovery Time Objective (RTO)
- **Target**: < 1 hour
- **Procedure**:
  1. Restore Snowflake from backup
  2. Deploy new backend instances
  3. Update DNS/load balancer

### Recovery Point Objective (RPO)
- **Target**: < 15 minutes
- **Mechanism**: Snowflake Time Travel (up to 90 days)

---

## Future Enhancements

1. **Real-Time Dashboards**: WebSocket for live updates
2. **Mobile Apps**: React Native for iOS/Android
3. **Advanced AI**: Fine-tuned models on anonymized data
4. **Integrations**: EHR systems (Epic, Cerner), billing platforms
5. **Analytics**: Predictive models for resource planning

---

## Development Best Practices

### Code Review Checklist
- [ ] Type safety enforced
- [ ] HIPAA compliance verified
- [ ] Audit logging implemented
- [ ] Error handling includes sanitization
- [ ] Tests cover critical paths
- [ ] Documentation updated

### Git Workflow
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Emergency production fixes

---

This architecture is designed to scale with AveloHealth's mission: preventing patients from falling through the cracks through intelligent, proactive care.
