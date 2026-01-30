'use client';

import { useState } from 'react';
import { 
  Shield, 
  ChatCircle, 
  Receipt, 
  Lightbulb 
} from '@phosphor-icons/react';
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
    { 
      id: 'estimation', 
      label: 'Ask AI', 
      icon: ChatCircle, 
      description: 'Ask questions about your coverage' 
    },
    { 
      id: 'validation', 
      label: 'Validate Bill', 
      icon: Receipt, 
      description: 'Photo-scan and validate bills' 
    },
    { 
      id: 'optimization', 
      label: 'Optimize', 
      icon: Lightbulb, 
      description: 'Get savings recommendations' 
    },
  ];

  return (
    <div className="min-h-screen bg-dots">
      {/* Header */}
      <header className="bg-paper border-b border-mist/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-terracotta-500 rounded-xl flex items-center justify-center">
                <Shield size={22} weight="duotone" className="text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-ink">MedFin</h1>
                <p className="text-sm text-mist">
                  {policyData.insurance_company || 'Policy'} • {policyData.plan_name || 'Analyzed'}
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="btn-ghost"
            >
              Upload New Policy
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* AI Status Indicator */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-100 text-sage-600 rounded-full">
            <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse"></div>
            <span>AI Engine Active</span>
          </div>
          <span className="text-mist">•</span>
          <span className="text-slate">
            Policy Strength: 
            <span className={`ml-1 font-semibold font-currency ${
              (policyData.policy_strength_score || 0) >= 70 ? 'text-sage-600' :
              (policyData.policy_strength_score || 0) >= 50 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {policyData.policy_strength_score || 'N/A'}/100
            </span>
          </span>
        </div>

        {/* Policy Summary Card */}
        <PolicySummary policyData={policyData} />

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex gap-1 p-1 bg-cloud rounded-xl border border-mist/20 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-paper text-ink shadow-soft'
                    : 'text-mist hover:text-slate'
                  }
                `}
              >
                <tab.icon 
                  size={20} 
                  weight={activeTab === tab.id ? 'fill' : 'regular'} 
                />
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
