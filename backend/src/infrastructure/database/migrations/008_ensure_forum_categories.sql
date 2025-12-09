-- =====================================================
-- Migration: Đảm bảo bảng forum_categories tồn tại
-- Mô tả: Tạo bảng forum_categories nếu chưa tồn tại
--        Thêm các cột cần thiết nếu bảng đã tồn tại nhưng thiếu cột
-- =====================================================

USE nexus_db;

-- Tạo bảng forum_categories nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS forum_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color_class VARCHAR(50),
    `order` INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm cột `order` nếu chưa tồn tại (cho trường hợp bảng đã có nhưng thiếu cột)
SET @dbname = DATABASE();
SET @tablename = 'forum_categories';
SET @columnname = 'order';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN `order` INT DEFAULT 0 AFTER color_class')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm index cho order nếu chưa tồn tại
SET @indexname = 'idx_forum_categories_order';
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, '(`order`)')
));
PREPARE createIndexIfNotExists FROM @preparedStatement2;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;
