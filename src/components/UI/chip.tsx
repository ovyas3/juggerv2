'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChipProps {
    label: string;
    onRemove?: () => void;
    className?: string;
}

export function Chip({ label, onRemove, className }: ChipProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground',
                className
            )}
        >
            <span>{label}</span>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-full p-0.5 hover:bg-secondary-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                </button>
            )}
        </div>
    );
}
