'use client';

import { useState } from 'react';
import { api, PolicyData } from '../lib/api';
import MarkdownRenderer from './MarkdownRenderer';
import { TrendingUp, AlertCircle, CheckCircle, FileText, Receipt } from 'lucide-react';

export interface SavingsEvent {
  id: string;
  date: string;
  category: 'billing_error' | 'appeal_won' | 'network_savings' | 'rx_savings' | 'denial_prevented';
  description: string;
  amountSaved: number;
  memberId?: string;
}

export interface SavingsStats {
  totalSaved: number;
  savingsByCategory: Record<string, number>;
  savingsHistory: SavingsEvent[];
  estimatedTimeSaved: number; // hours
}

interface SavingsTrackerProps {
  stats: SavingsStats;
  onAddSavings?: (event: Omit<SavingsEvent, 'id' | 'date'>) => void;
  compact?: boolean;
}

export default function SavingsTracker({ stats, onAddSavings, compact = false }: SavingsTrackerProps) {
  const categoryLabels = {
    billing_error: 'Billing Errors Caught',
    appeal_won: 'Appeals Won',
    network_savings: 'Network Savings',
    rx_savings: 'Prescription Savings',
    denial_prevented: 'Denials Prevented'
  };

  const categoryIcons = {
    billing_error: AlertCircle,
    appeal_won: CheckCircle,
    network_savings: TrendingUp,
    rx_savings: FileText,
    denial_prevented: Receipt
  };

  const categoryColors = {
    billing_error: 'bg-red-400',
    appeal_won: 'bg-blue-400',
    network_savings: 'bg-green-400',
    rx_savings: 'bg-purple-400',
    denial_prevented: 'bg-yellow-400'
  };

  if (compact) {
    return (
      <div className="text-sm text-muted text-center">
        Estimated savings: ${stats.totalSaved.toLocaleString()}  •  Time saved: ~{stats.estimatedTimeSaved} hours
      </div>
    );
  }

  return (
    <div className="text-sm text-muted text-center">
      Estimated savings: ${stats.totalSaved.toLocaleString()}  •  Time saved: ~{stats.estimatedTimeSaved} hours
    </div>
  );
}

// Add Savings Form Component
interface SavingsFormProps {
  onSubmit: (event: Omit<SavingsEvent, 'id' | 'date'>) => void;
  onClose: () => void;
}

function SavingsForm({ onSubmit, onClose }: SavingsFormProps) {
  const [category, setCategory] = useState<SavingsEvent['category']>('billing_error');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    onSubmit({
      category,
      description,
      amountSaved: parseFloat(amount)
    });
    
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/20">
      <h4 className="font-medium mb-3">Log New Savings</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as SavingsEvent['category'])}
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50"
            aria-label="Savings category"
            title="Select the type of savings"
          >
            <option value="billing_error" className="text-gray-900">Billing Error</option>
            <option value="appeal_won" className="text-gray-900">Appeal Won</option>
            <option value="network_savings" className="text-gray-900">Network Savings</option>
            <option value="rx_savings" className="text-gray-900">Prescription Savings</option>
            <option value="denial_prevented" className="text-gray-900">Denial Prevented</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What saved you money?"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Amount Saved ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-white/90 transition"
          >
            Log Savings
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Savings Prompt Component (for after feature use)
interface SavingsPromptProps {
  suggestedAmount: number;
  category: SavingsEvent['category'];
  onConfirm: (amount: number, description: string) => void;
  onSkip: () => void;
}

export function SavingsPrompt({ suggestedAmount, category, onConfirm, onSkip }: SavingsPromptProps) {
  const [amount, setAmount] = useState(suggestedAmount.toString());
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    onConfirm(parseFloat(amount), description);
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
      <p className="text-emerald-800 font-medium mb-2">💰 Did this save you money?</p>
      <p className="text-emerald-600 text-sm mb-4">
        Based on this activity, you may have saved around ${suggestedAmount}
      </p>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-emerald-700 mb-1">Amount Saved ($)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            aria-label="Amount saved in dollars"
            title="Enter the amount of money saved"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm text-emerald-700 mb-1">What was this savings from?</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Found billing error in ER bill"
            className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleConfirm} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
            Log Savings
          </button>
          <button onClick={onSkip} className="px-4 py-2 text-emerald-600 hover:bg-emerald-100 rounded-lg font-medium transition">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
