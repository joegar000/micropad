import { z } from "zod";
import { BaseWidgetModel, type BaseWidgetViewModel } from "./base.js";
import type { Socket as ServerSocket } from "socket.io";
import type { Socket as ClientSocket } from "socket.io-client";

export const ButtonModel = BaseWidgetModel.extend({
    text: z.string(),
    canToggle: z.optional(z.boolean())
});

export type IButtonModel = z.infer<typeof ButtonModel>;

export class ButtonViewModel implements BaseWidgetViewModel {
    constructor(public spec: IButtonModel) {}

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
            canToggle: config.canToggle
        })
    }

    /** `data.active` should always be false for models where `canToggle` !== `true` */
    emitClick(socket: ClientSocket | ServerSocket, data: { active: boolean }) {
        socket.emit(`${this.spec.type}.click`, data);
    }

    /** `data.active` should always be false for models where `canToggle` !== `true` */
    onClick(socket: ClientSocket | ServerSocket, cb: (data: { active: boolean }) => void) {
        socket.on(`${this.spec.type}.change`, cb);
        return () => {
            // @ts-ignore
            socket.off(`${this.spec.type}.click`, cb);
        }
    }
    
    emitActiveChange(socket: ClientSocket | ServerSocket, data: { active: boolean }) {
        socket.emit(`${this.spec.type}.activeChange`, data);
    }

    onActiveChange(socket: ClientSocket | ServerSocket, cb: (data: { isActive: boolean }) => void) {
        if (this.spec.canToggle) {
            socket.on(`${this.spec.type}.activeChange`, cb);
            return () => {
                // @ts-ignore
                socket.off(`${this.spec.type}.activeChange`, cb);
            }
        }
        return () => {};
    }
}
