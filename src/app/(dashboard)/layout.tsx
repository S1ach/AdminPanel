'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@widgets/sidebar';
import { Header } from '@widgets/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      router.push('/login');
    } else {
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 0);
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0f] text-zinc-400 select-none">
        {/* Sleek Glowing Loading Spinner */}
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <span className="absolute w-12 h-12 rounded-full border-2 border-indigo-500/10 dark:border-white/5" />
          <span className="absolute w-12 h-12 rounded-full border-2 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
          {/* Thunderbolt Emblem inside loader */}
          <svg
            className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse fill-current"
            viewBox="0 0 786.66 910.83"
          >
            <path d="M618.39,799.4l-158.12,92.81c-41.72,24.49-89.3,24.92-130.92.63L62.1,736.88C28.29,717.15,3.08,685.5.06,645.26l-.06-377.73c2.63-39.83,26.28-74.76,61.47-92.86L332.13,16.37c34.1-19.94,79.97-22.6,114.73-2.79l275.08,156.72c30.04,17.12,53.96,42.77,61.62,77.44,1.62,7.32,3.1,14.91,3.09,22.97l-.42,372.06c-.04,35.98-21.09,71.15-51.76,89.01l-116.08,67.63ZM524.06,437.39l-182.99,117.87-161.59,105.3,118.09-211.82,94.35-168.97,18.15,32.72,60.68,109.48,53.1-35.39-57.21-105.81-74.54-136.73-115.92,211.54-80.34,146.45-98.52,177.88,182.47.08,67.36-55.75,166.13-137.55,66.23-54.86,118.58-100.55-174.01,106.1ZM685.17,679.9l-58.56-104.89-47.03-84.08-50.2,40.36,84.06,148.75,71.73-.14Z" />
          </svg>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 animate-pulse">
          Загрузка...
        </span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-6 pb-6 pt-6">{children}</main>
      </div>
    </div>
  );
}
