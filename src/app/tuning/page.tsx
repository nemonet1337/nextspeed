'use client';

import { useState, useCallback } from 'react';
import TuningTable from '../../components/Tuning/TuningTable';
import { getEcuManager } from '../../lib/connection/ecu-manager';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './page.module.css';

// サンプルVEマップ
const defaultRpmBins = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000];
const defaultMapBins = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 130, 150, 180, 200, 230, 250];

function generateVeMap(): number[][] {
    return defaultMapBins.map((mapVal) =>
        defaultRpmBins.map((rpm) => {
            const base = 30 + (mapVal / 250) * 55 + (rpm / 7000) * 15;
            return Math.round(base * 10) / 10;
        }),
    );
}

function generateIgnMap(): number[][] {
    return defaultMapBins.map((mapVal) =>
        defaultRpmBins.map((rpm) => {
            const base = 10 + (rpm / 7000) * 25 - (mapVal / 250) * 8;
            return Math.round(base * 10) / 10;
        }),
    );
}

type TableId = 've' | 'ign';

export default function TuningPage() {
    const [activeTable, setActiveTable] = useState<TableId>('ve');
    const [veData, setVeData] = useState(generateVeMap);
    const [ignData, setIgnData] = useState(generateIgnMap);
    const { t } = useTranslation();

    const handleVeChange = useCallback((row: number, col: number, value: number) => {
        setVeData((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] = value;
            return next;
        });
    }, []);

    const handleIgnChange = useCallback((row: number, col: number, value: number) => {
        setIgnData((prev) => {
            const next = prev.map((r) => [...r]);
            next[row][col] = value;
            return next;
        });
    }, []);

    const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

    const handleBurn = async () => {
        try {
            const encoder = new TextEncoder();
            await getEcuManager().write(encoder.encode('W'));
            alert(t('tuning.burnSuccess'));
        } catch (e) {
            alert(t('tuning.commError') + e);
        }
    };

    const handleRead = async () => {
        try {
            const encoder = new TextEncoder();
            await getEcuManager().write(encoder.encode('R'));
            alert(t('tuning.readSuccess'));
        } catch (e) {
            alert(t('tuning.commError') + e);
        }
    };

    const handleSaveFile = async () => {
        if (!isElectron) {
            alert(t('tuning.electronOnly'));
            return;
        }

        const dataToSave = {
            veMap: veData,
            ignMap: ignData
        };

        try {
            const success = await window.electronAPI!.file.save(
                JSON.stringify(dataToSave, null, 2),
                'nextspeed_tune.json'
            );
            if (success) {
                alert(t('tuning.saveSuccess'));
            }
        } catch (e) {
            alert(t('tuning.saveFailed') + e);
        }
    };

    const handleLoadFile = async () => {
        if (!isElectron) {
            alert(t('tuning.electronOnlyLoad'));
            return;
        }

        try {
            const fileContent = await window.electronAPI!.file.open();
            if (fileContent) {
                const parsed = JSON.parse(fileContent);
                if (parsed.veMap && Array.isArray(parsed.veMap)) {
                    setVeData(parsed.veMap);
                }
                if (parsed.ignMap && Array.isArray(parsed.ignMap)) {
                    setIgnData(parsed.ignMap);
                }
                alert(t('tuning.loadSuccess'));
            }
        } catch (e) {
            alert(t('tuning.loadFailed') + e);
        }
    };

    return (
        <div className={styles.tuning}>
            <section className={styles.heroSection}>
                <h1 className={styles.pageTitle}>{t('tuning.title')}</h1>
                <p className={styles.pageDesc}>
                    {t('tuning.desc')}
                </p>
            </section>

            {/* タブ切り替え */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTable === 've' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTable('ve')}
                >
                    {t('tuning.veTab')}
                </button>
                <button
                    className={`${styles.tab} ${activeTable === 'ign' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTable('ign')}
                >
                    {t('tuning.ignTab')}
                </button>
            </div>

            {/* テーブル表示 */}
            {activeTable === 've' && (
                <TuningTable
                    name={t('tuning.veTableName')}
                    xBins={defaultRpmBins}
                    yBins={defaultMapBins}
                    xLabel="RPM"
                    yLabel="MAP"
                    xUnit="rpm"
                    yUnit="kPa"
                    valueUnit="%"
                    data={veData}
                    onChange={handleVeChange}
                />
            )}

            {activeTable === 'ign' && (
                <TuningTable
                    name={t('tuning.ignTableName')}
                    xBins={defaultRpmBins}
                    yBins={defaultMapBins}
                    xLabel="RPM"
                    yLabel="MAP"
                    xUnit="rpm"
                    yUnit="kPa"
                    valueUnit="°"
                    data={ignData}
                    onChange={handleIgnChange}
                />
            )}

            {/* 操作ボタン */}
            <div className={styles.actions}>
                <button className={`${styles.actionBtn} ${styles.burnBtn}`} onClick={handleBurn}>
                    {t('tuning.burn')}
                </button>
                <button className={styles.actionBtn} onClick={handleRead}>
                    {t('tuning.read')}
                </button>
                <button className={styles.actionBtn} onClick={handleSaveFile}>
                    {t('tuning.saveFile')}
                </button>
                <button className={styles.actionBtn} onClick={handleLoadFile}>
                    {t('tuning.loadFile')}
                </button>
            </div>
        </div>
    );
}
