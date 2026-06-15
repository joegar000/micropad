import assert from "node:assert/strict";
import test from "node:test";
import { ButtonViewModel, SliderViewModel } from "../dist/index.es.js";

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
    for (const listener of this.listeners.get(event) ?? []) {
      listener(...args);
    }
    return true;
  }
}

test("button viewmodels route actions over typed widget events", () => {
  const socket = new FakeSocket();
  const button = ButtonViewModel.fromConfig({
    pluginName: "media",
    widgetName: "playPause",
    title: "Play / Pause",
    text: "Play / Pause",
    canToggle: true
  });
  let clickPayload;
  let clickContext;
  let confirmed;

  button.onClick(socket, (data, context) => {
    clickPayload = data;
    clickContext = context;
    button.emitConfirm(socket, { ok: true }, context);
  });
  button.onConfirm(socket, data => {
    confirmed = data;
  });

  button.emitClick(socket, { active: true }, { widgetInstanceId: "widget-play" });

  assert.equal(button.eventName("click"), "widget:media.playPause:click");
  assert.equal(socket.emitted[0].event, "widget:media.playPause:click");
  assert.equal(socket.emitted[1].event, "widget:media.playPause:confirm");
  assert.deepEqual(clickPayload, { active: true });
  assert.equal(clickContext.widgetInstanceId, "widget-play");
  assert.deepEqual(confirmed, { ok: true });
});

test("slider viewmodels broadcast changes over typed widget events", () => {
  const socket = new FakeSocket();
  const slider = SliderViewModel.fromConfig({
    pluginName: "volume",
    widgetName: "masterVolume",
    title: "Volume"
  });
  let received;

  slider.onChange(socket, data => {
    received = data;
  });
  slider.emitChange(socket, { value: 42 });

  assert.equal(slider.eventName("change"), "widget:volume.masterVolume:change");
  assert.equal(socket.emitted[0].event, "widget:volume.masterVolume:change");
  assert.deepEqual(received, { value: 42 });
});

test("menu item viewmodels use socket acknowledgements for action responses", async () => {
  const socket = new FakeSocket();
  const button = ButtonViewModel.fromConfig({
    pluginName: "appLauncher",
    widgetName: "launcher",
    title: "App Launcher",
    text: "Set app",
    menuItems: {
      setApp: {
        title: "Set app",
        action: {
          type: "modal",
          title: "Set app",
          requestAction: "listApps",
          configKey: "app"
        }
      }
    }
  });
  const menuItem = button.menuItems.setApp;
  let requestContext;
  let response;

  menuItem.on(socket, (_data, context) => {
    requestContext = context;
    return {
      items: [
        {
          id: "safari",
          title: "Safari",
          value: { target: "/Applications/Safari.app" }
        }
      ]
    };
  });

  menuItem.emit(
    socket,
    { config: {} },
    { widgetInstanceId: "widget-launcher" },
    data => {
      response = data;
    }
  );
  await new Promise(resolve => setTimeout(resolve, 0));

  assert.equal(menuItem.eventName(), "widget:appLauncher.launcher:menu:setApp:modal:listApps");
  assert.equal(socket.emitted[0].event, "widget:appLauncher.launcher:menu:setApp:modal:listApps");
  assert.equal(requestContext.widgetInstanceId, "widget-launcher");
  assert.equal(response.items[0].title, "Safari");
});
