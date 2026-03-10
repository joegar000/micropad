import clsx from "clsx";
import { createContext, use, type FC, type ReactNode } from "react";
import "./Registration.css";
import { useEditingStore } from "../../../store/editing";

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

export function Widget(props: { children: ReactNode, type: string, title?: string }) {
  const isEditing = useEditingStore(s => s.isEditing);
  return (
    <div
      data-type={props.type}
      className={clsx(
        "flex-grow-1",
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
        { "pointer-events-none": isEditing }
      )}
    >
      {props.title && (
        <div className="position-relative h-0">
          <div className="p-2 text-sm font-medium text-neutral-400 position-absolute">
            {props.title}
          </div>
        </div>
      )}
      <div className="flex-grow-1 overflow-hidden">
        {props.children}
      </div>
    </div>
  );
}

const widgetRegistry: Record<string, FC> = {};

export function registerWidget(type: string, component: FC<any>) {
  if (widgetRegistry[type])
    throw Error(`A widget named ${type} already exists`);
  widgetRegistry[type] = component;
}

export { widgetRegistry };
