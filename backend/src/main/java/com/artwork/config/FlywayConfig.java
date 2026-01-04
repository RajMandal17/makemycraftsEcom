package com.artwork.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;


@Configuration
@Profile("railway") 
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy repairStrategy() {
        return flyway -> {
            
            flyway.repair();
            
            flyway.migrate();
        };
    }
}
