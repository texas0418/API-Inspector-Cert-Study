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

## Setup (on your machine — account/native-bound steps)
1. `npx expo install --fix`   (reconcile native module versions against the live manifest)
2. RevenueCat: create the app config for bundle `com.apiicpstudy.app`, copy the new
   `appl_` key into `REVENUECAT_IOS_API_KEY` in `lib/purchases.ts`.
3. App Store Connect: create six non-consumable IAPs — `unlock_api510`, `unlock_api570`,
   `unlock_api653`, `unlock_api571`, `unlock_api577`, `unlock_api580`.
4. `eas init`, then `eas build -p ios --profile production`,
   then `eas submit -p ios --profile production --latest`.
5. App Privacy: declare the email-report data collection (the report feature sends the
   user's address via the mail composer). Replace the placeholder `assets/icon.png`.

## Validation (run in repo before building)
- `npm run typecheck`  →  `tsc --noEmit`
- `npm run export:ios` →  `expo export --platform ios`

Both pass clean as shipped.

## Disclaimer
Independent study aid. Not affiliated with or endorsed by API.
