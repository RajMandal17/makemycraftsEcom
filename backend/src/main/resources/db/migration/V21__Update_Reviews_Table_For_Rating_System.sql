-- V21: Update Reviews Table for Production-Level Rating System
-- This migration updates the reviews table to support:
-- 1. Purchase verification (only buyers can review)
-- 2. 7-day review window after delivery
-- 3. One review per order item

-- Step 1: Add new columns to reviews table
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS order_item_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS order_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'APPROVED',
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- Step 2: Remove old unique constraint if exists (customerId, artworkId)
-- Note: This allows same customer to review same artwork if they buy it again
-- The constraint is now on orderItemId instead
SET @constraint_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'reviews' 
    AND CONSTRAINT_NAME = 'UK2b0dbqx0l3gxqjtxj0e28hm8l'
);
SET @sql = IF(@constraint_exists > 0, 
    'ALTER TABLE reviews DROP INDEX UK2b0dbqx0l3gxqjtxj0e28hm8l', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_artwork ON reviews(artwork_id);
CREATE INDEX IF NOT EXISTS idx_review_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_review_order_item ON reviews(order_item_id);
CREATE INDEX IF NOT EXISTS idx_review_created ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_status ON reviews(status);

-- Step 4: Add unique constraint on order_item_id (one review per order item)
-- Only if order_item_id is not null (for backward compatibility with existing reviews)
-- Note: We'll handle this at application level for existing reviews without order_item_id
