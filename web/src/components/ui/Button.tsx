'use client';

import React, { forwardRef } from "react";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from 'tailwind-merge';
import Link, { LinkProps } from "next/link";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    asChild?: boolean;
    href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant = "primary",
        size = "md",
        loading,
        className,
        asChild = false,
        href,
        ...props
    }, ref) => {
        const baseStyles = "inline-flex items-center justify-center font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

        const variantStyles = {
            primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
            secondary: "bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-400",
            outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-green-500",
            ghost: "text-gray-700 hover:bg-gray-100 focus:ring-green-500",
        };

        const sizeStyles = {
            sm: "text-sm px-3 py-2",
            md: "text-base px-4 py-2",
            lg: "text-lg px-6 py-3",
        };

        const classes = twMerge(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            loading && "opacity-70 cursor-not-allowed",
            className
        );

        if (href) {
            return (
                <Link
                    href={href}
                    className={classes}
                    {...(props as any)}
                >
                    {loading && (
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    )}
                    {children}
                </Link>
            );
        }

        return (
            <button
                className={classes}
                ref={ref}
                disabled={loading}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";