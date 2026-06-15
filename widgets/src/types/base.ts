import { z } from "zod";
import { WidgetMenuItemModel, type WidgetMenuItemMap } from "./menu.js";
import {
    WidgetRuntime,
    type SocketLike,
    type WidgetAck,
    type WidgetEventContext
} from "./runtime.js";

export const BaseWidgetModel = z.object({
    title: z.string(),
    type: z.string(),
    id: z.string(),
    menuItems: z.optional(z.array(WidgetMenuItemModel))
});

export type IBaseWidgetModel = z.infer<typeof BaseWidgetModel>;

export abstract class BaseWidgetViewModel<TMenuItems extends WidgetMenuItemMap = WidgetMenuItemMap> {
    readonly runtime: WidgetRuntime<TMenuItems>;

    static get id(): string {
        throw 'id() not implemented';
    }

    constructor(public readonly spec: IBaseWidgetModel) {
        this.runtime = new WidgetRuntime<TMenuItems>(spec);
    }

    get menuItems() {
        return this.runtime.menuItems;
    }

    menuItem(id: string) {
        return this.runtime.menuItem(id);
    }

    eventName(action: string) {
        return this.runtime.eventName(action);
    }

    menuEventName(menuItemId: string, action: string) {
        return this.runtime.menuEventName(menuItemId, action);
    }

    emitAction<TPayload, TResponse = void>(
        socket: SocketLike,
        action: string,
        payload: TPayload,
        context: WidgetEventContext = {},
        ack?: WidgetAck<TResponse>
    ) {
        this.runtime.emit(action, socket, payload, context, ack);
    }

    emitResponse<TPayload>(
        socket: SocketLike,
        action: string,
        payload: TPayload,
        context: WidgetEventContext = {}
    ) {
        this.runtime.emitResponse(action, socket, payload, context);
    }

    onAction<TPayload, TResponse = void>(
        socket: SocketLike,
        action: string,
        cb: (data: TPayload, context: WidgetEventContext) => TResponse | Promise<TResponse> | void
    ) {
        return this.runtime.on(action, socket, cb);
    }
}

export * from "./menu.js";
export * from "./runtime.js";
