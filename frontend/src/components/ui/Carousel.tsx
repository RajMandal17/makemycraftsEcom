import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

export type CarouselVariant = 'hero' | 'product' | 'artist';

export interface CarouselProps {
    children: React.ReactNode[];
    variant?: CarouselVariant;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showNavigation?: boolean;
    showIndicators?: boolean;
    itemsPerView?: number;
    gap?: number;
    className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
    children,
    variant = 'product',
    autoPlay = false,
    autoPlayInterval = 5000,
    showNavigation = true,
    showIndicators = true,
    itemsPerView = 1,
    gap = 16,
    className = '',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { ref: inViewRef, inView } = useInView({
        threshold: 0.1,
        triggerOnce: false,
    });

    const totalItems = children.length;
    const maxIndex = Math.max(0, totalItems - itemsPerView);

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay || !inView || isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, inView, isHovered, maxIndex]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(Math.min(index, maxIndex));
    };

    // Variant-specific styles
    const variantStyles: Record<CarouselVariant, string> = {
        hero: 'h-[400px] md:h-[600px]',
        product: 'h-auto',
        artist: 'h-auto',
    };

    return (
        <div
            ref={inViewRef}
            className={`relative ${variantStyles[variant]} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Carousel Container */}
            <div className="overflow-hidden h-full" ref={containerRef}>
                <div
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                        gap: `${gap}px`,
                    }}
                >
                    {children.map((child, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 h-full"
                            style={{
                                width: `calc(${100 / itemsPerView}% - ${gap * (itemsPerView - 1) / itemsPerView}px)`,
                            }}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            {showNavigation && totalItems > itemsPerView && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-6 w-6 text-neutral-700" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-neutral-100 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-6 w-6 text-neutral-700" />
                    </button>
                </>
            )}

            {/* Indicators */}
            {showIndicators && totalItems > itemsPerView && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'w-8 bg-white'
                                    : 'w-2 bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Hero Carousel Slide Component
export const HeroSlide: React.FC<{
    image: string;
    title: string;
    description?: string;
    cta?: {
        text: string;
        onClick: () => void;
    };
}> = ({ image, title, description, cta }) => {
    return (
        <div className="relative h-full w-full">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-3xl">
                    <h2 className="text-4xl md:text-6xl font-display font-bold mb-4 animate-fade-in">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-xl md:text-2xl mb-6 animate-slide-up">
                            {description}
                        </p>
                    )}
                    {cta && (
                        <button
                            onClick={cta.onClick}
                            className="bg-white text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:bg-neutral-100 transition-all shadow-lg animate-slide-up"
                        >
                            {cta.text}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Carousel;
