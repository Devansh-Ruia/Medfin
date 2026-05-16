// Pure presentational. Leads every tool result with a plain-English verdict
// so the user does not have to scroll past structured cards to find the
// answer. The accent edge color matches `accentEdge` in
// `components/landing/visuals/visualTokens.ts`; intentionally inlined here
// to avoid coupling the tools layer to the landing layer.

interface VerdictBannerProps {
  eyebrow: string;
  headline: string;
  supportingFact?: string;
}

export function VerdictBanner({ eyebrow, headline, supportingFact }: VerdictBannerProps) {
  return (
    <div
      data-reveal-section
      className="bg-[#F9F8F6] border border-[#E5E2DC] border-l-2 border-l-[#0A6640] rounded-none p-6 sm:p-8"
    >
      <div className="text-xs tracking-[0.2em] text-[#6B6B6B] uppercase mb-3">
        {eyebrow}
      </div>
      <div className="text-xl md:text-2xl font-semibold text-[#0D0D0D] leading-tight">
        {headline}
      </div>
      {supportingFact && (
        <div className="text-sm text-[#6B6B6B] mt-2">{supportingFact}</div>
      )}
    </div>
  );
}
