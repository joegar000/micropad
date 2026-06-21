import GridLayout, { noCompactor, useContainerWidth, type LayoutItem } from 'react-grid-layout';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import clsx from 'clsx';
import useResizeObserver from '../../hooks/use-resize-observer';
import { useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import { useEditingStore } from '../../store/editing-store';
import "./grid.css";
import "./widgets";
import { useLayoutStore, widgetIdStore } from '../../store/layout-store';

export function Grid({ children }: { children: ReactNode }) {
  const { width, containerRef, mounted } = useContainerWidth();
  const page = useLayoutStore(s => s.currentPage);
  const rows = page.rows;
  const columns = page.columns;
  const layout = page.widgets.map(w => ({
    i: w.id,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h
  }));
  const isEditing = useEditingStore(s => s.isEditing);
  const setWidgetPlacements = useLayoutStore(s => s.setWidgetPlacements);
  const addWidget = useLayoutStore(s => s.addWidget);
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
  }, [columns, containerRef, rows]), { waitUntilMounted: true });

  return (
    <div className="h-[100%] p-6 flex flex-col justify-center overflow-hidden flex-grow-1 place-items-center place-content-center">
      <div
        ref={containerRef}
        className={clsx("flex grid-container", { "grid-container-editing": isEditing })}
        style={{
          '--columns': columns,
          '--cell-height': `${cellHeight}px`,
          '--grid-color': 'grey',
          height: gridHeight ?? '100%',
          width: gridWidth ?? '100%'
        } as CSSProperties & Record<"--columns" | "--cell-height" | "--grid-color", string | number>}
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
            defaultItem: { w: 1, h: 1 }
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
              setWidgetPlacements(newLayout as LayoutItem[]);
            } else {
              setJustDropped(false);
            }
          }}
          onDrop={(_layout, item, e) => {
            if (!('dataTransfer' in e))
              return;
            const droppedType = (e.dataTransfer as DataTransfer).getData("micropad/widget-type");
            if (droppedType && item) {
              const newId = widgetIdStore.generate();

              setJustDropped(true);
              addWidget({
                id: newId,
                widgetType: droppedType,
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
                config: {}
              });
            }
          }}
        >
          {children}
        </GridLayout>}
      </div>
    </div>
  );
}
