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
        
        # Patient Calls table (main table for Teli AI inbound calls)
        await self.execute("""
            CREATE TABLE IF NOT EXISTS patient_calls (
                call_id VARCHAR PRIMARY KEY,
                patient_name VARCHAR,
                patient_age INTEGER,
                phone_number VARCHAR,
                patient_location VARCHAR,
                symptom_description TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
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
            
            if self.cursor.description:
                return self.cursor.fetchall()
            else:
                self.connection.commit()
                return []
        
        except Exception as e:
            print(f"❌ Query execution failed: {e}")
            raise
    
    # ============ PATIENT CALLS OPERATIONS ============
    
    async def insert_patient_call(self, name: str, age: int, phone: str, location: str, symptoms: str) -> Dict:
        """Insert patient call from Teli AI webhook or form submission"""
        call_id = f"call_{abs(hash(phone))}"
        query = """
            INSERT INTO patient_calls (
                call_id, patient_name, patient_age, phone_number, 
                patient_location, symptom_description
            )
            VALUES (%(call_id)s, %(name)s, %(age)s, %(phone)s, %(location)s, %(symptoms)s)
        """
        await self.execute(query, {
            "call_id": call_id,
            "name": name,
            "age": age,
            "phone": phone,
            "location": location,
            "symptoms": symptoms
        })
        return {"success": True, "call_id": call_id}
    
    async def get_patient_calls(self) -> List[Dict]:
        """Get all patient calls"""
        return await self.execute("SELECT * FROM patient_calls ORDER BY uploaded_at DESC")
    
    async def get_ai_patient_summaries(self) -> List[Dict]:
        """Get AI-generated summaries for patient calls"""
        return await self.execute("""
            SELECT 
                patient_name,
                patient_age,
                patient_location,
                symptom_description,
                SNOWFLAKE.CORTEX.COMPLETE('mistral-large', 
                    CONCAT('Analyze this for a health app. Return ONLY a JSON object with keys: "condition_guess", "urgency", and "next_step". Symptoms: ', symptom_description)
                ) AS ai_json_raw
            FROM patient_calls
        """)
    
    # ============ DASHBOARD STATS ============
    
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        stats = {}
        
        # Total patient calls
        result = await self.execute("SELECT COUNT(*) as count FROM patient_calls")
        stats['total_calls'] = result[0]['COUNT'] if result else 0
        
        return stats
    
    async def get_appointment_stats(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get appointment statistics from database"""
        stats = {}
        
        # Base filter
        user_filter = "WHERE user_id = %(user_id)s" if user_id else ""
        params = {"user_id": user_id} if user_id else {}
        
        # Total scheduled (upcoming)
        result = await self.execute(f"""
            SELECT COUNT(*) as count FROM appointments 
            {user_filter} {"AND" if user_filter else "WHERE"} status = 'upcoming'
        """, params)
        stats['totalScheduled'] = result[0]['COUNT'] if result else 0
        
        # Total completed
        result = await self.execute(f"""
            SELECT COUNT(*) as count FROM appointments 
            {user_filter} {"AND" if user_filter else "WHERE"} status = 'completed'
        """, params)
        stats['totalCompleted'] = result[0]['COUNT'] if result else 0
        
        # Total cancelled
        result = await self.execute(f"""
            SELECT COUNT(*) as count FROM appointments 
            {user_filter} {"AND" if user_filter else "WHERE"} status = 'cancelled'
        """, params)
        stats['totalCancelled'] = result[0]['COUNT'] if result else 0
        
        # Upcoming today
        result = await self.execute(f"""
            SELECT COUNT(*) as count FROM appointments 
            {user_filter} {"AND" if user_filter else "WHERE"} 
            appointment_date = CURRENT_DATE() AND status = 'upcoming'
        """, params)
        stats['upcomingToday'] = result[0]['COUNT'] if result else 0
        
        # Upcoming this week
        result = await self.execute(f"""
            SELECT COUNT(*) as count FROM appointments 
            {user_filter} {"AND" if user_filter else "WHERE"} 
            appointment_date BETWEEN CURRENT_DATE() AND DATEADD(day, 7, CURRENT_DATE())
            AND status = 'upcoming'
        """, params)
        stats['upcomingWeek'] = result[0]['COUNT'] if result else 0
        
        # Calculate no-show rate
        total = stats['totalCompleted'] + stats['totalCancelled']
        stats['totalNoShows'] = 0  # Would need a 'no_show' status to track this
        stats['noShowRate'] = 0 if total == 0 else round((stats['totalNoShows'] / total) * 100, 1)
        
        return stats
    
    async def get_comprehensive_dashboard_stats(self) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics for admin view"""
        stats = {}
        
        # Total users/patients
        result = await self.execute("SELECT COUNT(*) as count FROM users WHERE role = 'patient'")
        stats['total_patients'] = result[0]['COUNT'] if result else 0
        
        # New patients this month
        result = await self.execute("""
            SELECT COUNT(*) as count FROM users 
            WHERE role = 'patient' 
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE())
        """)
        stats['new_patients_this_month'] = result[0]['COUNT'] if result else 0
        
        # Total patient calls
        result = await self.execute("SELECT COUNT(*) as count FROM patient_calls")
        stats['total_calls'] = result[0]['COUNT'] if result else 0
        
        # Appointments today
        result = await self.execute("""
            SELECT COUNT(*) as count FROM appointments 
            WHERE appointment_date = CURRENT_DATE() AND status = 'upcoming'
        """)
        stats['appointments_today'] = result[0]['COUNT'] if result else 0
        
        # Appointments this week
        result = await self.execute("""
            SELECT COUNT(*) as count FROM appointments 
            WHERE appointment_date BETWEEN CURRENT_DATE() AND DATEADD(day, 7, CURRENT_DATE())
            AND status = 'upcoming'
        """)
        stats['appointments_this_week'] = result[0]['COUNT'] if result else 0
        
        # Total providers
        result = await self.execute("SELECT COUNT(*) as count FROM providers")
        stats['total_providers'] = result[0]['COUNT'] if result else 0
        
        # High severity diary entries (patients needing outreach)
        result = await self.execute("""
            SELECT COUNT(DISTINCT user_id) as count FROM diary_entries 
            WHERE severity = 'high' 
            AND entry_date >= DATEADD(day, -7, CURRENT_DATE())
        """)
        stats['patients_needing_outreach'] = result[0]['COUNT'] if result else 0
        
        # Active patients (with recent diary entries)
        result = await self.execute("""
            SELECT COUNT(DISTINCT user_id) as count FROM diary_entries 
            WHERE entry_date >= DATEADD(day, -30, CURRENT_DATE())
        """)
        stats['active_patients'] = result[0]['COUNT'] if result else 0
        
        # Completed appointments
        result = await self.execute("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'")
        completed = result[0]['COUNT'] if result else 0
        
        # Cancelled appointments
        result = await self.execute("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'")
        cancelled = result[0]['COUNT'] if result else 0
        
        # Calculate no-show rate
        total = completed + cancelled
        stats['no_show_rate'] = 0 if total == 0 else round((cancelled / total) * 100, 1)
        
        return stats
    
    # ============ PATIENT OPERATIONS ============
    
    async def get_patients(self, risk_level: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Get all patients with optional risk level filter"""
        if risk_level:
            return await self.execute("""
                SELECT u.user_id as id, u.name, u.email, u.phone_number, u.date_of_birth,
                       u.created_at,
                       COALESCE(
                           (SELECT severity FROM diary_entries 
                            WHERE user_id = u.user_id 
                            ORDER BY entry_date DESC LIMIT 1), 
                           'low'
                       ) as risk_level
                FROM users u
                WHERE u.role = 'patient'
                HAVING risk_level = %(risk_level)s
                ORDER BY u.name
                LIMIT %(limit)s OFFSET %(offset)s
            """, {"risk_level": risk_level, "limit": limit, "offset": offset})
        else:
            return await self.execute("""
                SELECT u.user_id as id, u.name, u.email, u.phone_number, u.date_of_birth,
                       u.created_at,
                       COALESCE(
                           (SELECT severity FROM diary_entries 
                            WHERE user_id = u.user_id 
                            ORDER BY entry_date DESC LIMIT 1), 
                           'low'
                       ) as risk_level
                FROM users u
                WHERE u.role = 'patient'
                ORDER BY u.name
                LIMIT %(limit)s OFFSET %(offset)s
            """, {"limit": limit, "offset": offset})
    
    async def get_patient(self, patient_id: str) -> Optional[Dict]:
        """Get a specific patient by ID"""
        result = await self.execute("""
            SELECT u.user_id as id, u.name, u.email, u.phone_number, u.date_of_birth,
                   u.account_number, u.created_at,
                   (SELECT COUNT(*) FROM diary_entries WHERE user_id = u.user_id) as total_entries,
                   (SELECT COUNT(*) FROM appointments WHERE user_id = u.user_id) as total_appointments
            FROM users u
            WHERE u.user_id = %(patient_id)s AND u.role = 'patient'
        """, {"patient_id": patient_id})
        return result[0] if result else None
    
    async def get_high_risk_patients(self, limit: int = 50) -> List[Dict]:
        """Get patients with high severity diary entries recently"""
        return await self.execute("""
            SELECT DISTINCT u.user_id as id, u.name, u.email, u.phone_number,
                   d.entry_date as last_high_severity_date,
                   d.symptoms as last_symptoms
            FROM users u
            JOIN diary_entries d ON u.user_id = d.user_id
            WHERE u.role = 'patient'
            AND d.severity = 'high'
            AND d.entry_date >= DATEADD(day, -30, CURRENT_DATE())
            ORDER BY d.entry_date DESC
            LIMIT %(limit)s
        """, {"limit": limit})
    
    # ============ USER OPERATIONS ============
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        result = await self.execute(
            "SELECT * FROM users WHERE user_id = %(user_id)s",
            {"user_id": user_id}
        )
        return result[0] if result else None
    
    async def get_user_by_phone(self, phone: str) -> Optional[Dict]:
        """Get user by phone number"""
        result = await self.execute(
            "SELECT * FROM users WHERE phone_number = %(phone)s",
            {"phone": phone}
        )
        return result[0] if result else None
    
    # ============ PROVIDER OPERATIONS ============
    
    async def get_providers(self, limit: int = 50) -> List[Dict]:
        """Get all providers"""
        return await self.execute(
            "SELECT * FROM providers ORDER BY name LIMIT %(limit)s",
            {"limit": limit}
        )
    
    async def get_provider_by_id(self, provider_id: str) -> Optional[Dict]:
        """Get provider by ID"""
        result = await self.execute(
            "SELECT * FROM providers WHERE provider_id = %(provider_id)s",
            {"provider_id": provider_id}
        )
        return result[0] if result else None
    
    async def create_provider(self, data: Dict[str, Any]) -> Dict:
        """Create a new provider"""
        import uuid
        provider_id = str(uuid.uuid4())
        
        await self.execute("""
            INSERT INTO providers (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls)
            VALUES (%(provider_id)s, %(name)s, %(specialty)s, %(phone_number)s, %(location)s, %(address)s, %(accepts_teli_calls)s)
        """, {
            "provider_id": provider_id,
            "name": data.get("name"),
            "specialty": data.get("specialty"),
            "phone_number": data.get("phone_number"),
            "location": data.get("location"),
            "address": data.get("address"),
            "accepts_teli_calls": data.get("accepts_teli_calls", True)
        })
        
        return {"provider_id": provider_id, **data}
    
    # ============ APPOINTMENT OPERATIONS ============
    
    async def get_appointments_by_user(
        self, 
        user_id: str, 
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get appointments for a user with optional status filter"""
        
        if status:
            return await self.execute("""
                SELECT a.*, 
                       COALESCE(p.name, 'No Provider') as provider_name, 
                       COALESCE(p.phone_number, '') as provider_phone, 
                       COALESCE(p.specialty, '') as specialty
                FROM appointments a
                LEFT JOIN providers p ON a.provider_id = p.provider_id
                WHERE a.user_id = %(user_id)s AND a.status = %(status)s
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
                LIMIT %(limit)s
            """, {"user_id": user_id, "status": status, "limit": limit})
        else:
            return await self.execute("""
                SELECT a.*, 
                       COALESCE(p.name, 'No Provider') as provider_name, 
                       COALESCE(p.phone_number, '') as provider_phone, 
                       COALESCE(p.specialty, '') as specialty
                FROM appointments a
                LEFT JOIN providers p ON a.provider_id = p.provider_id
                WHERE a.user_id = %(user_id)s
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
                LIMIT %(limit)s
            """, {"user_id": user_id, "limit": limit})
    
    async def get_appointment_by_id(self, appointment_id: str) -> Optional[Dict]:
        """Get single appointment with provider details"""
        result = await self.execute("""
            SELECT a.*, 
                   COALESCE(p.name, 'No Provider') as provider_name, 
                   COALESCE(p.phone_number, '') as provider_phone, 
                   COALESCE(p.specialty, '') as specialty
            FROM appointments a
            LEFT JOIN providers p ON a.provider_id = p.provider_id
            WHERE a.appointment_id = %(appointment_id)s
        """, {"appointment_id": appointment_id})
        return result[0] if result else None
    
    async def create_appointment(self, data: Dict[str, Any]) -> Dict:
        """Create a new appointment"""
        import uuid
        appointment_id = str(uuid.uuid4())
        
        await self.execute("""
            INSERT INTO appointments (
                appointment_id, user_id, provider_id, title, 
                appointment_date, appointment_time, location, 
                status, reminder_enabled, notes
            )
            VALUES (
                %(appointment_id)s, %(user_id)s, %(provider_id)s, %(title)s,
                %(appointment_date)s, %(appointment_time)s, %(location)s,
                %(status)s, %(reminder_enabled)s, %(notes)s
            )
        """, {
            "appointment_id": appointment_id,
            "user_id": data.get("user_id"),
            "provider_id": data.get("provider_id"),
            "title": data.get("title"),
            "appointment_date": data.get("appointment_date"),
            "appointment_time": data.get("appointment_time"),
            "location": data.get("location"),
            "status": data.get("status", "upcoming"),
            "reminder_enabled": data.get("reminder_enabled", True),
            "notes": data.get("notes")
        })
        
        return {"appointment_id": appointment_id, **data}
    
    async def update_appointment(self, appointment_id: str, data: Dict[str, Any]) -> bool:
        """Update an appointment"""
        
        # Build dynamic update query
        set_clauses = []
        params = {"appointment_id": appointment_id}
        
        allowed_fields = ["title", "appointment_date", "appointment_time", "location", 
                         "status", "previous_status", "reminder_enabled", "notes"]
        
        for field in allowed_fields:
            if field in data:
                set_clauses.append(f"{field} = %({field})s")
                params[field] = data[field]
        
        if not set_clauses:
            return False
        
        set_clauses.append("updated_at = CURRENT_TIMESTAMP()")
        
        query = f"UPDATE appointments SET {', '.join(set_clauses)} WHERE appointment_id = %(appointment_id)s"
        await self.execute(query, params)
        return True
    
    async def delete_appointment(self, appointment_id: str) -> bool:
        """Delete an appointment"""
        await self.execute(
            "DELETE FROM appointments WHERE appointment_id = %(appointment_id)s",
            {"appointment_id": appointment_id}
        )
        return True
    
    # ============ APPOINTMENT ACTIONS (Cancel/Reschedule) ============
    
    async def create_appointment_action(self, data: Dict[str, Any]) -> Dict:
        """Create a cancel/reschedule action request"""
        import uuid
        action_id = str(uuid.uuid4())
        
        await self.execute("""
            INSERT INTO appointment_actions (
                action_id, appointment_id, action_type, status,
                requested_new_date, requested_new_time, preferred_call_hour, reason
            )
            VALUES (
                %(action_id)s, %(appointment_id)s, %(action_type)s, %(status)s,
                %(requested_new_date)s, %(requested_new_time)s, %(preferred_call_hour)s, %(reason)s
            )
        """, {
            "action_id": action_id,
            "appointment_id": data.get("appointment_id"),
            "action_type": data.get("action_type"),
            "status": data.get("status", "pending"),
            "requested_new_date": data.get("requested_new_date"),
            "requested_new_time": data.get("requested_new_time"),
            "preferred_call_hour": data.get("preferred_call_hour"),
            "reason": data.get("reason")
        })
        
        return {"action_id": action_id, **data}
    
    async def get_action_by_id(self, action_id: str) -> Optional[Dict]:
        """Get appointment action by ID"""
        result = await self.execute(
            "SELECT * FROM appointment_actions WHERE action_id = %(action_id)s",
            {"action_id": action_id}
        )
        return result[0] if result else None
    
    async def update_action_status(self, action_id: str, status: str) -> bool:
        """Update action status"""
        await self.execute("""
            UPDATE appointment_actions 
            SET status = %(status)s, 
                completed_at = CASE WHEN %(status)s IN ('completed', 'failed') THEN CURRENT_TIMESTAMP() ELSE NULL END
            WHERE action_id = %(action_id)s
        """, {"action_id": action_id, "status": status})
        return True
    
    # ============ TELI CALL OPERATIONS ============
    
    async def create_teli_call(self, data: Dict[str, Any]) -> Dict:
        """Create a Teli AI call record"""
        import uuid
        call_id = data.get("call_id") or str(uuid.uuid4())
        
        await self.execute("""
            INSERT INTO teli_calls (
                call_id, action_id, user_id, provider_id, call_type,
                phone_number_called, status, scheduled_at
            )
            VALUES (
                %(call_id)s, %(action_id)s, %(user_id)s, %(provider_id)s, %(call_type)s,
                %(phone_number_called)s, %(status)s, %(scheduled_at)s
            )
        """, {
            "call_id": call_id,
            "action_id": data.get("action_id"),
            "user_id": data.get("user_id"),
            "provider_id": data.get("provider_id"),
            "call_type": data.get("call_type"),
            "phone_number_called": data.get("phone_number_called"),
            "status": data.get("status", "pending"),
            "scheduled_at": data.get("scheduled_at")
        })
        
        return {"call_id": call_id, **data}
    
    async def get_teli_call_by_id(self, call_id: str) -> Optional[Dict]:
        """Get Teli call by ID"""
        result = await self.execute(
            "SELECT * FROM teli_calls WHERE call_id = %(call_id)s",
            {"call_id": call_id}
        )
        return result[0] if result else None
    
    async def update_teli_call(self, call_id: str, data: Dict[str, Any]) -> bool:
        """Update Teli call record"""
        set_clauses = []
        params = {"call_id": call_id}
        
        allowed_fields = ["status", "duration_seconds", "started_at", "completed_at", "outcome"]
        
        for field in allowed_fields:
            if field in data:
                set_clauses.append(f"{field} = %({field})s")
                params[field] = data[field]
        
        if not set_clauses:
            return False
        
        query = f"UPDATE teli_calls SET {', '.join(set_clauses)} WHERE call_id = %(call_id)s"
        await self.execute(query, params)
        return True
    
    # ============ CALL TRANSCRIPT OPERATIONS ============
    
    async def create_call_transcript(self, data: Dict[str, Any]) -> Dict:
        """Save call transcript"""
        import uuid
        transcript_id = str(uuid.uuid4())
        
        await self.execute("""
            INSERT INTO call_transcripts (transcript_id, call_id, full_transcript, summary, sentiment, extracted_data)
            VALUES (%(transcript_id)s, %(call_id)s, %(full_transcript)s, %(summary)s, %(sentiment)s, %(extracted_data)s)
        """, {
            "transcript_id": transcript_id,
            "call_id": data.get("call_id"),
            "full_transcript": data.get("full_transcript"),
            "summary": data.get("summary"),
            "sentiment": data.get("sentiment"),
            "extracted_data": json.dumps(data.get("extracted_data", {}))
        })
        
        return {"transcript_id": transcript_id, **data}
    
    async def get_transcript_by_call_id(self, call_id: str) -> Optional[Dict]:
        """Get transcript for a call"""
        result = await self.execute(
            "SELECT * FROM call_transcripts WHERE call_id = %(call_id)s",
            {"call_id": call_id}
        )
        return result[0] if result else None
    
    async def get_transcript_messages(self, transcript_id: str) -> List[Dict]:
        """Get individual messages from a transcript"""
        return await self.execute("""
            SELECT * FROM transcript_messages 
            WHERE transcript_id = %(transcript_id)s 
            ORDER BY sequence_number
        """, {"transcript_id": transcript_id})
    
    # ============ AUDIT LOG OPERATIONS ============
    
    async def log_audit(self, entry: Dict[str, Any]) -> bool:
        """Log an audit entry for HIPAA compliance"""
        import uuid
        
        await self.execute("""
            INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, details)
            VALUES (%(log_id)s, %(user_id)s, %(action)s, %(resource_type)s, %(resource_id)s, %(details)s)
        """, {
            "log_id": str(uuid.uuid4()),
            "user_id": entry.get("user_id"),
            "action": entry.get("action"),
            "resource_type": entry.get("resource_type"),
            "resource_id": entry.get("resource_id"),
            "details": json.dumps(entry.get("details", {})),
        })
        return True