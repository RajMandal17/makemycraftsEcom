




CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    image_url VARCHAR(500),
    emoji VARCHAR(10),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36)
);


CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_deleted ON categories(is_deleted);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_name_lower ON categories(LOWER(name));



INSERT INTO categories (id, name, slug, display_name, emoji, display_order, is_active, is_deleted, created_at, updated_at)
VALUES 
    (gen_random_uuid()::text, 'PAINTING', 'painting', 'Painting', '🎨', 1, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'SCULPTURE', 'sculpture', 'Sculpture', '🗿', 2, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'PHOTOGRAPHY', 'photography', 'Photography', '📷', 3, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'DIGITAL_ART', 'digital-art', 'Digital Art', '💻', 4, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'DRAWING', 'drawing', 'Drawing', '✏️', 5, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'PRINT', 'print', 'Print', '🖼️', 6, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'MIXED_MEDIA', 'mixed-media', 'Mixed Media', '🎭', 7, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'TEXTILE', 'textile', 'Textile', '🧵', 8, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'CERAMICS', 'ceramics', 'Ceramics', '🏺', 9, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'JEWELRY', 'jewelry', 'Jewelry', '💎', 10, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'GLASS', 'glass', 'Glass', '🔮', 11, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'WOOD', 'wood', 'Wood', '🪵', 12, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'METAL', 'metal', 'Metal', '⚙️', 13, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'PAPER', 'paper', 'Paper', '📄', 14, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'OTHER', 'other', 'Other', '✨', 15, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;


COMMENT ON TABLE categories IS 'Artwork categories with soft delete support. Admins can add/edit/delete categories with image icons.';
COMMENT ON COLUMN categories.image_url IS 'URL to category icon image (replaces emoji when available)';
COMMENT ON COLUMN categories.is_deleted IS 'Soft delete flag - TRUE means category is deleted but data retained';
COMMENT ON COLUMN categories.deleted_at IS 'Timestamp when category was soft-deleted';
