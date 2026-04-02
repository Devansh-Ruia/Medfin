'use client'
// A separate component is used to keep the layout itself a server component
import { useEffect } from 'react'
import { useLocale } from 'next-intl'

export function LocalePersist() {
  const locale = useLocale()
  useEffect(() => {
    // Keep localStorage in sync so the API client outside Next.js context knows the locale
    localStorage.setItem('medfin_locale', locale)
  }, [locale])
  return null
}
