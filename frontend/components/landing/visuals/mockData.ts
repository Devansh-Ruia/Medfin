// Synthetic data for landing feature visuals. Never PHI.
// CPT codes are public reference codes. BlueCrest is an existing fictional
// insurer used elsewhere in test fixtures.

export const policyMock = {
  deductible: '$500',
  specialistCopay: '$65',
  oopMax: '$2,500',
  density: 6, // lines of muted policy-text behind the summary
} as const;

interface BillLine {
  code: string;
  label: string;
  amount: string;
  duplicate?: boolean;
}

export const billMock: { lines: BillLine[]; flaggedTotal: string } = {
  lines: [
    { code: '99213', label: 'Office visit', amount: '$120' },
    { code: '36415', label: 'Venipuncture', amount: '$28' },
    { code: '36415', label: 'Venipuncture', amount: '$28', duplicate: true },
    { code: '85025', label: 'Blood panel', amount: '$57' },
  ],
  flaggedTotal: '$85 flagged',
};

export const askAIMock = {
  question: 'Is my MRI covered?',
  answer:
    'Yes, with prior authorization. After your $500 deductible, you pay 20% coinsurance.',
} as const;

export const optimizationMock = {
  current: { label: 'Current plan', amount: '$8,400/year' },
  suggested: { label: 'Suggested plan', amount: '$6,200/year' },
  savings: 'Save $2,200',
} as const;

interface PreVisitRow {
  label: string;
  amount: string;
  emphasis?: boolean;
}

export const preVisitMock: {
  procedure: string;
  cpt: string;
  rows: PreVisitRow[];
} = {
  procedure: 'MRI Brain',
  cpt: 'CPT 70553',
  rows: [
    { label: 'Negotiated rate', amount: '$1,800' },
    { label: 'Insurance pays', amount: '$1,380' },
    { label: 'Your cost', amount: '$420', emphasis: true },
  ],
};

export const appealMock = {
  denialReason: 'Not medically necessary',
  denialCode: 'Code 96',
  letterOpening: [
    'To the BlueCrest Appeals Department',
    'Re: Claim denial dated April 14',
    'I am writing to formally appeal the denial of...',
  ],
} as const;
