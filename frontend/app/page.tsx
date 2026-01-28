'use client';

import { useState, useCallback } from 'react';
import { api, PolicyData } from '../lib/api';
import PolicyUpload from '../components/PolicyUpload';
import AIWorkspace from '../components/AIWorkspace';

export default function Home() {
  const [policyData, setPolicyData] = useState<PolicyData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePolicyUploaded = (data: PolicyData) => {
    setPolicyData(data);
  };

  const handleReset = () => {
    setPolicyData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {!policyData ? (
        <PolicyUpload 
          onPolicyUploaded={handlePolicyUploaded}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
        />
      ) : (
        <AIWorkspace 
          policyData={policyData} 
          onReset={handleReset}
        />
      )}
    </main>
  );
}
