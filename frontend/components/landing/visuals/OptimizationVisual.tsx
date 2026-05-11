'use client';

import { useTranslations } from 'next-intl';
import { FeatureVisualFrame } from './FeatureVisualFrame';
import { visualTokens as t } from './visualTokens';
import { optimizationMock } from './mockData';

export function OptimizationVisual() {
  const tTools = useTranslations('tools');
  return (
    <FeatureVisualFrame srLabel={tTools('policyOptimizationSrLabel')}>
      <div className="space-y-3">
        <Row plan={optimizationMock.current} />
        <Row plan={optimizationMock.suggested} accent badgeText={optimizationMock.savings} />
      </div>
    </FeatureVisualFrame>
  );
}

function Row({
  plan,
  accent,
  badgeText,
}: {
  plan: { label: string; amount: string };
  accent?: boolean;
  badgeText?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 pl-3 py-2 ${
        accent ? t.accentEdge : 'border-l-2 border-transparent'
      }`}
    >
      <div className="min-w-0">
        <div className={t.rowLabel + ' tracking-wider uppercase'}>{plan.label}</div>
        <div className="text-base font-medium text-[#0D0D0D] tabular-nums">
          {plan.amount}
        </div>
      </div>
      {badgeText && <span className={t.badge}>{badgeText}</span>}
    </div>
  );
}
