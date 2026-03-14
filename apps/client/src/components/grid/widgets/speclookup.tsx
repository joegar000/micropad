import { createContext } from "react";
import type { WidgetSpec } from "./WidgetBase";

export interface WidgetSpecLookup {
  [type: `${string}.${string}`]: WidgetSpec<string>;
}

export const WidgetSpecContext = createContext<WidgetSpecLookup>({});