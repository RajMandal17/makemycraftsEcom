import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';

export interface MasonryGridProps {
    children: React.ReactNode[];
    breakpointCols?: {
        default: number;
        1536?: number;
        1280?: number;
        1024?: number;
        768?: number;
        640?: number;
    };
    gap?: number;
    className?: string;
    columnClassName?: string;
    lazyLoad?: boolean;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
    children,
    breakpointCols = {
        default: 4,
        1536: 4,
        1280: 3,
        1024: 3,
        768: 2,
        640: 1,
    },
    gap = 24,
    className = '',
    columnClassName = '',
    lazyLoad = true,
}) => {
    const [visibleItems, setVisibleItems] = useState<number>(lazyLoad ? 8 : children.length);
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        triggerOnce: false,
    });

    // Load more items when scrolling
    useEffect(() => {
        if (inView && lazyLoad && visibleItems < children.length) {
            const timer = setTimeout(() => {
                setVisibleItems((prev) => Math.min(prev + 4, children.length));
            }, 100);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [inView, lazyLoad, visibleItems, children.length]);

    const itemsToShow = lazyLoad ? children.slice(0, visibleItems) : children;

    return (
        <div className={className}>
            <Masonry
                breakpointCols={breakpointCols}
                className="flex -ml-6 w-auto"
                columnClassName={`pl-6 bg-clip-padding ${columnClassName}`}
                style={{ marginLeft: `-${gap}px` }}
            >
                {itemsToShow.map((child, index) => (
                    <div
                        key={index}
                        className="mb-6 animate-fade-in"
                        style={{ marginBottom: `${gap}px` }}
                    >
                        {child}
                    </div>
                ))}
            </Masonry>

            {/* Load More Trigger */}
            {lazyLoad && visibleItems < children.length && (
                <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

// Masonry Item Wrapper with Hover Effect
export const MasonryItem: React.FC<{
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
    return (
        <div
            className={`
        bg-white rounded-lg overflow-hidden shadow-md
        transition-all duration-300
        hover:shadow-xl hover:-translate-y-1
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default MasonryGrid;
