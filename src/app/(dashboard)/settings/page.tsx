'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme, type Theme } from '@shared/theme';
import { useI18n, type Locale } from '@shared/i18n';
import { Card, Input, Button, useToast } from '@shared/ui';
import { cn } from '@shared/lib';

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active tab state driven by URL search params (default to 'profile')
  const activeTab = searchParams.get('tab') || 'profile';

  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    bio: '',
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('profile-name');
    const savedEmail = localStorage.getItem('profile-email');
    const savedBio = localStorage.getItem('profile-bio');
    const savedAvatar = localStorage.getItem('profile-avatar');

    if (savedName || savedEmail || savedBio !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile({
        name: savedName || 'Admin User',
        email: savedEmail || 'admin@example.com',
        bio: savedBio || '',
      });
    }
    if (savedAvatar) {
       
      setAvatar(savedAvatar);
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        localStorage.setItem('profile-avatar', base64);
        window.dispatchEvent(new Event('profile-update'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('profile-name', profile.name);
    localStorage.setItem('profile-email', profile.email);
    localStorage.setItem('profile-bio', profile.bio);
    if (avatar) {
      localStorage.setItem('profile-avatar', avatar);
    } else {
      localStorage.removeItem('profile-avatar');
    }
    window.dispatchEvent(new Event('profile-update'));
    toast(t.settings.saved, 'success');
  };

  const handleTabChange = (tabId: string) => {
    router.push(`/settings?tab=${tabId}`);
  };

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: t.settings.light, icon: '☀️' },
    { value: 'dark', label: t.settings.dark, icon: '🌙' },
    { value: 'system', label: t.settings.system, icon: '💻' },
  ];

  const languages: { value: Locale; label: string }[] = [
    { value: 'ru', label: t.settings.russian },
    { value: 'en', label: t.settings.english },
  ];

  const tabs = [
    { id: 'profile', label: t.settings.profile },
    { id: 'appearance', label: t.settings.appearance },
    { id: 'notifications', label: t.settings.notifications },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* iOS-style premium Segmented Tabs */}
      <div className="bg-zinc-100/60 dark:bg-white/5 border border-zinc-200/50 dark:border-white/[0.04] p-1 rounded-xl flex gap-1 select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex-1 text-center py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none outline-none border border-transparent',
                isActive
                  ? 'bg-white text-zinc-900 shadow-sm border-zinc-200/50 dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/[0.08]'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conditional rendering based on activeTab */}
      <div className="transition-all duration-200">
        {activeTab === 'profile' && (
          <Card>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {t.settings.profile}
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Edit Zone */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10 bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {profile.name
                        ? profile.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                        : 'A'}
                    </span>
                  )}

                  {/* Hover overlay with modern camera icon */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Change Avatar"
                  />
                </div>
                {avatar && (
                  <button
                    onClick={() => {
                      setAvatar(null);
                      localStorage.removeItem('profile-avatar');
                      window.dispatchEvent(new Event('profile-update'));
                    }}
                    className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium cursor-pointer"
                  >
                    Удалить
                  </button>
                )}
              </div>

              {/* Profile fields */}
              <div className="flex-1 space-y-3">
                <Input
                  label={t.settings.profileName}
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  label={t.settings.profileEmail}
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t.settings.profileBio}
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-white border-zinc-300 text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none"
                  />
                </div>
                <Button onClick={handleSave}>{t.settings.saveProfile}</Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'appearance' && (
          <Card>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {t.settings.appearance}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 block mb-2">
                  {t.settings.theme}
                </label>
                <div className="flex gap-2">
                  {themes.map((th) => (
                    <button
                      key={th.value}
                      onClick={() => setTheme(th.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all cursor-pointer',
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
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 block mb-2">
                  {t.settings.language}
                </label>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setLocale(lang.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-sm transition-all cursor-pointer',
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
        )}

        {activeTab === 'notifications' && (
          <Card>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {t.settings.notifications}
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {t.settings.emailNotifications}
                </span>
                <button
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors flex-shrink-0 relative cursor-pointer outline-none',
                    emailNotif ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out',
                      emailNotif ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {t.settings.pushNotifications}
                </span>
                <button
                  onClick={() => setPushNotif(!pushNotif)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors flex-shrink-0 relative cursor-pointer outline-none',
                    pushNotif ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out',
                      pushNotif ? 'translate-x-5' : 'translate-x-0',
                    )}
                  />
                </button>
              </label>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
