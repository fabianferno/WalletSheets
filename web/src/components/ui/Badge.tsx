'use client';

import React, { forwardRef } from 'react';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
    dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
    children,
    variant = 'default',
    size = 'md',
    className,
    dot = false,
    ...props
}, ref) => {
    const variantStyles = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-green-100 text-green-800',
        success: 'bg-emerald-100 text-emerald-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };

    const sizeStyles = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
    };

    return (
        <span
            ref={ref}
            className={twMerge(
                'inline-flex items-center font-medium rounded-full',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span
                    className={twMerge(
                        'h-1.5 w-1.5 rounded-full mr-1.5',
                        variant === 'default' && 'bg-gray-400',
                        variant === 'primary' && 'bg-green-400',
                        variant === 'success' && 'bg-emerald-400',
                        variant === 'warning' && 'bg-amber-400',
                        variant === 'danger' && 'bg-red-400',
                        variant === 'info' && 'bg-blue-400'
                    )}
                />
            )}
            {children}
        </span>
    );
});

Badge.displayName = 'Badge';

// Legacy default export for backward compatibility
export default Badge; 