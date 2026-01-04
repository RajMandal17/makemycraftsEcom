import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Search, Mail } from 'lucide-react';

export type InputVariant = 'text' | 'search' | 'email' | 'password' | 'number';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    variant?: InputVariant;
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            variant = 'text',
            label,
            error,
            helperText,
            fullWidth = false,
            icon,
            className = '',
            ...props
        },
        ref
    ) => {
        // Base input styles
        const baseInputStyles = 'px-4 py-2.5 border rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

        // State styles
        const stateStyles = error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500';

        // Width style
        const widthStyle = fullWidth ? 'w-full' : '';

        // Icon padding
        const iconPadding = icon ? 'pl-11' : '';

        // Get icon based on variant
        const getVariantIcon = () => {
            switch (variant) {
                case 'search':
                    return <Search className="h-5 w-5 text-neutral-400" />;
                case 'email':
                    return <Mail className="h-5 w-5 text-neutral-400" />;
                default:
                    return icon;
            }
        };

        const displayIcon = getVariantIcon();

        // Get input type based on variant
        const getInputType = () => {
            switch (variant) {
                case 'email':
                    return 'email';
                case 'password':
                    return 'password';
                case 'number':
                    return 'number';
                default:
                    return 'text';
            }
        };

        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {displayIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {displayIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={getInputType()}
                        className={`
              ${baseInputStyles}
              ${stateStyles}
              ${widthStyle}
              ${iconPadding}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
                {!error && helperText && (
                    <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
