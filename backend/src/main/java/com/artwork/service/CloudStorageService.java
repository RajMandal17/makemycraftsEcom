package com.artwork.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service for managing file uploads to cloud storage
 */
public interface CloudStorageService {
    
    /**
     * Upload a file to cloud storage
     * @param file The file to upload
     * @param folder The folder/directory in cloud storage
     * @return The public URL of the uploaded file
     * @throws IOException if upload fails
     */
    String uploadFile(MultipartFile file, String folder) throws IOException;
    
    /**
     * Delete a file from cloud storage
     * @param publicId The public ID of the file to delete
     * @return true if deletion was successful
     */
    boolean deleteFile(String publicId);
    
    /**
     * Extract public ID from Cloudinary URL
     * @param url The Cloudinary URL
     * @return The public ID
     */
    String extractPublicId(String url);
}
