'use client';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@shared/lib';

interface AvatarProps { src?: string; fallback: string; className?: string; }

export function Avatar({ src, fallback, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root className={cn('w-8 h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0', className)}>
      <AvatarPrimitive.Image src={src} className="w-full h-full object-cover" />
      <AvatarPrimitive.Fallback className="text-xs font-semibold text-indigo-600 dark:text-indigo-400" delayMs={0}>
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
