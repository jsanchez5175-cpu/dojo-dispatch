'use client'
// FRAME DATA FLASHCARDS — spaced-repetition drilling over Punish Finder's
// data, so punish windows move from "looked up mid-match" to "known cold".
// Simple Leitner system: 6 boxes, box index -> days until next review.
import { useState, useEffect } from 'react'
import { PUNISH_DATA, TIER_GUIDE, Punishable } from '../lib/punishData'

const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30]
const STORE_KEY = 'dojo_flashcards'

interface Card { id: string; character: string; move: string; situation: string; tier: Punishable['tier'] }
interface ReviewState { box: number; due: string }

function today() { return new Date().toISOString().slice(0, 10) }
function addDays(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10) }

function loadState(): Record<string, ReviewState> {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') } catch { return {} }
}
function saveState(s: Record<string, ReviewState>) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)) } catch {}
}

const ALL_CARDS: Card[] = PUNISH_DATA.flatMap(d =>
  d.entries.map(e => ({ id: `${d.character}::${e.move}`, character: d.character, move: e.move, situation: e.situation, tier: e.tier }))
)

export default function FrameFlashcards() {
  const [state, setState] = useState<Record<string, ReviewState>>({})
  const [queue, setQueue] = useState<Card[]>([])
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)

  useEffect(() => {
    const s = loadState()
    setState(s)
    const t = today()
    const due = ALL_CARDS.filter(c => !s[c.id] || s[c.id].due <= t)
    setQueue(shuffle(due))
  }, [])

  const shuffle = (arr: Card[]) => [...arr].sort(() => Math.random() - 0.5)
  const current = queue[0]

  const rate = (gotIt: boolean) => {
    if (!current) return
    const prev = state[current.id]?.box ?? -1
    const box = gotIt ? Math.min(prev + 1, INTERVAL_DAYS.length - 1) : 0
    const next = { ...state, [current.id]: { box, due: addDays(INTERVAL_DAYS[box]) } }
    setState(next); saveState(next)
    setQueue(q => q.slice(1))
    setRevealed(false)
    setDone(d => d + 1)
  }

  const totalDueToday = queue.length + done

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header>
        <h1 className="text-2xl font-black tracking-tight">FRAME FLASHCARDS</h1>
        <p className="text-xs text-neutral-400">Drill your punish windows until they're automatic</p>
      </header>

      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>{done} reviewed</span>
        <span>{queue.length} left today</span>
      </div>

      {!current ? (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm font-bold">{totalDueToday === 0 ? "No cards due today" : "All caught up"}</div>
          <div className="text-xs text-neutral-500 mt-1">Come back tomorrow, or new cards ship as the roster grows.</div>
        </div>
      ) : (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 min-h-[220px] flex flex-col">
          <div className="text-xs text-rose-400 font-bold uppercase tracking-wide mb-2">vs {current.character}</div>
          <div className="text-base font-semibold flex-1">{current.situation}</div>
          {!revealed ? (
            <button onClick={() => setRevealed(true)} className="mt-4 w-full bg-neutral-800 hover:bg-neutral-700 rounded-lg py-2.5 text-sm font-bold">
              Reveal punish
            </button>
          ) : (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-bold text-rose-400">{current.move}</div>
              <div className="text-xs text-neutral-300 leading-relaxed">{TIER_GUIDE[current.tier]}</div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => rate(false)} className="flex-1 bg-red-900/40 border border-red-800 hover:bg-red-900/60 rounded-lg py-2 text-xs font-bold">Again</button>
                <button onClick={() => rate(true)} className="flex-1 bg-green-900/40 border border-green-800 hover:bg-green-900/60 rounded-lg py-2 text-xs font-bold">Got it</button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-neutral-500 leading-relaxed">Leitner-style spacing: cards you know push out to longer intervals, cards you miss come right back tomorrow.</p>
    </div>
  )
}
