import { useCallback, useRef, useEffect } from 'react';

/**
 * Debounce hook for search inputs
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Throttle hook for scroll/resize events
 */
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return targetRef;
}
