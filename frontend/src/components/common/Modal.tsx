import React, { useEffect, useRef, useState, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useOverlayStack, isTopOverlay } from '../../hooks/useOverlayStack';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  isDirty?: boolean;
  isSubmitting?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  ariaLabel?: string;
  className?: string;
  confirmDiscardTitle?: string;
  confirmDiscardMessage?: string;
  confirmDiscardConfirmText?: string;
  confirmDiscardCancelText?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  size = 'md',
  isDirty = false,
  isSubmitting = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  ariaLabel,
  className = '',
  confirmDiscardTitle = 'Discard unsaved changes?',
  confirmDiscardMessage = 'You have unsaved changes that will be lost if you leave.',
  confirmDiscardConfirmText = 'Discard changes',
  confirmDiscardCancelText = 'Keep editing',
}) => {
  const generatedId = useId();
  const overlayId = `modal-${generatedId}`;
  const confirmOverlayId = `confirm-${overlayId}`;

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const mouseDownOnBackdropRef = useRef(false);

  // Attempt to close; check dirty status first
  const requestClose = () => {
    if (isSubmitting) return;

    if (isDirty) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  };

  // Register main modal in global stack
  useOverlayStack(
    useMemo(
      () => ({
        id: overlayId,
        type: 'modal',
        onClose: requestClose,
        onRequestClose: requestClose,
        closeOnEscape: closeOnEscape && !confirmDiscardOpen,
        lockScroll: true,
      }),
      [overlayId, isSubmitting, isDirty, closeOnEscape, confirmDiscardOpen]
    ),
    isOpen
  );

  // Register confirmation dialog as top overlay if open
  useOverlayStack(
    useMemo(
      () => ({
        id: confirmOverlayId,
        type: 'confirm',
        onClose: () => setConfirmDiscardOpen(false),
        closeOnEscape: true,
        lockScroll: true,
      }),
      [confirmOverlayId]
    ),
    confirmDiscardOpen
  );

  // Focus management: save trigger and restore on close
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement | null;

      // Small delay to allow DOM mounting
      const timer = setTimeout(() => {
        if (!modalContentRef.current) return;
        const focusable = modalContentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalContentRef.current.focus();
        }
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setConfirmDiscardOpen(false);
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen]);

  // Focus trap inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || confirmDiscardOpen || !modalContentRef.current) return;

    const focusables = Array.from(
      modalContentRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // Backdrop Dual Event Validation (mousedown + mouseup strictly on backdrop)
  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      mouseDownOnBackdropRef.current = true;
    } else {
      mouseDownOnBackdropRef.current = false;
    }
  };

  const handleBackdropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      mouseDownOnBackdropRef.current &&
      e.target === backdropRef.current &&
      closeOnBackdrop &&
      !confirmDiscardOpen &&
      isTopOverlay(overlayId)
    ) {
      requestClose();
    }
    mouseDownOnBackdropRef.current = false;
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const titleId = `${overlayId}-title`;

  return createPortal(
    <>
      <div
        ref={backdropRef}
        onMouseDown={handleBackdropMouseDown}
        onMouseUp={handleBackdropMouseUp}
        onKeyDown={handleKeyDown}
        data-overlay-id={overlayId}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in motion-reduce:animate-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel || 'Dialog window' : undefined}
      >
        <div
          ref={modalContentRef}
          tabIndex={-1}
          className={`bg-white dark:bg-slate-900 rounded-3xl w-full ${sizeClasses[size]} p-6 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-200 animate-in zoom-in-95 motion-reduce:animate-none focus:outline-none max-h-[92vh] flex flex-col ${className}`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {icon && <div className="shrink-0">{icon}</div>}
                <div className="min-w-0">
                  {title && (
                    <h3
                      id={titleId}
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate"
                    >
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={requestClose}
                  disabled={isSubmitting}
                  aria-label="Close"
                  title="Close dialog"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="overflow-y-auto pr-1 flex-1">{children}</div>
        </div>
      </div>

      {/* Discard Unsaved Changes Confirmation Modal */}
      {confirmDiscardOpen && (
        <div
          data-overlay-id={confirmOverlayId}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in motion-reduce:animate-none"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={`${confirmOverlayId}-title`}
          aria-describedby={`${confirmOverlayId}-desc`}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 motion-reduce:animate-none space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4
                  id={`${confirmOverlayId}-title`}
                  className="text-sm font-bold text-slate-900 dark:text-white"
                >
                  {confirmDiscardTitle}
                </h4>
                <p
                  id={`${confirmOverlayId}-desc`}
                  className="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
                >
                  {confirmDiscardMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmDiscardOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                {confirmDiscardCancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDiscardOpen(false);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
              >
                {confirmDiscardConfirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
