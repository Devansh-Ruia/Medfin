"use client"

import { useState, useEffect } from 'react'

export default function DisclaimerBanner() {
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
            IMPORTANT NOTICE
          </div>
          <div className="text-sm text-[#D1D5DB] leading-relaxed">
            MedFin AI is not a licensed insurance advisor, attorney, or healthcare provider.<br />
            Nothing on this platform constitutes legal, medical, or financial advice.<br />
            MedFin does not store, log, or transmit your documents or policy data. All processing happens in memory and is discarded when your session ends.<br />
            This platform is HIPAA-aware in its design but is not a covered entity and does not offer a Business Associate Agreement.
          </div>
        </div>

        {/* Right column - acknowledgment */}
        <div className="flex flex-col items-center md:items-end">
          <button
            onClick={handleAcknowledge}
            // rounded-none because every button in this product is a rectangle
            className="bg-white text-[#0D0D0D] text-sm font-medium px-6 py-3 rounded-none hover:bg-[#F9F8F6] transition-colors whitespace-nowrap"
          >
            I understand, continue
          </button>
          <div className="text-xs text-[#6B6B6B] text-center mt-2">
            This preference is saved in your browser.
          </div>
        </div>
      </div>
    </div>
  )
}
