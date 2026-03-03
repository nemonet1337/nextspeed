'use client';

import { useState, useCallback } from 'react';
import TuningTable from '../../components/Tuning/TuningTable';
import { getEcuManager } from '../../lib/connection/ecu-manager';
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
            // ダミーのコマンド送信 (実際のマップ書き込みはページ単位の複雑なプロトコルが必要)
            const encoder = new TextEncoder();
            await getEcuManager().write(encoder.encode('W')); // 書き込みコマンド想定
            alert('ECUへ書き込み要求を送信しました。(デモ)');
        } catch (e) {
            alert('ECUとの通信エラー: ' + e);
        }
    };

    const handleRead = async () => {
        try {
            const encoder = new TextEncoder();
            await getEcuManager().write(encoder.encode('R')); // 読み出しコマンド想定
            alert('ECUへ読み込み要求を送信しました。(デモ)');
        } catch (e) {
            alert('ECUとの通信エラー: ' + e);
        }
    };

    const handleSaveFile = async () => {
        if (!isElectron) {
            alert('ファイル保存はElectron環境でのみサポートされています。');
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
                alert('チューニングデータを保存しました。');
            }
        } catch (e) {
            alert('保存に失敗しました: ' + e);
        }
    };

    const handleLoadFile = async () => {
        if (!isElectron) {
            alert('ファイル読み込みはElectron環境でのみサポートされています。');
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
                alert('チューニングデータを読み込みました。');
            }
        } catch (e) {
            alert('読み込みに失敗しました: ' + e);
        }
    };

    return (
        <div className={styles.tuning}>
            <section className={styles.heroSection}>
                <h1 className={styles.pageTitle}>チューニング</h1>
                <p className={styles.pageDesc}>
                    VE マップ・点火マップの閲覧と編集を行います。セルをクリックして値を変更できます。
                </p>
            </section>

            {/* タブ切り替え */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTable === 've' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTable('ve')}
                >
                    VE マップ (燃料)
                </button>
                <button
                    className={`${styles.tab} ${activeTable === 'ign' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTable('ign')}
                >
                    点火マップ
                </button>
            </div>

            {/* テーブル表示 */}
            {activeTable === 've' && (
                <TuningTable
                    name="VE テーブル (Volumetric Efficiency)"
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
                    name="点火マップ (Ignition Advance)"
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
                    🔥 ECU に書き込み (Burn)
                </button>
                <button className={styles.actionBtn} onClick={handleRead}>
                    📥 ECU から読み込み
                </button>
                <button className={styles.actionBtn} onClick={handleSaveFile}>
                    💾 ファイルに保存
                </button>
                <button className={styles.actionBtn} onClick={handleLoadFile}>
                    📂 ファイルから読み込み
                </button>
            </div>
        </div>
    );
}
