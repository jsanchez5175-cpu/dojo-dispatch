'use client'
// COMMUNITY TIER LIST — crowdsourced tier votes, aggregated server-side via
// /api/tierlist (Upstash Redis). Your own vote is remembered locally so you
// can change it later; the consensus badge reflects everyone's votes.
import { useState, useEffect } from 'react'
import { ROSTER } from '../lib/dojoStore'

const TIERS = ['S', 'A', 'B', 'C', 'D'] as const
type Tier = (typeof TIERS)[number]
const TIER_COLOR: Record<Tier, string> = {
  S: 'bg-amber-500 text-black border-amber-400',
  A: 'bg-neutral-300 text-black border-neutral-200',
  B: 'bg-sky-800 text-sky-200 border-sky-600',
  C: 'bg-neutral-700 text-neutral-300 border-neutral-600',
  D: 'bg-neutral-800 text-neutral-500 border-neutral-700',
}
const MY_VOTES_KEY = 'dojo_tierlist_votes'

function loadMyVotes(): Record<string, Tier> {
  try { return JSON.parse(localStorage.getItem(MY_VOTES_KEY) || '{}') } catch { return {} }
}
function saveMyVotes(v: Record<string, Tier>) {
  try { localStorage.setItem(MY_VOTES_KEY, JSON.stringify(v)) } catch {}
}
function consensus(counts?: Record<Tier, number>): Tier | null {
  if (!counts) return null
  const total = TIERS.reduce((s, t) => s + counts[t], 0)
  if (total === 0) return null
  return TIERS.reduce((best, t) => (counts[t] > counts[best] ? t : best), 'D' as Tier)
}

export default function CommunityTierList() {
  const [votes, setVotes] = useState<Record<string, Record<Tier, number>>>({})
  const [myVotes, setMyVotes] = useState<Record<string, Tier>>({})
  const [status, setStatus] = useState<'loading' | 'ready' | 'unconfigured' | 'error'>('loading')
  const [sel, setSel] = useState(ROSTER[0])

  useEffect(() => {
    setMyVotes(loadMyVotes())
    fetch('/api/tierlist').then(async r => {
      if (r.status === 503) { setStatus('unconfigured'); return }
      const data = await r.json()
      if (data.votes) { setVotes(data.votes); setStatus('ready') }
      else setStatus('error')
    }).catch(() => setStatus('error'))
  }, [])

  const cast = async (character: string, tier: Tier) => {
    const prevTier = myVotes[character]
    if (prevTier === tier) return
    const nextMine = { ...myVotes, [character]: tier }
    setMyVotes(nextMine); saveMyVotes(nextMine)
    try {
      const res = await fetch('/api/tierlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, tier, prevTier }),
      })
      const data = await res.json()
      if (data.counts) setVotes(v => ({ ...v, [character]: data.counts }))
    } catch {}
  }

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header>
        <h1 className="text-2xl font-black tracking-tight">COMMUNITY TIER LIST</h1>
        <p className="text-xs text-neutral-400">Crowdsourced, updated live — where do you disagree?</p>
      </header>

      {status === 'unconfigured' && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-4 text-xs text-yellow-200 leading-relaxed">
          Voting backend isn't set up yet. Add an Upstash Redis database to this Vercel project (Storage → Create Database → Upstash) — the env vars wire themselves up automatically. See the comment header in <code>src/app/api/tierlist/route.ts</code> for details.
        </div>
      )}

      <select value={sel} onChange={e => setSel(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm w-full">
        {ROSTER.map(r => <option key={r}>{r}</option>)}
      </select>

      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
        <div className="text-sm font-bold mb-3">Cast your vote for {sel}</div>
        <div className="flex gap-2">
          {TIERS.map(t => (
            <button key={t} onClick={() => cast(sel, t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-black border ${myVotes[sel] === t ? TIER_COLOR[t] : 'bg-neutral-900 border-neutral-700 text-neutral-400'}`}>
              {t}
            </button>
          ))}
        </div>
        {votes[sel] && (
          <div className="flex gap-2 mt-3 text-[11px] text-neutral-400">
            {TIERS.map(t => <span key={t}>{t}: {votes[sel][t]}</span>)}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {ROSTER.map(r => {
          const c = consensus(votes[r])
          return (
            <div key={r} onClick={() => setSel(r)} className="flex items-center justify-between bg-neutral-900/60 rounded-lg px-3 py-2 text-sm cursor-pointer">
              <span className={r === sel ? 'text-white font-bold' : 'text-neutral-300'}>{r}</span>
              <div className="flex items-center gap-2">
                {myVotes[r] && <span className="text-[10px] text-neutral-500">you: {myVotes[r]}</span>}
                {c ? (
                  <span className={`text-xs font-black w-6 h-6 rounded flex items-center justify-center border ${TIER_COLOR[c]}`}>{c}</span>
                ) : (
                  <span className="text-[10px] text-neutral-600">no votes</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-neutral-500 leading-relaxed">Consensus badge shows whichever tier has the most votes for that character. Your own picks are remembered on this device so you can change your mind later.</p>
    </div>
  )
}
