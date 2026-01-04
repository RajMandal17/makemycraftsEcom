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
        
        
        modelMapper.getConfiguration()
            .setSkipNullEnabled(true)
            .setAmbiguityIgnored(true);
            
        
        modelMapper.createTypeMap(Artwork.class, ArtworkDto.class)
            .setPostConverter(context -> {
                Artwork source = context.getSource();
                ArtworkDto destination = context.getDestination();
                
                
                
                
                
                return destination;
            });
        
        return modelMapper;
    }
}
