import {
  isLinux,
  ServerPlugin,
  type ServerPluginContext,
} from "micropad-sdk/server";
import { autorun, runInAction } from "mobx";
import loudness from "loudness";
import { percentToVolume, PulseAudio, volumeToPercent } from "pulseaudio.js";
import { Mutex } from "es-toolkit";

class VolumeController {
  private static readonly instance = new VolumeController();
  private readonly mutex = new Mutex();
  private readonly pulseAudio = isLinux ? new PulseAudio("micropad") : undefined;
  private readonly pulseAudioReady = this.pulseAudio
    ?.connect()
    .then(
      () => true,
      () => false,
    );

  private constructor() {}

  static getInstance(): VolumeController {
    return VolumeController.instance;
  }

  async getVolume(): Promise<number> {
    return this.withLock(async () => {
      if (!(await this.pulseAudioReady)) return loudness.getVolume();

      const channels: number[] = (await this.pulseAudio!.getSinkInfo()).volume
        .current;
      return Math.round(
        channels.reduce(
          (total, volume) => total + volumeToPercent(volume),
          0,
        ) / channels.length,
      );
    });
  }

  async setVolume(volume: number): Promise<void> {
    return this.withLock(async () => {
      if (!(await this.pulseAudioReady)) return loudness.setVolume(volume);
      await this.pulseAudio!.setSinkVolume(percentToVolume(volume));
    });
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

const volumeController = VolumeController.getInstance();

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
