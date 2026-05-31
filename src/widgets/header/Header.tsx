'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@shared/ui';
import { useI18n } from '@shared/i18n';
import { cn, generateXLS } from '@shared/lib';
import { useGetAnalyticsQuery } from '@entities/analytics';
import { useDebounce } from '@shared/hooks';
import { useGetUsersQuery } from '@entities/user';
import { useGetProductsQuery } from '@entities/product';
import { useGetOrdersQuery } from '@entities/order';

const titleMap: Record<string, (t: Record<string, string>) => string> = {
  '/': (t) => t.dashboard,
  '/users': (t) => t.users,
  '/products': (t) => t.products,
  '/orders': (t) => t.orders,
  '/calendar': (t) => t.calendar,
  '/settings': (t) => t.settings,
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useI18n();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  const [profileName, setProfileName] = useState('Admin User');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [notifications, setNotifications] = useState([
    { id: 1, key: 'newUser', timeRu: '5 мин. назад', timeEn: '5m ago', read: false },
    { id: 2, key: 'newOrder', timeRu: '15 мин. назад', timeEn: '15m ago', read: false },
    { id: 3, key: 'outOfStock', timeRu: '1 час назад', timeEn: '1h ago', read: true },
  ]);

  const { data: analyticsData } = useGetAnalyticsQuery();

  // Global search queries
  const { data: usersRes, isLoading: usersLoading } = useGetUsersQuery(
    { search: debouncedSearch, limit: 3 },
    { skip: !debouncedSearch },
  );
  const { data: productsRes, isLoading: productsLoading } = useGetProductsQuery(
    { search: debouncedSearch, limit: 3 },
    { skip: !debouncedSearch },
  );
  const { data: ordersRes, isLoading: ordersLoading } = useGetOrdersQuery(
    { search: debouncedSearch, limit: 3 },
    { skip: !debouncedSearch },
  );

  const isGlobalSearching = usersLoading || productsLoading || ordersLoading;

  const hasSearchResults = useMemo(() => {
    return (
      (usersRes?.data && usersRes.data.length > 0) ||
      (productsRes?.data && productsRes.data.length > 0) ||
      (ordersRes?.data && ordersRes.data.length > 0)
    );
  }, [usersRes, productsRes, ordersRes]);

  const updateProfile = () => {
    const savedName = localStorage.getItem('profile-name');
    const savedAvatar = localStorage.getItem('profile-avatar');
    if (savedName) setProfileName(savedName);
    if (savedAvatar) {
      setProfileAvatar(savedAvatar);
    } else {
      setProfileAvatar(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateProfile();
    window.addEventListener('profile-update', updateProfile);
    setIsMac(navigator.userAgent.toLowerCase().includes('mac'));

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      const notifContainer = document.getElementById('notifications-dropdown');
      if (notifContainer && !notifContainer.contains(target)) {
        setShowNotif(false);
      }

      const exportContainer = document.getElementById('export-dropdown');
      if (exportContainer && !exportContainer.contains(target)) {
        setShowExport(false);
      }

      const searchContainer = document.getElementById('global-search-container');
      if (searchContainer && !searchContainer.contains(target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    function handleKeyDown(event: KeyboardEvent) {
      const isMacPlatform = navigator.userAgent.toLowerCase().includes('mac');
      const isKCombined =
        event.key.toLowerCase() === 'k' && (isMacPlatform ? event.metaKey : event.ctrlKey);
      const isSlash =
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA';

      if (isKCombined || isSlash) {
        event.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      }

      if (event.key === 'Escape') {
        searchInputRef.current?.blur();
        setShowSearchResults(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('profile-update', updateProfile);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const title = (titleMap[pathname] || (() => ''))(t.nav as unknown as Record<string, string>);

  // Custom greeting for the dashboard
  const displayTitle =
    pathname === '/' ? (
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          {locale === 'ru'
            ? `Привет, ${profileName.split(' ')[0]}!`
            : `Hello, ${profileName.split(' ')[0]}!`}
        </h1>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          {locale === 'ru' ? 'с возвращением' : 'welcome back'}
        </span>
      </div>
    ) : (
      <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
    );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const getNotifText = (key: string) => {
    const texts: Record<string, { ru: string; en: string }> = {
      newUser: { ru: 'Новый пользователь зарегистрировался', en: 'New user registered' },
      newOrder: { ru: 'Новый заказ #1024 на сумму 5,400 ₽', en: 'New order #1024 for 5,400 ₽' },
      outOfStock: {
        ru: 'Товар iPhone 15 Pro закончился на складе',
        en: 'Product iPhone 15 Pro is out of stock',
      },
    };
    return texts[key]?.[locale as 'ru' | 'en'] || key;
  };

  // Helper function to process CSV downloads
  const triggerCSVDownload = (content: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportRevenueReport = () => {
    if (!analyticsData?.revenueByMonth) return;
    const headers = ['month', 'value'];
    const csvContent = [
      headers.join(','),
      ...analyticsData.revenueByMonth.map((row) =>
        headers.map((f) => `"${String(row[f as keyof typeof row]).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\r\n');
    triggerCSVDownload(csvContent, 'revenue_report.csv');
    setShowExport(false);
  };

  const exportRevenueReportXLS = () => {
    if (!analyticsData?.revenueByMonth) return;
    const columns = [
      { key: 'month', label: locale === 'ru' ? 'Месяц' : 'Month', type: 'String' as const },
      {
        key: 'value',
        label: locale === 'ru' ? 'Выручка (₽)' : 'Revenue (RUB)',
        type: 'Number' as const,
      },
    ];
    const data = analyticsData.revenueByMonth.map((row) => ({
      month: row.month,
      value: row.value,
    }));
    generateXLS(data, columns, 'revenue_report.xls', locale === 'ru' ? 'Выручка' : 'Revenue');
    setShowExport(false);
  };

  const exportCategoryReport = () => {
    if (!analyticsData?.salesByCategory) return;
    const headers = ['name', 'value'];
    const csvContent = [
      headers.join(','),
      ...analyticsData.salesByCategory.map((row) =>
        headers.map((f) => `"${String(row[f as keyof typeof row]).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\r\n');
    triggerCSVDownload(csvContent, 'categories_report.csv');
    setShowExport(false);
  };

  const exportCategoryReportXLS = () => {
    if (!analyticsData?.salesByCategory) return;
    const columns = [
      { key: 'name', label: locale === 'ru' ? 'Категория' : 'Category', type: 'String' as const },
      { key: 'value', label: locale === 'ru' ? 'Продажи' : 'Sales', type: 'Number' as const },
    ];
    const data = analyticsData.salesByCategory.map((row) => ({
      name: row.name,
      value: row.value,
    }));
    generateXLS(
      data,
      columns,
      'categories_report.xls',
      locale === 'ru' ? 'Категории' : 'Categories',
    );
    setShowExport(false);
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center">{displayTitle}</div>

      {/* Modern Search Bar */}
      <div
        className="hidden sm:flex items-center relative max-w-xs w-full mx-4"
        id="global-search-container"
      >
        <span className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => setShowSearchResults(true)}
          placeholder={locale === 'ru' ? 'Поиск...' : 'search'}
          className="w-full pl-9 pr-14 py-1.5 bg-zinc-100/70 border border-transparent rounded-full text-xs outline-none transition-all focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-zinc-900 dark:bg-white/5 dark:text-zinc-100 dark:focus:bg-zinc-900 dark:focus:border-indigo-500/50"
        />
        <span className="absolute right-3.5 px-1.5 py-0.5 bg-zinc-200/50 text-[10px] text-zinc-400 dark:bg-white/5 dark:text-zinc-500 rounded font-mono font-bold pointer-events-none select-none">
          {isMac ? '⌘K' : 'Ctrl+K'}
        </span>

        {/* Global Search Results Dropdown Overlay */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 shadow-2xl py-2.5 z-50 overflow-visible animate-in fade-in slide-in-from-top-2 duration-150">
            {search.trim() === '' ? (
              <div className="px-1.5 py-1">
                <span className="px-3.5 py-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                  {locale === 'ru' ? 'Рекомендуем искать' : 'Suggested Searches'}
                </span>
                <div className="flex flex-col gap-0.5">
                  {[
                    {
                      label: locale === 'ru' ? 'Активные заказы' : 'Active orders',
                      query: 'доставлен',
                    },
                    {
                      label: locale === 'ru' ? 'Новые пользователи' : 'New users',
                      query: 'Владислав',
                    },
                    {
                      label: locale === 'ru' ? 'Товар iPhone 15' : 'iPhone 15 product',
                      query: 'iPhone',
                    },
                  ].map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => {
                        setSearch(sug.query);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2.5 transition-colors font-medium rounded-lg"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span>{sug.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : isGlobalSearching ? (
              <div className="px-4 py-3 text-xs text-zinc-400 dark:text-zinc-500 text-center font-medium">
                {locale === 'ru' ? 'Поиск...' : 'Searching...'}
              </div>
            ) : !hasSearchResults ? (
              <div className="px-4 py-4 text-xs text-zinc-400 dark:text-zinc-500 text-center font-medium">
                {locale === 'ru' ? 'Ничего не найдено' : 'No results found'}
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Users category */}
                {usersRes?.data && usersRes.data.length > 0 && (
                  <div>
                    <div
                      onClick={() => {
                        router.push(`/users?search=${encodeURIComponent(search)}`);
                        setSearch('');
                        setShowSearchResults(false);
                      }}
                      className="px-3.5 py-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex justify-between items-center"
                    >
                      <span>{locale === 'ru' ? 'Пользователи' : 'Users'}</span>
                      <span className="text-[9px] lowercase font-normal italic">смотреть все</span>
                    </div>
                    <div className="mt-1 divide-y divide-zinc-100 dark:divide-white/[0.04]">
                      {usersRes.data.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            router.push(`/users?search=${encodeURIComponent(u.name)}`);
                            setSearch('');
                            setShowSearchResults(false);
                          }}
                          className="px-3.5 py-2 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2.5 transition-colors"
                        >
                          <Avatar src={u.avatar} fallback={u.name.charAt(0)} className="w-7 h-7" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products category */}
                {productsRes?.data && productsRes.data.length > 0 && (
                  <div>
                    <div
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(search)}`);
                        setSearch('');
                        setShowSearchResults(false);
                      }}
                      className="px-3.5 py-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex justify-between items-center border-t border-zinc-100 dark:border-white/[0.04] pt-2"
                    >
                      <span>{locale === 'ru' ? 'Товары' : 'Products'}</span>
                      <span className="text-[9px] lowercase font-normal italic">смотреть все</span>
                    </div>
                    <div className="mt-1 divide-y divide-zinc-100 dark:divide-white/[0.04]">
                      {productsRes.data.map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            router.push(`/products?search=${encodeURIComponent(p.name)}`);
                            setSearch('');
                            setShowSearchResults(false);
                          }}
                          className="px-3.5 py-2 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2.5 transition-colors"
                        >
                          <div className="relative group w-8 h-8 flex-shrink-0">
                            {/* Small Thumbnail */}
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-200/50 dark:border-white/10 shadow-sm">
                              <img src={p.photo} alt="" className="w-full h-full object-cover" />
                            </div>

                            {/* Floating Zoomed Preview Popup */}
                            <div
                              className={cn(
                                'absolute left-10 z-50 pointer-events-none opacity-0 scale-95 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200',
                                idx === 0
                                  ? 'top-0'
                                  : idx === productsRes.data.length - 1 &&
                                      productsRes.data.length > 1
                                    ? 'bottom-0'
                                    : 'top-1/2 -translate-y-1/2',
                              )}
                            >
                              <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-2xl bg-white dark:bg-zinc-950 p-0.5">
                                <img
                                  src={p.photo}
                                  alt=""
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 font-mono">
                              {p.price.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders category */}
                {ordersRes?.data && ordersRes.data.length > 0 && (
                  <div>
                    <div
                      onClick={() => {
                        router.push(`/orders?search=${encodeURIComponent(search)}`);
                        setSearch('');
                        setShowSearchResults(false);
                      }}
                      className="px-3.5 py-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex justify-between items-center border-t border-zinc-100 dark:border-white/[0.04] pt-2"
                    >
                      <span>{locale === 'ru' ? 'Заказы' : 'Orders'}</span>
                      <span className="text-[9px] lowercase font-normal italic">смотреть все</span>
                    </div>
                    <div className="mt-1 divide-y divide-zinc-100 dark:divide-white/[0.04]">
                      {ordersRes.data.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            router.push(`/orders?search=${encodeURIComponent(o.client)}`);
                            setSearch('');
                            setShowSearchResults(false);
                          }}
                          className="px-3.5 py-2 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2.5 transition-colors"
                        >
                          <div className="w-[42px] h-8 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-zinc-500 text-[11px] font-mono select-none">
                            #{o.id}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                              {o.client}
                            </p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                              {o.amount.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Export Data Button */}
        <div className="relative" id="export-dropdown">
          <button
            onClick={() => setShowExport(!showExport)}
            className={cn(
              'p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/5 transition-all cursor-pointer outline-none',
              showExport && 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-200',
            )}
            title={locale === 'ru' ? 'Экспорт отчетов' : 'Export reports'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>

          {showExport && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={exportRevenueReport}
                className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5 cursor-pointer font-medium"
              >
                {locale === 'ru' ? 'Отчет по выручке (CSV)' : 'Revenue report (CSV)'}
              </button>
              <button
                onClick={exportRevenueReportXLS}
                className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5 cursor-pointer border-t border-zinc-100 dark:border-white/[0.04] font-medium"
              >
                {locale === 'ru' ? 'Отчет по выручке (XLS)' : 'Revenue report (XLS)'}
              </button>
              <button
                onClick={exportCategoryReport}
                className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5 cursor-pointer border-t border-zinc-100 dark:border-white/[0.04] font-medium"
              >
                {locale === 'ru' ? 'Отчет по категориям (CSV)' : 'Category stats (CSV)'}
              </button>
              <button
                onClick={exportCategoryReportXLS}
                className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5 cursor-pointer border-t border-zinc-100 dark:border-white/[0.04] font-medium"
              >
                {locale === 'ru' ? 'Отчет по категориям (XLS)' : 'Category stats (XLS)'}
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell Button */}
        <div className="relative" id="notifications-dropdown">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className={cn(
              'relative p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/5 transition-all cursor-pointer outline-none',
              showNotif && 'bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-200',
            )}
            title={locale === 'ru' ? 'Уведомления' : 'Notifications'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {locale === 'ru' ? 'Уведомления' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    {locale === 'ru' ? 'Отметить все' : 'Mark all as read'}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {locale === 'ru' ? 'Нет новых уведомлений' : 'No new notifications'}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={cn(
                        'px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer flex gap-3 transition-colors border-b border-zinc-100 last:border-0 dark:border-white/[0.04]',
                        !n.read && 'bg-indigo-50/20 dark:bg-indigo-500/[0.02]',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-xs leading-normal',
                            n.read
                              ? 'text-zinc-600 dark:text-zinc-400'
                              : 'text-zinc-900 dark:text-zinc-100 font-medium',
                          )}
                        >
                          {getNotifText(n.key)}
                        </p>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                          {locale === 'ru' ? n.timeRu : n.timeEn}
                        </span>
                      </div>
                      {!n.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-zinc-200 dark:border-white/[0.08] px-4 py-2 bg-zinc-50/50 dark:bg-white/[0.01]">
                <Link
                  href="/settings?tab=notifications"
                  onClick={() => setShowNotif(false)}
                  className="block text-center text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium py-1"
                >
                  {locale === 'ru' ? 'Настройки уведомлений' : 'Notification Settings'}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User profile section */}
        <div className="flex items-center gap-3 pl-3 border-l border-zinc-200 dark:border-white/[0.06]">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {profileName}
          </span>
          <Avatar
            src={profileAvatar || undefined}
            fallback={
              profileName
                ? profileName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'A'
            }
          />
        </div>
      </div>
    </header>
  );
}
