import { type Socket } from "socket.io-client";
import type { IRuntimeState, IPreservedState } from "micropad-sdk/shared";
import { bridge, type IClientPluginContext } from "micropad-sdk/client";

export default async function createClientPluginContext(socket: Socket, pluginName: string): Promise<IClientPluginContext> {
  const { data: runtime } = await bridge<IRuntimeState>(socket, `runtime:${pluginName}`);
  const { data: preserved } = await bridge<IPreservedState>(socket, `runtime:${pluginName}`);
  return {
    runtimeState: runtime,
    preservedState: preserved
  }
}

