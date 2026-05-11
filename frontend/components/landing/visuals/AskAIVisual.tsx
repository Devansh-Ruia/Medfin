import { FeatureVisualFrame } from './FeatureVisualFrame';
import { visualTokens as t } from './visualTokens';
import { askAIMock } from './mockData';

export function AskAIVisual() {
  return (
    <FeatureVisualFrame srLabel="Ask questions about your insurance coverage in plain language and receive specific answers based on your policy.">
      <div className="space-y-3">
        <div className="ml-auto max-w-[80%] bg-white border border-[#E5E2DC] rounded-none px-4 py-3">
          <p className="text-sm text-[#0D0D0D]">{askAIMock.question}</p>
        </div>
        <div className={`${t.innerCard} ${t.accentEdge} max-w-[92%]`}>
          <p className="text-sm text-[#0D0D0D] leading-relaxed">
            {askAIMock.answer}
          </p>
        </div>
      </div>
    </FeatureVisualFrame>
  );
}
