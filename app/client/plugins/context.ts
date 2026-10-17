import { type Socket } from "socket.io-client";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { ClientBridge, ClientSignal, type IClientPluginContext } from "micropad-sdk/client";

export default async function createClientPluginContext(socket: Socket, pluginId: string): Promise<IClientPluginContext> {
  const runtime = (await ClientBridge.get<IRuntimeState>(socket, `runtime:${pluginId}`)).data;
  const preserved = (await ClientBridge.get<IPreservedState>(socket, `db:${pluginId}`)).data;
  const signal = ClientSignal.get(socket, pluginId);
  return {
    runtimeState: runtime,
    preservedState: preserved,
    signal
  }
}

