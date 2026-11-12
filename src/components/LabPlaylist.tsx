'use client'
// LAB PLAYLIST — turns your worst logged matchups into a concrete training
// routine instead of leaving you to guess what to drill tonight.
import { useState, useMemo } from 'react'
import { ROSTER, getMatchups, charactersUsed } from '../lib/dojoStore'

export default function LabPlaylist({ onAskSensei }: { onAskSensei?: (prompt: string) => void }) {
  const used = charactersUsed()
  const [mine, setMine] = useState(used[0] || 'Ryu')

  const worst = useMemo(() => {
    return getMatchups(mine)
      .map(m => ({ ...m, total: m.wins + m.losses, rate: (m.wins + m.losses) ? m.wins / (m.wins + m.losses) : 1 }))
      .filter(m => m.total >= 2)
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3)
  }, [mine])

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header>
        <h1 className="text-2xl font-black tracking-tight">LAB PLAYLIST</h1>
        <p className="text-xs text-neutral-400">Tonight's training routine, built from your actual losses</p>
      </header>

      <select value={mine} onChange={e => setMine(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm w-full">
        {ROSTER.map(r => <option key={r}>{r}</option>)}
      </select>

      {worst.length === 0 ? (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 text-sm text-neutral-500">
          Log at least 2 matches against a couple of matchups in The Climb's grid first — the playlist builds itself from that data.
        </div>
      ) : (
        <div className="space-y-3">
          {worst.map((m, i) => (
            <div key={m.vs} className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">{i + 1}. vs {m.vs}</span>
                <span className={`text-xs font-bold ${m.rate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                  {m.wins}-{m.losses} · {Math.round(m.rate * 100)}%
                </span>
              </div>
              {onAskSensei && (
                <button
                  onClick={() => onAskSensei(
                    `My ${mine} is ${m.wins}-${m.losses} against ${m.vs}. Give me a focused 15-minute training-mode drill to close this gap — one specific thing to lab, not a generic matchup essay.`)}
                  className="mt-1 text-xs font-bold text-rose-400">
                  🥋 Get tonight's drill →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-neutral-500 leading-relaxed">Ranked by your lowest win rate first, minimum 2 logged matches per matchup so single-game flukes don't skew the list.</p>
    </div>
  )
}
