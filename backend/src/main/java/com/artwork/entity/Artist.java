package com.artwork.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "artists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artist {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String userId;

    private String bio;
    private String website;
    private String instagram;
    private String twitter;
    private String facebook;
    private Boolean isApproved = false;

    @OneToOne
    @JoinColumn(name = "userId", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;
}
