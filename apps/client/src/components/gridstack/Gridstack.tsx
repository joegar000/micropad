import { useRef, useState, useLayoutEffect, useCallback, type ReactNode, useEffect } from 'react';
import "gridstack/dist/gridstack.min.css";
import "./Gridstack.css";
import useResizeObserver from '../../hooks/resizeobserver';
import { useEditingStore } from '../../store/editing';
import { GridStackRenderContext, useGridStackContext } from '../../../lib/gridstack-react';
import { widgetContainers } from '../../../lib/gridstack-react/global';
import { GridStack } from 'gridstack';
import { useLayoutStore, widgetIdStore } from '../../store/layout';
import clsx from "clsx";
import { isNotNil } from 'es-toolkit/predicate';
import { cloneDeep } from 'es-toolkit/object';

export function gridStackListeners() {
  /*
   * can't use setLayout and setLayoutMeta callback setStates
   * since event listeners are called several times in succession
   */
  const currentLayout = useLayoutStore(s => s.widgets);
  const setLayout = useLayoutStore(s => s.setLayout);
  const currentMeta = useLayoutStore(s => s.widgetMeta);
  const setLayoutMeta = useLayoutStore(s => s.setLayoutMeta);
  const { _gridStack: { value: gridStack } } = useGridStackContext();

  gridStack?.on('change', (_event, nodes) => {
    const changedIds = nodes.map(n => n.id);
    setLayout(currentNodes => {
      return currentNodes.map(n => changedIds.includes(n.id) ? nodes.find(newN => newN.id === n.id)! : n)
    });
  });

  gridStack?.on('added', (_event, nodes) => {
    const newNodes = nodes.map(n => ({ ...n, id: widgetIdStore.generate() }));
    const newMeta = cloneDeep(currentMeta);
    newNodes.forEach(n => {
      newMeta[n.id] = { type: n.el!.querySelector<HTMLElement>('[data-type]')!.dataset.type! };
    });
    setLayoutMeta(newMeta);
    setLayout([...currentLayout, ...newNodes]);
  });

  gridStack?.on('removed', (_event, nodes) => {
    const removedIds = nodes.map(n => n.id).filter(isNotNil);
    removedIds.forEach(widgetIdStore.remove);
    setLayout(currentLayout.filter(n => !removedIds.includes(n.id!)));
    const newMeta = cloneDeep(currentMeta);
    removedIds.forEach(id => delete newMeta[id]);
    setLayoutMeta(newMeta);
  });
}

export function Grid({ children }: { children: ReactNode }) {
  const {
    _gridStack: { value: gridStack, set: setGridStack },
    initialOptions
  } = useGridStackContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const rows = useLayoutStore(s => s.rows);
  const columns = useLayoutStore(s => s.columns);
  const [cellHeight, setCellHeight] = useState(0);
  const [gridWidth, setGridWidth] = useState<number | undefined>();
  const [gridHeight, setGridHeight] = useState<number | undefined>();
  const isEditing = useEditingStore(s => s.isEditing);
  gridStackListeners();

  const initGrid = useCallback((columns: number, rows: number, cellHeight: number) => {
    if (containerRef.current) {
      try {
        return GridStack.init({
          column: columns,
          row: rows,
          disableResize: !isEditing,
          disableDrag: !isEditing,
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
  }, [initialOptions]);

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
    gridStack.cellHeight(cellSide);
  });

  useLayoutEffect(() => {
    if (!containerRef.current || !dashRef.current || gridStack) return;
    const { height, width } = dashRef.current.getBoundingClientRect();
    const cellSide = Math.floor(width / columns < height / rows ? width / columns : height / rows);
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
    setGridStack(initGrid(columns, rows, cellSide));
  }, [initGrid, setGridStack, rows, columns]);

  useEffect(() => {
    isEditing ? gridStack?.enable() : gridStack?.disable();
  }, [isEditing]);

  useEffect(() => {
    gridStack?.updateOptions({ column: columns, row: rows });
    // hack: setting rows through updateOptions is broken, so set on engine manually
    // https://github.com/gridstack/gridstack.js/issues/3085
    gridStack && (gridStack.engine.maxRow = rows);
  }, [columns, rows]);

  const getContainerByWidgetId = useCallback((widgetId: string) => {
    return (
      widgetContainers.find((container) => container.initWidget.id === widgetId)?.element || null
    );
  }, []);

  return (
    <GridStackRenderContext.Provider value={{ getContainerByWidgetId }}>
      <div className="p-6 flex flex-col justify-center overflow-hidden flex-grow-1 place-items-center place-content-center">
        <div ref={dashRef} className={clsx("gridstack-container", { "gridstack-editing": isEditing })}
          style={{
            '--columns': columns,
            '--cell-height': `${cellHeight}px`,
            '--grid-color': 'grey',
            height: gridHeight ?? '100%',
            width: gridWidth ?? '100%'
          } as Record<string, any>}
        >
          <div ref={containerRef} className="grid-stack">
            {gridStack ? children : null}
          </div>
        </div>
      </div>
    </GridStackRenderContext.Provider>
  );
}