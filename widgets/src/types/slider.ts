import { z } from "zod";
import { BaseWidgetModel, type BaseWidgetViewModel, type SocketLike } from "./base.js";

export const SliderModel = BaseWidgetModel.extend({
    step: z.optional(z.number()),
    min: z.optional(z.number()),
    max: z.optional(z.number())
});

export type ISliderModel = z.infer<typeof SliderModel>;

export class SliderViewModel implements BaseWidgetViewModel {
    constructor(public spec: ISliderModel) {}

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
            max: config.max
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
