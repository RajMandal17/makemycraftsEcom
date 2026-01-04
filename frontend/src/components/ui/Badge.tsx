import React from 'react';

export type BadgeVariant = 'new' | 'sale' | 'topSeller' | 'soldOut' | 'featured' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
    variant?: BadgeVariant;
    size?: BadgeSize;
    children: React.ReactNode;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({
    variant = 'neutral',
    size = 'md',
    children,
    className = '',
}) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';

    // Variant styles
    const variantStyles: Record<BadgeVariant, string> = {
        new: 'bg-blue-100 text-blue-800 border border-blue-200',
        sale: 'bg-red-100 text-red-800 border border-red-200',
        topSeller: 'bg-amber-100 text-amber-800 border border-amber-200',
        soldOut: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
        featured: 'bg-purple-100 text-purple-800 border border-purple-200',
        success: 'bg-green-100 text-green-800 border border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        error: 'bg-red-100 text-red-800 border border-red-200',
        info: 'bg-blue-100 text-blue-800 border border-blue-200',
        neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    };

    // Size styles
    const sizeStyles: Record<BadgeSize, string> = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    return (
        <span
            className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
        >
            {children}
        </span>
    );
};

export default Badge;
