import { createServer } from 'node:http';
import path, { dirname } from 'node:path';
import express from 'express';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { connectApp } from './app.js';

const app = express();
const server = createServer(app);
const io = new Server(server, { serveClient: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const client = path.join(__dirname, "../../client/dist");

app.use(express.static(client));

app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(client, "index.html"));
});

io.on('connection', (socket) => {
    connectApp(socket);
});

server.listen(3000, '0.0.0.0', () => {
    console.log('server running at http://localhost:3000');
});