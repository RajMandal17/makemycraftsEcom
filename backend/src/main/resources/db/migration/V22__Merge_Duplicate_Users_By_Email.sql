




CREATE TEMP TABLE duplicate_users AS
SELECT 
    LOWER(email) as normalized_email,
    MIN(created_at) as oldest_created,
    COUNT(*) as user_count
FROM users 
GROUP BY LOWER(email) 
HAVING COUNT(*) > 1;


CREATE TEMP TABLE user_id_mapping AS
SELECT 
    d.id as duplicate_id,
    p.id as primary_id
FROM users d
JOIN users p ON LOWER(d.email) = LOWER(p.email)
JOIN duplicate_users dup ON LOWER(d.email) = dup.normalized_email
WHERE d.created_at > p.created_at
AND p.created_at = dup.oldest_created;




UPDATE artworks 
SET artist_id = m.primary_id
FROM user_id_mapping m
WHERE artworks.artist_id = m.duplicate_id;


UPDATE orders 
SET customer_id = m.primary_id
FROM user_id_mapping m
WHERE orders.customer_id = m.duplicate_id;


UPDATE reviews 
SET customer_id = m.primary_id
FROM user_id_mapping m
WHERE reviews.customer_id = m.duplicate_id;


UPDATE cart_items 
SET user_id = m.primary_id
FROM user_id_mapping m
WHERE cart_items.user_id = m.duplicate_id;


UPDATE social_links 
SET user_id = m.primary_id
FROM user_id_mapping m
WHERE social_links.user_id = m.duplicate_id;


DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'artwork_suggestions') THEN
        UPDATE artwork_suggestions 
        SET user_id = m.primary_id
        FROM user_id_mapping m
        WHERE artwork_suggestions.user_id = m.duplicate_id;
    END IF;
END $$;


DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wishlist_items') THEN
        UPDATE wishlist_items 
        SET user_id = m.primary_id
        FROM user_id_mapping m
        WHERE wishlist_items.user_id = m.duplicate_id;
    END IF;
END $$;


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


DELETE FROM users 
WHERE id IN (SELECT duplicate_id FROM user_id_mapping);


DROP TABLE IF EXISTS duplicate_users;
DROP TABLE IF EXISTS user_id_mapping;




