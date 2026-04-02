'use client'
// This component exists because auto-detection is not always right and users deserve a correction
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { locales, localeNames } from '@/i18n'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    // Persist so the API client can read it outside Next.js locale context
    localStorage.setItem('medfin_locale', next)
    // Replace the locale segment in the current path
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    router.push(newPath)
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      aria-label="Select language"
      className="border border-[#E5E2DC] bg-white text-[#0D0D0D] text-sm px-3 py-2 rounded-none"
    >
      {locales.map(l => (
        <option key={l} value={l}>{localeNames[l]}</option>
      ))}
    </select>
  )
}
