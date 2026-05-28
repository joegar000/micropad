import { setVolume } from "easy-volume";
import { PluginAPI } from "../registry.js";
import { SliderViewModel } from "micropad-widgets";

export default function volume(api: PluginAPI) {
    api.createPlugin('volume', packet => {
        const masterVolume = SliderViewModel.fromConfig({
            pluginName: 'volume',
            title: 'Volume',
            widgetName: 'masterVolume',
        });
        masterVolume.onChange(api.ws, data => {
            setVolume(data.value);
        });

        packet.addWidgets(masterVolume);
    });
}
