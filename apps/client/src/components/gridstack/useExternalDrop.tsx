import { type RefObject, useEffect } from 'react';
import { useLayoutStore, widgetIdStore } from '../../store/layout';

type Options = {
  columns: number;
  cellHeight: number;
  onExternalDrop?: (payload: { type: string; id: string }) => void;
};

export function useExternalDrop(targetRef: RefObject<HTMLElement>, opts: Options) {
  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const data = e.dataTransfer?.getData('application/widget') || e.dataTransfer?.getData('text/plain');
      if (!data) return;
      let payload: any;
      try { payload = JSON.parse(data); } catch { payload = { type: data }; }

      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      const colWidth = rect.width / Math.max(1, opts.columns);
      const x = Math.max(0, Math.floor(relX / colWidth));
      const y = Math.max(0, Math.floor(relY / (opts.cellHeight || 1)));

      const id = widgetIdStore.generate();
      const w = payload.w ?? 1;
      const h = payload.h ?? 1;
      const current = useLayoutStore.getState().widgets;
      useLayoutStore.getState().setLayout([...current, { id, type: payload.type, x, y, w, h }]);
      opts.onExternalDrop?.({ type: payload.type, id });
    };

    el.addEventListener('dragover', handleDragOver as any);
    el.addEventListener('drop', handleDrop as any);
    return () => {
      el.removeEventListener('dragover', handleDragOver as any);
      el.removeEventListener('drop', handleDrop as any);
    };
  }, [targetRef, opts.columns, opts.cellHeight, opts.onExternalDrop]);
}
