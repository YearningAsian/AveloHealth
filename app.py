import snowflake.connector
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def send_to_snowflake(name, age, phone, location, symptoms):
    conn = snowflake.connector.connect(
        user=os.getenv('SNOWFLAKE_USER'),
        password=os.getenv('SNOWFLAKE_PASSWORD'),
        account=os.getenv('SNOWFLAKE_ACCOUNT'),
        warehouse='COMPUTE_WH',
        database='AVELOHEALTH',
        schema='PUBLIC'
    )
    cursor = conn.cursor()
    sql = "INSERT INTO AVELOHEALTH.PUBLIC.PATIENT_CALLS (CALL_ID, PATIENT_NAME, PATIENT_AGE, PHONE_NUMBER, PATIENT_LOCATION, SYMPTOM_DESCRIPTION) VALUES (%s, %s, %s, %s, %s, %s)"
    call_id = "call_" + str(hash(phone))
    try:
        cursor.execute(sql, (call_id, name, age, phone, location, symptoms))
        conn.commit()
        print(f"Successfully checked in: {name}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

@app.get("/")
def read_root():
    return {"status": "AveloHealth API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Commented out test calls - only run these manually when needed
# send_to_snowflake("Gabe G", 20, "517-555-0199", "East Lansing, Michigan", "High fever and a sore throat.")
# send_to_snowflake("Jake H", 31, "210-978-1101", "Los Angeles, California", "Red bumps on neck. Feels chilly.")