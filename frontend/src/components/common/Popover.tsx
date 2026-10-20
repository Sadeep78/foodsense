import React, { useEffect, useRef, useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useOverlayStack } from '../../hooks/useOverlayStack';

// Single-active-popover coordinator
let activePopoverId: string | null = null;
const popoverListeners = new Set<(activeId: string | null) => void>();

function setActivePopover(id: string | null) {
  activePopoverId = id;
  popoverListeners.forEach((listener) => listener(id));
}

export interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onToggle?: () => void;
  trigger: (props: {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': boolean;
  }) => React.ReactNode;
  children: React.ReactNode;
  placement?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  wrapperClassName?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  isOpen,
  onClose,
  onOpen,
  onToggle,
  trigger,
  children,
  placement = 'bottom-right',
  className = '',
  wrapperClassName = 'inline-block',
}) => {
  const generatedId = useId();
  const popoverId = `popover-${generatedId}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Single-active popover management
  useEffect(() => {
    if (isOpen) {
      setActivePopover(popoverId);
    } else if (activePopoverId === popoverId) {
      setActivePopover(null);
    }
  }, [isOpen, popoverId]);

  useEffect(() => {
    const handleActiveChange = (activeId: string | null) => {
      if (activeId !== popoverId && isOpen) {
        onClose();
      }
    };
    popoverListeners.add(handleActiveChange);
    return () => {
      popoverListeners.delete(handleActiveChange);
    };
  }, [isOpen, popoverId, onClose]);

  // Escape key closes popover and focuses trigger
  useOverlayStack(
    {
      id: popoverId,
      type: 'popover',
      onClose: () => {
        onClose();
        triggerRef.current?.focus();
      },
      closeOnEscape: true,
      lockScroll: false,
    },
    isOpen
  );

  // Outside click closes popover
  useClickOutside(
    contentRef,
    () => {
      if (isOpen) {
        onClose();
      }
    },
    {
      enabled: isOpen,
      ignoreRefs: [triggerRef],
    }
  );

  const placementClasses = {
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'top-right': 'bottom-full right-0 mb-2',
    'top-left': 'bottom-full left-0 mb-2',
  }[placement];

  return (
    <div className={`relative ${wrapperClassName}`} data-popover-id={popoverId}>
      {trigger({
        ref: triggerRef,
        onClick: () => {
          if (isOpen) {
            onClose();
          } else {
            setActivePopover(popoverId);
            if (onOpen) {
              onOpen();
            } else if (onToggle) {
              onToggle();
            }
          }
        },
        'aria-expanded': isOpen,
        'aria-haspopup': true,
      })}

      {isOpen && (
        <div
          ref={contentRef}
          role="region"
          className={`absolute ${placementClasses} z-50 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
