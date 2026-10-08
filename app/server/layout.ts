import { ServerBridge } from "micropad-sdk/server";
import { type Socket } from "socket.io";
import { DB, type Schema } from "./db/db.ts";
import { reaction, runInAction } from "mobx";
import { clone } from "es-toolkit/compat";

export function syncLayout(socket: Socket) {
  const bridge = ServerBridge.getArr<Schema['layouts']>('db:micropad-layouts');

  runInAction(() => {
    while (bridge.data.length) {
      bridge.data.pop();
    }

    for (const index of DB.data.layouts.keys()) {
      bridge.data[index] = DB.data.layouts[index];
    }
  });

  reaction(
    () => JSON.stringify(bridge.data),
    () => {
      DB.data.layouts = clone(bridge.data);
    }
  );

  bridge.attach(socket);
  return bridge.data;
}
