import GridLayout, { noCompactor, useContainerWidth, type LayoutItem } from 'react-grid-layout';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import clsx from 'clsx';
import useResizeObserver from '../../hooks/resizeobserver';
import { useCallback, useLayoutEffect, useState, type ReactNode } from 'react';
import { useEditingStore } from '../../store/editing';
import { useLayoutStore, widgetIdStore } from '../../store/layout';
import { uniqWith } from 'es-toolkit';
import "./grid.css";

export function Grid({ children }: { children: ReactNode }) {
  const { width, containerRef, mounted } = useContainerWidth();
  const rows = useLayoutStore(s => s.rows);
  const columns = useLayoutStore(s => s.columns);
  const layout = useLayoutStore(s => s.widgets);
  const isEditing = useEditingStore(s => s.isEditing);
  const setLayout = useLayoutStore(s => s.setLayout);
  const setLayoutMeta = useLayoutStore(s => s.setLayoutMeta);
  const [justDropped, setJustDropped] = useState(false);

  const [cellHeight, setCellHeight] = useState(0);
  const [gridWidth, setGridWidth] = useState<number | undefined>();
  const [gridHeight, setGridHeight] = useState<number | undefined>();

  useResizeObserver({ current: document.documentElement }, useCallback(() => {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty('width', '100%');
    containerRef.current.style.setProperty('height', '100%');
    const { height, width } = containerRef.current.getBoundingClientRect();
    const cellSide = width / columns < height / rows ? width / columns : height / rows;
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
    containerRef.current.style.setProperty('width', `${cellSide * columns}px`);
    containerRef.current.style.setProperty('height', `${cellSide * rows}px`);
  }, [columns, rows]), { waitUntilMounted: true });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const { height, width } = containerRef.current.getBoundingClientRect();
    const cellSide = Math.floor(width / columns < height / rows ? width / columns : height / rows);
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
  }, [rows, columns]);

  return (
    <div className="p-6 flex flex-col justify-center overflow-hidden flex-grow-1 place-items-center place-content-center">
      <div
        ref={containerRef}
        className={clsx("flex grid-container", { "grid-container-editing": isEditing })}
        style={{
          '--columns': columns,
          '--cell-height': `${cellHeight}px`,
          '--grid-color': 'grey',
          height: gridHeight ?? '100%',
          width: gridWidth ?? '100%'
        } as Record<string, any>}
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => e.preventDefault()}
      >
        {mounted && <GridLayout
          className='flex-grow-1'
          style={{ height: undefined }}
          width={width}
          layout={layout}
          compactor={{ ...noCompactor, preventCollision: true }}
          gridConfig={{
            cols: columns,
            rowHeight: cellHeight, // Adjust based on your cellHeight calculation
            margin: [0, 0], // Adjust based on your margin
            maxRows: rows
          }}
          dragConfig={{
            enabled: isEditing,
            bounded: true,
            handle: isEditing ? undefined : '.not-exist'
          }}
          dropConfig={{
            enabled: isEditing,
            defaultItem: { w: 2, h: 2 }
          }}
          resizeConfig={{
            enabled: isEditing
          }}
          droppingItem={{
            i: '__dropping-item__',
            h: 1,
            w: 1,
            x: 0,
            y: 0
          }}
          onLayoutChange={(newLayout) => {
            if (!justDropped) {
              setLayout(newLayout as LayoutItem[]);
            } else {
              setJustDropped(false);
            }
          }}
          onDrop={(layout, item, e) => {
            if (!('dataTransfer' in e))
              return;
            const droppedType = (e.dataTransfer as DataTransfer).getData("micropad/widget-type");
            if (droppedType && item) {
              const newId = widgetIdStore.generate();
              const newWidget = { ...item, i: newId };

              setJustDropped(true);
              setLayoutMeta(currentMeta => ({
                ...currentMeta,
                [newId]: { type: droppedType }
              }));
              // uniqWith to fix polyfill bug where item will appear twice in `layout`
              setLayout(uniqWith(layout.map(l => l.i === item.i ? newWidget : l), (a, b) => a.i === b.i));
            }
          }}
        >
          {children}
        </GridLayout>}
      </div>
    </div>
  );
}