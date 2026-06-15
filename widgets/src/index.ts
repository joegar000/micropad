import { type IButtonModel } from "./types/button.js";
import { type ISliderModel } from "./types/slider.js";
import { SliderViewModel, ButtonViewModel } from "./types/index.js";

type IWidgetModel = IButtonModel | ISliderModel;

export * from "./types/index.js";
export type { IWidgetModel };
export { ButtonViewModel, SliderViewModel };
