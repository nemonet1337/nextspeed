/**
 * ECU 接続マネージャ
 *
 * Serial / Bluetooth の抽象レイヤーを提供し、
 * React コンポーネントから統一的に ECU に接続・データ取得を行う。
 */
import { SerialManager } from './serial';
import {
    buildSignatureCommand,
    buildRealtimeDataCommand,
    detectEcuType,
    parseSpeeduinoRealtimeData,
    parseRusEFIRealtimeData,
    ResponseBuffer,
} from '../protocol/ts-protocol';
import type {
    ConnectionType,
    ConnectionStatus,
    EcuType,
    SensorData,
} from '../types/ecu';
import { createDefaultSensorData } from '../types/ecu';

export type EcuEventType = 'status' | 'sensorData' | 'error' | 'ecuType';
export type EcuEventHandler = (type: EcuEventType, payload: unknown) => void;

export class EcuConnectionManager {
    private serial: SerialManager;
    private buffer: ResponseBuffer;
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private listeners: EcuEventHandler[] = [];

    private _connectionType: ConnectionType | null = null;
    private _ecuType: EcuType = 'unknown';
    private _status: ConnectionStatus = 'disconnected';
    private _sensorData: SensorData = createDefaultSensorData();

    constructor() {
        this.serial = new SerialManager();
        this.buffer = new ResponseBuffer();

        // Serial イベント (Electron IPC 版)
        this.serial.onStatus((status: ConnectionStatus) => {
            this.setStatus(status);
        });
        this.serial.onData((data: Uint8Array) => {
            this.onData(data);
        });
        this.serial.onError((error: string) => {
            this.emit('error', error);
        });
    }

    get connectionType() { return this._connectionType; }
    get ecuType() { return this._ecuType; }
    get status() { return this._status; }
    get sensorData() { return this._sensorData; }

    on(handler: EcuEventHandler) { this.listeners.push(handler); }
    off(handler: EcuEventHandler) { this.listeners = this.listeners.filter(h => h !== handler); }

    private emit(type: EcuEventType, payload: unknown) {
        this.listeners.forEach(h => h(type, payload));
    }

    private setStatus(status: ConnectionStatus) {
        this._status = status;
        this.emit('status', status);
    }

    /** 利用可能なシリアルポート一覧を取得 */
    async listSerialPorts() {
        return this.serial.listPorts();
    }

    /** USB/シリアル接続 (ポートパスを指定) */
    async connectSerial(portPath: string, baudRate: number = 115200): Promise<void> {
        this._connectionType = 'serial';
        await this.serial.connect(portPath, baudRate);
        await this.identify();
        this.startPolling();
    }

    /** 切断 */
    async disconnect(): Promise<void> {
        this.stopPolling();
        if (this._connectionType === 'serial') {
            await this.serial.disconnect();
        }
        this._connectionType = null;
        this._ecuType = 'unknown';
        this._sensorData = createDefaultSensorData();
    }

    /** ECU シグネチャを取得して ECU タイプを判定 */
    private async identify(): Promise<void> {
        try {
            await this.send(buildSignatureCommand());
            await new Promise(resolve => setTimeout(resolve, 500));
            if (this.buffer.length > 0) {
                const sig = new TextDecoder().decode(this.buffer.consume(this.buffer.length));
                this._ecuType = detectEcuType(sig);
                this.emit('ecuType', this._ecuType);
            }
        } catch {
            // 識別失敗 — ポーリングで自動判定を試みる
        }
    }

    /** データの直接送信 (外部からの書き込み用) */
    public async write(data: Uint8Array): Promise<void> {
        await this.send(data);
    }

    /** データ送信 (内部用) */
    private async send(data: Uint8Array): Promise<void> {
        if (this._connectionType === 'serial') {
            await this.serial.write(data);
        }
    }

    /** 受信データ処理 */
    private onData(chunk: Uint8Array) {
        this.buffer.append(chunk);

        const minLen = this._ecuType === 'rusefi' ? 100 : 76;

        if (this.buffer.hasBytes(minLen)) {
            const raw = this.buffer.consume(minLen);
            try {
                if (this._ecuType === 'rusefi') {
                    this._sensorData = parseRusEFIRealtimeData(raw);
                } else {
                    this._sensorData = parseSpeeduinoRealtimeData(raw);
                }
                this.emit('sensorData', this._sensorData);
            } catch {
                // パースエラーは無視
            }
        }
    }

    /** ポーリング開始 (50ms = 20Hz) */
    private startPolling(intervalMs: number = 50) {
        this.stopPolling();
        this.pollTimer = setInterval(async () => {
            try {
                await this.send(buildRealtimeDataCommand());
            } catch {
                // 送信エラー
            }
        }, intervalMs);
    }

    /** ポーリング停止 */
    private stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }
}

/** シングルトンインスタンス */
let _instance: EcuConnectionManager | null = null;

export function getEcuManager(): EcuConnectionManager {
    if (!_instance) {
        _instance = new EcuConnectionManager();
    }
    return _instance;
}
