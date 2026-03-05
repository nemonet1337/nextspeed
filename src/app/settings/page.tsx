'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useEcu } from '../../hooks/useEcu';
import type { EngineProfileId } from '../../lib/connection/mock-ecu';
import type { Locale } from '../../i18n';
import type { EcuType } from '../../lib/types/ecu';
import styles from './page.module.css';

// ===== 型定義 =====
interface AppSettings {
    units: 'metric' | 'imperial';
    baudRate: number;
    engineDisplacement: number;
    cylinders: number;
    injectorSize: number;
}

const DEFAULT_SETTINGS: AppSettings = {
    units: 'metric',
    baudRate: 115200,
    engineDisplacement: 2000,
    cylinders: 4,
    injectorSize: 550,
};

// ===== 折りたたみカードコンポーネント =====
function CollapsibleCard({
    icon,
    title,
    defaultOpen = false,
    children,
}: {
    icon: string;
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <section className={styles.card}>
            <div className={styles.cardHeader} onClick={() => setIsOpen((v) => !v)}>
                <div className={styles.cardHeaderLeft}>
                    <span className={styles.cardIcon}>{icon}</span>
                    <h2 className={styles.cardTitle}>{title}</h2>
                </div>
                <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
            </div>
            <div className={`${styles.cardBody} ${isOpen ? styles.cardBodyOpen : ''}`}>
                {children}
            </div>
        </section>
    );
}

// ===== トグルコンポーネント =====
function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className={styles.toggleGroup}>
            <span className={styles.toggleLabel}>{label}</span>
            <label className={styles.toggle}>
                <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span className={styles.toggleSlider} />
            </label>
        </div>
    );
}

// ===== メインページ =====
export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);
    const { t } = useTranslation();
    const { locale, setLocale, ecuPreference, setEcuPreference } = useLanguage();
    const { status, isMock, ports, refreshPorts, connectSerial, connectMock, triggerDragRace, disconnect } = useEcu();
    const [showPortDialog, setShowPortDialog] = useState(false);
    const [selectedPort, setSelectedPort] = useState('');
    const [showMockDialog, setShowMockDialog] = useState(false);
    const [selectedEngine, setSelectedEngine] = useState<EngineProfileId>('i4_turbo');

    // ポート更新
    useEffect(() => {
        if (ports.length > 0 && !selectedPort) {
            setSelectedPort(ports[0].path);
        }
    }, [ports, selectedPort]);

    // インポート・エクスポートハンドラ
    const handleExport = () => {
        const data = {
            app_settings: localStorage.getItem('nextspeed_settings'),
            tuning_params: localStorage.getItem('nextspeed_tuning_params'),
            ve_table: localStorage.getItem('nextspeed_ve_table'),
            ign_table: localStorage.getItem('nextspeed_ign_table'),
            afr_table: localStorage.getItem('nextspeed_afr_table'),
            boost_table: localStorage.getItem('nextspeed_boost_table'),
            vvt_table: localStorage.getItem('nextspeed_vvt_table'),
            failsafe_settings: localStorage.getItem('nextspeed_failsafe_settings'),
            features_settings: localStorage.getItem('nextspeed_features_settings'),
            accessories_settings: localStorage.getItem('nextspeed_accessories_settings'),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nextspeed_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.app_settings) localStorage.setItem('nextspeed_settings', data.app_settings);
                if (data.tuning_params) localStorage.setItem('nextspeed_tuning_params', data.tuning_params);
                if (data.ve_table) localStorage.setItem('nextspeed_ve_table', data.ve_table);
                if (data.ign_table) localStorage.setItem('nextspeed_ign_table', data.ign_table);
                if (data.afr_table) localStorage.setItem('nextspeed_afr_table', data.afr_table);
                if (data.boost_table) localStorage.setItem('nextspeed_boost_table', data.boost_table);
                if (data.vvt_table) localStorage.setItem('nextspeed_vvt_table', data.vvt_table);
                if (data.failsafe_settings) localStorage.setItem('nextspeed_failsafe_settings', data.failsafe_settings);
                if (data.features_settings) localStorage.setItem('nextspeed_features_settings', data.features_settings);
                if (data.accessories_settings) localStorage.setItem('nextspeed_accessories_settings', data.accessories_settings);
                alert('バックアップを復元しました。ページをリロードして反映させます。');
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert('ファイルのインポートに失敗しました。');
            }
        };
        reader.readAsText(file);
    };

    /** USB接続ボタン押下 → ポート選択ダイアログ表示 */
    const handleSerialClick = async () => {
        await refreshPorts();
        setShowPortDialog(true);
    };

    /** ポート選択後に接続 */
    const handleConnect = async () => {
        if (!selectedPort) return;
        setShowPortDialog(false);
        await connectSerial(selectedPort, settings.baudRate);
    };

    /** モック接続 (デモ) */
    const handleMockConnect = async () => {
        setShowMockDialog(false);
        await connectMock(selectedEngine, ecuPreference);
    };

    useEffect(() => {
        const stored = localStorage.getItem('nextspeed_settings');
        if (stored) {
            try {
                setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
            } catch (e) {
                console.error('Failed to parse settings');
            }
        }
    }, []);

    const handleChange = useCallback((key: keyof AppSettings, value: string | number | boolean) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    const handleSave = () => {
        localStorage.setItem('nextspeed_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className={styles.page}>
            <section className={styles.headerSection}>
                <h1 className={styles.pageTitle}>{t('settings.title')}</h1>
                <p className={styles.pageDesc}>{t('settings.desc')}</p>
                <div>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {saved ? t('settings.saved') : t('settings.save')}
                    </button>
                </div>
            </section>

            <div className={styles.grid}>
                {/* ===== 1. アプリケーション設定 ===== */}
                <CollapsibleCard icon="⚙️" title={t('settings.appSettings')} defaultOpen={true}>
                    <div className={styles.formGroup}>
                        <label>{t('settings.language')}</label>
                        <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
                            <option value="ja">{t('settings.languageJa')}</option>
                            <option value="en">{t('settings.languageEn')}</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('setup.ecuType')}</label>
                        <select value={ecuPreference} onChange={(e) => setEcuPreference(e.target.value as EcuType)}>
                            <option value="rusefi">RusEFI</option>
                            <option value="speeduino">Speeduino</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('settings.units')}</label>
                        <select value={settings.units} onChange={(e) => handleChange('units', e.target.value)}>
                            <option value="metric">{t('settings.metric')}</option>
                            <option value="imperial">{t('settings.imperial')}</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('settings.baudRate')}</label>
                        <select value={settings.baudRate} onChange={(e) => handleChange('baudRate', Number(e.target.value))}>
                            <option value={9600}>9600</option>
                            <option value={19200}>19200</option>
                            <option value={38400}>38400</option>
                            <option value={57600}>57600</option>
                            <option value={115200}>115200</option>
                        </select>
                    </div>
                </CollapsibleCard>

                {/* ===== 2. ECU 基本設定 ===== */}
                <CollapsibleCard icon="🔧" title={t('settings.ecuSettings')} defaultOpen={true}>
                    <p className={styles.cardSub}>{t('settings.ecuSettingsNote')}</p>
                    <div className={styles.formGroup}>
                        <label>{t('settings.displacement')}</label>
                        <input type="number" step="100" value={settings.engineDisplacement} onChange={(e) => handleChange('engineDisplacement', Number(e.target.value))} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('settings.cylinders')}</label>
                        <input type="number" min="1" max="12" value={settings.cylinders} onChange={(e) => handleChange('cylinders', Number(e.target.value))} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>{t('settings.injectorSize')}</label>
                        <input type="number" step="50" value={settings.injectorSize} onChange={(e) => handleChange('injectorSize', Number(e.target.value))} />
                    </div>

                    {/* ===== 接続コントローラー ===== */}
                    <div className={styles.subSection}>
                        <h3 className={styles.subSectionTitle}>接続管理</h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {status === 'disconnected' ? (
                                <>
                                    <button className={`${styles.btn} ${styles.primary}`} onClick={handleSerialClick}>
                                        <span className={styles.btnIcon}>🔌</span> {t('header.usbConnect')}
                                    </button>
                                    <button className={`${styles.btn} ${styles.secondary}`} onClick={() => setShowMockDialog(true)}>
                                        <span className={styles.btnIcon}>🎮</span> {t('header.mockConnect')}
                                    </button>
                                </>
                            ) : status === 'connecting' ? (
                                <button className={styles.btn} disabled>{t('header.connecting')}</button>
                            ) : (
                                <>
                                    <button className={`${styles.btn} ${styles.danger}`} onClick={() => disconnect()}>
                                        {t('header.disconnect')}
                                    </button>
                                    {isMock && (
                                        <button className={`${styles.btn} ${styles.secondary}`} onClick={triggerDragRace}>
                                            {t('header.triggerDragRace')}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </CollapsibleCard>

                {/* ===== データ管理 ===== */}
                <CollapsibleCard icon="💾" title="データ管理" defaultOpen={true}>
                    <p className={styles.cardSub}>チューニングマップを含むすべての設定データをバックアップまたは復元できます。</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <button className={`${styles.btn} ${styles.primary}`} onClick={handleExport}>
                            エクスポート (保存)
                        </button>
                        <label className={`${styles.btn} ${styles.secondary}`} style={{ cursor: 'pointer', margin: 0 }}>
                            インポート (読込)
                            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                        </label>
                    </div>
                </CollapsibleCard>

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
                                        <select className={styles.select} value={selectedPort} onChange={(e) => setSelectedPort(e.target.value)}>
                                            {ports.map((p) => (
                                                <option key={p.path} value={p.path}>
                                                    {p.path} {p.manufacturer ? `(${p.manufacturer})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </>
                            )}
                            <p className={styles.cardSub} style={{ marginTop: '8px' }}>※ボーレートは「アプリケーション設定」の値を参照します。</p>
                        </div>
                        <div className={styles.dialogActions}>
                            <button className={`${styles.btn} ${styles.secondary}`} onClick={() => setShowPortDialog(false)}>{t('header.portDialog.cancel')}</button>
                            <button className={`${styles.btn} ${styles.primary}`} onClick={handleConnect} disabled={!selectedPort || ports.length === 0}>{t('header.portDialog.connect')}</button>
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
                                <select className={styles.select} value={selectedEngine} onChange={(e) => setSelectedEngine(e.target.value as EngineProfileId)}>
                                    <option value="i4_turbo">Inline-4 2.0L Turbo</option>
                                    <option value="v6_twinturbo">V6 3.8L Twin Turbo</option>
                                    <option value="v8_na">V8 6.2L NA OHV</option>
                                </select>
                            </label>
                        </div>
                        <div className={styles.dialogActions}>
                            <button className={`${styles.btn} ${styles.secondary}`} onClick={() => setShowMockDialog(false)}>{t('header.mockDialog.cancel')}</button>
                            <button className={`${styles.btn} ${styles.primary}`} onClick={handleMockConnect}>{t('header.mockDialog.connect')}</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
