'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@shared/i18n';
import { cn } from '@shared/lib';

const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"
      />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  products: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  collapse: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
      />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  expand: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    </svg>
  ),
};

export function Sidebar() {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') {
      setTimeout(() => {
        setCollapsed(true);
      }, 0);
    }
  }, []);

  const toggle = () => {
    setCollapsed((v) => {
      localStorage.setItem('sidebar-collapsed', String(!v));
      return !v;
    });
  };

  const links = [
    { href: '/', icon: icons.dashboard, label: t.nav.dashboard },
    { href: '/users', icon: icons.users, label: t.nav.users },
    { href: '/products', icon: icons.products, label: t.nav.products },
    { href: '/orders', icon: icons.orders, label: t.nav.orders },
    { href: '/calendar', icon: icons.calendar, label: t.nav.calendar },
    { href: '/settings', icon: icons.settings, label: t.nav.settings },
  ];

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const handleSignOut = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('profile-name');
    localStorage.removeItem('profile-avatar');
    localStorage.removeItem('profile-email');
    localStorage.removeItem('profile-bio');
    window.location.reload();
  };

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col border-r transition-all duration-300 flex-shrink-0 z-40',
        'bg-white border-zinc-200 dark:bg-zinc-950 dark:border-white/[0.06]',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-14 flex items-center border-b border-zinc-200 dark:border-white/[0.06] select-none',
          collapsed ? 'justify-center' : 'px-6 gap-3',
        )}
      >
        <svg
          className="w-6 h-6 text-indigo-600 dark:text-indigo-400 fill-current flex-shrink-0"
          viewBox="0 0 786.66 910.83"
        >
          <path d="M618.39,799.4l-158.12,92.81c-41.72,24.49-89.3,24.92-130.92.63L62.1,736.88C28.29,717.15,3.08,685.5.06,645.26l-.06-377.73c2.63-39.83,26.28-74.76,61.47-92.86L332.13,16.37c34.1-19.94,79.97-22.6,114.73-2.79l275.08,156.72c30.04,17.12,53.96,42.77,61.62,77.44,1.62,7.32,3.1,14.91,3.09,22.97l-.42,372.06c-.04,35.98-21.09,71.15-51.76,89.01l-116.08,67.63ZM524.06,437.39l-182.99,117.87-161.59,105.3,118.09-211.82,94.35-168.97,18.15,32.72,60.68,109.48,53.1-35.39-57.21-105.81-74.54-136.73-115.92,211.54-80.34,146.45-98.52,177.88,182.47.08,67.36-55.75,166.13-137.55,66.23-54.86,118.58-100.55-174.01,106.1ZM685.17,679.9l-58.56-104.89-47.03-84.08-50.2,40.36,84.06,148.75,71.73-.14Z" />
        </svg>
        {!collapsed && (
          <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm tracking-wider uppercase">
            Admin Panel
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5">
        {links.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex items-center gap-3 h-10 rounded-xl text-sm transition-all duration-200 group relative',
                collapsed ? 'justify-center px-0' : 'px-3.5',
                active
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/15 dark:bg-indigo-600 dark:text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5',
              )}
              title={collapsed ? l.label : undefined}
            >
              {active ? (
                <span className="text-white">{l.icon}</span>
              ) : (
                <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                  {l.icon}
                </span>
              )}
              {!collapsed && <span className="truncate">{l.label}</span>}
              {active && !collapsed && (
                <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="px-3 border-t border-zinc-200 dark:border-white/[0.06] pt-3">
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center gap-3 h-10 w-full rounded-xl text-sm transition-all duration-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer',
            collapsed ? 'justify-center px-0' : 'px-3.5',
          )}
          title={collapsed ? (locale === 'ru' ? 'Выйти' : 'Sign out') : undefined}
        >
          <span className="text-rose-500">{icons.logout}</span>
          {!collapsed && <span>{locale === 'ru' ? 'Выйти' : 'Sign out'}</span>}
        </button>
      </div>

      <button
        onClick={toggle}
        className="flex items-center justify-center h-10 mx-3 mb-3 mt-1 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
      >
        {collapsed ? icons.expand : icons.collapse}
      </button>
    </aside>
  );
}
