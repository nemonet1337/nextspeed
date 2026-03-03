import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { SerialPort } from 'serialport';

/** 現在の接続インスタンス */
let activePort: SerialPort | null = null;

/** データ受信時のコールバック (BrowserWindow に送信) */
let onDataCallback: ((data: Buffer) => void) | null = null;

/**
 * シリアルポート IPC ハンドラを登録する
 * @param sendToRenderer BrowserWindow.webContents.send のラッパー
 */
export function registerSerialHandlers(
    sendToRenderer: (channel: string, ...args: unknown[]) => void
) {
    /** 利用可能ポート一覧 */
    ipcMain.handle('serial:list', async () => {
        const ports = await SerialPort.list();
        return ports.map((p) => ({
            path: p.path,
            manufacturer: p.manufacturer || '',
            vendorId: p.vendorId || '',
            productId: p.productId || '',
        }));
    });

    /** ポート接続 */
    ipcMain.handle(
        'serial:connect',
        async (_event: IpcMainInvokeEvent, portPath: string, baudRate: number) => {
            if (activePort?.isOpen) {
                await closePort();
            }

            return new Promise<boolean>((resolve, reject) => {
                activePort = new SerialPort({ path: portPath, baudRate }, (err) => {
                    if (err) {
                        reject(err.message);
                        return;
                    }
                    // データ受信イベント
                    activePort!.on('data', (chunk: Buffer) => {
                        sendToRenderer('serial:data', Array.from(chunk));
                    });

                    activePort!.on('close', () => {
                        sendToRenderer('serial:status', 'disconnected');
                        activePort = null;
                    });

                    activePort!.on('error', (e) => {
                        sendToRenderer('serial:error', e.message);
                    });

                    sendToRenderer('serial:status', 'connected');
                    resolve(true);
                });
            });
        }
    );

    /** データ送信 */
    ipcMain.handle(
        'serial:write',
        async (_event: IpcMainInvokeEvent, data: number[]) => {
            if (!activePort?.isOpen) {
                throw new Error('ポートが開いていません');
            }
            return new Promise<boolean>((resolve, reject) => {
                activePort!.write(Buffer.from(data), (err) => {
                    if (err) reject(err.message);
                    else resolve(true);
                });
            });
        }
    );

    /** 切断 */
    ipcMain.handle('serial:disconnect', async () => {
        await closePort();
        return true;
    });
}

async function closePort(): Promise<void> {
    return new Promise((resolve) => {
        if (activePort?.isOpen) {
            activePort.close(() => {
                activePort = null;
                resolve();
            });
        } else {
            activePort = null;
            resolve();
        }
    });
}
