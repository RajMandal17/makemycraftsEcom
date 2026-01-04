


ALTER TABLE users 
ADD COLUMN username VARCHAR(50);


CREATE UNIQUE INDEX idx_user_username ON users(username);



UPDATE users 
SET username = CONCAT(
    LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9]', '', 'g')),
    '_',
    SUBSTRING(id, 1, 6)
)
WHERE username IS NULL;


ALTER TABLE users 
ALTER COLUMN username SET NOT NULL;


COMMENT ON COLUMN users.username IS 'Unique username for profile sharing (LinkedIn-style). Alphanumeric with underscores/hyphens allowed.';
