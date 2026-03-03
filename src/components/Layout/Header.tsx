'use client';

import { useState, useEffect } from 'react';
import { useEcu } from '../../hooks/useEcu';
import { useTranslation } from '../../hooks/useTranslation';
import type { EngineProfileId } from '../../lib/connection/mock-ecu';
import StatusIndicator from '../Dashboard/StatusIndicator';
import styles from './Header.module.css';

export default function Header() {
    const { status, isMock, ecuType, ports, refreshPorts, connectSerial, connectMock, triggerDragRace, disconnect } = useEcu();
    const { t } = useTranslation();
    const [showPortDialog, setShowPortDialog] = useState(false);
    const [selectedPort, setSelectedPort] = useState('');
    const [baudRate, setBaudRate] = useState(115200);

    const [showMockDialog, setShowMockDialog] = useState(false);
    const [selectedEngine, setSelectedEngine] = useState<EngineProfileId>('i4_turbo');

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

    /** モック接続 (デモ) */
    const handleMockConnect = async () => {
        setShowMockDialog(false);
        await connectMock(selectedEngine, 'speeduino');
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className={`${styles.btn} ${styles.secondary}`}
                            onClick={() => setShowMockDialog(true)}
                        >
                            <span className={styles.btnIcon}>🎮</span>
                            {t('header.mockConnect')}
                        </button>
                        <button
                            className={`${styles.btn} ${styles.primary}`}
                            onClick={handleSerialClick}
                        >
                            <span className={styles.btnIcon}>🔌</span>
                            {t('header.usbConnect')}
                        </button>
                    </div>
                ) : status === 'connecting' ? (
                    <button className={styles.btn} disabled>
                        {t('header.connecting')}
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {isMock && (
                            <button
                                className={`${styles.btn} ${styles.secondary}`}
                                onClick={triggerDragRace}
                            >
                                {t('header.triggerDragRace')}
                            </button>
                        )}
                        <button
                            className={`${styles.btn} ${styles.danger}`}
                            onClick={() => disconnect()}
                        >
                            {t('header.disconnect')}
                        </button>
                    </div>
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

            {/* モック接続ダイアログ */}
            {showMockDialog && (
                <div className={styles.dialogOverlay} onClick={() => setShowMockDialog(false)}>
                    <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h3>{t('header.mockDialog.title')}</h3>
                        <div className={styles.dialogBody}>
                            <label className={styles.label}>
                                {t('header.mockDialog.engine')}
                                <select
                                    className={styles.select}
                                    value={selectedEngine}
                                    onChange={(e) => setSelectedEngine(e.target.value as EngineProfileId)}
                                >
                                    <option value="i4_turbo">Inline-4 2.0L Turbo</option>
                                    <option value="v6_twinturbo">V6 3.8L Twin Turbo</option>
                                    <option value="v8_na">V8 6.2L NA OHV</option>
                                </select>
                            </label>
                        </div>
                        <div className={styles.dialogActions}>
                            <button
                                className={`${styles.btn} ${styles.secondary}`}
                                onClick={() => setShowMockDialog(false)}
                            >
                                {t('header.mockDialog.cancel')}
                            </button>
                            <button
                                className={`${styles.btn} ${styles.primary}`}
                                onClick={handleMockConnect}
                            >
                                {t('header.mockDialog.connect')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
