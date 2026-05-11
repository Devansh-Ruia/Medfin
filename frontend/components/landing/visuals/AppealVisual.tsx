import { FeatureVisualFrame } from './FeatureVisualFrame';
import { visualTokens as t } from './visualTokens';
import { appealMock } from './mockData';

export function AppealVisual() {
  return (
    <FeatureVisualFrame srLabel="Appeal letter generation transforms insurance denials into formatted appeal letters citing your policy and clinical evidence.">
      <div className="space-y-3">
        {/* Denial */}
        <div className={t.innerCard}>
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#0D0D0D] font-semibold">
              Denied
            </span>
            <span className={t.rowLabel + ' tabular-nums'}>
              {appealMock.denialCode}
            </span>
          </div>
          <p className="text-sm text-[#0D0D0D]">{appealMock.denialReason}</p>
        </div>

        {/* Connector */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-[#0A6640]" />
        </div>

        {/* Drafted letter */}
        <div className={`${t.innerCard} ${t.accentEdge}`}>
          <div className={t.rowLabel + ' mb-2 tracking-wider uppercase'}>
            Appeal drafted
          </div>
          <div className="space-y-1">
            {appealMock.letterOpening.map((line, i) => (
              <p key={i} className="text-sm text-[#0D0D0D] leading-snug">
                {line}
                {i === appealMock.letterOpening.length - 1 && (
                  <span className="text-[#6B6B6B]"> …</span>
                )}
              </p>
            ))}
          </div>
        </div>
      </div>
    </FeatureVisualFrame>
  );
}
