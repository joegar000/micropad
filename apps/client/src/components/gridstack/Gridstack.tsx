import { useRef, useState, useLayoutEffect, useCallback, type ReactNode } from 'react';
import "gridstack/dist/gridstack.min.css";
import "./Gridstack.css";
import useResizeObserver from '../../hooks/resizeobserver';
import { useEditingStore } from '../../store/editing';
import { GridStackRenderContext, useGridStackContext } from '../../../lib/gridstack-react';
import { widgetContainers } from '../../../lib/gridstack-react/global';
import { GridStack } from 'gridstack';
import clsx from "clsx";

export function Grid({ children }: { children: ReactNode }) {
  const {
    _gridStack: { value: gridStack, set: setGridStack },
    initialOptions
  } = useGridStackContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const [rows] = useState(2);
  const [columns] = useState(3);
  const [cellHeight, setCellHeight] = useState(0);
  const [gridWidth, setGridWidth] = useState<number | undefined>();
  const [gridHeight, setGridHeight] = useState<number | undefined>();
  const isEditing = useEditingStore(s => s.isEditing);

  const initGrid = useCallback((columns: number, rows: number, cellHeight: number) => {
    if (containerRef.current) {
      try {
        return GridStack.init({
          column: columns,
          maxRow: rows,
          disableResize: !isEditing,
          disableDrag: !isEditing,
          minRow: rows,
          cellHeight,
          margin: '0.5em',
          float: true,
          draggable: {
            cancel: '.not-draggable'
          },
          acceptWidgets: true,
          removable: true,
          ...initialOptions
        }, containerRef.current);
      } catch (e) {
        console.error("Error initializing gridstack", e);
      }
    }
    return null;
  }, []);

  useResizeObserver({ current: document.documentElement }, () => {
    if (!dashRef.current || !gridStack) return;
    dashRef.current.style.setProperty('width', '100%');
    dashRef.current.style.setProperty('height', '100%');
    const { height, width } = dashRef.current.getBoundingClientRect();
    const cellSide = width / columns < height / rows ? width / columns : height / rows;
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
    dashRef.current.style.setProperty('width', `${cellSide * columns}px`);
    dashRef.current.style.setProperty('height', `${cellSide * rows}px`);
    gridStack.updateOptions({
      column: columns,
      maxRow: rows,
      minRow: rows,
      cellHeight: cellSide
    });
  });

  useLayoutEffect(() => {
    if (!containerRef.current || !dashRef.current || gridStack) return;
    const { height, width } = dashRef.current.getBoundingClientRect();
    const cellSide = Math.floor(width / columns < height / rows ? width / columns : height / rows);
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
    setGridStack(initGrid(columns, rows, cellSide));
  }, [gridStack, initGrid, setGridStack]);


  const getContainerByWidgetId = useCallback((widgetId: string) => {
    return (
      widgetContainers.find((container) => container.initWidget.id === widgetId)?.element || null
    );
  }, []);

  return (
    <GridStackRenderContext.Provider value={{ getContainerByWidgetId }}>
      <div className="p-6 flex flex-col justify-center overflow-hidden flex-grow-1 place-items-center place-content-center">
        <div ref={dashRef} className={clsx("gridstack-container bg-black border", { "gridstack-editing": isEditing })}
          style={{
            '--columns': columns,
            '--cell-height': `${cellHeight}px`,
            '--grid-color': 'grey',
            height: gridHeight ?? '100%',
            width: gridWidth ?? '100%'
          }}
        >
          <div ref={containerRef} className="grid-stack">
            {gridStack ? children : null}
          </div>
        </div>
      </div>
    </GridStackRenderContext.Provider>
  );
}