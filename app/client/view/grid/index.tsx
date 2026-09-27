// @ts-ignore
import "./styles.css";
import clsx from 'clsx';
import { DragDropProvider } from '@dnd-kit/react';
import useResizeObserver from '../../hooks/resize-observer.tsx';
import { useCallback, useRef, useState } from "react";

export default function Grid() {
  const ref = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState<number | null>(null);
  const [gridHeight, setGridHeight] = useState<number | null>(null);
  const [gridWidth, setGridWidth] = useState<number | null>(null);
  const [columns, _setColumns] = useState(3);
  const [rows, _setRows] = useState(3);
  const [isEditing, _setIsEditing] = useState(true);

  useResizeObserver({ current: document.documentElement }, useCallback(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('width', '100%');
    ref.current.style.setProperty('height', '100%');
    const { height, width } = ref.current.getBoundingClientRect();
    const cellSide = width / columns < height / rows ? width / columns : height / rows;
    setCellHeight(cellSide);
    setGridWidth(cellSide * columns);
    setGridHeight(cellSide * rows);
    ref.current.style.setProperty('width', `${cellSide * columns}px`);
    ref.current.style.setProperty('height', `${cellSide * rows}px`);
  }, [columns, rows]), { waitUntilMounted: true });

return (
  <div className="p-6 flex flex-col justify-center overflow-hidden flex-grow-1 place-items-center place-content-center">
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
      <DragDropProvider>

      </DragDropProvider>
    </div>
  </div>
);
}
