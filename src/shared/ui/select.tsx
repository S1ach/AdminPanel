'use client';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@shared/lib';

interface SelectOption {
  label: string;
  value: string;
}
interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder, className }: SelectProps) {
  const ALL = '__all__';
  const safeValue = value || ALL;
  const safeOptions = options.map((o) => ({ ...o, value: o.value || ALL }));

  return (
    <SelectPrimitive.Root value={safeValue} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-9 items-center justify-between rounded-lg border px-3 text-sm outline-none transition-all cursor-pointer gap-2 whitespace-nowrap min-w-0',
          'bg-white border-zinc-300 text-zinc-700 data-[placeholder]:text-zinc-400',
          'dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 dark:data-[placeholder]:text-zinc-500',
          'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20',
          className,
        )}
      >
        <span className="truncate block min-w-0 text-left flex-1">
          <SelectPrimitive.Value placeholder={placeholder || 'Select...'} />
        </span>
        <SelectPrimitive.Icon className="text-zinc-400 flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 overflow-hidden rounded-lg border shadow-xl bg-white border-zinc-200 dark:bg-zinc-900 dark:border-white/10 animate-in fade-in-0 zoom-in-95 duration-150"
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className="p-1">
            {safeOptions.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="flex items-center h-8 px-3 text-sm rounded-md cursor-pointer outline-none transition-colors text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 data-[state=checked]:text-indigo-600 dark:data-[state=checked]:text-indigo-400"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
