/**
 * Electron IPC API のグローバル型宣言
 */

export interface SerialPortInfo {
    path: string;
    manufacturer: string;
    vendorId: string;
    productId: string;
}

export interface ElectronSerialAPI {
    list: () => Promise<SerialPortInfo[]>;
    connect: (portPath: string, baudRate: number) => Promise<boolean>;
    write: (data: number[]) => Promise<boolean>;
    disconnect: () => Promise<boolean>;
    onData: (callback: (data: number[]) => void) => void;
    onStatus: (callback: (status: string) => void) => void;
    onError: (callback: (error: string) => void) => void;
    removeAllListeners: () => void;
}

export interface ElectronFileAPI {
    save: (data: string, defaultPath?: string) => Promise<boolean>;
    open: () => Promise<string | null>;
}

export interface ElectronAPI {
    serial: ElectronSerialAPI;
    file: ElectronFileAPI;
    isElectron: boolean;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
