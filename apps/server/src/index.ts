import { createServer } from 'node:http';
import path, { dirname } from 'node:path';
import express from 'express';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { connectApp } from './app.js';
import { app as electron, BrowserWindow } from 'electron';
import qrcode from 'qrcode';
import { getAddress } from './ip.js';

(async () => {
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
        serveClient: false,
        cors: {
            origin: '*'
        }
    });
    const address = await getAddress();
    console.log('discovered address:', address);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const client = path.join(__dirname, "../../../client/dist");

    app.use(express.static(client));

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(client, "index.html"));
    });

    io.on('connection', (socket) => {
        console.log('new connection')
        connectApp(socket);
    });

    io.listen(server);

    server.listen(3000, '0.0.0.0', () => {
        console.log('server running at http://localhost:3000');
    });

    let mainWindow;

    const frontendBase = `http://${address}:3000`;
    const frontendUrl = new URL(frontendBase);
    const qrCodeDataURL = await qrcode.toDataURL(frontendUrl.toString(), {
        type: 'image/png',
        errorCorrectionLevel: 'H',
        margin: 1
    });

    electron.whenReady().then(() => {
        mainWindow = new BrowserWindow({
            width: 400,
            height: 400,
            title: 'Micropad QR Code',
            resizable: false,
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true
        });

        mainWindow.loadURL('file://' + path.join(__dirname, `../../public/index.html?qr=${encodeURIComponent(qrCodeDataURL)}&ip=${encodeURIComponent(frontendUrl.toString())}`));
    });

    const cleanup = (config: { electron?: boolean } = {}) => {
        return new Promise<void>(resolve => {
            console.log('shutting down...');
            !config.electron && electron.quit();
            resolve();
        });
    }

    electron.on('before-quit', async () => {
        await cleanup({ electron: true });
        process.exit(0);
    });
    

    // Handle Ctrl+C (Terminal)
    process.on('SIGINT', cleanup);

    // Handle system termination signals
    process.on('SIGTERM', cleanup);
    
    process.on('uncaughtException', async (error) => {
        // Try to unpublish before exiting
        await cleanup();
        process.exit(1);
    });
})();