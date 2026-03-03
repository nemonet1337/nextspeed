'use client';

import { useState, useEffect } from 'react';
import { useEcu } from '../../hooks/useEcu';
import { useTranslation } from '../../hooks/useTranslation';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import styles from './page.module.css';

const MAX_HISTORY = 100;

export default function LogsPage() {
    const { status, sensorData } = useEcu();
    const { t, locale } = useTranslation();
    const isConnected = status === 'connected';

    const [history, setHistory] = useState<any[]>([]);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (!isConnected || paused) return;

        setHistory((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.timestamp === sensorData.timestamp) {
                return prev;
            }

            const timeLocale = locale === 'ja' ? 'ja-JP' : 'en-US';
            const newData = {
                time: new Date(sensorData.timestamp).toLocaleTimeString(timeLocale, { hour12: false, fractionalSecondDigits: 1 } as any),
                rpm: sensorData.rpm,
                map: sensorData.map,
                tps: sensorData.tps,
                afr: sensorData.afr,
                timestamp: sensorData.timestamp,
            };

            const next = [...prev, newData];
            if (next.length > MAX_HISTORY) {
                next.shift();
            }
            return next;
        });
    }, [sensorData, isConnected, paused, locale]);

    const handleClear = () => setHistory([]);
    const handleTogglePause = () => setPaused(!paused);

    const handleExport = async () => {
        if (history.length === 0) return;

        const csvRows = ['Time,RPM,MAP,TPS,AFR'];
        for (const r of history) {
            csvRows.push(`${r.time},${r.rpm},${r.map},${r.tps},${r.afr}`);
        }
        const csvString = csvRows.join('\n');

        const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
        if (isElectron) {
            try {
                const success = await window.electronAPI!.file.save(csvString, 'nextspeed_datalog.csv');
                if (success) alert(t('logs.exportSuccess'));
            } catch (e) {
                alert(t('logs.exportFailed'));
            }
        } else {
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nextspeed_datalog.csv';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className={styles.page}>
            <section className={styles.headerSection}>
                <h1 className={styles.pageTitle}>{t('logs.title')}</h1>
                <p className={styles.pageDesc}>
                    {t('logs.desc')}
                </p>
                <div className={styles.controls}>
                    <button className={styles.actionBtn} onClick={handleTogglePause}>
                        {paused ? t('logs.resume') : t('logs.pause')}
                    </button>
                    <button className={styles.actionBtn} onClick={handleClear}>
                        {t('logs.clear')}
                    </button>
                    <button className={styles.actionBtn} onClick={handleExport}>
                        {t('logs.export')}
                    </button>
                </div>
            </section>

            <section className={styles.chartSection}>
                {history.length === 0 && (
                    <div className={styles.emptyState}>
                        {isConnected ? t('logs.waiting') : t('logs.connectPrompt')}
                    </div>
                )}

                {history.length > 0 && (
                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart data={history} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="time" stroke="#aaa" />
                            <YAxis yAxisId="rpmId" orientation="left" stroke="#00e5ff" domain={[0, 8000]} />
                            <YAxis yAxisId="valId" orientation="right" stroke="#e0e0e0" domain={[0, 200]} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#4caf50' }} />
                            <Legend />
                            <Line yAxisId="rpmId" type="monotone" dataKey="rpm" name="RPM" stroke="#00e5ff" dot={false} isAnimationActive={false} />
                            <Line yAxisId="valId" type="monotone" dataKey="map" name="MAP (kPa)" stroke="#ff9800" dot={false} isAnimationActive={false} />
                            <Line yAxisId="valId" type="monotone" dataKey="tps" name="TPS (%)" stroke="#4caf50" dot={false} isAnimationActive={false} />
                            <Line yAxisId="valId" type="monotone" dataKey="afr" name="AFR" stroke="#9c27b0" dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </section>
        </div>
    );
}
