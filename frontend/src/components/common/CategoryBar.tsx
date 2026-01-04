import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { categoryAPI, CategoryStats } from '../../services/categoryAPI';
import { toast } from 'react-toastify';

/**
 * Horizontal Category Bar Component
 * Displays top 10 selling categories with smooth scrolling
 * Follows component composition and separation of concerns
 */

interface CategoryBarProps {
    className?: string;
    onCategorySelect?: (category: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ className = '', onCategorySelect }) => {
    const [categories, setCategories] = useState<CategoryStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Fetch top selling categories on component mount
     */
    useEffect(() => {
        fetchTopCategories();
    }, []);

    /**
     * Update selected category from URL params
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        setSelectedCategory(categoryParam);
    }, [location.search]);

    /**
     * Check scroll position and update arrow visibility
     */
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const checkScroll = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        };

        checkScroll();
        container.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
            container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [categories]);

    /**
     * Fetch top selling categories from API
     */
    const fetchTopCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryAPI.getTopSelling(10);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle category selection
     */
    const handleCategoryClick = (category: CategoryStats) => {
        const categoryValue = category.category;

        // Update selected state
        setSelectedCategory(categoryValue);

        // Call callback if provided
        if (onCategorySelect) {
            onCategorySelect(categoryValue);
        }

        // Navigate to artworks page with category filter
        navigate(`/artworks?category=${encodeURIComponent(categoryValue)}`);
    };

    /**
     * Scroll the category bar
     */
    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 300;
        const targetScroll = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth',
        });
    };

    /**
     * Loading skeleton
     */
    if (loading) {
        return (
            <div className={`bg-white dark:bg-dark-bg border-b border-neutral-200 dark:border-neutral-700 ${className}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        {[...Array(8)].map((_, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Empty state
     */
    if (categories.length === 0) {
        return null;
    }

    return (
        <div className={`bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-bg dark:to-dark-bg border-b border-neutral-200 dark:border-neutral-700 shadow-sm ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="relative">
                    {/* Left Arrow */}
                    {showLeftArrow && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-dark-card shadow-lg rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-110"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                        </button>
                    )}

                    {/* Category Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex items-center space-x-3 overflow-x-auto scrollbar-hide scroll-smooth px-8"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Trending Label */}
                        <div className="flex-shrink-0 flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-lg shadow-md">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-semibold text-sm whitespace-nowrap">Top Categories</span>
                        </div>

                        {/* Category Pills */}
                        {categories.map((category) => {
                            const isSelected = selectedCategory === category.category;

                            return (
                                <button
                                    key={category.category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`
                    flex-shrink-0 group relative px-4 py-2 rounded-lg font-medium text-sm
                    transition-all duration-300 transform hover:scale-105
                    ${isSelected
                                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg scale-105'
                                            : 'bg-white dark:bg-dark-card text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-700 shadow-md hover:shadow-lg'
                                        }
                  `}
                                    aria-label={`Filter by ${category.displayName}`}
                                    aria-pressed={isSelected}
                                >
                                    <div className="flex items-center space-x-2">
                                        {/* Icon - supports both image URLs and emojis */}
                                        {category.icon && category.icon.startsWith('http') ? (
                                            <img 
                                                src={category.icon} 
                                                alt={category.displayName}
                                                className="w-5 h-5 object-contain rounded"
                                                onError={(e) => {
                                                    // Fallback to default emoji if image fails to load
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const fallback = target.nextElementSibling as HTMLElement;
                                                    if (fallback) fallback.style.display = 'inline';
                                                }}
                                            />
                                        ) : (
                                            <span className="text-lg" aria-hidden="true">
                                                {category.icon || '🎨'}
                                            </span>
                                        )}
                                        {/* Hidden fallback emoji for image load failures */}
                                        <span className="text-lg hidden" aria-hidden="true">
                                            🎨
                                        </span>

                                        {/* Category Name */}
                                        <span className="whitespace-nowrap">
                                            {category.displayName}
                                        </span>

                                        {/* Sales Badge */}
                                        {category.salesCount > 0 && (
                                            <span
                                                className={`
                          ml-1 px-2 py-0.5 rounded-full text-xs font-semibold
                          ${isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                                    }
                        `}
                                            >
                                                {category.salesCount}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tooltip on Hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-20">
                                        <div className="font-semibold">{category.displayName}</div>
                                        <div className="text-neutral-300 mt-1">
                                            {category.artworkCount} artworks • {category.salesCount} sales
                                        </div>
                                        {/* Tooltip Arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-800" />
                                    </div>
                                </button>
                            );
                        })}

                        {/* View All Categories */}
                        <button
                            onClick={() => navigate('/artworks')}
                            className="flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                            View All →
                        </button>
                    </div>

                    {/* Right Arrow */}
                    {showRightArrow && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-dark-card shadow-lg rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 hover:scale-110"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                        </button>
                    )}
                </div>
            </div>

            {/* Hide scrollbar CSS */}
            <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
};

export default CategoryBar;
