'use client'
// PUNISH FINDER — "they did the thing, it's blocked, now what?"
// Curated punishable situations per opponent + tier guidance, with an
// AI Sensei hook for exact punishes with YOUR character.
import { useState } from 'react'
import { PUNISH_DATA, TIER_GUIDE, PUNISH_DISCLAIMER, Punishable } from '../lib/punishData'

const TIER_COLOR: Record<Punishable['tier'], string> = {
  light: 'text-sky-300 border-sky-800',
  medium: 'text-yellow-300 border-yellow-800',
  heavy: 'text-orange-400 border-orange-800',
  launch: 'text-rose-400 border-rose-800',
}
const TIER_LABEL: Record<Punishable['tier'], string> = {
  light: 'LIGHT PUNISH', medium: 'MEDIUM PUNISH', heavy: 'HEAVY PUNISH', launch: 'PUNISH COUNTER',
}

export default function PunishFinder({ onAskSensei }: { onAskSensei?: (prompt: string) => void }) {
  const [vs, setVs] = useState('Ken')
  const data = PUNISH_DATA.find(d => d.character === vs)

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header>
        <h1 className="text-2xl font-black tracking-tight">PUNISH FINDER</h1>
        <p className="text-xs text-neutral-400">They did the thing. It's blocked. Now what?</p>
      </header>

      <select value={vs} onChange={e => setVs(e.target.value)}
        className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm w-full">
        {PUNISH_DATA.map(d => <option key={d.character}>{d.character}</option>)}
      </select>

      {data?.entries.map((e, i) => (
        <div key={i} className={`bg-neutral-900/80 border rounded-2xl p-4 ${TIER_COLOR[e.tier].split(' ')[1]}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-sm">{e.move}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{e.situation}</div>
            </div>
            <span className={`text-[10px] font-black whitespace-nowrap px-2 py-1 rounded-full border ${TIER_COLOR[e.tier]}`}>
              {TIER_LABEL[e.tier]}
            </span>
          </div>
          <div className="text-xs text-neutral-300 mt-2 leading-relaxed">{TIER_GUIDE[e.tier]}</div>
          {onAskSensei && (
            <button
              onClick={() => onAskSensei(
                `With my character, what is the optimal punish when ${vs}'s "${e.move}" is blocked (${TIER_LABEL[e.tier].toLowerCase()} window)? Give me one combo to drill.`)}
              className="mt-2 text-xs font-bold text-rose-400">
              🥋 Ask Sensei: exact punish for my character →
            </button>
          )}
        </div>
      ))}

      <p className="text-[11px] text-neutral-500 leading-relaxed">{PUNISH_DISCLAIMER}</p>
      <p className="text-[11px] text-neutral-600">More characters ship in updates — the roster grows with the meta.</p>
    </div>
  )
}
