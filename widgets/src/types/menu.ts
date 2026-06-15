import { z } from "zod";

export const WidgetMenuModalActionModel = z.object({
    type: z.literal('modal'),
    title: z.string(),
    requestAction: z.string(),
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
export type WidgetMenuItemConfig = Omit<WidgetMenuItem, "id"> & { id?: string };
export type WidgetMenuItemMap = Record<string, WidgetMenuItemConfig>;
export type WidgetMenuItemsInput = WidgetMenuItem[] | WidgetMenuItemMap;

export type ModalItem = {
    id: string;
    title: string;
    subtitle?: string;
    value?: unknown;
    config?: Record<string, unknown>;
    specPatch?: Record<string, unknown>;
};

export type WidgetModalResponse = {
    items?: ModalItem[];
    error?: string;
};

export function normalizeWidgetMenuItems(input?: WidgetMenuItemsInput): WidgetMenuItem[] | undefined {
    if (!input) {
        return undefined;
    }

    if (Array.isArray(input)) {
        return input;
    }

    return Object.entries(input).map(([id, item]) => ({
        ...item,
        id: item.id ?? id
    }));
}
