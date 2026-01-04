package com.artwork.service.impl;

import com.artwork.dto.UserDto;
import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.UserRepository;
import com.artwork.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import java.util.Map;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArtistServiceImpl implements ArtistService {

    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<UserDto> getAllArtists(String search, Pageable pageable) {
        Page<User> artists;
        
        
        if (search != null && !search.trim().isEmpty()) {
            artists = userRepository.findByRoleAndStatusApprovedAndNameContaining(Role.ARTIST, search.toLowerCase(), pageable);
        } else {
            artists = userRepository.findByRoleAndStatusApproved(Role.ARTIST, pageable);
        }
        
        return artists.map(artist -> mapToArtistDto(artist));
    }

    @Override
    public UserDto getArtistById(String id) {
        User artist = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with ID: " + id));
                
        if (artist.getRole() != Role.ARTIST) {
            throw new ResourceNotFoundException("User is not an artist");
        }
                
        return mapToArtistDto(artist);
    }

    @Override
    public UserDto getArtistByUsername(String username) {
        User artist = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with username: " + username));
                
        if (artist.getRole() != Role.ARTIST) {
            throw new ResourceNotFoundException("User with username '" + username + "' is not an artist");
        }
                
        return mapToArtistDto(artist);
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        
        if (!username.matches("^[a-zA-Z0-9_-]{3,50}$")) {
            return false;
        }
        return !userRepository.existsByUsername(username);
    }

    @Override
    public List<UserDto> getFeaturedArtists() {
        
        
        List<User> featuredArtists = userRepository.findByRole(Role.ARTIST)
                .stream()
                .limit(5)
                .collect(Collectors.toList());
                
        return featuredArtists.stream()
                .map(this::mapToArtistDto)
                .collect(Collectors.toList());
    }
    
    private UserDto mapToArtistDto(User artist) {
        UserDto dto = modelMapper.map(artist, UserDto.class);
        
        
        long artworkCount = artworkRepository.countByArtistId(artist.getId());
        dto.setArtworkCount(artworkCount);
        dto.setAverageRating(getArtistAverageRating(artist.getId()));
        
        return dto;
    }
    
    private double getArtistAverageRating(String artistId) {
        Double averageRating = artworkRepository.getAverageRatingForArtist(artistId);
        return averageRating != null ? averageRating : 0.0;
    }
}
