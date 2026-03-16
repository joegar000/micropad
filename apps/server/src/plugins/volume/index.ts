import { setVolume, getVolume } from "easy-volume";
import { PluginAPI } from "../../plugin-manager.js";

export default function volume(api: PluginAPI) {
    api.createPlugin('volume', packet => {
        packet.registerWidget('masterVolume', {
            spec: {
                baseType: 'slider',
                endpoint: '/#',
                title: 'slidin\' around'
            },
            on: (eventName, data: { value: number }) => {
                setVolume(data.value);
            }
        });
    });
}
