'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { gsap } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface ToolSwapProps<T extends string> {
  activeSection: T
  children: (section: T) => ReactNode
}

// Render-prop wrapper. Children receive the *deferred* section so the prior
// content stays mounted during the 160ms fade-out, then the swap commits and
// the new content fades up over 220ms. Without the deferral the prop change
// would replace the DOM mid-fade and the user would see a hard cut.
export function ToolSwap<T extends string>({ activeSection, children }: ToolSwapProps<T>) {
  const [renderedSection, setRenderedSection] = useState(activeSection)
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const firstMount = useRef(true)

  useEffect(() => {
    if (renderedSection === activeSection) return
    if (reduced || !ref.current) {
      setRenderedSection(activeSection)
      return
    }
    const tl = gsap.timeline()
    tl.to(ref.current, { opacity: 0, duration: 0.16, ease: 'power2.in' })
    tl.add(() => setRenderedSection(activeSection))
    return () => {
      tl.kill()
    }
  }, [activeSection, renderedSection, reduced])

  useIsoLayoutEffect(() => {
    if (reduced || !ref.current) return
    if (firstMount.current) {
      firstMount.current = false
      return
    }
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
    )
  }, [renderedSection, reduced])

  return <div ref={ref}>{children(renderedSection)}</div>
}
