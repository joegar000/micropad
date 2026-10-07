// @ts-ignore
import clsx from 'clsx';
import useResizeObserver from '../../hooks/resize-observer.tsx';
import { useCallback, useRef } from "react";
import Cell from "./cell.tsx";
import { range } from "es-toolkit/math";
import { observer } from "mobx-react-lite";
import { usePage } from "../../model/page.tsx";
import Widget from "./widget.tsx";

const Grid = observer(() => {
  const page = usePage();
  const ref = useRef<HTMLDivElement>(null);
  const cellHeight = page.cellHeight;
  const gridHeight = page.gridHeight;
  const gridWidth = page.gridWidth;
  const columns = page.data.columns;
  const rows = page.data.rows;

  useResizeObserver({ current: document.documentElement }, useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('width', '100%');
    ref.current.style.setProperty('height', '100%');
    const { height, width } = ref.current.getBoundingClientRect();
    const cellSide = width / columns < height / rows ? width / columns : height / rows;
    ref.current.style.setProperty('width', `${cellSide * columns}px`);
    ref.current.style.setProperty('height', `${cellSide * rows}px`);
    page.cellHeight = cellSide;
    page.gridWidth = cellSide * columns;
    page.gridHeight = cellSide * rows;
  }, [columns, rows]), { waitUntilMounted: true });

  return (
    <div className="p-6 flex flex-col justify-center overflow-hidden grow place-items-center place-content-center">
      <div
        ref={ref}
        className={clsx("flex grid-container")}
        style={{
          height: gridHeight ?? '100%',
          width: gridWidth ?? '100%'
        } as Record<string, any>}
      >
        {range(columns).map(x => (
          <div key={x}>
            {range(rows).map(y => (
              <div key={y} style={cellHeight ? { height: cellHeight, aspectRatio: 1 } : {}}>
                <Cell x={x} y={y}>
                  {page.widgetRootAt(x, y) ? (
                    <Widget {...page.widgetRootAt(x, y)!} />
                  ) : null}
                </Cell>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
export default Grid;
