'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { api, PolicyData } from '../lib/api';
import { Upload, FileText, Brain, CheckCircle } from 'lucide-react';
import { event } from '../lib/analytics';
import { requestNotificationPermission, sendLocalNotification } from '../lib/notifications';

interface PolicyUploadProps {
  onPolicyUploaded: (data: PolicyData) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
}

export default function PolicyUpload({
  onPolicyUploaded,
  isAnalyzing,
  setIsAnalyzing
}: PolicyUploadProps) {
  const t = useTranslations('dashboard')
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzePolicy = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setProgress('Uploading policy document...');

    try {
      setProgress('AI is reading your policy...');
      await new Promise(r => setTimeout(r, 500));
      
      setProgress('Extracting coverage details...');
      await new Promise(r => setTimeout(r, 500));
      
      setProgress('Analyzing deductibles and limits...');
      const result = await api.uploadPolicy(file);
      
      setProgress('Identifying coverage gaps...');
      await new Promise(r => setTimeout(r, 300));
      
      setProgress('Generating recommendations...');
      await new Promise(r => setTimeout(r, 300));
      
      onPolicyUploaded(result.policy_data);
      event('upload_policy', { file_type: file.type });

      const granted = await requestNotificationPermission();
      if (granted) {
        const score = result.policy_data.policy_strength_score;
        const issueCount = result.policy_data.coverage_gaps?.length ?? 0;
        sendLocalNotification(
          'Policy analysis complete',
          `Your plan scored ${score}/100. ${issueCount} coverage gap${issueCount !== 1 ? 's' : ''} identified.`
        );
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError('Upload failed. Check your connection and try again.');
      }
    } finally {
      setIsAnalyzing(false);
      setProgress('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      analyzePolicy(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      analyzePolicy(e.target.files[0]);
    }
  };

  return (
    <div className="content-container py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-[#0D0D0D] mb-4">
          {t('uploadPrompt')}
        </h2>
        <p className="text-sm text-[#6B6B6B] max-w-2xl mx-auto leading-relaxed">
          {t('uploadDesc')}
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto">
        {isAnalyzing ? (
          <div className="bg-white p-12 text-center border border-[#E5E2DC] rounded-none">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-[#E8F5EE] rounded-none animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-none flex items-center justify-center">
                <Brain className="w-8 h-8 text-[#0A6640] animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#0D0D0D] mb-3">
              AI is analyzing your policy
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-6">{progress}</p>
            <div className="w-full bg-[#F9F8F6] rounded-none h-2">
              <div className="bg-[#0A6640] h-2 rounded-none animate-pulse w-3/5 transition-all duration-300"></div>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              bg-white p-12 text-center cursor-pointer transition-all duration-200 border rounded-none
              ${dragActive 
                ? 'border-[#0A6640] bg-[#E8F5EE]' 
                : 'border-[#E5E2DC] hover:border-[#6B6B6B]'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload insurance policy file"
              title="Upload insurance policy file (PDF, PNG, JPG)"
            />
            
            <div className="w-16 h-16 mx-auto mb-6 bg-[#F9F8F6] rounded-none flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#6B6B6B]" />
            </div>
            
            <h3 className="text-xl font-semibold text-[#0D0D0D] mb-3">
              {t('dropZone')}
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-8">
              {t('dropZoneSub')}
            </p>
            
            <button className="bg-[#0D0D0D] text-white text-sm px-6 py-3 rounded-none hover:bg-[#1A1A1A] transition-colors">
              {t('chooseFile')}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-[#FDF2F2] border-l-4 border-[#C0392B] rounded-none text-[#C0392B] text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
