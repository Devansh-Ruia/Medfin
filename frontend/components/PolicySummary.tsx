'use client';

import { useState } from 'react';
import { PolicyData } from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/format';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
            ${formatCurrency(policyData.annual_deductible_individual || 500)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-muted">Out-of-Pocket Max</span>
          <span className="font-semibold text-heading">
            ${formatCurrency(policyData.out_of_pocket_max_individual || 2500)}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-muted">PCP Copay</span>
          <span className="font-semibold text-heading">
            ${policyData.copay_primary_care || 35}
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
        <div className="mt-6 space-y-6">
          {/* Coverage Gaps */}
          {policyData.coverage_gaps && policyData.coverage_gaps.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
              <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Coverage Gaps
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {policyData.coverage_gaps.map((gap, i) => (
                  <li key={i}>• {gap}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Benefits */}
          {policyData.key_benefits && policyData.key_benefits.length > 0 && (
            <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-r-xl p-4">
              <h4 className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Key Benefits
              </h4>
              <ul className="text-sm text-emerald-700 space-y-1">
                {policyData.key_benefits.map((benefit, i) => (
                  <li key={i}>• {benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* All Policy Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-medium text-heading mb-4">All Policy Parameters</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {Object.entries(policyData)
                .filter(([key]) => !['coverage_gaps', 'key_benefits', 'recommendations', 'error', 'raw_response'].includes(key))
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-muted text-xs mb-1">{key.replace(/_/g, ' ')}</p>
                    <p className="text-heading font-medium">
                      {value === null ? 'N/A' : 
                         typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                         typeof value === 'number' ? formatNumber(value) :
                         Array.isArray(value) ? value.join(', ') :
                         String(value)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
