'use client';

import { useState, useRef } from 'react';
import { api, PolicyData, AppealLetter, DenialInfo } from '../lib/api';
import { replaceJargon } from '../lib/jargonDictionary';
import ReactMarkdown from 'react-markdown';

interface AppealToolProps {
  policyData: PolicyData;
}

export default function AppealTool({ policyData }: AppealToolProps) {
  const [inputMethod, setInputMethod] = useState<'upload' | 'manual'>('upload');
  const [denialInfo, setDenialInfo] = useState<DenialInfo>({});
  const [appealLetter, setAppealLetter] = useState<AppealLetter | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<DenialInfo | null>(null);
  const [tone, setTone] = useState<'professional' | 'firm' | 'escalation'>('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setExtractedInfo(null);

    try {
      const result = await api.uploadDenialLetter(file, policyData, tone);
      setAppealLetter(result);
      setExtractedInfo(result.extracted_denial_info);
    } catch (err) {
      console.error(err);
      setError('Failed to process denial letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!denialInfo.service_description || !denialInfo.denial_reason) {
      setError('Please provide at least the service description and denial reason.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.generateAppealLetter(denialInfo, policyData, tone);
      setAppealLetter(result);
    } catch (err) {
      console.error(err);
      setError('Failed to generate appeal letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  const cleanLetterText = (text: string): string => {
  // Remove all HTML span tags and their jargon content
  // Pattern: matches <span ...>(...)</span> including nested spans
  let cleaned = text;
  // Repeatedly strip innermost spans first to handle nesting
  while (cleaned.includes('<span')) {
    cleaned = cleaned.replace(/<span[^>]*>\([^()]*\)<\/span>/g, '');
    cleaned = cleaned.replace(/<span[^>]*>(.*?)<\/span>/g, '$1');
  }
  // Remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  // Clean up extra whitespace left behind
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned;
};

const formatAppealLetter = (text: string): JSX.Element[] => {
  if (!text) return [];

  let cleaned = text
    .replace(/\r\n/g, '\n');

  // Force line breaks for header fields (each on its own line)
  cleaned = cleaned
    .replace(/(Patient Name:)/g, '\n$1')
    .replace(/(Policy Number:)/g, '\n$1')
    .replace(/(Policy Holder:)/g, '\n$1')
    .replace(/(Patient ID:)/g, '\n$1')
    .replace(/(Group Number:)/g, '\n$1')
    .replace(/(Claim Number:)/g, '\n$1')
    .replace(/(Date of Service:)/g, '\n$1')
    .replace(/(Service Date:)/g, '\n$1')
    .replace(/(Service Description:)/g, '\n$1')
    .replace(/(Amount Denied:)/g, '\n$1')
    .replace(/(Denial Date:)/g, '\n$1')
    .replace(/(Provider:)/g, '\n$1');

  // Force paragraph breaks before major sections
  cleaned = cleaned
    .replace(/\s*(RE:|Dear |To Whom It May Concern)/g, '\n\n$1')
    .replace(/\s*(\*\*(?:Statement of Facts|Basis for Appeal|Argument for Coverage|Applicable Regulations|Relevant Regulations|Requested Action)[:\*]*)/g, '\n\n$1')
    .replace(/\s*(Statement of Facts:|Basis for Appeal:|Argument for Coverage:|Applicable Regulations:|Relevant Regulations:|Requested Action:)/g, '\n\n$1')
    .replace(/\s*(We request that|We respectfully|Therefore,|Thank you for|Please provide a written|We reserve all rights)/g, '\n\n$1')
    .replace(/\s*(Sincerely,)/g, '\n\n$1');

  // Force line breaks for numbered items
  cleaned = cleaned.replace(/\s+(\d+\.\s+\*\*)/g, '\n$1');
  cleaned = cleaned.replace(/\s+(\d+\.\s+[A-Z])/g, '\n$1');

  // Force line breaks in signature block (after Sincerely)
  cleaned = cleaned.replace(/(Sincerely,)\s*/g, '$1\n\n');
  cleaned = cleaned.replace(/(\[Your [^\]]+\])\s*(?=\[Your)/g, '$1\n');
  cleaned = cleaned.replace(/(\[Your [^\]]+\])\s*(?=\[)/g, '$1\n');

  // Collapse excessive newlines
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');

  // Now split into blocks
  // Single newlines become line breaks within a block
  // Double newlines become paragraph separators
  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim());

  return paragraphs.map((para, index) => {
    // Split by single newlines within paragraph for line breaks
    const lines = para.split('\n').filter(l => l.trim());

    const renderLine = (line: string, lineKey: number): JSX.Element => {
      // Convert **bold** to <strong> and strip any remaining **
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</strong>;
        }
        // Also catch any remaining stray ** 
        const cleanPart = part.replace(/\*\*/g, '');
        return <span key={i}>{cleanPart}</span>;
      });
      return <span key={lineKey}>{rendered}</span>;
    };

    // Check if this is a header-type block (contains field labels)
    const isHeaderBlock = para.match(/^(Patient Name:|Date:|Policy Number:|Claim Number:)/m);
    const isSignatureBlock = para.match(/Sincerely/);
    const isNumberedList = para.match(/^\d+\.\s/m);

    if (isHeaderBlock || isSignatureBlock) {
      // Render each line separately with minimal spacing
      return (
        <div key={index} style={{ marginBottom: '16px' }}>
          {lines.map((line, li) => (
            <div key={li} style={{ lineHeight: '1.6' }}>
              {renderLine(line, li)}
            </div>
          ))}
        </div>
      );
    }

    if (isNumberedList) {
      // Render numbered items as separate lines
      return (
        <div key={index} style={{ marginBottom: '16px' }}>
          {lines.map((line, li) => (
            <div key={li} style={{ marginBottom: '8px', lineHeight: '1.7', paddingLeft: line.match(/^\d+\./) ? '0px' : '0' }}>
              {renderLine(line, li)}
            </div>
          ))}
        </div>
      );
    }

    // Regular paragraph
    return (
      <p key={index} style={{ marginBottom: '16px', lineHeight: '1.7' }}>
        {lines.map((line, li) => (
          <span key={li}>
            {renderLine(line, li)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
};

const formatLetterText = (text: string): string => {
  // Ensure double newlines between paragraphs
  let formatted = text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    // Add breaks before common letter sections
    .replace(/(RE:|Dear |Sincerely,|To Whom It May Concern:|Date:|Patient Name:|Policy Number:|Group Number:|Claim Number:|Date of Service:|Provider:|Amount Denied:|Therefore,|We request|Thank you)/g, '\n\n$1')
    // Collapse triple+ newlines to double
    .replace(/\n{3,}/g, '\n\n');
  return formatted.trim();
};

const downloadAsPDF = async () => {
    if (!letterRef.current) return;
    
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: [0.75, 0.75, 0.75, 0.75] as [number, number, number, number],
        filename: 'appeal-letter.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      
      html2pdf().set(opt).from(letterRef.current).save();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      // Fallback to text download if PDF generation fails
      if (appealLetter) {
        const blob = new Blob([appealLetter.letter.letter_body], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'appeal-letter.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const reset = () => {
    setDenialInfo({});
    setAppealLetter(null);
    setExtractedInfo(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSuccessColor = (likelihood: string) => {
    switch (likelihood) {
      case 'High': return 'text-emerald-600 bg-emerald-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Method Selection */}
      {!appealLetter && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Appeal a Denied Claim</h3>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setInputMethod('upload')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                inputMethod === 'upload'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📷 Upload Denial Letter
            </button>
            <button
              onClick={() => setInputMethod('manual')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                inputMethod === 'manual'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Enter Manually
            </button>
          </div>

          {/* Upload Method */}
          {inputMethod === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-label="Upload denial letter"
                />
                <div className="text-4xl mb-4">📄</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Your Denial Letter
                </h4>
                <p className="text-gray-600">
                  AI will extract the details and generate a professional appeal letter
                </p>
              </div>
            </div>
          )}

          {/* Manual Entry Method */}
          {inputMethod === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Description *
                  </label>
                  <input
                    type="text"
                    value={denialInfo.service_description || ''}
                    onChange={(e) => setDenialInfo(prev => ({ ...prev, service_description: e.target.value }))}
                    placeholder="e.g., MRI of left knee"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Service description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Date
                  </label>
                  <input
                    type="date"
                    value={denialInfo.service_date || ''}
                    onChange={(e) => setDenialInfo(prev => ({ ...prev, service_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Service date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Denied ($)
                  </label>
                  <input
                    type="number"
                    value={denialInfo.amount_denied || ''}
                    onChange={(e) => setDenialInfo(prev => ({ ...prev, amount_denied: parseFloat(e.target.value) || undefined }))}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Amount denied"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Denial Code (if provided)
                  </label>
                  <input
                    type="text"
                    value={denialInfo.denial_code || ''}
                    onChange={(e) => setDenialInfo(prev => ({ ...prev, denial_code: e.target.value }))}
                    placeholder="e.g., 50, 96, 97"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Denial code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Denial Reason *
                </label>
                <textarea
                  value={denialInfo.denial_reason || ''}
                  onChange={(e) => setDenialInfo(prev => ({ ...prev, denial_reason: e.target.value }))}
                  placeholder="e.g., Not medically necessary, Experimental treatment, Out of network"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  aria-label="Denial reason"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Company
                  </label>
                  <input
                    type="text"
                    value={denialInfo.insurer_name || ''}
                    onChange={(e) => setDenialInfo(prev => ({ ...prev, insurer_name: e.target.value }))}
                    placeholder="e.g., Aetna, Blue Cross"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Insurance company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Claim Number
                  </label>
                  <input
                    type="text"
                    value={denialInfo.claim_number || ''}
                    onChange={(e) => setDenialInfo(prev => ({ ...prev, claim_number: e.target.value }))}
                    placeholder="e.g., CLM123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Claim number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appeal Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as 'professional' | 'firm' | 'escalation')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  aria-label="Appeal tone"
                >
                  <option value="professional">Professional - Standard business tone</option>
                  <option value="firm">Firm - More assertive, confident tone</option>
                  <option value="escalation">Escalation - Strong tone for final appeals</option>
                </select>
              </div>

              <button
                onClick={handleManualSubmit}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all"
              >
                Generate Appeal Letter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-16 text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl animate-bounce">⚖️</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Generating Your Appeal...</h3>
          <p className="text-gray-600">AI is analyzing your denial and creating a compelling appeal letter</p>
        </div>
      )}

      {/* Results */}
      {appealLetter && (
        <div className="space-y-6">
          {/* Analysis Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">📊 Appeal Analysis</h3>
              <button
                onClick={reset}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
              >
                Appeal Another Claim
              </button>
            </div>

            {/* Success Likelihood */}
            <div className={`p-4 rounded-xl mb-4 ${getSuccessColor(appealLetter.analysis.success_likelihood)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Success Likelihood</p>
                  <p className="text-sm opacity-75">{appealLetter.analysis.success_reasoning}</p>
                </div>
                <span className="text-2xl font-bold">{appealLetter.analysis.success_likelihood}</span>
              </div>
            </div>

            {/* Denial Weakness */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Why This Denial May Be Wrong</h4>
              <p 
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: replaceJargon(appealLetter.analysis.denial_weakness) }}
              />
            </div>

            {/* Supporting Policy Language */}
            {appealLetter.analysis.supporting_policy_language.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Supporting Policy Language</h4>
                <ul className="space-y-1">
                  {appealLetter.analysis.supporting_policy_language.map((language, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span className="text-gray-700 italic">"{language}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Applicable Regulations */}
            {appealLetter.analysis.applicable_regulations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Applicable Regulations</h4>
                <ul className="space-y-1">
                  {appealLetter.analysis.applicable_regulations.map((regulation, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{regulation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Appeal Letter */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">📝 Your Appeal Letter</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(appealLetter.letter.letter_body)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  📋 Copy
                </button>
                <button
                  onClick={downloadAsPDF}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  💾 Download PDF
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Subject: {appealLetter.letter.subject_line}</h4>
            </div>

            <div 
  ref={letterRef}
  style={{
    fontFamily: '"Times New Roman", "Georgia", serif',
    fontSize: '12pt',
    lineHeight: '1.7',
    color: '#000',
    backgroundColor: '#fff',
    padding: '48px',
    maxWidth: '800px',
  }}
>
  {formatAppealLetter(appealLetter.letter.letter_body)}
</div>

            {/* Attachments Needed */}
            {appealLetter.letter.attachments_needed.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">📎 Attachments to Include</h4>
                <ul className="space-y-1">
                  {appealLetter.letter.attachments_needed.map((attachment, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-blue-700">{attachment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadline */}
            <div className="mt-4 p-4 bg-amber-50 rounded-xl">
              <p className="text-amber-800">
                <strong>⏰ Deadline:</strong> {appealLetter.letter.deadline}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Next Steps</h3>
            <ol className="space-y-3">
              {appealLetter.next_steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span 
                    className="text-gray-700 pt-1"
                    dangerouslySetInnerHTML={{ __html: replaceJargon(step) }}
                  />
                </li>
              ))}
            </ol>
          </div>

          {/* Extracted Info (for upload method) */}
          {extractedInfo && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Extracted Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Service:</span>
                  <span className="ml-2 text-gray-900">{extractedInfo.service_description || 'Not found'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="ml-2 text-gray-900">{extractedInfo.service_date || 'Not found'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Amount:</span>
                  <span className="ml-2 text-gray-900">
                    {extractedInfo.amount_denied ? `$${extractedInfo.amount_denied}` : 'Not found'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reason:</span>
                  <span className="ml-2 text-gray-900">{extractedInfo.denial_reason || 'Not found'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-4 text-red-700">
          {error}
          <button onClick={reset} className="ml-4 underline hover:no-underline">Try again</button>
        </div>
      )}
    </div>
  );
}
