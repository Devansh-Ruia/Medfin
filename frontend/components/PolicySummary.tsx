'use client';

import { useState } from 'react';
import { PolicyData } from '../lib/api';
import { formatCurrency } from '../lib/format';

interface PolicySummaryProps {
  policyData: PolicyData;
}

export default function PolicySummary({ policyData }: PolicySummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-6">
      {/* Policy Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-heading mb-1">
            Policy: {policyData.insurance_company || 'Insurance Company 1'} • {policyData.plan_name || 'Plan Option 1'}
          </h2>
          <span className="text-muted">Score: {policyData.policy_strength_score || '72'}/100</span>
        </div>
        <button className="text-accent hover:text-accent/90 text-sm font-medium transition-colors">
          Upload New Policy
        </button>
      </div>

      {/* Policy Details - Inline List Style */}
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-muted">Deductible</span>
          <span className="font-semibold text-heading">
            {formatCurrency(policyData.annual_deductible_individual || 500)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-muted">Out-of-Pocket Max</span>
          <span className="font-semibold text-heading">
            {formatCurrency(policyData.out_of_pocket_max_individual || 2500)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-muted">PCP Copay</span>
          <span className="font-semibold text-heading">
            {formatCurrency(policyData.copay_primary_care || 35)}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-muted">Coinsurance</span>
          <span className="font-semibold text-heading">
            {policyData.coinsurance_in_network || 20}%
          </span>
        </div>
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-accent hover:text-accent/90 text-sm font-medium transition-colors mt-4"
      >
        {expanded ? 'Hide' : 'Show'} Full Policy Details
      </button>

      {expanded && (
        <div className="mt-4 border-t border-[#E5E2DC] pt-4 space-y-4">

          {/* COSTS */}
          {[policyData.specialist_copay, policyData.urgent_care_copay, policyData.er_copay,
            policyData.deductible_family, policyData.out_of_pocket_max_family,
            policyData.telehealth_copay].some(Boolean) && (
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] mb-2">Costs</p>
              {[
                ["Specialist Copay", policyData.specialist_copay],
                ["Urgent Care Copay", policyData.urgent_care_copay],
                ["ER Copay", policyData.er_copay],
                ["Family Deductible", policyData.deductible_family],
                ["Family Out-of-Pocket Max", policyData.out_of_pocket_max_family],
                ["Telehealth Copay", policyData.telehealth_copay],
              ].filter(([_, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex justify-between py-2 border-b border-[#E5E2DC] text-sm">
                  <span className="text-[#6B6B6B]">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* COVERAGE */}
          {[policyData.mental_health_coverage, policyData.prescription_tier1,
            policyData.preventive_care_covered, policyData.physical_therapy_copay].some(Boolean) && (
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] mb-2">Coverage</p>
              {[
                ["Mental Health", policyData.mental_health_coverage],
                ["Physical Therapy", policyData.physical_therapy_copay],
                ["Physical Therapy Limit", policyData.physical_therapy_limit],
                ["Preventive Care", policyData.preventive_care_covered === true ? "100% covered" : policyData.preventive_care_covered],
                ["Lab Work", policyData.lab_work_cost],
                ["Diagnostic Imaging", policyData.diagnostic_imaging_cost],
                ["Generic Rx (Tier 1)", policyData.prescription_tier1],
                ["Brand Rx (Tier 2)", policyData.prescription_tier2],
                ["Non-Preferred Rx (Tier 3)", policyData.prescription_tier3],
                ["Specialty Rx (Tier 4)", policyData.prescription_tier4],
              ].filter(([_, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex justify-between py-2 border-b border-[#E5E2DC] text-sm">
                  <span className="text-[#6B6B6B]">{label}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* PLAN DETAILS */}
          {[policyData.insurance_company, policyData.plan_id, policyData.effective_date,
            policyData.referral_required, policyData.prior_authorization_required].some(v => v !== null && v !== undefined) && (
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] mb-2">Plan Details</p>
              {[
                ["Insurance Company", policyData.insurance_company],
                ["Plan ID", policyData.plan_id],
                ["Effective Date", policyData.effective_date],
                ["Referral Required", policyData.referral_required === false ? "No" : policyData.referral_required === true ? "Yes" : policyData.referral_required],
                ["Prior Authorization", policyData.prior_authorization_required],
              ].filter(([_, v]) => v !== null && v !== undefined && v !== "").map(([label, value]) => (
                <div key={label as string} className="flex justify-between py-2 border-b border-[#E5E2DC] text-sm">
                  <span className="text-[#6B6B6B]">{label}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* ASSESSMENT */}
          {(policyData.score_reasoning || (policyData.coverage_gaps && policyData.coverage_gaps.length > 0) || (policyData.strengths && policyData.strengths.length > 0)) && (
            <div>
              <p className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] mb-2">Assessment</p>
              {policyData.score_reasoning && (
                <p className="text-sm text-[#6B6B6B] mb-3">{policyData.score_reasoning}</p>
              )}
              {policyData.strengths && policyData.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-[#0A6640] mb-1">Strengths</p>
                  {policyData.strengths.map((s: string, i: number) => (
                    <p key={i} className="text-sm text-[#6B6B6B] py-1 border-b border-[#E5E2DC]">{s}</p>
                  ))}
                </div>
              )}
              {policyData.coverage_gaps && policyData.coverage_gaps.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#C0392B] mb-1">Coverage Gaps</p>
                  {policyData.coverage_gaps.map((g: string, i: number) => (
                    <p key={i} className="text-sm text-[#6B6B6B] py-1 border-b border-[#E5E2DC]">{g}</p>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
