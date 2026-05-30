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
        let lastVolume: number | undefined;

        const publishVolume = async () => {
            const value = await getVolume();
            if (value === lastVolume) {
                return;
            }

            lastVolume = value;
            masterVolume.emitChange(api.ws, { value });
        };

        masterVolume.onChange(api.ws, (data, context) => {
            void (async () => {
                await setVolume(data.value);
                const value = await getVolume();
                lastVolume = value;
                masterVolume.emitChange(api.ws, { value }, context);
            })().catch(error => {
                console.error('Failed to set volume:', error);
                masterVolume.emitChange(api.ws, { value: data.value }, context);
            });
        });

        if (process.env.MICROPAD_DISABLE_SYSTEM_SYNC !== '1') {
            void publishVolume().catch(error => {
                console.error('Failed to publish initial volume:', error);
            });
            const interval = setInterval(() => {
                void publishVolume().catch(error => {
                    console.error('Failed to sync volume:', error);
                });
            }, 1000);
            interval.unref();
            api.ws.once('disconnect', () => clearInterval(interval));
        }

        packet.addWidgets(masterVolume);
    });
}
