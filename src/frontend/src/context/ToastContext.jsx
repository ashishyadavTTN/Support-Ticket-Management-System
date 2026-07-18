import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

const TOAST_DURATION = 5000;

const variantStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  info: 'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200',
};

function ToastItem({ toast, onDismiss }) {
  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-md animate-slide-in-right',
        variantStyles[toast.variant]
      )}
    >
      <div className="flex-1">
        {toast.title && (
          <p className="text-body-sm font-semibold">{toast.title}</p>
        )}
        <p className={cn('text-body-sm', toast.title && 'mt-0.5')}>
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded p-1 text-current opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, title, variant = 'info', duration = TOAST_DURATION }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, title, variant }]);

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      addToast,
      success: (message, opts) =>
        addToast({ message, variant: 'success', ...opts }),
      error: (message, opts) =>
        addToast({ message, variant: 'error', ...opts }),
      info: (message, opts) =>
        addToast({ message, variant: 'info', ...opts }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
