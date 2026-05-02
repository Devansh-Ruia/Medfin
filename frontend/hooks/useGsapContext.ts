'use client'

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from '@/lib/motion/gsap'

type GsapContext = ReturnType<typeof gsap.context>

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function useGsapContext<T extends Element>(
  setup: (self: GsapContext) => void,
  scope: RefObject<T>,
  deps: DependencyList = []
): void {
  useIsoLayoutEffect(() => {
    if (!scope.current) return
    const ctx = gsap.context(setup, scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
