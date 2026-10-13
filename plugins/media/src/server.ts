import {
  isLinux,
  ServerPlugin,
  type ServerPluginContext,
} from "micropad-sdk/server";
import { reaction, runInAction } from "mobx";
import loudness from "loudness";
import { percentToVolume, PulseAudio, volumeToPercent } from "pulseaudio.js";
import { clamp, Mutex } from "es-toolkit";
import { NowPlaying, type NowPlayingMessage } from "node-nowplaying";
import type { MediaAction, MediaState } from "./state";

const mediaCommands: Record<
  MediaAction,
  "playPause" | "nextTrack" | "previousTrack"
> = {
  playPause: "playPause",
  next: "nextTrack",
  previous: "previousTrack",
};

export default class MediaPlugin extends ServerPlugin {
  pluginName = "media";

  // Each connected client gets a plugin instance, but shares the runtime state.
  private static readonly initializedStates = new WeakSet<MediaState>();
  private readonly mutex = new Mutex();
  private pulseAudio?: PulseAudio;
  private pulseAudioReady?: Promise<boolean>;

  init(ctx: ServerPluginContext): void {
    const state: MediaState = ctx.runtimeState;
    if (MediaPlugin.initializedStates.has(state)) return;
    MediaPlugin.initializedStates.add(state);

    this.pulseAudio = isLinux ? new PulseAudio("micropad") : undefined;
    this.pulseAudioReady = this.pulseAudio?.connect().then(
      () => true,
      () => false,
    );

    runInAction(() => {
      state.playing = false;
    });
    let currentPlayer: NowPlayingMessage | undefined;
    const player = new NowPlaying((media) => {
      // Follow the current player, or another player when it starts playing.
      if (
        currentPlayer &&
        media.deviceId !== currentPlayer.deviceId &&
        !media.isPlaying
      )
        return;
      currentPlayer = media;
      runInAction(() => {
        state.playing = media.isPlaying;
      });
    });
    const playerReady = player.subscribe().then(
      () => true,
      (error) => {
        console.error("Media subscription failed", error);
        return false;
      },
    );

    let revision = 0;
    let syncing = false;

    const update = (operation: () => Promise<unknown>) => {
      if (syncing) return;
      revision++;
      void this.withLock(operation).catch((error) => {
        console.error("Media update failed", error);
      });
    };

    reaction(
      () => state.volume,
      (volume) => {
        if (typeof volume === "number" && Number.isFinite(volume)) {
          update(() => this.setVolume(clamp(volume, 0, 100)));
        }
      },
    );

    reaction(
      () => state.muted,
      (muted) => {
        if (typeof muted === "boolean") update(() => this.setMuted(muted));
      },
    );

    reaction(
      () => state.command?.id,
      () => {
        const command = state.command;
        if (command && Object.hasOwn(mediaCommands, command.action)) {
          void playerReady
            .then(async (ready) => {
              if (!ready || !currentPlayer) return;
              await player[mediaCommands[command.action]](
                currentPlayer.deviceId,
              );
            })
            .catch((error) => console.error("Playback update failed", error));
        }
      },
    );

    const sync = async () => {
      try {
        await this.withLock(async () => {
          const revisionBefore = revision;
          const audio = await this.getAudioState();
          // A client may have changed the state while the system was being read.
          if (revisionBefore !== revision) return;

          syncing = true;
          try {
            runInAction(() => {
              state.volume = audio.volume;
              state.muted = audio.muted;
            });
          } finally {
            syncing = false;
          }
        });
      } catch (error) {
        console.error("Media sync failed", error);
      } finally {
        setTimeout(sync, 200);
      }
    };

    void sync();
  }

  private async getAudioState(): Promise<{ volume: number; muted: boolean }> {
    if (!(await this.pulseAudioReady)) {
      const [volume, muted] = await Promise.all([
        loudness.getVolume(),
        loudness.getMuted(),
      ]);
      return { volume, muted };
    }

    const sink = await this.pulseAudio!.getSinkInfo();
    const channels: number[] = sink.volume.current;
    return {
      volume: Math.round(
        channels.reduce((total, volume) => total + volumeToPercent(volume), 0) /
          channels.length,
      ),
      muted: sink.mute,
    };
  }

  private async setVolume(volume: number): Promise<void> {
    if (!(await this.pulseAudioReady)) return loudness.setVolume(volume);
    await this.pulseAudio!.setSinkVolume(percentToVolume(volume));
  }

  private async setMuted(muted: boolean): Promise<void> {
    if (!(await this.pulseAudioReady)) return loudness.setMuted(muted);
    await this.pulseAudio!.setSinkMute(muted);
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
