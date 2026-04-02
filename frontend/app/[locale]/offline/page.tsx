'use client'

import { useTranslations } from 'next-intl'

// This page exists because "no internet" should not look like a browser default error
export default function OfflinePage() {
  const t = useTranslations('offline')
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] mb-4">{t('label')}</p>
        <h1 className="text-3xl font-bold text-[#0D0D0D] mb-4">{t('heading')}</h1>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          {t('body')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 bg-[#0D0D0D] text-white text-sm font-medium px-8 py-4 rounded-none"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  )
}
