'use client'
// GHOST RIVAL — pick a pro whose habits you want to train against, Sensei
// writes up a practice gameplan styled after them so training mode has a
// specific playstyle to prep for instead of generic drilling.
import { useState } from 'react'
import { ROSTER } from '../lib/dojoStore'
import { PRO_PLAYERS } from '../lib/proPlayers'

export default function GhostRival({ onAskSensei }: { onAskSensei?: (prompt: string) => void }) {
  const [proKey, setProKey] = useState(PRO_PLAYERS[0].key)
  const [mine, setMine] = useState('Ryu')
  const pro = PRO_PLAYERS.find(p => p.key === proKey)!

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header>
        <h1 className="text-2xl font-black tracking-tight">GHOST RIVAL</h1>
        <p className="text-xs text-neutral-400">Train against a pro's habits, not thin air</p>
      </header>

      <div className="flex gap-2">
        <select value={proKey} onChange={e => setProKey(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm w-full">
          {PRO_PLAYERS.map(p => <option key={p.key} value={p.key}>{p.flag} {p.name} · {p.main}</option>)}
        </select>
      </div>
      <select value={mine} onChange={e => setMine(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm w-full">
        {ROSTER.map(r => <option key={r}>{r}</option>)}
      </select>

      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{pro.flag}</span>
          <div>
            <div className="text-sm font-bold">{pro.name}</div>
            <div className="text-xs text-neutral-400">{pro.main} specialist</div>
          </div>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">{pro.style}</p>
      </div>

      {onAskSensei && (
        <button
          onClick={() => onAskSensei(
            `I want to train against ${pro.name}'s style (${pro.main} — ${pro.style}) using my ${mine}. Write me a training-mode routine that recreates their habits and pressure so I can drill the specific reads and punishes I'd need against a player like them.`)}
          className="w-full bg-rose-600 hover:bg-rose-500 rounded-lg py-2.5 text-sm font-bold">
          🥋 Ask Sensei: build the ghost session →
        </button>
      )}

      <p className="text-[11px] text-neutral-500 leading-relaxed">Playstyle summaries are drawn from public match footage and results — not affiliated with or endorsed by the players themselves.</p>
    </div>
  )
}
