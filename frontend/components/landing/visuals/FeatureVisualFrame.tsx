import { ReactNode } from 'react';
import { visualTokens } from './visualTokens';

interface FeatureVisualFrameProps {
  srLabel: string;
  children: ReactNode;
  className?: string;
}

// Wrapper for every landing feature visual. Centralizes the a11y wiring:
// decorative DOM is hidden from assistive tech; srLabel carries the meaning.
export function FeatureVisualFrame({
  srLabel,
  children,
  className = '',
}: FeatureVisualFrameProps) {
  return (
    <div className={`${visualTokens.frame} ${className}`}>
      <span className="sr-only">{srLabel}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
