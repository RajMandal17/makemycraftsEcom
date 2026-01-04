

export const designTokens = {
    
    
    
    colors: {
        
        primary: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',  
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B',
        },

        
        secondary: {
            50: '#EEF2FF',
            100: '#E0E7FF',
            200: '#C7D2FE',
            300: '#A5B4FC',
            400: '#818CF8',
            500: '#6366F1',  
            600: '#4F46E5',
            700: '#4338CA',
            800: '#3730A3',
            900: '#312E81',
        },

        
        accent: {
            warm: '#F59E0B',    
            cool: '#06B6D4',     
            rose: '#F43F5E',     
        },

        
        neutral: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
        },

        
        semantic: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
        },

        
        dark: {
            bg: {
                primary: '#0F172A',    
                secondary: '#1E293B',  
                tertiary: '#334155',   
            },
            text: {
                primary: '#F1F5F9',
                secondary: '#CBD5E1',
                tertiary: '#94A3B8',
            },
        },
    },

    
    
    
    typography: {
        
        fonts: {
            display: '"Playfair Display", Georgia, serif',
            sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            mono: '"JetBrains Mono", "Courier New", monospace',
        },

        
        fontSize: {
            xs: '0.75rem',      
            sm: '0.875rem',     
            base: '1rem',       
            lg: '1.125rem',     
            xl: '1.333rem',     
            '2xl': '1.777rem',  
            '3xl': '2.369rem',  
            '4xl': '3.157rem',  
            '5xl': '4.209rem',  
        },

        
        fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            black: 900,
        },

        
        lineHeight: {
            tight: 1.25,
            snug: 1.375,
            normal: 1.5,
            relaxed: 1.625,
            loose: 2,
        },

        
        letterSpacing: {
            tighter: '-0.05em',
            tight: '-0.025em',
            normal: '0',
            wide: '0.025em',
            wider: '0.05em',
            widest: '0.1em',
        },
    },

    
    
    
    spacing: {
        0: '0',
        1: '0.25rem',   
        2: '0.5rem',    
        3: '0.75rem',   
        4: '1rem',      
        5: '1.25rem',   
        6: '1.5rem',    
        8: '2rem',      
        10: '2.5rem',   
        12: '3rem',     
        16: '4rem',     
        20: '5rem',     
        24: '6rem',     
        32: '8rem',     
    },

    
    
    
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },

    
    
    
    borderRadius: {
        none: '0',
        sm: '0.25rem',   
        md: '0.5rem',    
        lg: '0.75rem',   
        xl: '1rem',      
        '2xl': '1.5rem', 
        full: '9999px',
    },

    
    
    
    transitions: {
        duration: {
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
        },
        timing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
    },

    
    
    
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },

    
    
    
    container: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },

    
    
    
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
    },
} as const;


export type DesignTokens = typeof designTokens;
export type ColorPalette = typeof designTokens.colors;
export type Typography = typeof designTokens.typography;

export default designTokens;
