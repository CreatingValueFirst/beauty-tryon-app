import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale, defaultLocale } from '../i18n';

export default getRequestConfig(async ({ locale }) => {
  // Use default locale if invalid or missing
  const validLocale = (locale && locales.includes(locale as Locale)) ? locale : defaultLocale;

  return {
    locale: validLocale as string,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
