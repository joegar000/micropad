import { z } from "zod";
import {
    BaseWidgetModel,
    BaseWidgetViewModel,
    normalizeWidgetMenuItems,
    type SocketLike,
    type WidgetEventContext,
    type WidgetMenuItemMap,
    type WidgetMenuItemsInput
} from "./base.js";

export const SliderModel = BaseWidgetModel.extend({
    step: z.optional(z.number()),
    min: z.optional(z.number()),
    max: z.optional(z.number()),
    id: z.literal('slider')
});

export type ISliderModel = z.infer<typeof SliderModel>;

export class SliderViewModel<TMenuItems extends WidgetMenuItemMap = WidgetMenuItemMap> extends BaseWidgetViewModel<TMenuItems> {
    static id = 'slider';
    declare readonly spec: ISliderModel;

    constructor(spec: ISliderModel) {
        super(spec);
    }

    static fromConfig<TMenuItems extends WidgetMenuItemMap = WidgetMenuItemMap>(config: {
        pluginName: string,
        widgetName: string,
        title: string,
        step?: number,
        min?: number,
        max?: number,
        menuItems?: TMenuItems | WidgetMenuItemsInput
    }) {
        return new SliderViewModel<TMenuItems>({
            type: `${config.pluginName}.${config.widgetName}`,
            title: config.title,
            step: config.step,
            min: config.min,
            max: config.max,
            menuItems: normalizeWidgetMenuItems(config.menuItems),
            id: 'slider'
        });
    }

    emitChange(socket: SocketLike, data: { value: number }, context: WidgetEventContext = {}) {
        this.runtime.emit('change', socket, data, context);
    }

    onChange(socket: SocketLike, cb: (data: { value: number }, context?: WidgetEventContext) => void) {
        return this.runtime.on<{ value: number }>('change', socket, cb);
    }
}
