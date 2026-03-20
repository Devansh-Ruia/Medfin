import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { SavingsProvider } from '../contexts/SavingsContext'
import { FamilyProvider } from '../contexts/FamilyContext'
import ErrorBoundary from '../components/ErrorBoundary'
import ToastProvider from '../components/providers/ToastProvider'
import DisclaimerBanner from '../components/DisclaimerBanner'
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'] })
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // prevents double-tap zoom on form inputs in iOS
  userScalable: false,
  themeColor: '#0D0D0D',
}

export const metadata: Metadata = {
  title: 'MedFin AI | Decode Your Insurance, Catch Billing Errors, Stop Overpaying',
  description:
    'MedFin AI reads your insurance policy in seconds, validates medical bills for overcharges, and tells you exactly what your plan covers. No jargon. No data stored. Free.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MedFin AI',
  },
  openGraph: {
    title: 'MedFin AI | Healthcare Financial Navigator',
    description:
      'Upload your insurance policy and find out what you are owed. MedFin catches billing errors, answers coverage questions, and helps you optimize your plan.',
    url: 'https://medfin-phi.vercel.app',
    siteName: 'MedFin AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedFin AI | Stop Overpaying for Healthcare',
    description: 'AI that reads your insurance policy so you actually understand what you are paying for.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
      <body className={`${inter.className} antialiased`}>
        <ServiceWorkerRegistration />
        <ToastProvider>
          <ErrorBoundary>
            <FamilyProvider>
              <SavingsProvider>
                {/* DisclaimerBanner sits at the root because every route can be a first visit */}
                <DisclaimerBanner />
                {children}
              </SavingsProvider>
            </FamilyProvider>
          </ErrorBoundary>
        </ToastProvider>
      </body>
    </html>
  )
}
