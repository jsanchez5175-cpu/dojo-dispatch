'use client'
// THE LEGEND — who, what, where, when, why, and the legends of it. Every app in the fleet carries one;
// this is Dojo Dispatch's. Read aloud by the fleet voice (fleet-voice worker), with the phone's own voice as fallback.
import { useEffect, useRef, useState } from 'react'

const VOICE_WORKER = 'https://fleet-voice.jsanchez5175.workers.dev/'
const APP = 'dojo'

const CH: [string, string][] = [
  ['Who', 'The people who kept showing up. Daigo Umehara, who parried fifteen hits of Chun-Li’s Super at EVO 2004 with one pixel of life and turned a match into a creed. Justin Wong, on the other side of that parry, who went on to win more majors than almost anyone alive. Tokido, the murderface who learned to smile. Punk, MenaRD, Kakeru, EndingWalker — the ones carrying it now. And the arcade kids of 1991 who fed quarters into a cabinet called Street Fighter II until the joysticks wore smooth.'],
  ['What', 'Street Fighter is the game that invented the fighting game: six buttons, special moves pulled from the stick, a health bar and a timer, and the idea that two strangers could settle something in ninety seconds. Street Fighter 6 is the current one — the Drive system, Drive Impact, Drive Rush, Parry, Modern and Classic controls — and the Capcom Pro Tour is the season that hangs on it. This app is a companion for the long climb: the roster, the frames, the punishes, the meta, the people.'],
  ['Where', 'It began in Japanese arcades and American pizza parlours, then Chinatown Fair in New York, Super Arcade in Walnut, California, and the Las Vegas ballrooms where EVO fills an arena every summer. Now it lives online in ranked, in Battle Hub, on Twitch at 2 a.m., and in the one local your city still runs on a Tuesday. The dojo is wherever you train.'],
  ['When', '1987: the first Street Fighter, a cabinet with pressure-sensitive pads nobody could stand. 1991: Street Fighter II, and the world changes. 2002: Evolution becomes EVO. 2004: Moment 37. 2016: Street Fighter V. June 2023: Street Fighter 6, Year 1; the Pro Tour and Street Fighter League run every year since. Capcom Cup crowns a champion each spring. The calendar in this app is the one that matters.'],
  ['Why', 'Because the fighting game community is the last scene that still demands you show up in person and lose to someone’s face. Because a match is honest: there is no team to blame, no random drop, only what you knew and what you did under pressure. Because getting better at this is the most legible self-improvement there is — you can see yesterday’s mistake in today’s replay. The Climb in this app is that, written down.'],
  ['The legends', 'Moment 37 — Daigo’s full parry at EVO 2004, the most-watched thirty seconds in the history of the genre. Justin Wong’s Marvel reign and the twenty-year career beside it. Tokido’s EVO 2017 win, crying on the stage after a lifetime of near-misses. MenaRD, the Dominican who beat the world twice at Capcom Cup. Punk, the American prodigy who was supposed to be unbeatable and learned to lose. And every pot-monster at every local who never won anything and never missed a week. They are the legend too.'],
]

function fnv(t: string) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) } return (h >>> 0).toString(16) }

export default function DojoLegend() {
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState<number | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)
  const okRef = useRef<boolean | null>(null)

  const stop = () => { try { audio.current?.pause() } catch {} audio.current = null; try { window.speechSynthesis?.cancel() } catch {} setCur(null) }

  const say = async (text: string, i: number, then?: () => void) => {
    stop(); setCur(i)
    const done = () => { setCur(c => (c === i ? null : c)); then?.() }
    try {
      if (okRef.current !== false) {
        const key = '/__voice/' + fnv(text)
        const c = await caches.open(APP + '-voice')
        let r = await c.match(key)
        if (!r) {
          const res = await fetch(VOICE_WORKER + 'say', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ app: APP, text }) })
          if (res.ok && /audio/.test(res.headers.get('content-type') || '')) { okRef.current = true; await c.put(key, res.clone()); r = res } else { okRef.current = false }
        }
        if (r) { const b = await r.blob(); const a = new Audio(URL.createObjectURL(b)); audio.current = a; a.onended = done; await a.play(); return }
      }
    } catch { okRef.current = false }
    try {
      const u = new SpeechSynthesisUtterance(text); u.rate = 0.9
      const vs = window.speechSynthesis.getVoices()
      const pk = vs.find(v => /en/i.test(v.lang) && /female|woman|Samantha|Karen|Moira|Tessa|Fiona|Serena/i.test(v.name)) || vs.find(v => /en/i.test(v.lang))
      if (pk) u.voice = pk
      u.onend = done; window.speechSynthesis.speak(u)
    } catch { done() }
  }

  const all = () => { let i = 0; const next = () => { if (i >= CH.length) return; const k = i++; say(CH[k][1], k, next) }; next() }

  useEffect(() => () => stop(), [])

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="The legend of Street Fighter" title="The legend" style={{ position: 'fixed', left: 12, bottom: 74, zIndex: 60, width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--sf-border)', background: 'var(--sf-dark2)', color: 'var(--sf-gold)', fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,.5)' }}>&#9775;</button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(8,8,10,.96)', overflow: 'auto', padding: '22px 16px 40px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ fontFamily: '"Barlow Condensed"', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--sf-muted)', flex: 1 }}>The legend of the dojo</div>
              <button onClick={all} style={{ fontFamily: '"Barlow Condensed"', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', padding: '7px 12px', background: 'var(--sf-red)', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Hear it all</button>
              <button onClick={() => { stop(); setOpen(false) }} style={{ fontFamily: '"Barlow Condensed"', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', padding: '7px 12px', background: 'none', color: 'var(--sf-muted)', border: '1px solid var(--sf-border)', borderRadius: 3, cursor: 'pointer' }}>Close</button>
            </div>
            {CH.map(([t, body], i) => (
              <div key={t} onClick={() => (cur === i ? stop() : say(body, i))} style={{ margin: '0 0 10px', padding: '12px 14px', borderRadius: 4, border: '1px solid ' + (cur === i ? 'var(--sf-gold)' : 'var(--sf-border)'), background: 'var(--sf-dark2)', cursor: 'pointer' }}>
                <div style={{ fontFamily: '"Barlow Condensed"', fontSize: 12, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', color: cur === i ? 'var(--sf-gold)' : '#fff', marginBottom: 6 }}>{cur === i ? '■ ' : '▶ '}{t}</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--sf-muted)' }}>{body}</div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--sf-muted)', opacity: .7, marginTop: 8 }}>Dates and names as recorded by the players and the events themselves. Nothing you hear here leaves this device except the words sent to be spoken.</div>
          </div>
        </div>
      )}
    </>
  )
}
