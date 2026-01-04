package com.artwork.controller;

import com.artwork.dto.UserDto;
import com.artwork.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
public class ArtistController {
    
    private final ArtistService artistService;

    @GetMapping
    public ResponseEntity<?> getAllArtists(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 12, sort = "lastName") Pageable pageable) {
        Page<UserDto> artists = artistService.getAllArtists(search, pageable);
        return ResponseEntity.ok(Map.of(
                "artists", artists.getContent(),
                "total", artists.getTotalElements(),
                "totalPages", artists.getTotalPages(),
                "currentPage", artists.getNumber()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArtistById(@PathVariable String id) {
        UserDto artist = artistService.getArtistById(id);
        return ResponseEntity.ok(artist);
    }

    // LinkedIn-style username-based profile lookup
    // Note: This must come before /{id} to avoid path conflicts
    // Use /username/{username} to differentiate from ID-based lookup
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getArtistByUsername(@PathVariable String username) {
        UserDto artist = artistService.getArtistByUsername(username);
        return ResponseEntity.ok(artist);
    }
    
    // Check if username is available for profile creation/update
    @GetMapping("/username-available")
    public ResponseEntity<?> checkUsernameAvailability(@RequestParam String username) {
        boolean available = artistService.isUsernameAvailable(username);
        return ResponseEntity.ok(Map.of(
            "username", username,
            "available", available,
            "message", available ? "Username is available" : "Username is already taken or invalid"
        ));
    }
    
    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedArtists() {
        List<UserDto> featuredArtists = artistService.getFeaturedArtists();
        return ResponseEntity.ok(Map.of("artists", featuredArtists));
    }
}
