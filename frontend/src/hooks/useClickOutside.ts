import { useEffect, useRef } from 'react';

export interface UseClickOutsideOptions {
  enabled?: boolean;
  ignoreRefs?: React.RefObject<HTMLElement | null>[];
}

/**
 * Custom hook to detect clicks outside an element ref with dual-event validation:
 * Ensures BOTH mousedown and mouseup occurred outside the target element.
 * Prevents accidental dismissals when users select text or drag inside and release outside.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  targetRef: React.RefObject<T | null>,
  onClickOutside: () => void,
  options: UseClickOutsideOptions = {}
) {
  const { enabled = true, ignoreRefs = [] } = options;
  const mouseDownOutsideRef = useRef(false);
  const callbackRef = useRef(onClickOutside);
  callbackRef.current = onClickOutside;

  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const isInsideTarget = targetRef.current?.contains(target);
      const isInsideIgnored = ignoreRefs.some((ref) => ref.current?.contains(target));

      mouseDownOutsideRef.current = !isInsideTarget && !isInsideIgnored;
    };

    const handleMouseUp = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const isInsideTarget = targetRef.current?.contains(target);
      const isInsideIgnored = ignoreRefs.some((ref) => ref.current?.contains(target));
      const mouseUpOutside = !isInsideTarget && !isInsideIgnored;

      if (mouseDownOutsideRef.current && mouseUpOutside) {
        callbackRef.current();
      }

      mouseDownOutsideRef.current = false;
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('touchstart', handleMouseDown, true);
    document.addEventListener('touchend', handleMouseUp, true);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('touchstart', handleMouseDown, true);
      document.removeEventListener('touchend', handleMouseUp, true);
    };
  }, [enabled, targetRef, ignoreRefs]);
}
