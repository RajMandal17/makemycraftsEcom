package com.artwork.config;

import com.artwork.dto.ArtworkDto;
import com.artwork.entity.Artwork;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        
        // Configure the model mapper
        modelMapper.getConfiguration()
            .setSkipNullEnabled(true)
            .setAmbiguityIgnored(true);
            
        // Create a custom mapping for Artwork to ArtworkDto
        modelMapper.createTypeMap(Artwork.class, ArtworkDto.class)
            .setPostConverter(context -> {
                Artwork source = context.getSource();
                ArtworkDto destination = context.getDestination();
                
                // Map dimensions manually if needed
                // No need to handle dimensions explicitly as they are 
                // already direct properties in ArtworkDto
                
                return destination;
            });
        
        return modelMapper;
    }
}
