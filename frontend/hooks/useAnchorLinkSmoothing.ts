'use client'

import { useEffect } from 'react'
import { useLenis } from '@/components/providers/SmoothScrollProvider'

// Lenis 1.3 dropped the auto-anchor interception that the deprecated @studio-freight
// package shipped with. Without this hook, a click on an in-page hash link bypasses
// Lenis entirely and the page jumps. Delegated listener so we bind once per route, not
// per anchor render.
export function useAnchorLinkSmoothing(): void {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    if (typeof document === 'undefined') return

    // Sticky nav covers the top of the page; without an offset the section heading
    // lands behind it. Measured once on mount because the nav height is fixed in CSS.
    const navHeight = document.querySelector('nav')?.getBoundingClientRect().height ?? 0

    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (event.button !== 0) return

      const target = event.target as Element | null
      const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.target === '_blank') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href) return

      if (href === '#' || href === '#top') {
        event.preventDefault()
        lenis.scrollTo(0)
        return
      }

      const id = href.slice(1)
      const el = document.getElementById(id)
      if (!el) return

      event.preventDefault()
      lenis.scrollTo(el, { offset: -navHeight })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [lenis])
}
