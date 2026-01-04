package com.artwork.controller.admin;

import com.artwork.dto.ArtworkDto;
import com.artwork.dto.ArtworkStatsDto;
import com.artwork.dto.ArtworkUpdateRequest;
import com.artwork.dto.BulkOperationResult;
import com.artwork.service.admin.AdminArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/admin/artworks", "/api/v1/admin/artworks"})
@RequiredArgsConstructor
public class AdminArtworkController {
    
    private final AdminArtworkService adminArtworkService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getArtworks(@RequestParam(defaultValue = "1") int page,
                                        @RequestParam(defaultValue = "20") int limit,
                                        @RequestParam(required = false) String category,
                                        @RequestParam(required = false) String status) {
        Page<ArtworkDto> artworks = adminArtworkService.getArtworks(page, limit, category, status);
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "artworks", artworks.getContent(),
            "total", artworks.getTotalElements(),
            "totalPages", artworks.getTotalPages(),
            "currentPage", artworks.getNumber() + 1
        ));
        response.put("message", "Artworks retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{artworkId}")
    public ResponseEntity<?> updateArtwork(@PathVariable String artworkId,
                                          @RequestBody ArtworkUpdateRequest updateRequest) {
        ArtworkDto artwork = adminArtworkService.updateArtwork(artworkId, updateRequest);
        Map<String, Object> response = new HashMap<>();
        response.put("data", artwork);
        response.put("message", "Artwork updated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{artworkId}")
    public ResponseEntity<?> deleteArtwork(@PathVariable String artworkId) {
        adminArtworkService.deleteArtwork(artworkId);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Artwork deleted successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{artworkId}/approve")
    public ResponseEntity<?> approveArtwork(@PathVariable String artworkId, 
                                          @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        ArtworkDto artwork = adminArtworkService.approveArtwork(artworkId, notes);
        Map<String, Object> response = new HashMap<>();
        response.put("data", artwork);
        response.put("message", "Artwork approved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{artworkId}/reject")
    public ResponseEntity<?> rejectArtwork(@PathVariable String artworkId, 
                                         @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        ArtworkDto artwork = adminArtworkService.rejectArtwork(artworkId, reason);
        Map<String, Object> response = new HashMap<>();
        response.put("data", artwork);
        response.put("message", "Artwork rejected successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{artworkId}/feature")
    public ResponseEntity<?> featureArtwork(@PathVariable String artworkId) {
        ArtworkDto artwork = adminArtworkService.featureArtwork(artworkId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", artwork);
        response.put("message", "Artwork featured successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{artworkId}/feature")
    public ResponseEntity<?> unfeatureArtwork(@PathVariable String artworkId) {
        ArtworkDto artwork = adminArtworkService.unfeatureArtwork(artworkId);
        Map<String, Object> response = new HashMap<>();
        response.put("data", artwork);
        response.put("message", "Artwork unfeatured successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<?> getArtworkStats() {
        ArtworkStatsDto stats = adminArtworkService.getArtworkStats();
        Map<String, Object> response = new HashMap<>();
        response.put("data", stats);
        response.put("message", "Artwork statistics retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/bulk-approve")
    public ResponseEntity<?> bulkApprove(@RequestBody List<String> artworkIds) {
        BulkOperationResult result = adminArtworkService.bulkApprove(artworkIds);
        Map<String, Object> response = new HashMap<>();
        response.put("data", result);
        response.put("message", "Bulk approval completed");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingArtworks() {
        List<ArtworkDto> pendingArtworks = adminArtworkService.getPendingArtworks();
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "artworks", pendingArtworks,
            "count", pendingArtworks.size()
        ));
        response.put("message", "Pending artworks retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{artworkId}/approve-with-category")
    public ResponseEntity<?> approveArtworkWithCategory(
            @PathVariable String artworkId, 
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        ArtworkDto artwork = adminArtworkService.approveArtworkWithCategory(artworkId, notes);
        Map<String, Object> response = new HashMap<>();
        response.put("data", artwork);
        response.put("message", "Artwork and category approved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
