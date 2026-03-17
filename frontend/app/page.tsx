'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Billing error chart component - inline SVG because an HTTP request for a bar chart is embarrassing
const BillingErrorChart = () => (
  <svg viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" aria-label="Billing error rates by category" className="w-full h-auto">
    <text x="0" y="20" fontSize="11" fill="#6B6B6B" fontFamily="inherit">BILLING ERROR RATES BY CATEGORY</text>
    <text x="0" y="36" fontSize="9" fill="#9CA3AF" fontFamily="inherit">Source: Medical Billing Advocates of America</text>

    {/* Category rows */}
    {/* Duplicate charges: 42% */}
    <text x="0" y="72" fontSize="11" fill="#0D0D0D" fontFamily="inherit">Duplicate charges</text>
    <rect x="0" y="78" width="201.6" height="10" fill="#0A6640" rx="1"/>
    <text x="207" y="88" fontSize="10" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">42%</text>

    {/* Upcoding: 37% */}
    <text x="0" y="112" fontSize="11" fill="#0D0D0D" fontFamily="inherit">Upcoding / wrong codes</text>
    <rect x="0" y="118" width="177.6" height="10" fill="#0A6640" rx="1" opacity="0.8"/>
    <text x="183" y="128" fontSize="10" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">37%</text>

    {/* Unbundling: 29% */}
    <text x="0" y="152" fontSize="11" fill="#0D0D0D" fontFamily="inherit">Unbundled services</text>
    <rect x="0" y="158" width="139.2" height="10" fill="#0A6640" rx="1" opacity="0.65"/>
    <text x="145" y="168" fontSize="10" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">29%</text>

    {/* Balance billing: 24% */}
    <text x="0" y="192" fontSize="11" fill="#0D0D0D" fontFamily="inherit">Incorrect balance billing</text>
    <rect x="0" y="198" width="115.2" height="10" fill="#0A6640" rx="1" opacity="0.5"/>
    <text x="121" y="208" fontSize="10" fill="#0D0D0D" fontFamily="inherit" fontWeight="600">24%</text>

    {/* Divider */}
    <line x1="0" y1="228" x2="480" y2="228" stroke="#E5E2DC" strokeWidth="1"/>

    {/* Summary stat */}
    <text x="0" y="256" fontSize="32" fill="#0D0D0D" fontFamily="inherit" fontWeight="700">8 in 10</text>
    <text x="0" y="275" fontSize="12" fill="#6B6B6B" fontFamily="inherit">medical bills contain at least one error</text>
    <text x="0" y="292" fontSize="10" fill="#9CA3AF" fontFamily="inherit">Healthcare Financial Management Association, 2023</text>
  </svg>
);

// Tool SVG components
const PolicyAnalysisSVG = () => (
  <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-label="Document parsing visualization">
    {/* Before side - dense paragraph */}
    <rect x="10" y="20" width="80" height="80" fill="#F5F5F5" stroke="#E5E2DC" strokeWidth="1"/>
    <rect x="15" y="25" width="70" height="2" fill="#CCCCCC"/>
    <rect x="15" y="30" width="65" height="2" fill="#CCCCCC"/>
    <rect x="15" y="35" width="68" height="2" fill="#CCCCCC"/>
    <rect x="15" y="40" width="60" height="2" fill="#CCCCCC"/>
    <rect x="15" y="45" width="70" height="2" fill="#CCCCCC"/>
    <rect x="15" y="50" width="62" height="2" fill="#CCCCCC"/>
    
    {/* After side - clean key/value */}
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
    <text x="150" y="35" fontSize="8" fill="#0A6640" fontFamily="inherit">✓</text>
    <text x="15" y="50" fontSize="8" fill="#0D0D0D" fontFamily="inherit">Lab work</text>
    <text x="150" y="50" fontSize="8" fill="#0A6640" fontFamily="inherit">✓</text>
    <text x="15" y="65" fontSize="8" fill="#0D0D0D" fontFamily="inherit">Anesthesia (duplicate)</text>
    <text x="150" y="65" fontSize="8" fill="#C0392B" fontFamily="inherit">⚠</text>
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
    <text x="15" y="35" fontSize="8" fill="#0A6640" fontFamily="inherit">✓ Verify network status</text>
    <text x="15" y="50" fontSize="8" fill="#0A6640" fontFamily="inherit">✓ Bring insurance card</text>
    <text x="15" y="65" fontSize="8" fill="#0A6640" fontFamily="inherit">✓ Check referral required</text>
    <text x="15" y="80" fontSize="8" fill="#6B6B6B" fontFamily="inherit">□ Estimate out-of-pocket</text>
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // The nav border only appears on scroll because a permanent line looks like we are compensating for something
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Nav */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
          isScrolled ? 'border-b border-[#E5E2DC]' : ''
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#0A6640] rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-black font-medium">MedFin</span>
              <span className="text-[#0A6640] font-medium">AI</span>
            </div>

            {/* Center nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#How-It-Works" className="text-sm text-[#6B6B6B] hover:text-[#0D0D0D] transition-colors">How It Works</Link>
              <Link href="#Tools" className="text-sm text-[#6B6B6B] hover:text-[#0D0D0D] transition-colors">Tools</Link>
              <Link href="#Results" className="text-sm text-[#6B6B6B] hover:text-[#0D0D0D] transition-colors">Results</Link>
            </div>

            {/* CTA */}
            <Link 
              href="/dashboard" 
              className="bg-[#0D0D0D] text-white px-6 py-2 text-sm font-medium rounded-none hover:bg-[#1A1A1A] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen bg-white flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left column */}
            <div>
              <div className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase mb-6">
                HEALTHCARE FINANCIAL NAVIGATOR
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none mb-8">
                Your insurance policy is a financial document. Treat it like one.
              </h1>
              <p className="text-base md:text-lg text-[#6B6B6B] leading-relaxed mb-8">
                MedFin reads your policy, validates your bills against it, and tells you exactly where you are being charged more than you should be. No guessing. No jargon.
              </p>
              <Link 
                href="/dashboard"
                className="bg-[#0D0D0D] text-white px-8 py-4 text-sm font-medium rounded-none inline-block hover:bg-[#1A1A1A] transition-colors mb-4"
              >
                Analyze Your Policy
              </Link>
              <div className="text-xs text-[#6B6B6B]">
                No account required. Nothing is stored.
              </div>
            </div>

            {/* Right column - chart */}
            <div className="hidden md:block">
              <BillingErrorChart />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <div className="py-10 px-8 border-r border-[#2D2D2D]">
            <div className="text-3xl font-bold text-white mb-2">80%</div>
            <div className="text-sm text-[#9CA3AF]">of medical bills contain at least one error</div>
          </div>
          <div className="py-10 px-8 border-r border-[#2D2D2D]">
            <div className="text-3xl font-bold text-white mb-2">$1,240</div>
            <div className="text-sm text-[#9CA3AF]">average amount recovered per disputed bill</div>
          </div>
          <div className="py-10 px-8 border-r border-[#2D2D2D]">
            <div className="text-3xl font-bold text-white mb-2">23 min</div>
            <div className="text-sm text-[#9CA3AF]">average time to analyze a policy with MedFin</div>
          </div>
          <div className="py-10 px-8">
            <div className="text-3xl font-bold text-white mb-2">0 bytes</div>
            <div className="text-sm text-[#9CA3AF]">of your data stored after your session ends</div>
          </div>
        </div>
      </section>

      {/* Tools section */}
      <section id="Tools" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Six tools. One job: stop you from overpaying.
            </h2>
            <p className="text-base md:text-lg text-[#6B6B6B] leading-relaxed max-w-3xl mx-auto">
              Each tool is built around a specific failure point in the healthcare billing system.
            </p>
          </div>

          {/* Row 1 */}
          <div className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              {/* Policy Analysis - Left */}
              <div className="pr-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">TOOL 01</div>
                <h3 className="text-2xl font-bold mb-4">Policy Analysis</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">
                  Most people have never actually read their insurance policy. MedFin extracts every coverage parameter, deductible, exclusion, and limit from your PDF and presents it as a readable summary. Upload once, reference all year.
                </p>
                <Link href="/dashboard" className="text-[#0A6640] font-medium hover:underline">
                  Open Policy Analysis →
                </Link>
              </div>
              <div className="flex justify-center items-center">
                <PolicyAnalysisSVG />
              </div>
            </div>
          </div>

          <div className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              {/* AI Q&A - Right */}
              <div className="md:order-2 md:pl-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">TOOL 02</div>
                <h3 className="text-2xl font-bold mb-4">Ask AI</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">
                  Coverage questions usually require a 40-minute hold with your insurer. MedFin answers them instantly, grounded in your actual policy document, not generic insurance knowledge.
                </p>
                <Link href="/dashboard" className="text-[#0A6640] font-medium hover:underline">
                  Try Ask AI →
                </Link>
              </div>
              <div className="md:order-1 flex justify-center items-center">
                <AskAISVG />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              {/* Bill Validation - Left */}
              <div className="pr-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">TOOL 03</div>
                <h3 className="text-2xl font-bold mb-4">Bill Validation</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">
                  Medical billing departments make errors at a rate that would be embarrassing in any other industry. MedFin checks every line item on your bill against your policy and flags anything that does not add up.
                </p>
                <Link href="/dashboard" className="text-[#0A6640] font-medium hover:underline">
                  Validate Bill →
                </Link>
              </div>
              <div className="flex justify-center items-center">
                <BillValidationSVG />
              </div>
            </div>
          </div>

          <div className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              {/* Policy Optimization - Right */}
              <div className="md:order-2 md:pl-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">TOOL 04</div>
                <h3 className="text-2xl font-bold mb-4">Policy Optimization</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">
                  Your current plan may be optimized for someone who is not you. MedFin compares your actual healthcare usage against your plan parameters and surfaces specific, actionable changes.
                </p>
                <Link href="/dashboard" className="text-[#0A6640] font-medium hover:underline">
                  Optimize Plan →
                </Link>
              </div>
              <div className="md:order-1 flex justify-center items-center">
                <OptimizationSVG />
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="border-b border-[#E5E2DC]">
            <div className="grid md:grid-cols-2 py-16">
              {/* Pre-Visit Planning - Left */}
              <div className="pr-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">TOOL 05</div>
                <h3 className="text-2xl font-bold mb-4">Pre-Visit Checklist</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">
                  Knowing what your visit will cost before you walk in is not a luxury. MedFin generates a visit-specific checklist: what to verify, what to bring, what questions to ask, and what your expected out-of-pocket cost will be.
                </p>
                <Link href="/dashboard" className="text-[#0A6640] font-medium hover:underline">
                  Generate Checklist →
                </Link>
              </div>
              <div className="flex justify-center items-center">
                <PreVisitSVG />
              </div>
            </div>
          </div>

          <div className="pb-16">
            <div className="grid md:grid-cols-2 py-16">
              {/* Appeal Letters - Right */}
              <div className="md:order-2 md:pl-8">
                <div className="text-xs text-[#6B6B6B] uppercase mb-2">TOOL 06</div>
                <h3 className="text-2xl font-bold mb-4">Appeal Letters</h3>
                <p className="text-base text-[#6B6B6B] leading-relaxed mb-6">
                  Claim denials are overturned 40 to 60 percent of the time when appealed. MedFin generates a formal appeal letter with the correct ERISA citations and denial-specific legal language, ready to print and mail.
                </p>
                <Link href="/dashboard" className="text-[#0A6640] font-medium hover:underline">
                  Generate Appeal →
                </Link>
              </div>
              <div className="md:order-1 flex justify-center items-center">
                <AppealLetterSVG />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="How-It-Works" className="py-20 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase mb-4">HOW IT WORKS</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              From upload to insight in under a minute.
            </h2>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="border-b border-[#E5E2DC] pb-12">
              <div className="text-6xl font-bold text-[#E5E2DC] mb-4">1</div>
              <h3 className="text-2xl font-bold mb-4">Upload your policy</h3>
              <p className="text-base text-[#6B6B6B] leading-relaxed">
                Drop your insurance PDF into MedFin. The document is processed in memory and discarded immediately. Nothing is written to disk.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-b border-[#E5E2DC] pb-12">
              <div className="text-6xl font-bold text-[#E5E2DC] mb-4">2</div>
              <h3 className="text-2xl font-bold mb-4">AI extracts the structure</h3>
              <p className="text-base text-[#6B6B6B] leading-relaxed">
                MedFin maps every coverage parameter, network rule, deductible tier, and exclusion in your plan. The process takes under 30 seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-b border-[#E5E2DC] pb-12">
              <div className="text-6xl font-bold text-[#E5E2DC] mb-4">3</div>
              <h3 className="text-2xl font-bold mb-4">Use any of the six tools</h3>
              <p className="text-base text-[#6B6B6B] leading-relaxed">
                All tools share the same policy context. Ask a question, validate a bill, generate an appeal letter. Everything is grounded in your specific document.
              </p>
            </div>

            {/* Step 4 */}
            <div>
              <div className="text-6xl font-bold text-[#E5E2DC] mb-4">4</div>
              <h3 className="text-2xl font-bold mb-4">Save the results</h3>
              <p className="text-base text-[#6B6B6B] leading-relaxed">
                Copy answers, download your appeal letter as a PDF, or screenshot your bill validation results. Your session is yours to manage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results section */}
      <section id="Results" className="py-20 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              What people actually find.
            </h2>
          </div>

          <div className="space-y-12">
            {/* Result 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="text-5xl font-bold text-[#0A6640]">$340 recovered</div>
              </div>
              <div className="w-px h-16 bg-[#E5E2DC] hidden md:block"></div>
              <div className="md:w-2/3">
                <p className="text-base text-[#6B6B6B] leading-relaxed">
                  A patient uploaded an EOB from an outpatient visit. MedFin flagged a duplicate charge for an anesthesia unit that appeared twice under different billing codes. The hospital reversed it within a week.
                </p>
              </div>
            </div>

            {/* Result 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="text-5xl font-bold text-[#0A6640]">$1,200 saved annually</div>
              </div>
              <div className="w-px h-16 bg-[#E5E2DC] hidden md:block"></div>
              <div className="md:w-2/3">
                <p className="text-base text-[#6B6B6B] leading-relaxed">
                  A freelancer's current plan had a $6,000 deductible they were never hitting. MedFin identified a comparable plan with a $2,500 deductible at $94 less per month.
                </p>
              </div>
            </div>

            {/* Result 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="text-5xl font-bold text-[#0A6640]">Denial overturned</div>
              </div>
              <div className="w-px h-16 bg-[#E5E2DC] hidden md:block"></div>
              <div className="md:w-2/3">
                <p className="text-base text-[#6B6B6B] leading-relaxed">
                  An MRI claim was denied as not medically necessary. MedFin generated an appeal citing ERISA Section 503 and the plan's own definition of medical necessity. The claim was approved on first appeal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                The typical American overpays for healthcare by $1,000 or more per year. Most of it is recoverable.
              </h2>
            </div>
            <div>
              <p className="text-base text-[#9CA3AF] leading-relaxed mb-8">
                Upload your insurance policy and find out exactly what you are owed. MedFin analyzes your document in seconds and shows you where the overcharges are hiding.
              </p>
              <Link 
                href="/dashboard"
                className="bg-white text-[#0D0D0D] px-8 py-4 font-medium rounded-none inline-block hover:bg-gray-100 transition-colors mb-4"
              >
                Analyze Your Policy
              </Link>
              <div className="text-xs text-[#6B6B6B]">
                No account required. No data stored. No insurance industry affiliation.
              </div>
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
            Not a licensed insurance advisor. For informational use only. © 2025 MedFin AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
