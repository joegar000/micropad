import { Socket } from "socket.io";
import { loadPlugins } from "./plugin-manager.js";

export async function connectApp(socket: Socket) {
    const api = await loadPlugins(socket);
    // socket.emit('app', api.serialize());
}
