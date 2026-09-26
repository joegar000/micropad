import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppView from '../view/app';
import AppModel, { AppModelContext } from '../model/app.tsx';
import { io } from 'socket.io-client';
import { type ClientPlugin } from "micropad-sdk/client";
import createClientPluginContext from '../plugins/context.ts';
import { invariant } from 'es-toolkit';

document.addEventListener('DOMContentLoaded', async () => {
  console.log(import.meta.url);
  const socket = io({
    transports: ['websocket']
  });

  const pluginIds: string[] = await (await fetch('/plugins')).json();
  const plugins = await Promise.all(pluginIds.map(async id => {
    const pluginModule = await import(`/plugins/${id}`);
    invariant(typeof pluginModule.default === "function", "Client entrypoint must have a default plugin class export");
    const Plugin = pluginModule.default as new (...p: ConstructorParameters<typeof ClientPlugin>) => ClientPlugin;
    return new Plugin(await createClientPluginContext(socket, id));
  }));

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppModelContext value={new AppModel({ socket, plugins })}>
        <AppView />
      </AppModelContext>
    </StrictMode>
  );
});
