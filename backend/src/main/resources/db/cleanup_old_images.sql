-- This query finds all artworks with local (non-Cloudinary) image URLs
-- Run this to see which artworks need updating

SELECT 
    id,
    title,
    images,
    created_at
FROM artworks
WHERE images LIKE '%/uploads/%'
   OR images NOT LIKE '%cloudinary%'
ORDER BY created_at DESC;

-- OPTION 1: Delete old artworks with local images (recommended for dev)
-- DELETE FROM artworks WHERE images LIKE '%/uploads/%';

-- OPTION 2: If you want to keep the artworks but remove broken images
-- UPDATE artworks 
-- SET images = '[]' 
-- WHERE images LIKE '%/uploads/%';

-- NOTES:
-- - Images uploaded BEFORE Cloudinary setup are lost (Railway's ephemeral storage)
-- - Images uploaded AFTER Cloudinary setup will have URLs like https://res.cloudinary.com/...
-- - The frontend getFullImageUrl() already handles both URL types correctly
