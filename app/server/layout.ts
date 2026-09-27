import { bridge } from "micropad-sdk/server";
import { reaction, runInAction } from "mobx";
import { type Socket } from "socket.io";
import { DB } from "./db/db.ts";
import { clone } from "es-toolkit/compat";

export function syncLayout(socket: Socket) {
  const { data, attach } = bridge('db:micropad-layout');

  runInAction(() => {
    DB.data.layouts ??= {};

    for (const key of Object.keys(data)) {
      delete data[key];
    }
    for (const key of Object.keys(DB.data.layouts!)) {
      data[key] = DB.data.layouts![key];
    }
  });

  attach(socket);

  reaction(
    () => JSON.stringify(data),
    () => {
      DB.data.layouts = clone(data);
    }
  );

  attach(socket);

  return data;
}
