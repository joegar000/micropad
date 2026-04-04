import fs from "fs"
import { BaseWidgetViewModel } from "micropad-widgets/types/base.js";
import path from "path"
import { Socket } from "socket.io";


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