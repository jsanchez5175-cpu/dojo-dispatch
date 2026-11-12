// NEW CHARACTER DOSSIERS — data-driven so a new DLC drop is a data edit,
// not a rebuild. Ingrid is authored from classic-kit knowledge; verify her
// SF6 kit in-game and adjust. "Yasmien" slots are marked EDIT-ME — fill from
// in-game once you've played her (name/kit unverified at build time).

export interface Dossier {
  id: string
  name: string
  tagline: string
  archetype: string
  verified: boolean            // false = fields need in-game confirmation
  gameplan: string[]           // playing AS them
  keyTools: { name: string; why: string }[]
  counterplay: string[]        // playing AGAINST them
  dayOne: string[]             // first-hour learning path
  senseiPrompts: string[]
}

export const DOSSIERS: Dossier[] = [
  {
    id: 'ingrid',
    name: 'Ingrid',
    tagline: 'The Eternal Goddess returns',
    archetype: 'Mobile mix-up / install (classic kit: Sun-based teleports & counters — verify SF6 version in-game)',
    verified: false,
    gameplan: [
      'Control mid-range with her sun projectile, then convert fear of it into walk-up pressure.',
      'Use her mobility specials to reposition and cross up — she wins by making you guess sides.',
      'Build toward her install/power-up state and cash it in for extended pressure sequences.',
    ],
    keyTools: [
      { name: 'Sun Shot (projectile)', why: 'Screen control and plus-frame setups — her turns start here.' },
      { name: 'Sun Arch / mobility special', why: 'The side-switch threat that makes her offense ambiguous.' },
      { name: 'Counter / parry tool', why: 'Punishes autopilot pressure — respect it or feed it.' },
    ],
    counterplay: [
      'Hold your ground on side-switches — premium anti-airs and autocorrect DPs beat the acrobatics.',
      'Do not throw out predictable strings; her counter tool farms autopilot offense.',
      'When she installs, play patient — the install has a clock. Make her spend it on your block.',
    ],
    dayOne: [
      'Training mode: 15 minutes on her fireball spacing — learn where it is plus on block.',
      'Learn one BnB from her main confirm starter and one Punish Counter combo.',
      'Ranked set: play 10 matches using only fireball + normals. Add mobility mix-ups after.',
    ],
    senseiPrompts: [
      'Build me a day-one Ingrid gameplan for ranked.',
      'What are Ingrid\'s weaknesses and how do opponents exploit them?',
      'Give me a 20-minute Ingrid training-mode routine.',
    ],
  },
  {
    id: 'yasmien',
    name: 'Yasmien',
    tagline: 'EDIT ME — official tagline',
    archetype: 'EDIT ME — archetype after first sessions (rushdown? zoner? grappler?)',
    verified: false,
    gameplan: [
      'EDIT ME — core win condition #1 (what does she want the round to look like?)',
      'EDIT ME — core win condition #2',
      'EDIT ME — meter/system priority (Drive usage, super priorities)',
    ],
    keyTools: [
      { name: 'EDIT ME — signature special', why: 'Why it defines her.' },
      { name: 'EDIT ME — best normal', why: 'The button that wins neutral.' },
      { name: 'EDIT ME — mix-up tool', why: 'How she opens people up.' },
    ],
    counterplay: [
      'EDIT ME — her biggest exploitable weakness',
      'EDIT ME — what to do when she starts her pressure',
      'EDIT ME — the habit low-rank Yasmiens will all have',
    ],
    dayOne: [
      'Training mode: learn her fastest punish button and one BnB.',
      'Find which special is unsafe on block — that is what opponents will fish for.',
      'Ranked set: 10 matches, fundamentals only, before learning setups.',
    ],
    senseiPrompts: [
      'Build me a day-one gameplan for the newest SF6 character.',
      'How do I fight against the newest SF6 character?',
    ],
  },
]
