'use client'
// Registers the service worker after mount -- doing it at build time would register it on the server, which has no service workers
import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('Service worker registration failed:', err)
      })
    }
  }, [])

  return null
}
