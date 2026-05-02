import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Single registration point. Importing this module is the only sanctioned way to reach
// GSAP or ScrollTrigger inside the app, so registerPlugin runs once and consumers do
// not have to remember to call it themselves.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }
