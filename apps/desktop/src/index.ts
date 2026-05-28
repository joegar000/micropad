import { createServer } from 'node:http';
import path, { dirname } from 'node:path';
import express from 'express';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { connectApp } from './bridge/socket-handlers.js';
import Electron from 'electron';
import type { BrowserWindow } from 'electron';
import { getLocalNetworkIdentity } from './network/local-address.js';
import { Bonjour, type Service } from 'bonjour-service';
import { openQrPairingWindow } from './desktop/qr-window.js';
import { FileLayoutStore } from './storage/file-layout-store.js';

const { app: electron } = Electron;

(async () => {
    const app = express();
    const server = createServer(app);
    const layoutStore = new FileLayoutStore();
    const bonjour = new Bonjour();
    let mdnsService: Service | undefined;
    let mainWindow: BrowserWindow | undefined;
    const io = new Server(server, {
        serveClient: false,
        cors: {
            origin: '*'
        }
    });
    const network = await getLocalNetworkIdentity();
    console.log('local network identity:', network);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const client = path.join(__dirname, "../../../client/dist");

    app.use(express.static(client));

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(client, "index.html"));
    });

    io.on('connection', (socket) => {
        console.log('new connection')
        void connectApp(socket, layoutStore).catch(error => {
            console.error('failed to connect app', error);
            socket.disconnect(true);
        });
    });

    io.listen(server);

    const frontendBase = `http://${network.mdnsHost}:3000`;
    const frontendUrl = new URL(frontendBase);
    const fallbackUrl = new URL(`http://${network.localIp}:3000`);
    const serverPublic = path.join(__dirname, "../../public");

    async function openMainWindow() {
        if (mainWindow) {
            return;
        }
        mainWindow = await openQrPairingWindow({
            frontendUrl,
            publicDir: serverPublic
        });
    }

    server.listen(3000, '0.0.0.0', () => {
        console.log(`server running at http://localhost:3000`);
        console.log(`mDNS URL: ${frontendUrl.toString()}`);
        console.log(`fallback URL: ${fallbackUrl.toString()}`);
        mdnsService = bonjour.publish({
            name: 'Micropad',
            type: 'micropad',
            protocol: 'tcp',
            host: network.mdnsHost,
            port: 3000,
            txt: {
                path: '/',
                protocol: 'http',
                url: frontendUrl.toString(),
                fallbackUrl: fallbackUrl.toString(),
                version: '1'
            }
        });

        if (electron.isReady()) {
            void openMainWindow();
            return;
        }
        void electron.whenReady().then(openMainWindow);
    });

    const cleanup = (config: { electron?: boolean } = {}) => {
        return new Promise<void>(resolve => {
            console.log('shutting down...');
            mdnsService?.stop?.();
            bonjour.unpublishAll(() => bonjour.destroy());
            server.close();
            !config.electron && electron.quit();
            resolve();
        });
    }

    electron.on('before-quit', async () => {
        await cleanup({ electron: true });
        process.exit(0);
    });
    

    // Handle Ctrl+C (Terminal)
    process.on('SIGINT', () => {
        void cleanup();
    });

    // Handle system termination signals
    process.on('SIGTERM', () => {
        void cleanup();
    });
    
    process.on('uncaughtException', async (error) => {
        // Try to unpublish before exiting
        await cleanup();
        process.exit(1);
    });
})();
