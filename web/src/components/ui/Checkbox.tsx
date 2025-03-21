'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    description?: string;
    error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, description, error, className, disabled, ...props }, ref) => {
        return (
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                        type="checkbox"
                        ref={ref}
                        className={twMerge(
                            'h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500',
                            disabled && 'opacity-50 cursor-not-allowed',
                            error && 'border-red-300 focus:ring-red-500',
                            className
                        )}
                        disabled={disabled}
                        {...props}
                    />
                </div>

                {(label || description) && (
                    <div className="ml-2 text-sm">
                        {label && (
                            <label
                                className={twMerge(
                                    'font-medium text-gray-700',
                                    disabled && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                {label}
                            </label>
                        )}

                        {description && (
                            <p className={twMerge(
                                'text-gray-500',
                                disabled && 'opacity-50'
                            )}>
                                {description}
                            </p>
                        )}

                        {error && (
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

// Legacy default export for backward compatibility
export default Checkbox; 