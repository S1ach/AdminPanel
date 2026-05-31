'use client';
import { StoreProvider } from './store/provider';
import { ThemeProvider } from '@shared/theme';
import { I18nProvider } from '@shared/i18n';
import { ToastProvider } from '@shared/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ThemeProvider>
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
