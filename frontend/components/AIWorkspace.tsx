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

interface AIWorkspaceProps {
  policyData: PolicyData;
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
                  {policyData.insurance_company || 'Policy'} • {policyData.plan_name || 'Analyzed'}
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
          <span className="text-sm text-muted">
            Policy Score: <span className="font-semibold text-heading">{policyData.policy_strength_score || 'N/A'}/100</span>
          </span>
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
        {activeSection === 'pre-visit' && <PreVisitTool policyData={policyData} />}
        {activeSection === 'ask-ai' && <EstimationTool policyData={policyData} />}
        {activeSection === 'bills' && <ValidationTool policyData={policyData} />}
        {activeSection === 'appeal' && <AppealTool policyData={policyData} />}
        {activeSection === 'optimize' && <OptimizationTool policyData={policyData} />}
        {activeSection === 'family' && <FamilyDashboard policyData={policyData} />}
      </div>
    </div>
  );
}
