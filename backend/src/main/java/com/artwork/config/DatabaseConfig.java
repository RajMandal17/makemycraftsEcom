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


@Configuration
@Slf4j
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    
    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Configuring database connection...");
        
        
        if (databaseUrl != null && !databaseUrl.isEmpty() && 
            (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://"))) {
            
            log.info("Parsing DATABASE_URL in PostgreSQL URI format");
            return createDataSourceFromUri(databaseUrl);
        }
        
        
        if (databaseUrl != null && !databaseUrl.isEmpty() && databaseUrl.startsWith("jdbc:")) {
            log.info("DATABASE_URL already in JDBC format");
            return createDataSourceFromJdbcUrl(databaseUrl);
        }
        
        
        if (springDatasourceUrl != null && !springDatasourceUrl.isEmpty()) {
            log.info("Using spring.datasource.url configuration");
            return createDataSourceFromJdbcUrl(springDatasourceUrl);
        }
        
        throw new IllegalStateException(
            "No database URL configured. Set DATABASE_URL or spring.datasource.url"
        );
    }

    
    private DataSource createDataSourceFromUri(String uriString) {
        try {
            
            String normalizedUri = uriString.replace("postgres://", "postgresql://");
            
            URI uri = new URI(normalizedUri);
            
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String database = uri.getPath().substring(1); 
            
            
            String[] userInfo = uri.getUserInfo().split(":", 2);
            String username = userInfo[0];
            String password = userInfo.length > 1 ? userInfo[1] : "";
            
            
            StringBuilder jdbcUrl = new StringBuilder();
            jdbcUrl.append("jdbc:postgresql://")
                   .append(host)
                   .append(":")
                   .append(port)
                   .append("/")
                   .append(database);
            
            
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

    
    private DataSource createDataSourceFromJdbcUrl(String jdbcUrl) {
        HikariDataSource dataSource = DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .driverClassName("org.postgresql.Driver")
                .url(jdbcUrl)
                .build();
        
        
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(2);
        dataSource.setIdleTimeout(300000);
        dataSource.setConnectionTimeout(30000);
        dataSource.setMaxLifetime(1800000);
        dataSource.setPoolName("HikariPool-Main");
        
        return dataSource;
    }
}
