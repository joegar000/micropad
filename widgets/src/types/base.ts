import { z } from "zod";
import type { WidgetEvent } from "micropad-protocol";

export const WidgetMenuModalActionModel = z.object({
    type: z.literal('modal'),
    title: z.string(),
    requestAction: z.string(),
    responseAction: z.string(),
    configKey: z.optional(z.string()),
    searchPlaceholder: z.optional(z.string()),
    requestPayload: z.optional(z.record(z.string(), z.unknown()))
});

export const WidgetMenuActionModel = WidgetMenuModalActionModel;

export const WidgetMenuItemModel = z.object({
    id: z.string(),
    title: z.string(),
    action: WidgetMenuActionModel
});

export type WidgetMenuModalAction = z.infer<typeof WidgetMenuModalActionModel>;
export type WidgetMenuAction = z.infer<typeof WidgetMenuActionModel>;
export type WidgetMenuItem = z.infer<typeof WidgetMenuItemModel>;

export const BaseWidgetModel = z.object({
    title: z.string(),
    type: z.string(),
    id: z.string(),
    menuItems: z.optional(z.array(WidgetMenuItemModel))
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
