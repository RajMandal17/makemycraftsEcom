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


@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${cors.allowed-origins}")
    private String corsAllowedOrigins;
    
    
    private static final long SERVER_HEARTBEAT = 25000; 
    private static final long CLIENT_HEARTBEAT = 25000; 

    
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
        
        
        config.enableSimpleBroker("/topic", "/queue")
              .setHeartbeatValue(new long[]{SERVER_HEARTBEAT, CLIENT_HEARTBEAT})
              .setTaskScheduler(websocketHeartbeatScheduler());
        
        
        config.setApplicationDestinationPrefixes("/app");
        
        
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        log.info("Registering WebSocket STOMP endpoints with allowed origins: {}", corsAllowedOrigins);
        
        
        String[] origins = corsAllowedOrigins.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        
        
        
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  
                .withSockJS()
                .setHeartbeatTime(SERVER_HEARTBEAT)
                .setDisconnectDelay(5000)
                .setStreamBytesLimit(512 * 1024)
                .setHttpMessageCacheSize(1000)
                .setSessionCookieNeeded(false)
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");
        
        
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
