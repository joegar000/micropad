import express, { type Express } from 'express';
import path from 'node:path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { plugins } from './plugins/loader.ts';
import { syncLayout } from './layout.ts';
import { sync } from 'micropad-sdk/server';
import * as Y from 'yjs';
import { DB } from './db/db.ts';


const app: Express = express();

app.router

app.use(express.static(path.join(import.meta.dirname, '..', 'client', 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer);

const doc = sync(io, new Y.Doc());

const db = DB.getSynced(doc);

io.on("connection", (socket) => {
  console.info("Websockets connected");
  syncLayout(socket);
  // loadPlugins(socket);
});

app.get('/plugins', (req, res) => {
  const ids = plugins.map(p => p.server.manifest.id);
  res.status(200).json(ids);
});

for (const plugin of plugins) {
  app.get(`/plugins/${plugin.server.manifest.id}`, (req, res) => {
    console.info(`Sending client plugins for ${plugin.server.manifest.name}...`, plugin.client);
    res.status(200)
      .setHeader('Content-Type', 'application/javascript')
      .sendFile(plugin.client);
  });
}

httpServer.listen(3000);

console.info("Running on port 3000");
