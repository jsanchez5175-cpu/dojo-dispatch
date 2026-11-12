// The Climb — local-first data store for rank tracking.
// Everything lives on-device; no Capcom API exists, so the player's own log
// is the legitimate data source.

export type GameMode = 'ranked' | 'master'
export interface SessionLog {
  id: string
  date: string
  character: string
  mode: GameMode
  points: number
  wins: number
  losses: number
  notes?: string
}
export interface MatchupLog { vs: string; wins: number; losses: number }

const K = 'dojo_'
function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { const v = localStorage.getItem(K + key); return v ? JSON.parse(v) as T : fallback }
  catch { return fallback }
}
function set<T>(key: string, value: T): T {
  try { localStorage.setItem(K + key, JSON.stringify(value)) } catch {}
  return value
}

export const today = () => new Date().toISOString().slice(0, 10)

export function getSessions(): SessionLog[] { return get<SessionLog[]>('sessions', []) }
export function addSession(s: Omit<SessionLog, 'id'>): SessionLog[] {
  const list = getSessions()
  list.unshift({ ...s, id: Date.now().toString(36) })
  return set('sessions', list.slice(0, 500))
}
export function deleteSession(id: string): SessionLog[] {
  return set('sessions', getSessions().filter(s => s.id !== id))
}
export function appendSessionNote(id: string, note: string): SessionLog[] {
  const list = getSessions()
  const s = list.find(x => x.id === id)
  if (s) s.notes = [s.notes, note].filter(Boolean).join(' — ')
  return set('sessions', list)
}
export function getMatchups(character: string): MatchupLog[] {
  return get<MatchupLog[]>('mu_' + character, [])
}
export function bumpMatchup(character: string, vs: string, won: boolean): MatchupLog[] {
  const list = getMatchups(character)
  let m = list.find(x => x.vs === vs)
  if (!m) { m = { vs, wins: 0, losses: 0 }; list.push(m) }
  if (won) m.wins++; else m.losses++
  return set('mu_' + character, list)
}
export function charactersUsed(): string[] {
  return Array.from(new Set(getSessions().map(s => s.character)))
}
export function seriesFor(character: string, mode: GameMode): { date: string; points: number }[] {
  return getSessions()
    .filter(s => s.character === character && s.mode === mode)
    .map(s => ({ date: s.date, points: s.points }))
    .reverse()
}
export function totals(character?: string): { wins: number; losses: number } {
  return getSessions()
    .filter(s => !character || s.character === character)
    .reduce((a, s) => ({ wins: a.wins + s.wins, losses: a.losses + s.losses }), { wins: 0, losses: 0 })
}

export const ROSTER = [
  'Ryu','Ken','Luke','Jamie','Chun-Li','Guile','Kimberly','Juri','Blanka','Dhalsim',
  'E. Honda','Dee Jay','Manon','Marisa','JP','Zangief','Lily','Cammy','Rashid','A.K.I.',
  'Ed','Akuma','M. Bison','Terry','Mai','Elena','Sagat','C. Viper','Alex','Ingrid','Yasmien',
]
