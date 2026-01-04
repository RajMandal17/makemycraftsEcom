package com.artwork.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * Conditional Redis configuration.
 * 
 * Redis is only enabled when CACHE_TYPE=redis is set.
 * This prevents Spring from trying to create Redis beans with an empty/invalid URL.
 */
@Configuration
@ConditionalOnProperty(name = "spring.cache.type", havingValue = "redis")
@Import({RedisAutoConfiguration.class, RedisRepositoriesAutoConfiguration.class})
public class ConditionalRedisConfig {
    // This configuration only imports Redis auto-configuration when CACHE_TYPE=redis
}
