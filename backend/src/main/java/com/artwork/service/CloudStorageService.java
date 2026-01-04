package com.artwork.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


public interface CloudStorageService {
    
    
    String uploadFile(MultipartFile file, String folder) throws IOException;
    
    
    boolean deleteFile(String publicId);
    
    
    String extractPublicId(String url);
}
