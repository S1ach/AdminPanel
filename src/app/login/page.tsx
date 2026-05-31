'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@shared/i18n';
import { useTheme } from '@shared/theme';
import { Input, Button, useToast } from '@shared/ui';
import { cn } from '@shared/lib';

const TRANSLATIONS = {
  ru: {
    title: 'Вход в систему',
    subtitle: 'Панель управления интернет-магазином',
    email: 'Электронная почта',
    password: 'Пароль',
    remember: 'Запомнить меня',
    login: 'Войти',
    loggingIn: 'Вход...',
    helper: 'Использовать демо-аккаунт',
    errorTitle: 'Ошибка авторизации',
    errorDesc: 'Неверный логин или пароль.',
    successTitle: 'Добро пожаловать!',
    successDesc: 'Вход выполнен успешно.',
  },
  en: {
    title: 'Admin Sign In',
    subtitle: 'Store & user management panel',
    email: 'Email address',
    password: 'Password',
    remember: 'Remember me',
    login: 'Sign In',
    loggingIn: 'Signing in...',
    helper: 'Use demo credentials',
    errorTitle: 'Authentication error',
    errorDesc: 'Incorrect email or password.',
    successTitle: 'Welcome back!',
    successDesc: 'Login successful.',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const t = TRANSLATIONS[locale] || TRANSLATIONS.ru;

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const token = localStorage.getItem('auth-token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);

    // Simulate network latency
    setTimeout(() => {
      if (email.trim() === 'admin@admin.com' && password.trim() === 'admin123') {
        localStorage.setItem('auth-token', 'mock-jwt-token');
        localStorage.setItem('profile-name', 'Admin User');
        localStorage.setItem('profile-email', 'admin@admin.com');

        toast(t.successDesc, 'success');
        router.push('/');
      } else {
        toast(t.errorDesc, 'error');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleAutofill = () => {
    setEmail('admin@admin.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center p-4 select-none transition-colors duration-300">
      {/* Soft, calm background gradient orbs (no heavy pulsing) */}
      <div className="absolute top-[5%] left-[5%] w-[45%] h-[45%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[5%] w-[45%] h-[45%] rounded-full bg-purple-500/5 dark:bg-purple-500/[0.03] blur-[100px] pointer-events-none" />

      {/* Floating Toolbar (Language & Theme toggle controls) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Language switch */}
        <button
          onClick={() => setLocale(locale === 'ru' ? 'en' : 'ru')}
          className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-white/[0.02] text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all cursor-pointer shadow-sm"
        >
          {locale === 'ru' ? 'EN' : 'RU'}
        </button>

        {/* Theme switch */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-xl border border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all cursor-pointer shadow-sm flex items-center justify-center"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.06] backdrop-blur-xl shadow-2xl p-8 rounded-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          {/* Logo brand container */}
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-indigo-600 dark:text-indigo-400 fill-current"
              viewBox="0 0 786.66 910.83"
            >
              <path d="M618.39,799.4l-158.12,92.81c-41.72,24.49-89.3,24.92-130.92.63L62.1,736.88C28.29,717.15,3.08,685.5.06,645.26l-.06-377.73c2.63-39.83,26.28-74.76,61.47-92.86L332.13,16.37c34.1-19.94,79.97-22.6,114.73-2.79l275.08,156.72c30.04,17.12,53.96,42.77,61.62,77.44,1.62,7.32,3.1,14.91,3.09,22.97l-.42,372.06c-.04,35.98-21.09,71.15-51.76,89.01l-116.08,67.63ZM524.06,437.39l-182.99,117.87-161.59,105.3,118.09-211.82,94.35-168.97,18.15,32.72,60.68,109.48,53.1-35.39-57.21-105.81-74.54-136.73-115.92,211.54-80.34,146.45-98.52,177.88,182.47.08,67.36-55.75,166.13-137.55,66.23-54.86,118.58-100.55-174.01,106.1ZM685.17,679.9l-58.56-104.89-47.03-84.08-50.2,40.36,84.06,148.75,71.73-.14Z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-widest">
            Admin Panel
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-1 font-medium">
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            label={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@admin.com"
            required
          />

          <Input
            type="password"
            label={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between pt-1 pb-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded border-zinc-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500/20 bg-white dark:bg-white/5 cursor-pointer"
              />
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                {t.remember}
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full flex justify-center py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/15 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-transparent"
            disabled={isLoading || !email.trim() || !password.trim()}
          >
            {isLoading ? t.loggingIn : t.login}
          </Button>
        </form>

        {/* Demo credentials helper card */}
        <div className="mt-6 border-t border-zinc-100 dark:border-white/[0.06] pt-4 text-center">
          <button
            onClick={handleAutofill}
            type="button"
            className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-widest bg-zinc-50 border border-zinc-200 dark:bg-white/[0.02] dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
          >
            <svg
              className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>{t.helper}</span>
          </button>
          <div className="mt-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-500 select-all">
            admin@admin.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
