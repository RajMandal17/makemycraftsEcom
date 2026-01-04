package com.artwork.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Scheduling configuration.
 * Enables @Scheduled annotations for background tasks.
 * 
 * @author Artwork Platform
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
