import { Socket } from "socket.io";
import { loadPlugins } from "./plugin-manager.js";
import type { FileLayoutStore } from "./layout-store.js";
import { AppSnapshotSchema, SocketEvent, LayoutUpdateSchema, type AppSnapshot } from "micropad-protocol";

export async function connectApp(socket: Socket, layoutStore: FileLayoutStore) {
    const api = await loadPlugins(socket);

    const sendSnapshot = async () => {
        const snapshot: AppSnapshot = AppSnapshotSchema.parse({
            ...api.serialize(),
            layout: await layoutStore.getDefaultLayout()
        });

        socket.emit(SocketEvent.AppSnapshot, snapshot);
        socket.emit('app', snapshot);
    };

    socket.on(SocketEvent.AppGet, sendSnapshot);
    socket.on('app.get', sendSnapshot);
    socket.on(SocketEvent.LayoutUpdate, async data => {
        const result = LayoutUpdateSchema.safeParse(data);
        if (!result.success) {
            console.warn("Rejected invalid layout update:", result.error.message);
            return;
        }

        const layout = result.data;
        const saved = await layoutStore.saveLayout(layout);
        socket.emit(SocketEvent.LayoutSaved, {
            layoutId: saved.id,
            updatedAt: saved.updatedAt
        });
    });
}
