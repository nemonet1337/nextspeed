'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getEcuManager, type EcuEventType } from '../lib/connection/ecu-manager';
import type { ConnectionStatus, EcuType, SensorData } from '../lib/types/ecu';
import { createDefaultSensorData } from '../lib/types/ecu';

/**
 * ECU 接続・データ取得用 React フック
 */
export function useEcu() {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [ecuType, setEcuType] = useState<EcuType>('unknown');
    const [sensorData, setSensorData] = useState<SensorData>(createDefaultSensorData());
    const [error, setError] = useState<string | null>(null);
    const managerRef = useRef(getEcuManager());

    useEffect(() => {
        const mgr = managerRef.current;

        const handler = (type: EcuEventType, payload: unknown) => {
            switch (type) {
                case 'status':
                    setStatus(payload as ConnectionStatus);
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

    const connectSerial = useCallback(async (baudRate?: number) => {
        setError(null);
        try {
            await managerRef.current.connectSerial(baudRate);
        } catch (e) {
            setError(String(e));
        }
    }, []);

    const connectBluetooth = useCallback(async () => {
        setError(null);
        try {
            await managerRef.current.connectBluetooth();
        } catch (e) {
            setError(String(e));
        }
    }, []);

    const disconnect = useCallback(async () => {
        await managerRef.current.disconnect();
    }, []);

    return {
        status,
        ecuType,
        sensorData,
        error,
        connectSerial,
        connectBluetooth,
        disconnect,
    };
}
