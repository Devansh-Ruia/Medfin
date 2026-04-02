// Middleware runs on every request and redirects to the correct locale prefix
// Auto-detection reads Accept-Language header -- the same signal browsers send anyway
// Note: middleware is inactive when output: 'export' is set in next.config.js
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
