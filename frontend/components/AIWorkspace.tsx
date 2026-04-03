'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
  const [showFullDetails, setShowFullDetails] = useState(false);
  const tDash = useTranslations('dashboard')
  const tAskAI = useTranslations('askAI')
  const tBills = useTranslations('bills')
  const tAppeal = useTranslations('appeal')
  const tPreVisit = useTranslations('preVisit')
  const tOptimize = useTranslations('optimize')
  const { getSavingsStats } = useSavings();
  const { getPendingActions } = useFamily();

  const savingsStats = getSavingsStats();
  const pendingActions = getPendingActions();

  const toolConfigs = {
    'ask-ai': {
      title: 'Ask AI',
      description: tAskAI('uploadGateDesc'),
      capabilities: [
        tAskAI('capability1'),
        tAskAI('capability2'),
        tAskAI('capability3'),
        tAskAI('capability4')
      ]
    },
    'bills': {
      title: 'Bill Validation',
      description: tBills('uploadGateDesc'),
      capabilities: [
        tBills('capability1'),
        tBills('capability2'),
        tBills('capability3'),
        tBills('capability4')
      ]
    },
    'appeal': {
      title: 'Appeal Letters',
      description: tAppeal('uploadGateDesc'),
      capabilities: [
        tAppeal('capability1'),
        tAppeal('capability2'),
        tAppeal('capability3'),
        tAppeal('capability4')
      ]
    },
    'pre-visit': {
      title: 'Pre-Visit Planning',
      description: tPreVisit('uploadGateDesc'),
      capabilities: [
        tPreVisit('capability1'),
        tPreVisit('capability2'),
        tPreVisit('capability3'),
        tPreVisit('capability4')
      ]
    },
    'optimize': {
      title: 'Policy Optimization',
      description: tOptimize('uploadGateDesc'),
      capabilities: [
        tOptimize('capability1'),
        tOptimize('capability2'),
        tOptimize('capability3'),
        tOptimize('capability4')
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
                  {policyData ? tDash('policyAnalyzed') : tDash('noPolicy')}
                </p>
              </div>
            </div>

            {/* Center Status -- stacks below logo on narrow screens */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#0A6640] animate-pulse rounded-full"></div>
                <span className="text-xs text-[#6B6B6B]">{tDash('aiReady')}</span>
              </div>
              {policyData && policyData?.policy_strength_score && (
                <span className="text-xs text-[#0D0D0D] font-medium">
                  {tDash('policyScore')}: {policyData.policy_strength_score}/100
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={onReset}
                className="text-sm text-[#0A6640] font-medium underline-offset-2 hover:underline"
              >
                {tDash('uploadNewPolicy')}
              </button>
            </div>
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

              <button
                onClick={() => setShowFullDetails(prev => !prev)}
                className="text-sm text-[#0A6640] font-medium underline-offset-2 hover:underline mt-4"
              >
                {showFullDetails ? tDash('hideDetails') : tDash('showFullDetails')}
              </button>

              {showFullDetails && (
                <div className="mt-4 border-t border-[#E5E2DC] pt-4 space-y-2">
                  {policyData?.policy_number && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Policy Number</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">{policyData.policy_number}</span>
                    </div>
                  )}
                  {policyData?.policy_holder_name && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Policy Holder</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">{policyData.policy_holder_name}</span>
                    </div>
                  )}
                  {policyData?.insurance_company && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Insurance Company</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">{policyData.insurance_company}</span>
                    </div>
                  )}
                  {policyData?.plan_name && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Plan Name</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">{policyData.plan_name}</span>
                    </div>
                  )}
                  {policyData?.plan_type && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Plan Type</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">{policyData.plan_type}</span>
                    </div>
                  )}
                  {policyData?.annual_deductible_family != null && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Family Deductible</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">${policyData.annual_deductible_family.toLocaleString()}</span>
                    </div>
                  )}
                  {policyData?.out_of_pocket_max_family != null && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Family OOP Max</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">${policyData.out_of_pocket_max_family.toLocaleString()}</span>
                    </div>
                  )}
                  {policyData?.copay_specialist != null && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Specialist Copay</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">${policyData.copay_specialist}</span>
                    </div>
                  )}
                  {policyData?.copay_emergency != null && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Emergency Copay</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">${policyData.copay_emergency}</span>
                    </div>
                  )}
                  {policyData?.coinsurance_out_of_network != null && (
                    <div className="flex justify-between py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Out-of-Network Coinsurance</span>
                      <span className="text-sm font-medium text-[#0D0D0D] text-right">{policyData.coinsurance_out_of_network}%</span>
                    </div>
                  )}
                  {policyData?.key_benefits && policyData.key_benefits.length > 0 && (
                    <div className="py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Key Benefits</span>
                      <ul className="mt-1 space-y-1">
                        {policyData.key_benefits.map((benefit, i) => (
                          <li key={i} className="text-sm text-[#0D0D0D]">• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {policyData?.coverage_gaps && policyData.coverage_gaps.length > 0 && (
                    <div className="py-2 border-b border-[#E5E2DC]">
                      <span className="text-sm text-[#6B6B6B]">Coverage Gaps</span>
                      <ul className="mt-1 space-y-1">
                        {policyData.coverage_gaps.map((gap, i) => (
                          <li key={i} className="text-sm text-[#0D0D0D]">• {gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {policyData?.recommendations && policyData.recommendations.length > 0 && (
                    <div className="py-2">
                      <span className="text-sm text-[#6B6B6B]">Recommendations</span>
                      <ul className="mt-1 space-y-1">
                        {policyData.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-[#0D0D0D]">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 text-sm">
              <button onClick={() => onNavigate('ask-ai')} className="text-sm text-[#0A6640] font-medium">
                {tDash('askQuestion')}
              </button>
              <span className="text-[#E5E2DC]">|</span>
              <button onClick={() => onNavigate('bills')} className="text-sm text-[#0A6640] font-medium">
                {tDash('validateBill')}
              </button>
              <span className="text-[#E5E2DC]">|</span>
              <button onClick={() => onNavigate('pre-visit')} className="text-sm text-[#0A6640] font-medium">
                {tDash('planVisit')}
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="text-center">
              <p className="text-xs text-[#6B6B6B]">
                {tDash('privacyNote')}
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
