'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
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

    // アクセサリ
    fanOnTemp: number;
    fanOffTemp: number;
    fanHysteresis: number;
    fuelPumpPrime: number;
    tachoEnabled: boolean;
    nitrousEnabled: boolean;
    acControlEnabled: boolean;
    acLowRpm: number;
}

const DEFAULT_SETTINGS: AppSettings = {
    units: 'metric',
    baudRate: 115200,
    engineDisplacement: 2000,
    cylinders: 4,
    injectorSize: 550,

    fanOnTemp: 95,
    fanOffTemp: 90,
    fanHysteresis: 3,
    fuelPumpPrime: 3,
    tachoEnabled: false,
    nitrousEnabled: false,
    acControlEnabled: false,
    acLowRpm: 800,
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
                </CollapsibleCard>



                {/* ===== 11. アクセサリ ===== */}
                <CollapsibleCard icon="🔌" title={t('settings.accessories')}>
                    <div className={styles.subSection} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                        <h3 className={styles.subSectionTitle}>🌀 ファン制御</h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>{t('settings.fanOnTemp')}</label>
                                <input type="number" step="1" value={settings.fanOnTemp} onChange={(e) => handleChange('fanOnTemp', Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('settings.fanOffTemp')}</label>
                                <input type="number" step="1" value={settings.fanOffTemp} onChange={(e) => handleChange('fanOffTemp', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.fanHysteresis')}</label>
                            <input type="number" step="1" value={settings.fanHysteresis} onChange={(e) => handleChange('fanHysteresis', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className={styles.subSection}>
                        <h3 className={styles.subSectionTitle}>⛽ 燃料ポンプ</h3>
                        <div className={styles.formGroup}>
                            <label>{t('settings.fuelPumpPrime')}</label>
                            <input type="number" step="1" value={settings.fuelPumpPrime} onChange={(e) => handleChange('fuelPumpPrime', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className={styles.subSection}>
                        <h3 className={styles.subSectionTitle}>その他出力</h3>
                        <Toggle label={t('settings.tachoEnabled')} checked={settings.tachoEnabled} onChange={(v) => handleChange('tachoEnabled', v)} />
                        <Toggle label={t('settings.nitrousEnabled')} checked={settings.nitrousEnabled} onChange={(v) => handleChange('nitrousEnabled', v)} />
                        <Toggle label={t('settings.acControlEnabled')} checked={settings.acControlEnabled} onChange={(v) => handleChange('acControlEnabled', v)} />
                        <div className={styles.formGroup}>
                            <label>{t('settings.acLowRpm')}</label>
                            <input type="number" step="100" value={settings.acLowRpm} onChange={(e) => handleChange('acLowRpm', Number(e.target.value))} />
                        </div>
                    </div>
                </CollapsibleCard>


            </div>
        </div>
    );
}
