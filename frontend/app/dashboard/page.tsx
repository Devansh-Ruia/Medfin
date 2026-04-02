'use client'
// Legacy route redirect -- dashboard now lives under /[locale]/dashboard
import { useEffect } from 'react'
import { locales, defaultLocale } from '@/i18n'

export default function DashboardRedirect() {
  useEffect(() => {
    const stored = localStorage.getItem('medfin_locale')
    const locale = (stored && locales.includes(stored as any)) ? stored : defaultLocale
    window.location.replace(`/${locale}/dashboard/`)
  }, [])

  return null
}
