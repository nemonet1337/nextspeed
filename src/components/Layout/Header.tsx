'use client';

import { useEcu } from '../../hooks/useEcu';
import StatusIndicator from '../Dashboard/StatusIndicator';
import { SerialManager } from '../../lib/connection/serial';
import { BluetoothManager } from '../../lib/connection/bluetooth';
import styles from './Header.module.css';

export default function Header() {
    const { status, ecuType, connectSerial, connectBluetooth, disconnect } = useEcu();

    const serialSupported = typeof window !== 'undefined' && SerialManager.isSupported();
    const bleSupported = typeof window !== 'undefined' && BluetoothManager.isSupported();

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <StatusIndicator status={status} ecuType={ecuType} />
            </div>

            <div className={styles.right}>
                {status === 'disconnected' ? (
                    <>
                        {serialSupported && (
                            <button
                                className={`${styles.btn} ${styles.primary}`}
                                onClick={() => connectSerial()}
                            >
                                <span className={styles.btnIcon}>🔌</span>
                                USB 接続
                            </button>
                        )}
                        {bleSupported && (
                            <button
                                className={`${styles.btn} ${styles.secondary}`}
                                onClick={() => connectBluetooth()}
                            >
                                <span className={styles.btnIcon}>📡</span>
                                Bluetooth
                            </button>
                        )}
                        {!serialSupported && !bleSupported && (
                            <span className={styles.unsupported}>
                                このブラウザは Serial / Bluetooth API に対応していません
                            </span>
                        )}
                    </>
                ) : status === 'connecting' ? (
                    <button className={styles.btn} disabled>
                        接続中...
                    </button>
                ) : (
                    <button
                        className={`${styles.btn} ${styles.danger}`}
                        onClick={() => disconnect()}
                    >
                        切断
                    </button>
                )}
            </div>
        </header>
    );
}
