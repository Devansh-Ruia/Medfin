'use client';

import { useState } from 'react';
import { PolicyData } from '../lib/api';

interface PolicySummaryProps {
  policyData: PolicyData;
}

export default function PolicySummary({ policyData }: PolicySummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-blue-50 to-green-50">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Deductible</p>
          <p className="text-2xl font-bold text-gray-900">
            ${(policyData.annual_deductible_individual || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Out-of-Pocket Max</p>
          <p className="text-2xl font-bold text-gray-900">
            ${(policyData.out_of_pocket_max_individual || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">PCP Copay</p>
          <p className="text-2xl font-bold text-gray-900">
            ${policyData.copay_primary_care || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Coinsurance</p>
          <p className="text-2xl font-bold text-gray-900">
            {policyData.coinsurance_in_network || 'N/A'}%
          </p>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="p-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <span>{expanded ? 'Hide' : 'Show'} Full Policy Details</span>
          <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {expanded && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coverage Gaps */}
            {policyData.coverage_gaps && policyData.coverage_gaps.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Coverage Gaps</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {policyData.coverage_gaps.map((gap, i) => (
                    <li key={i}>• {gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Benefits */}
            {policyData.key_benefits && policyData.key_benefits.length > 0 && (
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">✓ Key Benefits</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {policyData.key_benefits.map((benefit, i) => (
                    <li key={i}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* All Policy Details */}
            <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-3">All Policy Parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {Object.entries(policyData)
                  .filter(([key]) => !['coverage_gaps', 'key_benefits', 'recommendations', 'error', 'raw_response'].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-500 text-xs">{key.replace(/_/g, ' ')}</p>
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
