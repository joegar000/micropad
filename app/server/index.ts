import express, { type Express } from 'express';
import path from 'node:path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { loadPlugins, pluginFactories } from './plugins/loader.ts';

const app: Express = express();

app.use(express.static(path.join(import.meta.dirname, '..', 'client', 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.info("Websockets connected");
  loadPlugins(socket);
});

for (const f of pluginFactories) {
  app.get(`/plugins/${f.manifest.id}`, (req, res) => {
    console.info(`Sending client plugins for ${f.manifest.name}...`, f.clientPluginUrl);
    res.status(200)
      .setHeader('Content-Type', 'application/javascript')
      .sendFile(f.clientPluginUrl);
  });
}

app.get('/plugins', (req, res) => {
  const ids = pluginFactories.map(f => f.manifest.id);
  res.status(200).json(ids);
});

httpServer.listen(3000);

console.info("Running on port 3000");
