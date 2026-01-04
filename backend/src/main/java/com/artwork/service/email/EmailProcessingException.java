package com.artwork.service.email;


public class EmailProcessingException extends RuntimeException {
    public EmailProcessingException(String message, Throwable cause) {
        super(message, cause);
    }

    public EmailProcessingException(String message) {
        super(message);
    }
}
