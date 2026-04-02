'use client'
// Root page redirects to the default locale
// For static export, this runs client-side and reads the browser locale
import { useEffect } from 'react'
import { locales, defaultLocale } from '@/i18n'

export default function RootPage() {
  useEffect(() => {
    const stored = localStorage.getItem('medfin_locale')
    if (stored && locales.includes(stored as any)) {
      window.location.replace(`/${stored}/`)
      return
    }
    // Auto-detect from browser
    const browserLang = navigator.language?.split('-')[0]
    const detected = locales.find(l => l === browserLang) ?? defaultLocale
    localStorage.setItem('medfin_locale', detected)
    window.location.replace(`/${detected}/`)
  }, [])

  return null
}
