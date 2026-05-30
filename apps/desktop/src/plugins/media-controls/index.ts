import { ButtonViewModel } from "micropad-widgets";
import { mediaIcons } from "../icon-specs.js";
import { getMediaPlaybackState, type MediaAction, runMediaAction } from "../system-actions.js";
import { PluginAPI } from "../registry.js";

const controls: Array<{
    widgetName: string;
    title: string;
    text: string;
    action: MediaAction;
    icon: keyof typeof mediaIcons;
}> = [
    {
        widgetName: 'playPause',
        title: 'Play / Pause',
        text: 'Play / Pause',
        action: 'playPause',
        icon: 'playPause'
    },
    {
        widgetName: 'previous',
        title: 'Previous',
        text: 'Previous',
        action: 'previous',
        icon: 'previous'
    },
    {
        widgetName: 'next',
        title: 'Next',
        text: 'Next',
        action: 'next',
        icon: 'next'
    }
];

export default function mediaControls(api: PluginAPI) {
    api.createPlugin('media', packet => {
        let playPauseButton: ButtonViewModel | undefined;
        let lastPlayPauseActive: boolean | undefined;

        const publishPlaybackState = async () => {
            if (!playPauseButton) {
                return;
            }

            const state = await getMediaPlaybackState();
            const isActive = state === 'paused' || state === 'stopped';
            if (isActive === lastPlayPauseActive) {
                return;
            }

            lastPlayPauseActive = isActive;
            playPauseButton.emitActiveChange(api.ws, { isActive });
        };

        for (const control of controls) {
            const button = ButtonViewModel.fromConfig({
                pluginName: 'media',
                widgetName: control.widgetName,
                title: control.title,
                text: control.text,
                icon: mediaIcons[control.icon],
                canToggle: control.action === 'playPause'
            });

            if (control.action === 'playPause') {
                playPauseButton = button;
            }

            button.onClick(api.ws, (_data, context) => {
                void (async () => {
                    await runMediaAction(control.action);
                    if (control.action === 'playPause') {
                        await new Promise(resolve => setTimeout(resolve, 200));
                        const state = await getMediaPlaybackState();
                        const isActive = state === 'paused' || state === 'stopped';
                        lastPlayPauseActive = isActive;
                        button.emitActiveChange(api.ws, { isActive }, context);
                    } else {
                        button.emitConfirm(api.ws, { ok: true }, context);
                    }
                })().catch(error => {
                    console.error(`Failed to run media action "${control.action}":`, error);
                    if (control.action === 'playPause') {
                        button.emitActiveChange(api.ws, { isActive: false }, context);
                    } else {
                        button.emitConfirm(api.ws, { ok: false }, context);
                    }
                });
            });

            packet.addWidgets(button);
        }

        if (process.env.MICROPAD_DISABLE_SYSTEM_SYNC !== '1') {
            void publishPlaybackState().catch(error => {
                console.error('Failed to publish initial media state:', error);
            });
            const interval = setInterval(() => {
                void publishPlaybackState().catch(error => {
                    console.error('Failed to sync media state:', error);
                });
            }, 1000);
            interval.unref();
            api.ws.once('disconnect', () => clearInterval(interval));
        }
    });
}
