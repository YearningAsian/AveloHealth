"""
Snowflake Database Client
Secure, scalable clinical data warehousing
"""

import snowflake.connector
from snowflake.connector import DictCursor
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

from app.core.config import settings
from app.core.hipaa import HIPAACompliance

class SnowflakeClient:
    """Snowflake database client for clinical data"""
    
    def __init__(self):
        self.connection = None
        self.cursor = None
    
    async def connect(self):
        """Establish connection to Snowflake"""
        try:
            self.connection = snowflake.connector.connect(
                account=settings.SNOWFLAKE_ACCOUNT,
                user=settings.SNOWFLAKE_USER,
                password=settings.SNOWFLAKE_PASSWORD,
                warehouse=settings.SNOWFLAKE_WAREHOUSE,
                database=settings.SNOWFLAKE_DATABASE,
                schema=settings.SNOWFLAKE_SCHEMA,
                client_session_keep_alive=True
            )
            self.cursor = self.connection.cursor(DictCursor)
            print("✅ Snowflake connection established")
            
            # Initialize schema if needed
            await self._initialize_schema()
            
        except Exception as e:
            print(f"❌ Snowflake connection failed: {e}")
            raise
    
    async def disconnect(self):
        """Close Snowflake connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
    
    async def _initialize_schema(self):
        """Create tables if they don't exist"""
        
        # Patients table
        await self.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                id VARCHAR PRIMARY KEY,
                first_name VARCHAR ENCRYPTED,
                last_name VARCHAR ENCRYPTED,
                date_of_birth DATE ENCRYPTED,
                email VARCHAR ENCRYPTED,
                phone VARCHAR ENCRYPTED,
                medical_record_number VARCHAR,
                chronic_conditions VARIANT,
                risk_score NUMBER(5,2),
                risk_level VARCHAR,
                last_triage_date TIMESTAMP,
                last_contact_date TIMESTAMP,
                preferred_contact_method VARCHAR,
                consent_for_ai BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
                created_by VARCHAR,
                last_modified_by VARCHAR
            )
        """)
        
        # AI Analysis table
        await self.execute("""
            CREATE TABLE IF NOT EXISTS ai_analyses (
                id VARCHAR PRIMARY KEY,
                patient_id VARCHAR,
                analysis_type VARCHAR,
                risk_score NUMBER(5,2),
                risk_level VARCHAR,
                risk_factors VARIANT,
                recommended_actions VARIANT,
                ai_insights TEXT,
                clinical_summary TEXT,
                priority_level VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            )
        """)
        
        # Teli AI Calls table
        await self.execute("""
            CREATE TABLE IF NOT EXISTS teli_calls (
                id VARCHAR PRIMARY KEY,
                patient_id VARCHAR,
                call_type VARCHAR,
                status VARCHAR,
                initiated_at TIMESTAMP,
                completed_at TIMESTAMP,
                duration INTEGER,
                transcript TEXT,
                summary TEXT,
                extracted_data VARIANT,
                sentiment VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            )
        """)
        
        # Appointments table
        await self.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id VARCHAR PRIMARY KEY,
                patient_id VARCHAR,
                provider_id VARCHAR,
                appointment_type VARCHAR,
                scheduled_date TIMESTAMP,
                duration INTEGER,
                status VARCHAR,
                chief_complaint TEXT,
                notes TEXT,
                ai_triggered BOOLEAN,
                reminder_sent BOOLEAN,
                teli_call_id VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
                created_by VARCHAR,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            )
        """)
        
        # Audit Log table (HIPAA requirement)
        await self.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id VARCHAR PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
                user_id VARCHAR,
                action VARCHAR,
                resource_type VARCHAR,
                resource_id VARCHAR,
                details VARIANT,
                ip_address VARCHAR,
                session_id VARCHAR
            )
        """)
        
        print("✅ Snowflake schema initialized")
    
    async def execute(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """Execute query and return results"""
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            
            # Check if query returns results
            if self.cursor.description:
                return self.cursor.fetchall()
            else:
                self.connection.commit()
                return []
        
        except Exception as e:
            print(f"❌ Query execution failed: {e}")
            raise
    
    async def log_audit(self, audit_entry: Dict[str, Any]):
        """Log audit entry for HIPAA compliance"""
        query = """
            INSERT INTO audit_logs (
                id, timestamp, user_id, action, resource_type, 
                resource_id, details, ip_address, session_id
            )
            VALUES (
                %(id)s, %(timestamp)s, %(user_id)s, %(action)s, 
                %(resource_type)s, %(resource_id)s, 
                PARSE_JSON(%(details)s), %(ip_address)s, %(session_id)s
            )
        """
        
        audit_entry['id'] = f"audit_{datetime.utcnow().timestamp()}"
        audit_entry['details'] = json.dumps(audit_entry.get('details', {}))
        
        await self.execute(query, audit_entry)
    
    # Patient Operations
    async def get_patient(self, patient_id: str) -> Optional[Dict]:
        """Retrieve patient by ID"""
        query = "SELECT * FROM patients WHERE id = %(patient_id)s"
        results = await self.execute(query, {"patient_id": patient_id})
        return results[0] if results else None
    
    async def get_patients(
        self,
        risk_level: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict]:
        """Retrieve patients with optional filtering"""
        query = "SELECT * FROM patients"
        params = {"limit": limit, "offset": offset}
        
        if risk_level:
            query += " WHERE risk_level = %(risk_level)s"
            params["risk_level"] = risk_level
        
        query += " ORDER BY risk_score DESC LIMIT %(limit)s OFFSET %(offset)s"
        
        return await self.execute(query, params)
    
    async def create_patient(self, patient_data: Dict[str, Any]) -> str:
        """Create new patient record"""
        query = """
            INSERT INTO patients (
                id, first_name, last_name, date_of_birth, email, phone,
                medical_record_number, chronic_conditions, risk_score, risk_level,
                preferred_contact_method, consent_for_ai, created_by
            )
            VALUES (
                %(id)s, %(first_name)s, %(last_name)s, %(date_of_birth)s,
                %(email)s, %(phone)s, %(medical_record_number)s,
                PARSE_JSON(%(chronic_conditions)s), %(risk_score)s, %(risk_level)s,
                %(preferred_contact_method)s, %(consent_for_ai)s, %(created_by)s
            )
        """
        
        patient_data['chronic_conditions'] = json.dumps(patient_data.get('chronic_conditions', []))
        await self.execute(query, patient_data)
        return patient_data['id']
    
    async def update_patient_risk(self, patient_id: str, risk_score: float, risk_level: str):
        """Update patient risk assessment"""
        query = """
            UPDATE patients
            SET risk_score = %(risk_score)s,
                risk_level = %(risk_level)s,
                last_triage_date = CURRENT_TIMESTAMP(),
                updated_at = CURRENT_TIMESTAMP()
            WHERE id = %(patient_id)s
        """
        
        await self.execute(query, {
            "patient_id": patient_id,
            "risk_score": risk_score,
            "risk_level": risk_level
        })
    
    # AI Analysis Operations
    async def save_ai_analysis(self, analysis_data: Dict[str, Any]) -> str:
        """Save AI analysis result"""
        query = """
            INSERT INTO ai_analyses (
                id, patient_id, analysis_type, risk_score, risk_level,
                risk_factors, recommended_actions, ai_insights,
                clinical_summary, priority_level
            )
            VALUES (
                %(id)s, %(patient_id)s, %(analysis_type)s, %(risk_score)s,
                %(risk_level)s, PARSE_JSON(%(risk_factors)s),
                PARSE_JSON(%(recommended_actions)s), %(ai_insights)s,
                %(clinical_summary)s, %(priority_level)s
            )
        """
        
        analysis_data['risk_factors'] = json.dumps(analysis_data.get('risk_factors', []))
        analysis_data['recommended_actions'] = json.dumps(analysis_data.get('recommended_actions', []))
        
        await self.execute(query, analysis_data)
        return analysis_data['id']
    
    async def get_high_risk_patients(self, limit: int = 50) -> List[Dict]:
        """Get high-risk patients needing outreach"""
        query = """
            SELECT * FROM patients
            WHERE risk_level IN ('high', 'critical')
            AND (last_contact_date IS NULL 
                 OR last_contact_date < DATEADD(day, -7, CURRENT_TIMESTAMP()))
            ORDER BY risk_score DESC
            LIMIT %(limit)s
        """
        
        return await self.execute(query, {"limit": limit})
    
    # Teli AI Operations
    async def save_teli_call(self, call_data: Dict[str, Any]) -> str:
        """Save Teli AI call record"""
        query = """
            INSERT INTO teli_calls (
                id, patient_id, call_type, status, initiated_at,
                completed_at, duration, transcript, summary,
                extracted_data, sentiment
            )
            VALUES (
                %(id)s, %(patient_id)s, %(call_type)s, %(status)s,
                %(initiated_at)s, %(completed_at)s, %(duration)s,
                %(transcript)s, %(summary)s, PARSE_JSON(%(extracted_data)s),
                %(sentiment)s
            )
        """
        
        call_data['extracted_data'] = json.dumps(call_data.get('extracted_data', {}))
        await self.execute(query, call_data)
        return call_data['id']
    
    # Dashboard Queries
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        stats = {}
        
        # Total patients
        result = await self.execute("SELECT COUNT(*) as count FROM patients")
        stats['total_patients'] = result[0]['COUNT'] if result else 0
        
        # High risk count
        result = await self.execute(
            "SELECT COUNT(*) as count FROM patients WHERE risk_level IN ('high', 'critical')"
        )
        stats['high_risk_patients'] = result[0]['COUNT'] if result else 0
        
        # Recent AI analyses
        result = await self.execute("""
            SELECT COUNT(*) as count FROM ai_analyses 
            WHERE created_at > DATEADD(day, -7, CURRENT_TIMESTAMP())
        """)
        stats['ai_analyses_this_week'] = result[0]['COUNT'] if result else 0
        
        # Recent Teli calls
        result = await self.execute("""
            SELECT COUNT(*) as count FROM teli_calls 
            WHERE initiated_at > DATEADD(day, -7, CURRENT_TIMESTAMP())
        """)
        stats['teli_calls_this_week'] = result[0]['COUNT'] if result else 0
        
        return stats
