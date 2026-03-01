import { useLayoutEffect } from "react";

const useResizeObserver = (ref: React.RefObject<HTMLElement | null>, callback: (entry: Pick<ResizeObserverEntry, 'contentRect' | 'target'>) => void) => {
  useLayoutEffect(() => {
    if (!ref.current) return;

    // Call the callback once with a synthetic entry using the current size
    const rect = ref.current.getBoundingClientRect();
    const fakeEntry = {
      target: ref.current,
      contentRect: rect,
    } as unknown as ResizeObserverEntry;

    callback(fakeEntry);

    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === ref.current) {
          callback(entry);
        }
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, callback]);
};

export default useResizeObserver;