import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface TableProps {
    children: ReactNode;
    className?: string;
    striped?: boolean;
    bordered?: boolean;
    compact?: boolean;
}

export function Table({
    children,
    className,
    striped = false,
    bordered = true,
    compact = false,
}: TableProps) {
    return (
        <div className="overflow-x-auto">
            <table
                className={twMerge(
                    'min-w-full divide-y divide-green-200',
                    bordered && 'border border-green-200 rounded-md',
                    className
                )}
            >
                {children}
            </table>
        </div>
    );
}

interface TableHeadProps {
    children: ReactNode;
    className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
    return (
        <thead className={twMerge('bg-green-50', className)}>
            {children}
        </thead>
    );
}

interface TableBodyProps {
    children: ReactNode;
    className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
    return (
        <tbody
            className={twMerge(
                'bg-white divide-y divide-green-100',
                className
            )}
        >
            {children}
        </tbody>
    );
}

interface TableRowProps {
    children: ReactNode;
    className?: string;
    isSelected?: boolean;
}

export function TableRow({ children, className, isSelected = false }: TableRowProps) {
    return (
        <tr
            className={twMerge(
                'hover:bg-green-50 transition-colors',
                isSelected && 'bg-green-100 hover:bg-green-100',
                className
            )}
        >
            {children}
        </tr>
    );
}

interface TableCellProps {
    children: ReactNode;
    className?: string;
    isHeader?: boolean;
    align?: 'left' | 'center' | 'right';
}

export function TableCell({
    children,
    className,
    isHeader = false,
    align = 'left',
}: TableCellProps) {
    const Component = isHeader ? 'th' : 'td';

    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    return (
        <Component
            className={twMerge(
                'px-4 py-3 whitespace-nowrap text-sm',
                isHeader && 'font-medium text-gray-700 border-b border-green-200',
                !isHeader && 'font-normal text-gray-600',
                alignClass[align],
                className
            )}
        >
            {children}
        </Component>
    );
} 