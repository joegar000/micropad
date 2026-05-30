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
        for (const control of controls) {
            const button = ButtonViewModel.fromConfig({
                pluginName: 'media',
                widgetName: control.widgetName,
                title: control.title,
                text: control.text,
                icon: mediaIcons[control.icon],
                canToggle: control.action === 'playPause'
            });

            button.onClick(api.ws, (_data, context) => {
                void (async () => {
                    await runMediaAction(control.action);
                    if (control.action === 'playPause') {
                        await new Promise(resolve => setTimeout(resolve, 200));
                        const state = await getMediaPlaybackState();
                        button.emitActiveChange(api.ws, {
                            isActive: state === 'paused' || state === 'stopped'
                        }, context);
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
    });
}
