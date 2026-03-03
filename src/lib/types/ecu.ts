/**
 * ECU チューニングツール 共通型定義
 */

// ============================================================
// 接続
export type ConnectionType = 'serial' | 'mock';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type EcuType = 'speeduino' | 'rusefi' | 'unknown';

export interface ConnectionInfo {
    type: ConnectionType;
    status: ConnectionStatus;
    ecuType: EcuType;
    portName?: string;
    baudRate?: number;
}

// ============================================================
// センサーデータ
// ============================================================
export interface SensorData {
    // エンジン基本
    rpm: number;
    map: number;            // マニホールド絶対圧 (kPa)
    tps: number;            // スロットルポジション (%)
    coolantTemp: number;    // 冷却水温 (°C)
    iat: number;            // 吸気温度 (°C)
    oilTemp: number;        // 油温 (°C)
    oilPressure: number;    // 油圧 (kPa)
    batteryVoltage: number; // バッテリー電圧 (V)

    // 燃料系
    afr: number;            // 空燃比 (A/F)
    afrTarget: number;      // 目標空燃比
    fuelPressure: number;   // 燃圧 (kPa)
    pulseWidth1: number;    // インジェクタパルス幅 1 (ms)
    pulseWidth2: number;    // インジェクタパルス幅 2 (ms)
    dutyCycle: number;      // インジェクタデューティ (%)

    // 点火系
    advance: number;        // 点火進角 (°)
    dwell: number;          // ドウェル時間 (ms)

    // ブースト
    boostTarget: number;    // ブースト目標値 (kPa)
    boostDuty: number;      // ブーストソレノイドデューティ (%)

    // クランク / カム
    crankAngle: number;     // クランク角 (°)
    triggerErrors: number;  // トリガーエラー回数
    syncStatus: boolean;    // 同期ステータス

    // アイドル
    idleTarget: number;     // 目標アイドル回転数
    iacPosition: number;    // IAC バルブポジション (%)

    // その他
    egoCorrection: number;  // EGO 補正 (%)
    gammaEnrich: number;    // ガンマ補正 (%)
    veCurr: number;         // 現在の VE 値 (%)
    fanOn: boolean;         // ファンステータス
    vehicleSpeed: number;   // 車速 (km/h) — VSS 経由

    // タイムスタンプ
    timestamp: number;
}

// ============================================================
// チューニングマップ / テーブル
// ============================================================
export interface TuningTable {
    id: string;
    name: string;
    description: string;
    xAxis: AxisConfig;
    yAxis: AxisConfig;
    data: number[][];
    unit: string;
}

export interface AxisConfig {
    label: string;
    unit: string;
    bins: number[];
}

// ============================================================
// チューニング設定パラメータ
// ============================================================
export interface TuningParameter {
    id: string;
    name: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    category: string;
}

export interface TuningConfig {
    tables: TuningTable[];
    parameters: TuningParameter[];
}

// ============================================================
// デフォルトセンサーデータ
// ============================================================
export function createDefaultSensorData(): SensorData {
    return {
        rpm: 0,
        map: 0,
        tps: 0,
        coolantTemp: 0,
        iat: 0,
        oilTemp: 0,
        oilPressure: 0,
        batteryVoltage: 0,
        afr: 14.7,
        afrTarget: 14.7,
        fuelPressure: 0,
        pulseWidth1: 0,
        pulseWidth2: 0,
        dutyCycle: 0,
        advance: 0,
        dwell: 0,
        boostTarget: 0,
        boostDuty: 0,
        crankAngle: 0,
        triggerErrors: 0,
        syncStatus: false,
        idleTarget: 0,
        iacPosition: 0,
        egoCorrection: 0,
        gammaEnrich: 0,
        veCurr: 0,
        fanOn: false,
        vehicleSpeed: 0,
        timestamp: Date.now(),
    };
}
