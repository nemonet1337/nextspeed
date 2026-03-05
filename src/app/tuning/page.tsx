'use client';

import { useState, useCallback, useEffect } from 'react';
import TuningTable from '../../components/Tuning/TuningTable';
import { getEcuManager } from '../../lib/connection/ecu-manager';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './page.module.css';
import settingStyles from '../settings/page.module.css';

// ===== パラメータの型 =====
interface TuningParams {
    boostEnabled: boolean;
    boostMode: 'open' | 'closed';
    maxBoost: number;
    boostCutPoint: number;
    solenoidFreq: number;
    etbEnabled: boolean;
    pedalMin: number;
    pedalMax: number;
    throttleMin: number;
    throttleMax: number;
    etbPGain: number;
    etbIGain: number;
    etbDGain: number;
    vvtEnabled: boolean;
    vvtMode: 'onoff' | 'open' | 'closed';
    vvtMaxAdvance: number;
    vvtMinAdvance: number;
    vvtFreq: number;
    idleMode: 'stepper' | 'pwm' | 'etb';
    idleTargetWarm: number;
    idleTargetCold: number;
    iacMaxOpen: number;
    idleAdvance: number;
}

const DEFAULT_PARAMS: TuningParams = {
    boostEnabled: false,
    boostMode: 'open',
    maxBoost: 150,
    boostCutPoint: 180,
    solenoidFreq: 30,
    etbEnabled: false,
    pedalMin: 0,
    pedalMax: 1023,
    throttleMin: 0,
    throttleMax: 1023,
    etbPGain: 5.0,
    etbIGain: 0.1,
    etbDGain: 0.05,
    vvtEnabled: false,
    vvtMode: 'onoff',
    vvtMaxAdvance: 50,
    vvtMinAdvance: 0,
    vvtFreq: 300,
    idleMode: 'stepper',
    idleTargetWarm: 800,
    idleTargetCold: 1200,
    iacMaxOpen: 100,
    idleAdvance: 15,
};

// ===== トグル・カードコンポーネント =====
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className={settingStyles.toggleGroup}>
            <span className={settingStyles.toggleLabel}>{label}</span>
            <label className={settingStyles.toggle}>
                <input type="checkbox" className={settingStyles.toggleInput} checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <span className={settingStyles.toggleSlider} />
            </label>
        </div>
    );
}

function CollapsibleCard({ icon, title, defaultOpen = false, children }: { icon: string; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <section className={settingStyles.card}>
            <div className={settingStyles.cardHeader} onClick={() => setIsOpen((v) => !v)}>
                <div className={settingStyles.cardHeaderLeft}>
                    <span className={settingStyles.cardIcon}>{icon}</span>
                    <h2 className={settingStyles.cardTitle}>{title}</h2>
                </div>
                <span className={`${settingStyles.chevron} ${isOpen ? settingStyles.chevronOpen : ''}`}>▼</span>
            </div>
            <div className={`${settingStyles.cardBody} ${isOpen ? settingStyles.cardBodyOpen : ''}`}>{children}</div>
        </section>
    );
}

// ===== 軸定義 =====
const defaultRpmBins = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000];
const defaultMapBins = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 130, 150, 180, 200, 230, 250];
const defaultTpsBins = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];

// ===== マップ生成関数 =====
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

function generateAfrMap(): number[][] {
    return defaultMapBins.map((mapVal) =>
        defaultRpmBins.map((rpm) => {
            // 低負荷/低回転 = リーン、高負荷 = リッチ
            const base = 14.7 - (mapVal / 250) * 2.5 - (rpm / 7000) * 0.5;
            return Math.round(base * 10) / 10;
        }),
    );
}

function generateBoostMap(): number[][] {
    return defaultTpsBins.map((tps) =>
        defaultRpmBins.map((rpm) => {
            // TPS と RPM に応じたブースト目標 (kPa)
            const base = 100 + (tps / 100) * 80 + (rpm / 7000) * 20;
            return Math.round(base);
        }),
    );
}

function generateVvtMap(): number[][] {
    return defaultMapBins.map((mapVal) =>
        defaultRpmBins.map((rpm) => {
            // 中回転域で最大進角
            const rpmFactor = rpm < 3500 ? rpm / 3500 : 1 - (rpm - 3500) / 7000;
            const base = rpmFactor * 40 + (mapVal / 250) * 10;
            return Math.round(Math.min(50, Math.max(0, base)));
        }),
    );
}

// ===== タブ定義 =====
type TableId = 've' | 'ign' | 'afr' | 'boost' | 'vvt' | 'params';

export default function TuningPage() {
    const [activeTable, setActiveTable] = useState<TableId>('ve');
    const [veData, setVeData] = useState(generateVeMap);
    const [ignData, setIgnData] = useState(generateIgnMap);
    const [afrData, setAfrData] = useState(generateAfrMap);
    const [boostData, setBoostData] = useState(generateBoostMap);
    const [vvtData, setVvtData] = useState(generateVvtMap);
    const [params, setParams] = useState<TuningParams>(DEFAULT_PARAMS);
    const { t } = useTranslation();

    // 起動時に LocalStorage からパラメータを読み込む
    useEffect(() => {
        const stored = localStorage.getItem('nextspeed_tuning_params');
        if (stored) {
            try { setParams((prev) => ({ ...prev, ...JSON.parse(stored) })); } catch { /* ignore */ }
        }
    }, []);

    const handleParamChange = useCallback((key: keyof TuningParams, value: string | number | boolean) => {
        setParams((prev) => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('nextspeed_tuning_params', JSON.stringify(next));
            return next;
        });
    }, []);

    const createHandler = useCallback(
        (setter: React.Dispatch<React.SetStateAction<number[][]>>) =>
            (row: number, col: number, value: number) => {
                setter((prev) => {
                    const next = prev.map((r) => [...r]);
                    next[row][col] = value;
                    return next;
                });
            },
        [],
    );

    const handleVeChange = useCallback(createHandler(setVeData), [createHandler]);
    const handleIgnChange = useCallback(createHandler(setIgnData), [createHandler]);
    const handleAfrChange = useCallback(createHandler(setAfrData), [createHandler]);
    const handleBoostChange = useCallback(createHandler(setBoostData), [createHandler]);
    const handleVvtChange = useCallback(createHandler(setVvtData), [createHandler]);

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
            ignMap: ignData,
            afrMap: afrData,
            boostMap: boostData,
            vvtMap: vvtData,
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
                if (parsed.veMap && Array.isArray(parsed.veMap)) setVeData(parsed.veMap);
                if (parsed.ignMap && Array.isArray(parsed.ignMap)) setIgnData(parsed.ignMap);
                if (parsed.afrMap && Array.isArray(parsed.afrMap)) setAfrData(parsed.afrMap);
                if (parsed.boostMap && Array.isArray(parsed.boostMap)) setBoostData(parsed.boostMap);
                if (parsed.vvtMap && Array.isArray(parsed.vvtMap)) setVvtData(parsed.vvtMap);
                alert(t('tuning.loadSuccess'));
            }
        } catch (e) {
            alert(t('tuning.loadFailed') + e);
        }
    };

    // タブ定義
    const tabs: { id: TableId; label: string }[] = [
        { id: 've', label: t('tuning.veTab') },
        { id: 'ign', label: t('tuning.ignTab') },
        { id: 'afr', label: t('tuning.afrTab') },
        { id: 'boost', label: t('tuning.boostTab') },
        { id: 'vvt', label: t('tuning.vvtTab') },
        { id: 'params', label: t('tuning.paramsTab') },
    ];

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
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTable === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveTable(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
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

            {activeTable === 'afr' && (
                <TuningTable
                    name={t('tuning.afrTableName')}
                    xBins={defaultRpmBins}
                    yBins={defaultMapBins}
                    xLabel="RPM"
                    yLabel="MAP"
                    xUnit="rpm"
                    yUnit="kPa"
                    valueUnit="A/F"
                    data={afrData}
                    onChange={handleAfrChange}
                />
            )}

            {activeTable === 'boost' && (
                <TuningTable
                    name={t('tuning.boostTableName')}
                    xBins={defaultRpmBins}
                    yBins={defaultTpsBins}
                    xLabel="RPM"
                    yLabel="TPS"
                    xUnit="rpm"
                    yUnit="%"
                    valueUnit="kPa"
                    data={boostData}
                    onChange={handleBoostChange}
                />
            )}

            {activeTable === 'vvt' && (
                <TuningTable
                    name={t('tuning.vvtTableName')}
                    xBins={defaultRpmBins}
                    yBins={defaultMapBins}
                    xLabel="RPM"
                    yLabel="MAP"
                    xUnit="rpm"
                    yUnit="kPa"
                    valueUnit="°"
                    data={vvtData}
                    onChange={handleVvtChange}
                />
            )}

            {/* パラメータ設定タブ */}
            {activeTable === 'params' && (
                <div className={settingStyles.grid} style={{ marginTop: '20px' }}>
                    {/* ブースト制御 */}
                    <CollapsibleCard icon="🚀" title={t('settings.boostControl')} defaultOpen={true}>
                        <Toggle label={t('settings.boostEnabled')} checked={params.boostEnabled} onChange={(v) => handleParamChange('boostEnabled', v)} />
                        <div className={settingStyles.formGroup}>
                            <label>{t('settings.boostMode')}</label>
                            <select value={params.boostMode} onChange={(e) => handleParamChange('boostMode', e.target.value)}>
                                <option value="open">{t('settings.boostModeOpen')}</option>
                                <option value="closed">{t('settings.boostModeClosed')}</option>
                            </select>
                        </div>
                        <div className={settingStyles.formRow}>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.maxBoost')}</label>
                                <input type="number" step="5" value={params.maxBoost} onChange={(e) => handleParamChange('maxBoost', Number(e.target.value))} />
                            </div>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.boostCutPoint')}</label>
                                <input type="number" step="5" value={params.boostCutPoint} onChange={(e) => handleParamChange('boostCutPoint', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={settingStyles.formGroup}>
                            <label>{t('settings.solenoidFreq')}</label>
                            <input type="number" step="1" value={params.solenoidFreq} onChange={(e) => handleParamChange('solenoidFreq', Number(e.target.value))} />
                        </div>
                    </CollapsibleCard>

                    {/* 電子スロットル (ETB) */}
                    <CollapsibleCard icon="🎚️" title={t('settings.etbControl')}>
                        <Toggle label={t('settings.etbEnabled')} checked={params.etbEnabled} onChange={(v) => handleParamChange('etbEnabled', v)} />
                        <div className={settingStyles.formRow}>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.pedalMin')}</label>
                                <input type="number" value={params.pedalMin} onChange={(e) => handleParamChange('pedalMin', Number(e.target.value))} />
                            </div>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.pedalMax')}</label>
                                <input type="number" value={params.pedalMax} onChange={(e) => handleParamChange('pedalMax', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={settingStyles.formRow}>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.throttleMin')}</label>
                                <input type="number" value={params.throttleMin} onChange={(e) => handleParamChange('throttleMin', Number(e.target.value))} />
                            </div>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.throttleMax')}</label>
                                <input type="number" value={params.throttleMax} onChange={(e) => handleParamChange('throttleMax', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={settingStyles.subSection}>
                            <h3 className={settingStyles.subSectionTitle}>PID 設定</h3>
                            <div className={settingStyles.formRow}>
                                <div className={settingStyles.formGroup}>
                                    <label>{t('settings.etbPGain')}</label>
                                    <input type="number" step="0.1" value={params.etbPGain} onChange={(e) => handleParamChange('etbPGain', Number(e.target.value))} />
                                </div>
                                <div className={settingStyles.formGroup}>
                                    <label>{t('settings.etbIGain')}</label>
                                    <input type="number" step="0.01" value={params.etbIGain} onChange={(e) => handleParamChange('etbIGain', Number(e.target.value))} />
                                </div>
                            </div>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.etbDGain')}</label>
                                <input type="number" step="0.01" value={params.etbDGain} onChange={(e) => handleParamChange('etbDGain', Number(e.target.value))} />
                            </div>
                        </div>
                    </CollapsibleCard>

                    {/* VVT */}
                    <CollapsibleCard icon="🔄" title={t('settings.vvtControl')}>
                        <Toggle label={t('settings.vvtEnabled')} checked={params.vvtEnabled} onChange={(v) => handleParamChange('vvtEnabled', v)} />
                        <div className={settingStyles.formGroup}>
                            <label>{t('settings.vvtMode')}</label>
                            <select value={params.vvtMode} onChange={(e) => handleParamChange('vvtMode', e.target.value)}>
                                <option value="onoff">{t('settings.vvtModeOnOff')}</option>
                                <option value="open">{t('settings.vvtModeOpenLoop')}</option>
                                <option value="closed">{t('settings.vvtModeClosedLoop')}</option>
                            </select>
                        </div>
                        <div className={settingStyles.formRow}>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.vvtMaxAdvance')}</label>
                                <input type="number" value={params.vvtMaxAdvance} onChange={(e) => handleParamChange('vvtMaxAdvance', Number(e.target.value))} />
                            </div>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.vvtMinAdvance')}</label>
                                <input type="number" value={params.vvtMinAdvance} onChange={(e) => handleParamChange('vvtMinAdvance', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={settingStyles.formGroup}>
                            <label>{t('settings.vvtFreq')}</label>
                            <input type="number" step="10" value={params.vvtFreq} onChange={(e) => handleParamChange('vvtFreq', Number(e.target.value))} />
                        </div>
                    </CollapsibleCard>

                    {/* アイドル制御 */}
                    <CollapsibleCard icon="🅿️" title={t('settings.idleControl')}>
                        <div className={settingStyles.formGroup}>
                            <label>{t('settings.idleMode')}</label>
                            <select value={params.idleMode} onChange={(e) => handleParamChange('idleMode', e.target.value)}>
                                <option value="stepper">{t('settings.idleModeStepper')}</option>
                                <option value="pwm">{t('settings.idleModePWM')}</option>
                                <option value="etb">{t('settings.idleModeETB')}</option>
                            </select>
                        </div>
                        <div className={settingStyles.formRow}>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.idleTargetWarm')}</label>
                                <input type="number" step="50" value={params.idleTargetWarm} onChange={(e) => handleParamChange('idleTargetWarm', Number(e.target.value))} />
                            </div>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.idleTargetCold')}</label>
                                <input type="number" step="50" value={params.idleTargetCold} onChange={(e) => handleParamChange('idleTargetCold', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={settingStyles.formRow}>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.iacMaxOpen')}</label>
                                <input type="number" min="0" max="100" value={params.iacMaxOpen} onChange={(e) => handleParamChange('iacMaxOpen', Number(e.target.value))} />
                            </div>
                            <div className={settingStyles.formGroup}>
                                <label>{t('settings.idleAdvance')}</label>
                                <input type="number" value={params.idleAdvance} onChange={(e) => handleParamChange('idleAdvance', Number(e.target.value))} />
                            </div>
                        </div>
                    </CollapsibleCard>
                </div>
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
