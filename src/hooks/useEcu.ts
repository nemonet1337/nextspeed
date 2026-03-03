'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getEcuManager, type EcuEventType } from '../lib/connection/ecu-manager';
import type { ConnectionStatus, EcuType, SensorData } from '../lib/types/ecu';
import type { EngineProfileId } from '../lib/connection/mock-ecu';
import { createDefaultSensorData } from '../lib/types/ecu';

interface PortInfo {
    path: string;
    manufacturer: string;
    vendorId: string;
    productId: string;
}

/**
 * ECU 接続・データ取得用 React フック
 */
export function useEcu() {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [isMock, setIsMock] = useState(false);
    const [ecuType, setEcuType] = useState<EcuType>('unknown');
    const [sensorData, setSensorData] = useState<SensorData>(createDefaultSensorData());
    const [error, setError] = useState<string | null>(null);
    const [ports, setPorts] = useState<PortInfo[]>([]);
    const managerRef = useRef(getEcuManager());

    useEffect(() => {
        const mgr = managerRef.current;

        const handler = (type: EcuEventType, payload: unknown) => {
            switch (type) {
                case 'status':
                    setStatus(payload as ConnectionStatus);
                    setIsMock(mgr.connectionType === 'mock');
                    if (payload === 'disconnected') setError(null);
                    break;
                case 'ecuType':
                    setEcuType(payload as EcuType);
                    break;
                case 'sensorData':
                    setSensorData(payload as SensorData);
                    break;
                case 'error':
                    setError(String(payload));
                    break;
            }
        };

        mgr.on(handler);
        return () => { mgr.off(handler); };
    }, []);

    /** シリアルポート一覧の更新 */
    const refreshPorts = useCallback(async () => {
        try {
            const list = await managerRef.current.listSerialPorts();
            setPorts(list);
        } catch {
            setPorts([]);
        }
    }, []);

    /** シリアル接続 (ポートパス指定) */
    const connectSerial = useCallback(async (portPath: string, baudRate: number = 115200) => {
        setError(null);
        try {
            await managerRef.current.connectSerial(portPath, baudRate);
        } catch (e) {
            setError(String(e));
        }
    }, []);

    /** モック接続 (デモ用) */
    const connectMock = useCallback(async (profileId: EngineProfileId = 'i4_turbo', forcedEcuType?: EcuType) => {
        setError(null);
        try {
            await managerRef.current.connectMock(profileId, forcedEcuType);
        } catch (e) {
            setError(String(e));
        }
    }, []);

    /** ドラッグレースデモのトリガー */
    const triggerDragRace = useCallback(() => {
        managerRef.current.triggerMockDragRace();
    }, []);

    /** 切断 */
    const disconnect = useCallback(async () => {
        await managerRef.current.disconnect();
    }, []);

    return {
        status,
        isMock,
        ecuType,
        sensorData,
        error,
        ports,
        refreshPorts,
        connectSerial,
        connectMock,
        triggerDragRace,
        disconnect,
    };
}
