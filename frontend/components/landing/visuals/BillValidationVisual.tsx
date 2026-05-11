'use client';

import { useTranslations } from 'next-intl';
import { FeatureVisualFrame } from './FeatureVisualFrame';
import { visualTokens as t } from './visualTokens';
import { billMock } from './mockData';

export function BillValidationVisual() {
  const tTools = useTranslations('tools');
  return (
    <FeatureVisualFrame srLabel={tTools('billValidationSrLabel')}>
      <div className="relative">
        <div className={t.rowLabel + ' mb-3 tracking-wider uppercase'}>
          Patient statement
        </div>
        <div className="space-y-2">
          {billMock.lines.map((line, i) => {
            const flagged = line.duplicate;
            return (
              <div
                key={i}
                className={`flex items-stretch pl-3 ${flagged ? t.accentEdge : 'border-l-2 border-transparent'}`}
              >
                <div className="flex-1 min-w-0 flex items-baseline gap-3">
                  <span className={t.rowLabel + ' tabular-nums'}>{line.code}</span>
                  <span className={t.rowValue + ' truncate'}>{line.label}</span>
                </div>
                <span className={t.rowValue + ' tabular-nums'}>{line.amount}</span>
                {flagged && (
                  <span className="ml-3 self-center text-[10px] tracking-wider uppercase text-[#0A6640] font-medium">
                    Duplicate
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-[#E5E2DC] flex justify-end">
          <span className={t.badge}>{billMock.flaggedTotal}</span>
        </div>
      </div>
    </FeatureVisualFrame>
  );
}
