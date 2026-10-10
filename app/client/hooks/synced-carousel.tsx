import { type CarouselApi } from "micropad-ui";
import { useEffect, useState } from "react";

export function useSyncedCarousel(api?: CarouselApi | null) {
  const [pageNum, setPageNum] = useState(0);
  useEffect(() => {
    const cb = () => setPageNum(api?.selectedScrollSnap() ?? 0);
    api?.on('select', cb);
    return () => void api?.off('select', cb);
  }, [api]);

  useEffect(() => {
    api?.scrollTo(pageNum);
  }, [pageNum]);

  return [pageNum, setPageNum] as const;
}
