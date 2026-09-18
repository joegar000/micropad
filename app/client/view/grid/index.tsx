import GridLayout, { useContainerWidth } from 'react-grid-layout';
import clsx from 'clsx';
import useResizeObserver from '../../hooks/resize-observer.tsx';
import { useCallback, useLayoutEffect, useState } from 'react';
// @ts-ignore
import "react-grid-layout/css/styles.css";
// @ts-ignore
import "react-resizable/css/styles.css";
// @ts-ignore
import "./styles.css";

export default function Grid() {
  const { width, containerRef, mounted } = useContainerWidth();
  const [rows] = useState(3);
  const [columns] = useState(3);
  const [isEditing] = useState(true);

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
          className='grow'
          style={{ height: undefined }}
          width={width}
          layout={[]}
          // compactor={{ ...noCompactor, preventCollision: true }}
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
        >
          is this thing on?
        </GridLayout>}
      </div>
    </div>
  );
}
