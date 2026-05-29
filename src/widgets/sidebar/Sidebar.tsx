'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@shared/i18n';
import { cn } from '@shared/lib';

const icons = {
  dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>,
  users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  products: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  orders: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  collapse: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>,
  expand: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>,
};

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((v) => { localStorage.setItem('sidebar-collapsed', String(!v)); return !v; });
  };

  const links = [
    { href: '/', icon: icons.dashboard, label: t.nav.dashboard },
    { href: '/users', icon: icons.users, label: t.nav.users },
    { href: '/products', icon: icons.products, label: t.nav.products },
    { href: '/orders', icon: icons.orders, label: t.nav.orders },
    { href: '/settings', icon: icons.settings, label: t.nav.settings },
  ];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className={cn(
      'h-screen sticky top-0 flex flex-col border-r transition-all duration-300 flex-shrink-0',
      'bg-white border-zinc-200 dark:bg-zinc-950 dark:border-white/[0.06]',
      collapsed ? 'w-16' : 'w-56',
    )}>
      <div className="h-14 flex items-center px-4 gap-2.5 border-b border-zinc-200 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        {!collapsed && <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">Admin Panel</span>}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={cn(
              'flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-all duration-150',
              collapsed && 'justify-center px-0',
              isActive(l.href)
                ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-500/10 dark:text-indigo-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5',
            )}
            title={collapsed ? l.label : undefined}
          >
            {l.icon}
            {!collapsed && <span className="truncate">{l.label}</span>}
          </Link>
        ))}
      </nav>

      <button onClick={toggle}
        className="flex items-center justify-center h-10 mx-2 mb-3 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
      >
        {collapsed ? icons.expand : icons.collapse}
      </button>
    </aside>
  );
}
