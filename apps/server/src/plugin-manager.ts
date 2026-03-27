import fs from "fs"
import { IButtonModel, ISliderModel } from "micropad-widgets";
import { BaseWidgetViewModel } from "micropad-widgets/types/base.js";
import path from "path"
import { Socket } from "socket.io";

class WidgetPacket {
    widgets: BaseWidgetViewModel[] = [];
    addWidgets(...viewModels: BaseWidgetViewModel[]) {
        this.widgets.push(...viewModels);
    }
}

export class PluginAPI {
    widgetSpecs: { [pluginName: string]: { [type: string]: BaseWidgetViewModel } } = {}
    handlers: { [event: string]: (data: any, socket: Socket) => void } = {};

    constructor(
        public ws: Socket
    ) {}

    createPlugin(pluginName: string, cb: (packet: WidgetPacket) => void) {
        const packet = new WidgetPacket();
        cb(packet);
        this.widgetSpecs = {
            ...this.widgetSpecs,
            [pluginName]: packet.widgets.reduce((p, c) => ({
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
    const pluginsDir = path.resolve("./src/plugins");
    const dirs = fs.readdirSync(pluginsDir);
    for (const dir of dirs) {
        const pluginPath = path.join(pluginsDir, dir)
        const mod = await import(`${pluginPath}/index.js`);
        const plugin = mod.default;
        if (typeof plugin === "function") {
            plugin(api);
        }
    }
    return api;
}