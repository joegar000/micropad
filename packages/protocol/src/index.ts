import { z } from "zod";

export const MICROPAD_LAYOUT_VERSION = 1;

export const SocketEvent = {
  AppGet: "app:get",
  AppSnapshot: "app:snapshot",
  LayoutUpdate: "layout:update",
  LayoutSaved: "layout:saved",
  WidgetEvent: "widget:event",
  PairingStart: "pairing:start",
  PairingComplete: "pairing:complete"
} as const;

export type SocketEventName = (typeof SocketEvent)[keyof typeof SocketEvent];

export const IdSchema = z.string().min(1);
export const IsoDateStringSchema = z.string().datetime();

export const WidgetCatalogItemSchema = z
  .object({
    id: IdSchema,
    type: IdSchema,
    title: z.string()
  })
  .passthrough();

export type WidgetCatalogItem = z.infer<typeof WidgetCatalogItemSchema>;

export const WidgetConfigSchema = z.record(z.string(), z.unknown());

export const WidgetInstanceSchema = z.object({
  id: IdSchema,
  widgetType: IdSchema,
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1),
  h: z.number().int().min(1),
  config: WidgetConfigSchema
});

export type WidgetInstance = z.infer<typeof WidgetInstanceSchema>;

export const LayoutPageSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  rows: z.number().int().min(1),
  columns: z.number().int().min(1),
  widgets: z.array(WidgetInstanceSchema)
});

export type LayoutPage = z.infer<typeof LayoutPageSchema>;

export const MicropadLayoutSchema = z.object({
  version: z.literal(MICROPAD_LAYOUT_VERSION),
  id: IdSchema,
  name: z.string().min(1),
  deviceId: IdSchema.optional(),
  pages: z.array(LayoutPageSchema).min(1),
  currentPageId: IdSchema,
  updatedAt: IsoDateStringSchema
});

export type MicropadLayout = z.infer<typeof MicropadLayoutSchema>;

export const DeviceProfileSchema = z.object({
  id: IdSchema,
  name: z.string().optional(),
  kind: z.enum(["phone", "tablet", "desktop", "unknown"]).default("unknown"),
  screen: z
    .object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      dpr: z.number().positive(),
      orientation: z.enum(["portrait", "landscape"])
    })
    .optional()
});

export type DeviceProfile = z.infer<typeof DeviceProfileSchema>;

export const WidgetEventSchema = z.object({
  clientId: IdSchema.optional(),
  deviceId: IdSchema.optional(),
  layoutId: IdSchema.optional(),
  pageId: IdSchema.optional(),
  widgetInstanceId: IdSchema.optional(),
  widgetType: IdSchema,
  action: IdSchema,
  payload: z.unknown(),
  seq: z.number().int().nonnegative().optional(),
  createdAt: IsoDateStringSchema
});

export type WidgetEvent = z.infer<typeof WidgetEventSchema>;

export const AppSnapshotSchema = z.object({
  widgets: z.array(WidgetCatalogItemSchema),
  layout: MicropadLayoutSchema.optional()
});

export type AppSnapshot = z.infer<typeof AppSnapshotSchema>;

export const LayoutUpdateSchema = MicropadLayoutSchema;
export type LayoutUpdate = z.infer<typeof LayoutUpdateSchema>;

export function nowIso() {
  return new Date().toISOString();
}

export function createDefaultLayout(options: {
  layoutId?: string;
  pageId?: string;
  name?: string;
  pageName?: string;
  rows?: number;
  columns?: number;
  deviceId?: string;
} = {}): MicropadLayout {
  const pageId = options.pageId ?? "page-main";
  return {
    version: MICROPAD_LAYOUT_VERSION,
    id: options.layoutId ?? "layout-default",
    name: options.name ?? "Default Layout",
    ...(options.deviceId ? { deviceId: options.deviceId } : {}),
    pages: [
      {
        id: pageId,
        name: options.pageName ?? "Main",
        rows: options.rows ?? 3,
        columns: options.columns ?? 5,
        widgets: []
      }
    ],
    currentPageId: pageId,
    updatedAt: nowIso()
  };
}

export function createWidgetEvent(input: Omit<WidgetEvent, "createdAt"> & { createdAt?: string }): WidgetEvent {
  return WidgetEventSchema.parse({
    ...input,
    createdAt: input.createdAt ?? nowIso()
  });
}
