'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { gsap, ensureScrollTrigger } from '@/lib/motion/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useAnchorLinkSmoothing } from '@/hooks/useAnchorLinkSmoothing';
import { PolicyAnalysisVisual } from '@/components/landing/visuals/PolicyAnalysisVisual';
import { BillValidationVisual } from '@/components/landing/visuals/BillValidationVisual';
import { PreVisitVisual } from '@/components/landing/visuals/PreVisitVisual';
import { AskAIVisual } from '@/components/landing/visuals/AskAIVisual';
import { OptimizationVisual } from '@/components/landing/visuals/OptimizationVisual';
import { AppealVisual } from '@/components/landing/visuals/AppealVisual';

// Billing error chart component - inline SVG because an HTTP request for a bar chart is embarrassing
const BillingErrorChart = () => (
  <svg viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" aria-label="Billing error rates by category" className="w-full h-auto">
    <text x="0" y="20" fontSize="11" fill="#6B6B6B" fontFamily="inherit">BILLING ERROR RATES BY CATEGORY</text>
    <text x="0" y="36" fontSize="9" fill="#9CA3AF" fontFamily="inherit">Source: Medical Billing Advocates of America</text>

    {/* Category rows */}
    <text x="0" y="72" fontSize="11" fill="#0D0D0D" fontFamily="inherit">Duplicate charges</text>
    <rect x="0" y="78" width="201.6" height="10" fill="#0A6640" rx="1"/>
    <text x="207" y="88" fontSize="10" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">42%</text>

    <text x="0" y="112" fontSize="11" fill="#0D0D0D" fontFamily="inherit">Upcoding / wrong codes</text>
    <rect x="0" y="118" width="177.6" height="10" fill="#0A6640" rx="1" opacity="0.8"/>
    <text x="183" y="128" fontSize="10" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">37%</text>

    <text x="0" y="152" fontSize="11" fill="#0D0D0D" fontFamily="inherit">Unbundled services</text>
    <rect x="0" y="158" width="139.2" height="10" fill="#0A6640" rx="1" opacity="0.65"/>
    <text x="145" y="168" fontSize="10" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">29%</text>

    <text x="0" y="192" fontSize="11" fill="#0D0D0D" fontFamily="inherit">Incorrect balance billing</text>
    <rect x="0" y="198" width="115.2" height="10" fill="#0A6640" rx="1" opacity="0.5"/>
    <text x="121" y="208" fontSize="10" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">24%</text>

    <line x1="0" y1="228" x2="480" y2="228" stroke="#E5E2DC" strokeWidth="1"/>

    <text x="0" y="256" fontSize="32" fill="#0D0D0D" fontFamily="inherit" fontWeight="700">8 in 10</text>
    <text x="0" y="275" fontSize="12" fill="#6B6B6B" fontFamily="inherit">medical bills contain at least one error</text>
    <text x="0" y="292" fontSize="10" fill="#9CA3AF" fontFamily="inherit">Healthcare Financial Management Association, 2023</text>
  </svg>
);

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const tHero = useTranslations('hero');
  const tStats = useTranslations('stats');
  const tTools = useTranslations('tools');
  const tHow = useTranslations('howItWorks');
  const tResults = useTranslations('results');
  const tCta = useTranslations('cta');
  const tFooter = useTranslations('footer');
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useAnchorLinkSmoothing();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useGsapContext(
    () => {
      if (reduced) return;

      gsap.from('[data-hero]', {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
      });
    },
    rootRef,
    [reduced]
  );

  // ScrollTrigger lives in a dynamic chunk so the dashboard route doesn't pay
  // for it. The reveal pass waits on `ensureScrollTrigger()`; the hero stagger
  // above runs immediately because it only uses the static `gsap` export.
  useEffect(() => {
    if (reduced) return;
    let ctx: ReturnType<typeof gsap.context> | null = null;
    let cancelled = false;
    ensureScrollTrigger().then(() => {
      if (cancelled || !rootRef.current) return;
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y: 24,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 75%', once: true },
          });
        });
      }, rootRef);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  const dashboardHref = `/${locale}/dashboard`;

  return (
    <div ref={rootRef} className="min-h-screen bg-[#F9F8F6]">
      {/* Nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'border-b border-[#E5E2DC]' : ''
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#0A6640] rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-black font-medium">MedFin</span>
              <span className="text-[#0A6640] font-medium">AI</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#How-It-Works" className="text-sm text-[#6B6B6B] hover:text-[#0D0D0D] transition-colors">{tNav('howItWorks')}</a>
              <a href="#Tools" className="text-sm text-[#6B6B6B] hover:text-[#0D0D0D] transition-colors">{tNav('tools')}</a>
              <a href="#Results" className="text-sm text-[#6B6B6B] hover:text-[#0D0D0D] transition-colors">{tNav('results')}</a>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href={dashboardHref}
                className="bg-[#0D0D0D] text-white px-6 py-2 text-sm font-medium rounded-none hover:bg-[#1A1A1A] transition-colors"
              >
                {tNav('getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen bg-white flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div data-hero="eyebrow" className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase mb-6">
                {tHero('eyebrow')}
              </div>
              <h1 data-hero="headline" className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-8">
                {tHero('headline')}
              </h1>
              <p data-hero="sub" className="text-base md:text-lg text-[#6B6B6B] leading-relaxed mb-8">
                {tHero('subheading')}
              </p>
              <div data-hero="cta" className="flex flex-col md:flex-row gap-3 mb-4">
                <Link
                  href={dashboardHref}
                  className="bg-[#0D0D0D] text-white px-8 py-4 text-sm font-medium rounded-none inline-flex items-center justify-center hover:bg-[#1A1A1A] transition-colors"
                >
                  {tHero('cta')}
                </Link>
                <Link
                  href={dashboardHref}
                  className="bg-white border border-[#0D0D0D] text-[#0D0D0D] px-8 py-4 text-sm font-medium rounded-none inline-flex items-center justify-center hover:bg-[#F9F8F6] transition-colors"
                >
                  {tHero('ctaSecondary')}
                </Link>
              </div>
              <div className="text-xs text-[#6B6B6B] mb-2">
                {tHero('affiliation')}
              </div>
              <div data-hero="cta-sub" className="text-xs text-[#6B6B6B]">
                {tHero('ctaSub')}
              </div>
            </div>

            <div data-hero="chart" className="hidden md:block">
              <BillingErrorChart />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section data-reveal className="bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <div className="py-10 px-8 border-r border-[#2D2D2D]">
            <div className="text-3xl font-bold text-white mb-2">80%</div>
            <div className="text-sm text-[#9CA3AF]">{tStats('errorRate')}</div>
          </div>
          <div className="py-10 px-8 border-r border-[#2D2D2D]">
            <div className="text-3xl font-bold text-white mb-2">$1,240</div>
            <div className="text-sm text-[#9CA3AF]">{tStats('recovered')}</div>
          </div>
          <div className="py-10 px-8 border-r border-[#2D2D2D]">
            <div className="text-3xl font-bold text-white mb-2">23 min</div>
            <div className="text-sm text-[#9CA3AF]">{tStats('analysisTime')}</div>
          </div>
          <div className="py-10 px-8">
            <div className="text-3xl font-bold text-white mb-2">0 bytes</div>
            <div className="text-sm text-[#9CA3AF]">{tStats('dataStored')}</div>
          </div>
        </div>
      </section>

      {/* Tools section — narrative order: upload → use → think → push back */}
      <section id="Tools" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {tTools('sectionHeading')}
            </h2>
            <p className="text-base md:text-lg text-[#6B6B6B] leading-relaxed max-w-3xl mx-auto">
              {tTools('sectionSubheading')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
            <FeatureBlock label={tTools('tool01')} name={tTools('policyAnalysis')}>
              <PolicyAnalysisVisual />
            </FeatureBlock>
            <FeatureBlock label={tTools('tool02')} name={tTools('billValidation')}>
              <BillValidationVisual />
            </FeatureBlock>
            <FeatureBlock label={tTools('tool03')} name={tTools('preVisit')}>
              <PreVisitVisual />
            </FeatureBlock>
            <FeatureBlock label={tTools('tool04')} name={tTools('askAI')}>
              <AskAIVisual />
            </FeatureBlock>
            <FeatureBlock label={tTools('tool05')} name={tTools('policyOptimization')}>
              <OptimizationVisual />
            </FeatureBlock>
            <FeatureBlock label={tTools('tool06')} name={tTools('appealLetters')}>
              <AppealVisual />
            </FeatureBlock>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="How-It-Works" className="py-20 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-16">
            <div className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase mb-4">{tHow('sectionLabel')}</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{tHow('heading')}</h2>
          </div>

          <div className="space-y-12">
            <div data-reveal className="border-b border-[#E5E2DC] pb-12">
              <div className="text-6xl font-bold text-[#E5E2DC] mb-4">1</div>
              <h3 className="text-2xl font-bold mb-4">{tHow('step1Title')}</h3>
              <p className="text-base text-[#6B6B6B] leading-relaxed">{tHow('step1Desc')}</p>
            </div>
            <div data-reveal className="border-b border-[#E5E2DC] pb-12">
              <div className="text-6xl font-bold text-[#E5E2DC] mb-4">2</div>
              <h3 className="text-2xl font-bold mb-4">{tHow('step2Title')}</h3>
              <p className="text-base text-[#6B6B6B] leading-relaxed">{tHow('step2Desc')}</p>
            </div>
            <div data-reveal className="border-b border-[#E5E2DC] pb-12">
              <div className="text-6xl font-bold text-[#E5E2DC] mb-4">3</div>
              <h3 className="text-2xl font-bold mb-4">{tHow('step3Title')}</h3>
              <p className="text-base text-[#6B6B6B] leading-relaxed">{tHow('step3Desc')}</p>
            </div>
            <div data-reveal>
              <div className="text-6xl font-bold text-[#E5E2DC] mb-4">4</div>
              <h3 className="text-2xl font-bold mb-4">{tHow('step4Title')}</h3>
              <p className="text-base text-[#6B6B6B] leading-relaxed">{tHow('step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Results section */}
      <section id="Results" className="py-20 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{tResults('heading')}</h2>
          </div>

          <div className="space-y-12">
            <div data-reveal className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="text-5xl font-bold text-[#0A6640]">{tResults('result1Amount')}</div>
              </div>
              <div className="w-px h-16 bg-[#E5E2DC] hidden md:block"></div>
              <div className="md:w-2/3">
                <p className="text-base text-[#6B6B6B] leading-relaxed">{tResults('result1Desc')}</p>
              </div>
            </div>
            <div data-reveal className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="text-5xl font-bold text-[#0A6640]">{tResults('result2Amount')}</div>
              </div>
              <div className="w-px h-16 bg-[#E5E2DC] hidden md:block"></div>
              <div className="md:w-2/3">
                <p className="text-base text-[#6B6B6B] leading-relaxed">{tResults('result2Desc')}</p>
              </div>
            </div>
            <div data-reveal className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="text-5xl font-bold text-[#0A6640]">{tResults('result3Amount')}</div>
              </div>
              <div className="w-px h-16 bg-[#E5E2DC] hidden md:block"></div>
              <div className="md:w-2/3">
                <p className="text-base text-[#6B6B6B] leading-relaxed">{tResults('result3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">{tCta('heading')}</h2>
            </div>
            <div>
              <p className="text-base text-[#9CA3AF] leading-relaxed mb-8">{tCta('body')}</p>
              <Link
                href={dashboardHref}
                className="bg-white text-[#0D0D0D] px-8 py-4 font-medium rounded-none inline-block hover:bg-gray-100 transition-colors mb-4"
              >
                {tCta('button')}
              </Link>
              <div className="text-xs text-[#6B6B6B]">{tCta('disclaimer')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E2DC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-[#0A6640] rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-black font-medium">MedFin AI</span>
          </div>
          <div className="text-sm text-[#6B6B6B]">
            {tFooter('legal')}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature block wraps the visual + name. data-reveal is applied here so each
// block fades up as a single unit. No supporting copy by design: the visual
// carries the meaning.
function FeatureBlock({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div data-reveal>
      <div className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase mb-2">
        {label}
      </div>
      <h3 className="text-2xl font-bold tracking-tight mb-5">{name}</h3>
      {children}
    </div>
  );
}
