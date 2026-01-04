package com.artwork;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;

/**
 * Main application class for the Artwork E-commerce Platform.
 * 
 * Monolithic architecture with integrated payment, KYC, and payout services.
 * 
 * Redis auto-configuration is excluded by default and only enabled when 
 * CACHE_TYPE=redis is set (see ConditionalRedisConfig).
 * 
 * Reactive WebSocket is excluded to ensure servlet-based WebSocket (with SockJS) works.
 * 
 * @author Artwork Platform
 */
@SpringBootApplication(exclude = {
    RedisAutoConfiguration.class,
    RedisRepositoriesAutoConfiguration.class
})
public class ArtworkEcommerceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ArtworkEcommerceApplication.class, args);
    }
}
