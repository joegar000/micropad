import { z } from "zod";

export const BaseWidgetModel = z.object({
    title: z.string(),
    type: z.string(),
});

export type IBaseWidgetModel = z.infer<typeof BaseWidgetModel>;

export interface SocketLike {
    emit(event: string, ...args: any[]): this | boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
}

export interface BaseWidgetViewModel {
    spec: IBaseWidgetModel;
}
