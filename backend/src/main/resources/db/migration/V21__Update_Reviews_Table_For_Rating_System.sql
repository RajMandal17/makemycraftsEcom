






ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS order_item_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS order_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'APPROVED',
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;




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


CREATE INDEX IF NOT EXISTS idx_review_artwork ON reviews(artwork_id);
CREATE INDEX IF NOT EXISTS idx_review_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_review_order_item ON reviews(order_item_id);
CREATE INDEX IF NOT EXISTS idx_review_created ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_status ON reviews(status);




