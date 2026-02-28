import React, { useEffect, useMemo, useRef, useState } from "react";
import { Widgets, WidgetSpecs } from "../widgets/Registration";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shouldReopenRef = useRef(false);
  const userClosedRef = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (shouldReopenRef.current && !userClosedRef.current) {
        setOpen(true);
      }
      shouldReopenRef.current = false;
    };
    window.addEventListener("dragend", handler);
    window.addEventListener("drop", handler);
    return () => {
      window.removeEventListener("dragend", handler);
      window.removeEventListener("drop", handler);
    };
  }, []);

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

  function handleDragStart(e: React.DragEvent, type: string) {
    // put a structured payload so Gridstack drop handler can parse sizes
    const payload = { type, w: 2, h: 2 };
    try {
      e.dataTransfer.setData('application/widget', JSON.stringify(payload));
    } catch {
      e.dataTransfer.setData('text/widget-type', type);
    }
    e.dataTransfer.effectAllowed = "copy";
    // close the sidebar during drag; reopen after drop
    shouldReopenRef.current = true;
    userClosedRef.current = false;
    setOpen(false);
  }

  function handleManualClose() {
    userClosedRef.current = true;
    shouldReopenRef.current = false;
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); userClosedRef.current = false; }}
        className="fixed top-6 left-6 z-40 bg-neutral-800 text-white p-2 rounded-full shadow-lg"
        aria-label="Open widgets"
      >
        ☰
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-neutral-900 text-neutral-100 shadow-xl transform transition-transform z-50 ${open ? "translate-x-0" : "translate-x-full"}`}
        role="complementary"
      >
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="text-lg font-semibold">Widgets</div>
          <div className="flex items-center gap-2">
            <input
              className="rounded px-2 py-1 bg-neutral-800 text-sm"
              placeholder="Search type or title"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleManualClose} className="px-2 py-1">✕</button>
          </div>
        </div>

        <div className="p-3 overflow-y-auto h-full">
          {items.map((it) => {
            const Widget = Widgets[it.type];
            return (
              <div
                key={it.type}
                draggable
                onDragStart={(e) => handleDragStart(e, it.type)}
                className="mb-3 p-2 bg-neutral-800/30 rounded hover:bg-neutral-800/50 cursor-grab"
              >
                <div className="text-sm text-neutral-300 font-medium">{it.spec.title || it.type}</div>
                <div className="mt-2 h-28 overflow-hidden bg-neutral-800 rounded">
                  {Widget ? (
                    <div className="p-2">
                      <Widget id={`preview-${it.type}`} w={1} h={1} />
                    </div>
                  ) : (
                    <div className="p-2 text-sm text-neutral-400">No preview</div>
                  )}
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-neutral-500">No widgets match your search.</div>
          )}
        </div>
      </div>
    </>
  );
}

export const SidebarSearch: React.FC<{
  open: boolean;
  onClose: () => void;
  onDragStart?: () => void;
}> = ({ open, onClose, onDragStart }) => {
  const [q, setQ] = useState('');

  const items = useMemo(() => {
    return Object.keys(Widgets).map((type) => ({ type, spec: WidgetSpecs[type] || { type } }));
  }, []);

  const filtered = items.filter(({ type, spec }) => {
    const hay = (type + ' ' + (spec.title || '')).toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div
      aria-hidden={!open}
      className={`fixed top-0 right-0 h-full w-96 bg-neutral-900/95 backdrop-blur transition-transform duration-300 z-50 ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-neutral-800">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search widgets..."
          className="w-full bg-neutral-800/60 p-2 rounded text-sm outline-none"
        />
        <button className="ml-2 p-2 text-sm text-neutral-300" onClick={onClose}>Close</button>
      </div>
      <div className="p-4 overflow-auto h-[calc(100%-64px)]">
        {filtered.map(({ type, spec }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer?.setData('application/widget', JSON.stringify({ type }));
              e.dataTransfer?.setData('text/plain', type);
              e.dataTransfer!.effectAllowed = 'copy';
              onDragStart?.();
            }}
            onDragEnd={() => {
              // no-op here; Gridstack will decide reopen via drop callback
            }}
            className="mb-3 p-3 bg-neutral-800/60 rounded border border-neutral-700 cursor-grab"
          >
            <div className="text-sm font-medium text-neutral-200">{spec.title || type}</div>
            <div className="text-xs text-neutral-400">{type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
