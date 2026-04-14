import { z } from "zod";
import { BaseWidgetModel, BaseWidgetViewModel, type SocketLike } from "./base.js";

export const SliderModel = BaseWidgetModel.extend({
    step: z.optional(z.number()),
    min: z.optional(z.number()),
    max: z.optional(z.number()),
    id: z.literal('slider')
});

export type ISliderModel = z.infer<typeof SliderModel>;

export class SliderViewModel extends BaseWidgetViewModel {
    static id = 'slider';
    constructor(public spec: ISliderModel) {
        super();
    }

    static fromConfig(config: {
        pluginName: string,
        widgetName: string,
        title: string,
        step?: number,
        min?: number,
        max?: number
    }) {
        return new this({
            type: `${config.pluginName}.${config.widgetName}`,
            title: config.title,
            step: config.step,
            min: config.min,
            max: config.max,
            id: 'slider'
        });
    }

    emitChange(socket: SocketLike, data: { value: number }) {
        socket.emit(`${this.spec.type}.change`, data);
    }

    onChange(socket: SocketLike, cb: (data: { value: number }) => void) {
        socket.on(`${this.spec.type}.change`, cb);
        return () => {
            // @ts-ignore
            socket.off(`${this.spec.type}.change`, cb);
        }
    }
}
