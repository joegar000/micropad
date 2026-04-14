import fs from "fs"
import { type BaseWidgetViewModel } from "micropad-widgets";
import path from "path"
import { Socket } from "socket.io";
import volume from "./plugins/volume/index.js";


export class PluginAPI {
    widgets: BaseWidgetViewModel[] = [];

    constructor(
        public ws: Socket
    ) {}

    createPlugin(
        pluginName: string,
        cb: ({ addWidgets }: { addWidgets: (...widgets: BaseWidgetViewModel[]) => void }) => void
    ) {
        cb({
            addWidgets: (...w: BaseWidgetViewModel[]) => this.widgets.push(...w)
        });
    }

    serialize() {
        return {
            widgets: this.widgets.map(w => w.spec)
        }
    }
}

export async function loadPlugins(socket: Socket) {
    const api = new PluginAPI(socket);
    volume(api);
    return api;
}