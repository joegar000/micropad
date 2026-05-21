import { Fragment, use, useEffect, useMemo, useState } from "react";
import { useEditingStore } from "../../store/editing";
import { Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { WidgetSpecContext } from "./widgets/speclookup";
import { SpecContext, WidgetRegistry } from "./widgets";
import { type IWidgetModel } from "micropad-widgets";
import "./widgets";

export function GridPanel() {
  const [query, setQuery] = useState("");
  const setSidebarOpen = useEditingStore(s => s.setSidebarOpen);
  const [dragging, setDragging] = useState(false);
  const specs = use(WidgetSpecContext);

  const items: IWidgetModel[] = useMemo(() => {
    const qs = query.trim().toLowerCase();
    // @ts-ignore
    return Object.values(specs).filter((spec: IWidgetModel) => {
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
          setDragging(false);
        }, 0);
      }
    };
    document.addEventListener('dragend', dragEnd);
    return () => {
      document.removeEventListener('dragend', dragEnd);
    }
  }, [dragging]);

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
          console.log(it, Widget)
          return (
            <Fragment key={it.type}>
              {Widget && (
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
                      setDragging(true);
                      setSidebarOpen(false);
                    }}
                  >
                    <SpecContext value={it}>
                      <Widget {...it} />
                    </SpecContext>
                  </div>
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