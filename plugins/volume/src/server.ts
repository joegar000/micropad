import { ServerPlugin, type ServerPluginContext } from "micropad-sdk/server";
import { autorun, runInAction } from "mobx";
import loudness from "loudness";

export default class VolumePlugin extends ServerPlugin {
  pluginName = "volume";

  async init(ctx: ServerPluginContext): Promise<void> {
    const v = await loudness.getVolume();
    runInAction(() => {
      ctx.runtimeState.volume = v;
    });

    let setPromise = Promise.resolve();
    let settingVolume = 0;
    let settingVolume2 = 0;
    const keepVolumeSynced = async () => {
      await setPromise;
      const v = await loudness.getVolume();
      if (!settingVolume2) {
        settingVolume++;
        runInAction(() => {
          console.log('syncing to', v)
          ctx.runtimeState.volume = v;
        });
        settingVolume--;
      }
      setTimeout(keepVolumeSynced, 1000);
    }

    autorun(async () => {
      if (!settingVolume) {
        settingVolume2++;
        await loudness.setVolume(ctx.runtimeState.volume);
        settingVolume2--;
      }
    });

    keepVolumeSynced();
  }
}
