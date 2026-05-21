import { useLayoutEffect } from "react";

interface ResizeOptions {
  waitUntilMounted?: boolean;
}
const useResizeObserver = (ref: React.RefObject<HTMLElement | null>, callback: (entry: Pick<ResizeObserverEntry, 'contentRect' | 'target'>) => void, options: ResizeOptions = {}) => {
  useLayoutEffect(() => {
    if (!ref.current) return;

    // Call the callback once with a synthetic entry using the current size
    const rect = ref.current.getBoundingClientRect();
    const fakeEntry = {
      target: ref.current,
      contentRect: rect,
    } as unknown as ResizeObserverEntry;

    if (options.waitUntilMounted !== true)
      callback(fakeEntry);

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === ref.current) {
          callback(entry);
        }
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, callback, options.waitUntilMounted]);
};

export default useResizeObserver;
