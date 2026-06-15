import { z } from "zod";
import {
    BaseWidgetModel,
    BaseWidgetViewModel,
    normalizeWidgetMenuItems,
    type WidgetEventContext,
    type WidgetMenuItemMap,
    type WidgetMenuItemsInput
} from "./base.js";
import type { Socket as ServerSocket } from "socket.io";
import type { Socket as ClientSocket } from "socket.io-client";

export const ButtonIconModel = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("image"),
        src: z.string(),
        alt: z.optional(z.string())
    }),
    z.object({
        type: z.literal("emoji"),
        value: z.string(),
        label: z.optional(z.string())
    })
]);

export type IButtonIconModel = z.infer<typeof ButtonIconModel>;

export const ButtonPrimaryActionModel = z.object({
    requires: z.optional(z.array(z.object({
        configKey: z.string(),
        fallbackActionId: z.string()
    })))
});

export const ButtonModel = BaseWidgetModel.extend({
    text: z.string(),
    icon: z.optional(ButtonIconModel),
    canToggle: z.optional(z.boolean()),
    primaryAction: z.optional(ButtonPrimaryActionModel),
    id: z.literal('button')
});

export type IButtonModel = z.infer<typeof ButtonModel>;
export type ButtonClickPayload = { active: boolean } & Record<string, unknown>;

export class ButtonViewModel<TMenuItems extends WidgetMenuItemMap = WidgetMenuItemMap> extends BaseWidgetViewModel<TMenuItems> {
    static id = 'button';
    declare readonly spec: IButtonModel;

    constructor(spec: IButtonModel) {
        super(spec);
    }

    static fromConfig<TMenuItems extends WidgetMenuItemMap = WidgetMenuItemMap>(config: {
        pluginName: string,
        widgetName: string,
        title: string,
        text: string,
        icon?: IButtonIconModel,
        menuItems?: TMenuItems | WidgetMenuItemsInput,
        primaryAction?: z.infer<typeof ButtonPrimaryActionModel>,
        canToggle?: boolean
    }) {
        return new ButtonViewModel<TMenuItems>({
            type: `${config.pluginName}.${config.widgetName}`,
            title: config.title,
            text: config.text,
            icon: config.icon,
            menuItems: normalizeWidgetMenuItems(config.menuItems),
            primaryAction: config.primaryAction,
            canToggle: config.canToggle,
            id: 'button'
        })
    }

    /** `data.active` should always be false for models where `canToggle` !== `true` */
    emitClick(socket: ClientSocket | ServerSocket, data: ButtonClickPayload, context: WidgetEventContext = {}) {
        this.emitAction(socket, 'click', data, context);
    }

    /** `data.active` should always be false for models where `canToggle` !== `true` */
    onClick(socket: ClientSocket | ServerSocket, cb: (data: ButtonClickPayload, context?: WidgetEventContext) => void) {
        return this.onAction<ButtonClickPayload>(socket, 'click', cb);
    }
    
    emitActiveChange(socket: ClientSocket | ServerSocket, data: { isActive: boolean }, context: WidgetEventContext = {}) {
        this.emitResponse(socket, 'activeChange', data, context);
    }

    emitConfirm(socket: ClientSocket | ServerSocket, data: Record<string, unknown> = {}, context: WidgetEventContext = {}) {
        this.emitResponse(socket, 'confirm', data, context);
    }

    onConfirm(socket: ClientSocket | ServerSocket, cb: (data: Record<string, unknown>) => void) {
        return this.onAction<Record<string, unknown>>(socket, 'confirm', cb);
    }

    onActiveChange(socket: ClientSocket | ServerSocket, cb: (data: { isActive: boolean }) => void) {
        if (this.spec.canToggle) {
            return this.onAction<{ isActive: boolean }>(socket, 'activeChange', cb);
        }
        return () => {};
    }
}
