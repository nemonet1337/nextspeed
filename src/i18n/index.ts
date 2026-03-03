import { ja } from './ja';
import { en } from './en';
import type { Translations } from './ja';

export type Locale = 'ja' | 'en';

export type { Translations };

export const translations: Record<Locale, Translations> = { ja, en };
