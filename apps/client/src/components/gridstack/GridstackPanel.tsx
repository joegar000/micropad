import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { GridStack } from "gridstack";
import { Widgets, WidgetSpecs } from "./widgets/Registration";
import { useEditingStore } from "../../store/editing";
import useGridStore from "../../store/gridstack";

export function GridstackPanel() {
  const [query, setQuery] = useState("");
  const shouldReopenRef = useRef(false);
  const onReady = useGridStore(s => s.onReady);
  const on = useGridStore(s => s.on);
  const gridstack = useGridStore(s => s.gridstack);
  const setSidebarOpen = useEditingStore(s => s.setSidebarOpen);

  const items = useMemo(() => {
    const qs = query.trim().toLowerCase();
    return Object.keys(WidgetSpecs)
      .filter((t) => {
        const s = WidgetSpecs[t];
        if (!qs) return true;
        return (
          t.toLowerCase().includes(qs) ||
          (s.title || "").toLowerCase().includes(qs)
        );
      })
      .map((t) => ({ type: t, spec: WidgetSpecs[t] }));
  }, [query]);

  useEffect(() => {
    GridStack.setupDragIn('.panel-items .grid-stack-item');
  }, []);

  useEffect(() => {
    return onReady(() => {
      on('drag', (_event, el) => {
        if (el.gridstackNode?.id?.includes('preview')) {
          console.log('drag')
          shouldReopenRef.current = true;
          setSidebarOpen(false);
        }
      });

      on('dragstop', (_event, el) => {
        if (el.closest('.sidebar-items')) {
          if (shouldReopenRef.current) {
            setSidebarOpen(true);
          }
          shouldReopenRef.current = false;
        }
      });
    });
  }, [setSidebarOpen, onReady]);

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
          const Widget = Widgets[it.type];
          return (
            <Fragment key={it.type}>
              {Widget && (
                <div className="flex"
                  ref={div => {
                    div?.style.setProperty('width', `${gridstack?.cellWidth()}`);
                    div?.style.setProperty('height', `${gridstack?.cellWidth()}`);
                  }}
                >
                  <Widget id={`preview-${it.type}`} w={1} h={1} x={1} y={1} />
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