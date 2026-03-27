import { z } from "zod";

export const BaseWidgetModel = z.object({
    title: z.string(),
    type: z.string(),
});

export type IBaseWidgetModel = z.infer<typeof BaseWidgetModel>;

export interface BaseWidgetViewModel {
    spec: IBaseWidgetModel;
}
