'use client';

import { ConnectionStatus } from '@/lib/types/ecu';

type StatusCallback = (status: ConnectionStatus) => void;
type DataCallback = (data: Uint8Array) => void;
type ErrorCallback = (error: string) => void;

/**
 * シリアルマネージャ
 * Electron IPC 経由で Node.js serialport パッケージを使用してシリアル通信を行う。
 * Electron 外ではフォールバックとして Web Serial API にも対応。
 */
export class SerialManager {
    private statusCallback: StatusCallback | null = null;
    private dataCallback: DataCallback | null = null;
    private errorCallback: ErrorCallback | null = null;
    private connected: boolean = false;

    /** Electron 環境かどうかの判定 */
    private get isElectron(): boolean {
        return typeof window !== 'undefined' && !!window.electronAPI;
    }

    /** ステータスコールバック登録 */
    onStatus(callback: StatusCallback) {
        this.statusCallback = callback;
    }

    /** データ受信コールバック登録 */
    onData(callback: DataCallback) {
        this.dataCallback = callback;
    }

    /** エラーコールバック登録 */
    onError(callback: ErrorCallback) {
        this.errorCallback = callback;
    }

    /** 利用可能なシリアルポート一覧を取得 */
    async listPorts() {
        if (!this.isElectron) {
            throw new Error('Electron 環境でのみシリアルポート一覧を取得できます');
        }
        return window.electronAPI!.serial.list();
    }

    /** シリアルポートに接続 */
    async connect(portPath: string, baudRate: number = 115200): Promise<void> {
        if (!this.isElectron) {
            throw new Error('Electron 環境でのみシリアル接続できます');
        }

        this.statusCallback?.('connecting');

        try {
            // IPC イベントリスナー設定
            window.electronAPI!.serial.onData((data: number[]) => {
                this.dataCallback?.(new Uint8Array(data));
            });

            window.electronAPI!.serial.onStatus((status: string) => {
                if (status === 'connected') {
                    this.connected = true;
                    this.statusCallback?.('connected');
                } else if (status === 'disconnected') {
                    this.connected = false;
                    this.statusCallback?.('disconnected');
                }
            });

            window.electronAPI!.serial.onError((error: string) => {
                this.errorCallback?.(error);
            });

            await window.electronAPI!.serial.connect(portPath, baudRate);
        } catch (error) {
            this.statusCallback?.('error');
            this.errorCallback?.(error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    /** データ書き込み */
    async write(data: Uint8Array): Promise<void> {
        if (!this.isElectron || !this.connected) {
            throw new Error('シリアルポートが接続されていません');
        }
        await window.electronAPI!.serial.write(Array.from(data));
    }

    /** 切断 */
    async disconnect(): Promise<void> {
        if (!this.isElectron) return;

        window.electronAPI!.serial.removeAllListeners();
        await window.electronAPI!.serial.disconnect();
        this.connected = false;
        this.statusCallback?.('disconnected');
    }
}
