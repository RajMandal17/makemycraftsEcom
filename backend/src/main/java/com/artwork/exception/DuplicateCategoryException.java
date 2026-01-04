package com.artwork.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when attempting to create a category with a duplicate name
 * Returns HTTP 409 Conflict status
 * 
 * @author System
 * @since 1.0
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateCategoryException extends RuntimeException {
    
    private final String categoryName;
    
    public DuplicateCategoryException(String categoryName) {
        super(String.format("Category with name '%s' already exists", categoryName));
        this.categoryName = categoryName;
    }
    
    public DuplicateCategoryException(String categoryName, Throwable cause) {
        super(String.format("Category with name '%s' already exists", categoryName), cause);
        this.categoryName = categoryName;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
}
