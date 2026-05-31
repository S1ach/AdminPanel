'use client';
import React from 'react';
import { cn } from '@shared/lib';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-9 w-full rounded-lg border px-3 text-sm outline-none transition-all duration-150',
            'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400',
            'dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 dark:placeholder:text-zinc-500',
            'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20',
            error && 'border-red-500 focus:border-red-500',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
