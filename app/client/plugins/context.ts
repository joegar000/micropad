import { type Socket } from "socket.io-client";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { ClientBridge, type IClientPluginContext } from "micropad-sdk/client";

export default async function createClientPluginContext(socket: Socket, pluginId: string): Promise<IClientPluginContext> {
  const runtime = (await ClientBridge.get<IRuntimeState>(socket, `runtime:${pluginId}`)).data;
  const preserved = (await ClientBridge.get<IPreservedState>(socket, `db:${pluginId}`)).data;
  return {
    runtimeState: runtime,
    preservedState: preserved
  }
}

