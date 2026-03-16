import { registerWidget } from "./WidgetBase";
import Button from "./Button";
import Slider from "./Slider";

let baseWidgetRegistry = registerWidget('button', Button);
baseWidgetRegistry = registerWidget('slider', Slider);
export * from "./WidgetBase";
export { baseWidgetRegistry };