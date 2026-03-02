/**
 * TunerStudio 互換プロトコル パーサー
 *
 * Speeduino と RusEFI は TunerStudio MS (MegaSquirt) 互換プロトコルを使用。
 * このモジュールはコマンドの組み立て、レスポンスの解析を行う。
 *
 * 主なコマンド:
 *   'Q'  - ECU シグネチャ要求
 *   'S'  - ステータス文字列要求
 *   'A'  - リアルタイムデータ要求
 *   'r'  - ページ/オフセットからデータ読み取り
 *   'w'  - ページ/オフセットにデータ書き込み
 *   'b'  - バーン（設定をフラッシュに保存）
 */
import type { SensorData, EcuType } from '../types/ecu';
import { createDefaultSensorData } from '../types/ecu';

// ============================================================
// コマンドビルダー
// ============================================================

/** ECU シグネチャ要求 */
export function buildSignatureCommand(): Uint8Array {
    return new Uint8Array([0x51]); // 'Q'
}

/** リアルタイムデータ要求 (Speeduino 'A' コマンド) */
export function buildRealtimeDataCommand(): Uint8Array {
    return new Uint8Array([0x41]); // 'A'
}

/** ステータス文字列要求 */
export function buildStatusCommand(): Uint8Array {
    return new Uint8Array([0x53]); // 'S'
}

/** ページ読み取りコマンド ('r') */
export function buildReadPageCommand(
    canId: number,
    tableIdx: number,
    offset: number,
    length: number,
): Uint8Array {
    const buf = new Uint8Array(7);
    buf[0] = 0x72; // 'r'
    buf[1] = canId;
    buf[2] = tableIdx;
    buf[3] = (offset >> 8) & 0xff;
    buf[4] = offset & 0xff;
    buf[5] = (length >> 8) & 0xff;
    buf[6] = length & 0xff;
    return buf;
}

/** ページ書き込みコマンド ('w') */
export function buildWriteCommand(
    canId: number,
    tableIdx: number,
    offset: number,
    data: Uint8Array,
): Uint8Array {
    const buf = new Uint8Array(7 + data.length);
    buf[0] = 0x77; // 'w'
    buf[1] = canId;
    buf[2] = tableIdx;
    buf[3] = (offset >> 8) & 0xff;
    buf[4] = offset & 0xff;
    buf[5] = (data.length >> 8) & 0xff;
    buf[6] = data.length & 0xff;
    buf.set(data, 7);
    return buf;
}

/** バーン（フラッシュ書き込み）コマンド */
export function buildBurnCommand(): Uint8Array {
    return new Uint8Array([0x62]); // 'b'
}

// ============================================================
// レスポンスパーサー
// ============================================================

/**
 * ECU タイプの判定（シグネチャ文字列から）
 */
export function detectEcuType(signature: string): EcuType {
    const sig = signature.toLowerCase();
    if (sig.includes('speeduino') || sig.includes('202') || sig.includes('speedybt')) {
        return 'speeduino';
    }
    if (sig.includes('rusefi') || sig.includes('rusEFI')) {
        return 'rusefi';
    }
    return 'unknown';
}

/**
 * Speeduino リアルタイムデータパーサー
 * Speeduino の 'A' コマンドレスポンスは固定長バイナリ
 * 参照: speeduino/reference/speeduino.ini
 */
export function parseSpeeduinoRealtimeData(raw: Uint8Array): SensorData {
    const data = createDefaultSensorData();

    if (raw.length < 76) {
        // データが不足している場合はデフォルトを返す
        return data;
    }

    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);

    // Speeduino の realtime data フォーマット (バイトオフセット)
    // ※ speeduino.ini の outputChannels セクション参照
    data.rpm = view.getUint16(14, true);              // secl=0, status1=1, engine=2, ...
    data.map = view.getInt16(4, true);                // MAP (kPa * 1)
    data.tps = view.getUint8(24);                     // TPS (0-255 → %)
    data.tps = (data.tps / 255) * 100;
    data.coolantTemp = view.getInt16(7, true) - 40;   // CLT (offset -40)
    data.iat = view.getInt16(6, true) - 40;           // IAT (offset -40)

    data.batteryVoltage = view.getUint8(9) / 10;      // battery (V * 10)

    data.afr = view.getUint8(10) / 10;                // AFR = O2 / 10
    data.afrTarget = view.getUint8(13) / 10;          // AFR target

    data.advance = view.getInt8(23);                   // Advance (°)
    data.pulseWidth1 = view.getUint16(18, true) / 1000; // PW1 (µs → ms)
    data.pulseWidth2 = view.getUint16(20, true) / 1000; // PW2
    data.dutyCycle = (data.pulseWidth1 / (60000 / Math.max(data.rpm, 1) / 2)) * 100;

    data.egoCorrection = view.getUint8(11);            // EGO correction (%)
    data.gammaEnrich = view.getUint8(12);              // Gamma enrichment (%)
    data.veCurr = view.getUint8(22);                   // Current VE (%)

    data.boostDuty = view.getUint8(25);               // Boost duty (%)
    data.boostTarget = view.getUint8(26);              // Boost target

    data.iacPosition = view.getUint8(27);              // IAC step position

    data.dwell = view.getUint16(30, true) / 10;       // Dwell (ms * 10)
    data.triggerErrors = view.getUint16(38, true);     // trigger errors

    const statusBits = view.getUint8(1);
    data.syncStatus = (statusBits & 0x04) !== 0;       // sync bit
    data.fanOn = (statusBits & 0x20) !== 0;            // fan bit

    data.timestamp = Date.now();
    return data;
}

/**
 * RusEFI リアルタイムデータパーサー
 * RusEFI は TunerStudio の outputChannels 経由でバイナリデータを送信
 */
export function parseRusEFIRealtimeData(raw: Uint8Array): SensorData {
    const data = createDefaultSensorData();

    if (raw.length < 100) {
        return data;
    }

    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);

    // RusEFI の outputChannels (rusefi.ini 参照)
    // ※ RusEFI はフロート/16bit値を多く使用
    data.rpm = view.getUint16(0, true);
    data.coolantTemp = view.getFloat32(4, true);
    data.iat = view.getFloat32(8, true);
    data.tps = view.getFloat32(12, true);
    data.map = view.getFloat32(16, true);
    data.afr = view.getFloat32(20, true);
    data.batteryVoltage = view.getFloat32(24, true);
    data.advance = view.getFloat32(28, true);
    data.pulseWidth1 = view.getFloat32(32, true);
    data.veCurr = view.getFloat32(36, true);
    data.fuelPressure = view.getFloat32(40, true);
    data.oilTemp = view.getFloat32(44, true);
    data.oilPressure = view.getFloat32(48, true);
    data.boostTarget = view.getFloat32(52, true);
    data.boostDuty = view.getFloat32(56, true);
    data.dwell = view.getFloat32(60, true);
    data.egoCorrection = view.getFloat32(64, true);
    data.iacPosition = view.getFloat32(68, true);
    data.triggerErrors = view.getUint16(72, true);

    const flags = view.getUint8(74);
    data.syncStatus = (flags & 0x01) !== 0;
    data.fanOn = (flags & 0x02) !== 0;

    data.timestamp = Date.now();
    return data;
}

// ============================================================
// バッファ管理ユーティリティ
// ============================================================
export class ResponseBuffer {
    private buffer: Uint8Array = new Uint8Array(0);

    /** データを追加 */
    append(chunk: Uint8Array) {
        const merged = new Uint8Array(this.buffer.length + chunk.length);
        merged.set(this.buffer);
        merged.set(chunk, this.buffer.length);
        this.buffer = merged;
    }

    /** 指定バイト数以上溜まっているか */
    hasBytes(count: number): boolean {
        return this.buffer.length >= count;
    }

    /** 先頭からバイトを取り出す */
    consume(count: number): Uint8Array {
        const data = this.buffer.slice(0, count);
        this.buffer = this.buffer.slice(count);
        return data;
    }

    /** 文字列としてデコード */
    consumeAsString(count: number): string {
        const bytes = this.consume(count);
        return new TextDecoder().decode(bytes);
    }

    /** バッファサイズ */
    get length(): number {
        return this.buffer.length;
    }

    /** クリア */
    clear() {
        this.buffer = new Uint8Array(0);
    }
}
