import path from "node:path";
import qrcode from "qrcode";
import Electron from "electron";

const { BrowserWindow } = Electron;

export async function openQrPairingWindow(options: {
    frontendUrl: URL;
    publicDir: string;
}) {
    const qrCodeDataURL = await qrcode.toDataURL(options.frontendUrl.toString(), {
        type: 'image/png',
        errorCorrectionLevel: 'H',
        margin: 1
    });

    const window = new BrowserWindow({
        width: 400,
        height: 400,
        title: 'Micropad QR Code',
        resizable: false,
        minimizable: false,
        maximizable: false
    });

    const qrUrl = path.join(
        options.publicDir,
        `index.html?qr=${encodeURIComponent(qrCodeDataURL)}&ip=${encodeURIComponent(options.frontendUrl.toString())}`
    );
    await window.loadURL('file://' + qrUrl);
    return window;
}
