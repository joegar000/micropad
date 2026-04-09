import { createContext } from "react";
import type { IWidgetModel } from "micropad-widgets";

export interface WidgetSpecLookup {
  [type: `${string}.${string}`]: IWidgetModel;
}

export const WidgetSpecContext = createContext<WidgetSpecLookup>({});