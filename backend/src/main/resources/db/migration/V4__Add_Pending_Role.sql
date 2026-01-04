-- Add PENDING role to the users role ENUM
-- This is needed for OAuth2 users who haven't selected their role yet

ALTER TABLE users MODIFY COLUMN role ENUM('CUSTOMER', 'ARTIST', 'ADMIN', 'PENDING') NOT NULL DEFAULT 'CUSTOMER';