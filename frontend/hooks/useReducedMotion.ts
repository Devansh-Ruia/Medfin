'use client'

import { useEffect, useState } from 'react'

// Lazy initializer reads matchMedia synchronously on the client's first render,
// avoiding the false→true flip that would otherwise let a brief frame of motion
// play before useEffect could correct it. SSR falls back to false; the hydration
// mismatch on a client-only state is benign because the initial DOM matches.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mql.matches)

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
