import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { GridStack } from "gridstack";
import { useEditingStore } from "../../store/editing";
import { widgetRegistry } from "./widgets/Registration";
import { GridStackDragInItem } from "../../../lib/gridstack-react";

export function GridstackPanel() {
  const [query, setQuery] = useState("");
  const shouldReopenRef = useRef(false);
  const setSidebarOpen = useEditingStore(s => s.setSidebarOpen);

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

  return (
    <div>
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
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
      <div className="p-3 overflow-y-auto h-full panel-items flex flex-col gap-3">
        {items.map((it) => {
          const Widget = widgetRegistry[it.type];
          return (
            
            <Fragment key={it.type}>
              {Widget && (
                <div className="flex" style={{ aspectRatio: 1 }}>
                  <GridStackDragInItem widget={{}} className="flex-grow-1">
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