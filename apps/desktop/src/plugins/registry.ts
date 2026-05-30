import { type BaseWidgetViewModel } from "micropad-widgets";
import { Socket } from "socket.io";
import appLauncher from "./app-launcher/index.js";
import mediaControls from "./media-controls/index.js";
import volume from "./volume/index.js";


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
    appLauncher(api);
    mediaControls(api);
    return api;
}
