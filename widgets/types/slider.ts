import { z } from "zod";
import { WidgetSpec } from "./base.js";

export const SliderSpec = WidgetSpec.extend({
    endpoint: z.string(),
    step: z.optional(z.number()),
    min: z.optional(z.number()),
    max: z.optional(z.number())
});

export type ISliderSpec = z.infer<typeof SliderSpec>;
