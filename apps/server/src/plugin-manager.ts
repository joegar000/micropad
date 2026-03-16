import fs from "fs"
import { IButtonSpec, ISliderSpec } from "micropad-widgets";
import path from "path"
import { Socket } from "socket.io";

class PluginPacket {
    widgetSpecs: { [type: string]: IButtonSpec | ISliderSpec } = {};
    handlers: { [event: string]: (data: any, socket: Socket) => void } = {};

    constructor(
        public pluginName: string,
        public socket: Socket
    ) {}

    registerWidget(
        widgetName: string,
        { spec, on }: {
            spec: (Omit<(IButtonSpec | ISliderSpec), 'type'>),
            on: (eventName: string, ...args: any[]) => void
        }
    ) {
        const type = `${this.pluginName}.${widgetName}` as const;
        this.widgetSpecs[type] = { ...spec, type };
        this.socket.onAny((eventName: string, ...args) => {
            const eventPrefix = `${this.pluginName}:${widgetName}:`
            if (eventName.startsWith(eventPrefix)) {
                on(eventName.replace(eventPrefix, ''), ...args);
            }
        });
    }
}

export class PluginAPI {
    widgetSpecs: { [type: string]: IButtonSpec | ISliderSpec } = {};
    handlers: { [event: string]: (data: any, socket: Socket) => void } = {};
    pluginName: string = '';

    constructor(
        public ws: Socket
    ) {}

    createPlugin(pluginName: string, cb: (packet: PluginPacket) => void) {
        const packet = new PluginPacket(pluginName, this.ws);
        cb(packet);
        this.widgetSpecs = { ...this.widgetSpecs, ...packet.widgetSpecs };
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
        const pluginName = dir;
        api.pluginName = pluginName;
        const pluginPath = path.join(pluginsDir, dir)
        const mod = await import(`${pluginPath}/index.js`);
        const plugin = mod.default;
        if (typeof plugin === "function") {
            plugin(api);
        }
    }
    return api;
}