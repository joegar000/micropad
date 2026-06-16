import { PluginAPI } from "../registry.js";
import { SliderViewModel } from "micropad-widgets";
import loudness from "loudness";

export default function volume(api: PluginAPI) {
    api.createPlugin('volume', packet => {
        let volume: number;
        const masterVolume = SliderViewModel.fromConfig({
            pluginName: 'volume',
            title: 'Volume',
            widgetName: 'masterVolume',
        });
        masterVolume.onChange(api.ws, async (data, context) => {
            if (volume === data.value) return;
            try {
                await loudness.setVolume(data.value);
                volume = data.value;
                masterVolume.emitChange(api.ws, { value: data.value }, context);
            } catch (e) {
                console.error('Failed to set volume:', e);
                masterVolume.emitChange(api.ws, { value: volume }, context);
            }
        });

        packet.addWidgets(masterVolume);
        
        const keepVolumeSynced = async () => {
            const newV = await loudness.getVolume();
            if (newV !== volume) {
                volume = newV;
                masterVolume.emitChange(api.ws, { value: volume });
            }
            setTimeout(keepVolumeSynced, 200);
        }
        keepVolumeSynced();
    });
}
