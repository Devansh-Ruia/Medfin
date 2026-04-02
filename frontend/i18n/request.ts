// next-intl v4 requires this file for request-scoped configuration
import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale, type Locale } from '../i18n'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
