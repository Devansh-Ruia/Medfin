import { gsap } from 'gsap'

// `gsap` is exported synchronously so callers like `useGsapContext`, `ToolSwap`,
// and the dashboard tools can import without an await. ScrollTrigger is loaded
// on demand via `ensureScrollTrigger()` because only the landing page consumes
// it — keeping it out of the shared vendors chunk saves ~20 kB on every other
// route's first-load JS.
export { gsap }

let scrollTriggerPromise: Promise<void> | null = null

export function ensureScrollTrigger(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }
  if (!scrollTriggerPromise) {
    scrollTriggerPromise = import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger)
    })
  }
  return scrollTriggerPromise
}
