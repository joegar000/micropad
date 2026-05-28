import { z } from "zod";
import { IdSchema, IsoDateStringSchema } from "./primitives.js";
import { nowIso } from "./time.js";

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

export function createWidgetEvent(input: Omit<WidgetEvent, "createdAt"> & { createdAt?: string }): WidgetEvent {
  return WidgetEventSchema.parse({
    ...input,
    createdAt: input.createdAt ?? nowIso()
  });
}
