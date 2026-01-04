package com.artwork.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Flyway configuration to handle failed migrations
 * This will repair the schema history before running migrations
 */
@Configuration
@Profile("railway") // Only apply this in Railway environment
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy repairStrategy() {
        return flyway -> {
            // Repair the schema history to remove failed migration entries
            flyway.repair();
            // Then run the migrations
            flyway.migrate();
        };
    }
}
