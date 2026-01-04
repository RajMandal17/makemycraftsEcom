package com.artwork.service.admin;

import com.artwork.dto.admin.ReportGenerationRequest;
import com.artwork.dto.admin.ReportGenerationResponse;


public interface AdminReportService {

    
    ReportGenerationResponse generateReport(ReportGenerationRequest request);

    
    byte[] downloadReport(String reportId);

    
    String getReportFilename(String reportId);
}