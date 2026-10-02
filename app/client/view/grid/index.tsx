// @ts-ignore
import "./styles.css";
import clsx from 'clsx';
import useResizeObserver from '../../hooks/resize-observer.tsx';
import { useCallback, useRef, useState } from "react";
import Cell from "./cell.tsx";
import { range } from "es-toolkit/math";
import { useApp } from "../../model/app.tsx";
import { observer } from "mobx-react-lite";
import { pageHelpers, usePage } from "../../model/layout.tsx";
import Widget from "./widget.tsx";

const Grid = observer(() => {
  const page = usePage();
  const ref = useRef<HTMLDivElement>(null);
  const app = useApp();
  const cellHeight = app.layout.cellHeight;
  const gridHeight = app.layout.gridHeight;
  const gridWidth = app.layout.gridWidth;
  const columns = page.columns;
  const rows = page.rows;
  const helpers = pageHelpers(page);
  const [isEditing, _setIsEditing] = useState(true);

  useResizeObserver({ current: document.documentElement }, useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('width', '100%');
    ref.current.style.setProperty('height', '100%');
    const { height, width } = ref.current.getBoundingClientRect();
    const cellSide = width / columns < height / rows ? width / columns : height / rows;
    ref.current.style.setProperty('width', `${cellSide * columns}px`);
    ref.current.style.setProperty('height', `${cellSide * rows}px`);
    app.layout.cellHeight = cellSide;
    app.layout.gridWidth = cellSide * columns;
    app.layout.gridHeight = cellSide * rows;
  }, [columns, rows]), { waitUntilMounted: true });

  return (
    <div className="p-6 flex flex-col justify-center overflow-hidden grow place-items-center place-content-center">
      <div
        ref={ref}
        className={clsx("flex grid-container", { "grid-container-editing": isEditing })}
        style={{
          '--columns': columns,
          '--cell-height': `${cellHeight}px`,
          '--grid-color': 'grey',
          height: gridHeight ?? '100%',
          width: gridWidth ?? '100%'
        } as Record<string, any>}
      >
        {range(columns).map(x => (
          <div key={x}>
            {range(rows).map(y => (
              <div key={y} style={cellHeight ? { height: cellHeight, aspectRatio: 1 } : {}}>
                <Cell x={x} y={y}>
                  {helpers.widgetAt(x, y) ? (
                    <Widget {...helpers.widgetAt(x, y)!} />
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
