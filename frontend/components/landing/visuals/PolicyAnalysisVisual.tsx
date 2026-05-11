'use client';

import { useTranslations } from 'next-intl';
import { FeatureVisualFrame } from './FeatureVisualFrame';
import { visualTokens as t } from './visualTokens';
import { policyMock } from './mockData';

export function PolicyAnalysisVisual() {
  const tTools = useTranslations('tools');
  return (
    <FeatureVisualFrame srLabel={tTools('policyAnalysisSrLabel')}>
      <div className="relative">
        {/* Dense policy text behind — represents the wall of legal copy */}
        <div
          className="absolute inset-x-4 top-0 -translate-y-3 opacity-50 space-y-1.5"
          style={{ filter: 'blur(0.2px)' }}
        >
          {Array.from({ length: policyMock.density }).map((_, i) => (
            <div
              key={i}
              className={t.mutedLine}
              style={{ width: `${72 + ((i * 13) % 22)}%` }}
            />
          ))}
        </div>

        {/* Clean summary, layered on top */}
        <div className={`${t.innerCard} ${t.accentEdge} relative mt-10`}>
          <div className={t.rowLabel + ' mb-3 tracking-wider uppercase'}>
            Policy summary
          </div>
          <div className="space-y-2">
            <Row label="Deductible" value={policyMock.deductible} />
            <Row label="Specialist visit" value={policyMock.specialistCopay + ' copay'} />
            <Row label="Out-of-pocket max" value={policyMock.oopMax} />
          </div>
        </div>
      </div>
    </FeatureVisualFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-3">
      <span className={t.rowLabel}>{label}</span>
      <span className={t.rowValue + ' tabular-nums'}>{value}</span>
    </div>
  );
}
