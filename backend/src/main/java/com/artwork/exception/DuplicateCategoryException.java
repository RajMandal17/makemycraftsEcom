package com.artwork.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


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
