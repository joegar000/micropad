import clsx from "clsx";
import { createContext, use } from "react";

export interface WidgetProps {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  title?: string;
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
  title,
  children,
}: WidgetProps) {
  return (
    <WidgetId.Provider value={id}>
      <div
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
            "justify-center",
            "p-2"
          )}
        >
          {title && (
            <div className="position-relative h-0">
              <div className="text-sm font-medium text-neutral-400 position-absolute">
                {title}
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
export function widget(Component: React.FC, type: string, title?: string) {
  const WidgetComponent = (props: Omit<WidgetProps, 'children'>) => {
    return <Widget {...props} title={title ?? props.title}><Component /></Widget>
  }
  if (Widgets[type]) {
    throw new Error(`Widget type "${type}" already exists.`);
  }
  Widgets[type] = WidgetComponent;
  return WidgetComponent
}
