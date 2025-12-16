-- Migration: Add Full-Text Search for Chat Messages
-- Description: Improve search performance for chat messages

-- Add FULLTEXT index for message search
-- Note: This requires MyISAM or InnoDB with MySQL 5.6+

-- Check if index exists before creating
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'chat_messages' 
    AND index_name = 'ft_message_text'
);

-- Create fulltext index if not exists
-- Using a procedure to handle conditional index creation
DELIMITER //
CREATE PROCEDURE add_fulltext_index_if_not_exists()
BEGIN
    DECLARE index_count INT;
    
    SELECT COUNT(*) INTO index_count
    FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'chat_messages' 
    AND index_name = 'ft_message_text';
    
    IF index_count = 0 THEN
        ALTER TABLE chat_messages ADD FULLTEXT INDEX ft_message_text (message_text);
    END IF;
END //
DELIMITER ;

CALL add_fulltext_index_if_not_exists();
DROP PROCEDURE IF EXISTS add_fulltext_index_if_not_exists;

-- Add index for group messages search
DELIMITER //
CREATE PROCEDURE add_group_fulltext_index_if_not_exists()
BEGIN
    DECLARE index_count INT;
    
    SELECT COUNT(*) INTO index_count
    FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
    AND table_name = 'group_messages' 
    AND index_name = 'ft_group_message_text';
    
    IF index_count = 0 THEN
        ALTER TABLE group_messages ADD FULLTEXT INDEX ft_group_message_text (message_text);
    END IF;
END //
DELIMITER ;

CALL add_group_fulltext_index_if_not_exists();
DROP PROCEDURE IF EXISTS add_group_fulltext_index_if_not_exists;
