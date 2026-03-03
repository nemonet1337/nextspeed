'use client';

import { useState, useEffect } from 'react';
import { useEcu } from '../../hooks/useEcu';
import { useTranslation } from '../../hooks/useTranslation';
import StatusIndicator from '../Dashboard/StatusIndicator';
import styles from './Header.module.css';

export default function Header() {
    const { status, ecuType, ports, refreshPorts, connectSerial, disconnect } = useEcu();
    const { t } = useTranslation();
    const [showPortDialog, setShowPortDialog] = useState(false);
    const [selectedPort, setSelectedPort] = useState('');
    const [baudRate, setBaudRate] = useState(115200);

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
                            {t('header.usbConnect')}
                        </button>
                    </>
                ) : status === 'connecting' ? (
                    <button className={styles.btn} disabled>
                        {t('header.connecting')}
                    </button>
                ) : (
                    <button
                        className={`${styles.btn} ${styles.danger}`}
                        onClick={() => disconnect()}
                    >
                        {t('header.disconnect')}
                    </button>
                )}
            </div>

            {/* ポート選択ダイアログ */}
            {showPortDialog && (
                <div className={styles.dialogOverlay} onClick={() => setShowPortDialog(false)}>
                    <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h3>{t('header.portDialog.title')}</h3>
                        <div className={styles.dialogBody}>
                            {ports.length === 0 ? (
                                <p className={styles.noPorts}>{t('header.portDialog.noPorts')}</p>
                            ) : (
                                <>
                                    <label className={styles.label}>
                                        {t('header.portDialog.port')}
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
                                        {t('header.portDialog.baudRate')}
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
                                {t('header.portDialog.cancel')}
                            </button>
                            <button
                                className={`${styles.btn} ${styles.primary}`}
                                onClick={handleConnect}
                                disabled={!selectedPort || ports.length === 0}
                            >
                                {t('header.portDialog.connect')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
