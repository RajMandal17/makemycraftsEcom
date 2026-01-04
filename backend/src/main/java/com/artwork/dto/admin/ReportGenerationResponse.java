package com.artwork.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportGenerationResponse {
    private String reportId;
    private String filename;
    private String message;
    private boolean success;
}