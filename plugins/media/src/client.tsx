import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ClientPlugin, ClientSignal, Widget } from "micropad-sdk/client";
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
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";

type MediaProps = { context: MediaState<ClientSignal> };

const VolumeSlider = observer(({ context }: MediaProps) => {
  const volume = context.runtimeState.volume ?? 0;

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
      onChange={(event) => {
        runInAction(() => {
          context.runtimeState.volume = clamp(event.currentTarget.valueAsNumber, 0, 100);
        });
      }}
    />
  );
});

const PlayPause = observer(({ context }: MediaProps) => {
  const playing = context.runtimeState.playing ?? false;

  return (
    <Button
      type="button"
      size="icon-lg"
      aria-label={playing ? "Pause" : "Play"}
      aria-pressed={playing}
      title={playing ? "Pause" : "Play"}
      onClick={() => {
        runInAction(() => {
          context.runtimeState.playing = !playing;
        });
      }}
    >
      <HugeiconsIcon
        icon={PlayIcon}
        altIcon={PauseIcon}
        showAlt={playing}
        strokeWidth={2}
      />
    </Button >
  );
});

const Mute = observer(({ context }: MediaProps) => {
  const muted = context.runtimeState.muted ?? false;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label={muted ? "Unmute" : "Mute"}
      aria-pressed={muted}
      title={muted ? "Unmute" : "Mute"}
      onClick={() => {
        runInAction(() => {
          context.runtimeState.muted = !muted;
        });
      }}
    >
      <HugeiconsIcon
        icon={VolumeHighIcon}
        altIcon={VolumeMute01Icon}
        showAlt={muted}
        strokeWidth={2}
      />
    </Button>
  );
});

const Next = observer(({ context }: MediaProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Next"
      title="Next"
      onClick={() => {
        context.signal.send('next');
      }}
    >
      <HugeiconsIcon icon={NextIcon} strokeWidth={2} />
    </Button >
  );
});

const Previous = observer(({ context }: MediaProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Previous"
      title="Previous"
      onClick={() => {
        context.signal.send('previous');
      }}
    >
      <HugeiconsIcon icon={PreviousIcon} strokeWidth={2} />
    </Button>
  );
});

const VolumeUp = observer(({ context }: MediaProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Volume up"
      title="Volume up"
      onClick={() => {
        context.signal.send('volumeUp', 5);
      }}
    >
      <HugeiconsIcon icon={VolumeUpIcon} strokeWidth={2} />
    </Button>
  );
});

const VolumeDown = observer(({ context }: MediaProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label="Volume down"
      title="Volume down"
      onClick={() => {
        context.signal.send('volumeDown', 5);
      }}
    >
      <HugeiconsIcon icon={VolumeMinusIcon} strokeWidth={2} />
    </Button>
  );
});

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
        return renderComponent(<VolumeSlider context={this.context} />);
      }
    },
    playPause: class extends Widget {
      displayName = "Play / Pause";
      get dom() {
        return renderComponent(<PlayPause context={this.context} />);
      }
    },
    next: class extends Widget {
      displayName = "Next";
      get dom() {
        return renderComponent(<Next context={this.context} />);
      }
    },
    previous: class extends Widget {
      displayName = "Previous";
      get dom() {
        return renderComponent(<Previous context={this.context} />);
      }
    },
    mute: class extends Widget {
      displayName = "Mute";
      get dom() {
        return renderComponent(<Mute context={this.context} />);
      }
    },
    volumeUp: class extends Widget {
      displayName = "Volume up";
      get dom() {
        return renderComponent(<VolumeUp context={this.context} />);
      }
    },
    volumeDown: class extends Widget {
      displayName = "Volume down";
      get dom() {
        return renderComponent(<VolumeDown context={this.context} />);
      }
    },
  };
}
