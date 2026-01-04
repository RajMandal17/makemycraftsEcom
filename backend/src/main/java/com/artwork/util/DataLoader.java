package com.artwork.util;

import com.artwork.entity.Artwork;
import com.artwork.entity.User;
import com.artwork.entity.Role;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private static final String ADMIN_PASSWORD_ENV = "ADMIN_DEFAULT_PASSWORD";

    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        
        ensureAdminUserExists();
        
        
        if (artworkRepository.count() > 0 && userRepository.count() > 1) {
            log.info("Database already has data, not loading sample data");
            return;
        }

        
        createSampleUsers();
        
        
       
        
        log.info("Sample data loaded successfully");
    }
    
    private void ensureAdminUserExists() {
        
        if (userRepository.findByEmail("admin@artwork.com").isPresent()) {
            log.info("Admin user already exists");
            return;
        }
        
        
        String adminPassword = System.getenv(ADMIN_PASSWORD_ENV);
        if (adminPassword == null || adminPassword.trim().isEmpty()) {
            adminPassword = UUID.randomUUID().toString(); 
            log.warn("No {} set. Generated random password: {}", ADMIN_PASSWORD_ENV, adminPassword);
        }
        
        
        User admin = new User();
        admin.setId(UUID.randomUUID().toString());
        admin.setEmail("admin@artwork.com");
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setUsername("admin");
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        
        
        try {
            userRepository.save(admin);
            log.info("Admin user created successfully with email: admin@artwork.com");
            if (System.getenv(ADMIN_PASSWORD_ENV) != null) {
                log.info("Use the password from {} environment variable", ADMIN_PASSWORD_ENV);
            }
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.info("Admin user already exists, skipping creation");
        }
    }

    private void createSampleUsers() {
        List<User> users = new ArrayList<>();
        
        
        String adminPassword = System.getenv(ADMIN_PASSWORD_ENV);
        if (adminPassword == null || adminPassword.trim().isEmpty()) {
            adminPassword = UUID.randomUUID().toString(); 
        }
        
        
        User admin = new User();
        admin.setId(UUID.randomUUID().toString());
        admin.setEmail("admin@artwork.com");
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setUsername("admin");
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        users.add(admin);
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        try {
            userRepository.saveAll(users);
            log.info("Created {} sample users", users.size());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.info("Sample users already exist, skipping creation");
        }
    }

    private void createSampleArtworks() {
        List<User> artists = userRepository.findByRole(Role.ARTIST);
        if (artists.isEmpty()) {
            System.out.println("No artists found, skipping artwork creation");
            return;
        }
        
        List<Artwork> artworks = new ArrayList<>();
        
        
        List<String> categories = Arrays.asList(
            "Painting", "Photography", "Sculpture", "Digital Art", 
            "Mixed Media", "Drawing", "Abstract", "Portrait"
        );
        
        
        List<String> media = Arrays.asList(
            "Oil on Canvas", "Acrylic", "Watercolor", "Digital", 
            "Photography", "Bronze", "Marble", "Mixed Media",
            "Charcoal", "Pencil", "Clay", "Wood"
        );
        
        
        for (User artist : artists) {
            for (int i = 0; i < 5; i++) {
                Artwork artwork = new Artwork();
                artwork.setId(UUID.randomUUID().toString());
                artwork.setTitle("Artwork " + (i + 1) + " by " + artist.getFirstName());
                artwork.setDescription("This is a beautiful artwork created by " + artist.getFirstName() + " " + artist.getLastName());
                artwork.setPrice(100.0 + (Math.random() * 900));
                artwork.setCategory(categories.get((int) (Math.random() * categories.size())));
                artwork.setMedium(media.get((int) (Math.random() * media.size())));
                
                
                artwork.setWidth(20.0 + (Math.random() * 50));
                artwork.setHeight(20.0 + (Math.random() * 50));
                if (Math.random() > 0.5) {
                    artwork.setDepth(2.0 + (Math.random() * 10));
                }
                
                
                artwork.setImages(Arrays.asList(
                    "https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg",
                    "https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg"
                ));
                
                
                artwork.setTags(Arrays.asList("art", "creative", artist.getFirstName().toLowerCase(), artwork.getCategory().toLowerCase()));
                
                
                artwork.setArtist(artist);
                
                
                artwork.setAvailable(Math.random() > 0.2); 
                
                artworks.add(artwork);
            }
        }
        
        artworkRepository.saveAll(artworks);
        System.out.println("Created " + artworks.size() + " sample artworks");
    }
}
