import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ClientPlugin, Widget } from "micropad-sdk/client";
import { autorun, runInAction } from "mobx";
import { clamp } from "es-toolkit";
import { Button } from "../../../ui/src/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import NextIcon from "@hugeicons/core-free-icons/NextIcon";
import PauseIcon from "@hugeicons/core-free-icons/PauseIcon";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";
import PreviousIcon from "@hugeicons/core-free-icons/PreviousIcon";
import VolumeHighIcon from "@hugeicons/core-free-icons/VolumeHighIcon";
import VolumeMinusIcon from "@hugeicons/core-free-icons/VolumeMinusIcon";
import VolumeMute01Icon from "@hugeicons/core-free-icons/VolumeMute01Icon";
import VolumeUpIcon from "@hugeicons/core-free-icons/VolumeUpIcon";
import type { MediaState } from "./state";

type MediaProps = { state: MediaState };

function VolumeSlider({ state }: MediaProps) {
  const [volume, setVolume] = useState(() => state.volume ?? 0);
  useEffect(() => autorun(() => setVolume(state.volume ?? 0)), [state]);

  return (
    <input
      type="range"
      min={0}
      max={100}
      value={clamp(volume, 0, 100)}
      aria-label="Volume"
      aria-orientation="vertical"
      aria-valuetext={`${volume}%`}
      className="h-[calc(100%-1rem)] min-h-0 w-7 cursor-pointer accent-primary [direction:rtl] [writing-mode:vertical-lr]"
      onPointerDown={(event) => event.stopPropagation()}
      onChange={(event) =>
        runInAction(() => {
          state.volume = clamp(event.currentTarget.valueAsNumber, 0, 100);
        })
      }
    />
  );
}

function PlayPause({ state }: MediaProps) {
  const [playing, setPlaying] = useState(() => state.playing ?? false);
  useEffect(() => autorun(() => setPlaying(state.playing ?? false)), [state]);

  return (
    <Button
      type="button"
      size="icon-lg"
      aria-label={playing ? "Pause" : "Play"}
      aria-pressed={playing}
      title={playing ? "Pause" : "Play"}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() =>
        runInAction(() => {
          state.command = { id: crypto.randomUUID(), action: "playPause" };
        })
      }
    >
      <HugeiconsIcon
        icon={PlayIcon}
        altIcon={PauseIcon}
        showAlt={playing}
        strokeWidth={2}
      />
    </Button>
  );
}

function Mute({ state }: MediaProps) {
  const [muted, setMuted] = useState(() => state.muted ?? false);
  useEffect(() => autorun(() => setMuted(state.muted ?? false)), [state]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label={muted ? "Unmute" : "Mute"}
      aria-pressed={muted}
      title={muted ? "Unmute" : "Mute"}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() =>
        runInAction(() => {
          state.muted = !state.muted;
        })
      }
    >
      <HugeiconsIcon
        icon={VolumeHighIcon}
        altIcon={VolumeMute01Icon}
        showAlt={muted}
        strokeWidth={2}
      />
    </Button>
  );
}

function Next({ state }: MediaProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Next"
      title="Next"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() =>
        runInAction(() => {
          state.command = { id: crypto.randomUUID(), action: "next" };
        })
      }
    >
      <HugeiconsIcon icon={NextIcon} strokeWidth={2} />
    </Button>
  );
}

function Previous({ state }: MediaProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Previous"
      title="Previous"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() =>
        runInAction(() => {
          state.command = { id: crypto.randomUUID(), action: "previous" };
        })
      }
    >
      <HugeiconsIcon icon={PreviousIcon} strokeWidth={2} />
    </Button>
  );
}

function VolumeUp({ state }: MediaProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Volume up"
      title="Volume up"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() =>
        runInAction(() => {
          state.volume = clamp((state.volume ?? 0) + 5, 0, 100);
        })
      }
    >
      <HugeiconsIcon icon={VolumeUpIcon} strokeWidth={2} />
    </Button>
  );
}

function VolumeDown({ state }: MediaProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Volume down"
      title="Volume down"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={() =>
        runInAction(() => {
          state.volume = clamp((state.volume ?? 0) - 5, 0, 100);
        })
      }
    >
      <HugeiconsIcon icon={VolumeMinusIcon} strokeWidth={2} />
    </Button>
  );
}

function renderComponent(component: ReactNode) {
  const container = document.createElement("div");
  container.className =
    "relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden [contain:strict]";
  createRoot(container).render(component);
  return container;
}

export default class MediaPlugin extends ClientPlugin {
  displayName = "Media";
  widgets = {
    volume: class extends Widget {
      displayName = "Volume";
      get dom() {
        return renderComponent(
          <VolumeSlider state={this.context.runtimeState} />,
        );
      }
    },
    playPause: class extends Widget {
      displayName = "Play / Pause";
      get dom() {
        return renderComponent(<PlayPause state={this.context.runtimeState} />);
      }
    },
    next: class extends Widget {
      displayName = "Next";
      get dom() {
        return renderComponent(<Next state={this.context.runtimeState} />);
      }
    },
    previous: class extends Widget {
      displayName = "Previous";
      get dom() {
        return renderComponent(<Previous state={this.context.runtimeState} />);
      }
    },
    mute: class extends Widget {
      displayName = "Mute";
      get dom() {
        return renderComponent(<Mute state={this.context.runtimeState} />);
      }
    },
    volumeUp: class extends Widget {
      displayName = "Volume up";
      get dom() {
        return renderComponent(<VolumeUp state={this.context.runtimeState} />);
      }
    },
    volumeDown: class extends Widget {
      displayName = "Volume down";
      get dom() {
        return renderComponent(<VolumeDown state={this.context.runtimeState} />);
      }
    },
  };
}
