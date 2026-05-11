# Translations TODO

Keys present in all five locale files but holding English placeholder text in `hi.json` and `zh.json`. JSON does not support inline comments, so this file is the single source of truth for outstanding translation work.

Convention: when a translator commits a real translation, remove the entry from this list. When the list is empty, delete this file.

## hi.json (Hindi)

- `tools.policyAnalysisSrLabel`
- `tools.billValidationSrLabel`
- `tools.preVisitSrLabel`
- `tools.askAISrLabel`
- `tools.policyOptimizationSrLabel`
- `tools.appealLettersSrLabel`

## zh.json (Mandarin)

- `tools.policyAnalysisSrLabel`
- `tools.billValidationSrLabel`
- `tools.preVisitSrLabel`
- `tools.askAISrLabel`
- `tools.policyOptimizationSrLabel`
- `tools.appealLettersSrLabel`

## Context

These are `sr-only` accessibility labels read by screen readers for the six feature visuals on the landing page. They describe what each tool does in plain language. en/es/fr translations were written by a confident author. hi/zh were left in English to avoid mistranslation of healthcare terminology.

Canonical English source: `messages/en.json` keys ending in `SrLabel`.

## Principle

**Do not machine-translate.** Healthcare and insurance terminology ("medical necessity", "prior authorization", "appeal", "deductible", "copay") requires human translators familiar with the target language's medical and legal conventions. A mistranslated `srLabel` will mislead a screen-reader user about what the tool does — in a context where they are likely already stressed and may not have a second language to fall back on. English placeholder is the safe fallback until a human translator confirms the rendering.
