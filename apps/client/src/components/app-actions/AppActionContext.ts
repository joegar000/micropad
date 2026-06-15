import { createContext, use } from "react";
import type { IWidgetModel } from "micropad-widgets";

export type TriggerWidgetMenuActionInput = {
  spec: IWidgetModel;
  menuItemId: string;
  widgetInstanceId?: string | null;
};

export type AppActionContextValue = {
  triggerWidgetMenuAction: (input: TriggerWidgetMenuActionInput) => void;
};

export const AppActionContext = createContext<AppActionContextValue | null>(null);

export function useAppActions() {
  const context = use(AppActionContext);
  if (!context) {
    throw new Error("useAppActions must be used within AppActionProvider");
  }
  return context;
}
