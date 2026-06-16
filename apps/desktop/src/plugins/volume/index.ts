import { getVolume, setVolume } from "easy-volume";
import { PluginAPI } from "../registry.js";
import { SliderViewModel } from "micropad-widgets";

export default function volume(api: PluginAPI) {
    api.createPlugin('volume', packet => {
        const masterVolume = SliderViewModel.fromConfig({
            pluginName: 'volume',
            title: 'Volume',
            widgetName: 'masterVolume',
        });
        masterVolume.onChange(api.ws, async (data, context) => {
            try {
                await setVolume(data.value);
                masterVolume.emitChange(api.ws, { value: data.value }, context);
            } catch (e) {
                console.error('Failed to set volume:', e);
                masterVolume.emitChange(api.ws, { value: await getVolume() }, context);
            }
        });

        packet.addWidgets(masterVolume);
    });
}
