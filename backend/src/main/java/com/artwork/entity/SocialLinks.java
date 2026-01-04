package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "social_links")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLinks {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
    
    private String instagram;
    private String twitter;
    private String facebook;
}
