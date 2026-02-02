"""
Teli AI Knowledge Base Service
Extract data from Snowflake and create knowledge bases for AI agents
"""

import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

from app.core.config import settings
from app.db.snowflake_client import SnowflakeClient


class TeliKnowledgeBaseService:
    """Service to create and manage Teli AI knowledge bases with Snowflake data"""
    
    def __init__(self):
        self.api_key = settings.TELI_API_KEY
        self.base_url = settings.TELI_API_URL
        self.org_id = settings.TELI_ORG_ID
        self.user_id = settings.TELI_USER_ID
        self.snowflake_client = SnowflakeClient()
    
    async def create_knowledge_base_from_snowflake(
        self,
        kb_name: str,
        query: str,
        title_column: str,
        text_column: str,
        auto_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Create a Teli knowledge base from Snowflake query results
        
        Args:
            kb_name: Name for the knowledge base (max 40 chars)
            query: SQL query to extract data
            title_column: Column name for snippet titles
            text_column: Column name for snippet content
            auto_refresh: Enable auto-refresh (not applicable for text snippets)
        """
        try:
            # Extract data from Snowflake
            print(f"🔍 Extracting data from Snowflake for KB: {kb_name}")
            
            rows = await self.snowflake_client.execute_query(query)
            
            if not rows:
                return {
                    "success": False,
                    "error": "No data returned from Snowflake query",
                    "query": query
                }
            
            # Convert Snowflake data to Teli text snippets format
            texts = []
            for row in rows:
                if title_column in row and text_column in row:
                    title = str(row[title_column])[:100]  # Limit title length
                    text = str(row[text_column])
                    
                    if title and text:
                        texts.append({
                            "title": title,
                            "text": text
                        })
            
            if not texts:
                return {
                    "success": False,
                    "error": f"No valid text snippets found. Check column names: {title_column}, {text_column}",
                    "query": query
                }
            
            # Limit to 50 snippets (Teli limit)
            if len(texts) > 50:
                texts = texts[:50]
                print(f"⚠️  Limited to 50 snippets (Teli limit). Total found: {len(rows)}")
            
            print(f"📝 Creating knowledge base with {len(texts)} text snippets")
            
            # Create Teli knowledge base
            payload = {
                "name": kb_name[:40],  # Teli limit
                "organization_id": self.org_id,
                "user_id": self.user_id,
                "texts": texts,
                "auto_refresh": auto_refresh
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/v1/knowledge-bases",
                    json=payload,
                    headers={
                        "X-API-Key": self.api_key,
                        "Content-Type": "application/json"
                    },
                    timeout=60.0
                )
                
                result = response.json()
                
                if result.get('success'):
                    print(f"✅ Knowledge base created: {result.get('knowledge_base_id')}")
                    return {
                        "success": True,
                        "knowledge_base_id": result.get('knowledge_base_id'),
                        "unique_id": result.get('unique_id'),
                        "name": result.get('name'),
                        "status": result.get('status', 'in_progress'),
                        "total_sources": result.get('total_sources', len(texts)),
                        "message": "Knowledge base created successfully",
                        "texts_added": len(texts),
                        "created_at": datetime.utcnow().isoformat()
                    }
                else:
                    print(f"❌ Knowledge base creation failed: {result}")
                    return {
                        "success": False,
                        "error": result.get('error', 'Unknown error'),
                        "created_at": datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            print(f"❌ Knowledge base creation exception: {e}")
            return {
                "success": False,
                "error": str(e),
                "created_at": datetime.utcnow().isoformat()
            }
    
    async def get_knowledge_base_status(self, kb_id: str) -> Dict[str, Any]:
        """Check the status of a knowledge base"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/v1/knowledge-bases/{kb_id}",
                    headers={
                        "X-API-Key": self.api_key
                    },
                    timeout=30.0
                )
                
                result = response.json()
                
                if result.get('success'):
                    kb = result.get('knowledge_base', {})
                    return {
                        "success": True,
                        "knowledge_base_id": kb.get('knowledge_base_id'),
                        "name": kb.get('knowledge_base_name'),
                        "status": kb.get('status'),
                        "total_sources": kb.get('total_sources'),
                        "source_types": kb.get('source_types', []),
                        "created_at": kb.get('created_at'),
                        "updated_at": kb.get('updated_at')
                    }
                else:
                    return {
                        "success": False,
                        "error": "Knowledge base not found or access denied"
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def create_patient_kb(self) -> Dict[str, Any]:
        """Create a knowledge base with patient information"""
        query = """
        SELECT 
            CONCAT('Patient: ', first_name, ' ', last_name) as title,
            CONCAT(
                'Patient ID: ', patient_id, '\n',
                'Name: ', first_name, ' ', last_name, '\n',
                'Date of Birth: ', date_of_birth, '\n',
                'Phone: ', phone, '\n',
                'Email: ', email, '\n',
                'Emergency Contact: ', emergency_contact_name, ' (', emergency_contact_phone, ')'
            ) as patient_info
        FROM patients 
        WHERE patient_id IS NOT NULL 
        LIMIT 50;
        """
        
        return await self.create_knowledge_base_from_snowflake(
            kb_name="AveloHealth Patient Data",
            query=query,
            title_column="TITLE",
            text_column="PATIENT_INFO"
        )
    
    async def create_appointments_kb(self) -> Dict[str, Any]:
        """Create a knowledge base with appointment information"""
        query = """
        SELECT 
            CONCAT('Appt: ', appointment_date, ' - ', patient_id) as title,
            CONCAT(
                'Appointment ID: ', appointment_id, '\n',
                'Patient ID: ', patient_id, '\n',
                'Date: ', appointment_date, '\n',
                'Time: ', appointment_time, '\n',
                'Provider: ', provider_name, '\n',
                'Type: ', appointment_type, '\n',
                'Status: ', status, '\n',
                'Notes: ', COALESCE(notes, 'No notes')
            ) as appointment_info
        FROM appointments 
        WHERE appointment_id IS NOT NULL 
        ORDER BY appointment_date DESC
        LIMIT 50;
        """
        
        return await self.create_knowledge_base_from_snowflake(
            kb_name="AveloHealth Appointments",
            query=query,
            title_column="TITLE",
            text_column="APPOINTMENT_INFO"
        )
    
    async def create_health_entries_kb(self) -> Dict[str, Any]:
        """Create a knowledge base with health entries"""
        query = """
        SELECT 
            CONCAT('Entry: ', entry_date, ' - ', patient_id) as title,
            CONCAT(
                'Entry ID: ', entry_id, '\n',
                'Patient ID: ', patient_id, '\n',
                'Date: ', entry_date, '\n',
                'Blood Pressure: ', blood_pressure_systolic, '/', blood_pressure_diastolic, '\n',
                'Heart Rate: ', heart_rate, ' bpm\n',
                'Temperature: ', temperature, '°F\n',
                'Weight: ', weight, ' lbs\n',
                'Symptoms: ', COALESCE(symptoms, 'None reported'), '\n',
                'Medications: ', COALESCE(medications, 'None listed')
            ) as health_info
        FROM health_entries 
        WHERE entry_id IS NOT NULL 
        ORDER BY entry_date DESC
        LIMIT 50;
        """
        
        return await self.create_knowledge_base_from_snowflake(
            kb_name="AveloHealth Medical Records",
            query=query,
            title_column="TITLE",
            text_column="HEALTH_INFO"
        )
    
    async def create_comprehensive_kb(self) -> Dict[str, Any]:
        """Create a comprehensive knowledge base with patient, appointment, and health data"""
        query = """
        SELECT 
            CONCAT('Patient Summary: ', p.first_name, ' ', p.last_name) as title,
            CONCAT(
                '=== PATIENT INFORMATION ===\n',
                'Patient ID: ', p.patient_id, '\n',
                'Name: ', p.first_name, ' ', p.last_name, '\n',
                'Date of Birth: ', p.date_of_birth, '\n',
                'Phone: ', p.phone, '\n',
                'Email: ', p.email, '\n',
                'Emergency Contact: ', p.emergency_contact_name, ' (', p.emergency_contact_phone, ')\n\n',
                
                '=== RECENT APPOINTMENTS ===\n',
                CASE 
                    WHEN a.appointment_id IS NOT NULL THEN
                        CONCAT('Last Appointment: ', a.appointment_date, ' at ', a.appointment_time, '\n',
                               'Provider: ', a.provider_name, '\n',
                               'Type: ', a.appointment_type, '\n',
                               'Status: ', a.status, '\n',
                               'Notes: ', COALESCE(a.notes, 'No notes'), '\n\n')
                    ELSE 'No recent appointments\n\n'
                END,
                
                '=== LATEST HEALTH METRICS ===\n',
                CASE 
                    WHEN h.entry_id IS NOT NULL THEN
                        CONCAT('Last Entry: ', h.entry_date, '\n',
                               'Blood Pressure: ', h.blood_pressure_systolic, '/', h.blood_pressure_diastolic, '\n',
                               'Heart Rate: ', h.heart_rate, ' bpm\n',
                               'Temperature: ', h.temperature, '°F\n',
                               'Weight: ', h.weight, ' lbs\n',
                               'Symptoms: ', COALESCE(h.symptoms, 'None reported'), '\n',
                               'Medications: ', COALESCE(h.medications, 'None listed'))
                    ELSE 'No recent health entries'
                END
            ) as comprehensive_info
        FROM patients p
        LEFT JOIN (
            SELECT DISTINCT 
                patient_id,
                FIRST_VALUE(appointment_id) OVER (PARTITION BY patient_id ORDER BY appointment_date DESC) as appointment_id,
                FIRST_VALUE(appointment_date) OVER (PARTITION BY patient_id ORDER BY appointment_date DESC) as appointment_date,
                FIRST_VALUE(appointment_time) OVER (PARTITION BY patient_id ORDER BY appointment_date DESC) as appointment_time,
                FIRST_VALUE(provider_name) OVER (PARTITION BY patient_id ORDER BY appointment_date DESC) as provider_name,
                FIRST_VALUE(appointment_type) OVER (PARTITION BY patient_id ORDER BY appointment_date DESC) as appointment_type,
                FIRST_VALUE(status) OVER (PARTITION BY patient_id ORDER BY appointment_date DESC) as status,
                FIRST_VALUE(notes) OVER (PARTITION BY patient_id ORDER BY appointment_date DESC) as notes
            FROM appointments
        ) a ON p.patient_id = a.patient_id
        LEFT JOIN (
            SELECT DISTINCT
                patient_id,
                FIRST_VALUE(entry_id) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as entry_id,
                FIRST_VALUE(entry_date) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as entry_date,
                FIRST_VALUE(blood_pressure_systolic) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as blood_pressure_systolic,
                FIRST_VALUE(blood_pressure_diastolic) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as blood_pressure_diastolic,
                FIRST_VALUE(heart_rate) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as heart_rate,
                FIRST_VALUE(temperature) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as temperature,
                FIRST_VALUE(weight) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as weight,
                FIRST_VALUE(symptoms) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as symptoms,
                FIRST_VALUE(medications) OVER (PARTITION BY patient_id ORDER BY entry_date DESC) as medications
            FROM health_entries
        ) h ON p.patient_id = h.patient_id
        WHERE p.patient_id IS NOT NULL
        ORDER BY p.patient_id
        LIMIT 25;
        """
        
        return await self.create_knowledge_base_from_snowflake(
            kb_name="AveloHealth Complete Patient DB",
            query=query,
            title_column="TITLE",
            text_column="COMPREHENSIVE_INFO"
        )


# Create singleton instance
knowledge_base_service = TeliKnowledgeBaseService()