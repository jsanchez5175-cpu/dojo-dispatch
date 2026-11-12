// GHOST RIVAL — lightweight pro-player reference data. Kept separate from the
// full Players tab dossiers (page.tsx) since this only needs enough to seed a
// Sensei prompt, not full bios/timelines.

export interface ProPlayer {
  key: string
  name: string
  flag: string
  main: string
  style: string // one-line playstyle summary Sensei can build a gameplan from
}

export const PRO_PLAYERS: ProPlayer[] = [
  { key: 'endingwalker', name: 'EndingWalker', flag: '🇩🇪', main: 'Ryu', style: 'patient, methodical neutral; never takes risks; wins on anti-air discipline and punish accuracy' },
  { key: 'punk', name: 'Punk', flag: '🇺🇸', main: 'Luke', style: 'overwhelming confidence, frame-perfect Drive Rush pressure, elite corner carry and reads' },
  { key: 'tokido', name: 'Tokido', flag: '🇯🇵', main: 'JP', style: 'adapts mid-set based on what he sees; patient zoning; gets more dangerous when losing' },
  { key: 'menard', name: 'MenaRD', flag: '🇩🇴', main: 'TBC', style: 'explosive all-in offense, elite execution, highest damage-per-touch in the world' },
  { key: 'daigo', name: 'Daigo Umehara', flag: '🇯🇵', main: 'Ryu/Ken', style: 'pure fundamentals — purposeful inputs, superior spacing, unmatched mid-set adaptation' },
  { key: 'justinwong', name: 'Justin Wong', flag: '🇺🇸', main: 'Various', style: 'supernatural reads built from decades of experience; uses character-switching as a mind game' },
  { key: 'angrybird', name: 'AngryBird', flag: '🇦🇪', main: 'Rashid', style: 'surgical wind pressure timing, crisp Drive Rush confirms, exploits opponent patterns mid-match' },
  { key: 'nuckledu', name: 'NuckleDu', flag: '🇺🇸', main: 'Guile', style: 'textbook defensive wall — perfectly timed Sonic Booms, frame-perfect Flash Kick, punishes overextension' },
  { key: 'sahara', name: 'Sahara', flag: '🇯🇵', main: 'Ryu', style: 'composed Season 3 Ryu — disciplined anti-airs, Denjin zoning, clean punish-counter conversions under pressure' },
  { key: 'kawano', name: 'Kawano', flag: '🇯🇵', main: 'Chun-Li/Akuma', style: 'switches gameplans by matchup — patient poke-and-chip Chun-Li or all-in Akuma punish windows' },
  { key: 'nemo', name: 'Nemo', flag: '🇰🇷', main: 'Zangief', style: 'absorbs pressure behind armor and defense until one SPD read changes the whole set' },
  { key: 'fuudo', name: 'Fuudo', flag: '🇯🇵', main: 'Dhalsim', style: 'spacing chess — controls where the match happens, punishes any approach before it lands' },
]
