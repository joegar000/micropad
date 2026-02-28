import { useEffect } from "react";

const useResizeObserver = (ref: React.RefObject<HTMLElement | null>, callback: (entry: ResizeObserverEntry) => void) => {
  useEffect(() => {
    if (!ref.current) return;

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