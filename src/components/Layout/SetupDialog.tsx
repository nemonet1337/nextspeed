'use client';

import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations, type Locale } from '../../i18n';
import type { EcuType } from '../../lib/types/ecu';
import styles from './SetupDialog.module.css';

export default function SetupDialog() {
    const { showSetup, completeSetup } = useLanguage();
    const [selectedLocale, setSelectedLocale] = useState<Locale>('ja');
    const [selectedEcu, setSelectedEcu] = useState<EcuType>('speeduino');

    if (!showSetup) return null;

    // ダイアログ内テキストは選択中の言語で動的に更新
    const t = translations[selectedLocale].setup;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <div className={styles.logoArea}>
                    <span className={styles.logoIcon}>🏎️</span>
                    <h1 className={styles.title}>{t.title}</h1>
                    <p className={styles.subtitle}>{t.subtitle}</p>
                </div>

                {/* 言語選択 */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t.language}</h2>
                    <div className={styles.optionGroup}>
                        <label
                            className={`${styles.option} ${selectedLocale === 'ja' ? styles.selected : ''}`}
                        >
                            <input
                                type="radio"
                                name="locale"
                                value="ja"
                                checked={selectedLocale === 'ja'}
                                onChange={() => setSelectedLocale('ja')}
                                className={styles.radio}
                            />
                            <span className={styles.optionFlag}>🇯🇵</span>
                            <span className={styles.optionLabel}>日本語</span>
                        </label>
                        <label
                            className={`${styles.option} ${selectedLocale === 'en' ? styles.selected : ''}`}
                        >
                            <input
                                type="radio"
                                name="locale"
                                value="en"
                                checked={selectedLocale === 'en'}
                                onChange={() => setSelectedLocale('en')}
                                className={styles.radio}
                            />
                            <span className={styles.optionFlag}>🇺🇸</span>
                            <span className={styles.optionLabel}>English</span>
                        </label>
                    </div>
                </div>

                {/* ECU タイプ選択 */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>{t.ecuType}</h2>
                    <div className={styles.optionGroup}>
                        <label
                            className={`${styles.option} ${selectedEcu === 'rusefi' ? styles.selected : ''}`}
                        >
                            <input
                                type="radio"
                                name="ecuType"
                                value="rusefi"
                                checked={selectedEcu === 'rusefi'}
                                onChange={() => setSelectedEcu('rusefi')}
                                className={styles.radio}
                            />
                            <span className={styles.optionIcon}>⚡</span>
                            <span className={styles.optionLabel}>RusEFI</span>
                        </label>
                        <label
                            className={`${styles.option} ${selectedEcu === 'speeduino' ? styles.selected : ''}`}
                        >
                            <input
                                type="radio"
                                name="ecuType"
                                value="speeduino"
                                checked={selectedEcu === 'speeduino'}
                                onChange={() => setSelectedEcu('speeduino')}
                                className={styles.radio}
                            />
                            <span className={styles.optionIcon}>🔧</span>
                            <span className={styles.optionLabel}>Speeduino</span>
                        </label>
                    </div>
                </div>

                <button
                    className={styles.startBtn}
                    onClick={() => completeSetup(selectedLocale, selectedEcu)}
                >
                    {t.start}
                </button>
            </div>
        </div>
    );
}
