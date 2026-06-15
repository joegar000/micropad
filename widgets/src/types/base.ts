import { z } from "zod";
import { WidgetMenuItemModel, type WidgetMenuItemMap } from "./menu.js";
import { WidgetRuntime, type WidgetMenuItemRuntimes } from "./runtime.js";

export const BaseWidgetModel = z.object({
    title: z.string(),
    type: z.string(),
    id: z.string(),
    menuItems: z.optional(z.array(WidgetMenuItemModel))
});

export type IBaseWidgetModel = z.infer<typeof BaseWidgetModel>;

export abstract class BaseWidgetViewModel<TMenuItems extends WidgetMenuItemMap = WidgetMenuItemMap> {
    readonly runtime: WidgetRuntime<TMenuItems>;
    readonly menuItems: WidgetMenuItemRuntimes<TMenuItems>;

    static get id(): string {
        throw 'id() not implemented';
    }

    constructor(public readonly spec: IBaseWidgetModel) {
        this.runtime = new WidgetRuntime<TMenuItems>(spec);
        this.menuItems = this.runtime.menuItems;
    }
}

export * from "./menu.js";
export * from "./runtime.js";
