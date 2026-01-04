package com.artwork.service.impl;

import com.artwork.service.CloudStorageService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Implementation of CloudStorageService using Cloudinary
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryStorageService implements CloudStorageService {
    
    private final Cloudinary cloudinary;
    
    @Value("${cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;
    
    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (!cloudinaryEnabled) {
            log.warn("Cloudinary is disabled. File upload will use local storage.");
            return null;
        }
        
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            
            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", uniqueFilename.replace(fileExtension, ""),
                    "resource_type", "auto"
                ));
            
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("File uploaded to Cloudinary: {}", secureUrl);
            return secureUrl;
            
        } catch (Exception e) {
            log.error("Error uploading file to Cloudinary. Check if Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are correctly set.", e);
            throw new IOException("Failed to upload file to cloud storage: " + e.getMessage() + ". Please check server logs for details.", e);
        }
    }
    
    @Override
    public boolean deleteFile(String publicId) {
        if (!cloudinaryEnabled) {
            log.warn("Cloudinary is disabled. Cannot delete file.");
            return false;
        }
        
        try {
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("result");
            boolean success = "ok".equals(resultStatus);
            
            if (success) {
                log.info("File deleted from Cloudinary: {}", publicId);
            } else {
                log.warn("Failed to delete file from Cloudinary: {}", publicId);
            }
            
            return success;
            
        } catch (Exception e) {
            log.error("Error deleting file from Cloudinary: {}", publicId, e);
            return false;
        }
    }
    
    @Override
    public String extractPublicId(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            // Extract public_id from Cloudinary URL
            // Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{extension}
            String[] parts = url.split("/upload/");
            if (parts.length < 2) {
                return null;
            }
            
            String path = parts[1];
            // Remove version prefix (v1234567890/)
            path = path.replaceFirst("v\\d+/", "");
            // Remove file extension
            int lastDot = path.lastIndexOf('.');
            if (lastDot > 0) {
                path = path.substring(0, lastDot);
            }
            
            return path;
            
        } catch (Exception e) {
            log.error("Error extracting public ID from URL: {}", url, e);
            return null;
        }
    }
}
