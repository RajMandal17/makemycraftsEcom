import React from 'react';

export type CardVariant = 'default' | 'product' | 'artist' | 'collection' | 'testimonial';

export interface CardProps {
    variant?: CardVariant;
    hover?: boolean;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    variant = 'default',
    hover = false,
    children,
    className = '',
    onClick,
}) => {
    
    const baseStyles = 'bg-white rounded-lg overflow-hidden';

    
    const variantStyles: Record<CardVariant, string> = {
        default: 'shadow-md',
        product: 'shadow-md',
        artist: 'shadow-md border border-neutral-100',
        collection: 'shadow-lg',
        testimonial: 'shadow-soft border border-neutral-100',
    };

    
    const hoverStyles = hover
        ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
        : '';

    
    const clickableStyles = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};


export const CardImage: React.FC<{
    src: string;
    alt: string;
    aspectRatio?: 'square' | 'portrait' | 'landscape';
    className?: string;
}> = ({ src, alt, aspectRatio = 'square', className = '' }) => {
    const aspectStyles = {
        square: 'aspect-square',
        portrait: 'aspect-portrait',
        landscape: 'aspect-landscape',
    };

    return (
        <div className={`relative ${aspectStyles[aspectRatio]} overflow-hidden ${className}`}>
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
};

export const CardContent: React.FC<{
    children: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
}> = ({ children, padding = 'md', className = '' }) => {
    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    return (
        <div className={`${paddingStyles[padding]} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    return (
        <div className={`px-4 py-3 border-b border-neutral-100 ${className}`}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    return (
        <div className={`px-4 py-3 border-t border-neutral-100 bg-neutral-50 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
