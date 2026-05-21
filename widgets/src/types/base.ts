import { z } from "zod";
import type { WidgetEvent } from "micropad-protocol";

export const BaseWidgetModel = z.object({
    title: z.string(),
    type: z.string(),
    id: z.string()
});

export type IBaseWidgetModel = z.infer<typeof BaseWidgetModel>;

export interface SocketLike {
    emit(event: string, ...args: any[]): this | boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
}

export interface BaseWidgetViewModel {
    spec: IBaseWidgetModel;
}

export type WidgetEventContext = Partial<Pick<
    WidgetEvent,
    "clientId" | "deviceId" | "layoutId" | "pageId" | "widgetInstanceId" | "seq"
>>;

export abstract class BaseWidgetViewModel {
    static get id(): string {
        throw 'id() not implemented';
    }

    constructor(...args: any[]) {

    }
}
