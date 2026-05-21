import { z } from "zod";
import { createWidgetEvent, SocketEvent, WidgetEventSchema } from "micropad-protocol";
import { BaseWidgetModel, BaseWidgetViewModel, type WidgetEventContext } from "./base.js";
import type { Socket as ServerSocket } from "socket.io";
import type { Socket as ClientSocket } from "socket.io-client";

export const ButtonModel = BaseWidgetModel.extend({
    text: z.string(),
    canToggle: z.optional(z.boolean()),
    id: z.literal('button')
});

export type IButtonModel = z.infer<typeof ButtonModel>;

export class ButtonViewModel extends BaseWidgetViewModel {
    static id = 'button';
    constructor(public spec: IButtonModel) {
        super();
    }

    static fromConfig(config: {
        pluginName: string,
        widgetName: string,
        title: string,
        text: string,
        canToggle?: boolean
    }) {
        return new this({
            type: `${config.pluginName}.${config.widgetName}`,
            title: config.title,
            text: config.text,
            canToggle: config.canToggle,
            id: 'button'
        })
    }

    /** `data.active` should always be false for models where `canToggle` !== `true` */
    emitClick(socket: ClientSocket | ServerSocket, data: { active: boolean }, context: WidgetEventContext = {}) {
        if (context.widgetInstanceId) {
            socket.emit(SocketEvent.WidgetEvent, createWidgetEvent({
                ...context,
                widgetType: this.spec.type,
                action: 'click',
                payload: data
            }));
            return;
        }

        socket.emit(`${this.spec.type}.click`, data);
    }

    /** `data.active` should always be false for models where `canToggle` !== `true` */
    onClick(socket: ClientSocket | ServerSocket, cb: (data: { active: boolean }) => void) {
        const widgetEventCb = (data: unknown) => {
            const event = WidgetEventSchema.safeParse(data);
            if (event.success && event.data.widgetType === this.spec.type && event.data.action === 'click') {
                cb(event.data.payload as { active: boolean });
            }
        };

        socket.on(`${this.spec.type}.click`, cb);
        socket.on(SocketEvent.WidgetEvent, widgetEventCb);
        return () => {
            // @ts-ignore
            socket.off(`${this.spec.type}.click`, cb);
            // @ts-ignore
            socket.off(SocketEvent.WidgetEvent, widgetEventCb);
        }
    }
    
    emitActiveChange(socket: ClientSocket | ServerSocket, data: { isActive: boolean }, context: WidgetEventContext = {}) {
        if (context.widgetInstanceId) {
            socket.emit(SocketEvent.WidgetEvent, createWidgetEvent({
                ...context,
                widgetType: this.spec.type,
                action: 'activeChange',
                payload: data
            }));
            return;
        }

        socket.emit(`${this.spec.type}.activeChange`, data);
    }

    onActiveChange(socket: ClientSocket | ServerSocket, cb: (data: { isActive: boolean }) => void) {
        if (this.spec.canToggle) {
            const widgetEventCb = (data: unknown) => {
                const event = WidgetEventSchema.safeParse(data);
                if (event.success && event.data.widgetType === this.spec.type && event.data.action === 'activeChange') {
                    cb(event.data.payload as { isActive: boolean });
                }
            };

            socket.on(`${this.spec.type}.activeChange`, cb);
            socket.on(SocketEvent.WidgetEvent, widgetEventCb);
            return () => {
                // @ts-ignore
                socket.off(`${this.spec.type}.activeChange`, cb);
                // @ts-ignore
                socket.off(SocketEvent.WidgetEvent, widgetEventCb);
            }
        }
        return () => {};
    }
}
