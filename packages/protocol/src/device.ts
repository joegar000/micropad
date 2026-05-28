import { z } from "zod";
import { IdSchema } from "./primitives.js";

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
