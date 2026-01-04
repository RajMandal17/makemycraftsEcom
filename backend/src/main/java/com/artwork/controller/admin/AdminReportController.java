package com.artwork.controller.admin;

import com.artwork.dto.admin.ReportGenerationRequest;
import com.artwork.dto.admin.ReportGenerationResponse;
import com.artwork.service.admin.AdminReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

/**
 * Admin Report Controller
 * Handles report generation, download, and format listing for admin users
 */
@RestController
@RequestMapping({"/api/admin/reports", "/api/v1/admin/reports"})
@RequiredArgsConstructor
@Slf4j
public class AdminReportController {

    private final AdminReportService adminReportService;

    /**
     * Generate a report
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportGenerationResponse> generateReport(@RequestBody ReportGenerationRequest request) {
        log.info("Generating {} report for type: {} from {} to {}",
                request.getReportFormat(), request.getReportType(), request.getStartDate(), request.getEndDate());

        ReportGenerationResponse response = adminReportService.generateReport(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Download a generated report
     */
    @GetMapping("/download/{reportId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadReport(@PathVariable String reportId) {
        log.info("Downloading report: {}", reportId);

        byte[] reportData = adminReportService.downloadReport(reportId);
        String filename = adminReportService.getReportFilename(reportId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }

    /**
     * Get available report formats
     */
    @GetMapping("/formats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getReportFormats() {
        List<String> formats = Arrays.asList("PDF", "EXCEL", "CSV");
        return ResponseEntity.ok(formats);
    }
}