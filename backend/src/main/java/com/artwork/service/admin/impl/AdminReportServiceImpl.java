package com.artwork.service.admin.impl;

import com.artwork.dto.admin.ReportGenerationRequest;
import com.artwork.dto.admin.ReportGenerationResponse;
import com.artwork.entity.*;
import com.artwork.repository.*;
import com.artwork.service.admin.AdminReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;

/**
 * Admin Report Service Implementation
 * Generates reports in PDF, Excel, and CSV formats
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminReportServiceImpl implements AdminReportService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;
    private final OrderItemRepository orderItemRepository;

    // In-memory storage for generated reports (in production, use Redis or database)
    private final Map<String, ReportData> reportStorage = new HashMap<>();

    @Override
    public ReportGenerationResponse generateReport(ReportGenerationRequest request) {
        try {
            log.info("Generating {} report for type: {} from {} to {}",
                    request.getReportFormat(), request.getReportType(), request.getStartDate(), request.getEndDate());

            String reportId = UUID.randomUUID().toString();
            byte[] reportData;

            switch (request.getReportFormat().toString()) {
                case "PDF":
                    reportData = generatePdfReport(request);
                    break;
                case "EXCEL":
                    reportData = generateExcelReport(request);
                    break;
                case "CSV":
                    reportData = generateCsvReport(request);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported format: " + request.getReportFormat());
            }

            // Store report data
            ReportData report = new ReportData(reportData, request.getReportFormat().toString(), request.getReportType().toString());
            reportStorage.put(reportId, report);

            return ReportGenerationResponse.builder()
                    .reportId(reportId)
                    .filename(getReportFilename(reportId))
                    .message("Report generated successfully")
                    .success(true)
                    .build();

        } catch (Exception e) {
            log.error("Error generating report", e);
            return ReportGenerationResponse.builder()
                    .message("Failed to generate report: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    @Override
    public byte[] downloadReport(String reportId) {
        ReportData report = reportStorage.get(reportId);
        if (report == null) {
            throw new RuntimeException("Report not found: " + reportId);
        }
        return report.getData();
    }

    @Override
    public String getReportFilename(String reportId) {
        ReportData report = reportStorage.get(reportId);
        if (report == null) {
            return "report.unknown";
        }

        String extension = switch (report.getFormat().toUpperCase()) {
            case "PDF" -> "pdf";
            case "EXCEL" -> "xlsx";
            case "CSV" -> "csv";
            default -> "unknown";
        };

        return report.getType().toLowerCase() + "_report_" +
               LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) +
               "." + extension;
    }

    private byte[] generatePdfReport(ReportGenerationRequest request) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Add title
        com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph title = new Paragraph(request.getReportType().toString().replace("_", " ") + " Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        // Add date range
        com.lowagie.text.Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Paragraph dateRange = new Paragraph(
                "Period: " + request.getStartDate() + " to " + request.getEndDate(), normalFont);
        document.add(dateRange);
        document.add(new Paragraph(" "));

        // Generate content based on type
        switch (request.getReportType().toString()) {
            case "SALES":
                generateSalesPdfContent(document, request);
                break;
            case "USER_ACTIVITY":
                generateUserActivityPdfContent(document, request);
                break;
            case "ARTWORK_PERFORMANCE":
                generateArtworkPerformancePdfContent(document, request);
                break;
            case "REVENUE":
                generateRevenuePdfContent(document, request);
                break;
        }

        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateExcelReport(ReportGenerationRequest request) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(request.getReportType().toString().replace("_", " ") + " Report");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            int rowNum = 0;

            // Generate content based on type
            switch (request.getReportType().toString()) {
                case "SALES":
                    rowNum = generateSalesExcelContent(sheet, headerStyle, rowNum, request);
                    break;
                case "USER_ACTIVITY":
                    rowNum = generateUserActivityExcelContent(sheet, headerStyle, rowNum, request);
                    break;
                case "ARTWORK_PERFORMANCE":
                    rowNum = generateArtworkPerformanceExcelContent(sheet, headerStyle, rowNum, request);
                    break;
                case "REVENUE":
                    rowNum = generateRevenueExcelContent(sheet, headerStyle, rowNum, request);
                    break;
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private byte[] generateCsvReport(ReportGenerationRequest request) {
        StringBuilder csv = new StringBuilder();

        // Generate content based on type
        switch (request.getReportType().toString()) {
            case "SALES":
                csv.append(generateSalesCsvContent(request));
                break;
            case "USER_ACTIVITY":
                csv.append(generateUserActivityCsvContent(request));
                break;
            case "ARTWORK_PERFORMANCE":
                csv.append(generateArtworkPerformanceCsvContent(request));
                break;
            case "REVENUE":
                csv.append(generateRevenueCsvContent(request));
                break;
        }

        return csv.toString().getBytes();
    }

    // PDF Content Generators
    private void generateSalesPdfContent(Document document, ReportGenerationRequest request) throws IOException {
        com.lowagie.text.Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        com.lowagie.text.Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(request.getEndDate()).atTime(23, 59, 59);

        log.info("Generating sales report from {} to {}", startDate, endDate);

        List<Order> orders = orderRepository.findOrdersByDateRange(startDate, endDate);

        log.info("Found {} orders in date range", orders.size());

        document.add(new Paragraph("Total Orders: " + orders.size(), boldFont));

        Double totalRevenue = orders.stream()
                .filter(order -> Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CONFIRMED).contains(order.getStatus()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        document.add(new Paragraph("Total Revenue: ₹" + totalRevenue, boldFont));
        document.add(new Paragraph(" "));

        // Add order details table
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell("Order ID");
        table.addCell("Customer");
        table.addCell("Amount");
        table.addCell("Status");

        for (Order order : orders) {
            table.addCell(order.getId().substring(0, 8) + "...");
            table.addCell(order.getCustomer() != null ?
                    order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName() : "Unknown");
            table.addCell("₹" + (order.getTotalAmount() != null ? order.getTotalAmount().toString() : "0"));
            table.addCell(order.getStatus().toString());
        }

        document.add(table);
    }

    private void generateUserActivityPdfContent(Document document, ReportGenerationRequest request) throws IOException {
        com.lowagie.text.Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        long totalUsers = userRepository.count();
        long newUsers = userRepository.countByCreatedAtAfter(startDate);
        long activeArtists = userRepository.countByRoleAndStatus(Role.ARTIST, UserStatus.APPROVED);

        document.add(new Paragraph("Total Users: " + totalUsers, boldFont));
        document.add(new Paragraph("New Users in Period: " + newUsers, boldFont));
        document.add(new Paragraph("Active Artists: " + activeArtists, boldFont));
    }

    private void generateArtworkPerformancePdfContent(Document document, ReportGenerationRequest request) throws IOException {
        com.lowagie.text.Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        long totalArtworks = artworkRepository.count();
        long approvedArtworks = artworkRepository.countByApprovalStatus(ApprovalStatus.APPROVED);
        List<Artwork> topSelling = artworkRepository.findTopSellingArtworks(org.springframework.data.domain.PageRequest.of(0, 10));

        document.add(new Paragraph("Total Artworks: " + totalArtworks, boldFont));
        document.add(new Paragraph("Approved Artworks: " + approvedArtworks, boldFont));
        document.add(new Paragraph("Top Selling Artworks:", boldFont));
        document.add(new Paragraph(" "));

        for (Artwork artwork : topSelling) {
            document.add(new Paragraph("- " + artwork.getTitle() + " by " +
                    (artwork.getArtist() != null ? artwork.getArtist().getFirstName() + " " + artwork.getArtist().getLastName() : "Unknown")));
        }
    }

    private void generateRevenuePdfContent(Document document, ReportGenerationRequest request) throws IOException {
        com.lowagie.text.Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

        BigDecimal totalRevenue = orderRepository.getTotalSalesAmount();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(request.getEndDate()).atTime(23, 59, 59);

        List<Order> recentOrders = orderRepository.findOrdersByDateRange(startDate, endDate);

        Double periodRevenue = recentOrders.stream()
                .filter(order -> Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CONFIRMED).contains(order.getStatus()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        document.add(new Paragraph("Total Revenue (All Time): ₹" + totalRevenue, boldFont));
        document.add(new Paragraph("Revenue in Period: ₹" + periodRevenue, boldFont));
        document.add(new Paragraph("Orders in Period: " + recentOrders.size(), boldFont));
    }

    // Excel Content Generators
    private int generateSalesExcelContent(Sheet sheet, CellStyle headerStyle, int rowNum, ReportGenerationRequest request) {
        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Order ID");
        headerRow.createCell(1).setCellValue("Customer");
        headerRow.createCell(2).setCellValue("Amount");
        headerRow.createCell(3).setCellValue("Status");
        headerRow.createCell(4).setCellValue("Date");

        for (int i = 0; i < 5; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(request.getEndDate()).atTime(23, 59, 59);

        List<Order> orders = orderRepository.findOrdersByDateRange(startDate, endDate);

        for (Order order : orders) {
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(order.getId());
            row.createCell(1).setCellValue(order.getCustomer() != null ?
                    order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName() : "Unknown");
            row.createCell(2).setCellValue(order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0);
            row.createCell(3).setCellValue(order.getStatus().toString());
            row.createCell(4).setCellValue(order.getCreatedAt().toString());
        }

        return rowNum;
    }

    private int generateUserActivityExcelContent(Sheet sheet, CellStyle headerStyle, int rowNum, ReportGenerationRequest request) {
        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Metric");
        headerRow.createCell(1).setCellValue("Value");

        for (int i = 0; i < 2; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        long totalUsers = userRepository.count();
        long newUsers = userRepository.countByCreatedAtAfter(startDate);
        long activeArtists = userRepository.countByRoleAndStatus(Role.ARTIST, UserStatus.APPROVED);

        org.apache.poi.ss.usermodel.Row row1 = sheet.createRow(rowNum++);
        row1.createCell(0).setCellValue("Total Users");
        row1.createCell(1).setCellValue(totalUsers);

        org.apache.poi.ss.usermodel.Row row2 = sheet.createRow(rowNum++);
        row2.createCell(0).setCellValue("New Users in Period");
        row2.createCell(1).setCellValue(newUsers);

        org.apache.poi.ss.usermodel.Row row3 = sheet.createRow(rowNum++);
        row3.createCell(0).setCellValue("Active Artists");
        row3.createCell(1).setCellValue(activeArtists);

        return rowNum;
    }

    private int generateArtworkPerformanceExcelContent(Sheet sheet, CellStyle headerStyle, int rowNum, ReportGenerationRequest request) {
        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Artwork Title");
        headerRow.createCell(1).setCellValue("Artist");
        headerRow.createCell(2).setCellValue("Price");
        headerRow.createCell(3).setCellValue("Status");

        for (int i = 0; i < 4; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }

        List<Artwork> artworks = artworkRepository.findByApprovalStatus(ApprovalStatus.APPROVED,
                org.springframework.data.domain.PageRequest.of(0, 100)).getContent();

        for (Artwork artwork : artworks) {
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(artwork.getTitle());
            row.createCell(1).setCellValue(artwork.getArtist() != null ?
                    artwork.getArtist().getFirstName() + " " + artwork.getArtist().getLastName() : "Unknown");
            row.createCell(2).setCellValue(artwork.getPrice() != null ? artwork.getPrice().doubleValue() : 0);
            row.createCell(3).setCellValue(artwork.getApprovalStatus().toString());
        }

        return rowNum;
    }

    private int generateRevenueExcelContent(Sheet sheet, CellStyle headerStyle, int rowNum, ReportGenerationRequest request) {
        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(rowNum++);
        headerRow.createCell(0).setCellValue("Metric");
        headerRow.createCell(1).setCellValue("Value");

        for (int i = 0; i < 2; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }

        BigDecimal totalRevenue = orderRepository.getTotalSalesAmount();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(request.getEndDate()).atTime(23, 59, 59);

        List<Order> recentOrders = orderRepository.findOrdersByDateRange(startDate, endDate);

        Double periodRevenue = recentOrders.stream()
                .filter(order -> Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CONFIRMED).contains(order.getStatus()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        org.apache.poi.ss.usermodel.Row row1 = sheet.createRow(rowNum++);
        row1.createCell(0).setCellValue("Total Revenue (All Time)");
        row1.createCell(1).setCellValue(totalRevenue.doubleValue());

        org.apache.poi.ss.usermodel.Row row2 = sheet.createRow(rowNum++);
        row2.createCell(0).setCellValue("Revenue in Period");
        row2.createCell(1).setCellValue(periodRevenue);

        org.apache.poi.ss.usermodel.Row row3 = sheet.createRow(rowNum++);
        row3.createCell(0).setCellValue("Orders in Period");
        row3.createCell(1).setCellValue(recentOrders.size());

        return rowNum;
    }

    // CSV Content Generators
    private String generateSalesCsvContent(ReportGenerationRequest request) {
        StringBuilder csv = new StringBuilder();
        csv.append("Order ID,Customer,Amount,Status,Date\n");

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(request.getEndDate()).atTime(23, 59, 59);

        List<Order> orders = orderRepository.findOrdersByDateRange(startDate, endDate);

        for (Order order : orders) {
            csv.append(order.getId()).append(",");
            csv.append(order.getCustomer() != null ?
                    escapeCsv(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName()) : "Unknown").append(",");
            csv.append(order.getTotalAmount() != null ? order.getTotalAmount().toString() : "0").append(",");
            csv.append(order.getStatus().toString()).append(",");
            csv.append(order.getCreatedAt().toString()).append("\n");
        }

        return csv.toString();
    }

    private String generateUserActivityCsvContent(ReportGenerationRequest request) {
        StringBuilder csv = new StringBuilder();
        csv.append("Metric,Value\n");

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        long totalUsers = userRepository.count();
        long newUsers = userRepository.countByCreatedAtAfter(startDate);
        long activeArtists = userRepository.countByRoleAndStatus(Role.ARTIST, UserStatus.APPROVED);

        csv.append("Total Users,").append(totalUsers).append("\n");
        csv.append("New Users in Period,").append(newUsers).append("\n");
        csv.append("Active Artists,").append(activeArtists).append("\n");

        return csv.toString();
    }

    private String generateArtworkPerformanceCsvContent(ReportGenerationRequest request) {
        StringBuilder csv = new StringBuilder();
        csv.append("Artwork Title,Artist,Price,Status\n");

        List<Artwork> artworks = artworkRepository.findByApprovalStatus(ApprovalStatus.APPROVED,
                org.springframework.data.domain.PageRequest.of(0, 100)).getContent();

        for (Artwork artwork : artworks) {
            csv.append(escapeCsv(artwork.getTitle())).append(",");
            csv.append(artwork.getArtist() != null ?
                    escapeCsv(artwork.getArtist().getFirstName() + " " + artwork.getArtist().getLastName()) : "Unknown").append(",");
            csv.append(artwork.getPrice() != null ? artwork.getPrice().toString() : "0").append(",");
            csv.append(artwork.getApprovalStatus().toString()).append("\n");
        }

        return csv.toString();
    }

    private String generateRevenueCsvContent(ReportGenerationRequest request) {
        StringBuilder csv = new StringBuilder();
        csv.append("Metric,Value\n");

        BigDecimal totalRevenue = orderRepository.getTotalSalesAmount();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        LocalDateTime startDate = LocalDate.parse(request.getStartDate()).atStartOfDay();
        LocalDateTime endDate = LocalDate.parse(request.getEndDate()).atTime(23, 59, 59);

        List<Order> recentOrders = orderRepository.findOrdersByDateRange(startDate, endDate);

        Double periodRevenue = recentOrders.stream()
                .filter(order -> Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CONFIRMED).contains(order.getStatus()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        csv.append("Total Revenue (All Time),").append(totalRevenue).append("\n");
        csv.append("Revenue in Period,").append(periodRevenue).append("\n");
        csv.append("Orders in Period,").append(recentOrders.size()).append("\n");

        return csv.toString();
    }

    private String escapeCsv(String value) {
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    // Inner class for report data storage
    private static class ReportData {
        private final byte[] data;
        private final String format;
        private final String type;

        public ReportData(byte[] data, String format, String type) {
            this.data = data;
            this.format = format;
            this.type = type;
        }

        public byte[] getData() { return data; }
        public String getFormat() { return format; }
        public String getType() { return type; }
    }
}