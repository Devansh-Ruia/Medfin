import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { locales } from '@/i18n'
import type { Locale } from '@/i18n'
import type { Metadata } from 'next'
import { LocalePersist } from '@/components/LocalePersist'
import DisclaimerBanner from '@/components/DisclaimerBanner'

// generateStaticParams is required for static export -- it tells Next.js which locale paths to pre-render
export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
    },
    twitter: {
      title: t('twitterTitle'),
      description: t('twitterDescription'),
    },
    // hreflang tags tell Google which URL serves which language
    alternates: {
      languages: {
        'en': '/en',
        'es': '/es',
        'fr': '/fr',
        'zh': '/zh',
        'hi': '/hi',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocalePersist />
      <DisclaimerBanner />
      {children}
    </NextIntlClientProvider>
  )
}
