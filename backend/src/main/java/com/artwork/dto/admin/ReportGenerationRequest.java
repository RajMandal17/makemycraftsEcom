package com.artwork.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportGenerationRequest {
    @NotNull(message = "Report type is required")
    @JsonProperty("type")
    private ReportType reportType;

    @NotNull(message = "Report format is required")
    @JsonProperty("format")
    private ReportFormat reportFormat;

    private String startDate; 
    private String endDate;   

    public enum ReportType {
        SALES,
        USER_ACTIVITY,
        ARTWORK_PERFORMANCE,
        REVENUE
    }

    public enum ReportFormat {
        PDF,
        EXCEL,
        CSV
    }
}