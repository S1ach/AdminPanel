'use client';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { cn } from '@shared/lib';

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }

interface ToastContextType { toast: (message: string, type?: Toast['type']) => void; }

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={cn(
              'fixed bottom-4 right-4 z-[100] rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right-full duration-200',
              t.type === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
              t.type === 'error' && 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
              t.type === 'info' && 'bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:border-white/10 dark:text-zinc-200',
            )}
          >
            <ToastPrimitive.Description className="text-sm">{t.message}</ToastPrimitive.Description>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
