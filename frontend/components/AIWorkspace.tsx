'use client';

import { useState } from 'react';
import { PolicyData } from '../lib/api';
import PolicySummary from './PolicySummary';
import EstimationTool from './EstimationTool';
import ValidationTool from './ValidationTool';
import OptimizationTool from './OptimizationTool';
import PreVisitTool from './PreVisitTool';
import AppealTool from './AppealTool';
import FamilyDashboard from './FamilyDashboard';
import SavingsTracker from './SavingsTracker';
import PrivacyPanel from './PrivacyPanel';
import MarkdownRenderer from './MarkdownRenderer';
import UploadGate from './UploadGate';
import { useSavings } from '../contexts/SavingsContext';
import { useFamily } from '../contexts/FamilyContext';
import { AlertCircle, Shield, FileText, MessageCircle, Receipt, Scale, TrendingUp } from 'lucide-react';

interface AIWorkspaceProps {
  policyData: PolicyData | null;
  onReset: () => void;
  activeSection: string;
  onNavigate: (item: string) => void;
}

export default function AIWorkspace({ policyData, onReset, activeSection, onNavigate }: AIWorkspaceProps) {
  const { getSavingsStats } = useSavings();
  const { getPendingActions } = useFamily();

  const savingsStats = getSavingsStats();
  const pendingActions = getPendingActions();

  const toolConfigs = {
    'ask-ai': {
      title: 'Ask AI',
      description: 'Ask questions about your coverage in plain English. MedFin answers based on your specific policy document, not generic insurance knowledge.',
      capabilities: [
        'Am I covered for an MRI?',
        'What is my specialist copay?',
        'Does my plan cover physical therapy?',
        'Do I need prior authorization for surgery?'
      ]
    },
    'bills': {
      title: 'Bill Validation',
      description: 'Upload a photo of your medical bill and the AI checks every charge against your policy — flagging overcharges, billing errors, and showing you exactly what to do about each issue.',
      capabilities: [
        'Line-by-line charge validation',
        'Overcharge and duplicate detection',
        'Specific solutions for each issue found',
        'Expected vs actual cost comparison'
      ]
    },
    'appeal': {
      title: 'Appeal Letters',
      description: 'Upload a claim denial letter and get a professional appeal letter generated in seconds — formatted as a PDF, ready to print and mail.',
      capabilities: [
        'Automatic denial reason extraction',
        'ERISA and ACA regulation citations',
        'Professional formatting with proper structure',
        'Download as print-ready PDF'
      ]
    },
    'pre-visit': {
      title: 'Pre-Visit Planning',
      description: 'Select your visit type and get a personalized checklist of what to verify, bring, and ask — tailored to your specific coverage.',
      capabilities: [
        'Coverage verification steps',
        'Documents to bring',
        'Questions to ask your provider',
        'Cost estimates based on your policy'
      ]
    },
    'optimize': {
      title: 'Policy Optimization',
      description: 'Get recommendations on how to optimize your coverage, reduce costs, and make the most of your insurance plan.',
      capabilities: [
        'Coverage gap analysis',
        'Cost reduction opportunities',
        'HSA/FSA optimization',
        'Alternative plan recommendations'
      ]
    },
    'family': {
      title: 'Family Dashboard',
      description: 'Manage coverage and track healthcare for your entire family in one place.',
      capabilities: [
        'Individual member coverage tracking',
        'Family-wide savings opportunities',
        'Coordinated care planning',
        'Aggregate policy analysis'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E2DC] sticky top-0 z-50">
        <div className="page-container py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0A6640] rounded-none flex items-center justify-center">
                <span className="text-white text-lg">M</span>
              </div>
              <div>
                <h1 className="font-semibold text-sm text-[#0D0D0D]">MedFin</h1>
                <p className="text-xs text-[#6B6B6B]">
                  {policyData ? 'Policy analyzed' : 'No policy uploaded'}
                </p>
              </div>
            </div>

            {/* Center Status -- stacks below logo on narrow screens */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#0A6640] animate-pulse rounded-full"></div>
                <span className="text-xs text-[#6B6B6B]">AI Ready</span>
              </div>
              {policyData && policyData?.policy_strength_score && (
                <span className="text-xs text-[#0D0D0D] font-medium">
                  Policy Score: {policyData.policy_strength_score}/100
                </span>
              )}
            </div>

            {/* Actions */}
            <button
              onClick={onReset}
              className="text-sm text-[#0A6640] font-medium underline-offset-2 hover:underline"
            >
              Upload New Policy
            </button>
          </div>
        </div>
      </header>

      <div className="page-container py-8">
        {/* Dashboard Content */}
        {activeSection === 'policy' && policyData && (
          <div className="space-y-8">
            {/* Policy Summary Table */}
            <div className="bg-white p-6 border border-[#E5E2DC] rounded-none">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                  <span className="text-sm text-[#6B6B6B]">Plan Name</span>
                  <span className="text-sm font-medium text-[#0D0D0D] text-right">
                    {policyData?.plan_name || 'Plan Option 1'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                  <span className="text-sm text-[#6B6B6B]">Score</span>
                  <span className="text-sm font-medium text-[#0D0D0D] text-right">
                    {policyData?.policy_strength_score || '72'}/100
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                  <span className="text-sm text-[#6B6B6B]">Deductible</span>
                  <span className="text-sm font-medium text-[#0D0D0D] text-right">
                    ${(policyData?.annual_deductible_individual || 500).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                  <span className="text-sm text-[#6B6B6B]">Out-of-Pocket Max</span>
                  <span className="text-sm font-medium text-[#0D0D0D] text-right">
                    ${(policyData?.out_of_pocket_max_individual || 2500).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                  <span className="text-sm text-[#6B6B6B]">PCP Copay</span>
                  <span className="text-sm font-medium text-[#0D0D0D] text-right">
                    ${policyData?.copay_primary_care || 35}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                  <span className="text-sm text-[#6B6B6B]">Coinsurance</span>
                  <span className="text-sm font-medium text-[#0D0D0D] text-right">
                    {policyData?.coinsurance_in_network || 20}%
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-[#6B6B6B]">Network Type</span>
                  <span className="text-sm font-medium text-[#0D0D0D] text-right">
                    {policyData?.network_type || 'PPO'}
                  </span>
                </div>
              </div>

              <button className="text-sm text-[#0A6640] font-medium underline-offset-2 hover:underline mt-4">
                Show Full Policy Details
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 text-sm">
              <button onClick={() => onNavigate('ask-ai')} className="text-sm text-[#0A6640] font-medium">
                Ask a question
              </button>
              <span className="text-[#E5E2DC]">|</span>
              <button onClick={() => onNavigate('bills')} className="text-sm text-[#0A6640] font-medium">
                Validate a bill
              </button>
              <span className="text-[#E5E2DC]">|</span>
              <button onClick={() => onNavigate('pre-visit')} className="text-sm text-[#0A6640] font-medium">
                Plan a visit
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="text-center">
              <p className="text-xs text-[#6B6B6B]">
                Your data is processed locally and never stored.
              </p>
            </div>
          </div>
        )}

        {/* Other Tabs - Use UploadGate when no policy */}
        {activeSection === 'pre-visit' && (
          policyData 
            ? <PreVisitTool policyData={policyData} />
            : <UploadGate 
                toolName={toolConfigs['pre-visit'].title}
                description={toolConfigs['pre-visit'].description}
                capabilities={toolConfigs['pre-visit'].capabilities}
                onUploadPolicy={() => onNavigate('policy')} 
              />
        )}
        {activeSection === 'ask-ai' && (
          policyData 
            ? <EstimationTool policyData={policyData} />
            : <UploadGate 
                toolName={toolConfigs['ask-ai'].title}
                description={toolConfigs['ask-ai'].description}
                capabilities={toolConfigs['ask-ai'].capabilities}
                onUploadPolicy={() => onNavigate('policy')} 
              />
        )}
        {activeSection === 'bills' && (
          policyData 
            ? <ValidationTool policyData={policyData} />
            : <UploadGate 
                toolName={toolConfigs['bills'].title}
                description={toolConfigs['bills'].description}
                capabilities={toolConfigs['bills'].capabilities}
                onUploadPolicy={() => onNavigate('policy')} 
              />
        )}
        {activeSection === 'appeal' && (
          policyData 
            ? <AppealTool policyData={policyData} />
            : <UploadGate 
                toolName={toolConfigs['appeal'].title}
                description={toolConfigs['appeal'].description}
                capabilities={toolConfigs['appeal'].capabilities}
                onUploadPolicy={() => onNavigate('policy')} 
              />
        )}
        {activeSection === 'optimize' && (
          policyData 
            ? <OptimizationTool policyData={policyData} />
            : <UploadGate 
                toolName={toolConfigs['optimize'].title}
                description={toolConfigs['optimize'].description}
                capabilities={toolConfigs['optimize'].capabilities}
                onUploadPolicy={() => onNavigate('policy')} 
              />
        )}
        {activeSection === 'family' && (
          policyData 
            ? <FamilyDashboard policyData={policyData} />
            : <UploadGate 
                toolName={toolConfigs['family'].title}
                description={toolConfigs['family'].description}
                capabilities={toolConfigs['family'].capabilities}
                onUploadPolicy={() => onNavigate('policy')} 
              />
        )}
      </div>
    </div>
  );
}
