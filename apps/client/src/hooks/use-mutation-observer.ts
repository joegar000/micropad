import { useEffect, type RefObject } from 'react';

const useMutationObserver = (targetRef: RefObject<HTMLElement | null>, callback: MutationCallback, options: MutationObserverInit = {}) => {
  useEffect(() => {
    const targetNode = targetRef.current;
    if (!targetNode) return;

    // The configuration object tells the observer which mutations to watch for
    const config = {
      attributes: options.attributes || true,        // Observe attribute changes
      childList: options.childList || true,         // Observe direct child node additions/removals
      subtree: options.subtree || true,           // Observe changes in the entire subtree
      attributeFilter: options.attributeFilter || undefined, // Optional: only watch specific attributes
      attributeOldValue: options.attributeOldValue || false, // Optional: record the old value of attributes
      characterData: options.characterData || false,         // Optional: Observe changes to text content
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config); // Start observing the target node

    // Cleanup function to disconnect the observer when the component unmounts or dependencies change
    return () => {
      observer.disconnect();
    };
  }, [targetRef, callback, options]); // Dependencies array
};

export default useMutationObserver;
