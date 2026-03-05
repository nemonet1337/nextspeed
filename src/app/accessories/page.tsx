'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../settings/page.module.css';

// ===== 型定義 =====
interface AccessoriesSettings {
    fanOnTemp: number;
    fanOffTemp: number;
    fanHysteresis: number;
    fuelPumpPrime: number;
    tachoEnabled: boolean;
    nitrousEnabled: boolean;
    acControlEnabled: boolean;
    acLowRpm: number;
}

const DEFAULT_SETTINGS: AccessoriesSettings = {
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

export default function AccessoriesPage() {
    const [settings, setSettings] = useState<AccessoriesSettings>(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const stored = localStorage.getItem('nextspeed_accessories_settings');
        if (stored) {
            try {
                setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
            } catch (e) {
                console.error('Failed to parse accessories settings');
            }
        } else {
            // マイグレーション用：古いsettingsから読み込む（もしあれば）
            const oldStored = localStorage.getItem('nextspeed_settings');
            if (oldStored) {
                try {
                    const parsed = JSON.parse(oldStored);
                    const oldSettings: Partial<AccessoriesSettings> = {
                        fanOnTemp: parsed.fanOnTemp,
                        fanOffTemp: parsed.fanOffTemp,
                        fanHysteresis: parsed.fanHysteresis,
                        fuelPumpPrime: parsed.fuelPumpPrime,
                        tachoEnabled: parsed.tachoEnabled,
                        nitrousEnabled: parsed.nitrousEnabled,
                        acControlEnabled: parsed.acControlEnabled,
                        acLowRpm: parsed.acLowRpm,
                    };
                    // 未定義のプロパティをフィルタリング
                    Object.keys(oldSettings).forEach(k => {
                        if (oldSettings[k as keyof AccessoriesSettings] === undefined) {
                            delete oldSettings[k as keyof AccessoriesSettings];
                        }
                    });
                    if (Object.keys(oldSettings).length > 0) {
                        setSettings((prev) => ({ ...prev, ...oldSettings }));
                    }
                } catch (e) { }
            }
        }
    }, []);

    const handleChange = useCallback((key: keyof AccessoriesSettings, value: string | number | boolean) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    const handleSave = () => {
        localStorage.setItem('nextspeed_accessories_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className={styles.page}>
            <section className={styles.headerSection}>
                <h1 className={styles.pageTitle}>{t('settings.accessories')}</h1>
                <p className={styles.pageDesc}>ファン制御、燃料ポンプ、タコ出力などのアクセサリを設定します</p>
                <div>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {saved ? t('settings.saved') : t('settings.save')}
                    </button>
                </div>
            </section>

            <div className={styles.grid}>
                <CollapsibleCard icon="🔌" title={t('settings.accessories')} defaultOpen={true}>
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
