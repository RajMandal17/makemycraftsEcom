package com.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtworkUpdateRequest {
    private String title;
    private String description;
    private Double price;
    private String category;
    private String medium;
    private List<String> images;
    private List<String> tags;
    private Boolean isAvailable;
    private Boolean featured;
    private DimensionsDto dimensions;
}
