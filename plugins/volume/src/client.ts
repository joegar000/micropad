import { ClientPlugin, type ClientPluginContext } from "micropad-sdk/client";

export default class VolumePlugin extends ClientPlugin {
  pluginName = "volume";
  widgets = [];

  init(_context: ClientPluginContext) {
    console.log('client volume loaded');
  }
}
