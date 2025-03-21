'use client';

import React, { forwardRef } from 'react';
import { ReactNode, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    bordered?: boolean;
    elevated?: boolean;
    title?: string;
    subtitle?: string;
    footer?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
    children,
    className,
    bordered = false,
    elevated = false,
    title,
    subtitle,
    footer,
    ...props
}, ref) => {
    const classes = twMerge(
        'bg-white rounded-lg overflow-hidden',
        bordered && 'border border-green-100',
        elevated && 'shadow-md',
        className
    );

    return (
        <div ref={ref} className={classes} {...props}>
            {(title || subtitle) && (
                <div className="px-6 py-4 border-b border-green-50">
                    {title && <h3 className="text-lg font-medium text-gray-800">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            )}

            <div className="px-6 py-4">{children}</div>

            {footer && (
                <div className="px-6 py-3 bg-green-50 border-t border-green-100">
                    {footer}
                </div>
            )}
        </div>
    );
});

Card.displayName = 'Card';

// Legacy default export for backward compatibility
export default Card; 