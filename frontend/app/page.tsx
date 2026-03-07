'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  MessageSquare, 
  Search, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Lock,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: FileText,
      tagline: 'Decode your coverage instantly',
      title: 'Policy Analysis',
      description: 'Upload any insurance policy (PDF or image) and get a plain-English breakdown of benefits, deductibles, exclusions, and coverage gaps — in seconds.'
    },
    {
      icon: MessageSquare,
      tagline: 'Ask anything about your plan',
      title: 'AI Q&A',
      description: 'Have a procedure coming up? Ask our AI what it\'ll actually cost under your plan. No insurance jargon, no guesswork — grounded answers from your policy.'
    },
    {
      icon: Search,
      tagline: 'Catch errors before you pay',
      title: 'Bill Validation',
      description: 'Snap a photo of your medical bill. MedFin checks every line item against your policy to flag overcharges, duplicate charges, and billing codes that don\'t add up.'
    },
    {
      icon: TrendingUp,
      tagline: 'Get the coverage you actually need',
      title: 'Policy Optimization',
      description: 'Tell us about your healthcare usage. MedFin analyzes your current plan and recommends changes that could save you hundreds — or thousands — per year.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Upload Your Policy',
      description: 'Drag and drop your insurance document. MedFin reads it securely — nothing is stored.'
    },
    {
      number: '2',
      title: 'AI Extracts Everything',
      description: 'Our AI maps every coverage parameter, limit, and exclusion in your plan automatically.'
    },
    {
      number: '3',
      title: 'Ask, Validate, Optimize',
      description: 'Use any of the four tools to get answers, check your bills, or find a better plan.'
    },
    {
      number: '4',
      title: 'Save Money',
      description: 'Armed with real data, fight incorrect bills, appeal denials, and optimize your spending.'
    }
  ];

  const testimonials = [
    {
      quote: 'I uploaded my EOB and MedFin caught a $340 duplicate charge I never would have noticed. Disputed it the same day.',
      initials: 'ST',
      name: 'Sarah T.',
      role: 'Self-employed, Chicago'
    },
    {
      quote: 'Finally understand what my deductible actually means for my upcoming surgery. The AI explained it better than my HR rep.',
      initials: 'MR',
      name: 'Marcus R.',
      role: 'Software Engineer, Austin'
    },
    {
      quote: 'Switched plans based on MedFin\'s recommendation and saved $1,200/year. The optimization tool is worth it alone.',
      initials: 'PK',
      name: 'Priya K.',
      role: 'Freelance Designer, NYC'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background ambient glow blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-semibold">MedFin AI</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#Features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link href="#HowItWorks" className="text-gray-300 hover:text-white transition-colors">How It Works</Link>
              <Link href="#Testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</Link>
              <Link 
                href="/dashboard" 
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
              >
                Try Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              <Link href="#Features" className="block text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link href="#HowItWorks" className="block text-gray-300 hover:text-white transition-colors">How It Works</Link>
              <Link href="#Testimonials" className="block text-gray-300 hover:text-white transition-colors">Testimonials</Link>
              <Link 
                href="/dashboard" 
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                Try Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-400">AI-powered healthcare financial navigator</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Stop overpaying for
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              healthcare you already have
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            MedFin AI reads your insurance policy, validates your bills, and finds money you're leaving on the table — 
            in plain English, in seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Analyze My Policy — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#HowItWorks"
              className="border border-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
            >
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-2">$1,240</div>
              <div className="text-sm text-gray-400">Avg. savings found per user</div>
            </div>
            <div className="border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">3.2x</div>
              <div className="text-sm text-gray-400">More billing errors caught vs. manual review</div>
            </div>
            <div className="border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-violet-400 mb-2">&lt; 30s</div>
              <div className="text-sm text-gray-400">Policy analysis time</div>
            </div>
            <div className="border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-2">100%</div>
              <div className="text-sm text-gray-400">Private — no data stored</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="Features" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm text-blue-400 font-medium mb-4">FEATURES</div>
            <h2 className="text-4xl font-bold mb-4">Everything you need to navigate healthcare costs</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="border border-white/10 rounded-lg p-8 hover:border-white/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-sm text-gray-400 mb-2">{feature.tagline}</div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="HowItWorks" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm text-violet-400 font-medium mb-4">HOW IT WORKS</div>
            <h2 className="text-4xl font-bold mb-4">From upload to insight in under a minute</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="text-5xl font-bold text-gray-600">{step.number}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="Testimonials" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm text-emerald-400 font-medium mb-4">TESTIMONIALS</div>
            <h2 className="text-4xl font-bold mb-4">Real money saved by real people</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="border border-white/10 rounded-lg p-8">
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{testimonial.initials}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Block */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-gradient-to-r from-blue-500/50 to-violet-500/50 rounded-lg p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Your policy is an asset. Start using it.</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Upload your insurance policy and find out what you're owed — for free, in seconds.
              </p>
              <Link 
                href="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-400 mt-6">
                No account required. Your documents are never stored.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-semibold">MedFin AI</span>
          </div>
          <div className="text-sm text-gray-400">
            © 2025 MedFin AI. Not a licensed insurance advisor. For informational purposes only.
          </div>
        </div>
      </footer>
    </div>
  );
}
