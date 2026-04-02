"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function DisclaimerBanner() {
  const t = useTranslations('disclaimer')
  // visible starts false and is set true by useEffect to avoid SSR mismatch
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // localStorage is the right call here -- this is a preference, not session state
    const acknowledged = localStorage.getItem('disclaimer_acknowledged')
    if (acknowledged !== 'true') {
      setVisible(true)
    }
  }, [])

  if (!visible) {
    return null
  }

  const handleAcknowledge = () => {
    localStorage.setItem('disclaimer_acknowledged', 'true')
    setVisible(false)
  }

  return (
    // role="dialog" without aria-modal="true" because we are not trapping focus
    <div 
      role="dialog" 
      aria-modal="false" 
      aria-label="Privacy and legal disclaimer"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D] text-white border-t border-[#2D2D2D] px-6 py-5"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left column - disclaimer text */}
        <div className="flex-1">
          <div className="text-xs tracking-[0.15em] uppercase text-[#9CA3AF] mb-2">
            {t('label')}
          </div>
          <div className="text-sm text-[#D1D5DB] leading-relaxed">
            <div>{t('line1')}</div>
            <div>{t('line2')}</div>
            <div>{t('line3')}</div>
            <div>{t('line4')}</div>
          </div>
        </div>

        {/* Right column - acknowledgment */}
        <div className="flex flex-col items-center md:items-end">
          <button
            onClick={handleAcknowledge}
            // rounded-none because every button in this product is a rectangle
            className="bg-white text-[#0D0D0D] text-sm font-medium px-6 py-3 rounded-none hover:bg-[#F9F8F6] transition-colors whitespace-nowrap"
          >
            {t('acknowledge')}
          </button>
          <div className="text-xs text-[#6B6B6B] text-center mt-2">
            {t('savedNote')}
          </div>
        </div>
      </div>
    </div>
  )
}
