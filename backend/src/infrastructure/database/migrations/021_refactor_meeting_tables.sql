-- =====================================================
-- Migration: Refactor Meeting Tables for Daily.co
-- Adds provider abstraction, attendance tracking, audit trail
-- =====================================================

USE nexus_db;

-- =====================================================
-- Step 1: Add provider abstraction to existing table
-- =====================================================

ALTER TABLE online_meetings 
    ADD COLUMN provider ENUM('DAILY', 'JITSI', 'NONE') DEFAULT 'JITSI' AFTER status,
    ADD COLUMN type ENUM('ONLINE', 'OFFLINE', 'HYBRID') DEFAULT 'ONLINE' AFTER provider,
    ADD COLUMN provider_config JSON DEFAULT NULL AFTER type;

-- Add index for provider queries
CREATE INDEX idx_meeting_provider ON online_meetings(provider);

-- =====================================================
-- Step 2: Create meeting_sessions table
-- Each actual occurrence/run of a meeting
-- =====================================================

CREATE TABLE IF NOT EXISTS meeting_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    meeting_id CHAR(36) NOT NULL,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    ended_by CHAR(36) NULL,
    end_reason ENUM('MANUAL', 'WEBHOOK', 'CRON_CLEANUP') NULL,
    provider_session_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (meeting_id) REFERENCES online_meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (ended_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_session_meeting (meeting_id),
    INDEX idx_session_status (started_at, ended_at),
    INDEX idx_session_active (meeting_id, ended_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Step 3: Create meeting_attendance_logs table
-- Append-only log for accurate duration tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS meeting_attendance_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    meeting_id CHAR(36) NOT NULL,
    session_id CHAR(36) NULL,
    user_id CHAR(36) NOT NULL,
    event_type ENUM('JOIN', 'LEAVE', 'RECONNECT') NOT NULL,
    event_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    client_instance_id VARCHAR(255) NULL,
    provider_participant_id VARCHAR(255) NULL,
    source ENUM('API', 'WEBHOOK') NOT NULL DEFAULT 'API',
    metadata JSON NULL,
    
    FOREIGN KEY (meeting_id) REFERENCES online_meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES meeting_sessions(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_attendance_meeting (meeting_id),
    INDEX idx_attendance_user (user_id),
    INDEX idx_attendance_session (session_id),
    INDEX idx_attendance_event (event_at),
    INDEX idx_attendance_user_meeting (meeting_id, user_id, event_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Step 4: Create meeting_status_history table
-- Audit trail for status changes
-- =====================================================

CREATE TABLE IF NOT EXISTS meeting_status_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    meeting_id CHAR(36) NOT NULL,
    from_status ENUM('scheduled', 'active', 'ended', 'cancelled') NULL,
    to_status ENUM('scheduled', 'active', 'ended', 'cancelled') NOT NULL,
    changed_by CHAR(36) NULL,
    reason VARCHAR(255) NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (meeting_id) REFERENCES online_meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_history_meeting (meeting_id),
    INDEX idx_history_time (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Step 5: Migrate existing data
-- Mark all existing meetings as JITSI provider
-- =====================================================

UPDATE online_meetings 
SET provider = 'JITSI',
    type = 'ONLINE',
    provider_config = JSON_OBJECT(
        'version', 1,
        'roomName', jitsi_room_name,
        'domain', jitsi_domain
    )
WHERE provider IS NULL OR provider = '';

-- =====================================================
-- Step 6: Duration calculation
-- Note: Duration is calculated in application code (MeetingRepository.ts)
-- using the meeting_attendance_logs table directly.
-- This avoids MySQL cursor complexity across different versions.
-- =====================================================

-- =====================================================
-- Verification
-- =====================================================

SELECT 'Migration 021 completed successfully!' AS status;
SHOW COLUMNS FROM online_meetings LIKE 'provider%';
SHOW TABLES LIKE 'meeting_%';
