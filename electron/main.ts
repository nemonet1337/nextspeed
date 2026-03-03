import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { registerSerialHandlers } from './ipc/serial-handler';
import { registerFileHandlers } from './ipc/file-handler';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#0a0a14',
        show: false,
    });

    // IPC ハンドラ登録
    registerSerialHandlers(
        (channel: string, ...args: unknown[]) => {
            mainWindow?.webContents.send(channel, ...args);
        }
    );
    registerFileHandlers();

    const startUrl = isDev
        ? 'http://localhost:3000'
        : url.format({
            pathname: path.join(__dirname, '../out/index.html'),
            protocol: 'file:',
            slashes: true,
        });

    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
