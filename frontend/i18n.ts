// This file exists because next-intl needs one source of truth for supported locales
export const locales = ['en', 'es', 'fr', 'zh', 'hi'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  zh: '中文',
  hi: 'हिन्दी',
}
