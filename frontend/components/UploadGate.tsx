'use client';

import { ArrowRight } from 'lucide-react';

interface UploadGateProps {
  toolName: string;
  description: string;
  capabilities: string[];
  onUploadPolicy: () => void;
}

// UploadGate exists because six tools cannot each independently decide how to beg for a policy
export default function UploadGate({ toolName, description, capabilities, onUploadPolicy }: UploadGateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-[#0D0D0D] mb-3">{toolName}</h2>
        <p className="text-sm text-[#6B6B6B] max-w-md mx-auto mt-2 leading-relaxed">{description}</p>
        
        <div className="border border-[#E5E2DC] bg-white p-6 mt-6 max-w-sm mx-auto">
          <p className="text-xs tracking-widest text-[#6B6B6B] uppercase mb-3">WHAT YOU CAN DO</p>
          <div className="space-y-2">
            {capabilities.map((capability, i) => (
              <div key={i} className="flex items-start gap-2">
                <ArrowRight className="w-3 h-3 text-[#0A6640] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#0D0D0D] text-left">{capability}</span>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={onUploadPolicy}
          className="bg-[#0D0D0D] text-white text-sm px-8 py-4 rounded-none mt-8 font-medium hover:bg-[#1A1A1A] transition-colors"
        >
          Upload a Policy
        </button>
        <p className="text-xs text-[#6B6B6B] mt-2">Upload your insurance policy PDF to unlock this tool</p>
      </div>
    </div>
  );
}
