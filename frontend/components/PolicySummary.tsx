'use client';

import { useState } from 'react';
import { PolicyData } from '../lib/api';

interface PolicySummaryProps {
  policyData: PolicyData;
}

export default function PolicySummary({ policyData }: PolicySummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle overflow-hidden">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-1">Deductible</p>
          <p className="text-2xl font-bold text-gray-900">
            ${(policyData.annual_deductible_individual || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-1">Out-of-Pocket Max</p>
          <p className="text-2xl font-bold text-gray-900">
            ${(policyData.out_of_pocket_max_individual || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-1">PCP Copay</p>
          <p className="text-2xl font-bold text-gray-900">
            ${policyData.copay_primary_care || 'N/A'}
          </p>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-1">Coinsurance</p>
          <p className="text-2xl font-bold text-gray-900">
            {policyData.coinsurance_in_network || 'N/A'}%
          </p>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="p-6 border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <span>{expanded ? 'Hide' : 'Show'} Full Policy Details</span>
          <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {expanded && (
          <div className="mt-6 space-y-6">
            {/* Coverage Gaps */}
            {policyData.coverage_gaps && policyData.coverage_gaps.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                <h4 className="text-sm font-medium text-amber-800 mb-2">⚠️ Coverage Gaps</h4>
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
                <h4 className="text-sm font-medium text-emerald-800 mb-2">✓ Key Benefits</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  {policyData.key_benefits.map((benefit, i) => (
                    <li key={i}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* All Policy Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-4">All Policy Parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {Object.entries(policyData)
                  .filter(([key]) => !['coverage_gaps', 'key_benefits', 'recommendations', 'error', 'raw_response'].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-500 text-xs mb-1">{key.replace(/_/g, ' ')}</p>
                      <p className="text-gray-900 font-medium">
                        {value === null ? 'N/A' : 
                         typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                         typeof value === 'number' ? value.toLocaleString() :
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
    </div>
  );
}
