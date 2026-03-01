import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useGridStore, widgetIdStore } from '../../store/gridstack';
import "gridstack/dist/gridstack.min.css";
import "./Gridstack.css";
import { Widgets } from './widgets/Registration';
import useResizeObserver from '../../hooks/resizeobserver';
import clsx from 'clsx';
import { useEditingStore } from '../../store/editing';

export function Gridstack() {
  const gridRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState(0);
  const [columns] = useState(3);
  const [rows] = useState(2);
  const setLayout = useGridStore(s => s.setLayout);
  const widgets = useGridStore(s => s.widgets);
  const gridstack = useGridStore(s => s.gridstack);
  const init = useGridStore(s => s.init);
  const on = useGridStore(s => s.on);
  const onReady = useGridStore(s => s.onReady);
  const destroy = useGridStore(s => s.destroy);
  const [gridWidth, setGridWidth] = useState<number | undefined>();
  const [gridHeight, setGridHeight] = useState<number | undefined>();
  const isEditing = useEditingStore(s => s.isEditing);

  useEffect(() => {
    isEditing ? gridstack?.enable() : gridstack?.disable();
  }, [isEditing]);

  useResizeObserver({ current: document.documentElement }, () => {
    if (!dashRef.current || !gridstack) return;
    dashRef.current.style.setProperty('width', '100%');
    dashRef.current.style.setProperty('height', '100%');
    const { height, width } = dashRef.current.getBoundingClientRect();
    const cellSide = width / columns < height / rows ? width / columns : height / rows;
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
    dashRef.current.style.setProperty('width', `${cellSide * columns}px`);
    dashRef.current.style.setProperty('height', `${cellSide * rows}px`);
    gridstack.cellHeight(cellSide);
  });

  useLayoutEffect(() => {
    if (!gridRef.current || !dashRef.current) return;
    const { height, width } = dashRef.current.getBoundingClientRect();
    const cellSide = width / columns < height / rows ? width / columns : height / rows;
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
    init(gridRef.current, {
      column: columns,
      maxRow: rows,
      disableResize: !isEditing,
      disableDrag: !isEditing,
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
      destroy()
    };
  }, [init]);


  useLayoutEffect(() => {
    return onReady(grid => {
      on('change', () => {
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

      on('removed', (_event, items) => {
        // TODO: add a custom way to remove elements so that gridstack doesn't remove them before react does
        const removedIds = items.map((i: any) => {
          return i.id || (i.getAttribute && (i.getAttribute('gs-id') || i.getAttribute('data-gs-id')));
        }).filter(Boolean);
        setLayout(layout => layout.filter(w => !removedIds.includes(w.id)));
      });

      on('dropped', (_event, _prevItem, item) => {
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
    });
  }, [columns, rows, setLayout, onReady, on]);

  return (
    <div className="p-6 flex flex-col justify-center overflow-hidden flex-grow-1 place-items-center place-content-center">
      <div className={clsx("gridstack-container bg-black border", { "gridstack-editing": isEditing })} ref={dashRef}
        style={{
          '--columns': columns,
          '--cell-height': `${cellHeight}px`,
          '--grid-color': 'grey',
          height: gridHeight ?? '100%',
          width: gridWidth ?? '100%'
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