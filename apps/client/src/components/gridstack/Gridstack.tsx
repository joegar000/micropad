import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useLayoutStore, widgetIdStore } from '../../store/layout';
import { useGridstackContext } from './Provider';
import "gridstack/dist/gridstack.min.css";
import "./Gridstack.css";
import { Widgets } from './widgets/Registration';
import clsx from 'clsx';

export function Gridstack() {
  const gridRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState(0);
  const [columns] = useState(3);
  const [rows] = useState(2);
  const setLayout = useLayoutStore((s) => s.setLayout);
  const widgets = useLayoutStore((state) => state.widgets);
  const [gridWidth, setGridWidth] = useState<number | undefined>();
  const [gridHeight, setGridHeight] = useState<number | undefined>();

  const { init, getGrid, onReady } = useGridstackContext();

  useEffect(() => {
    const el = gridRef.current;
    const grid = getGrid();
    if (!el || !grid) return;
  }, []);

  useLayoutEffect(() => {
    if (!gridRef.current || !dashRef.current) return;
    const { height, width } = dashRef.current.getBoundingClientRect();
    const cellSide = width / columns < height / rows ? width / columns : height / rows;
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
    const grid = init(gridRef.current, {
      column: columns,
      maxRow: rows,
      minRow: rows,
      cellHeight: cellSide,
      margin: '0.5em',
      float: true,
      draggable: {
        cancel: '.not-draggable'
      },
      acceptWidgets: true,
      removable: true
    });
    return () => {
      grid?.destroy(false);
    };
  }, [init]);


  useLayoutEffect(() => {
    const unsub = onReady((grid) => {
      grid.on("change", () => {
        const updated = grid.save(false, true) as any;
        setLayout(layout => {
          return layout.map(w => {
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
        });
      });

      grid.on('removed', (_event, items) => {
        // TODO: add a custom way to remove elements so that gridstack doesn't remove them before react does
        const removedIds = items.map((i: any) => {
          return i.id || (i.getAttribute && (i.getAttribute('gs-id') || i.getAttribute('data-gs-id')));
        }).filter(Boolean);
        setLayout(layout => layout.filter(w => !removedIds.includes(w.id)));
      });

      grid.on('dropped', (_event, _prevItem, item) => {
        if (item.el) {
          grid.removeWidget(item.el, true, false);
        }
        const type: string | undefined = item.id?.replace("preview-", "");
        if (!type) return;
        setLayout(layout => [
          ...layout,
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
        grid.off("removed");
      }
    });
    return () => {
      unsub();
    };
  }, [getGrid, columns, rows, setLayout]);

  return (
    <div className={clsx("p-6 flex flex-col justify-center overflow-hidden flex-grow-1", gridHeight !== undefined && "flex justify-center items-center")}>
      <div className="gridstack-container gridstack-editing bg-black" ref={dashRef}
        style={{
          '--columns': columns,
          '--cell-height': `${cellHeight}px`,
          '--grid-color': 'grey',
          height: gridHeight ?? '100%',
          width: gridWidth
        } as React.CSSProperties}
      >
        <div
          className="grid-stack"
          ref={gridRef}
        >
          {widgets.map((w) => {
            const Widget = Widgets[w.type];
            return (
              <Widget
                key={w.id}
                id={w.id}
                x={w.x}
                y={w.y}
                w={w.w}
                h={w.h}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}