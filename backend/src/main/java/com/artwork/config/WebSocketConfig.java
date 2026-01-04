package com.artwork.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * WebSocket Configuration for Real-Time Updates
 * 
 * Optimized for low server cost:
 * - Uses simple in-memory broker (no external message queue needed)
 * - Long heartbeat intervals to reduce network chatter
 * - Message size limits to prevent memory issues
 */
@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${cors.allowed-origins}")
    private String corsAllowedOrigins;
    
    // Heartbeat intervals (in milliseconds)
    private static final long SERVER_HEARTBEAT = 25000; // 25 seconds
    private static final long CLIENT_HEARTBEAT = 25000; // 25 seconds

    /**
     * Task scheduler for heartbeats - create as @Bean for proper initialization
     */
    @Bean(name = "websocketHeartbeatScheduler")
    public ThreadPoolTaskScheduler websocketHeartbeatScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.setDaemon(true);
        return scheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        log.info("Configuring WebSocket message broker");
        
        // Use simple in-memory broker
        config.enableSimpleBroker("/topic", "/queue")
              .setHeartbeatValue(new long[]{SERVER_HEARTBEAT, CLIENT_HEARTBEAT})
              .setTaskScheduler(websocketHeartbeatScheduler());
        
        // Prefix for messages FROM clients TO server
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefix for user-specific messages
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("Registering WebSocket STOMP endpoints with allowed origins: {}", corsAllowedOrigins);
        
        // Parse and clean allowed origins
        String[] origins = corsAllowedOrigins.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        
        // Register STOMP endpoint with SockJS fallback
        // Using setAllowedOriginPatterns for Spring Boot 2.4+ compatibility
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // Allow all origins for SockJS
                .withSockJS()
                .setHeartbeatTime(SERVER_HEARTBEAT)
                .setDisconnectDelay(5000)
                .setStreamBytesLimit(512 * 1024)
                .setHttpMessageCacheSize(1000)
                .setSessionCookieNeeded(false)
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");
        
        // Also register native WebSocket endpoint (without SockJS)
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*");
        
        log.info("WebSocket endpoints registered: /ws (SockJS), /ws-native (native)");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(64 * 1024);
        registration.setSendBufferSizeLimit(512 * 1024);
        registration.setSendTimeLimit(20 * 1000);
    }
}
