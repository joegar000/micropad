import { ButtonViewModel } from "micropad-widgets";
import { mediaIcons } from "../icon-specs.js";
import { PluginAPI } from "../registry.js";
import robot from "robotjs";

export default function mediaControls(api: PluginAPI) {
    api.createPlugin('media', packet => {
        const pauseButton = ButtonViewModel.fromConfig({
            pluginName: 'media',
            widgetName: 'playPause',
            title: 'Play / Pause',
            text: 'Play / Pause',
            icon: mediaIcons['playPause']
        });
        pauseButton.onClick(api.ws, (_data, context) => {
            robot.keyTap("audio_pause");
            pauseButton.emitConfirm(api.ws, { ok: true }, context);
        });

        const prevButton = ButtonViewModel.fromConfig({
            pluginName: 'media',
            widgetName: 'previous',
            title: 'Previous',
            text: 'Previous',
            icon: mediaIcons['previous']
        });
        prevButton.onClick(api.ws, (_data, context) => {
            robot.keyTap("audio_prev");
            prevButton.emitConfirm(api.ws, { ok: true }, context);
        });

        const nextButton = ButtonViewModel.fromConfig({
            pluginName: 'media',
            widgetName: 'next',
            title: 'Next',
            text: 'Next',
            icon: mediaIcons['next']
        });
        nextButton.onClick(api.ws, (_data, context) => {
            robot.keyTap("audio_next");
            nextButton.emitConfirm(api.ws, { ok: true }, context);
        })

        packet.addWidgets(pauseButton, prevButton, nextButton);
    });
}
