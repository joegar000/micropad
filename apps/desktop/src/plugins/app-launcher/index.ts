import { createWidgetEvent, SocketEvent, WidgetEventSchema } from "micropad-protocol";
import { ButtonViewModel } from "micropad-widgets";
import { PluginAPI } from "../registry.js";
import { initialIcon } from "../icon-specs.js";
import { launchApp, listInstalledApps, type InstalledApp } from "../system-actions.js";

type AppLauncherClickPayload = {
    app?: InstalledApp;
};

export default function appLauncher(api: PluginAPI) {
    api.createPlugin('appLauncher', packet => {
        const button = ButtonViewModel.fromConfig({
            pluginName: 'appLauncher',
            widgetName: 'launcher',
            title: 'App Launcher',
            text: 'Set app',
            icon: initialIcon('Ap', '#2563eb'),
            menuItems: [
                {
                    id: 'set-app',
                    title: 'Set app',
                    action: {
                        type: 'modal',
                        title: 'Set app',
                        requestAction: 'listApps',
                        responseAction: 'apps',
                        configKey: 'app',
                        searchPlaceholder: 'Search apps...'
                    }
                }
            ]
        });

        button.onClick(api.ws, (data, context) => {
            const payload = data as AppLauncherClickPayload;
            if (!payload.app?.target) {
                button.emitConfirm(api.ws, { ok: false }, context);
                return;
            }

            try {
                launchApp(payload.app.target);
                button.emitConfirm(api.ws, { ok: true }, context);
            } catch (error) {
                console.error(`Failed to launch app "${payload.app.title}":`, error);
                button.emitConfirm(api.ws, { ok: false }, context);
            }
        });

        api.ws.on(SocketEvent.WidgetEvent, async data => {
            const event = WidgetEventSchema.safeParse(data);
            if (!event.success || event.data.widgetType !== button.spec.type || event.data.action !== 'listApps') {
                return;
            }

            api.ws.emit(SocketEvent.WidgetEvent, createWidgetEvent({
                widgetType: button.spec.type,
                action: 'apps',
                payload: {
                    items: (await listInstalledApps()).map(app => ({
                        id: app.target,
                        title: app.title,
                        subtitle: app.target,
                        value: app,
                        specPatch: {
                            text: app.title
                        }
                    }))
                }
            }));
        });

        packet.addWidgets(button);
    });
}
