package com.artwork.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


@RestController
public class SimpleHealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> basicHealth() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(status);
    }
    
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        Map<String, String> status = new HashMap<>();
        status.put("service", "Artwork E-commerce Backend");
        status.put("status", "Running");
        status.put("version", "1.0.0");
        return ResponseEntity.ok(status);
    }
}


