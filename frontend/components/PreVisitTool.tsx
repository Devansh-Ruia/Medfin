'use client';

import { useRef, useState } from 'react';
import { api, PolicyData, PreVisitChecklist } from '../lib/api';
import { formatCurrency, formatBoolean } from '../lib/format';
import VisualCostBreakdown from './VisualCostBreakdown';
import { replaceJargon } from '../lib/jargonDictionary';
import { event } from '../lib/analytics';
import { Lightbulb, DollarSign, ClipboardCopy, AlertTriangle } from 'lucide-react';
import { gsap } from '@/lib/motion/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useGsapContext } from '@/hooks/useGsapContext';
import { VerdictBanner } from '@/components/tools/VerdictBanner';

interface PreVisitToolProps {
  policyData: PolicyData;
}

const visitTypes = [
  { label: "Primary Care / Routine Checkup", value: "primary_care" },
  { label: "Specialist Visit (specify type)", value: "specialist" },
  { label: "Lab Work / Blood Tests", value: "lab_work" },
  { label: "Imaging (X-ray, MRI, CT)", value: "imaging" },
  { label: "Surgery / Procedure (specify)", value: "surgery" },
  { label: "Emergency Room", value: "emergency" },
  { label: "Urgent Care", value: "urgent_care" },
  { label: "Mental Health / Therapy", value: "mental_health" },
  { label: "Physical Therapy", value: "physical_therapy" },
  { label: "Dental / Vision", value: "dental_vision" }
];

export default function PreVisitTool({ policyData }: PreVisitToolProps) {
  const [visitType, setVisitType] = useState('');
  const [customVisitType, setCustomVisitType] = useState('');
  const [providerName, setProviderName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [isInNetwork, setIsInNetwork] = useState<'yes' | 'no' | 'unsure'>('unsure');
  const [plannedDate, setPlannedDate] = useState('');
  const [checklist, setChecklist] = useState<PreVisitChecklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      if (reduced) return;
      gsap.from('[data-reveal-section]', {
        opacity: 0,
        y: 12,
        duration: 0.32,
        ease: 'power2.out',
        stagger: 0.08,
      });
    },
    resultRef,
    [reduced, !!checklist]
  );

  const handleGenerateChecklist = async () => {
    if (!visitType) {
      setError('Please select a visit type');
      return;
    }

    const actualVisitType = visitType === 'specialist' && customVisitType 
      ? customVisitType 
      : visitType;

    setLoading(true);
    setError(null);

    try {
      const providerInfo = {
        provider_name: providerName || undefined,
        facility_name: facilityName || undefined,
        in_network_status: isInNetwork
      };

      const result = await api.generatePreVisitChecklist(
        actualVisitType,
        policyData,
        Object.keys(providerInfo).some(key => providerInfo[key as keyof typeof providerInfo]) 
          ? providerInfo 
          : undefined
      );

      setChecklist(result);
      event('generate_checklist', { visit_type: actualVisitType });
    } catch (err) {
      console.error(err);
      setError('Failed to generate checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setVisitType('');
    setCustomVisitType('');
    setProviderName('');
    setFacilityName('');
    setIsInNetwork('unsure');
    setPlannedDate('');
    setChecklist(null);
    setError(null);
  };

  const getActualVisitType = () => {
    if (visitType.includes('(specify type)') && customVisitType) {
      return customVisitType;
    }
    return visitType;
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      {!checklist && !loading && (
        <div className="bg-white border border-[#E5E2DC] rounded-none p-6">
          <h3 className="text-xl font-bold text-[#0D0D0D] mb-6">Plan Your Medical Visit</h3>
          
          <div className="space-y-4">
            {/* Visit Type */}
            <div>
              <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                What type of visit are you planning?
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                aria-label="Select visit type"
              >
                <option value="">Select a visit type...</option>
                {visitTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              
              {visitType === 'specialist' && (
                <input
                  type="text"
                  value={customVisitType}
                  onChange={(e) => setCustomVisitType(e.target.value)}
                  placeholder="Please specify the type..."
                  className="mt-2 w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                  aria-label="Specify visit type"
                />
              )}
            </div>

            {/* Provider Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                  Provider Name (optional)
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Dr. Smith"
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                  aria-label="Provider name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                  Facility Name (optional)
                </label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="City Medical Center"
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                  aria-label="Facility name"
                />
              </div>
            </div>

            {/* Network Status */}
            <div>
              <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                Is this provider in-network?
              </label>
              <div className="flex gap-4">
                {[
                  { value: 'yes', label: 'Yes, in-network' },
                  { value: 'no', label: 'No, out-of-network' },
                  { value: 'unsure', label: 'Not sure' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      value={option.value}
                      checked={isInNetwork === option.value}
                      onChange={(e) => setIsInNetwork(e.target.value as 'yes' | 'no' | 'unsure')}
                      className="mr-2"
                    />
                    <span className="text-sm text-[#0D0D0D]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Planned Date */}
            <div>
              <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                Planned Date (optional)
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                aria-label="Planned visit date"
              />
            </div>

            <button
              onClick={handleGenerateChecklist}
              className="w-full py-4 bg-[#0D0D0D] text-white text-sm px-8 py-4 rounded-none font-medium"
            >
              Generate Pre-Visit Checklist
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-[#E5E2DC] rounded-none p-16 text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#F9F8F6] rounded-none animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-none flex items-center justify-center">
              <ClipboardCopy className="w-8 h-8 text-[#6B6B6B] animate-bounce" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#0D0D0D] mb-3">Creating Your Checklist...</h3>
          <p className="text-[#6B6B6B]">AI is analyzing your policy and preparing personalized guidance</p>
        </div>
      )}

      {/* Results */}
      {checklist && !checklist.estimated_costs && !checklist.prior_authorization && (
        <div className="border-l-2 border-[#C0392B] bg-[#FDF2F2] px-4 py-3 text-sm text-[#C0392B]">
          The analysis returned an unexpected format. Please try again.
        </div>
      )}
      {checklist && (checklist.estimated_costs || checklist.prior_authorization) && (
        <div ref={resultRef} className="space-y-6">
          {(() => {
            const low = checklist.estimated_costs?.your_cost_low ?? null;
            const high = checklist.estimated_costs?.your_cost_high ?? null;
            let headline = 'Estimate ready.';
            if (low != null && high != null) {
              const meaningful = high > low * 1.1;
              headline = meaningful
                ? `Your estimated cost: ${formatCurrency(low)}–${formatCurrency(high)}.`
                : `Your estimated cost: ${formatCurrency(low)}.`;
            } else if (low != null) {
              headline = `Your estimated cost: ${formatCurrency(low)}.`;
            } else if (high != null) {
              headline = `Your estimated cost: ${formatCurrency(high)}.`;
            }
            const supportingFact = checklist.prior_authorization?.likely_required === true
              ? 'Prior authorization required.'
              : undefined;
            return (
              <VerdictBanner
                eyebrow="ESTIMATE READY"
                headline={headline}
                supportingFact={supportingFact}
              />
            );
          })()}

          {/* Header */}
          <div data-reveal-section className="bg-white border border-[#E5E2DC] rounded-none p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#0D0D0D]">
                Pre-Visit Checklist: {getActualVisitType()}
              </h3>
              <button
                onClick={reset}
                className="px-4 py-2 text-[#6B6B6B] hover:text-[#0D0D0D] hover:bg-[#F9F8F6] rounded-none transition"
              >
                Plan Another Visit
              </button>
            </div>

            {checklist?.coverage_summary && (
            <p
              className="text-[#6B6B6B]"
              dangerouslySetInnerHTML={{ __html: replaceJargon(checklist.coverage_summary) }}
            />
            )}
          </div>

          {/* Cost Breakdown */}
          {checklist.estimated_costs && (
          <div data-reveal-section className="bg-white border border-[#E5E2DC] rounded-none p-6">
            <h4 className="text-lg font-semibold text-[#0D0D0D] mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Estimated Costs</h4>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-[#6B6B6B] mb-2">
                <span>Typical Range</span>
                <span>{formatCurrency(checklist.estimated_costs?.typical_range_low)} - {formatCurrency(checklist.estimated_costs?.typical_range_high)}</span>
              </div>
            </div>

            <VisualCostBreakdown
              totalCost={checklist.estimated_costs?.typical_range_high ?? 0}
              deductiblePortion={checklist.estimated_costs?.deductible_applies ? Math.min(checklist.estimated_costs?.deductible_remaining ?? 0, checklist.estimated_costs?.your_cost_high ?? 0) : 0}
              copayPortion={checklist.estimated_costs?.copay_if_applicable ?? 0}
              coinsurancePortion={(checklist.estimated_costs?.your_cost_high ?? 0) - (checklist.estimated_costs?.copay_if_applicable ?? 0) - (checklist.estimated_costs?.deductible_applies ? Math.min(checklist.estimated_costs?.deductible_remaining ?? 0, checklist.estimated_costs?.your_cost_high ?? 0) : 0)}
              insurancePays={(checklist.estimated_costs?.typical_range_high ?? 0) - (checklist.estimated_costs?.your_cost_high ?? 0)}
            />

            <div className="mt-4 p-4 bg-[#F9F8F6] rounded-none">
              <p className="text-sm text-[#6B6B6B]">
                <strong>Your estimated cost:</strong> {formatCurrency(checklist.estimated_costs?.your_cost_low)} - {formatCurrency(checklist.estimated_costs?.your_cost_high)}
              </p>
              {checklist.estimated_costs?.deductible_applies && (
                <p className="text-sm text-[#6B6B6B] mt-1">
                  You've reached your out-of-pocket max! Insurance pays 100% for covered services. Your deductible remaining: {formatCurrency(checklist.estimated_costs?.deductible_remaining, 'Unknown')}
                </p>
              )}
            </div>
          </div>
          )}

          {/* Prior Authorization */}
          {checklist.prior_authorization?.likely_required && (
            <div data-reveal-section className="bg-[#FFFBEB] border-l-4 border-[#D97706] rounded-none p-6">
              <h4 className="text-lg font-semibold text-[#D97706] mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Prior Authorization Required</h4>
              <div className="space-y-2 text-[#D97706]">
                <p><strong>Why:</strong> {checklist.prior_authorization?.reason ?? ''}</p>
                <p><strong>How to obtain:</strong> {checklist.prior_authorization?.how_to_obtain ?? ''}</p>
                <p><strong>Timeline:</strong> {checklist.prior_authorization?.typical_timeline ?? ''}</p>
                <p><strong>If skipped:</strong> {checklist.prior_authorization?.consequence_if_skipped ?? ''}</p>
              </div>
            </div>
          )}

          {/* Questions to Ask */}
          {(checklist?.questions_to_ask_provider ?? []).length > 0 && (
          <div data-reveal-section className="bg-white border border-[#E5E2DC] rounded-none p-6">
            <h4 className="text-lg font-semibold text-[#0D0D0D] mb-4">Questions to Ask Your Provider</h4>
            <ul className="space-y-2">
              {(checklist?.questions_to_ask_provider ?? []).map((question, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#0A6640] mt-1">•</span>
                  <span
                    className="text-[#0D0D0D]"
                    dangerouslySetInnerHTML={{ __html: replaceJargon(question) }}
                  />
                </li>
              ))}
            </ul>
          </div>
          )}

          {/* Questions for Insurance */}
          {(checklist?.questions_to_ask_insurance ?? []).length > 0 && (
            <div data-reveal-section className="bg-white border border-[#E5E2DC] rounded-none p-6">
              <h4 className="text-lg font-semibold text-[#0D0D0D] mb-4">Questions to Call Your Insurance About</h4>
              <ul className="space-y-2">
                {(checklist?.questions_to_ask_insurance ?? []).map((question, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#0A6640] mt-1">•</span>
                    <span
                      className="text-[#0D0D0D]"
                      dangerouslySetInnerHTML={{ __html: replaceJargon(question) }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Documents to Request */}
          {(checklist?.documents_to_request_after ?? []).length > 0 && (
          <div data-reveal-section className="bg-white border border-[#E5E2DC] rounded-none p-6">
            <h4 className="text-lg font-semibold text-[#0D0D0D] mb-4">Documents to Request After Your Visit</h4>
            <ul className="space-y-2">
              {(checklist?.documents_to_request_after ?? []).map((doc, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#0A6640] mt-1">•</span>
                  <span
                    className="text-[#0D0D0D]"
                    dangerouslySetInnerHTML={{ __html: replaceJargon(doc) }}
                  />
                </li>
              ))}
            </ul>
          </div>
          )}

          {/* Network Warnings */}
          {(checklist?.network_warnings ?? []).length > 0 && (
            <div data-reveal-section className="bg-[#FDF2F2] border-l-4 border-[#C0392B] rounded-none p-6">
              <h4 className="text-lg font-semibold text-[#C0392B] mb-4">Network Warnings</h4>
              <ul className="space-y-2">
                {(checklist?.network_warnings ?? []).map((warning, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#C0392B] mt-1">•</span>
                    <span
                      className="text-[#C0392B]"
                      dangerouslySetInnerHTML={{ __html: replaceJargon(warning) }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Money-Saving Tips */}
          {(checklist?.money_saving_tips ?? []).length > 0 && (
          <div data-reveal-section className="bg-[#E8F5EE] border-l-4 border-[#0A6640] rounded-none p-6">
            <h4 className="text-lg font-semibold text-[#0A6640] mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Money-Saving Tips</h4>
            <ul className="space-y-2">
              {(checklist?.money_saving_tips ?? []).map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#0A6640] mt-1">•</span>
                  <span
                    className="text-[#0A6640]"
                    dangerouslySetInnerHTML={{ __html: replaceJargon(tip) }}
                  />
                </li>
              ))}
            </ul>
          </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-[#FDF2F2] border-l-4 border-[#C0392B] rounded-none p-4 text-[#C0392B]">
          The request failed. Check your connection and try again.
          <button onClick={reset} className="ml-4 underline hover:no-underline">Try again</button>
        </div>
      )}
    </div>
  );
}
