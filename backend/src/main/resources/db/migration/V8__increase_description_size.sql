-- Increase description column size to handle AI-generated content
-- TEXT can be up to 65,535 bytes
-- MEDIUMTEXT can be up to 16,777,215 bytes

ALTER TABLE artworks MODIFY COLUMN description MEDIUMTEXT NOT NULL;
ALTER TABLE artwork_suggestions MODIFY COLUMN suggested_description MEDIUMTEXT;
