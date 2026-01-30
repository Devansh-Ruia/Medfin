'use client';

import { useState, useRef } from 'react';
import { api, PolicyData } from '../lib/api';

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
    } catch (err) {
      console.error(err);
      setError('Failed to analyze policy. Please try again.');
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      {/* Logo & Header */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-8 shadow-subtle">
          <span className="text-4xl">🏥</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MedFin <span className="text-emerald-600">AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
          Your AI-powered insurance navigator. Upload your policy and let AI do the heavy lifting.
        </p>
      </div>

      {/* Upload Area */}
      <div className="w-full max-w-2xl animate-stagger-1">
        {isAnalyzing ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-16 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              {/* Animated AI Brain */}
              <div className="absolute inset-0 bg-gray-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl animate-bounce">🧠</span>
              </div>
              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-spin animation-duration-3000">
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-emerald-500 rounded-full -translate-x-1/2 -translate-y-1"></div>
              </div>
              <div className="absolute inset-0 animate-spin animation-duration-3000 animation-delay-1000">
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-gray-400 rounded-full -translate-x-1/2 -translate-y-1"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI is analyzing your policy</h3>
            <p className="text-gray-600 mb-6">{progress}</p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full animate-pulse w-3/5"></div>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              bg-white rounded-2xl border-2 border-dashed shadow-subtle p-16 text-center cursor-pointer transition-all
              ${dragActive 
                ? 'border-gray-400 bg-gray-50' 
                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
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
            
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">📄</span>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Drop your policy here
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              PDF, PNG, JPG up to 10MB
            </p>
            
            <button className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all">
              Choose File
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-error/10 border-l-4 border-error rounded-r-xl text-error text-sm animate-stagger-2">
            {error}
          </div>
        )}
      </div>

      {/* Features Preview */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full animate-stagger-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-8 text-center hover:shadow-card transition-all">
          <div className="text-3xl mb-4">💬</div>
          <h4 className="font-semibold text-gray-900 mb-2">Ask Questions</h4>
          <p className="text-sm text-gray-600">Get instant answers about your coverage</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-8 text-center hover:shadow-card transition-all">
          <div className="text-3xl mb-4">📸</div>
          <h4 className="font-semibold text-gray-900 mb-2">Validate Bills</h4>
          <p className="text-sm text-gray-600">Photo-scan bills for instant verification</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-subtle p-8 text-center hover:shadow-card transition-all">
          <div className="text-3xl mb-4">✨</div>
          <h4 className="font-semibold text-gray-900 mb-2">Optimize</h4>
          <p className="text-sm text-gray-600">Get AI recommendations to save money</p>
        </div>
      </div>
    </div>
  );
}
