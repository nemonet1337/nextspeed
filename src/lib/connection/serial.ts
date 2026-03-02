/**
 * Web Serial API を使ったシリアル通信マネージャ
 *
 * USB / シリアルポート経由で ECU と接続する。
 * ブラウザの Web Serial API を使用 (Chrome 89+ / Edge 89+)
 */
import type { ConnectionStatus } from '../types/ecu';

export type SerialEventType = 'status' | 'data' | 'error';
export type SerialEventHandler = (type: SerialEventType, payload: unknown) => void;

export class SerialManager {
    private port: SerialPort | null = null;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
    private readLoop: boolean = false;
    private listeners: SerialEventHandler[] = [];

    private _status: ConnectionStatus = 'disconnected';

    get status(): ConnectionStatus {
        return this._status;
    }

    /** ブラウザが Web Serial API をサポートしているか */
    static isSupported(): boolean {
        return typeof navigator !== 'undefined' && 'serial' in navigator;
    }

    /** リスナーを登録 */
    on(handler: SerialEventHandler) {
        this.listeners.push(handler);
    }

    off(handler: SerialEventHandler) {
        this.listeners = this.listeners.filter((h) => h !== handler);
    }

    private emit(type: SerialEventType, payload: unknown) {
        this.listeners.forEach((h) => h(type, payload));
    }

    private setStatus(status: ConnectionStatus) {
        this._status = status;
        this.emit('status', status);
    }

    /**
     * シリアルポートを選択して接続
     */
    async connect(baudRate: number = 115200): Promise<void> {
        if (!SerialManager.isSupported()) {
            throw new Error('Web Serial API はこのブラウザではサポートされていません');
        }

        try {
            this.setStatus('connecting');

            // ユーザーにポート選択ダイアログを表示
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate });

            // Reader / Writer のセットアップ
            if (this.port.readable) {
                this.reader = this.port.readable.getReader();
            }
            if (this.port.writable) {
                this.writer = this.port.writable.getWriter();
            }

            this.setStatus('connected');

            // 受信ループ開始
            this.startReadLoop();
        } catch (err) {
            this.setStatus('error');
            this.emit('error', err);
            throw err;
        }
    }

    /** 切断 */
    async disconnect(): Promise<void> {
        this.readLoop = false;

        try {
            if (this.reader) {
                await this.reader.cancel();
                this.reader.releaseLock();
                this.reader = null;
            }
            if (this.writer) {
                this.writer.releaseLock();
                this.writer = null;
            }
            if (this.port) {
                await this.port.close();
                this.port = null;
            }
        } catch {
            // 切断時のエラーは無視
        }

        this.setStatus('disconnected');
    }

    /** データを送信 */
    async write(data: Uint8Array): Promise<void> {
        if (!this.writer) {
            throw new Error('シリアルポートが接続されていません');
        }
        await this.writer.write(data);
    }

    /** 受信ループ */
    private async startReadLoop(): Promise<void> {
        this.readLoop = true;

        while (this.readLoop && this.reader) {
            try {
                const { value, done } = await this.reader.read();
                if (done) {
                    this.readLoop = false;
                    break;
                }
                if (value) {
                    this.emit('data', value);
                }
            } catch (err) {
                if (this.readLoop) {
                    this.setStatus('error');
                    this.emit('error', err);
                }
                this.readLoop = false;
            }
        }
    }
}
