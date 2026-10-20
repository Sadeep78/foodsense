import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
  message: string | null;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  type = 'success',
  durationMs = 4000,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingTimeRef = useRef<number>(durationMs);
  const startTimeRef = useRef<number>(Date.now());

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onClose();
    }, remainingTimeRef.current);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
    }
  };

  useEffect(() => {
    if (message) {
      remainingTimeRef.current = durationMs;
      startTimer();
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [message, durationMs]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
      icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 text-xs font-medium border rounded-2xl shadow-xl transition-all animate-in fade-in slide-in-from-top-4 duration-200 motion-reduce:animate-none ${typeConfig.bg}`}
    >
      {typeConfig.icon}
      <span className="max-w-xs">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
