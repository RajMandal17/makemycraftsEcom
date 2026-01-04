package com.artwork.service.admin;

import com.artwork.dto.admin.ReportGenerationRequest;
import com.artwork.dto.admin.ReportGenerationResponse;

/**
 * Admin Report Service Interface
 * Handles report generation, storage, and retrieval for admin users
 */
public interface AdminReportService {

    /**
     * Generate a report based on the request parameters
     */
    ReportGenerationResponse generateReport(ReportGenerationRequest request);

    /**
     * Download a generated report by ID
     */
    byte[] downloadReport(String reportId);

    /**
     * Get the filename for a report
     */
    String getReportFilename(String reportId);
}