-- Migration: Add message reactions and edit/recall support
-- Sprint 2: Chat Nexus Improvements

-- Message Reactions Table
CREATE TABLE IF NOT EXISTS message_reactions (
    id CHAR(36) PRIMARY KEY,
    message_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reaction (message_id, user_id, emoji),
    INDEX idx_message_reactions (message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add edit/recall columns to chat_messages if not exist
-- Note: Using stored procedure to check column existence before ALTER

DELIMITER //

CREATE PROCEDURE add_chat_message_columns()
BEGIN
    -- Add edited_at column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'chat_messages' 
        AND column_name = 'edited_at'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN edited_at TIMESTAMP NULL;
    END IF;

    -- Add is_recalled column
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'chat_messages' 
        AND column_name = 'is_recalled'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN is_recalled BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add original_text column for audit
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'chat_messages' 
        AND column_name = 'original_text'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN original_text TEXT NULL;
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL add_chat_message_columns();

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS add_chat_message_columns;

-- Create index for quick lookup of edited/recalled messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_edited ON chat_messages(edited_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recalled ON chat_messages(is_recalled);
