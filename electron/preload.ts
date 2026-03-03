import { contextBridge, ipcRenderer } from 'electron';

export interface SerialPortInfo {
    path: string;
    manufacturer: string;
    vendorId: string;
    productId: string;
}

contextBridge.exposeInMainWorld('electronAPI', {
    serial: {
        /** 利用可能なシリアルポート一覧を取得 */
        list: (): Promise<SerialPortInfo[]> => ipcRenderer.invoke('serial:list'),

        /** シリアルポートに接続 */
        connect: (portPath: string, baudRate: number): Promise<boolean> =>
            ipcRenderer.invoke('serial:connect', portPath, baudRate),

        /** データを送信 */
        write: (data: number[]): Promise<boolean> =>
            ipcRenderer.invoke('serial:write', data),

        /** 切断 */
        disconnect: (): Promise<boolean> => ipcRenderer.invoke('serial:disconnect'),

        /** データ受信リスナー */
        onData: (callback: (data: number[]) => void) => {
            ipcRenderer.on('serial:data', (_event, data) => callback(data));
        },

        /** ステータス変更リスナー */
        onStatus: (callback: (status: string) => void) => {
            ipcRenderer.on('serial:status', (_event, status) => callback(status));
        },

        /** エラーリスナー */
        onError: (callback: (error: string) => void) => {
            ipcRenderer.on('serial:error', (_event, error) => callback(error));
        },

        /** 全リスナーを削除 */
        removeAllListeners: () => {
            ipcRenderer.removeAllListeners('serial:data');
            ipcRenderer.removeAllListeners('serial:status');
            ipcRenderer.removeAllListeners('serial:error');
        },
    },

    /** Electronかどうかの判定 */
    isElectron: true,
});
