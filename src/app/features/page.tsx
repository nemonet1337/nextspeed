'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../settings/page.module.css';

// ===== 便利機能設定の型 =====
interface FeaturesSettings {
    // ローンチコントロール
    launchEnabled: boolean;
    launchRpm: number;
    launchRetard: number;
    launchBoostCut: boolean;
    // フラットシフト
    flatShiftEnabled: boolean;
    flatShiftRpmDrop: number;
    // オートブリッピング
    autoBlipEnabled: boolean;
    autoBlipDuration: number;
    // フレックスフューエル
    flexFuelEnabled: boolean;
    flexSensorEnabled: boolean;
    flexE0Afr: number;
    flexE85Afr: number;
}

const DEFAULT_FEATURES: FeaturesSettings = {
    launchEnabled: false,
    launchRpm: 4000,
    launchRetard: 15,
    launchBoostCut: false,
    flatShiftEnabled: false,
    flatShiftRpmDrop: 300,
    autoBlipEnabled: false,
    autoBlipDuration: 200,
    flexFuelEnabled: false,
    flexSensorEnabled: false,
    flexE0Afr: 14.7,
    flexE85Afr: 9.8,
};

// ===== トグルコンポーネント =====
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className={styles.toggleGroup}>
            <span className={styles.toggleLabel}>{label}</span>
            <label className={styles.toggle}>
                <input type="checkbox" className={styles.toggleInput} checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <span className={styles.toggleSlider} />
            </label>
        </div>
    );
}

// ===== 折りたたみカードコンポーネント =====
function CollapsibleCard({
    icon, title, defaultOpen = false, children,
}: { icon: string; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
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
            <div className={`${styles.cardBody} ${isOpen ? styles.cardBodyOpen : ''}`}>{children}</div>
        </section>
    );
}

export default function FeaturesPage() {
    const [settings, setSettings] = useState<FeaturesSettings>(DEFAULT_FEATURES);
    const [saved, setSaved] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const stored = localStorage.getItem('nextspeed_features');
        if (stored) {
            try { setSettings((prev) => ({ ...prev, ...JSON.parse(stored) })); } catch { /* ignore */ }
        }
    }, []);

    const handleChange = useCallback((key: keyof FeaturesSettings, value: string | number | boolean) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    const handleSave = () => {
        localStorage.setItem('nextspeed_features', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className={styles.page}>
            <section className={styles.headerSection}>
                <h1 className={styles.pageTitle}>{t('settings.convenienceFeatures')}</h1>
                <p className={styles.pageDesc}>
                    ローンチコントロール、フラットシフト、オートブリッピングなどの便利機能を設定します。
                </p>
                <div>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {saved ? t('settings.saved') : t('settings.save')}
                    </button>
                </div>
            </section>

            <div className={styles.grid}>
                {/* ローンチコントロール */}
                <CollapsibleCard icon="🚦" title={t('settings.launchControl')} defaultOpen={true}>
                    <Toggle label={t('settings.launchEnabled')} checked={settings.launchEnabled} onChange={(v) => handleChange('launchEnabled', v)} />
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>{t('settings.launchRpm')}</label>
                            <input type="number" step="100" value={settings.launchRpm} onChange={(e) => handleChange('launchRpm', Number(e.target.value))} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.launchRetard')}</label>
                            <input type="number" step="1" value={settings.launchRetard} onChange={(e) => handleChange('launchRetard', Number(e.target.value))} />
                        </div>
                    </div>
                    <Toggle label={t('settings.launchBoostCut')} checked={settings.launchBoostCut} onChange={(v) => handleChange('launchBoostCut', v)} />
                </CollapsibleCard>

                {/* フラットシフト */}
                <CollapsibleCard icon="⚡" title={t('settings.flatShift')} defaultOpen={true}>
                    <Toggle label={t('settings.flatShiftEnabled')} checked={settings.flatShiftEnabled} onChange={(v) => handleChange('flatShiftEnabled', v)} />
                    <div className={styles.formGroup}>
                        <label>{t('settings.flatShiftRpmDrop')}</label>
                        <input type="number" step="50" value={settings.flatShiftRpmDrop} onChange={(e) => handleChange('flatShiftRpmDrop', Number(e.target.value))} />
                    </div>
                </CollapsibleCard>

                {/* オートブリッピング */}
                <CollapsibleCard icon="🔄" title={t('settings.autoBlip')} defaultOpen={true}>
                    <Toggle label={t('settings.autoBlipEnabled')} checked={settings.autoBlipEnabled} onChange={(v) => handleChange('autoBlipEnabled', v)} />
                    <div className={styles.formGroup}>
                        <label>{t('settings.autoBlipDuration')}</label>
                        <input type="number" step="50" value={settings.autoBlipDuration} onChange={(e) => handleChange('autoBlipDuration', Number(e.target.value))} />
                    </div>
                </CollapsibleCard>

                {/* フレックスフューエル */}
                <CollapsibleCard icon="🌽" title={t('settings.flexFuel')} defaultOpen={true}>
                    <Toggle label={t('settings.flexFuelEnabled')} checked={settings.flexFuelEnabled} onChange={(v) => handleChange('flexFuelEnabled', v)} />
                    <Toggle label={t('settings.flexSensorEnabled')} checked={settings.flexSensorEnabled} onChange={(v) => handleChange('flexSensorEnabled', v)} />
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>{t('settings.flexE0Afr')}</label>
                            <input type="number" step="0.1" value={settings.flexE0Afr} onChange={(e) => handleChange('flexE0Afr', Number(e.target.value))} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.flexE85Afr')}</label>
                            <input type="number" step="0.1" value={settings.flexE85Afr} onChange={(e) => handleChange('flexE85Afr', Number(e.target.value))} />
                        </div>
                    </div>
                </CollapsibleCard>
            </div>
        </div>
    );
}
