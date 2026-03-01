import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useLayoutStore, widgetIdStore, type WidgetLayout } from '../../store/layout';
import { useGridstackContext } from './Provider';
import "gridstack/dist/gridstack.min.css";
import "./Gridstack.css";


interface GridstackProps {
  children: React.ReactNode;
  onExternalDrop?: (payload: { type: string; id: string }) => void;
}

export function Gridstack({ children }: GridstackProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState(0);
  const [columns] = useState(3);
  const [rows] = useState(2);
  const setLayout = useLayoutStore((s) => s.setLayout);
  const currentLayout = useLayoutStore((s) => s.widgets);

  const { init, getGrid, onReady } = useGridstackContext();

  useEffect(() => {
    const el = gridRef.current;
    const grid = getGrid();
    if (!el || !grid) return;
  }, []);

  useLayoutEffect(() => {
    if (!gridRef.current || !dashRef.current) return;

    const heightPx = dashRef.current.getBoundingClientRect().height;
    const rowHeight = heightPx / rows;
    setCellHeight(rowHeight);

    init(gridRef.current, {
      column: columns,
      maxRow: rows,
      minRow: rows,
      cellHeight: rowHeight,
      margin: '0.5em',
      float: true,
      draggable: {
        cancel: '.not-draggable'
      },
      acceptWidgets: true,
      removable: true
    });

    const unsub = onReady((grid) => {
      grid.on("change", () => {
        const updated = grid.save(false, true) as any;
        const newLayout = currentLayout.map(w => {
          const updatedWidget = updated.children?.find((uw: any) => uw.id === w.id);
          if (updatedWidget) {
            return {
              ...w,
              x: updatedWidget.x!,
              y: updatedWidget.y!,
              w: updatedWidget.w!,
              h: updatedWidget.h!
            };
          }
          return w;
        });
        setLayout(newLayout);
      });

      grid.on('dropped', (_event, _prevItem, item) => {
        if (item.el) {
          grid.removeWidget(item.el, true, false);
        }
        const type: string | undefined = item.id?.replace("preview-", "");
        if (!type) return;
        setLayout([
          ...currentLayout,
          {
            id: widgetIdStore.generate(),
            type,
            x: item.x ?? 0,
            y: item.y ?? 0,
            w: item.w ?? 1,
            h: item.h ?? 1
          }]);
      });
      return () => {
        grid.off("change");
        grid.off("dropped");
      }
    });
    return () => {
      unsub();
    };
  }, [init, getGrid, columns, rows, currentLayout, setLayout]);

  return (
    <div className="h-full w-full p-6 flex flex-col">
      <div className="gridstack-container gridstack-editing bg-black flex-grow-1" ref={dashRef}
        style={{
          '--columns': columns,
          '--cell-height': `${cellHeight}px`,
          '--grid-color': 'grey'
        } as React.CSSProperties}
      >
        <div
          className="grid-stack"
          ref={gridRef}
        >
          {children}
        </div>
      </div>
    </div>
  );
}