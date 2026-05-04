'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { api, PolicyData, QuestionAnswer } from '../lib/api';
import { event } from '../lib/analytics';
import { Globe, DollarSign, AlertTriangle } from 'lucide-react';
import { gsap } from '@/lib/motion/gsap';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface EstimationToolProps {
  policyData: PolicyData;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: QuestionAnswer;
  sources?: Array<{ title: string; url: string }>;
  search_grounded?: boolean;
}

// Markdown parsing functions
const formatInlineMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-[#F9F8F6] px-1 py-0.5 rounded-none text-sm">$1</code>');
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
    if (confidence >= 80) return 'bg-[#0A6640]';
    if (confidence >= 60) return 'bg-[#D97706]';
    return 'bg-[#C0392B]';
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
    <div className="flex items-center gap-2">
      <span className="text-sm text-[#6B6B6B]">Confidence:</span>
      <div className="flex-1 bg-[#E5E2DC] rounded-none h-2 max-w-[100px]">
        <div 
          className={`h-2 rounded-none transition-all ${getColor()} ${getWidthClass()}`}
        />
      </div>
      <span className="text-sm font-medium text-[#0D0D0D]">{confidence}%</span>
    </div>
  );
};

// AI Response Card Component
const AIResponseCard = ({ data, sources, search_grounded, onFollowUp }: { 
  data: QuestionAnswer; 
  sources?: Array<{ title: string; url: string }>;
  search_grounded?: boolean;
  onFollowUp: (question: string) => void; 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Answer */}
      <div className="prose prose-sm max-w-none">
        {parseMarkdown(data?.answer ?? '')}
      </div>
      
      {/* Web Search Indicator */}
      {search_grounded && (
        <span className="text-xs text-[#6B6B6B] flex items-center gap-1 mt-1">
          <Globe className="w-3 h-3" /> Includes web results
        </span>
      )}
      
      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#E5E2DC]">
          <p className="text-xs text-[#6B6B6B] mb-1">Sources</p>
          <div className="flex flex-col gap-1">
            {sources.map((source, i) => (
              <a 
                key={i}
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#0A6640] hover:underline truncate"
              >
                {source.title || source.url}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Estimated Costs */}
      {data.estimated_costs && data.estimated_costs.length > 0 && (
        <div className="bg-[#E8F5EE] border border-[#0A6640] rounded-none p-4">
          <h4 className="font-semibold text-[#0A6640] mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Estimated Costs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.estimated_costs.map((cost: any, i: number) => (
              <div key={i} className="bg-white rounded-none p-3 border border-[#0A6640]">
                <div className="text-sm font-medium text-[#0D0D0D]">{cost.item}</div>
                <div className="text-lg font-bold text-[#0A6640]">{cost.amount}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {(data?.warnings ?? []).length > 0 && (
        <div className="bg-[#FFFBEB] border border-[#D97706] rounded-none p-4">
          <h4 className="font-semibold text-[#D97706] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Important Notes
          </h4>
          <ul className="space-y-2">
            {(data?.warnings ?? []).map((warning: string, i: number) => (
              <li key={i} className="text-sm text-[#D97706] flex items-start gap-2">
                <span className="text-[#D97706] mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Policy Details Referenced */}
      {(data?.relevant_policy_details ?? []).length > 0 && (
        <div className="border border-[#E5E2DC] rounded-none">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F9F8F6] transition"
          >
            <span className="font-medium text-[#0D0D0D]">Policy Details Referenced</span>
            <span className="text-[#6B6B6B]">
              {showDetails ? '▼' : '▶'}
            </span>
          </button>
          {showDetails && (
            <div className="px-4 pb-3 border-t border-[#E5E2DC]">
              <ul className="space-y-2 mt-3">
                {(data?.relevant_policy_details ?? []).map((detail: string, i: number) => (
                  <li key={i} className="text-sm text-[#6B6B6B] flex items-start gap-2">
                    <span className="text-[#6B6B6B] mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Questions */}
      {(data?.follow_up_questions ?? []).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#0D0D0D]">Follow-up Questions:</p>
          <div className="flex flex-wrap gap-2">
            {(data?.follow_up_questions ?? []).map((question, i) => (
              <button
                key={i}
                onClick={() => onFollowUp(question)}
                className="px-3 py-1.5 bg-[#F9F8F6] hover:bg-[#E5E2DC] text-[#0D0D0D] rounded-none text-sm transition"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      {data?.confidence != null && (
        <div className="pt-3 border-t border-[#E5E2DC]">
          <ConfidenceMeter confidence={data.confidence ?? 0} />
        </div>
      )}
    </div>
  );
};

// Per-message wrapper. Animates only on first mount, only for assistant messages —
// user messages need to feel instant since the user just typed them.
function ChatMessage({ msg, onFollowUp }: { msg: Message; onFollowUp: (q: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const animated = useRef(false);

  useEffect(() => {
    if (reduced || animated.current || !ref.current) return;
    animated.current = true;
    if (msg.role === 'user') return;
    gsap.from(ref.current, { opacity: 0, y: 4, duration: 0.2, ease: 'power2.out' });
  }, [reduced, msg.role]);

  return (
    <div ref={ref} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl w-full rounded-none px-4 py-3 ${
        msg.role === 'user'
          ? 'bg-[#0D0D0D] text-white'
          : 'bg-[#F9F8F6] text-[#0D0D0D] border border-[#E5E2DC]'
      }`}>
        {msg.data ? (
          <AIResponseCard
            data={msg.data}
            sources={msg.sources}
            search_grounded={msg.search_grounded}
            onFollowUp={onFollowUp}
          />
        ) : (
          <p className={msg.role === 'user' ? 'text-white' : 'text-[#0D0D0D]'}>{msg.content}</p>
        )}
      </div>
    </div>
  );
}

export default function EstimationTool({ policyData }: EstimationToolProps) {
  const t = useTranslations('askAI')
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
    event('ask_question');

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.askPolicyQuestion(q, policyData, history);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response?.answer ?? 'No answer was returned. Please try again.',
        data: response,
        sources: response?.sources ?? undefined,
        search_grounded: response?.search_grounded ?? undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t('errorMessage'),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-none overflow-hidden">
      {/* Chat Messages */}
      <div data-lenis-prevent className="h-[500px] overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold text-[#0D0D0D] mb-2">Ask me anything about your policy</h3>
            <p className="text-[#6B6B6B] mb-8">I've analyzed your policy and can answer questions about coverage, costs, and more.</p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 border border-[#E5E2DC] text-[#6B6B6B] rounded-none text-sm hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} onFollowUp={handleSend} />
          ))
        )}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#F9F8F6] border border-[#E5E2DC] rounded-none px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce animation-delay-100"></div>
                <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce animation-delay-200"></div>
                <span className="text-[#6B6B6B] ml-2">Analyzing your policy...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#E5E2DC] p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('placeholder')}
            className="flex-1 px-4 py-3 bg-white border border-[#E5E2DC] rounded-none text-sm focus:ring-2 focus:ring-[#0A6640] focus:border-[#0A6640] transition-all"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="bg-[#0D0D0D] text-white text-sm px-6 py-3 rounded-none font-medium hover:bg-[#1A1A1A] disabled:opacity-50 transition-all"
          >
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  );
}
