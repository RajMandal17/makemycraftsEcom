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


@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${spring.cache.redis.time-to-live:3600}")
    private long timeToLiveSeconds;

    
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(timeToLiveSeconds))
                .disableCachingNullValues()
                .serializeValuesWith(SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }

    
    @Bean
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        return (builder) -> builder
                
                .withCacheConfiguration("artworks",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10)))
                
                .withCacheConfiguration("artwork",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                
                .withCacheConfiguration("artists",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(60)))
                
                .withCacheConfiguration("featuredArtists",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(6)))
                
                .withCacheConfiguration("featuredArtworks",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(4)))
                
                .withCacheConfiguration("users",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                
                .withCacheConfiguration("categories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(24)))
                
                .withCacheConfiguration("topCategories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10)))
                
                .withCacheConfiguration("allCategories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(12)))
                
                .withCacheConfiguration("activeCategories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                
                .withCacheConfiguration("categoryStats",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(15)))
                
                .withCacheConfiguration("homeStats",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(5)));
    }

    
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
