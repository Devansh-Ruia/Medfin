'use client';

import { useState } from 'react';
import { PolicyData } from '../lib/api';
import PolicySummary from './PolicySummary';
import EstimationTool from './EstimationTool';
import ValidationTool from './ValidationTool';
import OptimizationTool from './OptimizationTool';

interface AIWorkspaceProps {
  policyData: PolicyData;
  onReset: () => void;
}

type TabType = 'estimation' | 'validation' | 'optimization';

export default function AIWorkspace({ policyData, onReset }: AIWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('estimation');

  const tabs = [
    { id: 'estimation', label: 'Ask AI', icon: '💬', description: 'Ask questions about your coverage' },
    { id: 'validation', label: 'Validate Bill', icon: '📸', description: 'Photo-scan and validate bills' },
    { id: 'optimization', label: 'Optimize', icon: '✨', description: 'Get savings recommendations' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏥</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">MedFin AI</h1>
                <p className="text-xs text-gray-500">
                  {policyData.insurance_company || 'Policy'} • {policyData.plan_name || 'Analyzed'}
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Upload New Policy
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* AI Status Indicator */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>AI Engine Active</span>
          </div>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">
            Policy Strength: 
            <span className={`ml-1 font-semibold ${
              (policyData.policy_strength_score || 0) >= 70 ? 'text-green-600' :
              (policyData.policy_strength_score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {policyData.policy_strength_score || 'N/A'}/100
            </span>
          </span>
        </div>

        {/* Policy Summary Card */}
        <PolicySummary policyData={policyData} />

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'estimation' && (
              <EstimationTool policyData={policyData} />
            )}
            {activeTab === 'validation' && (
              <ValidationTool policyData={policyData} />
            )}
            {activeTab === 'optimization' && (
              <OptimizationTool policyData={policyData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
