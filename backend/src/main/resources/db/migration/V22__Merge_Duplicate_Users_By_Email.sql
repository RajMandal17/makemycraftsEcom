-- V22__Merge_Duplicate_Users_By_Email.sql
-- This migration merges duplicate user records that have the same email (case-insensitive)
-- It keeps the oldest user (created_at) as the primary and transfers all data to it

-- Step 1: Create a temporary table to identify duplicates
CREATE TEMP TABLE duplicate_users AS
SELECT 
    LOWER(email) as normalized_email,
    MIN(created_at) as oldest_created,
    COUNT(*) as user_count
FROM users 
GROUP BY LOWER(email) 
HAVING COUNT(*) > 1;

-- Step 2: Create a mapping table from duplicate IDs to primary IDs
CREATE TEMP TABLE user_id_mapping AS
SELECT 
    d.id as duplicate_id,
    p.id as primary_id
FROM users d
JOIN users p ON LOWER(d.email) = LOWER(p.email)
JOIN duplicate_users dup ON LOWER(d.email) = dup.normalized_email
WHERE d.created_at > p.created_at
AND p.created_at = dup.oldest_created;

-- Step 3: Update all foreign key references to use the primary user ID

-- Update artworks
UPDATE artworks 
SET artist_id = m.primary_id
FROM user_id_mapping m
WHERE artworks.artist_id = m.duplicate_id;

-- Update orders (customer_id)
UPDATE orders 
SET customer_id = m.primary_id
FROM user_id_mapping m
WHERE orders.customer_id = m.duplicate_id;

-- Update reviews (customer_id)
UPDATE reviews 
SET customer_id = m.primary_id
FROM user_id_mapping m
WHERE reviews.customer_id = m.duplicate_id;

-- Update cart_items (user_id)
UPDATE cart_items 
SET user_id = m.primary_id
FROM user_id_mapping m
WHERE cart_items.user_id = m.duplicate_id;

-- Update social_links (user_id)
UPDATE social_links 
SET user_id = m.primary_id
FROM user_id_mapping m
WHERE social_links.user_id = m.duplicate_id;

-- Update artwork_suggestions (user_id) if exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'artwork_suggestions') THEN
        UPDATE artwork_suggestions 
        SET user_id = m.primary_id
        FROM user_id_mapping m
        WHERE artwork_suggestions.user_id = m.duplicate_id;
    END IF;
END $$;

-- Update wishlist_items if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wishlist_items') THEN
        UPDATE wishlist_items 
        SET user_id = m.primary_id
        FROM user_id_mapping m
        WHERE wishlist_items.user_id = m.duplicate_id;
    END IF;
END $$;

-- Step 4: Copy password from duplicate to primary if primary doesn't have one (OAuth user)
UPDATE users 
SET password = dup_users.password
FROM (
    SELECT m.primary_id, d.password
    FROM users d 
    JOIN user_id_mapping m ON d.id = m.duplicate_id
    WHERE d.password IS NOT NULL AND d.password != ''
) dup_users
WHERE users.id = dup_users.primary_id
AND (users.password IS NULL OR users.password = '');

-- Step 5: Delete duplicate users
DELETE FROM users 
WHERE id IN (SELECT duplicate_id FROM user_id_mapping);

-- Step 6: Clean up temporary tables
DROP TABLE IF EXISTS duplicate_users;
DROP TABLE IF EXISTS user_id_mapping;

-- Step 7: Add unique constraint on lowercase email to prevent future duplicates
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
-- Note: Uncomment above if you want to enforce uniqueness
