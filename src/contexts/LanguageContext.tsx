'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Locale } from '../i18n';
import type { EcuType } from '../lib/types/ecu';

interface LanguageContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    ecuPreference: EcuType;
    setEcuPreference: (ecu: EcuType) => void;
    showSetup: boolean;
    completeSetup: (locale: Locale, ecu: EcuType) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'nextspeed_i18n';

interface StoredPrefs {
    locale: Locale;
    ecuPreference: EcuType;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('ja');
    const [ecuPreference, setEcuPrefState] = useState<EcuType>('speeduino');
    const [showSetup, setShowSetup] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // localStorage から読み込み（クライアントサイドでのみ実行）
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const prefs: StoredPrefs = JSON.parse(stored);
                setLocaleState(prefs.locale);
                setEcuPrefState(prefs.ecuPreference);
            } catch {
                setShowSetup(true);
            }
        } else {
            setShowSetup(true);
        }
        setHydrated(true);
    }, []);

    const persist = (loc: Locale, ecu: EcuType) => {
        const prefs: StoredPrefs = { locale: loc, ecuPreference: ecu };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    };

    const setLocale = (loc: Locale) => {
        setLocaleState(loc);
        persist(loc, ecuPreference);
    };

    const setEcuPreference = (ecu: EcuType) => {
        setEcuPrefState(ecu);
        persist(locale, ecu);
    };

    const completeSetup = (loc: Locale, ecu: EcuType) => {
        setLocaleState(loc);
        setEcuPrefState(ecu);
        persist(loc, ecu);
        setShowSetup(false);
    };

    // SSR / hydration 前は何も描画しない
    if (!hydrated) return null;

    return (
        <LanguageContext.Provider
            value={{ locale, setLocale, ecuPreference, setEcuPreference, showSetup, completeSetup }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
