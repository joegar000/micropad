import { z } from "zod";
import { IdSchema } from "./primitives.js";
import { MicropadLayoutSchema } from "./layout.js";

export const WidgetCatalogItemSchema = z
  .object({
    id: IdSchema,
    type: IdSchema,
    title: z.string()
  })
  .passthrough();

export type WidgetCatalogItem = z.infer<typeof WidgetCatalogItemSchema>;

export const AppSnapshotSchema = z.object({
  widgets: z.array(WidgetCatalogItemSchema),
  layout: MicropadLayoutSchema.optional()
});

export type AppSnapshot = z.infer<typeof AppSnapshotSchema>;
