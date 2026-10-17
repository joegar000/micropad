import {
  isLinux,
  ServerPlugin,
  ServerSignal,
} from "micropad-sdk/server";
import { autorun, runInAction } from "mobx";
import loudness from "loudness";
import { percentToVolume, PulseAudio, volumeToPercent } from "pulseaudio.js";
import { Mutex, clamp, isNotNil, noop } from "es-toolkit";
import { NowPlaying } from "node-nowplaying";
import type { MediaState } from "./state";

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

  private constructor() { }

  static getInstance(): VolumeController {
    return VolumeController.instance;
  }

  async getVolume(): Promise<number> {
    return this.withLock(async () => {
      if (!(await this.pulseAudioReady)) return loudness.getVolume();

      const channels: number[] = (await this.pulseAudio!.getSinkInfo()).volume.current;
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

  async getMuted(): Promise<boolean> {
    return this.withLock(async () => {
      if (!(await this.pulseAudioReady)) return loudness.getMuted();
      return (await this.pulseAudio?.getSinkInfo()).mute;
    });
  }

  async setMuted(muted: boolean): Promise<void> {
    return this.withLock(async () => {
      if (!(await this.pulseAudioReady)) return loudness.setMuted(muted);
      await this.pulseAudio!.setSinkMute(muted);
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
  pluginName = "media";

  async init(ctx: MediaState<ServerSignal>): Promise<void> {
    runInAction(() => {
      ctx.runtimeState.volume ??= 0;
      ctx.runtimeState.playing ??= false;
      ctx.runtimeState.muted ??= false;
    });


    // System volume
    const v = await volumeController.getVolume();
    runInAction(() => {
      ctx.runtimeState.volume = v;
    });

    ctx.signal.on('volumeUp', async (amount) => {
      if (typeof amount !== 'number') return;
      ctx.runtimeState.volume = clamp(ctx.runtimeState.volume! + amount, 0, 100);
    });

    ctx.signal.on('volumeDown', async (amount) => {
      if (typeof amount !== 'number') return;
      ctx.runtimeState.volume = clamp(ctx.runtimeState.volume! - amount, 0, 100);
    });

    const syncVolume = async () => {
      const v = await volumeController.getVolume();
      if (ctx.runtimeState.volume !== v) {
        ctx.runtimeState.volume = v;
      }
      setTimeout(syncVolume, 200);
    };

    syncVolume();


    // Media controls
    const nowPlaying = new NowPlaying(m => {
      ctx.runtimeState.playing ??= m.isPlaying;
    });

    await nowPlaying.unsubscribe();

    await nowPlaying.subscribe();

    ctx.signal.on('next', () => {
      nowPlaying.nextTrack();
    });

    ctx.signal.on('previous', () => {
      nowPlaying.previousTrack();
    });


    // state syncing
    autorun(() => {
      if (isNotNil(ctx.runtimeState.volume))
        volumeController.setVolume(ctx.runtimeState.volume);
    });

    autorun(() => {
      if (ctx.runtimeState.playing === true)
        nowPlaying.play();
      else if (ctx.runtimeState.playing === false)
        nowPlaying.pause();
    });

    autorun(() => {
      if (isNotNil(ctx.runtimeState.muted))
        volumeController.setMuted(ctx.runtimeState.muted);
    });
  }
}
