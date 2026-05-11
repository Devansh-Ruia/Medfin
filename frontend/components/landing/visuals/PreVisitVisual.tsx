import { FeatureVisualFrame } from './FeatureVisualFrame';
import { visualTokens as t } from './visualTokens';
import { preVisitMock } from './mockData';

export function PreVisitVisual() {
  return (
    <FeatureVisualFrame srLabel="Pre-visit planning estimates what a procedure will cost you under your insurance before you receive care.">
      <div>
        <div className={t.rowLabel + ' mb-1 tracking-wider uppercase'}>
          Cost estimate
        </div>
        <div className="flex items-baseline justify-between gap-3 mb-4 pb-3 border-b border-[#E5E2DC]">
          <span className="text-lg font-medium text-[#0D0D0D]">
            {preVisitMock.procedure}
          </span>
          <span className={t.rowLabel + ' tabular-nums'}>{preVisitMock.cpt}</span>
        </div>
        <div className="space-y-2">
          {preVisitMock.rows.map((row, i) => (
            <div
              key={i}
              className="flex justify-between items-baseline gap-3"
            >
              <span
                className={
                  row.emphasis
                    ? 'text-sm text-[#0D0D0D] font-semibold'
                    : t.rowLabel
                }
              >
                {row.label}
              </span>
              <span
                className={
                  row.emphasis
                    ? 'text-base text-[#0D0D0D] font-semibold tabular-nums'
                    : t.rowValue + ' tabular-nums'
                }
              >
                {row.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </FeatureVisualFrame>
  );
}
