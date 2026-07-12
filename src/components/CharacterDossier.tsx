'use client'
// NEW CHARACTER DOSSIER — the "how to play / how to beat" hub for DLC drops.
import { useState } from 'react'
import { DOSSIERS } from '../lib/dossierData'

export default function CharacterDossier({ onAskSensei }: { onAskSensei?: (prompt: string) => void }) {
  const [id, setId] = useState(DOSSIERS[0].id)
  const [side, setSide] = useState<'play' | 'beat'>('play')
  const d = DOSSIERS.find(x => x.id === id)!

  const Section = ({ title, items }: { title: string; items: string[] }) => (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
      <div className="text-sm font-bold mb-2">{title}</div>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li key={i} className="text-xs text-neutral-300 leading-relaxed flex gap-2">
            <span className="text-rose-500 font-black">›</span>{t}
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header>
        <h1 className="text-2xl font-black tracking-tight">NEW CHALLENGER</h1>
        <p className="text-xs text-neutral-400">Day-one dossiers for the latest drops</p>
      </header>

      <div className="flex gap-2">
        {DOSSIERS.map(x => (
          <button key={x.id} onClick={() => setId(x.id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold border ${id === x.id ? 'bg-rose-600 border-rose-500' : 'bg-neutral-900 border-neutral-700 text-neutral-400'}`}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-rose-950/60 to-neutral-900 border border-rose-900/50 rounded-2xl p-4">
        <div className="text-xl font-black">{d.name}</div>
        <div className="text-xs text-rose-300">{d.tagline}</div>
        <div className="text-[11px] text-neutral-400 mt-2">{d.archetype}</div>
        {!d.verified && (
          <div className="text-[10px] text-yellow-500/90 mt-2">
            ⚠ Early dossier — details pending in-game verification. Trust your training mode.
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSide('play')}
          className={`flex-1 rounded-xl py-2 text-xs font-bold border ${side === 'play' ? 'bg-neutral-100 text-neutral-900 border-neutral-100' : 'bg-neutral-900 border-neutral-700 text-neutral-400'}`}>
          PLAY AS {d.name.toUpperCase()}
        </button>
        <button onClick={() => setSide('beat')}
          className={`flex-1 rounded-xl py-2 text-xs font-bold border ${side === 'beat' ? 'bg-neutral-100 text-neutral-900 border-neutral-100' : 'bg-neutral-900 border-neutral-700 text-neutral-400'}`}>
          BEAT {d.name.toUpperCase()}
        </button>
      </div>

      {side === 'play' ? (
        <>
          <Section title="🎯 Gameplan" items={d.gameplan} />
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
            <div className="text-sm font-bold mb-2">🔑 Key tools</div>
            {d.keyTools.map((k, i) => (
              <div key={i} className="border-b border-dashed border-neutral-800 py-2">
                <div className="text-xs font-bold">{k.name}</div>
                <div className="text-[11px] text-neutral-400">{k.why}</div>
              </div>
            ))}
          </div>
          <Section title="📅 First hour" items={d.dayOne} />
        </>
      ) : (
        <Section title="🛡️ Counterplay" items={d.counterplay} />
      )}

      {onAskSensei && (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
          <div className="text-sm font-bold mb-2">🥋 Take it to Sensei</div>
          {d.senseiPrompts.map((p, i) => (
            <button key={i} onClick={() => onAskSensei(p)}
              className="block w-full text-left text-xs text-rose-400 font-semibold py-1.5 border-b border-dashed border-neutral-800">
              {p} →
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
