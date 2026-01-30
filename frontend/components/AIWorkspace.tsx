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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🏥</span>
              </div>
              <div>
                <h1 className="font-semibold text-xl text-gray-900">MedFin</h1>
                <p className="text-sm text-gray-500">
                  {policyData.insurance_company || 'Policy'} • {policyData.plan_name || 'Analyzed'}
                </p>
              </div>
            </div>
            {/* Actions */}
            <button
              onClick={onReset}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Upload New Policy
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* AI Status Indicator */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-600">AI Ready</span>
          </div>
          <span className="text-sm text-gray-500">
            Policy Score: <span className="font-semibold text-gray-900">{policyData.policy_strength_score || 'N/A'}/100</span>
          </span>
        </div>

        {/* Policy Summary Card */}
        <div className="mb-8 animate-stagger-1">
          <PolicySummary policyData={policyData} />
        </div>

        {/* Tabs */}
        <div className="animate-stagger-2">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6 animate-stagger-3">
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
