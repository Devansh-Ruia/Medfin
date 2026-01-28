'use client';

import { useState, useRef } from 'react';
import { api, PolicyData, BillValidationResult } from '../lib/api';

interface ValidationToolProps {
  policyData: PolicyData;
}

export default function ValidationTool({ policyData }: ValidationToolProps) {
  const [result, setResult] = useState<BillValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Analyze
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.uploadBill(file, policyData);
      setResult(response);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!result && !loading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white rounded-2xl shadow-lg p-12 text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Take a Photo of Your Bill
          </h3>
          <p className="text-gray-600 mb-4">
            AI will extract the details and validate against your policy
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
            Upload Bill Photo
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing your bill...</h3>
          <p className="text-gray-600">AI is extracting charges and validating against your policy</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Billed Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(result.financial_summary?.billed_amount || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Your Responsibility</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(result.financial_summary?.actual_patient_responsibility || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Expected Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ${(result.financial_summary?.expected_patient_responsibility || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-500 uppercase">Potential Savings</p>
              <p className="text-2xl font-bold text-blue-600">
                ${(result.financial_summary?.potential_savings || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Validation Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Results</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-3 rounded-lg text-center ${
                result.validation_results?.deductible_applied_correctly 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                <p className="text-2xl">{result.validation_results?.deductible_applied_correctly ? '✓' : '✗'}</p>
                <p className="text-xs font-medium">Deductible</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${
                result.validation_results?.copays_correct 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                <p className="text-2xl">{result.validation_results?.copays_correct ? '✓' : '✗'}</p>
                <p className="text-xs font-medium">Copays</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${
                result.validation_results?.coinsurance_correct 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                <p className="text-2xl">{result.validation_results?.coinsurance_correct ? '✓' : '✗'}</p>
                <p className="text-xs font-medium">Coinsurance</p>
              </div>
              <div className="p-3 rounded-lg text-center bg-blue-50 text-blue-700">
                <p className="text-2xl">{result.confidence_score || 0}%</p>
                <p className="text-xs font-medium">Confidence</p>
              </div>
            </div>

            {/* Issues Found */}
            {result.issues_found && result.issues_found.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Issues Found</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.issues_found.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={reset}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Validate Another Bill
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
          <button onClick={reset} className="ml-4 underline">Try again</button>
        </div>
      )}
    </div>
  );
}
