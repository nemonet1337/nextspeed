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
 * Speeduino リアルタイムデータパーサー ('A' コマンド)
 * 固定長バイナリ (v2021.07 以降 120バイト)
 */
export function parseSpeeduinoRealtimeData(raw: Uint8Array): SensorData {
    const data = createDefaultSensorData();

    // 'A' コマンドのレスポンスは最低 75 バイト必要 (仕様上は120バイト等パディングあり)
    if (raw.length < 35) {
        return data; // データ不足
    }

    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);

    // Speeduino 'A' コマンド (0-indexed) の公式バイトオフセット
    // 0: secl
    // 1: status1 (bitfield)
    // 2: engine (bitfield)
    // 3: syncLossCounter
    // 4-5: MAP (LE U16, kPa)
    data.map = view.getUint16(4, true);

    // 6: IAT + CALIBRATION_TEMPERATURE_OFFSET(40) (U08)
    data.iat = view.getUint8(6) - 40;

    // 7: Coolant + CALIBRATION_TEMPERATURE_OFFSET(40) (U08)
    data.coolantTemp = view.getUint8(7) - 40;

    // 8: batCorrection
    // 9: battery10 (V * 10, U08)
    data.batteryVoltage = view.getUint8(9) / 10;

    // 10: O2 (AFR * 10, U08)
    data.afr = view.getUint8(10) / 10;

    // 11: O2_2 (if available)

    // 12: egoCorrection (%) (U08)
    data.egoCorrection = view.getUint8(12);

    // 13: iatCorrection (%)
    // 14: wueCorrection (%)

    // 15-16: RPM (LE U16)
    data.rpm = view.getUint16(15, true);

    // 17: AEamount >> 1 (TPS acceleration enrichment / 2)
    // 18-19: corrections (GammaE, LE U16)
    data.gammaEnrich = view.getUint16(18, true);

    // 20: VE1 (%)
    data.veCurr = view.getUint8(20);

    // 21: VE2 (%)

    // 22: afrTarget (AFR * 10, U08)
    data.afrTarget = view.getUint8(22) / 10;

    // 23: tpsDOT (U08)

    // 24: advance (S08, °)
    data.advance = view.getInt8(24);

    // 25: TPS (0-100%, U08)
    data.tps = view.getUint8(25);

    // 26-27: loopsPerSecond (LE U16)
    // 28-29: freeRAM (LE U16)

    if (raw.length > 31) {
        // 30: boostTarget >> 1
        data.boostTarget = view.getUint8(30) * 2;

        // 31: boostDuty / 100
        data.boostDuty = view.getUint8(31) * 100;
    }

    // PWM/Dwell などは別のオフセットから取るか計算 (今回は省略・または後でPWコマンド等から)
    // ダミー計算または固定
    data.pulseWidth1 = 0;
    data.pulseWidth2 = 0;
    data.dutyCycle = 0;
    data.dwell = 0;

    // Vehicle Speed (VSS) — Speeduino拡張バイト (offset 33付近, ファームウェア版で異なる)
    if (raw.length > 63) {
        data.vehicleSpeed = view.getUint16(62, true); // km/h として取得
    }

    const statusBits = view.getUint8(1);
    data.syncStatus = (statusBits & 0x01) !== 0; // 仕様に基づくSync
    // data.fanOn は現状の公式Aコマンド内に明確なビットがないため false 固定
    data.fanOn = false;

    data.timestamp = Date.now();
    return data;
}

/**
 * RusEFI リアルタイムデータパーサー
 * RusEFI は TunerStudio の outputChannels を使用 (ファームウェアバージョンで可変)
 * 以下は最新の output_channels.txt (PACKED) に基づくベストエフォートなパーサー
 */
export function parseRusEFIRealtimeData(raw: Uint8Array): SensorData {
    const data = createDefaultSensorData();

    if (raw.length < 56) {
        return data; // データ不足
    }

    const view = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);

    // 0-3: 32bit Flags (sd_present, etc)
    const flags = view.getUint32(0, true);
    data.syncStatus = (flags & (1 << 28)) === 0; // triggerErrorなど様々なフラグがあるが、代表してダミー割り当て

    // 4-5: RPMValue (U16)
    data.rpm = view.getUint16(4, true);

    // 6-7: rpmAcceleration (I16)
    // 8-9: speedToRpmRatio (U16)
    // 10: internalMcuTemperature (I8)
    // 11-12: internalVref (I16)
    // 13-14: internalVbat (I16)

    // 15-16: coolant (I16, PACK_MULT_TEMPERATURE = 100 と仮定)
    data.coolantTemp = view.getInt16(15, true) / 100;

    // 17-18: intake / IAT (I16, PACK_MULT_TEMPERATURE = 100 と仮定)
    data.iat = view.getInt16(17, true) / 100;

    // 19-20: auxTemp1 (I16)
    // 21-22: auxTemp2 (I16)

    // 23-24: TPSValue (I16, PACK_MULT_PERCENT = 100)
    data.tps = view.getInt16(23, true) / 100;

    // 25-26: throttlePedalPosition (I16)
    // 27-28: tpsADC (U16)
    // 29-30: rawMaf (U16)
    // 31-32: mafMeasured (U16)

    // 33-34: MAPValue (U16, PACK_MULT_PRESSURE = 1000 と仮定, kPa)
    data.map = view.getUint16(33, true) / 1000;

    // 35-36: baroPressure (U16)

    // 37-38: lambdaValue (U16, PACK_MULT_LAMBDA = 10000 推測)
    data.afr = view.getUint16(37, true) / 10000 * 14.7; // Lambda -> AFR

    // 39-40: VBatt (U16, PACK_MULT_VOLTAGE = 1000)
    data.batteryVoltage = view.getUint16(39, true) / 1000;

    // 41-42: oilPressure (U16, kPa) // PACK_MULT_PRESSURE = 1000
    data.oilPressure = view.getUint16(41, true) / 1000;

    // 43-44: vvtPositionB1I
    // 45-46: actualLastInjection (U16, MS)
    data.pulseWidth1 = view.getUint16(45, true) / 1000; // MS=1000

    // 47-50: actualLastInjectionRatio (float)
    // 51: stopEngineCode (U8)

    // 52: injectorDutyCycle (U8, scale 1/2) -> %
    data.dutyCycle = view.getUint8(52) / 2;

    // 以下はオフセットが動的なためデフォルト値を利用
    data.advance = 0;
    data.fuelPressure = 0;
    data.oilTemp = 0;
    data.boostTarget = 0;
    data.boostDuty = 0;
    data.dwell = 0;
    data.egoCorrection = 0;
    data.iacPosition = 0;
    data.triggerErrors = 0;
    data.fanOn = false;

    // Vehicle Speed (VSS) — RusEFI outputChannels
    if (raw.length > 54) {
        data.vehicleSpeed = view.getUint16(53, true) / 100; // vehicleSpeedKph (PACK_MULT = 100)
    }

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
