package com.artwork.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
@Slf4j
public class HealthCheckController {

    private static final String ERROR_KEY = "error";

    @Value("${application.railway.project.name:unknown}")
    private String projectName;

    @Value("${application.railway.environment.name:unknown}")
    private String environmentName;
    
    @Value("${cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;

    @Autowired(required = false)
    private DataSource dataSource;
    
    private final LocalDateTime startTime = LocalDateTime.now();

    
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("Health check requested");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("timezone", ZoneId.systemDefault().toString());
        response.put("message", "Backend API is running successfully!");
        
        
        Map<String, String> systemInfo = new HashMap<>();
        systemInfo.put("projectName", projectName);
        systemInfo.put("environmentName", environmentName);
        systemInfo.put("javaVersion", System.getProperty("java.version"));
        systemInfo.put("availableProcessors", String.valueOf(Runtime.getRuntime().availableProcessors()));
        systemInfo.put("freeMemory", String.valueOf(Runtime.getRuntime().freeMemory() / 1024 / 1024) + " MB");
        systemInfo.put("uptime", java.time.Duration.between(startTime, LocalDateTime.now()).toString());
        
        
        Map<String, String> databaseInfo = new HashMap<>();
        if (dataSource != null) {
            try (Connection connection = dataSource.getConnection()) {
                databaseInfo.put("status", "CONNECTED");
                databaseInfo.put("url", connection.getMetaData().getURL());
            } catch (Exception e) {
                databaseInfo.put("status", "ERROR");
                databaseInfo.put(ERROR_KEY, e.getMessage());
            }
        } else {
            databaseInfo.put("status", "NO_DATASOURCE");
        }
        
        
        Map<String, Object> features = new HashMap<>();
        features.put("cloudinaryEnabled", cloudinaryEnabled);
        
        response.put("system", systemInfo);
        response.put("database", databaseInfo);
        response.put("features", features);
        
        return ResponseEntity.ok(response);
    }
    
    
    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> logMessage(@RequestBody Map<String, Object> logData) {
        String level = (String) logData.getOrDefault("level", "INFO");
        String message = (String) logData.getOrDefault("message", "");
        String source = (String) logData.getOrDefault("source", "frontend");
        
        switch (level.toUpperCase()) {
            case "ERROR":
                log.error("[{}] {}", source, message);
                break;
            case "WARN":
                log.warn("[{}] {}", source, message);
                break;
            case "DEBUG":
                log.debug("[{}] {}", source, message);
                break;
            default:
                log.info("[{}] {}", source, message);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("logged", true);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Log message received and recorded");
        
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        log.debug("Ping request received");
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
    
    
    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody(required = false) Map<String, Object> data) {
        log.info("Echo request received with data: {}", data);
        
        Map<String, Object> response = new HashMap<>();
        response.put("echo", data);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "Echo response");
        
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/logs")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getCurrentLogs(
            @RequestParam(value = "from", required = false) Integer from,
            @RequestParam(value = "to", required = false) Integer to,
            @RequestParam(value = "limit", required = false, defaultValue = "500") Integer limit) {
        
        String logFileName = "artwork-app.log"; 
        String logDirectory = "logs"; 
        
        try {
            
            java.nio.file.Path logDir = java.nio.file.Paths.get(logDirectory).toAbsolutePath().normalize();
            java.nio.file.Path logFile = logDir.resolve(logFileName).normalize();
            
            
            if (!logFile.startsWith(logDir)) {
                log.error("Path traversal attempt detected in log access: {}", logFile);
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body("Access denied: Invalid log file path");
            }
            
            
            if (!java.nio.file.Files.exists(logFile)) {
                log.warn("Log file not found: {}", logFile);
                return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body("Log file not found: " + logFileName + "\nNote: Logs may not be written to file yet or logging to file may not be configured.");
            }
            
            
            java.util.List<String> allLines = java.nio.file.Files.readAllLines(
                logFile, 
                java.nio.charset.StandardCharsets.UTF_8
            );
            int totalLines = allLines.size();
            
            
            
            int start = (from != null) ? Math.max(0, from) : Math.max(0, totalLines - limit);
            int end = (to != null) ? Math.min(totalLines, to) : totalLines;
            
            
            if (end - start > limit) {
                start = end - limit;
            }
            
            
            if (start > end) {
                start = end;
            }
            if (start < 0) {
                start = 0;
            }
            if (end > totalLines) {
                end = totalLines;
            }
            
            
            String content = allLines.subList(start, end).stream()
                    .collect(java.util.stream.Collectors.joining("\n"));
            
            
            String header = String.format(
                "=== Application Logs ===\n" +
                "Total lines: %d\n" +
                "Showing lines: %d to %d\n" +
                "Timestamp: %s\n" +
                "================================\n\n",
                totalLines, start, end, LocalDateTime.now()
            );
            
            log.info("Log request served: lines {}-{} of {} (limit: {})", start, end, totalLines, limit);
            
            return ResponseEntity.ok()
                    .header("Content-Type", "text/plain; charset=UTF-8")
                    .header("X-Total-Lines", String.valueOf(totalLines))
                    .header("X-Lines-Shown", String.valueOf(end - start))
                    .body(header + content);
                    
        } catch (java.io.IOException e) {
            log.error("Error reading log file: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reading log file: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while processing log request: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }
    
    
    @GetMapping("/logs/info")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getLogInfo() {
        String logFileName = "artwork-app.log"; 
        String logDirectory = "logs"; 
        Map<String, Object> info = new HashMap<>();
        
        try {
            
            java.nio.file.Path logDir = java.nio.file.Paths.get(logDirectory).toAbsolutePath().normalize();
            java.nio.file.Path logFile = logDir.resolve(logFileName).normalize();
            
            
            if (!logFile.startsWith(logDir)) {
                log.error("Path traversal attempt detected in log info access: {}", logFile);
                info.put(ERROR_KEY, "Access denied: Invalid log file path");
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body(info);
            }
            
            if (!java.nio.file.Files.exists(logFile)) {
                info.put("exists", false);
                info.put("path", logFileName);
                info.put("message", "Log file not found");
                return ResponseEntity.ok(info);
            }
            
            long fileSize = java.nio.file.Files.size(logFile);
            long lineCount = java.nio.file.Files.lines(logFile).count();
            java.nio.file.attribute.FileTime lastModified = java.nio.file.Files.getLastModifiedTime(logFile);
            
            info.put("exists", true);
            info.put("path", logFileName);
            info.put("size", fileSize);
            info.put("sizeFormatted", formatFileSize(fileSize));
            info.put("lineCount", lineCount);
            info.put("lastModified", lastModified.toString());
            info.put("readable", java.nio.file.Files.isReadable(logFile));
            
            return ResponseEntity.ok(info);
            
        } catch (Exception e) {
            log.error("Error getting log file info: {}", e.getMessage(), e);
            info.put(ERROR_KEY, e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(info);
        }
    }
    
    
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
