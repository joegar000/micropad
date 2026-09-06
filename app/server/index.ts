import express, { type Express } from 'express';
import path from 'node:path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app: Express = express();

app.use(express.static(path.join(import.meta.dirname, 'client', 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.info("Websockets connected");
});

httpServer.listen(3000);

console.info("Running on port 3000");
