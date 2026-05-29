'use client';
import { useState } from 'react';
import { useTheme, type Theme } from '@shared/theme';
import { useI18n, type Locale } from '@shared/i18n';
import { Card, Input, Button, useToast } from '@shared/ui';
import { cn } from '@shared/lib';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const { toast } = useToast();

  const [profile, setProfile] = useState({ name: 'Admin User', email: 'admin@example.com', bio: '' });
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: t.settings.light, icon: '☀️' },
    { value: 'dark', label: t.settings.dark, icon: '🌙' },
    { value: 'system', label: t.settings.system, icon: '💻' },
  ];

  const languages: { value: Locale; label: string }[] = [
    { value: 'ru', label: t.settings.russian },
    { value: 'en', label: t.settings.english },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Appearance */}
      <Card>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t.settings.appearance}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 block mb-2">{t.settings.theme}</label>
            <div className="flex gap-2">
              {themes.map((th) => (
                <button
                  key={th.value}
                  onClick={() => setTheme(th.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all cursor-pointer',
                    theme === th.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/50'
                      : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20',
                  )}
                >
                  <span>{th.icon}</span>
                  <span>{th.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 block mb-2">{t.settings.language}</label>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLocale(lang.value)}
                  className={cn(
                    'px-4 py-2.5 rounded-lg border text-sm transition-all cursor-pointer',
                    locale === lang.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/50'
                      : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20',
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile */}
      <Card>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t.settings.profile}</h2>
        <div className="space-y-3">
          <Input label={t.settings.profileName} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          <Input label={t.settings.profileEmail} type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.settings.profileBio}</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-white border-zinc-300 text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none"
            />
          </div>
          <Button onClick={() => toast(t.settings.saved, 'success')}>{t.settings.saveProfile}</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t.settings.notifications}</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{t.settings.emailNotifications}</span>
            <button
              onClick={() => setEmailNotif(!emailNotif)}
              className={cn('w-11 h-6 rounded-full transition-colors flex-shrink-0 relative', emailNotif ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700')}
            >
              <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', emailNotif ? 'translate-x-5.5' : 'translate-x-0.5')} />
            </button>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{t.settings.pushNotifications}</span>
            <button
              onClick={() => setPushNotif(!pushNotif)}
              className={cn('w-11 h-6 rounded-full transition-colors flex-shrink-0 relative', pushNotif ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700')}
            >
              <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', pushNotif ? 'translate-x-5.5' : 'translate-x-0.5')} />
            </button>
          </label>
        </div>
      </Card>
    </div>
  );
}
