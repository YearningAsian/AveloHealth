-- ============================================================
-- AveloHealth Seed Data
-- Run this in Snowflake after creating the schema
-- Uses MERGE to prevent duplicates
-- ============================================================

-- Set database and schema context
USE DATABASE AVELOHEALTH2;
USE SCHEMA PUBLIC;

-- ============================================================
-- 1. USERS (Test accounts)
-- Password for all test users: "Test123!" 
-- Hash generated with bcrypt
-- ============================================================

MERGE INTO users AS target
USING (SELECT 'user_001' AS user_id, 'Sarah Johnson' AS name, 'sarah@example.com' AS email, '+15551234567' AS phone_number, 'AVL123456789' AS account_number, '1985-06-15' AS date_of_birth, '$2b$12$Zittarog/6PHfR4x3KNlbe6rLOXS5.IxiG34tlPrVaIqXzAcctACW' AS password_hash, 'patient' AS role) AS source
ON target.user_id = source.user_id
WHEN NOT MATCHED THEN INSERT (user_id, name, email, phone_number, account_number, date_of_birth, password_hash, role) VALUES (source.user_id, source.name, source.email, source.phone_number, source.account_number, source.date_of_birth, source.password_hash, source.role);

MERGE INTO users AS target
USING (SELECT 'user_002' AS user_id, 'Michael Chen' AS name, 'michael@example.com' AS email, '+15559876543' AS phone_number, 'AVL987654321' AS account_number, '1990-03-22' AS date_of_birth, '$2b$12$Zittarog/6PHfR4x3KNlbe6rLOXS5.IxiG34tlPrVaIqXzAcctACW' AS password_hash, 'patient' AS role) AS source
ON target.user_id = source.user_id
WHEN NOT MATCHED THEN INSERT (user_id, name, email, phone_number, account_number, date_of_birth, password_hash, role) VALUES (source.user_id, source.name, source.email, source.phone_number, source.account_number, source.date_of_birth, source.password_hash, source.role);

MERGE INTO users AS target
USING (SELECT 'user_003' AS user_id, 'Emily Rodriguez' AS name, 'emily@example.com' AS email, '+15555551234' AS phone_number, 'AVL555123456' AS account_number, '1978-11-08' AS date_of_birth, '$2b$12$Zittarog/6PHfR4x3KNlbe6rLOXS5.IxiG34tlPrVaIqXzAcctACW' AS password_hash, 'patient' AS role) AS source
ON target.user_id = source.user_id
WHEN NOT MATCHED THEN INSERT (user_id, name, email, phone_number, account_number, date_of_birth, password_hash, role) VALUES (source.user_id, source.name, source.email, source.phone_number, source.account_number, source.date_of_birth, source.password_hash, source.role);

MERGE INTO users AS target
USING (SELECT 'user_004' AS user_id, 'Admin User' AS name, 'admin@avelohealth.com' AS email, '+15550001111' AS phone_number, 'AVLADMIN001' AS account_number, '1980-01-01' AS date_of_birth, '$2b$12$Zittarog/6PHfR4x3KNlbe6rLOXS5.IxiG34tlPrVaIqXzAcctACW' AS password_hash, 'admin' AS role) AS source
ON target.user_id = source.user_id
WHEN NOT MATCHED THEN INSERT (user_id, name, email, phone_number, account_number, date_of_birth, password_hash, role) VALUES (source.user_id, source.name, source.email, source.phone_number, source.account_number, source.date_of_birth, source.password_hash, source.role);

MERGE INTO users AS target
USING (SELECT 'user_005' AS user_id, 'Dr. James Wilson' AS name, 'drwilson@clinic.com' AS email, '+15552223333' AS phone_number, 'AVLPROV001' AS account_number, '1975-05-20' AS date_of_birth, '$2b$12$Zittarog/6PHfR4x3KNlbe6rLOXS5.IxiG34tlPrVaIqXzAcctACW' AS password_hash, 'provider' AS role) AS source
ON target.user_id = source.user_id
WHEN NOT MATCHED THEN INSERT (user_id, name, email, phone_number, account_number, date_of_birth, password_hash, role) VALUES (source.user_id, source.name, source.email, source.phone_number, source.account_number, source.date_of_birth, source.password_hash, source.role);

-- ============================================================
-- 2. PROVIDERS (Healthcare providers)
-- ============================================================

MERGE INTO providers AS target
USING (SELECT 'prov_001' AS provider_id, 'Dr. Amanda Foster' AS name, 'Family Medicine' AS specialty, '+15551001001' AS phone_number, 'Downtown Medical Center' AS location, '123 Health Street, Suite 100' AS address, TRUE AS accepts_teli_calls) AS source
ON target.provider_id = source.provider_id
WHEN NOT MATCHED THEN INSERT (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls) VALUES (source.provider_id, source.name, source.specialty, source.phone_number, source.location, source.address, source.accepts_teli_calls);

MERGE INTO providers AS target
USING (SELECT 'prov_002' AS provider_id, 'Dr. Robert Kim' AS name, 'Cardiology' AS specialty, '+15551002002' AS phone_number, 'Heart Health Clinic' AS location, '456 Cardiac Ave, Building B' AS address, TRUE AS accepts_teli_calls) AS source
ON target.provider_id = source.provider_id
WHEN NOT MATCHED THEN INSERT (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls) VALUES (source.provider_id, source.name, source.specialty, source.phone_number, source.location, source.address, source.accepts_teli_calls);

MERGE INTO providers AS target
USING (SELECT 'prov_003' AS provider_id, 'Dr. Lisa Patel' AS name, 'Dermatology' AS specialty, '+15551003003' AS phone_number, 'Skin Care Specialists' AS location, '789 Wellness Blvd' AS address, TRUE AS accepts_teli_calls) AS source
ON target.provider_id = source.provider_id
WHEN NOT MATCHED THEN INSERT (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls) VALUES (source.provider_id, source.name, source.specialty, source.phone_number, source.location, source.address, source.accepts_teli_calls);

MERGE INTO providers AS target
USING (SELECT 'prov_004' AS provider_id, 'Dr. David Martinez' AS name, 'Orthopedics' AS specialty, '+15551004004' AS phone_number, 'Joint & Spine Center' AS location, '321 Bone Way, Floor 3' AS address, TRUE AS accepts_teli_calls) AS source
ON target.provider_id = source.provider_id
WHEN NOT MATCHED THEN INSERT (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls) VALUES (source.provider_id, source.name, source.specialty, source.phone_number, source.location, source.address, source.accepts_teli_calls);

MERGE INTO providers AS target
USING (SELECT 'prov_005' AS provider_id, 'Dr. Jennifer Lee' AS name, 'Neurology' AS specialty, '+15551005005' AS phone_number, 'Brain & Nerve Institute' AS location, '555 Neural Dr' AS address, TRUE AS accepts_teli_calls) AS source
ON target.provider_id = source.provider_id
WHEN NOT MATCHED THEN INSERT (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls) VALUES (source.provider_id, source.name, source.specialty, source.phone_number, source.location, source.address, source.accepts_teli_calls);

MERGE INTO providers AS target
USING (SELECT 'prov_006' AS provider_id, 'Dr. William Brown' AS name, 'Gastroenterology' AS specialty, '+15551006006' AS phone_number, 'Digestive Health Center' AS location, '777 GI Lane' AS address, TRUE AS accepts_teli_calls) AS source
ON target.provider_id = source.provider_id
WHEN NOT MATCHED THEN INSERT (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls) VALUES (source.provider_id, source.name, source.specialty, source.phone_number, source.location, source.address, source.accepts_teli_calls);

MERGE INTO providers AS target
USING (SELECT 'prov_007' AS provider_id, 'Dr. Sarah Thompson' AS name, 'Pulmonology' AS specialty, '+15551007007' AS phone_number, 'Respiratory Care Clinic' AS location, '888 Breath Ave' AS address, FALSE AS accepts_teli_calls) AS source
ON target.provider_id = source.provider_id
WHEN NOT MATCHED THEN INSERT (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls) VALUES (source.provider_id, source.name, source.specialty, source.phone_number, source.location, source.address, source.accepts_teli_calls);

MERGE INTO providers AS target
USING (SELECT 'prov_008' AS provider_id, 'Dr. Michael Davis' AS name, 'Psychiatry' AS specialty, '+15551008008' AS phone_number, 'Mental Wellness Center' AS location, '999 Mind Street' AS address, TRUE AS accepts_teli_calls) AS source
ON target.provider_id = source.provider_id
WHEN NOT MATCHED THEN INSERT (provider_id, name, specialty, phone_number, location, address, accepts_teli_calls) VALUES (source.provider_id, source.name, source.specialty, source.phone_number, source.location, source.address, source.accepts_teli_calls);

-- ============================================================
-- 3. APPOINTMENTS (Sample appointments for users)
-- ============================================================

MERGE INTO appointments AS target
USING (SELECT 'appt_001' AS appointment_id, 'user_001' AS user_id, 'prov_001' AS provider_id, 'Annual Physical' AS title, '2026-02-15' AS appointment_date, '09:00:00' AS appointment_time, 'Downtown Medical Center' AS location, 'upcoming' AS status, TRUE AS reminder_enabled, 'Fasting required for blood work' AS notes) AS source
ON target.appointment_id = source.appointment_id
WHEN NOT MATCHED THEN INSERT (appointment_id, user_id, provider_id, title, appointment_date, appointment_time, location, status, reminder_enabled, notes) VALUES (source.appointment_id, source.user_id, source.provider_id, source.title, source.appointment_date, source.appointment_time, source.location, source.status, source.reminder_enabled, source.notes);

MERGE INTO appointments AS target
USING (SELECT 'appt_002' AS appointment_id, 'user_001' AS user_id, 'prov_002' AS provider_id, 'Cardiology Follow-up' AS title, '2026-02-20' AS appointment_date, '14:30:00' AS appointment_time, 'Heart Health Clinic' AS location, 'upcoming' AS status, TRUE AS reminder_enabled, 'Bring previous EKG results' AS notes) AS source
ON target.appointment_id = source.appointment_id
WHEN NOT MATCHED THEN INSERT (appointment_id, user_id, provider_id, title, appointment_date, appointment_time, location, status, reminder_enabled, notes) VALUES (source.appointment_id, source.user_id, source.provider_id, source.title, source.appointment_date, source.appointment_time, source.location, source.status, source.reminder_enabled, source.notes);

MERGE INTO appointments AS target
USING (SELECT 'appt_003' AS appointment_id, 'user_001' AS user_id, 'prov_003' AS provider_id, 'Skin Check' AS title, '2026-01-10' AS appointment_date, '11:00:00' AS appointment_time, 'Skin Care Specialists' AS location, 'completed' AS status, FALSE AS reminder_enabled, NULL AS notes) AS source
ON target.appointment_id = source.appointment_id
WHEN NOT MATCHED THEN INSERT (appointment_id, user_id, provider_id, title, appointment_date, appointment_time, location, status, reminder_enabled, notes) VALUES (source.appointment_id, source.user_id, source.provider_id, source.title, source.appointment_date, source.appointment_time, source.location, source.status, source.reminder_enabled, source.notes);

MERGE INTO appointments AS target
USING (SELECT 'appt_004' AS appointment_id, 'user_002' AS user_id, 'prov_004' AS provider_id, 'Knee Consultation' AS title, '2026-02-18' AS appointment_date, '10:30:00' AS appointment_time, 'Joint & Spine Center' AS location, 'upcoming' AS status, TRUE AS reminder_enabled, 'X-rays on file' AS notes) AS source
ON target.appointment_id = source.appointment_id
WHEN NOT MATCHED THEN INSERT (appointment_id, user_id, provider_id, title, appointment_date, appointment_time, location, status, reminder_enabled, notes) VALUES (source.appointment_id, source.user_id, source.provider_id, source.title, source.appointment_date, source.appointment_time, source.location, source.status, source.reminder_enabled, source.notes);

MERGE INTO appointments AS target
USING (SELECT 'appt_005' AS appointment_id, 'user_002' AS user_id, 'prov_001' AS provider_id, 'General Checkup' AS title, '2026-03-05' AS appointment_date, '15:00:00' AS appointment_time, 'Downtown Medical Center' AS location, 'upcoming' AS status, TRUE AS reminder_enabled, NULL AS notes) AS source
ON target.appointment_id = source.appointment_id
WHEN NOT MATCHED THEN INSERT (appointment_id, user_id, provider_id, title, appointment_date, appointment_time, location, status, reminder_enabled, notes) VALUES (source.appointment_id, source.user_id, source.provider_id, source.title, source.appointment_date, source.appointment_time, source.location, source.status, source.reminder_enabled, source.notes);

MERGE INTO appointments AS target
USING (SELECT 'appt_006' AS appointment_id, 'user_003' AS user_id, 'prov_005' AS provider_id, 'Migraine Consultation' AS title, '2026-02-12' AS appointment_date, '13:00:00' AS appointment_time, 'Brain & Nerve Institute' AS location, 'upcoming' AS status, TRUE AS reminder_enabled, 'Headache diary attached' AS notes) AS source
ON target.appointment_id = source.appointment_id
WHEN NOT MATCHED THEN INSERT (appointment_id, user_id, provider_id, title, appointment_date, appointment_time, location, status, reminder_enabled, notes) VALUES (source.appointment_id, source.user_id, source.provider_id, source.title, source.appointment_date, source.appointment_time, source.location, source.status, source.reminder_enabled, source.notes);

MERGE INTO appointments AS target
USING (SELECT 'appt_007' AS appointment_id, 'user_003' AS user_id, 'prov_006' AS provider_id, 'GI Follow-up' AS title, '2026-01-25' AS appointment_date, '16:00:00' AS appointment_time, 'Digestive Health Center' AS location, 'cancelled' AS status, FALSE AS reminder_enabled, 'Patient requested cancellation' AS notes) AS source
ON target.appointment_id = source.appointment_id
WHEN NOT MATCHED THEN INSERT (appointment_id, user_id, provider_id, title, appointment_date, appointment_time, location, status, reminder_enabled, notes) VALUES (source.appointment_id, source.user_id, source.provider_id, source.title, source.appointment_date, source.appointment_time, source.location, source.status, source.reminder_enabled, source.notes);

MERGE INTO appointments AS target
USING (SELECT 'appt_008' AS appointment_id, 'user_003' AS user_id, 'prov_008' AS provider_id, 'Mental Health Check' AS title, '2026-02-28' AS appointment_date, '09:30:00' AS appointment_time, 'Mental Wellness Center' AS location, 'upcoming' AS status, TRUE AS reminder_enabled, NULL AS notes) AS source
ON target.appointment_id = source.appointment_id
WHEN NOT MATCHED THEN INSERT (appointment_id, user_id, provider_id, title, appointment_date, appointment_time, location, status, reminder_enabled, notes) VALUES (source.appointment_id, source.user_id, source.provider_id, source.title, source.appointment_date, source.appointment_time, source.location, source.status, source.reminder_enabled, source.notes);

-- ============================================================
-- 4. DIARY_ENTRIES (Health diary entries for patients)
-- ============================================================

MERGE INTO diary_entries AS target
USING (SELECT 'entry_001' AS entry_id, 'user_001' AS user_id, '2026-01-28' AS entry_date, 'Mild headache and fatigue' AS symptoms, 'low' AS severity, 'General' AS category, 'Started after long work day' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_002' AS entry_id, 'user_001' AS user_id, '2026-01-25' AS entry_date, 'Chest tightness during exercise' AS symptoms, 'medium' AS severity, 'Cardiovascular' AS category, 'Lasted about 10 minutes, subsided with rest' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_003' AS entry_id, 'user_001' AS user_id, '2026-01-22' AS entry_date, 'Back pain, lower region' AS symptoms, 'medium' AS severity, 'Musculoskeletal' AS category, 'Pain level 5/10' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_004' AS entry_id, 'user_001' AS user_id, '2026-01-20' AS entry_date, 'Mild nausea after meals' AS symptoms, 'low' AS severity, 'Digestive' AS category, NULL AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_005' AS entry_id, 'user_001' AS user_id, '2026-01-18' AS entry_date, 'Severe migraine with light sensitivity' AS symptoms, 'high' AS severity, 'Neurological' AS category, 'Took medication, rested in dark room' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_006' AS entry_id, 'user_001' AS user_id, '2026-01-15' AS entry_date, 'Shortness of breath' AS symptoms, 'medium' AS severity, 'Respiratory' AS category, 'Occurred while climbing stairs' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_007' AS entry_id, 'user_001' AS user_id, '2026-01-12' AS entry_date, 'Skin rash on arms' AS symptoms, 'low' AS severity, 'Dermatological' AS category, 'Possibly allergic reaction' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_008' AS entry_id, 'user_001' AS user_id, '2026-01-10' AS entry_date, 'Joint stiffness in morning' AS symptoms, 'medium' AS severity, 'Musculoskeletal' AS category, 'Lasted about 30 minutes' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_009' AS entry_id, 'user_001' AS user_id, '2026-01-08' AS entry_date, 'Fatigue and weakness' AS symptoms, 'medium' AS severity, 'General' AS category, 'Despite adequate sleep' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_010' AS entry_id, 'user_001' AS user_id, '2026-01-05' AS entry_date, 'Heart palpitations' AS symptoms, 'high' AS severity, 'Cardiovascular' AS category, 'Episodes lasting 2-3 minutes' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_011' AS entry_id, 'user_002' AS user_id, '2026-01-30' AS entry_date, 'Knee pain when walking' AS symptoms, 'medium' AS severity, 'Musculoskeletal' AS category, 'Right knee, especially on stairs' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_012' AS entry_id, 'user_002' AS user_id, '2026-01-27' AS entry_date, 'Mild cold symptoms' AS symptoms, 'low' AS severity, 'Respiratory' AS category, 'Runny nose, slight cough' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_013' AS entry_id, 'user_002' AS user_id, '2026-01-24' AS entry_date, 'Stomach discomfort' AS symptoms, 'low' AS severity, 'Digestive' AS category, 'After spicy food' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_014' AS entry_id, 'user_002' AS user_id, '2026-01-21' AS entry_date, 'Tension headache' AS symptoms, 'medium' AS severity, 'Neurological' AS category, 'Stress-related' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_015' AS entry_id, 'user_002' AS user_id, '2026-01-18' AS entry_date, 'Lower back pain' AS symptoms, 'high' AS severity, 'Musculoskeletal' AS category, 'Difficulty bending' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_016' AS entry_id, 'user_003' AS user_id, '2026-01-29' AS entry_date, 'Severe migraine' AS symptoms, 'high' AS severity, 'Neurological' AS category, 'Third episode this month' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_017' AS entry_id, 'user_003' AS user_id, '2026-01-26' AS entry_date, 'Bloating and gas' AS symptoms, 'medium' AS severity, 'Digestive' AS category, 'After meals' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_018' AS entry_id, 'user_003' AS user_id, '2026-01-23' AS entry_date, 'Anxiety symptoms' AS symptoms, 'medium' AS severity, 'Neurological' AS category, 'Racing thoughts, difficulty sleeping' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_019' AS entry_id, 'user_003' AS user_id, '2026-01-20' AS entry_date, 'Acid reflux' AS symptoms, 'medium' AS severity, 'Digestive' AS category, 'Worse at night' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

MERGE INTO diary_entries AS target
USING (SELECT 'entry_020' AS entry_id, 'user_003' AS user_id, '2026-01-17' AS entry_date, 'Dizziness' AS symptoms, 'medium' AS severity, 'Neurological' AS category, 'When standing up quickly' AS notes) AS source
ON target.entry_id = source.entry_id
WHEN NOT MATCHED THEN INSERT (entry_id, user_id, entry_date, symptoms, severity, category, notes) VALUES (source.entry_id, source.user_id, source.entry_date, source.symptoms, source.severity, source.category, source.notes);

-- ============================================================
-- 5. REMINDER_SETTINGS (User notification preferences)
-- Using UUID format for reminder_id
-- ============================================================

MERGE INTO reminder_settings AS target
USING (SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567801' AS reminder_id, 'user_001' AS user_id, 'appt_001' AS appointment_id, 'sms' AS reminder_type, '2026-02-14 09:00:00' AS reminder_time, TRUE AS is_enabled) AS source
ON target.reminder_id = source.reminder_id
WHEN NOT MATCHED THEN INSERT (reminder_id, user_id, appointment_id, reminder_type, reminder_time, is_enabled) VALUES (source.reminder_id, source.user_id, source.appointment_id, source.reminder_type, source.reminder_time, source.is_enabled);

MERGE INTO reminder_settings AS target
USING (SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567802' AS reminder_id, 'user_001' AS user_id, 'appt_001' AS appointment_id, 'email' AS reminder_type, '2026-02-13 09:00:00' AS reminder_time, TRUE AS is_enabled) AS source
ON target.reminder_id = source.reminder_id
WHEN NOT MATCHED THEN INSERT (reminder_id, user_id, appointment_id, reminder_type, reminder_time, is_enabled) VALUES (source.reminder_id, source.user_id, source.appointment_id, source.reminder_type, source.reminder_time, source.is_enabled);

MERGE INTO reminder_settings AS target
USING (SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567803' AS reminder_id, 'user_001' AS user_id, 'appt_002' AS appointment_id, 'sms' AS reminder_type, '2026-02-19 14:30:00' AS reminder_time, TRUE AS is_enabled) AS source
ON target.reminder_id = source.reminder_id
WHEN NOT MATCHED THEN INSERT (reminder_id, user_id, appointment_id, reminder_type, reminder_time, is_enabled) VALUES (source.reminder_id, source.user_id, source.appointment_id, source.reminder_type, source.reminder_time, source.is_enabled);

MERGE INTO reminder_settings AS target
USING (SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567804' AS reminder_id, 'user_002' AS user_id, 'appt_004' AS appointment_id, 'sms' AS reminder_type, '2026-02-17 10:30:00' AS reminder_time, TRUE AS is_enabled) AS source
ON target.reminder_id = source.reminder_id
WHEN NOT MATCHED THEN INSERT (reminder_id, user_id, appointment_id, reminder_type, reminder_time, is_enabled) VALUES (source.reminder_id, source.user_id, source.appointment_id, source.reminder_type, source.reminder_time, source.is_enabled);

MERGE INTO reminder_settings AS target
USING (SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567805' AS reminder_id, 'user_003' AS user_id, 'appt_006' AS appointment_id, 'sms' AS reminder_type, '2026-02-11 13:00:00' AS reminder_time, TRUE AS is_enabled) AS source
ON target.reminder_id = source.reminder_id
WHEN NOT MATCHED THEN INSERT (reminder_id, user_id, appointment_id, reminder_type, reminder_time, is_enabled) VALUES (source.reminder_id, source.user_id, source.appointment_id, source.reminder_type, source.reminder_time, source.is_enabled);

-- ============================================================
-- 6. AI_ANALYSES (Sample AI analysis results)
-- ============================================================

MERGE INTO ai_analyses AS target
USING (SELECT 'ai_001' AS analysis_id, 'user_001' AS user_id, 'entry_005' AS entry_id, 'symptom_analysis' AS analysis_type, 'Migraine with aura - common triggers include stress, bright lights, and certain foods' AS result, 0.85 AS confidence_score, '["Track food intake", "Maintain regular sleep schedule", "Consider keeping a migraine diary", "Consult neurologist if frequency increases"]' AS recommendations) AS source
ON target.analysis_id = source.analysis_id
WHEN NOT MATCHED THEN INSERT (analysis_id, user_id, entry_id, analysis_type, result, confidence_score, recommendations) VALUES (source.analysis_id, source.user_id, source.entry_id, source.analysis_type, source.result, source.confidence_score, source.recommendations);

MERGE INTO ai_analyses AS target
USING (SELECT 'ai_002' AS analysis_id, 'user_001' AS user_id, 'entry_010' AS entry_id, 'symptom_analysis' AS analysis_type, 'Possible cardiac arrhythmia - palpitations warrant medical evaluation' AS result, 0.72 AS confidence_score, '["Schedule cardiology appointment", "Monitor frequency and duration", "Avoid caffeine and alcohol", "Track triggers"]' AS recommendations) AS source
ON target.analysis_id = source.analysis_id
WHEN NOT MATCHED THEN INSERT (analysis_id, user_id, entry_id, analysis_type, result, confidence_score, recommendations) VALUES (source.analysis_id, source.user_id, source.entry_id, source.analysis_type, source.result, source.confidence_score, source.recommendations);

MERGE INTO ai_analyses AS target
USING (SELECT 'ai_003' AS analysis_id, 'user_002' AS user_id, 'entry_015' AS entry_id, 'symptom_analysis' AS analysis_type, 'Possible lumbar strain or disc issue' AS result, 0.78 AS confidence_score, '["Apply ice/heat therapy", "Gentle stretching exercises", "Avoid heavy lifting", "Consider physical therapy evaluation"]' AS recommendations) AS source
ON target.analysis_id = source.analysis_id
WHEN NOT MATCHED THEN INSERT (analysis_id, user_id, entry_id, analysis_type, result, confidence_score, recommendations) VALUES (source.analysis_id, source.user_id, source.entry_id, source.analysis_type, source.result, source.confidence_score, source.recommendations);

MERGE INTO ai_analyses AS target
USING (SELECT 'ai_004' AS analysis_id, 'user_003' AS user_id, 'entry_016' AS entry_id, 'symptom_analysis' AS analysis_type, 'Chronic migraine pattern detected - frequency suggests need for preventive treatment' AS result, 0.90 AS confidence_score, '["Discuss preventive medications with neurologist", "Identify and avoid triggers", "Consider botox treatment", "Keep detailed headache log"]' AS recommendations) AS source
ON target.analysis_id = source.analysis_id
WHEN NOT MATCHED THEN INSERT (analysis_id, user_id, entry_id, analysis_type, result, confidence_score, recommendations) VALUES (source.analysis_id, source.user_id, source.entry_id, source.analysis_type, source.result, source.confidence_score, source.recommendations);

-- ============================================================
-- 7. PATIENT_CALLS (Teli AI inbound call records)
-- ============================================================

MERGE INTO patient_calls AS target
USING (SELECT 'call_001' AS call_id, 'John Smith' AS patient_name, 45 AS patient_age, '+15557771234' AS phone_number, 'Chicago, IL' AS patient_location, 'Experiencing chest pain and shortness of breath for the past hour' AS symptom_description) AS source
ON target.call_id = source.call_id
WHEN NOT MATCHED THEN INSERT (call_id, patient_name, patient_age, phone_number, patient_location, symptom_description) VALUES (source.call_id, source.patient_name, source.patient_age, source.phone_number, source.patient_location, source.symptom_description);

MERGE INTO patient_calls AS target
USING (SELECT 'call_002' AS call_id, 'Maria Garcia' AS patient_name, 32 AS patient_age, '+15557775678' AS phone_number, 'Houston, TX' AS patient_location, 'Severe abdominal pain, started yesterday, getting worse' AS symptom_description) AS source
ON target.call_id = source.call_id
WHEN NOT MATCHED THEN INSERT (call_id, patient_name, patient_age, phone_number, patient_location, symptom_description) VALUES (source.call_id, source.patient_name, source.patient_age, source.phone_number, source.patient_location, source.symptom_description);

MERGE INTO patient_calls AS target
USING (SELECT 'call_003' AS call_id, 'David Wilson' AS patient_name, 58 AS patient_age, '+15557779012' AS phone_number, 'Phoenix, AZ' AS patient_location, 'Persistent cough for 2 weeks, some blood in mucus' AS symptom_description) AS source
ON target.call_id = source.call_id
WHEN NOT MATCHED THEN INSERT (call_id, patient_name, patient_age, phone_number, patient_location, symptom_description) VALUES (source.call_id, source.patient_name, source.patient_age, source.phone_number, source.patient_location, source.symptom_description);

MERGE INTO patient_calls AS target
USING (SELECT 'call_004' AS call_id, 'Linda Brown' AS patient_name, 67 AS patient_age, '+15557773456' AS phone_number, 'Seattle, WA' AS patient_location, 'Sudden dizziness and confusion, feels weak' AS symptom_description) AS source
ON target.call_id = source.call_id
WHEN NOT MATCHED THEN INSERT (call_id, patient_name, patient_age, phone_number, patient_location, symptom_description) VALUES (source.call_id, source.patient_name, source.patient_age, source.phone_number, source.patient_location, source.symptom_description);

MERGE INTO patient_calls AS target
USING (SELECT 'call_005' AS call_id, 'James Taylor' AS patient_name, 28 AS patient_age, '+15557777890' AS phone_number, 'Denver, CO' AS patient_location, 'Allergic reaction - hives spreading, mild throat tightness' AS symptom_description) AS source
ON target.call_id = source.call_id
WHEN NOT MATCHED THEN INSERT (call_id, patient_name, patient_age, phone_number, patient_location, symptom_description) VALUES (source.call_id, source.patient_name, source.patient_age, source.phone_number, source.patient_location, source.symptom_description);

-- ============================================================
-- 8. TELI_CALLS (Outbound Teli AI calls for appointments)
-- ============================================================

MERGE INTO teli_calls AS target
USING (SELECT 'teli_001' AS call_id, 'appt_007' AS appointment_id, 'cancel' AS action_type, '+15555551234' AS phone_number, 'completed' AS status, '2026-01-24 10:00:00'::TIMESTAMP AS initiated_at) AS source
ON target.call_id = source.call_id
WHEN NOT MATCHED THEN INSERT (call_id, appointment_id, action_type, phone_number, status, initiated_at) VALUES (source.call_id, source.appointment_id, source.action_type, source.phone_number, source.status, source.initiated_at);

MERGE INTO teli_calls AS target
USING (SELECT 'teli_002' AS call_id, 'appt_003' AS appointment_id, 'reschedule' AS action_type, '+15551234567' AS phone_number, 'completed' AS status, '2026-01-08 14:30:00'::TIMESTAMP AS initiated_at) AS source
ON target.call_id = source.call_id
WHEN NOT MATCHED THEN INSERT (call_id, appointment_id, action_type, phone_number, status, initiated_at) VALUES (source.call_id, source.appointment_id, source.action_type, source.phone_number, source.status, source.initiated_at);

-- ============================================================
-- 9. CALL_TRANSCRIPTS (Teli AI call transcripts)
-- ============================================================

MERGE INTO call_transcripts AS target
USING (SELECT 'trans_001' AS transcript_id, 'teli_001' AS call_id, 'AI: Hello, I am calling on behalf of Emily Rodriguez regarding her appointment with Dr. William Brown scheduled for January 25th. Emily has requested to cancel this appointment. Receptionist: I understand. Let me check the system... Yes, I can see the appointment. I will cancel it now. AI: Thank you. Is there anything else Emily should know? Receptionist: We recommend she reschedule within the next 2 weeks if she still needs the appointment. AI: I will relay that message. Thank you for your help. Goodbye.' AS full_transcript, 'Appointment successfully cancelled. Receptionist recommends rescheduling within 2 weeks.' AS summary, 'positive' AS sentiment, '["Appointment cancelled", "Rescheduling recommended within 2 weeks"]' AS key_points) AS source
ON target.transcript_id = source.transcript_id
WHEN NOT MATCHED THEN INSERT (transcript_id, call_id, full_transcript, summary, sentiment, key_points) VALUES (source.transcript_id, source.call_id, source.full_transcript, source.summary, source.sentiment, source.key_points);

MERGE INTO call_transcripts AS target
USING (SELECT 'trans_002' AS transcript_id, 'teli_002' AS call_id, 'AI: Hello, I am calling on behalf of Sarah Johnson to reschedule her dermatology appointment originally on January 10th. Receptionist: Sure, let me pull up her file. What date works better for Sarah? AI: She is available any afternoon next week. Receptionist: How about Tuesday the 14th at 2 PM? AI: That works perfectly. Please confirm the rescheduled appointment. Receptionist: Confirmed - Sarah Johnson, January 14th at 2 PM with Dr. Patel. AI: Thank you very much. Goodbye.' AS full_transcript, 'Appointment successfully rescheduled from January 10th to January 14th at 2 PM.' AS summary, 'positive' AS sentiment, '["Original date: January 10th", "New date: January 14th 2 PM", "Provider: Dr. Patel"]' AS key_points) AS source
ON target.transcript_id = source.transcript_id
WHEN NOT MATCHED THEN INSERT (transcript_id, call_id, full_transcript, summary, sentiment, key_points) VALUES (source.transcript_id, source.call_id, source.full_transcript, source.summary, source.sentiment, source.key_points);

-- ============================================================
-- 10. TRANSCRIPT_MESSAGES (Individual messages from transcripts)
-- ============================================================

MERGE INTO transcript_messages AS target
USING (SELECT 'msg_00000001' AS message_id, 'trans_001' AS transcript_id, 'ai' AS speaker, 'Hello, I am calling on behalf of Emily Rodriguez regarding her appointment with Dr. William Brown scheduled for January 25th. Emily has requested to cancel this appointment.' AS message_text, 0 AS timestamp_offset, 'neutral' AS sentiment) AS source
ON target.message_id = source.message_id
WHEN NOT MATCHED THEN INSERT (message_id, transcript_id, speaker, message_text, timestamp_offset, sentiment) VALUES (source.message_id, source.transcript_id, source.speaker, source.message_text, source.timestamp_offset, source.sentiment);

MERGE INTO transcript_messages AS target
USING (SELECT 'msg_00000002' AS message_id, 'trans_001' AS transcript_id, 'human' AS speaker, 'I understand. Let me check the system... Yes, I can see the appointment. I will cancel it now.' AS message_text, 15 AS timestamp_offset, 'positive' AS sentiment) AS source
ON target.message_id = source.message_id
WHEN NOT MATCHED THEN INSERT (message_id, transcript_id, speaker, message_text, timestamp_offset, sentiment) VALUES (source.message_id, source.transcript_id, source.speaker, source.message_text, source.timestamp_offset, source.sentiment);

MERGE INTO transcript_messages AS target
USING (SELECT 'msg_00000003' AS message_id, 'trans_001' AS transcript_id, 'ai' AS speaker, 'Thank you. Is there anything else Emily should know?' AS message_text, 35 AS timestamp_offset, 'neutral' AS sentiment) AS source
ON target.message_id = source.message_id
WHEN NOT MATCHED THEN INSERT (message_id, transcript_id, speaker, message_text, timestamp_offset, sentiment) VALUES (source.message_id, source.transcript_id, source.speaker, source.message_text, source.timestamp_offset, source.sentiment);

MERGE INTO transcript_messages AS target
USING (SELECT 'msg_00000004' AS message_id, 'trans_001' AS transcript_id, 'human' AS speaker, 'We recommend she reschedule within the next 2 weeks if she still needs the appointment.' AS message_text, 45 AS timestamp_offset, 'neutral' AS sentiment) AS source
ON target.message_id = source.message_id
WHEN NOT MATCHED THEN INSERT (message_id, transcript_id, speaker, message_text, timestamp_offset, sentiment) VALUES (source.message_id, source.transcript_id, source.speaker, source.message_text, source.timestamp_offset, source.sentiment);

MERGE INTO transcript_messages AS target
USING (SELECT 'msg_00000005' AS message_id, 'trans_001' AS transcript_id, 'ai' AS speaker, 'I will relay that message. Thank you for your help. Goodbye.' AS message_text, 60 AS timestamp_offset, 'positive' AS sentiment) AS source
ON target.message_id = source.message_id
WHEN NOT MATCHED THEN INSERT (message_id, transcript_id, speaker, message_text, timestamp_offset, sentiment) VALUES (source.message_id, source.transcript_id, source.speaker, source.message_text, source.timestamp_offset, source.sentiment);

-- ============================================================
-- 11. APPOINTMENT_ACTIONS (Cancel/Reschedule requests)
-- ============================================================

MERGE INTO appointment_actions AS target
USING (SELECT 'action_001' AS action_id, 'appt_007' AS appointment_id, 'user_003' AS user_id, 'cancel' AS action_type, 'Schedule conflict' AS reason, NULL AS new_date, NULL AS new_time, 'completed' AS status, 'teli_001' AS teli_call_id) AS source
ON target.action_id = source.action_id
WHEN NOT MATCHED THEN INSERT (action_id, appointment_id, user_id, action_type, reason, new_date, new_time, status, teli_call_id) VALUES (source.action_id, source.appointment_id, source.user_id, source.action_type, source.reason, source.new_date, source.new_time, source.status, source.teli_call_id);

MERGE INTO appointment_actions AS target
USING (SELECT 'action_002' AS action_id, 'appt_003' AS appointment_id, 'user_001' AS user_id, 'reschedule' AS action_type, 'Need earlier appointment' AS reason, '2026-01-14' AS new_date, '14:00:00' AS new_time, 'completed' AS status, 'teli_002' AS teli_call_id) AS source
ON target.action_id = source.action_id
WHEN NOT MATCHED THEN INSERT (action_id, appointment_id, user_id, action_type, reason, new_date, new_time, status, teli_call_id) VALUES (source.action_id, source.appointment_id, source.user_id, source.action_type, source.reason, source.new_date, source.new_time, source.status, source.teli_call_id);

-- ============================================================
-- 12. AUDIT_LOGS (System audit trail)
-- ============================================================

MERGE INTO audit_logs AS target
USING (SELECT 'log_00000001' AS log_id, 'user_001' AS user_id, 'login' AS action, 'session' AS resource_type, NULL AS resource_id, '{"ip": "192.168.1.100", "user_agent": "Mozilla/5.0"}' AS details) AS source
ON target.log_id = source.log_id
WHEN NOT MATCHED THEN INSERT (log_id, user_id, action, resource_type, resource_id, details) VALUES (source.log_id, source.user_id, source.action, source.resource_type, source.resource_id, source.details);

MERGE INTO audit_logs AS target
USING (SELECT 'log_00000002' AS log_id, 'user_001' AS user_id, 'create' AS action, 'diary_entry' AS resource_type, 'entry_001' AS resource_id, '{"severity": "low", "category": "General"}' AS details) AS source
ON target.log_id = source.log_id
WHEN NOT MATCHED THEN INSERT (log_id, user_id, action, resource_type, resource_id, details) VALUES (source.log_id, source.user_id, source.action, source.resource_type, source.resource_id, source.details);

MERGE INTO audit_logs AS target
USING (SELECT 'log_00000003' AS log_id, 'user_003' AS user_id, 'request_cancel' AS action, 'appointment' AS resource_type, 'appt_007' AS resource_id, '{"reason": "Schedule conflict"}' AS details) AS source
ON target.log_id = source.log_id
WHEN NOT MATCHED THEN INSERT (log_id, user_id, action, resource_type, resource_id, details) VALUES (source.log_id, source.user_id, source.action, source.resource_type, source.resource_id, source.details);

MERGE INTO audit_logs AS target
USING (SELECT 'log_00000004' AS log_id, 'user_001' AS user_id, 'request_reschedule' AS action, 'appointment' AS resource_type, 'appt_003' AS resource_id, '{"new_date": "2026-01-14"}' AS details) AS source
ON target.log_id = source.log_id
WHEN NOT MATCHED THEN INSERT (log_id, user_id, action, resource_type, resource_id, details) VALUES (source.log_id, source.user_id, source.action, source.resource_type, source.resource_id, source.details);

MERGE INTO audit_logs AS target
USING (SELECT 'log_00000005' AS log_id, 'user_004' AS user_id, 'view' AS action, 'patient_list' AS resource_type, NULL AS resource_id, '{"filter": "high_risk"}' AS details) AS source
ON target.log_id = source.log_id
WHEN NOT MATCHED THEN INSERT (log_id, user_id, action, resource_type, resource_id, details) VALUES (source.log_id, source.user_id, source.action, source.resource_type, source.resource_id, source.details);

-- ============================================================
-- Verification Query
-- Run this to verify seed data was inserted correctly
-- ============================================================

SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'providers', COUNT(*) FROM providers
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'diary_entries', COUNT(*) FROM diary_entries
UNION ALL SELECT 'reminder_settings', COUNT(*) FROM reminder_settings
UNION ALL SELECT 'ai_analyses', COUNT(*) FROM ai_analyses
UNION ALL SELECT 'patient_calls', COUNT(*) FROM patient_calls
UNION ALL SELECT 'teli_calls', COUNT(*) FROM teli_calls
UNION ALL SELECT 'call_transcripts', COUNT(*) FROM call_transcripts
UNION ALL SELECT 'transcript_messages', COUNT(*) FROM transcript_messages
UNION ALL SELECT 'appointment_actions', COUNT(*) FROM appointment_actions
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs;
