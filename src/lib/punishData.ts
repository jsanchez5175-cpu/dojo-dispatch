// PUNISH FINDER data — community-knowledge approximations of common
// punishable situations. Frame values are ballpark ("about -6"); the app
// tells players to verify in training mode. Curated: the situations that
// actually come up in ranked, not full movelists.

export interface Punishable {
  move: string           // what they did
  situation: string      // when/how you see it
  adv: number            // approx frames you're plus when it's blocked (positive = your turn)
  tier: 'light' | 'medium' | 'heavy' | 'launch'
}
export interface CharPunishes { character: string; entries: Punishable[] }

// tier meaning → what you can land
export const TIER_GUIDE: Record<Punishable['tier'], string> = {
  light:  '≈ +4 to +5 — quick light confirm into special. Practice your fastest hit-confirm.',
  medium: '≈ +6 to +7 — medium starter combo. Your bread-and-butter punish.',
  heavy:  '≈ +8 or more — heavy starter / full combo. Make it hurt.',
  launch: 'Crumple / huge recovery — Punish Counter state. Maximum damage, spend the meter.',
}

export const PUNISH_DATA: CharPunishes[] = [
  { character: 'Ken', entries: [
    { move: 'Blocked Dragon Punch (any)', situation: 'He wakes up mashing or anti-airs nothing', adv: 30, tier: 'launch' },
    { move: 'Blocked Drive Impact', situation: 'You blocked the DI (didn\'t get hit)', adv: 30, tier: 'launch' },
    { move: 'Jinrai overhead ender', situation: 'The overhead kick out of Jinrai, blocked', adv: 6, tier: 'medium' },
    { move: 'Raw Dragonlash', situation: 'Naked dragonlash kick blocked up close', adv: 5, tier: 'light' },
    { move: 'Sweep (2HK)', situation: 'Whiffed or blocked sweep', adv: 9, tier: 'heavy' },
    { move: 'EX Tatsu blocked', situation: 'Point-blank blocked EX tatsu', adv: 8, tier: 'heavy' },
  ]},
  { character: 'Ryu', entries: [
    { move: 'Blocked Dragon Punch', situation: 'Classic. He guessed wrong', adv: 30, tier: 'launch' },
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Sweep (2HK)', situation: 'Blocked or whiffed sweep', adv: 9, tier: 'heavy' },
    { move: 'Heavy Tatsu blocked', situation: 'Spinning kick blocked up close', adv: 7, tier: 'medium' },
    { move: 'Hashogeki (heavy) blocked', situation: 'Palm blocked without charge', adv: 5, tier: 'light' },
  ]},
  { character: 'Luke', entries: [
    { move: 'Blocked DP (Rising Uppercut)', situation: 'Guessed wrong on wakeup', adv: 30, tier: 'launch' },
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Heavy Flash Knuckle (no charge)', situation: 'Blocked point-blank', adv: 6, tier: 'medium' },
    { move: 'Sweep (2HK)', situation: 'Blocked sweep', adv: 10, tier: 'heavy' },
    { move: 'Sandblast spam (close)', situation: 'Blocked fireball in your face', adv: 4, tier: 'light' },
  ]},
  { character: 'JP', entries: [
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Departure (command grab) whiff', situation: 'You jumped or backdashed it', adv: 20, tier: 'launch' },
    { move: 'Sweep (2HK)', situation: 'Blocked sweep', adv: 10, tier: 'heavy' },
    { move: 'Stribog (ghost punch) heavy, close', situation: 'Blocked at close range', adv: 6, tier: 'medium' },
    { move: 'Amnesia trigger baited', situation: 'You made the counter whiff — he\'s frozen', adv: 25, tier: 'launch' },
  ]},
  { character: 'Cammy', entries: [
    { move: 'Blocked Cannon Spike (DP)', situation: 'Guessed wrong', adv: 30, tier: 'launch' },
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Spiral Arrow blocked (non-EX)', situation: 'Drill blocked at any range', adv: 8, tier: 'heavy' },
    { move: 'Hooligan throw whiff', situation: 'You stood still or jabbed the hooligan', adv: 12, tier: 'heavy' },
    { move: 'Sweep (2HK)', situation: 'Blocked sweep', adv: 9, tier: 'heavy' },
  ]},
  { character: 'Zangief', entries: [
    { move: 'Whiffed SPD', situation: 'You jumped/backdashed the command grab', adv: 25, tier: 'launch' },
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Blocked Lariat', situation: 'Double lariat blocked up close', adv: 8, tier: 'heavy' },
    { move: 'Whiffed Borscht Dynamite', situation: 'Air grab whiffed on your grounded self', adv: 20, tier: 'launch' },
    { move: 'Sweep (2HK)', situation: 'Blocked sweep', adv: 10, tier: 'heavy' },
  ]},
  { character: 'Juri', entries: [
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Heavy Fuha ender blocked', situation: 'The overhead kick release, blocked', adv: 6, tier: 'medium' },
    { move: 'Sweep (2HK)', situation: 'Blocked sweep', adv: 10, tier: 'heavy' },
    { move: 'Tensenrin (DP) blocked', situation: 'Her pinwheel DP blocked', adv: 28, tier: 'launch' },
    { move: 'Divekick blocked low', situation: 'Divekick hits your shins — she\'s minus', adv: 5, tier: 'light' },
  ]},
  { character: 'Akuma', entries: [
    { move: 'Blocked Dragon Punch', situation: 'Guessed wrong', adv: 30, tier: 'launch' },
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Demon flip grab whiff', situation: 'You walked out of the flip grab', adv: 15, tier: 'heavy' },
    { move: 'Heavy Tatsu blocked', situation: 'Blocked up close', adv: 7, tier: 'medium' },
    { move: 'Sweep (2HK)', situation: 'Blocked sweep', adv: 10, tier: 'heavy' },
  ]},
  { character: 'M. Bison', entries: [
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Psycho Crusher blocked (heavy)', situation: 'Blocked point-blank', adv: 7, tier: 'medium' },
    { move: 'Scissor Kick blocked (heavy)', situation: 'Heavy scissors blocked close', adv: 5, tier: 'light' },
    { move: 'Head Stomp read', situation: 'You walked under the stomp', adv: 15, tier: 'heavy' },
    { move: 'Sweep (2HK)', situation: 'Blocked sweep', adv: 10, tier: 'heavy' },
  ]},
  { character: 'Guile', entries: [
    { move: 'Blocked Flash Kick', situation: 'Guessed wrong on wakeup', adv: 28, tier: 'launch' },
    { move: 'Blocked Drive Impact', situation: 'You blocked it', adv: 30, tier: 'launch' },
    { move: 'Sweep (2HK)', situation: 'Blocked sweep', adv: 10, tier: 'heavy' },
    { move: 'Heavy Sonic Blade point-blank', situation: 'Set up the blade in your face', adv: 4, tier: 'light' },
    { move: 'Somersault whiff (charge drop)', situation: 'He lost charge and whiffed', adv: 20, tier: 'launch' },
  ]},
]

export const PUNISH_DISCLAIMER =
  'Frame values are community-knowledge approximations for quick reference — always verify exact punishes in Training Mode. When in doubt: block DP → biggest combo you own.'
