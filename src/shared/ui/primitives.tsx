import { cn } from '@shared/lib';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border p-5 bg-white border-zinc-200 dark:bg-white/[0.03] dark:border-white/[0.06]', className)}>
      {children}
    </div>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}>
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-lg bg-zinc-200 dark:bg-white/5 animate-pulse', className)} />;
}
