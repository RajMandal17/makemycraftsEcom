package com.artwork.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

import java.time.Duration;

/**
 * Cache configuration that supports both Redis and in-memory caching.
 * 
 * To enable Redis caching, set these environment variables:
 * - CACHE_TYPE=redis
 * - REDIS_URL=redis://hostname:port (or rediss:// for SSL with credentials)
 * - REDIS_HEALTH_ENABLED=true (optional, for health checks)
 * 
 * If Redis is not configured, the application falls back to in-memory caching.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${spring.cache.redis.time-to-live:3600}")
    private long timeToLiveSeconds;

    /**
     * Redis cache configuration - only active when cache type is 'redis'
     */
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(timeToLiveSeconds))
                .disableCachingNullValues()
                .serializeValuesWith(SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }

    /**
     * Redis cache manager customizer with specific TTLs for different cache regions
     */
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        return (builder) -> builder
                // Artworks listing (shorter TTL since it changes frequently with filters)
                .withCacheConfiguration("artworks",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10)))
                // Individual artwork (medium TTL as it doesn't change often)
                .withCacheConfiguration("artwork",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                // Artists listing
                .withCacheConfiguration("artists",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(60)))
                // Featured artists (longer TTL as it's curated content)
                .withCacheConfiguration("featuredArtists",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(6)))
                // Featured artworks (curated content)
                .withCacheConfiguration("featuredArtworks",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(4)))
                // User profile data (medium TTL)
                .withCacheConfiguration("users",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                // Categories (long TTL as they rarely change)
                .withCacheConfiguration("categories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(24)))
                // Top selling categories (medium TTL - based on sales data)
                .withCacheConfiguration("topCategories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10)))
                // All categories list (long TTL as categories don't change often)
                .withCacheConfiguration("allCategories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(12)))
                // Active categories for admin (medium TTL)
                .withCacheConfiguration("activeCategories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                // Individual category stats (medium TTL)
                .withCacheConfiguration("categoryStats",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(15)))
                // Home stats (medium TTL - aggregated data)
                .withCacheConfiguration("homeStats",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(5)));
    }

    /**
     * Fallback cache manager when Redis is not enabled
     * Uses in-memory caching as graceful degradation
     */
    @Bean
    @Primary
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "simple", matchIfMissing = true)
    public CacheManager fallbackCacheManager() {
        return new ConcurrentMapCacheManager(
            "artworks", "artwork", "artists", "featuredArtists", 
            "featuredArtworks", "users", "categories", "homeStats",
            "artworksCache", "artworkCache", "featuredArtworksCache",
            "topCategories", "allCategories", "activeCategories", "categoryStats"
        );
    }
}
