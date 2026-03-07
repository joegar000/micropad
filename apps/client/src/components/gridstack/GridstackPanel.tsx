import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { GridStack } from "gridstack";
import { useEditingStore } from "../../store/editing";
import { widgetRegistry } from "./widgets/Registration";
import { GridStackDragInItem, useGridStackContext } from "../../../lib/gridstack-react";

export function GridstackPanel() {
  const [query, setQuery] = useState("");
  const shouldReopenRef = useRef(false);
  const setSidebarOpen = useEditingStore(s => s.setSidebarOpen);
  const { _gridStack: { value: gridStack } }  = useGridStackContext();
  const [dragging, setDragging] = useState(false);

  const items = useMemo(() => {
    const qs = query.trim().toLowerCase();
    return Object.keys(widgetRegistry)
      .filter((t) => {
        if (!qs) return true;
        return (
          t.toLowerCase().includes(qs) ||
          (t || "").toLowerCase().includes(qs)
        );
      })
      .map((t) => ({ type: t }));
  }, [query]);

  useEffect(() => {
    GridStack.setupDragIn('.panel-items .grid-stack-item');
  }, []);

  useEffect(() => {
    const pointerUp = () => {
      if (dragging) {
        setSidebarOpen(true);
        setDragging(false);
      }
    };
    document.addEventListener('pointerup', pointerUp);
    return () => {
      document.removeEventListener('pointerup', pointerUp);
    }
  }, [dragging]);

  return (
    <div className="flex flex-col" style={{ maxHeight: '100vh', zIndex: 100 }}>
      <div className="flex-grow-0 p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="text-lg font-semibold">Widgets</div>
        <div className="flex items-center gap-2">
          <input
            className="rounded px-2 py-1 bg-neutral-800 text-sm"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => {
            shouldReopenRef.current = false;
            setSidebarOpen(false);
          }} className="px-2 py-1">✕</button>
        </div>
      </div>
      <div className="flex-grow-1 p-3 overflow-y-auto h-full panel-items flex flex-col gap-3 items-center">
        {items.map((it) => {
          const Widget = widgetRegistry[it.type];
          return (
            
            <Fragment key={it.type}>
              {Widget && (
                <div className="flex" style={{ aspectRatio: 1, maxWidth: gridStack?.cellWidth(), maxHeight: gridStack?.cellWidth(), width: '100%' }}>
                  <GridStackDragInItem widget={{}} className="flex-grow-1"
                    onDragStart={() => {
                      setDragging(true);
                      setSidebarOpen(false);
                    }}
                  >
                    <Widget />
                  </GridStackDragInItem>
                </div>
              )}
            </Fragment>
          );
        })}
        {items.length === 0 && (
          <div className="text-neutral-500">No widgets match your search.</div>
        )}
      </div>
    </div>
  );
}