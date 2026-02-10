'use client';

import { useState, useRef } from 'react';
import { api, PolicyData } from '../lib/api';
import { Upload, FileText, Brain, CheckCircle } from 'lucide-react';

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
    <div className="content-container py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-heading mb-4">
          Upload your insurance policy
        </h1>
        <p className="text-lg text-body max-w-2xl mx-auto">
          Let AI analyze your coverage details, deductibles, and find opportunities to save money on healthcare costs.
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-2xl mx-auto mb-16">
        {isAnalyzing ? (
          <div className="card p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-accent/10 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-accent animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-heading mb-3">
              AI is analyzing your policy
            </h3>
            <p className="text-body mb-6">{progress}</p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-accent h-2 rounded-full animate-pulse w-3/5 transition-all duration-300"></div>
            </div>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              card p-12 text-center cursor-pointer transition-all duration-200
              ${dragActive 
                ? 'border-accent bg-accent/5' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-card'
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
            
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-semibold text-heading mb-3">
              Drop your policy here
            </h3>
            <p className="text-body mb-8">
              PDF, PNG, JPG up to 10MB
            </p>
            
            <button className="btn-primary">
              Choose File
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-error/10 border-l-4 border-error rounded-r-xl text-error text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="card p-8 text-center card-hover">
          <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <h4 className="font-semibold text-heading mb-2">Smart Analysis</h4>
          <p className="text-sm text-body">
            AI extracts key coverage details and identifies potential gaps
          </p>
        </div>
        <div className="card p-8 text-center card-hover">
          <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-accent" />
          </div>
          <h4 className="font-semibold text-heading mb-2">Bill Validation</h4>
          <p className="text-sm text-body">
            Photo-scan bills for instant verification and overcharge detection
          </p>
        </div>
        <div className="card p-8 text-center card-hover">
          <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-accent" />
          </div>
          <h4 className="font-semibold text-heading mb-2">AI Recommendations</h4>
          <p className="text-sm text-body">
            Get personalized suggestions to optimize your healthcare spending
          </p>
        </div>
      </div>
    </div>
  );
}
