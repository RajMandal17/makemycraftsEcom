-- Add featured column to artworks table
ALTER TABLE artworks ADD COLUMN featured BOOLEAN DEFAULT false;
