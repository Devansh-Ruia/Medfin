'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ChatCircle, 
  PaperPlaneTilt,
  WarningCircle,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import { api, PolicyData, QuestionAnswer } from '../lib/api';

interface EstimationToolProps {
  policyData: PolicyData;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: QuestionAnswer;
}

// Markdown parsing functions
const formatInlineMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');
};

const parseMarkdown = (text: string): JSX.Element[] => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: JSX.Element[] = [];
  let listType: 'ol' | 'ul' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      // Empty line - close any open list and add spacing
      if (currentList.length > 0) {
        elements.push(
          listType === 'ol' ? 
            <ol key={`list-${i}`} className="list-decimal list-inside space-y-1 mb-3">{currentList}</ol> :
            <ul key={`list-${i}`} className="list-disc list-inside space-y-1 mb-3">{currentList}</ul>
        );
        currentList = [];
        listType = null;
      }
      elements.push(<div key={`space-${i}`} className="h-2"></div>);
      continue;
    }

    // Check for numbered list
    if (/^\d+\.\s/.test(line)) {
      if (listType !== 'ol') {
        if (currentList.length > 0) {
          elements.push(<ul key={`list-${i}`} className="list-disc list-inside space-y-1 mb-3">{currentList}</ul>);
        }
        currentList = [];
        listType = 'ol';
      }
      const content = line.replace(/^\d+\.\s/, '');
      currentList.push(
        <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
      );
      continue;
    }

    // Check for bullet list
    if (/^[*\-]\s/.test(line)) {
      if (listType !== 'ul') {
        if (currentList.length > 0) {
          elements.push(<ol key={`list-${i}`} className="list-decimal list-inside space-y-1 mb-3">{currentList}</ol>);
        }
        currentList = [];
        listType = 'ul';
      }
      const content = line.replace(/^[*\-]\s/, '');
      currentList.push(
        <li key={i} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
      );
      continue;
    }

    // Regular paragraph - close any open list
    if (currentList.length > 0) {
      elements.push(
        listType === 'ol' ? 
          <ol key={`list-${i}`} className="list-decimal list-inside space-y-1 mb-3">{currentList}</ol> :
          <ul key={`list-${i}`} className="list-disc list-inside space-y-1 mb-3">{currentList}</ul>
      );
      currentList = [];
      listType = null;
    }

    elements.push(
      <p key={i} className="mb-3" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
    );
  }

  // Close any remaining list
  if (currentList.length > 0) {
    elements.push(
      listType === 'ol' ? 
        <ol key="final-list" className="list-decimal list-inside space-y-1 mb-3">{currentList}</ol> :
        <ul key="final-list" className="list-disc list-inside space-y-1 mb-3">{currentList}</ul>
    );
  }

  return elements;
};

// Confidence Meter Component
const ConfidenceMeter = ({ confidence }: { confidence: number }) => {
  const getColor = () => {
    if (confidence >= 80) return 'bg-sage-500';
    if (confidence >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getWidthClass = () => {
    if (confidence >= 90) return 'w-[90%]';
    if (confidence >= 80) return 'w-[80%]';
    if (confidence >= 70) return 'w-[70%]';
    if (confidence >= 60) return 'w-[60%]';
    if (confidence >= 50) return 'w-[50%]';
    if (confidence >= 40) return 'w-[40%]';
    if (confidence >= 30) return 'w-[30%]';
    if (confidence >= 20) return 'w-[20%]';
    if (confidence >= 10) return 'w-[10%]';
    return 'w-[5%]';
  };

  return (
    <div className="flex items-center gap-3 pt-3 mt-3 border-t border-mist/20">
      <span className="text-sm text-mist">Confidence</span>
      <div className="flex-1 h-1.5 bg-mist/20 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${getColor()} ${getWidthClass()}`}
        />
      </div>
      <span className={`text-sm font-medium font-currency ${
        confidence >= 80 ? 'text-sage-600' : 
        confidence >= 60 ? 'text-amber-600' : 'text-rose-600'
      }`}>
        {confidence}%
      </span>
    </div>
  );
};

// AI Response Card Component
const AIResponseCard = ({ data, onFollowUp }: { data: QuestionAnswer; onFollowUp: (question: string) => void }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Answer */}
      <div className="prose-body max-w-none">
        {parseMarkdown(data.answer)}
      </div>

      {/* Estimated Costs */}
      {data.estimated_costs && data.estimated_costs.length > 0 && (
        <div className="bg-terracotta-50 border border-terracotta-200 rounded-xl p-4">
          <h4 className="font-semibold text-terracotta-900 mb-3 flex items-center gap-2">
            <span className="font-currency">💰</span> Estimated Costs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.estimated_costs.map((cost: any, i: number) => (
              <div key={i} className="bg-paper rounded-lg p-3 border border-terracotta-100">
                <div className="text-sm font-medium text-ink">{cost.item}</div>
                <div className="text-lg font-bold font-currency text-terracotta-600">{cost.amount}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <WarningCircle size={18} weight="fill" className="text-amber-500" />
            Important Warnings
          </h4>
          <ul className="space-y-2">
            {data.warnings.map((warning: string, i: number) => (
              <li key={i} className="text-sm text-amber-700 flex gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Policy Details Referenced */}
      {data.relevant_policy_details && data.relevant_policy_details.length > 0 && (
        <div className="border border-mist/20 rounded-xl">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-cloud transition-all"
          >
            <span className="font-medium text-ink">Policy Details Referenced</span>
            <span className="text-mist">
              {showDetails ? '▼' : '▶'}
            </span>
          </button>
          {showDetails && (
            <div className="px-4 pb-3 border-t border-mist/20">
              <ul className="space-y-2 mt-3">
                {data.relevant_policy_details.map((detail: string, i: number) => (
                  <li key={i} className="text-sm text-slate flex gap-2">
                    <span className="text-mist mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Questions */}
      {data.follow_up_questions && data.follow_up_questions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate">Follow-up Questions:</p>
          <div className="flex flex-wrap gap-2">
            {data.follow_up_questions.map((question: string, i: number) => (
              <button
                key={i}
                onClick={() => onFollowUp(question)}
                className="px-4 py-2 bg-paper border border-mist/30 text-slate rounded-full text-sm
                  hover:border-terracotta-300 hover:text-terracotta-600 transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {data.confidence && (
        <ConfidenceMeter confidence={data.confidence} />
      )}
    </div>
  );
};

export default function EstimationTool({ policyData }: EstimationToolProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "How much will an ER visit cost me?",
    "Am I covered for mental health therapy?",
    "What's my copay for a specialist?",
    "How much of my deductible have I met?",
    "Is physical therapy covered?",
    "What happens if I go out-of-network?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (question?: string) => {
    const q = question || input;
    if (!q.trim()) return;

    const userMessage: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.askPolicyQuestion(q, policyData, history);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        data: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-terracotta-50 
              flex items-center justify-center">
              <ChatCircle size={32} weight="duotone" className="text-terracotta-500" />
            </div>
            <h3 className="text-xl font-semibold text-ink mb-2">Ask me anything about your policy</h3>
            <p className="text-slate mb-6">I've analyzed your policy and can answer questions about coverage, costs, and more.</p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 bg-paper border border-mist/30 text-slate rounded-full text-sm
                    hover:border-terracotta-300 hover:text-terracotta-600 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md rounded-2xl rounded-br-sm px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-terracotta-500 text-white'
                  : 'card'
              }`}>
                {msg.data ? (
                  <AIResponseCard data={msg.data} onFollowUp={handleSend} />
                ) : (
                  <p className="text-slate">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="card">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-terracotta-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-terracotta-500 rounded-full animate-bounce animation-delay-100"></div>
                <div className="w-2 h-2 bg-terracotta-500 rounded-full animate-bounce animation-delay-200"></div>
                <span className="text-slate ml-2">Analyzing your policy...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-mist/20 p-4 bg-cloud/50">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your coverage, costs, or benefits..."
            className="input flex-1"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <PaperPlaneTilt size={18} weight="fill" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
