import React from 'react';

/**
 * SEO Component for MakeMyCrafts
 * 
 * Provides dynamic meta tags for better search engine optimization.
 * Since React doesn't natively support document head manipulation,
 * this component uses useEffect to update meta tags dynamically.
 */

export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    price?: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    rating?: number;
    ratingCount?: number;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    noIndex?: boolean;
}

const BASE_URL = 'https://makemycrafts.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const SITE_NAME = 'MakeMyCrafts';

/**
 * Updates document head with SEO meta tags
 */
export const updateMetaTags = ({
    title = 'MakeMyCrafts - Buy Handmade Artwork, Custom Made Crafts & Homemade Art Online India',
    description = 'MakeMyCrafts - India\'s best marketplace for handmade artwork, custom made crafts & homemade art. Buy unique handcrafted paintings, sculptures & artworks directly from skilled artists.',
    keywords = 'makemycrafts, make my crafts, makemycraft, make my craft, handmade artwork, custom made art, homemade crafts, custom artwork, handmade crafts India, buy artwork online, custom paintings, handcrafted gifts, artisan crafts, artwork marketplace',
    image = DEFAULT_IMAGE,
    url = BASE_URL,
    type = 'website',
    price,
    currency = 'INR',
    availability,
    rating,
    ratingCount,
    author,
    noIndex = false,
}: SEOProps) => {
    // Update title
    document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    // Helper to set or create meta tag
    const setMetaTag = (property: string, content: string, isProperty = false) => {
        const attributeName = isProperty ? 'property' : 'name';
        let element = document.querySelector(`meta[${attributeName}="${property}"]`);

        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attributeName, property);
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    };

    // Primary Meta Tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', image, true);
    setMetaTag('og:site_name', SITE_NAME, true);

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:url', url, true);
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', image, true);

    // Product specific tags
    if (type === 'product' && price !== undefined) {
        setMetaTag('product:price:amount', price.toString(), true);
        setMetaTag('product:price:currency', currency, true);
        if (availability) {
            setMetaTag('product:availability', availability, true);
        }
    }

    // Author for articles
    if (author) {
        setMetaTag('author', author);
    }

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
};

/**
 * Generates JSON-LD structured data for a product (artwork)
 */
export const generateProductSchema = (artwork: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    isAvailable: boolean;
    averageRating?: number;
    totalReviews?: number;
    artist?: {
        firstName: string;
        lastName: string;
    };
}) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: artwork.title,
        description: artwork.description,
        image: artwork.images,
        url: `${BASE_URL}/artworks/${artwork.id}`,
        category: artwork.category,
        brand: {
            '@type': 'Brand',
            name: artwork.artist ? `${artwork.artist.firstName} ${artwork.artist.lastName}` : 'MakeMyCrafts Artist',
        },
        offers: {
            '@type': 'Offer',
            price: artwork.price,
            priceCurrency: 'INR',
            availability: artwork.isAvailable
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: `${BASE_URL}/artworks/${artwork.id}`,
            seller: {
                '@type': 'Organization',
                name: 'MakeMyCrafts',
            },
        },
        ...(artwork.averageRating && artwork.totalReviews && artwork.totalReviews > 0 ? {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: artwork.averageRating,
                reviewCount: artwork.totalReviews,
                bestRating: 5,
                worstRating: 1,
            },
        } : {}),
    };

    return schema;
};

/**
 * Generates JSON-LD structured data for a review
 */
export const generateReviewSchema = (review: {
    id: string;
    rating: number;
    comment: string;
    customerName?: string;
    createdAt: string;
    artworkTitle?: string;
}) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Review',
        reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
        },
        reviewBody: review.comment,
        author: {
            '@type': 'Person',
            name: review.customerName || 'Anonymous',
        },
        datePublished: review.createdAt,
        itemReviewed: {
            '@type': 'Product',
            name: review.artworkTitle || 'Artwork',
        },
    };
};

/**
 * Generates JSON-LD structured data for breadcrumbs
 */
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
};

/**
 * Injects JSON-LD schema into the document head
 */
export const injectSchema = (schema: object, id: string) => {
    // Remove existing schema with same id
    const existing = document.getElementById(id);
    if (existing) {
        existing.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
};

/**
 * React component that uses useEffect to update SEO
 */
const SEO: React.FC<SEOProps> = (props) => {
    React.useEffect(() => {
        updateMetaTags(props);

        // Cleanup function to reset to defaults when component unmounts
        return () => {
            // Optional: Reset to default meta tags
        };
    }, [props]);

    return null; // This component doesn't render anything
};

export default SEO;
