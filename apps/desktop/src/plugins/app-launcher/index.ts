import { ButtonViewModel, type WidgetModalResponse } from "micropad-widgets";
import { PluginAPI } from "../registry.js";
import { initialIcon } from "../icon-specs.js";
import { launchApp, listInstalledApps, type InstalledApp } from "./list-apps.js";

type AppLauncherClickPayload = {
    config?: {
        app?: InstalledApp;
    };
};

export default function appLauncher(api: PluginAPI) {
    api.createPlugin('appLauncher', packet => {
        const button = ButtonViewModel.fromConfig({
            pluginName: 'appLauncher',
            widgetName: 'launcher',
            title: 'App Launcher',
            text: 'Set app',
            icon: initialIcon('Ap', '#2563eb'),
            menuItems: {
                setApp: {
                    title: 'Set app',
                    action: {
                        type: 'modal',
                        title: 'Set app',
                        requestAction: 'listApps',
                        configKey: 'app',
                        searchPlaceholder: 'Search apps...'
                    }
                }
            },
            primaryAction: {
                requires: [
                    {
                        configKey: 'app',
                        fallbackActionId: 'setApp'
                    }
                ]
            }
        });

        button.onClick(api.ws, (data, context) => {
            const payload = data as AppLauncherClickPayload;
            const app = payload.config?.app;
            if (!app?.target) {
                button.emitConfirm(api.ws, { ok: false }, context);
                return;
            }

            try {
                launchApp(app.target);
                button.emitConfirm(api.ws, { ok: true }, context);
            } catch (error) {
                console.error(`Failed to launch app "${app.title}":`, error);
                button.emitConfirm(api.ws, { ok: false }, context);
            }
        });

        button.menuItems.setApp.on<Record<string, unknown>, WidgetModalResponse>(api.ws, async () => ({
            items: (await listInstalledApps()).map(app => ({
                id: app.target,
                title: app.title,
                subtitle: app.target,
                value: app,
                specPatch: {
                    text: app.title
                }
            }))
        }));

        packet.addWidgets(button);
    });
}
