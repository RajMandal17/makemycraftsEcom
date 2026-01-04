package com.artwork.repository;

import com.artwork.entity.SocialLinks;
import com.artwork.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SocialLinksRepository extends JpaRepository<SocialLinks, String> {
    Optional<SocialLinks> findByUser(User user);
}
