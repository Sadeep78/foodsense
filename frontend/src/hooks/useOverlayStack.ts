import { useEffect, useRef } from 'react';

export interface OverlayEntry {
  id: string;
  type: 'modal' | 'drawer' | 'popover' | 'confirm';
  onClose: () => void;
  onRequestClose?: () => void;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
}

// Global stack of active overlays
const overlayStack: OverlayEntry[] = [];
let originalOverflow = '';
let originalPaddingRight = '';
let isScrollLocked = false;

function updateScrollLock() {
  const needsLock = overlayStack.some((entry) => entry.lockScroll !== false);

  if (needsLock && !isScrollLocked) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    isScrollLocked = true;
  } else if (!needsLock && isScrollLocked) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
    isScrollLocked = false;
  }
}

// Global Escape keydown listener
if (typeof window !== 'undefined') {
  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        if (overlayStack.length > 0) {
          const topOverlay = overlayStack[overlayStack.length - 1];
          if (topOverlay && topOverlay.closeOnEscape !== false) {
            event.preventDefault();
            event.stopPropagation();
            if (topOverlay.onRequestClose) {
              topOverlay.onRequestClose();
            } else {
              topOverlay.onClose();
            }
          }
        }
      }
    },
    true // Capture phase to guarantee topmost interception
  );
}

export function getTopOverlayId(): string | null {
  if (overlayStack.length === 0) return null;
  return overlayStack[overlayStack.length - 1].id;
}

export function isTopOverlay(id: string): boolean {
  if (overlayStack.length === 0) return false;
  return overlayStack[overlayStack.length - 1].id === id;
}

export function useOverlayStack(entry: OverlayEntry, isOpen: boolean) {
  const entryRef = useRef(entry);
  entryRef.current = entry;

  useEffect(() => {
    if (!isOpen) return;

    const currentEntry: OverlayEntry = {
      id: entry.id,
      type: entry.type,
      onClose: () => entryRef.current.onClose(),
      onRequestClose: entryRef.current.onRequestClose
        ? () => entryRef.current.onRequestClose?.()
        : undefined,
      closeOnEscape: entry.closeOnEscape,
      lockScroll: entry.lockScroll,
    };

    overlayStack.push(currentEntry);
    updateScrollLock();

    return () => {
      const idx = overlayStack.findIndex((item) => item.id === entry.id);
      if (idx !== -1) {
        overlayStack.splice(idx, 1);
      }
      updateScrollLock();
    };
  }, [isOpen, entry.id, entry.type, entry.closeOnEscape, entry.lockScroll]);
}
