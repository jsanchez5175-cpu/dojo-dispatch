'use client'
// RIVAL RADAR — pre-queue prep. Pick who you're about to face, see your own
// matchup history against them, and get a Sensei gameplan before you hit ranked.
import { useState } from 'react'
import { ROSTER, getMatchups, charactersUsed } from '../lib/dojoStore'

export default function RivalRadar({ onAskSensei }: { onAskSensei?: (prompt: string) => void }) {
  const used = charactersUsed()
  const [mine, setMine] = useState(used[0] || 'Ryu')
  const [vs, setVs] = useState('Ken')

  const mu = getMatchups(mine).find(m => m.vs === vs)
  const wins = mu?.wins || 0
  const losses = mu?.losses || 0
  const total = wins + losses
  const rate = total ? Math.round((wins / total) * 100) : null

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header>
        <h1 className="text-2xl font-black tracking-tight">RIVAL RADAR</h1>
        <p className="text-xs text-neutral-400">Know who you're about to fight — before you queue</p>
      </header>

      <div className="flex gap-2">
        <select value={mine} onChange={e => setMine(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm w-full">
          {ROSTER.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={vs} onChange={e => setVs(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm w-full">
          {ROSTER.filter(r => r !== mine).map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
        <div className="text-xs text-neutral-400 mb-1">YOUR RECORD</div>
        {total === 0 ? (
          <div className="text-sm text-neutral-500">No logged matches yet — log results in The Climb's matchup grid and they'll show up here.</div>
        ) : (
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-black ${rate! >= 50 ? 'text-green-400' : 'text-red-400'}`}>{rate}%</span>
            <span className="text-sm text-neutral-400">{wins}W – {losses}L vs {vs}</span>
          </div>
        )}
      </div>

      {onAskSensei && (
        <button
          onClick={() => onAskSensei(
            `I'm about to queue into a ${vs} player with my ${mine}${total ? ` (I'm ${wins}-${losses} against ${vs} so far)` : ''}. Give me a tight pre-match gameplan: what to respect, what to punish, and one habit low-to-mid rank ${vs}s usually have.`)}
          className="w-full bg-rose-600 hover:bg-rose-500 rounded-lg py-2.5 text-sm font-bold">
          🥋 Ask Sensei: prep me for this matchup →
        </button>
      )}

      <p className="text-[11px] text-neutral-500 leading-relaxed">Record pulled from your own logged sessions and matchup grid — nothing here comes from a live opponent lookup, since Capcom exposes no public API for that.</p>
    </div>
  )
}
