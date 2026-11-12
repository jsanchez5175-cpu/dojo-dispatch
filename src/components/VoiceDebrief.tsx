'use client'
// POST-MATCH VOICE DEBRIEF — talk for 10 seconds right after a set, get it
// transcribed, attach it to a recent session note. Zero typing after a loss.
// Uses the browser's Web Speech API where available; falls back to a plain
// textarea on browsers/webviews without SpeechRecognition support.
import { useState, useEffect, useRef } from 'react'
import { getSessions, appendSessionNote, SessionLog } from '../lib/dojoStore'

export default function VoiceDebrief() {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [sessions, setSessions] = useState<SessionLog[]>([])
  const [targetId, setTargetId] = useState('')
  const [saved, setSaved] = useState(false)
  const recRef = useRef<any>(null)

  useEffect(() => {
    const list = getSessions().slice(0, 5)
    setSessions(list)
    if (list[0]) setTargetId(list[0].id)
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      setSupported(true)
      const rec = new SR()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'
      rec.onresult = (e: any) => {
        let text = ''
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript
        setTranscript(text)
      }
      rec.onend = () => setListening(false)
      recRef.current = rec
    }
  }, [])

  const toggleListening = () => {
    if (!recRef.current) return
    if (listening) { recRef.current.stop(); setListening(false) }
    else { setTranscript(''); recRef.current.start(); setListening(true) }
  }

  const save = () => {
    if (!targetId || !transcript.trim()) return
    appendSessionNote(targetId, transcript.trim())
    setSaved(true)
    setTranscript('')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-4 p-4 pb-24 max-w-md mx-auto text-neutral-100">
      <header>
        <h1 className="text-2xl font-black tracking-tight">VOICE DEBRIEF</h1>
        <p className="text-xs text-neutral-400">Talk it out right after the set — no typing required</p>
      </header>

      {sessions.length === 0 ? (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 text-sm text-neutral-500">
          Log a session in The Climb first — debriefs attach to a recent session's notes.
        </div>
      ) : (
        <>
          <select value={targetId} onChange={e => setTargetId(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm w-full">
            {sessions.map(s => <option key={s.id} value={s.id}>{s.date.slice(5)} · {s.character} · {s.points} {s.mode === 'master' ? 'MR' : 'LP'}</option>)}
          </select>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
            {supported && (
              <button
                onClick={toggleListening}
                className={`w-full rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-2 ${listening ? 'bg-rose-600 animate-pulse' : 'bg-neutral-800 hover:bg-neutral-700'}`}>
                {listening ? '⏺ Listening — tap to stop' : '🎙 Tap to talk'}
              </button>
            )}
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder={supported ? 'Transcript appears here — edit freely before saving.' : 'Speech recognition isn\'t available on this browser — type your debrief instead.'}
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm w-full min-h-[100px]"
            />
            <button onClick={save} disabled={!transcript.trim()} className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 rounded-lg py-2.5 text-sm font-bold">
              {saved ? 'Saved ✓' : 'Save to session note'}
            </button>
          </div>
        </>
      )}

      <p className="text-[11px] text-neutral-500 leading-relaxed">Runs entirely on-device — nothing is uploaded or sent anywhere until you save it into your own local session log.</p>
    </div>
  )
}
