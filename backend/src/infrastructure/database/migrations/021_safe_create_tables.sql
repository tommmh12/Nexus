-- =====================================================
-- Safe Migration: Only CREATE TABLE statements
-- Skips ALTER TABLE that might fail on duplicate columns
-- =====================================================

USE nexus_db;

-- =====================================================
-- meeting_sessions table
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
-- meeting_attendance_logs table
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
    INDEX idx_attendance_timestamp (event_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- meeting_status_history table
-- =====================================================

CREATE TABLE IF NOT EXISTS meeting_status_history (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    meeting_id CHAR(36) NOT NULL,
    from_status ENUM('scheduled', 'active', 'ended', 'cancelled') NULL,
    to_status ENUM('scheduled', 'active', 'ended', 'cancelled') NOT NULL,
    changed_by CHAR(36) NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255) NULL,
    
    FOREIGN KEY (meeting_id) REFERENCES online_meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_status_meeting (meeting_id),
    INDEX idx_status_timestamp (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Migration completed successfully!' as status;
