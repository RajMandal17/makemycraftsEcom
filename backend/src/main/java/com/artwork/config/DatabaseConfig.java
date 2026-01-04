package com.artwork.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Database configuration for DigitalOcean App Platform.
 * 
 * Handles the conversion of DATABASE_URL (PostgreSQL URI format) to JDBC format.
 * DigitalOcean provides: postgresql://user:password@host:port/database
 * Spring Boot needs: jdbc:postgresql://host:port/database with separate credentials
 */
@Configuration
@Slf4j
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    /**
     * Creates a DataSource by parsing DATABASE_URL if it's in PostgreSQL URI format.
     * Falls back to standard Spring configuration if DATABASE_URL is not set.
     */
    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Configuring database connection...");
        
        // Check if DATABASE_URL is set and in PostgreSQL URI format
        if (databaseUrl != null && !databaseUrl.isEmpty() && 
            (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://"))) {
            
            log.info("Parsing DATABASE_URL in PostgreSQL URI format");
            return createDataSourceFromUri(databaseUrl);
        }
        
        // Check if DATABASE_URL is already in JDBC format
        if (databaseUrl != null && !databaseUrl.isEmpty() && databaseUrl.startsWith("jdbc:")) {
            log.info("DATABASE_URL already in JDBC format");
            return createDataSourceFromJdbcUrl(databaseUrl);
        }
        
        // Fall back to spring.datasource.url
        if (springDatasourceUrl != null && !springDatasourceUrl.isEmpty()) {
            log.info("Using spring.datasource.url configuration");
            return createDataSourceFromJdbcUrl(springDatasourceUrl);
        }
        
        throw new IllegalStateException(
            "No database URL configured. Set DATABASE_URL or spring.datasource.url"
        );
    }

    /**
     * Parse PostgreSQL URI format and create DataSource.
     * Format: postgresql://username:password@host:port/database?params
     */
    private DataSource createDataSourceFromUri(String uriString) {
        try {
            // Replace postgres:// with postgresql:// if needed
            String normalizedUri = uriString.replace("postgres://", "postgresql://");
            
            URI uri = new URI(normalizedUri);
            
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String database = uri.getPath().substring(1); // Remove leading slash
            
            // Parse user info
            String[] userInfo = uri.getUserInfo().split(":", 2);
            String username = userInfo[0];
            String password = userInfo.length > 1 ? userInfo[1] : "";
            
            // Build JDBC URL
            StringBuilder jdbcUrl = new StringBuilder();
            jdbcUrl.append("jdbc:postgresql://")
                   .append(host)
                   .append(":")
                   .append(port)
                   .append("/")
                   .append(database);
            
            // Add SSL mode for production
            String query = uri.getQuery();
            if (query != null && query.contains("sslmode=")) {
                jdbcUrl.append("?").append(query);
            } else {
                jdbcUrl.append("?sslmode=require");
            }
            
            log.info("Connecting to PostgreSQL at {}:{}/{}", host, port, database);
            
            HikariDataSource dataSource = DataSourceBuilder.create()
                    .type(HikariDataSource.class)
                    .driverClassName("org.postgresql.Driver")
                    .url(jdbcUrl.toString())
                    .username(username)
                    .password(password)
                    .build();
            
            // Configure HikariCP pool settings for production
            dataSource.setMaximumPoolSize(5);
            dataSource.setMinimumIdle(2);
            dataSource.setIdleTimeout(300000);
            dataSource.setConnectionTimeout(30000);
            dataSource.setMaxLifetime(1800000);
            dataSource.setPoolName("HikariPool-Main");
            
            return dataSource;
            
        } catch (URISyntaxException e) {
            log.error("Failed to parse DATABASE_URL: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid DATABASE_URL format", e);
        }
    }

    /**
     * Create DataSource from a JDBC URL.
     */
    private DataSource createDataSourceFromJdbcUrl(String jdbcUrl) {
        HikariDataSource dataSource = DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .driverClassName("org.postgresql.Driver")
                .url(jdbcUrl)
                .build();
        
        // Configure HikariCP pool settings
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(2);
        dataSource.setIdleTimeout(300000);
        dataSource.setConnectionTimeout(30000);
        dataSource.setMaxLifetime(1800000);
        dataSource.setPoolName("HikariPool-Main");
        
        return dataSource;
    }
}
