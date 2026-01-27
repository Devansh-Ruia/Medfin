'use client';

import { useState, useEffect } from 'react';
import { api, InsuranceInfo, MedicalBill, AssistanceMatch } from '../lib/api';

interface AssistanceProgramsProps {
  insuranceInfo: InsuranceInfo;
  bills: MedicalBill[];
  monthlyIncome: number;
  householdSize: number;
}

export default function AssistancePrograms({
  insuranceInfo,
  bills,
  monthlyIncome,
  householdSize,
}: AssistanceProgramsProps) {
  const [match, setMatch] = useState<AssistanceMatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hardshipLevel, setHardshipLevel] = useState<string>('');

  const handleMatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.matchAssistance({
        insurance: insuranceInfo,
        monthly_income: monthlyIncome,
        household_size: householdSize,
        medical_bills: bills,
        hardship_level: hardshipLevel || undefined,
      });
      setMatch(response);
    } catch (err) {
      setError('Failed to match assistance programs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Assistance</h2>
        <p className="text-gray-600">Find programs that can help reduce your healthcare costs</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Financial Hardship Level (Optional)</label>
            <select
              value={hardshipLevel}
              onChange={(e) => setHardshipLevel(e.target.value)}
              className="input-field"
            >
              <option value="">Select if applicable...</option>
              <option value="none">None</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleMatch}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Find Assistance Programs'}
            </button>
          </div>
        </div>
      </div>

      {match && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="text-sm text-gray-500 mb-1">Programs Found</div>
              <div className="text-2xl font-bold text-primary-600">1</div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-500 mb-1">Potential Savings</div>
              <div className="text-2xl font-bold text-green-600">
                ${match.estimated_savings ? match.estimated_savings.toLocaleString() : '0'}
              </div>
            </div>

            <div className="card">
              <div className="text-sm text-gray-500 mb-1">Top Priority</div>
              <div className="text-lg font-semibold text-gray-900">
                {match.program_name || 'None'}
              </div>
            </div>
          </div>

          {true && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recommended Application Order
              </h3>
              <div className="space-y-2">
                {[match].map((program, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 bg-primary-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 font-medium text-primary-900">{program.program_name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {true && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Matched Programs
              </h3>
              <div className="space-y-4">
                {[match].map((program, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      true
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{program.program_name}</h4>
                          {true && (
                            <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {program.provider}
                        </div>
                      </div>
                      {program.estimated_savings && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Max Benefit</div>
                          <div className="font-bold text-green-600">
                            ${program.estimated_savings.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Eligibility Requirements</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {program.eligibility_criteria.map((req: string, reqIndex: number) => (
                          <li key={reqIndex} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Application Process</div>
                      <p className="text-sm text-gray-600">{program.application_process}</p>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Documentation Required</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {program.application_process.map((doc: string, docIndex: number) => (
                          <li key={docIndex} className="flex items-start space-x-2">
                            <span className="text-primary-500 mt-0.5">•</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Contact:</span>
                          <div className="font-medium text-gray-900">{program.provider}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Approval Time:</span>
                          <div className="font-medium text-gray-900">{"2-4 weeks"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {!match && !loading && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Find Assistance</h3>
          <p className="text-gray-600">
            Click the button above to search for financial assistance programs
          </p>
        </div>
      )}
    </div>
  );
}
