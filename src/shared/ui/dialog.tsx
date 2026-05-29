'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@shared/lib';

interface DialogProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string; }

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-xl border p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150',
            'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-white/10',
            className,
          )}
        >
          <DialogPrimitive.Title className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{title}</DialogPrimitive.Title>
          {children}
          <DialogPrimitive.Close className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
