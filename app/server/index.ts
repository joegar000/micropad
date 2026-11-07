import express, { type Express } from 'express';
import path from 'node:path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { plugins } from './plugins/loader.ts';
import { sync, serverSignalGenerator } from 'micropad-sdk/server';
import * as Y from 'yjs';
import { DB } from './db/db.ts';
import { mobxify, bindMap } from 'micropad-sdk/shared';


const app: Express = express();

app.use(express.static(path.join(import.meta.dirname, '..', 'client', 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer);

const doc = sync(io, new Y.Doc());

const getSignal = serverSignalGenerator(io);

const db = DB.getSynced(doc);

app.get('/plugins', (req, res) => {
  const ids = plugins.map(p => p.server.manifest.id);
  res.status(200).json(ids);
});

for (const plugin of plugins) {
  plugin.server.init({
    preservedState: db.pluginState,
    runtimeState: mobxify(bindMap(doc.getMap(plugin.server.manifest.id))),
    signal: getSignal(plugin.server.manifest.id)
  });
  app.get(`/plugins/${plugin.server.manifest.id}`, (req, res) => {
    console.info(`Sending client plugins for id ${plugin.server.manifest.id}...`, plugin.client);
    res.status(200)
      .setHeader('Content-Type', 'application/javascript')
      .sendFile(plugin.client);
  });
}

httpServer.listen(3000);

console.info("Running on port 3000");
