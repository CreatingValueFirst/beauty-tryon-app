export const locales = ['en', 'bg', 'ru', 'es', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  bg: 'Български',
  ru: 'Русский',
  es: 'Español',
  tr: 'Türkçe',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  bg: '🇧🇬',
  ru: '🇷🇺',
  es: '🇪🇸',
  tr: '🇹🇷',
};
