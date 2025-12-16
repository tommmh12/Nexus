-- Migration: Chat Moderation Tables
-- Description: Add tables for message reports, chat bans, and moderation features

-- Message Reports Table
CREATE TABLE IF NOT EXISTS message_reports (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    reporter_id VARCHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'reviewed', 'dismissed', 'actioned') DEFAULT 'pending',
    reviewed_by VARCHAR(36) NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_message_reports_message (message_id),
    INDEX idx_message_reports_reporter (reporter_id),
    INDEX idx_message_reports_status (status),
    
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Chat Bans Table
CREATE TABLE IF NOT EXISTS chat_bans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    banned_by VARCHAR(36) NOT NULL,
    reason TEXT NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_chat_bans_user (user_id),
    INDEX idx_chat_bans_expires (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Add moderation columns to chat_messages if not exists
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add index for moderation queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted ON chat_messages(is_deleted, deleted_at);
