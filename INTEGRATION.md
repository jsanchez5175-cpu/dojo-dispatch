# Dojo Dispatch — feature drop integration

## Files
- lib/dojoStore.ts        — rank-tracker local store (sessions, matchups, roster)
- lib/punishData.ts       — curated punishable situations (10 characters, expandable)
- lib/dossierData.ts      — character dossiers (Ingrid authored, Yasmien EDIT-ME)
- lib/revenuecat.ts       — Dojo Pro billing (RevenueCat, Capacitor)
- components/TheClimb.tsx        — rank tracker + share card
- components/PunishFinder.tsx    — punish reference (accepts onAskSensei)
- components/CharacterDossier.tsx — new-character hub (accepts onAskSensei)

## Wiring (Next.js)
Copy `lib/` and `components/` into `src/` (merge with existing folders).

App Router:  create three routes, each a thin page:
  src/app/climb/page.tsx      → `import TheClimb from '@/components/TheClimb'; export default TheClimb`
  src/app/punish/page.tsx     → same pattern with PunishFinder
  src/app/challenger/page.tsx → same pattern with CharacterDossier
Pages Router: identical but under src/pages/.

Hook Sensei: pass your existing ask function —
  <PunishFinder onAskSensei={(p) => openSensei(p)} />
(where openSensei routes the prompt into the AI Sensei chat input).

Add nav entries: Climb 📈 · Punish 🎯 · New 🥊

## Pro gating suggestion
Free: Climb logging, 1 character's punish list, dossier gameplan tab.
Pro:  full punish roster, matchup grid history, counterplay tabs, unlimited Sensei.
  const pro = await isPro(); if (!pro) showPaywall()

## RevenueCat setup (one-time)
1. Play Console → Dojo Dispatch → Monetize → In-app products → Create:
   ID `dojo_pro`, $4.99, one-time. Activate.
2. dashboard.revenuecat.com → new project → Android app, package
   com.aethelaps.dojodispatch → connect Play service-account JSON.
3. Entitlement `pro` → attach `dojo_pro` → default Offering with one package.
4. Copy the PUBLIC Android SDK key into lib/revenuecat.ts (RC_ANDROID_KEY).
5. `npm i @revenuecat/purchases-capacitor && npx cap sync android`
6. Call `initBilling()` once at app start; gate with `isPro()`; sell with `buyPro()`.
7. Replace the old localStorage-only "Unlock Dojo Pro" flag with buyPro().

## Data maintenance
- New DLC character → add a Dossier object in dossierData.ts (10 min).
- Punish roster grows by adding CharPunishes entries in punishData.ts.
- Yasmien: fill every EDIT-ME after your first sessions; flip verified: true.
- Ingrid: kit described from her classic incarnation — verify her actual SF6
  moves in-game and adjust names/notes, then flip verified: true.
