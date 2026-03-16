import { z } from "zod";

export const WidgetSpec = z.object({
    title: z.string(),
    type: z.templateLiteral([z.string(), z.literal('.'), z.string()]),
    baseType: z.string()
});

export type IWidgetSpec = z.infer<typeof WidgetSpec>;
