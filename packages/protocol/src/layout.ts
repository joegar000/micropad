import { z } from "zod";
import { IdSchema, IsoDateStringSchema } from "./primitives.js";
import { nowIso } from "./time.js";

export const MICROPAD_LAYOUT_VERSION = 1;

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

export const LayoutUpdateSchema = MicropadLayoutSchema;
export type LayoutUpdate = z.infer<typeof LayoutUpdateSchema>;

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
