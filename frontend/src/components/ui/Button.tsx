import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            disabled,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        // Base styles
        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        // Variant styles
        const variantStyles: Record<ButtonVariant, string> = {
            primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
            secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-sm hover:shadow-md',
            outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
            ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
        };

        // Size styles
        const sizeStyles: Record<ButtonSize, string> = {
            xs: 'text-xs px-2.5 py-1.5 rounded',
            sm: 'text-sm px-3 py-2 rounded-md',
            md: 'text-base px-4 py-2.5 rounded-md',
            lg: 'text-lg px-6 py-3 rounded-lg',
            xl: 'text-xl px-8 py-4 rounded-lg',
        };

        // Width style
        const widthStyle = fullWidth ? 'w-full' : '';

        // Icon size based on button size
        const iconSizeMap: Record<ButtonSize, string> = {
            xs: 'h-3 w-3',
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
            xl: 'h-7 w-7',
        };

        const iconSize = iconSizeMap[size];

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${widthStyle}
          ${className}
        `}
                {...props}
            >
                {loading && (
                    <Loader2 className={`${iconSize} mr-2 animate-spin`} />
                )}
                {!loading && leftIcon && (
                    <span className={`mr-2 ${iconSize} flex items-center`}>{leftIcon}</span>
                )}
                {children}
                {!loading && rightIcon && (
                    <span className={`ml-2 ${iconSize} flex items-center`}>{rightIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
