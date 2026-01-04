package com.artwork.service.email;

/**
 * Runtime exception thrown when the application fails to compose or send an email.
 */
public class EmailProcessingException extends RuntimeException {
    public EmailProcessingException(String message, Throwable cause) {
        super(message, cause);
    }

    public EmailProcessingException(String message) {
        super(message);
    }
}
