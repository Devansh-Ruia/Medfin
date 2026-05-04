'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { gsap } from '@/lib/motion/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useGsapContext } from '@/hooks/useGsapContext';
import { useAnchorLinkSmoothing } from '@/hooks/useAnchorLinkSmoothing';

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

// Tool SVG components
const PolicyAnalysisSVG = () => (
  <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-label="Document parsing visualization">
    <rect x="10" y="20" width="80" height="80" fill="#F5F5F5" stroke="#E5E2DC" strokeWidth="1"/>
    <rect x="15" y="25" width="70" height="2" fill="#CCCCCC"/>
    <rect x="15" y="30" width="65" height="2" fill="#CCCCCC"/>
    <rect x="15" y="35" width="68" height="2" fill="#CCCCCC"/>
    <rect x="15" y="40" width="60" height="2" fill="#CCCCCC"/>
    <rect x="15" y="45" width="70" height="2" fill="#CCCCCC"/>
    <rect x="15" y="50" width="62" height="2" fill="#CCCCCC"/>
    <rect x="110" y="20" width="80" height="80" fill="#E8F5EE" stroke="#0A6640" strokeWidth="1"/>
    <text x="115" y="35" fontSize="8" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">Deductible:</text>
    <text x="115" y="45" fontSize="8" fill="#0A6640" fontFamily="inherit">$2,500</text>
    <text x="115" y="55" fontSize="8" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">Coverage:</text>
    <text x="115" y="65" fontSize="8" fill="#0A6640" fontFamily="inherit">80%</text>
    <text x="115" y="75" fontSize="8" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">Network:</text>
    <text x="115" y="85" fontSize="8" fill="#0A6640" fontFamily="inherit">PPO</text>
  </svg>
);

const AskAISVG = () => (
  <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-label="Chat interface visualization">
    <rect x="10" y="20" width="180" height="80" fill="#F9F8F6" stroke="#E5E2DC" strokeWidth="1"/>
    <text x="15" y="35" fontSize="8" fill="#6B6B6B" fontFamily="inherit">Is my MRI covered?</text>
    <rect x="15" y="45" width="170" height="1" fill="#E5E2DC"/>
    <text x="15" y="60" fontSize="8" fill="#0D0D0D" fontFamily="inherit">Yes. Your plan covers MRI at 80%</text>
    <text x="15" y="70" fontSize="8" fill="#0D0D0D" fontFamily="inherit">after deductible. Expected cost: $450</text>
    <text x="15" y="80" fontSize="8" fill="#0A6640" fontFamily="inherit">See policy section 3.2.1</text>
  </svg>
);

const BillValidationSVG = () => (
  <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-label="Bill validation visualization">
    <rect x="10" y="20" width="180" height="80" fill="#F9F8F6" stroke="#E5E2DC" strokeWidth="1"/>
    <text x="15" y="35" fontSize="8" fill="#0D0D0D" fontFamily="inherit">Office visit</text>
    <text x="150" y="35" fontSize="8" fill="#0A6640" fontFamily="inherit">&#x2713;</text>
    <text x="15" y="50" fontSize="8" fill="#0D0D0D" fontFamily="inherit">Lab work</text>
    <text x="150" y="50" fontSize="8" fill="#0A6640" fontFamily="inherit">&#x2713;</text>
    <text x="15" y="65" fontSize="8" fill="#0D0D0D" fontFamily="inherit">Anesthesia (duplicate)</text>
    <text x="150" y="65" fontSize="8" fill="#C0392B" fontFamily="inherit">&#x26A0;</text>
    <text x="15" y="80" fontSize="7" fill="#C0392B" fontFamily="inherit">OVERCHARGE DETECTED</text>
  </svg>
);

const OptimizationSVG = () => (
  <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-label="Plan comparison visualization">
    <rect x="30" y="40" width="40" height="60" fill="#E5E2DC"/>
    <text x="35" y="35" fontSize="8" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">Current</text>
    <text x="35" y="55" fontSize="7" fill="#0D0D0D" fontFamily="inherit">$6,400</text>
    <text x="35" y="65" fontSize="7" fill="#0D0D0D" fontFamily="inherit">per year</text>
    <rect x="130" y="40" width="40" height="40" fill="#0A6640"/>
    <text x="135" y="35" fontSize="8" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">Recommended</text>
    <text x="135" y="55" fontSize="7" fill="white" fontFamily="inherit">$5,200</text>
    <text x="135" y="65" fontSize="7" fill="white" fontFamily="inherit">per year</text>
  </svg>
);

const PreVisitSVG = () => (
  <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-label="Checklist visualization">
    <rect x="10" y="20" width="180" height="80" fill="#F9F8F6" stroke="#E5E2DC" strokeWidth="1"/>
    <text x="15" y="35" fontSize="8" fill="#0A6640" fontFamily="inherit">&#x2713; Verify network status</text>
    <text x="15" y="50" fontSize="8" fill="#0A6640" fontFamily="inherit">&#x2713; Bring insurance card</text>
    <text x="15" y="65" fontSize="8" fill="#0A6640" fontFamily="inherit">&#x2713; Check referral required</text>
    <text x="15" y="80" fontSize="8" fill="#6B6B6B" fontFamily="inherit">&#x25A1; Estimate out-of-pocket</text>
  </svg>
);

const AppealLetterSVG = () => (
  <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-label="Appeal letter visualization">
    <rect x="50" y="30" width="100" height="60" fill="#F9F8F6" stroke="#E5E2DC" strokeWidth="1"/>
    <text x="55" y="45" fontSize="6" fill="#0D0D0D" fontFamily="inherit">APPEAL LETTER</text>
    <line x1="55" y1="50" x2="145" y2="50" stroke="#E5E2DC" strokeWidth="1"/>
    <text x="55" y="60" fontSize="5" fill="#6B6B6B" fontFamily="inherit">ERISA Sec. 503</text>
    <text x="55" y="70" fontSize="5" fill="#6B6B6B" fontFamily="inherit">ACA Sec. 2719</text>
    <line x1="55" y1="75" x2="145" y2="75" stroke="#E5E2DC" strokeWidth="1"/>
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

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 75%', once: true },
        });
      });
    },
    rootRef,
    [reduced]
  );

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
              <Link
                data-hero="cta"
                href={dashboardHref}
                className="bg-[#0D0D0D] text-white px-8 py-4 text-sm font-medium rounded-none inline-block hover:bg-[#1A1A1A] transition-colors mb-4"
              >
                {tHero('cta')}
              </Link>
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

      {/* Tools section */}
      <section id="Tools" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {tTools('sectionHeading')}
            </h2>
            <p className="text-base md:text-lg text-[#6B6B6B] leading-relaxed max-w-3xl mx-auto">
              {tTools('sectionSubheading')}
            </p>
          </div>

          <div data-reveal className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              <div className="pr-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">{tTools('tool01')}</div>
                <h3 className="text-2xl font-bold mb-4">{tTools('policyAnalysis')}</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">{tTools('policyAnalysisDesc')}</p>
                <Link href={dashboardHref} className="text-[#0A6640] font-medium hover:underline">
                  {tTools('openTool')} {tTools('policyAnalysis')} &rarr;
                </Link>
              </div>
              <div className="flex justify-center items-center"><PolicyAnalysisSVG /></div>
            </div>
          </div>

          <div data-reveal className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              <div className="md:order-2 md:pl-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">{tTools('tool02')}</div>
                <h3 className="text-2xl font-bold mb-4">{tTools('askAI')}</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">{tTools('askAIDesc')}</p>
                <Link href={dashboardHref} className="text-[#0A6640] font-medium hover:underline">
                  {tTools('openTool')} {tTools('askAI')} &rarr;
                </Link>
              </div>
              <div className="md:order-1 flex justify-center items-center"><AskAISVG /></div>
            </div>
          </div>

          <div data-reveal className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              <div className="pr-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">{tTools('tool03')}</div>
                <h3 className="text-2xl font-bold mb-4">{tTools('billValidation')}</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">{tTools('billValidationDesc')}</p>
                <Link href={dashboardHref} className="text-[#0A6640] font-medium hover:underline">
                  {tTools('openTool')} {tTools('billValidation')} &rarr;
                </Link>
              </div>
              <div className="flex justify-center items-center"><BillValidationSVG /></div>
            </div>
          </div>

          <div data-reveal className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              <div className="md:order-2 md:pl-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">{tTools('tool04')}</div>
                <h3 className="text-2xl font-bold mb-4">{tTools('policyOptimization')}</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">{tTools('policyOptimizationDesc')}</p>
                <Link href={dashboardHref} className="text-[#0A6640] font-medium hover:underline">
                  {tTools('openTool')} {tTools('policyOptimization')} &rarr;
                </Link>
              </div>
              <div className="md:order-1 flex justify-center items-center"><OptimizationSVG /></div>
            </div>
          </div>

          <div data-reveal className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              <div className="pr-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">{tTools('tool05')}</div>
                <h3 className="text-2xl font-bold mb-4">{tTools('preVisit')}</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">{tTools('preVisitDesc')}</p>
                <Link href={dashboardHref} className="text-[#0A6640] font-medium hover:underline">
                  {tTools('openTool')} {tTools('preVisit')} &rarr;
                </Link>
              </div>
              <div className="flex justify-center items-center"><PreVisitSVG /></div>
            </div>
          </div>

          <div data-reveal className="pb-16">
            <div className="grid md:grid-cols-2 py-16">
              <div className="md:order-2 md:pl-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">{tTools('tool06')}</div>
                <h3 className="text-2xl font-bold mb-4">{tTools('appealLetters')}</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">{tTools('appealLettersDesc')}</p>
                <Link href={dashboardHref} className="text-[#0A6640] font-medium hover:underline">
                  {tTools('openTool')} {tTools('appealLetters')} &rarr;
                </Link>
              </div>
              <div className="md:order-1 flex justify-center items-center"><AppealLetterSVG /></div>
            </div>
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
