import { gsap } from 'gsap'

// gsap is imported synchronously so every consumer (useGsapContext, ToolSwap,
// the dashboard tools) keeps working unchanged. ScrollTrigger is loaded on
// demand because the only consumer is the landing page; shipping it in the
// shared vendors chunk made every dashboard route pay for code it never used.
export { gsap }

let scrollTriggerLoaded = false

export async function ensureScrollTrigger(): Promise<void> {
  if (scrollTriggerLoaded) return
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)
  scrollTriggerLoaded = true
}
