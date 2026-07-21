# API Inspector Cert Prep

Mobile exam-prep app for the API ICP inspector certifications (510/570/653/571/577/580),
built on the NDT Cert Study engine. Expo SDK 54 / React Native 0.81 / Expo Router v6 / TypeScript.

## Data model
One shared question pool (`assets/bank_510.json`), each question tagged with an `exams`
array. A module's bank is the pool filtered to that exam code. Progress is keyed per
question id and deduped, so a shared question counts once across modules. Near-pairs are
tagged with `meta.exclusionGroup`; the form assembler never draws two from one group.

Current content: 323 SME-approved API 510 questions (all tagged `510`; 107 also tagged
`570`, 53 also `653`). The 570/653/571/577/580 modules surface their tagged subset and
fill in as their dedicated banks are authored.

## To-dos and bugs

Tracked in [GitHub Issues](https://github.com/texas0418/API-Inspector-Cert-Study/issues) — the
`pre-ship` label is the App Store submission checklist, `tech-debt` items have
inline eslint-disables pointing at them, and `handoff` issues carry
session-to-session notes. See AGENTS.md for the PR/CI workflow.

## Validation (run in repo before building)
- `npm run typecheck`  →  `tsc --noEmit`
- `npm run export:ios` →  `expo export --platform ios`

Both pass clean as shipped.

## Disclaimer
Independent study aid. Not affiliated with or endorsed by API.
