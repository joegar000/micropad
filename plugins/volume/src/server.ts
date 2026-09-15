import { ServerPlugin, type ServerPluginContext } from "micropad-sdk/server";
import { autorun, runInAction } from "mobx";
import loudness from "loudness";
import { Mutex } from "es-toolkit";

class LoudnessController {
  private static readonly instance = new LoudnessController();
  private readonly mutex = new Mutex();

  private constructor() {}

  static getInstance(): LoudnessController {
    return LoudnessController.instance;
  }

  async getVolume(): Promise<number> {
    return this.withLock(() => loudness.getVolume());
  }

  async setVolume(volume: number): Promise<void> {
    return this.withLock(() => loudness.setVolume(volume));
  }

  private async withLock<T>(operation: () => Promise<T>): Promise<T> {
    await this.mutex.acquire();
    try {
      return await operation();
    } finally {
      this.mutex.release();
    }
  }
}

const volumeController = LoudnessController.getInstance();

export default class VolumePlugin extends ServerPlugin {
  pluginName = "volume";

  async init(ctx: ServerPluginContext): Promise<void> {
    const v = await volumeController.getVolume();
    runInAction(() => {
      ctx.runtimeState.volume = v;
    });

    let revision = 0;

    const syncVolume = async () => {
      const revisionBefore = revision;
      const v = await volumeController.getVolume();
      if (revisionBefore === revision && ctx.runtimeState.volume !== v) {
        runInAction(() => {
          ctx.runtimeState.volume = v;
        });
      }
      setTimeout(syncVolume, 200);
    };

    autorun(() => {
      revision++;
      volumeController.setVolume(ctx.runtimeState.volume);
    });

    syncVolume();
  }
}
