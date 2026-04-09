import fs from "fs"
import { type BaseWidgetViewModel } from "micropad-widgets";
import path from "path"
import { Socket } from "socket.io";
import volume from "./plugins/volume/index.js";


export class PluginAPI {
    widgetSpecs: { [pluginName: string]: { [type: string]: BaseWidgetViewModel } } = {}
    handlers: { [event: string]: (data: any, socket: Socket) => void } = {};

    constructor(
        public ws: Socket
    ) {}

    createPlugin(
        pluginName: string,
        cb: ({ addWidgets }: { addWidgets: (...widgets: BaseWidgetViewModel[]) => void }) => void
    ) {
        const widgets: BaseWidgetViewModel[] = [];
        cb({
            addWidgets: (...w: BaseWidgetViewModel[]) => widgets.push(...w)
        });
        this.widgetSpecs = {
            ...this.widgetSpecs,
            [pluginName]: widgets.reduce((p, c) => ({
                ...p,
                [c.spec.type]: c
            }), {})
        };
    }

    serialize() {
        return {
            widgets: this.widgetSpecs
        }
    }
}

export async function loadPlugins(socket: Socket) {
    const api = new PluginAPI(socket);
    volume(api);
    return api;
}