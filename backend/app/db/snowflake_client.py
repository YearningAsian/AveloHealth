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