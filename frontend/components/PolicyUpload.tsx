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
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Logo & Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-6 shadow-lg">
          <span className="text-4xl">🏥</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          MedFin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">AI</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-md">
          Your AI-powered insurance navigator. Upload your policy and let AI do the rest.
        </p>
      </div>

      {/* Upload Area */}
      <div className="w-full max-w-2xl">
        {isAnalyzing ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              {/* Animated AI Brain */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl animate-bounce">🧠</span>
              </div>
              {/* Orbiting dots */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1"></div>
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is analyzing your policy</h3>
            <p className="text-gray-600 mb-4">{progress}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              bg-white rounded-2xl shadow-xl p-12 text-center cursor-pointer
              border-3 border-dashed transition-all duration-300
              ${dragActive 
                ? 'border-blue-500 bg-blue-50 scale-105' 
                : 'border-gray-300 hover:border-blue-400 hover:shadow-2xl'
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
            />
            
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">📄</span>
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Add Your Insurance Policy
            </h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your policy document or click to browse
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span>📎</span> PDF
              </span>
              <span className="flex items-center gap-1">
                <span>🖼️</span> Images
              </span>
              <span className="flex items-center gap-1">
                <span>🔒</span> Secure
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            {error}
          </div>
        )}
      </div>

      {/* Features Preview */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">💬</div>
          <h4 className="font-semibold text-gray-900 mb-1">Ask Questions</h4>
          <p className="text-sm text-gray-600">Get instant answers about your coverage</p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">📸</div>
          <h4 className="font-semibold text-gray-900 mb-1">Validate Bills</h4>
          <p className="text-sm text-gray-600">Photo-scan bills for instant verification</p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">✨</div>
          <h4 className="font-semibold text-gray-900 mb-1">Optimize</h4>
          <p className="text-sm text-gray-600">Get AI recommendations to save money</p>
        </div>
      </div>
    </div>
  );
}
