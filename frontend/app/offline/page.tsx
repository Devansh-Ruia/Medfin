'use client'
// Legacy route redirect -- offline page now lives under /[locale]/offline
import { useEffect } from 'react'
import { locales, defaultLocale } from '@/i18n'

export default function OfflineRedirect() {
  useEffect(() => {
    const stored = localStorage.getItem('medfin_locale')
    const locale = (stored && locales.includes(stored as any)) ? stored : defaultLocale
    window.location.replace(`/${locale}/offline/`)
  }, [])

  return null
}
