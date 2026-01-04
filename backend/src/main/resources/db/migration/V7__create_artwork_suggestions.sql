-- Create artwork_suggestions table for storing AI-generated suggestions
CREATE TABLE artwork_suggestions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    suggested_title VARCHAR(255),
    suggested_category VARCHAR(100),
    suggested_medium VARCHAR(100),
    suggested_description TEXT,
    suggested_tags TEXT,
    suggested_width DECIMAL(10,2),
    suggested_height DECIMAL(10,2),
    confidence_score DECIMAL(3,2),
    analysis_metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_applied BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_suggestion_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries by user and date
CREATE INDEX idx_user_created ON artwork_suggestions(user_id, created_at DESC);

-- Create index for filtering applied suggestions
CREATE INDEX idx_is_applied ON artwork_suggestions(is_applied);
