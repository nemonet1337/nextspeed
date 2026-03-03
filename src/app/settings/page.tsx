'use client';

import { useState, useEffect } from 'react';
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
                <h1 className={styles.pageTitle}>設定</h1>
                <p className={styles.pageDesc}>
                    接続設定、表示設定、ECU パラメータの詳細設定を行います。
                </p>
                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {saved ? '✓ 保存しました' : '💾 設定を保存'}
                    </button>
                </div>
            </section>

            <div className={styles.grid}>
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>アプリケーション設定</h2>

                    <div className={styles.formGroup}>
                        <label>単位系</label>
                        <select
                            value={settings.units}
                            onChange={(e) => handleChange('units', e.target.value)}
                        >
                            <option value="metric">メートル法 (℃, kPa)</option>
                            <option value="imperial">ヤード・ポンド法 (℉, PSI)</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>デフォルトボーレート</label>
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
                    <h2 className={styles.cardTitle}>ECU 基本設定 (デモ)</h2>
                    <p className={styles.cardSub}>※ 実際のECUへの書き込みは未実装です</p>

                    <div className={styles.formGroup}>
                        <label>排気量 (cc)</label>
                        <input
                            type="number"
                            step="100"
                            value={settings.engineDisplacement}
                            onChange={(e) => handleChange('engineDisplacement', Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>気筒数</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={settings.cylinders}
                            onChange={(e) => handleChange('cylinders', Number(e.target.value))}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>インジェクターサイズ (cc/min)</label>
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
