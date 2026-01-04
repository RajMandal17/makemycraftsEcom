


SELECT 
    id,
    title,
    images,
    created_at
FROM artworks
WHERE images LIKE '%/uploads/%'
   OR images NOT LIKE '%cloudinary%'
ORDER BY created_at DESC;













