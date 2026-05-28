import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultLayout, SocketEvent } from "../../../packages/protocol/dist/index.js";
import { connectApp } from "../dist/src/bridge/socket-handlers.js";

class FakeSocket {
  listeners = new Map();
  emitted = [];

  on(event, listener) {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push(listener);
    this.listeners.set(event, listeners);
    return this;
  }

  off(event, listener) {
    const listeners = this.listeners.get(event) ?? [];
    this.listeners.set(event, listeners.filter(candidate => candidate !== listener));
    return this;
  }

  emit(event, ...args) {
    this.emitted.push({ event, args });
    return true;
  }
}

test("connectApp sends an initial widget snapshot to newly connected sockets", async () => {
  const socket = new FakeSocket();
  const layout = createDefaultLayout();
  const layoutStore = {
    getDefaultLayout: async () => layout,
    saveLayout: async data => data
  };

  await connectApp(socket, layoutStore);

  const snapshot = socket.emitted.find(entry => entry.event === SocketEvent.AppSnapshot);
  assert.ok(snapshot);
  assert.equal(snapshot.args[0].widgets.length, 1);
  assert.equal(snapshot.args[0].widgets[0].id, "slider");
  assert.equal(snapshot.args[0].widgets[0].type, "volume.masterVolume");
  assert.equal(snapshot.args[0].widgets[0].title, "Volume");
  assert.equal(snapshot.args[0].layout.id, layout.id);
});
