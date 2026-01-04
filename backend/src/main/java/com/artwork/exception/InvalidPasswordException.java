package com.artwork.exception;

/**
 * Exception thrown when password validation fails
 */
public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException(String message) {
        super(message);
    }
}
