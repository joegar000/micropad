import { z } from "zod";
import { createWidgetEvent, SocketEvent, WidgetEventSchema } from "micropad-protocol";
import { BaseWidgetModel, BaseWidgetViewModel, type SocketLike, type WidgetEventContext } from "./base.js";

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

    emitChange(socket: SocketLike, data: { value: number }, context: WidgetEventContext = {}) {
        if (context.widgetInstanceId) {
            socket.emit(SocketEvent.WidgetEvent, createWidgetEvent({
                ...context,
                widgetType: this.spec.type,
                action: 'change',
                payload: data
            }));
            return;
        }

        socket.emit(`${this.spec.type}.change`, data);
    }

    onChange(socket: SocketLike, cb: (data: { value: number }) => void) {
        const widgetEventCb = (data: unknown) => {
            const event = WidgetEventSchema.safeParse(data);
            if (event.success && event.data.widgetType === this.spec.type && event.data.action === 'change') {
                cb(event.data.payload as { value: number });
            }
        };

        socket.on(`${this.spec.type}.change`, cb);
        socket.on(SocketEvent.WidgetEvent, widgetEventCb);
        return () => {
            // @ts-ignore
            socket.off(`${this.spec.type}.change`, cb);
            // @ts-ignore
            socket.off(SocketEvent.WidgetEvent, widgetEventCb);
        }
    }
}
