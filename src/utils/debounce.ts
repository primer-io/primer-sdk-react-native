export type DebouncedFunction<T extends (...args: any[]) => any> = ((...args: Parameters<T>) => void) & {
  cancel: () => void;
  flush: () => void;
};

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timer != null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };
  debounced.cancel = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  debounced.flush = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
      fn(...lastArgs!);
    }
  };
  return debounced;
}
