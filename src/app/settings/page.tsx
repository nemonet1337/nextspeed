'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n';
import type { EcuType } from '../../lib/types/ecu';
import styles from './page.module.css';

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

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);
    const { t } = useTranslation();
    const { locale, setLocale, ecuPreference, setEcuPreference } = useLanguage();

    useEffect(() => {
        const stored = localStorage.getItem('nextspeed_settings');
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse settings');
            }
        }
    }, []);

    const handleChange = (key: keyof AppSettings, value: string | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem('nextspeed_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className={styles.page}>
            <section className={styles.headerSection}>
                <h1 className={styles.pageTitle}>{t('settings.title')}</h1>
                <p className={styles.pageDesc}>
                    {t('settings.desc')}
                </p>
                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {saved ? t('settings.saved') : t('settings.save')}
                    </button>
                </div>
            </section>

            <div className={styles.grid}>
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>{t('settings.appSettings')}</h2>

                    <div className={styles.formGroup}>
                        <label>{t('settings.language')}</label>
                        <select
                            value={locale}
                            onChange={(e) => setLocale(e.target.value as Locale)}
                        >
                            <option value="ja">{t('settings.languageJa')}</option>
                            <option value="en">{t('settings.languageEn')}</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('setup.ecuType')}</label>
                        <select
                            value={ecuPreference}
                            onChange={(e) => setEcuPreference(e.target.value as EcuType)}
                        >
                            <option value="rusefi">RusEFI</option>
                            <option value="speeduino">Speeduino</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('settings.units')}</label>
                        <select
                            value={settings.units}
                            onChange={(e) => handleChange('units', e.target.value)}
                        >
                            <option value="metric">{t('settings.metric')}</option>
                            <option value="imperial">{t('settings.imperial')}</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('settings.baudRate')}</label>
                        <select
                            value={settings.baudRate}
                            onChange={(e) => handleChange('baudRate', Number(e.target.value))}
                        >
                            <option value={9600}>9600</option>
                            <option value={19200}>19200</option>
                            <option value={38400}>38400</option>
                            <option value={57600}>57600</option>
                            <option value={115200}>115200</option>
                        </select>
                    </div>
                </section>

                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>{t('settings.ecuSettings')}</h2>
                    <p className={styles.cardSub}>{t('settings.ecuSettingsNote')}</p>

                    <div className={styles.formGroup}>
                        <label>{t('settings.displacement')}</label>
                        <input
                            type="number"
                            step="100"
                            value={settings.engineDisplacement}
                            onChange={(e) => handleChange('engineDisplacement', Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('settings.cylinders')}</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={settings.cylinders}
                            onChange={(e) => handleChange('cylinders', Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('settings.injectorSize')}</label>
                        <input
                            type="number"
                            step="50"
                            value={settings.injectorSize}
                            onChange={(e) => handleChange('injectorSize', Number(e.target.value))}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
