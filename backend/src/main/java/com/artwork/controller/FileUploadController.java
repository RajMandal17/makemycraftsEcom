package com.artwork.controller;

import com.artwork.service.CloudStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling file uploads
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final CloudStorageService cloudStorageService;

    /**
     * Upload a file to cloud storage
     * @param file The file to upload
     * @param folder The folder to upload to (e.g., "kyc-documents", "artworks")
     * @return The URL of the uploaded file
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "uploads") String folder) {
        
        try {
            log.info("Uploading file: {} to folder: {}", file.getOriginalFilename(), folder);
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }
            
            // Validate file size (max 10MB)
            long maxSize = 10L * 1024 * 1024; // 10MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size exceeds 10MB limit"));
            }
            
            // Validate file type (images and PDFs only)
            String contentType = file.getContentType();
            if (contentType == null || 
                (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only images and PDF files are allowed"));
            }
            
            // Upload to cloud storage
            String fileUrl = cloudStorageService.uploadFile(file, folder);
            
            if (fileUrl == null) {
                log.error("Cloudinary upload returned null - Cloudinary may not be configured");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "Cloud storage is not configured. Please contact administrator."));
            }
            
            log.info("File uploaded successfully: {}", fileUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", file.getOriginalFilename());
            response.put("size", String.valueOf(file.getSize()));
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a file from cloud storage
     * @param url The URL of the file to delete
     * @return Success message
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteFile(@RequestParam("url") String url) {
        try {
            String publicId = cloudStorageService.extractPublicId(url);
            
            if (publicId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid file URL"));
            }
            
            boolean deleted = cloudStorageService.deleteFile(publicId);
            
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to delete file"));
            }
            
        } catch (Exception e) {
            log.error("Error deleting file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete file: " + e.getMessage()));
        }
    }
}
