'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../settings/page.module.css';

// ===== フェイルセーフ設定の型 =====
interface FailsafeSettings {
    // 燃料カット・保護
    dfcoEnableRpm: number;
    dfcoRecoverRpm: number;
    dfcoTpsThreshold: number;
    softRevLimit: number;
    hardRevLimit: number;
    revLimitMode: 'fuel' | 'ign' | 'both';
    // 始動・暖機補正
    crankingRpm: number;
    crankingEnrichment: number;
    primingPulse: number;
    warmupEnrichment: number;
    asePercent: number;
    aseDuration: number;
    aePercent: number;
    // フェイルセーフ温度
    maxCltWarning: number;
    maxCltCut: number;
    maxIat: number;
    maxOilTemp: number;
    minOilPressure: number;
    minBatteryV: number;
}

const DEFAULT_FAILSAFE: FailsafeSettings = {
    dfcoEnableRpm: 2500,
    dfcoRecoverRpm: 2000,
    dfcoTpsThreshold: 2,
    softRevLimit: 6500,
    hardRevLimit: 7000,
    revLimitMode: 'fuel',
    crankingRpm: 300,
    crankingEnrichment: 200,
    primingPulse: 5,
    warmupEnrichment: 150,
    asePercent: 120,
    aseDuration: 10,
    aePercent: 50,
    maxCltWarning: 100,
    maxCltCut: 110,
    maxIat: 60,
    maxOilTemp: 130,
    minOilPressure: 100,
    minBatteryV: 11.0,
};

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

export default function FailsafePage() {
    const [settings, setSettings] = useState<FailsafeSettings>(DEFAULT_FAILSAFE);
    const [saved, setSaved] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const stored = localStorage.getItem('nextspeed_failsafe');
        if (stored) {
            try { setSettings((prev) => ({ ...prev, ...JSON.parse(stored) })); } catch { /* ignore */ }
        }
    }, []);

    const handleChange = useCallback((key: keyof FailsafeSettings, value: string | number) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    const handleSave = () => {
        localStorage.setItem('nextspeed_failsafe', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className={styles.page}>
            <section className={styles.headerSection}>
                <h1 className={styles.pageTitle}>{t('settings.failsafe')}</h1>
                <p className={styles.pageDesc}>{t('settings.failsafeNote')}</p>
                <div>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {saved ? t('settings.saved') : t('settings.save')}
                    </button>
                </div>
            </section>

            <div className={styles.grid}>
                {/* 始動・暖機補正 */}
                <CollapsibleCard icon="🌡️" title={t('settings.startupEnrich')} defaultOpen={true}>
                    <div className={styles.subSection} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                        <h3 className={styles.subSectionTitle}>クランキング・始動前</h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>{t('settings.crankingRpm')}</label>
                                <input type="number" step="50" value={settings.crankingRpm} onChange={(e) => handleChange('crankingRpm', Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('settings.primingPulse')}</label>
                                <input type="number" step="0.5" value={settings.primingPulse} onChange={(e) => handleChange('primingPulse', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.crankingEnrich')}</label>
                            <input type="number" step="5" value={settings.crankingEnrichment} onChange={(e) => handleChange('crankingEnrichment', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className={styles.subSection}>
                        <h3 className={styles.subSectionTitle}>暖機・始動後補正 (ASE)</h3>
                        <div className={styles.formGroup}>
                            <label>{t('settings.warmupEnrich')}</label>
                            <input type="number" step="5" value={settings.warmupEnrichment} onChange={(e) => handleChange('warmupEnrichment', Number(e.target.value))} />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>{t('settings.asePercent')}</label>
                                <input type="number" step="5" value={settings.asePercent} onChange={(e) => handleChange('asePercent', Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('settings.aseDuration')}</label>
                                <input type="number" step="1" value={settings.aseDuration} onChange={(e) => handleChange('aseDuration', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.aePercent')}</label>
                            <input type="number" step="5" value={settings.aePercent} onChange={(e) => handleChange('aePercent', Number(e.target.value))} />
                        </div>
                    </div>
                </CollapsibleCard>

                {/* 燃料カット・保護 */}
                <CollapsibleCard icon="🛡️" title={t('settings.fuelCutProtection')} defaultOpen={true}>
                    <div className={styles.subSection} style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                        <h3 className={styles.subSectionTitle}>DFCO (減速時燃料カット)</h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>{t('settings.dfcoEnableRpm')}</label>
                                <input type="number" step="100" value={settings.dfcoEnableRpm} onChange={(e) => handleChange('dfcoEnableRpm', Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('settings.dfcoRecoverRpm')}</label>
                                <input type="number" step="100" value={settings.dfcoRecoverRpm} onChange={(e) => handleChange('dfcoRecoverRpm', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.dfcoTpsThreshold')}</label>
                            <input type="number" step="1" value={settings.dfcoTpsThreshold} onChange={(e) => handleChange('dfcoTpsThreshold', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className={styles.subSection}>
                        <h3 className={styles.subSectionTitle}>レブリミット</h3>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>{t('settings.softRevLimit')}</label>
                                <input type="number" step="100" value={settings.softRevLimit} onChange={(e) => handleChange('softRevLimit', Number(e.target.value))} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>{t('settings.hardRevLimit')}</label>
                                <input type="number" step="100" value={settings.hardRevLimit} onChange={(e) => handleChange('hardRevLimit', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.revLimitMode')}</label>
                            <select value={settings.revLimitMode} onChange={(e) => handleChange('revLimitMode', e.target.value)}>
                                <option value="fuel">{t('settings.revLimitFuelCut')}</option>
                                <option value="ign">{t('settings.revLimitIgnCut')}</option>
                                <option value="both">{t('settings.revLimitBoth')}</option>
                            </select>
                        </div>
                    </div>
                </CollapsibleCard>

                {/* フェイルセーフ温度設定 */}
                <CollapsibleCard icon="🚨" title={t('settings.failsafe')} defaultOpen={true}>
                    <p className={styles.cardSub}>{t('settings.failsafeNote')}</p>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>{t('settings.maxCltWarning')}</label>
                            <input type="number" step="5" value={settings.maxCltWarning} onChange={(e) => handleChange('maxCltWarning', Number(e.target.value))} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.maxCltCut')}</label>
                            <input type="number" step="5" value={settings.maxCltCut} onChange={(e) => handleChange('maxCltCut', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>{t('settings.maxIat')}</label>
                            <input type="number" step="5" value={settings.maxIat} onChange={(e) => handleChange('maxIat', Number(e.target.value))} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.maxOilTemp')}</label>
                            <input type="number" step="5" value={settings.maxOilTemp} onChange={(e) => handleChange('maxOilTemp', Number(e.target.value))} />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>{t('settings.minOilPressure')}</label>
                            <input type="number" step="10" value={settings.minOilPressure} onChange={(e) => handleChange('minOilPressure', Number(e.target.value))} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>{t('settings.minBatteryV')}</label>
                            <input type="number" step="0.5" value={settings.minBatteryV} onChange={(e) => handleChange('minBatteryV', Number(e.target.value))} />
                        </div>
                    </div>
                </CollapsibleCard>
            </div>
        </div>
    );
}
