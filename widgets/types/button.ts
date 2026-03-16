import { z } from "zod";
import { WidgetSpec } from "./base.js";

export const ButtonSpec = WidgetSpec.extend({
    text: z.string(),
    endpoint: z.string(),
    canToggle: z.optional(z.boolean())
});

export type IButtonSpec = z.infer<typeof ButtonSpec>;
