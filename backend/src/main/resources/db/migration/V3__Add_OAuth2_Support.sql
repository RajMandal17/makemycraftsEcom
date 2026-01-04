
ALTER TABLE users 
ADD COLUMN oauth2_provider VARCHAR(50) NULL COMMENT 'OAuth2 provider name (google, facebook, github)',
ADD COLUMN oauth2_id VARCHAR(255) NULL COMMENT 'OAuth2 provider user ID',
ADD COLUMN profile_picture_url TEXT NULL COMMENT 'Profile picture URL from OAuth2 provider',
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE COMMENT 'Email verification status';


CREATE INDEX idx_users_oauth2_provider_id ON users(oauth2_provider, oauth2_id);


CREATE INDEX idx_users_email_verified ON users(email_verified);


UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
