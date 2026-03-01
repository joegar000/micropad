import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { GridStack } from "gridstack";
import Slide from "@mui/material/Slide";
import { Widgets, WidgetSpecs } from "../gridstack/widgets/Registration";
import { useGridstackContext } from "../gridstack/Provider";
import clsx from "clsx";
import { Box } from "@mui/material";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shouldReopenRef = useRef(false);
  const userClosedRef = useRef(false);
  const boxRef = useRef<HTMLElement>(null);
  const { getGrid } = useGridstackContext();

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
    GridStack.setupDragIn('.sidebar-items .grid-stack-item');
  }, []);

  useEffect(() => {
    const grid = getGrid();
    if (!grid) return;

    grid.on('dragstart', (_event, el) => {
      if (el.closest('.sidebar-items')) {
        shouldReopenRef.current = true;
        userClosedRef.current = false;
        setOpen(false);
      }
    });

    grid.on('dragstop', (_event, el) => {
      if (el.closest('.sidebar-items')) {
        if (shouldReopenRef.current && !userClosedRef.current) {
          setOpen(true);
        }
        shouldReopenRef.current = false;
      }
    });
    return () => {
      grid.off('dragstart');
      grid.off('dragstop');
    }
  });

  return (
    <>
      <button
        onClick={() => { setOpen(true); userClosedRef.current = false; }}
        className="fixed top-6 right-6 z-40 bg-neutral-800 text-white p-2 rounded-full shadow-lg"
        aria-label="Open widgets"
      >
        ☰
      </button>
      <Box ref={boxRef}>
        <Slide direction="left" in={open} container={boxRef.current}>
          <div
            className={clsx(
              'fixed', 'top-0', 'right-0',
              'h-full', 'w-80', 'bg-neutral-900',
              'text-neutral-100', 'shadow-xl', 'z-50',
            )}
            role="complementary"
          >
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
                  userClosedRef.current = true;
                  shouldReopenRef.current = false;
                  setOpen(false);
                }} className="px-2 py-1">✕</button>
              </div>
            </div>
            <div className="p-3 overflow-y-auto h-full sidebar-items flex flex-col gap-3">
              {items.map((it) => {
                const Widget = Widgets[it.type];
                return (
                  <Fragment key={it.type}>
                    {Widget && (
                      <Widget id={`preview-${it.type}`} w={1} h={1} />
                    )}
                  </Fragment>
                );
              })}
              {items.length === 0 && (
                <div className="text-neutral-500">No widgets match your search.</div>
              )}
            </div>
          </div>
        </Slide>
      </Box>
    </>
  );
}
