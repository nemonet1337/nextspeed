'use client';

import { useState, useEffect } from 'react';
import { useEcu } from '../../hooks/useEcu';
import StatusIndicator from '../Dashboard/StatusIndicator';
import styles from './Header.module.css';

export default function Header() {
    const { status, ecuType, ports, refreshPorts, connectSerial, connectBluetooth, disconnect } = useEcu();
    const [showPortDialog, setShowPortDialog] = useState(false);
    const [selectedPort, setSelectedPort] = useState('');
    const [baudRate, setBaudRate] = useState(115200);

    const isElectron = typeof window !== 'undefined' && !!(window as { electronAPI?: unknown }).electronAPI;

    /** USB接続ボタン押下 → ポート選択ダイアログ表示 */
    const handleSerialClick = async () => {
        await refreshPorts();
        setShowPortDialog(true);
    };

    /** ポート選択後に接続 */
    const handleConnect = async () => {
        if (!selectedPort) return;
        setShowPortDialog(false);
        await connectSerial(selectedPort, baudRate);
    };

    useEffect(() => {
        if (ports.length > 0 && !selectedPort) {
            setSelectedPort(ports[0].path);
        }
    }, [ports, selectedPort]);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <StatusIndicator status={status} ecuType={ecuType} />
            </div>

            <div className={styles.right}>
                {status === 'disconnected' ? (
                    <>
                        <button
                            className={`${styles.btn} ${styles.primary}`}
                            onClick={handleSerialClick}
                        >
                            <span className={styles.btnIcon}>🔌</span>
                            USB 接続
                        </button>
                        {!isElectron && (
                            <button
                                className={`${styles.btn} ${styles.secondary}`}
                                onClick={() => connectBluetooth()}
                            >
                                <span className={styles.btnIcon}>📡</span>
                                Bluetooth
                            </button>
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

            {/* ポート選択ダイアログ */}
            {showPortDialog && (
                <div className={styles.dialogOverlay} onClick={() => setShowPortDialog(false)}>
                    <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h3>シリアルポート選択</h3>
                        <div className={styles.dialogBody}>
                            {ports.length === 0 ? (
                                <p className={styles.noPorts}>利用可能なポートが見つかりません</p>
                            ) : (
                                <>
                                    <label className={styles.label}>
                                        ポート
                                        <select
                                            className={styles.select}
                                            value={selectedPort}
                                            onChange={(e) => setSelectedPort(e.target.value)}
                                        >
                                            {ports.map((p) => (
                                                <option key={p.path} value={p.path}>
                                                    {p.path} {p.manufacturer ? `(${p.manufacturer})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className={styles.label}>
                                        ボーレート
                                        <select
                                            className={styles.select}
                                            value={baudRate}
                                            onChange={(e) => setBaudRate(Number(e.target.value))}
                                        >
                                            {[9600, 19200, 38400, 57600, 115200, 250000, 500000, 921600].map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </label>
                                </>
                            )}
                        </div>
                        <div className={styles.dialogActions}>
                            <button
                                className={`${styles.btn} ${styles.secondary}`}
                                onClick={() => setShowPortDialog(false)}
                            >
                                キャンセル
                            </button>
                            <button
                                className={`${styles.btn} ${styles.primary}`}
                                onClick={handleConnect}
                                disabled={!selectedPort || ports.length === 0}
                            >
                                接続
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
