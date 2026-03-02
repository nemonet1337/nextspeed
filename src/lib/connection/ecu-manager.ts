/**
 * ECU 接続マネージャ
 *
 * Serial / Bluetooth の抽象レイヤーを提供し、
 * React コンポーネントから統一的に ECU に接続・データ取得を行う。
 */
import { SerialManager } from './serial';
import { BluetoothManager } from './bluetooth';
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
    private bluetooth: BluetoothManager;
    private buffer: ResponseBuffer;
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private listeners: EcuEventHandler[] = [];

    private _connectionType: ConnectionType | null = null;
    private _ecuType: EcuType = 'unknown';
    private _status: ConnectionStatus = 'disconnected';
    private _sensorData: SensorData = createDefaultSensorData();

    constructor() {
        this.serial = new SerialManager();
        this.bluetooth = new BluetoothManager();
        this.buffer = new ResponseBuffer();

        // Serial イベント
        this.serial.on((type, payload) => {
            if (type === 'data') {
                this.onData(payload as Uint8Array);
            } else if (type === 'status') {
                this.setStatus(payload as ConnectionStatus);
            }
        });

        // Bluetooth イベント
        this.bluetooth.on((type, payload) => {
            if (type === 'data') {
                this.onData(payload as Uint8Array);
            } else if (type === 'status') {
                this.setStatus(payload as ConnectionStatus);
            }
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

    /** USB/シリアル接続 */
    async connectSerial(baudRate: number = 115200): Promise<void> {
        this._connectionType = 'serial';
        await this.serial.connect(baudRate);
        await this.identify();
        this.startPolling();
    }

    /** Bluetooth 接続 */
    async connectBluetooth(): Promise<void> {
        this._connectionType = 'bluetooth';
        await this.bluetooth.connect();
        await this.identify();
        this.startPolling();
    }

    /** 切断 */
    async disconnect(): Promise<void> {
        this.stopPolling();
        if (this._connectionType === 'serial') {
            await this.serial.disconnect();
        } else if (this._connectionType === 'bluetooth') {
            await this.bluetooth.disconnect();
        }
        this._connectionType = null;
        this._ecuType = 'unknown';
        this._sensorData = createDefaultSensorData();
    }

    /** ECU シグネチャを取得して ECU タイプを判定 */
    private async identify(): Promise<void> {
        try {
            await this.send(buildSignatureCommand());
            // レスポンスは onData で処理される
            // 少し待ってバッファに溜まったデータからシグネチャを解析
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

    /** データ送信 */
    private async send(data: Uint8Array): Promise<void> {
        if (this._connectionType === 'serial') {
            await this.serial.write(data);
        } else if (this._connectionType === 'bluetooth') {
            await this.bluetooth.write(data);
        }
    }

    /** 受信データ処理 */
    private onData(chunk: Uint8Array) {
        this.buffer.append(chunk);

        // リアルタイムデータとしてパース試行
        // Speeduino: 最低 76 バイト / RusEFI: 最低 100 バイト
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
