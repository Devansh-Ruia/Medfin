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
import { useSavings } from '../contexts/SavingsContext';
import { useFamily } from '../contexts/FamilyContext';
import { AlertCircle, Shield, FileText, MessageCircle, Receipt, Scale, TrendingUp } from 'lucide-react';

const ToolPreview = ({ tool, onUploadPolicy }: { tool: string, onUploadPolicy: () => void }) => {
  const previews: Record<string, { title: string; description: string; features: string[] }> = {
    'ask-ai': {
      title: 'Ask AI',
      description: 'Ask questions about your insurance coverage in plain English and get clear, specific answers based on your actual policy.',
      features: [
        '"Am I covered for an MRI?"',
        '"What\'s my specialist copay?"',
        '"Does my plan cover physical therapy?"',
        '"Do I need prior authorization for surgery?"',
      ]
    },
    'bills': {
      title: 'Bill Validation',
      description: 'Upload a photo of your medical bill and the AI checks every charge against your policy — flagging overcharges, billing errors, and showing you exactly what to do about each issue.',
      features: [
        'Line-by-line charge validation',
        'Overcharge and duplicate detection',
        'Specific solutions for each issue found',
        'Expected vs actual cost comparison',
      ]
    },
    'appeal': {
      title: 'Appeal Letters',
      description: 'Upload a claim denial letter and get a professional appeal letter generated in seconds — formatted as a PDF, ready to print and mail.',
      features: [
        'Automatic denial reason extraction',
        'ERISA and ACA regulation citations',
        'Professional formatting with proper structure',
        'Download as print-ready PDF',
      ]
    },
    'pre-visit': {
      title: 'Pre-Visit Planning',
      description: 'Select your visit type and get a personalized checklist of what to verify, bring, and ask — tailored to your specific coverage.',
      features: [
        'Coverage verification steps',
        'Documents to bring',
        'Questions to ask your provider',
        'Cost estimates based on your policy',
      ]
    },
    'optimize': {
      title: 'Policy Optimization',
      description: 'Get recommendations on how to optimize your coverage, reduce costs, and make the most of your insurance plan.',
      features: [
        'Coverage gap analysis',
        'Cost reduction opportunities',
        'HSA/FSA optimization',
        'Alternative plan recommendations',
      ]
    },
  };

  const preview = previews[tool];
  if (!preview) return null;

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">{preview.title}</h2>
      <p className="text-gray-500 mb-8 leading-relaxed">{preview.description}</p>
      
      <div className="text-left bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">What you can do</p>
        <div className="space-y-2">
          {preview.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-accent mt-0.5">→</span>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={onUploadPolicy}
        className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
      >
        Upload a policy to get started
      </button>
      <p className="text-xs text-gray-400 mt-3">Upload your insurance policy PDF to unlock this tool</p>
    </div>
  );
};

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="page-container py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">M</span>
              </div>
              <div>
                <h1 className="font-semibold text-xl text-heading">MedFin</h1>
                <p className="text-sm text-muted">
                  {policyData ? `${policyData.insurance_company || 'Policy'} • ${policyData.plan_name || 'Analyzed'}` : 'No policy uploaded'}
                </p>
              </div>
            </div>
            {/* Actions */}
            <button
              onClick={onReset}
              className="text-muted hover:text-heading text-sm font-medium transition-colors"
            >
              Upload New Policy
            </button>
          </div>
        </div>
      </header>

      <div className="page-container py-8">
        {/* AI Status Indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <span className="text-muted">AI Ready</span>
          </div>
          {policyData && (
            <span className="text-sm text-muted">
              Policy Score: <span className="font-semibold text-heading">{policyData.policy_strength_score || 'N/A'}/100</span>
            </span>
          )}
        </div>

        {/* Dashboard Content */}
        {activeSection === 'policy' && (
          <div className="space-y-8">
            {/* Policy Header */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-heading mb-1">
                    Policy: {policyData.insurance_company || 'Insurance Company 1'} • {policyData.plan_name || 'Plan Option 1'}
                  </h2>
                  <span className="text-muted">Score: {policyData.policy_strength_score || '72'}/100</span>
                </div>
                <button className="text-accent hover:text-accent/90 text-sm font-medium transition-colors">
                  Upload New Policy
                </button>
              </div>

              {/* Policy Details - Inline List Style */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-muted">Deductible</span>
                  <span className="font-semibold text-heading">
                    ${(policyData.annual_deductible_individual || 500).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-muted">Out-of-Pocket Max</span>
                  <span className="font-semibold text-heading">
                    ${(policyData.out_of_pocket_max_individual || 2500).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-muted">PCP Copay</span>
                  <span className="font-semibold text-heading">
                    ${policyData.copay_primary_care || 35}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted">Coinsurance</span>
                  <span className="font-semibold text-heading">
                    {policyData.coinsurance_in_network || 20}%
                  </span>
                </div>
              </div>

              <button className="text-accent hover:text-accent/90 text-sm font-medium transition-colors mt-4">
                Show Full Policy Details
              </button>
            </div>

            {/* Pending Actions - Task List Style */}
            {pendingActions.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-muted" />
                  Pending Actions
                </h3>
                <div className="space-y-2">
                  {pendingActions.slice(0, 5).map((action, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-accent hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <MarkdownRenderer className="text-sm font-medium text-heading">{action.description}</MarkdownRenderer>
                        <p className="text-xs text-muted">{action.memberName} • {action.actionType}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-heading mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <button onClick={() => onNavigate('ask-ai')} className="text-accent hover:text-accent/90 font-medium transition-colors">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Ask a question
                </button>
                <button onClick={() => onNavigate('bills')} className="text-accent hover:text-accent/90 font-medium transition-colors">
                  <Receipt className="w-4 h-4 inline mr-1" />
                  Validate a bill
                </button>
                <button onClick={() => onNavigate('pre-visit')} className="text-accent hover:text-accent/90 font-medium transition-colors">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Plan a visit
                </button>
              </div>
            </div>

            {/* Privacy Controls - Minimal Banner */}
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted" />
                <span className="text-sm text-muted">
                  Your data is processed locally and never stored.
                </span>
              </div>
              <button className="text-accent hover:text-accent/90 text-sm font-medium transition-colors">
                Learn more
              </button>
            </div>

            {/* Footer Stats - Inline */}
            <div className="text-center text-sm text-muted">
              Estimated savings: ${savingsStats.totalSaved.toLocaleString()}  •  Time saved: ~{savingsStats.estimatedTimeSaved} hours
            </div>
          </div>
        )}

        {/* Other Tabs - Direct Navigation */}
        {activeSection === 'pre-visit' && (
          policyData 
            ? <PreVisitTool policyData={policyData} />
            : <ToolPreview tool="pre-visit" onUploadPolicy={() => onNavigate('policy')} />
        )}
        {activeSection === 'ask-ai' && (
          policyData 
            ? <EstimationTool policyData={policyData} />
            : <ToolPreview tool="ask-ai" onUploadPolicy={() => onNavigate('policy')} />
        )}
        {activeSection === 'bills' && (
          policyData 
            ? <ValidationTool policyData={policyData} />
            : <ToolPreview tool="bills" onUploadPolicy={() => onNavigate('policy')} />
        )}
        {activeSection === 'appeal' && (
          policyData 
            ? <AppealTool policyData={policyData} />
            : <ToolPreview tool="appeal" onUploadPolicy={() => onNavigate('policy')} />
        )}
        {activeSection === 'optimize' && (
          policyData 
            ? <OptimizationTool policyData={policyData} />
            : <ToolPreview tool="optimize" onUploadPolicy={() => onNavigate('policy')} />
        )}
        {activeSection === 'family' && (
          policyData 
            ? <FamilyDashboard policyData={policyData} />
            : <ToolPreview tool="optimize" onUploadPolicy={() => onNavigate('policy')} />
        )}
      </div>
    </div>
  );
}
