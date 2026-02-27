import React, { useLayoutEffect, useRef, useState } from "react";
import { GridStack, type GridStackOptions } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import "./Dashboard.css";
import { useLayoutStore } from "../../store/layout";

interface DashboardProps {
  children: React.ReactNode;
}

export function Dashboard({ children }: DashboardProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState(0);
  const [columns] = useState(5);
  const [rows] = useState(5);
  const setLayout = useLayoutStore((s) => s.setLayout);
  const currentLayout = useLayoutStore((s) => s.widgets);

  useLayoutEffect(() => {
    if (!gridRef.current || !dashRef.current) return;

    const heightPx = dashRef.current.getBoundingClientRect().height;
    const rowHeight = heightPx / rows;
    setCellHeight(rowHeight);

    const grid = GridStack.init(
      {
        column: columns,
        maxRow: rows,
        minRow: rows,
        cellHeight: rowHeight,
        margin: '0.5em',
        float: true,
      },
      gridRef.current
    );

    grid.on("change", () => {
      const updated = grid.save(false, true) as GridStackOptions;
      const newLayout = currentLayout.map(w => {
        const updatedWidget = updated.children?.find(uw => uw.id === w.id);
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
      setLayout(newLayout);
    });

    return () => {
      grid.destroy(false);
    };
  }, []);

  return (
    <div className="h-full w-full p-6 flex flex-col">
      <div className="dashboard dashboard-editing bg-black flex-grow-1" ref={dashRef}
        style={{
          '--columns': columns,
          '--cell-height': `${cellHeight}px`,
          '--grid-color': 'grey'
        } as React.CSSProperties}
      >
        <div
          className="grid-stack"
          ref={gridRef}
        >
          {children}
        </div>
      </div>
    </div>
  );
}