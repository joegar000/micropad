import clsx from "clsx";
import { createContext, use, useLayoutEffect, useRef } from "react";
import { useGridstackContext } from "..";

export interface WidgetSpec {
  type: string;
  title?: string;
}

export interface WidgetProps {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  children: React.ReactNode;
}

const WidgetId = createContext<string>("");

export function useWidgetId() {
  return use(WidgetId);
}

function Widget({
  id,
  x,
  y,
  w,
  h,
  children,
  ...spec
}: WidgetProps & WidgetSpec) {
  const ref = useRef<HTMLDivElement>(null);
  const { getGrid } = useGridstackContext();

  useLayoutEffect(() => {
    const grid = getGrid();
    const el = ref.current;
    if (!grid || !el) return;
    if (!el.closest('.grid-stack')) return;
    grid.setAnimation(false);
    grid.makeWidget(el);
    setTimeout(() => grid.setAnimation(true));
  }, [ref]);

  return (
    <WidgetId.Provider value={id}>
      <div
        ref={ref}
        className="grid-stack-item"
        gs-id={id}
        gs-x={x}
        gs-y={y}
        gs-w={w}
        gs-h={h}
      >
        <div
          className={clsx(
            "grid-stack-item-content",
            "overflow-hidden",
            "rounded-2xl",
            "bg-neutral-800/80",
            "backdrop-blur-md",
            "border border-neutral-700",
            "shadow-xl",
            "text-neutral-100",
            "flex",
            "flex-col",
            "justify-center"
          )}
        >
          {spec.title && (
            <div className="position-relative h-0">
              <div className="p-2 text-sm font-medium text-neutral-400 position-absolute">
                {spec.title}
              </div>
            </div>
          )}
          <div className="flex-grow-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </WidgetId.Provider>
  );
}

export const Widgets: Record<string, React.FC<Omit<WidgetProps, 'children'>>> = {};
export const WidgetSpecs: Record<string, WidgetSpec> = {};
export function widget(Component: React.FC<Omit<WidgetProps, 'children'>>, spec: WidgetSpec) {
  const WidgetComponent = (props: Omit<WidgetProps, 'children'>) => {
    return <Widget {...props} {...spec}><Component {...props} /></Widget>
  }
  if (Widgets[spec.type]) {
    throw new Error(`Widget type "${spec.type}" already exists.`);
  }
  Widgets[spec.type] = WidgetComponent;
  WidgetSpecs[spec.type] = spec;
  return WidgetComponent
}
