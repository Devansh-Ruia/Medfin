'use client';

import { useState } from 'react';
import { api, PolicyData, OptimizationResult } from '../lib/api';
import MarkdownRenderer from './MarkdownRenderer';

interface OptimizationToolProps {
  policyData: PolicyData;
}

export default function OptimizationTool({ policyData }: OptimizationToolProps) {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // User needs form
  const [needs, setNeeds] = useState({
    annual_doctor_visits: 5,
    specialist_visits: 2,
    prescriptions_monthly: 1,
    planned_procedures: '',
    chronic_conditions: false,
    family_planning: false,
    mental_health_needs: false,
    priority: 'balanced', // 'low_premium', 'low_deductible', 'balanced'
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.optimizePolicy(policyData, needs);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <div className="space-y-6">
          {/* Needs Assessment Form */}
          <div className="bg-white border border-[#E5E2DC] rounded-none p-6">
            <h3 className="text-lg font-semibold text-[#0D0D0D] mb-4">
              Tell us about your healthcare needs
            </h3>
            <p className="text-[#6B6B6B] mb-6">
              Help AI understand your situation to provide personalized recommendations
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                  Annual doctor visits
                </label>
                <input
                  type="number"
                  value={needs.annual_doctor_visits}
                  onChange={(e) => setNeeds({ ...needs, annual_doctor_visits: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                  Specialist visits per year
                </label>
                <input
                  type="number"
                  value={needs.specialist_visits}
                  onChange={(e) => setNeeds({ ...needs, specialist_visits: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                  Monthly prescriptions
                </label>
                <input
                  type="number"
                  value={needs.prescriptions_monthly}
                  onChange={(e) => setNeeds({ ...needs, prescriptions_monthly: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0D0D0D] mb-1">
                  Planned procedures (if any)
                </label>
                <input
                  type="text"
                  value={needs.planned_procedures}
                  onChange={(e) => setNeeds({ ...needs, planned_procedures: e.target.value })}
                  placeholder="e.g., surgery, MRI"
                  className="w-full px-4 py-3 border border-[#E5E2DC] rounded-none text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#0D0D0D] mb-2">
                  What's most important to you?
                </label>
                <div className="flex gap-4">
                  {[
                    { value: 'low_premium', label: 'Lowest monthly cost' },
                    { value: 'low_deductible', label: 'Low out-of-pocket' },
                    { value: 'balanced', label: 'Balanced coverage' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNeeds({ ...needs, priority: opt.value })}
                      className={`flex-1 py-3 px-4 rounded-none border-2 text-sm transition ${
                        needs.priority === opt.value
                          ? 'border-[#0A6640] bg-[#E8F5EE] text-[#0A6640]'
                          : 'border-[#E5E2DC] hover:border-[#6B6B6B]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-4">
                {[
                  { key: 'chronic_conditions', label: 'Chronic conditions' },
                  { key: 'family_planning', label: 'Family planning' },
                  { key: 'mental_health_needs', label: 'Mental health needs' },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needs[opt.key as keyof typeof needs] as boolean}
                      onChange={(e) => setNeeds({ ...needs, [opt.key]: e.target.checked })}
                      className="w-4 h-4 rounded-none border-[#E5E2DC]"
                    />
                    <span className="text-sm text-[#0D0D0D]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-6 w-full py-4 bg-[#0D0D0D] text-white text-sm px-8 py-4 rounded-none font-medium disabled:opacity-50 transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </span>
              ) : (
                'Get AI Recommendations'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results */}
          <div className="space-y-6">
            {/* Potential Annual Savings */}
            <div className="bg-white border border-[#E5E2DC] rounded-none p-6">
              <p className="text-xs text-[#6B6B6B] uppercase tracking-widest mb-2">Potential Annual Savings</p>
              <p className="text-2xl font-bold text-[#0A6640]">
                ${(result.annual_potential_savings || 0).toLocaleString()}
              </p>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="bg-white border border-[#E5E2DC] rounded-none p-6">
                <h3 className="text-lg font-semibold text-[#0D0D0D] mb-2">AI Summary</h3>
                <p className="text-sm text-[#6B6B6B]">{result.summary}</p>
              </div>
            )}

            {/* Optimizations */}
            {result.optimizations && result.optimizations.length > 0 && (
              <div className="bg-white border border-[#E5E2DC] rounded-none p-6">
                <h3 className="text-lg font-semibold text-[#0D0D0D] mb-4">Optimization Opportunities</h3>
                <div className="space-y-4">
                  {result.optimizations
                    .sort((a, b) => a.priority - b.priority)
                    .map((opt, i) => (
                      <div key={i} className="border-l-4 border-l-[#C0392B] bg-[#FDF2F2] p-4 rounded-none">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-[#6B6B6B] uppercase tracking-widest">Priority</span>
                              <span className="text-xs font-medium text-[#0D0D0D]">/{opt.category}</span>
                            </div>
                            <MarkdownRenderer className="text-sm font-semibold text-[#0D0D0D] mt-1">{opt.recommendation}</MarkdownRenderer>
                          </div>
                          {opt.potential_savings > 0 && (
                            <div className="text-right ml-4">
                              <p className="text-sm text-[#6B6B6B]">Save up to</p>
                              <p className="text-sm font-semibold text-[#0A6640]">${opt.potential_savings}</p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-[#6B6B6B] mt-1">Effort: {opt.effort_level}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Alternative Plans */}
            {result.alternative_plans && result.alternative_plans.length > 0 && (
              <div className="bg-white border border-[#E5E2DC] rounded-none p-6">
                <h3 className="text-lg font-semibold text-[#0D0D0D] mb-4">Alternative Plans to Consider</h3>
                <div className="space-y-4">
                  {result.alternative_plans.map((plan, i) => (
                    <div key={i} className="p-4 border border-[#E5E2DC] rounded-none">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-[#0D0D0D]">{plan.plan_type}</h4>
                        <span className={`text-sm font-medium ${
                          plan.estimated_premium_change < 0 ? 'text-[#0A6640]' : 'text-[#C0392B]'
                        }`}>
                          {plan.estimated_premium_change < 0 ? '-' : '+'}${Math.abs(plan.estimated_premium_change)}/mo
                        </span>
                      </div>
                      <p className="text-sm text-[#6B6B6B] mb-2">{plan.why_consider}</p>
                      <p className="text-xs text-[#6B6B6B]">
                        <strong>Trade-offs:</strong> {plan.coverage_trade_offs}
                      </p>
                      <p className="text-xs text-[#0A6640] mt-1">Best for: {plan.best_for}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            {result.action_items && result.action_items.length > 0 && (
              <div className="bg-white border border-[#E5E2DC] rounded-none p-6">
                <h3 className="text-lg font-semibold text-[#0D0D0D] mb-4">Action Items</h3>
                <div className="space-y-3">
                  {result.action_items
                    .sort((a, b) => a.priority - b.priority)
                    .map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-[#F9F8F6] rounded-none">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          item.priority === 1 ? 'bg-[#FDF2F2] text-[#C0392B]' :
                          item.priority === 2 ? 'bg-[#FFFBEB] text-[#D97706]' :
                          'bg-[#E8F5EE] text-[#0A6640]'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[#0D0D0D]">{item.action}</p>
                          <p className="text-xs text-[#6B6B6B]">{item.timeline}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 border border-[#E5E2DC] bg-white text-[#0D0D0D] text-sm px-6 py-3 rounded-none font-medium hover:bg-[#F9F8F6] transition"
            >
              Update My Needs & Re-analyze
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[#FDF2F2] border-l-4 border-[#C0392B] rounded-none p-4 text-[#C0392B]">
          The request failed. Check your connection and try again.
        </div>
      )}
    </div>
  );
}
