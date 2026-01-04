package com.artwork.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request, HttpServletRequest httpRequest) {
        
        ErrorDetails errorDetails = new ErrorDetails(
            LocalDateTime.now(),
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            request.getDescription(false),
            httpRequest.getRequestURI()
        );
        
        log.error("Resource not found: {} at URI: {}", ex.getMessage(), httpRequest.getRequestURI(), ex);
        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentialsException(
            BadCredentialsException ex, WebRequest request, HttpServletRequest httpRequest) {
        
        ErrorDetails errorDetails = new ErrorDetails(
            LocalDateTime.now(),
            HttpStatus.UNAUTHORIZED.value(),
            "Unauthorized",
            "Invalid credentials",
            request.getDescription(false),
            httpRequest.getRequestURI()
        );
        
        log.warn("Authentication failure at URI: {}", httpRequest.getRequestURI());
        return new ResponseEntity<>(errorDetails, HttpStatus.UNAUTHORIZED);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request, HttpServletRequest httpRequest) {
        
        ErrorDetails errorDetails = new ErrorDetails(
            LocalDateTime.now(),
            HttpStatus.FORBIDDEN.value(),
            "Forbidden",
            "You don't have permission to access this resource",
            request.getDescription(false),
            httpRequest.getRequestURI()
        );
        
        log.warn("Access denied at URI: {} - {}", httpRequest.getRequestURI(), ex.getMessage());
        return new ResponseEntity<>(errorDetails, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<?> handleInvalidPasswordException(
            InvalidPasswordException ex, WebRequest request, HttpServletRequest httpRequest) {
        
        ErrorDetails errorDetails = new ErrorDetails(
            LocalDateTime.now(),
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            ex.getMessage(),
            request.getDescription(false),
            httpRequest.getRequestURI()
        );
        
        log.warn("Invalid password at URI: {} - {}", httpRequest.getRequestURI(), ex.getMessage());
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request, HttpServletRequest httpRequest) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ValidationErrorDetails errorDetails = new ValidationErrorDetails(
            LocalDateTime.now(),
            HttpStatus.BAD_REQUEST.value(),
            "Validation Error",
            "Validation failed for request parameters",
            request.getDescription(false),
            httpRequest.getRequestURI(),
            errors
        );
        
        log.warn("Validation error at URI: {}: {}", httpRequest.getRequestURI(), errors);
        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(DuplicateCategoryException.class)
    public ResponseEntity<?> handleDuplicateCategoryException(
            DuplicateCategoryException ex, WebRequest request, HttpServletRequest httpRequest) {
        
        ErrorDetails errorDetails = new ErrorDetails(
            LocalDateTime.now(),
            HttpStatus.CONFLICT.value(),
            "Conflict",
            ex.getMessage(),
            request.getDescription(false),
            httpRequest.getRequestURI()
        );
        
        log.warn("Duplicate category at URI: {} - {}", httpRequest.getRequestURI(), ex.getMessage());
        return new ResponseEntity<>(errorDetails, HttpStatus.CONFLICT);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(
            Exception ex, WebRequest request, HttpServletRequest httpRequest) {
        
        ErrorDetails errorDetails = new ErrorDetails(
            LocalDateTime.now(),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            ex.getMessage(),
            request.getDescription(false),
            httpRequest.getRequestURI()
        );
        
        // Log detailed stack trace for general exceptions
        log.error("Unhandled exception at URI: {}", httpRequest.getRequestURI(), ex);
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
