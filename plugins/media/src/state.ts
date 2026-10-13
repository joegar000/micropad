export type MediaAction = "playPause" | "next" | "previous";

export type MediaState = {
  volume?: number;
  muted?: boolean;
  playing?: boolean;
  command?: { id: string; action: MediaAction };
};
