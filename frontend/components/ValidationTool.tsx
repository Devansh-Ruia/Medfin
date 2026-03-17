'use client';

import { useState, useRef } from 'react';
import { api, PolicyData, BillValidationResult } from '../lib/api';
import { event } from '../lib/analytics';
import { Search, Lightbulb, Check, ArrowRight } from 'lucide-react';

interface ValidationToolProps {
  policyData: PolicyData;
}

// Markdown parsing helpers
const formatInlineMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-[#F9F8F6] px-1 py-0.5 rounded-none text-sm">$1</code>');
};

const parseMarkdownText = (text: string): JSX.Element[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const elements: JSX.Element[] = [];
  let currentList: { type: 'ordered' | 'unordered' | null; items: string[] } = { type: null, items: [] };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Check for ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      if (currentList.type !== 'ordered') {
        if (currentList.items.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="space-y-1 mb-4">
              {currentList.items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#6B6B6B]">•</span>
                  <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                </li>
              ))}
            </ul>
          );
        }
        currentList = { type: 'ordered', items: [] };
      }
      currentList.items.push(trimmed.replace(/^\d+\.\s/, ''));
      return;
    }
    
    // Check for unordered list
    if (/^[•\-\*]\s/.test(trimmed)) {
      if (currentList.type !== 'unordered') {
        if (currentList.items.length > 0) {
          elements.push(
            <ol key={`list-${index}`} className="space-y-1 mb-4 list-decimal list-inside">
              {currentList.items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
              ))}
            </ol>
          );
        }
        currentList = { type: 'unordered', items: [] };
      }
      currentList.items.push(trimmed.replace(/^[•\-\*]\s/, ''));
      return;
    }
    
    // Regular paragraph
    if (currentList.items.length > 0) {
      if (currentList.type === 'ordered') {
        elements.push(
          <ol key={`list-${index}`} className="space-y-1 mb-4 list-decimal list-inside">
            {currentList.items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${index}`} className="space-y-1 mb-4">
            {currentList.items.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
              </li>
            ))}
          </ul>
        );
      }
      currentList = { type: null, items: [] };
    }
    
    elements.push(
      <p key={`para-${index}`} className="mb-4" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
    );
  });
  
  // Handle remaining list
  if (currentList.items.length > 0) {
    if (currentList.type === 'ordered') {
      elements.push(
        <ol key="final-list" className="space-y-1 mb-4 list-decimal list-inside">
          {currentList.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key="final-list" className="space-y-1 mb-4">
          {currentList.items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#6B6B6B]">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            </li>
          ))}
        </ul>
      );
    }
  }
  
  return elements;
};

// FormattedText component
const FormattedText = ({ text }: { text: string }) => {
  const hasMarkdown = /\*\*.*?\*\*|`.*?`|^\d+\.\s|^[•\-\*]\s/m.test(text);
  
  if (hasMarkdown) {
    return <>{parseMarkdownText(text)}</>;
  }
  
  return <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />;
};

// Confidence Meter Component
function ConfidenceMeter({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-[#0A6640]' : value >= 60 ? 'bg-[#D97706]' : 'bg-[#C0392B]';
  
  const getWidthClass = () => {
    if (value >= 90) return 'w-[90%]';
    if (value >= 80) return 'w-[80%]';
    if (value >= 70) return 'w-[70%]';
    if (value >= 60) return 'w-[60%]';
    if (value >= 50) return 'w-[50%]';
    if (value >= 40) return 'w-[40%]';
    if (value >= 30) return 'w-[30%]';
    if (value >= 20) return 'w-[20%]';
    if (value >= 10) return 'w-[10%]';
    return 'w-[5%]';
  };
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[#E5E2DC] rounded-none overflow-hidden">
        <div className={`h-full ${color} transition-all ${getWidthClass()}`} />
      </div>
      <span className="text-sm font-medium text-[#0D0D0D]">{value}%</span>
    </div>
  );
}

export default function ValidationTool({ policyData }: ValidationToolProps) {
  const [result, setResult] = useState<BillValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showBillDetails, setShowBillDetails] = useState(false);
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
      event('upload_bill');
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
    setShowBillDetails(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!result && !loading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-[#E5E2DC] p-16 text-center cursor-pointer hover:border-[#6B6B6B] hover:bg-[#F9F8F6] transition-all rounded-none"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload bill photo for validation"
            title="Upload bill photo for validation"
          />
          
          <h3 className="text-2xl font-bold text-[#0D0D0D] mb-3">
            Take a Photo of Your Bill
          </h3>
          <p className="text-[#6B6B6B] mb-8 text-lg">
            AI will extract the details and validate against your policy
          </p>
          <button className="px-6 py-3 bg-[#0D0D0D] text-white rounded-none font-medium hover:bg-[#1A1A1A] transition-all">
            Upload Bill Photo
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-[#E5E2DC] p-16 text-center rounded-none">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#F9F8F6] rounded-none animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-none flex items-center justify-center">
              <span className="text-3xl animate-bounce"><Search className="w-8 h-8" /></span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[#0D0D0D] mb-3">Analyzing your bill...</h3>
          <p className="text-[#6B6B6B]">AI is extracting charges and validating against your policy</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Header */}
          {result.financial_summary && (
            <div className="text-sm text-[#6B6B6B] mb-6">
              Billed: ${(result.financial_summary?.billed_amount || 0).toLocaleString()} / Expected: ${(result.financial_summary?.expected_patient_responsibility || 0).toLocaleString()} / Potential savings: ${(result.financial_summary?.potential_savings || 0).toLocaleString()}
            </div>
          )}

          {/* Validation Results */}
          <div className="bg-white border border-[#E5E2DC] rounded-none p-6">
            <h3 className="text-xl font-bold text-[#0D0D0D] mb-6">Validation Results</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-none text-center">
                <p className="text-2xl">
                  {result.validation_results?.deductible_applied_correctly ? (
                    <span className="text-[#0A6640]"><Check className="w-6 h-6" /></span>
                  ) : (
                    <span className="text-[#C0392B]">—</span>
                  )}
                </p>
                <p className="text-sm font-medium text-[#0D0D0D]">Deductible</p>
              </div>
              <div className="p-4 rounded-none text-center">
                <p className="text-2xl">
                  {result.validation_results?.copays_correct ? (
                    <span className="text-[#0A6640]"><Check className="w-6 h-6" /></span>
                  ) : (
                    <span className="text-[#C0392B]">—</span>
                  )}
                </p>
                <p className="text-sm font-medium text-[#0D0D0D]">Copays</p>
              </div>
              <div className="p-4 rounded-none text-center">
                <p className="text-2xl">
                  {result.validation_results?.coinsurance_correct ? (
                    <span className="text-[#0A6640]"><Check className="w-6 h-6" /></span>
                  ) : (
                    <span className="text-[#C0392B]">—</span>
                  )}
                </p>
                <p className="text-sm font-medium text-[#0D0D0D]">Coinsurance</p>
              </div>
              <div className="p-4 rounded-none text-center bg-[#F9F8F6] text-[#0D0D0D]">
                <ConfidenceMeter value={result.confidence_score || 0} />
              </div>
            </div>

            {/* Issues Section */}
            {(() => {
              // Normalize old format to new format for backward compatibility
              const issues = result.issues || (result.issues_found || []).map((w: any) => ({
                type: 'billing_error' as const,
                severity: 'medium' as const,
                description: typeof w === 'string' ? w : w.description || '',
                solution: typeof w === 'string' ? 'Contact your provider billing department to discuss this charge.' : w.solution || '',
                potential_savings: null
              }));

              return issues && issues.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-[#0D0D0D]">
                    Issues Found ({issues.length})
                  </h3>
                  {issues.map((issue, index) => (
                    <div 
                      key={index} 
                      className="border border-[#E5E2DC] rounded-none overflow-hidden"
                    >
                      {/* Issue Header */}
                      <div className={`px-4 py-3 flex items-start gap-3 ${
                        issue.severity === 'high' ? 'bg-[#FDF2F2] border-l-4 border-[#C0392B]' :
                        issue.severity === 'medium' ? 'bg-[#FFFBEB] border-l-4 border-[#D97706]' :
                        'bg-[#F9F8F6] border-l-4 border-[#6B6B6B]'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs tracking-widest font-medium uppercase ${
                              issue.severity === 'high' ? 'text-[#C0392B]' :
                              issue.severity === 'medium' ? 'text-[#D97706]' :
                              'text-[#6B6B6B]'
                            }`}>
                              {issue.severity} / {issue.type.replace(/_/g, ' ')}
                            </span>
                            {issue.potential_savings && (
                              <span className="text-xs font-semibold text-[#0A6640]">
                                Save up to ${issue.potential_savings}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-[#0D0D0D] mt-1">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Solution - directly below issue */}
                      <div className="px-4 py-3 bg-white border-t border-[#E5E2DC]">
                        <div className="flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-[#0A6640] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs tracking-widest text-[#6B6B6B] uppercase mb-1">
                              WHAT TO DO
                            </p>
                            <p className="text-sm text-[#6B6B6B] leading-relaxed">
                              {issue.solution}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Summary Section */}
            {result.summary && (
              <div className="mt-6 p-4 bg-[#F9F8F6] rounded-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#0D0D0D]">
                    {result.summary.total_issues_found} issue{result.summary.total_issues_found !== 1 ? 's' : ''} found
                  </span>
                  {result.summary.total_potential_savings > 0 && (
                    <span className="text-sm font-semibold text-[#0A6640]">
                      Potential savings: ${result.summary.total_potential_savings}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6B6B6B]">{result.summary.overall_assessment}</p>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-[#E8F5EE] border-l-4 border-[#0A6640] rounded-none p-4">
                <h4 className="text-sm font-medium text-[#0A6640] mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Recommendations</h4>
                <ul className="text-sm text-[#0A6640] space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2">
                      <ArrowRight className="w-3 h-3 text-[#0A6640] mt-0.5 flex-shrink-0" />
                      <FormattedText text={rec} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Collapsible Bill Details */}
          {result.bill_extracted && (
            <div className="bg-white border border-[#E5E2DC] rounded-none overflow-hidden">
              <button
                onClick={() => setShowBillDetails(!showBillDetails)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F9F8F6] transition-colors"
              >
                <span className="font-semibold text-[#0D0D0D]">Extracted Bill Details</span>
                <span className={`transition-transform ${showBillDetails ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showBillDetails && (
                <div className="px-6 pb-6 border-t border-[#E5E2DC]">
                  <pre className="mt-4 p-4 bg-[#F9F8F6] rounded-none text-sm overflow-x-auto">
                    {JSON.stringify(result.bill_extracted, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <button
            onClick={reset}
            className="w-full py-3 border border-[#E5E2DC] bg-white text-[#0D0D0D] text-sm px-6 py-3 rounded-none font-medium hover:bg-[#F9F8F6] transition-all"
          >
            Validate Another Bill
          </button>
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
