/**
 * Web Bluetooth API を使った BLE 通信マネージャ
 *
 * Bluetooth 経由で ECU と接続する。
 * Android Chrome / Windows Edge など Web Bluetooth API 対応ブラウザで動作。
 */
import type { ConnectionStatus } from '../types/ecu';

// Speeduino / RusEFI で一般的な BLE UART サービス UUID
const BLE_UART_SERVICE = '0000ffe0-0000-1000-8000-00805f9b34fb';
const BLE_UART_CHAR_TX = '0000ffe1-0000-1000-8000-00805f9b34fb';  // ECU -> クライアント
const BLE_UART_CHAR_RX = '0000ffe2-0000-1000-8000-00805f9b34fb';  // クライアント -> ECU

export type BleEventType = 'status' | 'data' | 'error';
export type BleEventHandler = (type: BleEventType, payload: unknown) => void;

export class BluetoothManager {
    private device: BluetoothDevice | null = null;
    private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private listeners: BleEventHandler[] = [];

    private _status: ConnectionStatus = 'disconnected';

    get status(): ConnectionStatus {
        return this._status;
    }

    /** ブラウザが Web Bluetooth API をサポートしているか */
    static isSupported(): boolean {
        return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    }

    on(handler: BleEventHandler) {
        this.listeners.push(handler);
    }

    off(handler: BleEventHandler) {
        this.listeners = this.listeners.filter((h) => h !== handler);
    }

    private emit(type: BleEventType, payload: unknown) {
        this.listeners.forEach((h) => h(type, payload));
    }

    private setStatus(status: ConnectionStatus) {
        this._status = status;
        this.emit('status', status);
    }

    /**
     * BLE デバイスを選択して接続
     */
    async connect(serviceUuid?: string): Promise<void> {
        if (!BluetoothManager.isSupported()) {
            throw new Error('Web Bluetooth API はこのブラウザではサポートされていません');
        }

        try {
            this.setStatus('connecting');

            const targetService = serviceUuid || BLE_UART_SERVICE;

            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [targetService] }],
                optionalServices: [targetService],
            });

            // 切断イベント
            this.device.addEventListener('gattserverdisconnected', () => {
                this.setStatus('disconnected');
            });

            const server = await this.device.gatt!.connect();
            const service = await server.getPrimaryService(targetService);

            // TX (ECU -> Client) – Notification で受信
            try {
                this.txCharacteristic = await service.getCharacteristic(BLE_UART_CHAR_TX);
                await this.txCharacteristic.startNotifications();
                this.txCharacteristic.addEventListener(
                    'characteristicvaluechanged',
                    this.onTxNotification.bind(this),
                );
            } catch {
                // TX characteristic が見つからない場合、同一 characteristic で双方向通信のケース
                // ffe1 のみで双方向を試みる
            }

            // RX (Client -> ECU) – Write で送信
            try {
                this.rxCharacteristic = await service.getCharacteristic(BLE_UART_CHAR_RX);
            } catch {
                // RX が別に無い場合、TX characteristic に write する
                if (this.txCharacteristic) {
                    this.rxCharacteristic = this.txCharacteristic;
                }
            }

            this.setStatus('connected');
        } catch (err) {
            this.setStatus('error');
            this.emit('error', err);
            throw err;
        }
    }

    /** 切断 */
    async disconnect(): Promise<void> {
        try {
            if (this.txCharacteristic) {
                this.txCharacteristic.removeEventListener(
                    'characteristicvaluechanged',
                    this.onTxNotification.bind(this),
                );
                await this.txCharacteristic.stopNotifications();
            }
            if (this.device?.gatt?.connected) {
                this.device.gatt.disconnect();
            }
        } catch {
            // 切断エラーは無視
        }

        this.device = null;
        this.txCharacteristic = null;
        this.rxCharacteristic = null;
        this.setStatus('disconnected');
    }

    /** データを送信 */
    async write(data: Uint8Array): Promise<void> {
        if (!this.rxCharacteristic) {
            throw new Error('BLE デバイスが接続されていません');
        }
        await this.rxCharacteristic.writeValue(data as unknown as BufferSource);
    }

    /** TX 通知ハンドラ */
    private onTxNotification(event: Event) {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        if (target.value) {
            const data = new Uint8Array(target.value.buffer);
            this.emit('data', data);
        }
    }
}
