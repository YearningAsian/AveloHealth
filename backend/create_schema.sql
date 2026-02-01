-- ============================================================
-- AveloHealth Database Schema
-- Run this FIRST to create all tables
-- ============================================================

USE DATABASE AVELOHEALTH2;
USE SCHEMA PUBLIC;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    account_number VARCHAR(50) UNIQUE,
    date_of_birth DATE,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- ============================================================
-- 2. PROVIDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS providers (
    provider_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    phone_number VARCHAR(20),
    location VARCHAR(255),
    address VARCHAR(500),
    accepts_teli_calls BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- ============================================================
-- 3. APPOINTMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    provider_id VARCHAR(50),
    title VARCHAR(255),
    appointment_date DATE NOT NULL,
    appointment_time TIME,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'upcoming',
    reminder_enabled BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (provider_id) REFERENCES providers(provider_id)
);

-- ============================================================
-- 4. DIARY_ENTRIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS diary_entries (
    entry_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    symptoms TEXT,
    severity VARCHAR(20),
    category VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================================
-- 5. REMINDER_SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reminder_settings (
    reminder_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    appointment_id VARCHAR(50),
    reminder_type VARCHAR(20),
    reminder_time TIMESTAMP,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- ============================================================
-- 6. AI_ANALYSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_analyses (
    analysis_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    entry_id VARCHAR(50),
    analysis_type VARCHAR(50),
    result TEXT,
    confidence_score FLOAT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (entry_id) REFERENCES diary_entries(entry_id)
);

-- ============================================================
-- 7. PATIENT_CALLS TABLE (Teli AI inbound calls)
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_calls (
    call_id VARCHAR(50) PRIMARY KEY,
    patient_name VARCHAR(255),
    patient_age INTEGER,
    phone_number VARCHAR(20),
    patient_location VARCHAR(255),
    symptom_description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- ============================================================
-- 8. TELI_CALLS TABLE (Outbound Teli AI calls)
-- ============================================================
CREATE TABLE IF NOT EXISTS teli_calls (
    call_id VARCHAR(50) PRIMARY KEY,
    appointment_id VARCHAR(50),
    action_type VARCHAR(20),
    phone_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    initiated_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- ============================================================
-- 9. CALL_TRANSCRIPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS call_transcripts (
    transcript_id VARCHAR(50) PRIMARY KEY,
    call_id VARCHAR(50) NOT NULL,
    full_transcript TEXT,
    summary TEXT,
    sentiment VARCHAR(20),
    key_points TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (call_id) REFERENCES teli_calls(call_id)
);

-- ============================================================
-- 10. TRANSCRIPT_MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transcript_messages (
    message_id VARCHAR(50) PRIMARY KEY,
    transcript_id VARCHAR(50) NOT NULL,
    speaker VARCHAR(20),
    message_text TEXT,
    timestamp_offset INTEGER,
    sentiment VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (transcript_id) REFERENCES call_transcripts(transcript_id)
);

-- ============================================================
-- 11. APPOINTMENT_ACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS appointment_actions (
    action_id VARCHAR(50) PRIMARY KEY,
    appointment_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(20),
    reason TEXT,
    new_date DATE,
    new_time TIME,
    status VARCHAR(20) DEFAULT 'pending',
    teli_call_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (teli_call_id) REFERENCES teli_calls(call_id)
);

-- ============================================================
-- 12. AUDIT_LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(50),
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================================
-- Verification: Show all tables
-- ============================================================
SHOW TABLES;
