package com.artwork.service;

import com.artwork.dto.ArtworkDto;
import com.artwork.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ArtworkService {
    Page<ArtworkDto> getArtworks(int page, int limit, String category, Double minPrice, Double maxPrice, String search, String artistId);
    ArtworkDto getArtworkById(String id);
    List<ArtworkDto> getFeaturedArtworks();
    ArtworkDto createArtwork(String title, String description, Double price, String category, String medium, Double width, Double height, Double depth, List<String> tags, List<MultipartFile> images, User artist);
    ArtworkDto updateArtwork(String id, ArtworkDto artworkDto);
    void deleteArtwork(String id);
}
