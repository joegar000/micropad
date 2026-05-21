/* eslint-disable react-refresh/only-export-components */
import { ButtonViewModel, SliderViewModel } from "micropad-widgets";
import Button from "./Button";
import Slider from "./Slider";
import { WidgetRegistry } from "./WidgetBase";

WidgetRegistry.bindViewModel(ButtonViewModel, Button);
WidgetRegistry.bindViewModel(SliderViewModel, Slider);
export {
  BaseWidget,
  SpecContext,
  Widget,
  WidgetRegistry,
  useWidgetInstanceId
} from "./WidgetBase";
