-- Add username column to users table for LinkedIn-style profile URLs
-- Username must be unique and will be used for profile sharing (e.g., makemycrafts.com/artists/@username)

ALTER TABLE users 
ADD COLUMN username VARCHAR(50);

-- Create unique index on username for fast lookups and uniqueness constraint
CREATE UNIQUE INDEX idx_user_username ON users(username);

-- Update existing users with auto-generated usernames based on email
-- This ensures no null values for existing users
UPDATE users 
SET username = CONCAT(
    LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9]', '', 'g')),
    '_',
    SUBSTRING(id, 1, 6)
)
WHERE username IS NULL;

-- Now make username NOT NULL after populating existing records
ALTER TABLE users 
ALTER COLUMN username SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.username IS 'Unique username for profile sharing (LinkedIn-style). Alphanumeric with underscores/hyphens allowed.';
