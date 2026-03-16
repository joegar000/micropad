import { createContext } from "react";
import type { IWidgetSpec } from "micropad-widgets";

export interface WidgetSpecLookup {
  [type: `${string}.${string}`]: IWidgetSpec;
}

export const WidgetSpecContext = createContext<WidgetSpecLookup>({});