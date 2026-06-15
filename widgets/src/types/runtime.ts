import type { IBaseWidgetModel } from "./base.js";
import type { WidgetMenuItem, WidgetMenuItemMap } from "./menu.js";

export interface SocketLike {
    emit(event: string, ...args: any[]): this | boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
}

export type WidgetEventContext = {
    clientId?: string;
    deviceId?: string;
    layoutId?: string;
    pageId?: string;
    widgetInstanceId?: string;
    seq?: number;
};

export type WidgetActionEnvelope<TPayload> = {
    payload: TPayload;
    context: WidgetEventContext;
};

export type WidgetAck<TResponse> = (response: TResponse) => void;

export type WidgetMenuItemRuntimes<TMenuItems extends WidgetMenuItemMap = WidgetMenuItemMap> = {
    [TKey in keyof TMenuItems]: WidgetMenuItemRuntime
} & Record<string, WidgetMenuItemRuntime | undefined>;

function unpackEnvelope<TPayload>(data: unknown): WidgetActionEnvelope<TPayload> {
    if (data && typeof data === 'object' && 'payload' in data) {
        const envelope = data as Partial<WidgetActionEnvelope<TPayload>>;
        return {
            payload: envelope.payload as TPayload,
            context: envelope.context ?? {}
        };
    }

    return {
        payload: data as TPayload,
        context: {}
    };
}

function menuActionName(menuItem: WidgetMenuItem) {
    if (menuItem.action.type === 'modal') {
        return `modal:${menuItem.action.requestAction}`;
    }

    return menuItem.action.type;
}

export class WidgetMenuItemRuntime {
    constructor(
        private readonly owner: WidgetRuntime,
        public readonly spec: WidgetMenuItem
    ) {}

    eventName() {
        return this.owner.menuEventName(this.spec.id, menuActionName(this.spec));
    }

    emit<TPayload, TResponse = void>(
        socket: SocketLike,
        payload: TPayload,
        context: WidgetEventContext = {},
        ack?: WidgetAck<TResponse>
    ) {
        this.owner.emit(this.eventName(), socket, payload, context, ack);
    }

    on<TPayload, TResponse = void>(
        socket: SocketLike,
        cb: (data: TPayload, context: WidgetEventContext) => TResponse | Promise<TResponse> | void
    ) {
        return this.owner.on<TPayload, TResponse>(this.eventName(), socket, cb);
    }
}

export class WidgetRuntime<TMenuItems extends WidgetMenuItemMap = WidgetMenuItemMap> {
    readonly menuItems: WidgetMenuItemRuntimes<TMenuItems>;
    readonly menuItemList: WidgetMenuItemRuntime[];

    constructor(public readonly spec: IBaseWidgetModel) {
        const menuItems = (spec.menuItems ?? []).map(item => new WidgetMenuItemRuntime(this, item));
        this.menuItemList = menuItems;
        this.menuItems = menuItems.reduce<Record<string, WidgetMenuItemRuntime>>((acc, item) => {
            acc[item.spec.id] = item;
            return acc;
        }, {}) as WidgetMenuItemRuntimes<TMenuItems>;
    }

    eventName(action: string) {
        return action.startsWith('widget:')
            ? action
            : `widget:${this.spec.type}:${action}`;
    }

    menuEventName(menuItemId: string, action: string) {
        return this.eventName(`menu:${menuItemId}:${action}`);
    }

    menuItem(id: string) {
        return this.menuItems[id];
    }

    emit<TPayload, TResponse = void>(
        action: string,
        socket: SocketLike,
        payload: TPayload,
        context: WidgetEventContext = {},
        ack?: WidgetAck<TResponse>
    ) {
        const envelope: WidgetActionEnvelope<TPayload> = {
            payload,
            context
        };

        if (ack) {
            socket.emit(this.eventName(action), envelope, ack);
            return;
        }

        socket.emit(this.eventName(action), envelope);
    }

    emitResponse<TPayload>(
        action: string,
        socket: SocketLike,
        payload: TPayload,
        context: WidgetEventContext = {}
    ) {
        this.emit(action, socket, payload, context);
    }

    on<TPayload, TResponse = void>(
        action: string,
        socket: SocketLike,
        cb: (data: TPayload, context: WidgetEventContext) => TResponse | Promise<TResponse> | void
    ) {
        const eventName = this.eventName(action);
        const listener = (data: unknown, ack?: WidgetAck<TResponse>) => {
            const envelope = unpackEnvelope<TPayload>(data);
            void Promise.resolve(cb(envelope.payload, envelope.context))
                .then(response => {
                    if (ack && response !== undefined) {
                        ack(response);
                    }
                })
                .catch(error => {
                    console.error(`Failed to handle widget action "${eventName}":`, error);
                });
        };

        socket.on(eventName, listener);
        return () => {
            socket.off(eventName, listener);
        };
    }
}
