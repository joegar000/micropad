import { type IButtonSpec } from "./types/button.js";
import { type ISliderSpec } from "./types/slider.js";

type IWidgetSpec = IButtonSpec | ISliderSpec;;

export * from "./types/index.js";
export type { IWidgetSpec };