package com.artwork.controller;

import com.artwork.entity.Artwork;
import com.artwork.repository.ArtworkRepository;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;


@RestController
@RequiredArgsConstructor
@Slf4j
@Hidden  
public class SitemapController {

    private final ArtworkRepository artworkRepository;
    
    private static final String BASE_URL = "https://makemycrafts.com";
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_DATE;

    
    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    @Transactional(readOnly = true)
    public ResponseEntity<String> getSitemap() {
        log.info("Generating sitemap.xml");
        
        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http:
        xml.append("        xmlns:image=\"http:
        
        
        addUrl(xml, "/", "1.0", "daily");
        addUrl(xml, "/artworks", "0.9", "daily");
        addUrl(xml, "/artists", "0.8", "weekly");
        addUrl(xml, "/about", "0.5", "monthly");
        addUrl(xml, "/contact", "0.5", "monthly");
        
        
        try {
            List<Artwork> artworks = artworkRepository.findAll();
            log.info("Adding {} artworks to sitemap", artworks.size());
            
            for (Artwork artwork : artworks) {
                addArtworkUrl(xml, artwork);
            }
        } catch (Exception e) {
            log.error("Error fetching artworks for sitemap: {}", e.getMessage());
        }
        
        xml.append("</urlset>");
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(xml.toString());
    }

    
    private void addUrl(StringBuilder xml, String path, String priority, String changeFreq) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escapeXml(BASE_URL + path)).append("</loc>\n");
        xml.append("    <changefreq>").append(changeFreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("    <lastmod>").append(LocalDateTime.now().format(ISO_DATE)).append("</lastmod>\n");
        xml.append("  </url>\n");
    }

    
    private void addArtworkUrl(StringBuilder xml, Artwork artwork) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(escapeXml(BASE_URL + "/artworks/" + artwork.getId())).append("</loc>\n");
        xml.append("    <changefreq>weekly</changefreq>\n");
        xml.append("    <priority>0.7</priority>\n");
        
        
        if (artwork.getUpdatedAt() != null) {
            xml.append("    <lastmod>").append(artwork.getUpdatedAt().format(ISO_DATE)).append("</lastmod>\n");
        } else if (artwork.getCreatedAt() != null) {
            xml.append("    <lastmod>").append(artwork.getCreatedAt().format(ISO_DATE)).append("</lastmod>\n");
        }
        
        
        if (artwork.getImages() != null && !artwork.getImages().isEmpty()) {
            for (String image : artwork.getImages()) {
                if (image != null && !image.isEmpty()) {
                    xml.append("    <image:image>\n");
                    xml.append("      <image:loc>").append(escapeXml(image)).append("</image:loc>\n");
                    xml.append("      <image:title>").append(escapeXml(artwork.getTitle())).append("</image:title>\n");
                    if (artwork.getDescription() != null) {
                        String caption = artwork.getDescription().length() > 200 
                            ? artwork.getDescription().substring(0, 200) + "..."
                            : artwork.getDescription();
                        xml.append("      <image:caption>").append(escapeXml(caption)).append("</image:caption>\n");
                    }
                    xml.append("    </image:image>\n");
                }
            }
        }
        
        xml.append("  </url>\n");
    }

    
    private String escapeXml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    
    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getRobotsTxt() {
        StringBuilder robots = new StringBuilder();
        robots.append("User-agent: *\n");
        robots.append("Allow: /\n\n");
        robots.append("# Disallow admin areas\n");
        robots.append("Disallow: /dashboard/\n");
        robots.append("Disallow: /api/\n\n");
        robots.append("# Sitemap\n");
        robots.append("Sitemap: ").append(BASE_URL).append("/sitemap.xml\n");
        
        return ResponseEntity.ok(robots.toString());
    }
}
