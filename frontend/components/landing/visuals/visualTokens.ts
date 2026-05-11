// Shared class fragments for landing feature visuals. Kept here so all six
// scenes feel like one family — change a token, change them all.

export const visualTokens = {
  frame:
    'bg-white border border-[#E5E2DC] rounded-none p-6 sm:p-8',
  innerCard:
    'bg-[#F9F8F6] border border-[#E5E2DC] rounded-none p-4',
  accentEdge: 'border-l-2 border-[#0A6640]',
  badge:
    'inline-block text-[10px] tracking-wider uppercase bg-[#0A6640] text-white px-2 py-0.5 rounded-none',
  mutedLine: 'h-1.5 bg-[#E5E2DC]',
  rowLabel: 'text-xs text-[#6B6B6B]',
  rowValue: 'text-sm text-[#0D0D0D] font-medium',
} as const;
