'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({
        label,
        error,
        hint,
        leftIcon,
        rightIcon,
        fullWidth = false,
        className,
        ...props
    }, ref) => {
        return (
            <div className={`${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={twMerge(
                            'block shadow-sm rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
                            fullWidth && 'w-full',
                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error ? (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                ) : hint ? (
                    <p className="mt-1 text-sm text-gray-500">{hint}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Legacy default export for backward compatibility
export default Input; 