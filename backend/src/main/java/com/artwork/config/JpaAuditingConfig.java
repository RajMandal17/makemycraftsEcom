package com.artwork.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing configuration.
 * Enables automatic population of @CreatedDate and @LastModifiedDate fields.
 * 
 * @author Artwork Platform
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
