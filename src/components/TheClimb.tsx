'use client'
// THE CLIMB — personal rank tracker (the op.gg experience, built on the
// player's own data; Capcom exposes no public API, so we never scrape).
import { useMemo, useState } from 'react'
import {
  ROSTER, GameMode, addSession, getSessions, deleteSession,
  getMatchups, bumpMatchup, seriesFor, totals, today,
} from '../lib/dojoStore'

const RANKS: [number, string, string][] = [
  [25000, 'MASTER', '#8be9fd'], [19000, 'DIAMOND', '#7dd3fc'],
  [13000, 'PLATINUM', '#67e8f9'], [9000, 'GOLD', '#facc15'],
  [5000, 'SILVER', '#cbd5e1'], [1000, 'BRONZE', '#d97706'],
  [0, 'ROOKIE', '#a3a3a3'],
]
const rankFor = (lp: number) => RANKS.find(([min]) => lp >= min) ?? RANKS[RANKS.length - 1]

export default function TheClimb() {
  const [char, setChar] = useState('Ryu')
  const [mode, setMode] = useState<GameMode>('ranked')
  const [pts, setPts] = useState(''); const [w, setW] = useState(''); const [l, setL] = useState('')
  const [note, setNote] = useState('')
  const [muVs, setMuVs] = useState('Ken')
  const [, force] = useState(0); const refresh = () => force(x => x + 1)

  const series = useMemo(() => seriesFor(char, mode), [char, mode, ,])
  const sessions = getSessions().filter(s => s.character === char).slice(0, 8)
  const mus = getMatchups(char).sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses))
  const tot = totals(char)
  const latest = series.length ? series[series.length - 1].points : null
  const delta = series.length >= 2 ? series[series.length - 1].points - series[0].points : 0

  const log = () => {
    const p = parseInt(pts); if (isNaN(p)) return
    addSession({ date: today(), character: char, mode, points: p,
      wins: parseInt(w) || 0, losses: parseInt(l) || 0, notes: note.trim() || undefined })
    setPts(''); setW(''); setL(''); setNote(''); refresh()
  }

  // inline SVG chart — no libs
  const chart = () => {
    if (series.length < 2) return <div className="text-xs text-neutral-500 py-8 text-center">Log two sessions to draw your climb.</div>
    const W = 320, H = 120, pad = 8
    const min = Math.min(...series.map(s => s.points)), max = Math.max(...series.map(s => s.points))
    const rng = Math.max(1, max - min)
    const pt = (i: number, v: number) =>
      `${pad + i * (W - pad * 2) / (series.length - 1)},${H - pad - (v - min) / rng * (H - pad * 2)}`
    const path = series.map((s, i) => (i ? 'L' : 'M') + pt(i, s.points)).join(' ')
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <path d={path} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
        {series.map((s, i) => {
          const [x, y] = pt(i, s.points).split(',')
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#0a0a0a" stroke="#f43f5e" strokeWidth="2" />
        })}
      </svg>
    )
  }

  const shareCard = async () => {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1080
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 1080, 1080)
    grad.addColorStop(0, '#18181b'); grad.addColorStop(1, '#3b0a12')
    g.fillStyle = grad; g.fillRect(0, 0, 1080, 1080)
    g.strokeStyle = 'rgba(244,63,94,.5)'; g.lineWidth = 6; g.strokeRect(40, 40, 1000, 1000)
    g.textAlign = 'center'; g.fillStyle = '#f4f4f5'
    g.font = 'bold 46px system-ui'; g.fillText('THE CLIMB', 540, 150)
    g.font = 'bold 92px system-ui'; g.fillText(char.toUpperCase(), 540, 300)
    const [, rname, rcol] = rankFor(latest ?? 0)
    g.fillStyle = rcol; g.font = 'bold 70px system-ui'
    g.fillText(mode === 'master' ? `${latest ?? '—'} MR` : `${rname} · ${latest ?? '—'} LP`, 540, 430)
    g.fillStyle = delta >= 0 ? '#4ade80' : '#f87171'; g.font = 'bold 54px system-ui'
    g.fillText(`${delta >= 0 ? '+' : ''}${delta} this climb`, 540, 520)
    g.fillStyle = '#d4d4d8'; g.font = '44px system-ui'
    g.fillText(`${tot.wins}W — ${tot.losses}L lifetime`, 540, 640)
    g.fillStyle = '#f43f5e'; g.font = 'bold 40px system-ui'
    g.fillText('DOJO DISPATCH · SF6 COACH', 540, 980)
    c.toBlob(async blob => {
      if (!blob) return
      const file = new File([blob], 'the-climb.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'My SF6 climb' }); return } catch {}
      }
      const a = document.createElement('a'); a.download = 'the-climb.png'
      a.href = URL.createObjectURL(blob); a.click()
    })
  }

  const inp = 'bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm w-full'
  const [, rname, rcol] = rankFor(latest ?? 0)

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">THE CLIMB</h1>
          <p className="text-xs text-neutral-400">Your ranked story, one session at a time</p>
        </div>
        <button onClick={shareCard} className="text-xs font-bold bg-rose-600 hover:bg-rose-500 rounded-lg px-3 py-2">SHARE CARD</button>
      </header>

      <div className="flex gap-2">
        <select value={char} onChange={e => setChar(e.target.value)} className={inp}>
          {ROSTER.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={mode} onChange={e => setMode(e.target.value as GameMode)} className={inp + ' max-w-[130px]'}>
          <option value="ranked">Ranked (LP)</option>
          <option value="master">Master (MR)</option>
        </select>
      </div>

      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-neutral-400">CURRENT</span>
          <span className="text-xs font-bold" style={{ color: rcol }}>{mode === 'master' ? 'MASTER RATE' : rname}</span>
        </div>
        <div className="text-4xl font-black" style={{ color: rcol }}>
          {latest ?? '—'}<span className="text-base text-neutral-500 ml-1">{mode === 'master' ? 'MR' : 'LP'}</span>
          {series.length >= 2 && <span className={`text-base ml-3 ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}</span>}
        </div>
        {chart()}
      </div>

      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-2">
        <div className="text-sm font-bold">📈 Log tonight's session</div>
        <div className="flex gap-2">
          <input className={inp} inputMode="numeric" placeholder={mode === 'master' ? 'MR now' : 'LP now'} value={pts} onChange={e => setPts(e.target.value)} />
          <input className={inp + ' max-w-[70px]'} inputMode="numeric" placeholder="W" value={w} onChange={e => setW(e.target.value)} />
          <input className={inp + ' max-w-[70px]'} inputMode="numeric" placeholder="L" value={l} onChange={e => setL(e.target.value)} />
        </div>
        <input className={inp} placeholder="Session note — what to lab next…" value={note} onChange={e => setNote(e.target.value)} />
        <button onClick={log} className="w-full bg-rose-600 hover:bg-rose-500 rounded-lg py-2.5 text-sm font-bold">LOG SESSION</button>
      </div>

      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-bold">⚔️ Matchup grid</div>
          <div className="text-[11px] text-neutral-400">{tot.wins}W · {tot.losses}L lifetime</div>
        </div>
        <div className="flex gap-2 mb-3">
          <select value={muVs} onChange={e => setMuVs(e.target.value)} className={inp}>
            {ROSTER.filter(r => r !== char).map(r => <option key={r}>{r}</option>)}
          </select>
          <button onClick={() => { bumpMatchup(char, muVs, true); refresh() }} className="bg-green-700 hover:bg-green-600 rounded-lg px-3 text-sm font-bold">+W</button>
          <button onClick={() => { bumpMatchup(char, muVs, false); refresh() }} className="bg-red-800 hover:bg-red-700 rounded-lg px-3 text-sm font-bold">+L</button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {mus.length === 0 && <div className="text-xs text-neutral-500 col-span-2">Log matchup results as you play — the grid shows who's beating you.</div>}
          {mus.map(m => {
            const rate = Math.round(m.wins / Math.max(1, m.wins + m.losses) * 100)
            return (
              <div key={m.vs} className="flex items-center justify-between bg-neutral-800/70 rounded-lg px-2.5 py-1.5 text-xs">
                <span>{m.vs}</span>
                <span className={rate >= 50 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {m.wins}-{m.losses} · {rate}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
        <div className="text-sm font-bold mb-2">🗒️ Recent sessions</div>
        {sessions.length === 0 && <div className="text-xs text-neutral-500">No sessions yet — log the first one above.</div>}
        {sessions.map(s => (
          <div key={s.id} className="flex items-center gap-2 border-b border-dashed border-neutral-800 py-2 text-xs">
            <span className="text-neutral-500">{s.date.slice(5)}</span>
            <span className="font-bold">{s.points} {s.mode === 'master' ? 'MR' : 'LP'}</span>
            <span className="text-neutral-400">{s.wins}W-{s.losses}L</span>
            <span className="flex-1 truncate text-neutral-400 italic">{s.notes}</span>
            <button onClick={() => { deleteSession(s.id); refresh() }} className="text-neutral-600">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
