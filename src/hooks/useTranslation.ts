'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { translations, type Translations } from '../i18n';

type NestedKeyOf<T> = T extends string
    ? ''
    : {
        [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${NestedKeyOf<T[K]>}`;
    }[keyof T & string];

type TranslationKey = NestedKeyOf<Translations>;

function getNestedValue(obj: unknown, path: string): string {
    const keys = path.split('.');
    let current: unknown = obj;
    for (const key of keys) {
        if (current == null || typeof current !== 'object') return path;
        current = (current as Record<string, unknown>)[key];
    }
    return typeof current === 'string' ? current : path;
}

/**
 * 翻訳フック
 * @example
 * const { t, locale } = useTranslation();
 * t('dashboard.title') // => 'ダッシュボード' or 'Dashboard'
 */
export function useTranslation() {
    const { locale } = useLanguage();
    const dict = translations[locale];

    const t = (key: TranslationKey): string => {
        return getNestedValue(dict, key);
    };

    return { t, locale };
}
