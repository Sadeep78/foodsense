import React, { useEffect, useRef, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useOverlayStack, isTopOverlay } from '../../hooks/useOverlayStack';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  ariaLabel: string;
  children: React.ReactNode;
  widthClass?: string;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  position = 'left',
  ariaLabel,
  children,
  widthClass = 'w-64',
  className = '',
}) => {
  const generatedId = useId();
  const overlayId = `drawer-${generatedId}`;
  const backdropRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const mouseDownOnBackdropRef = useRef(false);
  const location = useLocation();

  // Close drawer automatically on route navigation
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Register in global overlay stack for Escape handling & scroll lock
  useOverlayStack(
    useMemo(
      () => ({
        id: overlayId,
        type: 'drawer',
        onClose,
        closeOnEscape: true,
        lockScroll: true,
      }),
      [overlayId, onClose]
    ),
    isOpen
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement | null;
      const timer = setTimeout(() => {
        if (!drawerRef.current) return;
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          drawerRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen]);

  // Focus trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;

    const focusables = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
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
      isTopOverlay(overlayId)
    ) {
      onClose();
    }
    mouseDownOnBackdropRef.current = false;
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const translateClasses =
    position === 'left'
      ? 'translate-x-0'
      : 'translate-x-0';

  return createPortal(
    <div
      ref={backdropRef}
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
      onKeyDown={handleKeyDown}
      data-overlay-id={overlayId}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in motion-reduce:animate-none lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <aside
        ref={drawerRef}
        tabIndex={-1}
        className={`fixed top-0 bottom-0 ${position === 'left' ? 'left-0' : 'right-0'} z-50 flex flex-col ${widthClass} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-200 ease-in-out ${translateClasses} animate-in ${
          position === 'left' ? 'slide-in-from-left' : 'slide-in-from-right'
        } motion-reduce:animate-none focus:outline-none ${className}`}
      >
        {children}
      </aside>
    </div>,
    document.body
  );
};
