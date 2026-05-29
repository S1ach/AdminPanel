'use client';
import { usePathname } from 'next/navigation';
import { Avatar } from '@shared/ui';
import { useI18n } from '@shared/i18n';

const titleMap: Record<string, (t: Record<string, string>) => string> = {
  '/': (t) => t.dashboard,
  '/users': (t) => t.users,
  '/products': (t) => t.products,
  '/orders': (t) => t.orders,
  '/settings': (t) => t.settings,
};

export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();

  const title = (titleMap[pathname] || (() => ''))(t.nav as unknown as Record<string, string>);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Admin</span>
        <Avatar fallback="A" />
      </div>
    </header>
  );
}
