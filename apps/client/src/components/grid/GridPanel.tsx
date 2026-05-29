import { Fragment, use, useEffect, useMemo, useState } from "react";
import { useEditingStore } from "../../store/editing-store";
import { Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { WidgetSpecContext } from "./widgets/speclookup";
import { SpecContext, WidgetRegistry } from "./widgets";
import { type IWidgetModel } from "micropad-widgets";
import "./widgets";

export function GridPanel() {
  const [query, setQuery] = useState("");
  const setSidebarOpen = useEditingStore(s => s.setSidebarOpen);
  const setDraggedWidgetType = useEditingStore(s => s.setDraggedWidgetType);
  const [dragging, setDragging] = useState(false);
  const specs = use(WidgetSpecContext);

  const items: IWidgetModel[] = useMemo(() => {
    const qs = query.trim().toLowerCase();
    return Object.values(specs).filter((spec) => {
      if (!qs) return true;
      return (
        spec.title.toLowerCase().includes(qs) ||
        (spec.title || "").toLowerCase().includes(qs)
      );
    });
  }, [query, specs]);

  useEffect(() => {
    const dragEnd = () => {
      if (dragging) {
          setTimeout(() => {
            setSidebarOpen(true);
            setDraggedWidgetType(null);
            setDragging(false);
          }, 0);
        }
    };
    document.addEventListener('dragend', dragEnd);
    return () => {
      document.removeEventListener('dragend', dragEnd);
    }
  }, [dragging, setDraggedWidgetType, setSidebarOpen]);

  return (
    <div className="flex flex-col" style={{ maxHeight: '100vh', zIndex: 100 }} onDragEnter={(e) => e.preventDefault()} onDragOver={(e) => e.preventDefault()}>
      <div className="flex-grow-0 p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="text-lg font-semibold">Widgets</div>
        <div className="flex items-center gap-2">
          <input
            className="rounded px-2 py-1 bg-neutral-800 text-sm"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            className="px-2 py-1"
            onClick={() => {
              setSidebarOpen(false);
            }}
          >
            <CloseIcon />
          </Button>
        </div>
      </div>
      <div className="flex-grow-1 p-3 overflow-y-auto h-full panel-items flex flex-col gap-3 items-center">
        {items.map((it) => {
          const Widget = WidgetRegistry.get(it);
          return (
            <Fragment key={it.type}>
              <div className="flex" style={{ aspectRatio: 1, maxWidth: '10em', maxHeight: '10em', width: '100%' }}>
                <div
                  className="flex-grow-1 flex"
                  draggable={true}
                  unselectable="on"
                  onDragStart={e => {
                    // this is a hack for firefox
                    // Firefox requires some kind of initialization
                    // which we can do by adding this attribute
                    // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
                    e.dataTransfer.setData("text/plain", "");
                    e.dataTransfer.setData("micropad/widget-type", it.type);
                    e.dataTransfer.effectAllowed = "copy";
                    setDraggedWidgetType(it.type);
                    setDragging(true);
                    setSidebarOpen(false);
                  }}
                >
                  {Widget ? (
                    <SpecContext value={it}>
                      <Widget {...it} />
                    </SpecContext>
                  ) : (
                    <div className="m-2 flex flex-grow-1 flex-col justify-center rounded-2xl border border-neutral-700 bg-neutral-800/80 p-4 text-neutral-100 shadow-xl">
                      <div className="text-sm font-medium text-neutral-300">{it.title}</div>
                      <div className="mt-2 break-all text-xs text-neutral-500">{it.type}</div>
                    </div>
                  )}
                </div>
              </div>
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
