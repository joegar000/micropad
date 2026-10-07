import { bridge } from "micropad-sdk/server";
import { type Socket } from "socket.io";
import { DB } from "./db/db.ts";

export function syncLayout(socket: Socket) {
  console.log('HEY OVER HERE', JSON.parse(JSON.stringify(DB.data)))
  const { data, attach } = bridge('db:micropad-layouts', DB.data.layouts);

  // runInAction(() => {
  //   for (const key of Object.keys(data)) {
  //     delete data[key];
  //   }
  //   for (const key of Object.keys(DB.data.layouts!)) {
  //     data[key] = DB.data.layouts[key];
  //   }
  // });

  // reaction(
  //   () => JSON.stringify(data),
  //   () => {
  //     DB.data.layouts = clone(data);
  //   }
  // );

  attach(socket);

  return data;
}
