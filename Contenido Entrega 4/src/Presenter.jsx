import { useCallback, useEffect, useRef, useState } from 'react'
import { SLIDES, ENTREGAS } from './slides.jsx'
import { useSync, useTheme } from './App.jsx'

const readHash = () => Math.min(SLIDES.length - 1, Math.max(0, parseInt((location.hash.match(/\d+/) || ['1'])[0], 10) - 1))
const toSec = (s) => { if (!s || s === '—') return null; const [m, ss] = s.split(':').map(Number); return m * 60 + ss }
const mmss = (s) => `${s < 0 ? '−' : ''}${Math.floor(Math.abs(s) / 60)}:${String(Math.floor(Math.abs(s) % 60)).padStart(2, '0')}`

const DURACION = Math.max(...SLIDES.map((s) => toSec(s.fin) ?? 0))

// Convierte **negrita** del guion en <strong>
const rich = (t) => t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p))

export default function Presenter() {
  const [idx, setIdxRaw] = useState(readHash)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const t0 = useRef(null)
  const [, toggleTheme] = useTheme()
  const post = useRef(() => {})

  const setIdx = useCallback((i, fromRemote = false) => {
    const n = Math.min(SLIDES.length - 1, Math.max(0, i))
    setIdxRaw(n)
    history.replaceState(null, '', `?presentador#/${n + 1}`)
    if (!fromRemote) post.current(n)
  }, [])
  const acked = useRef(false)
  post.current = useSync(setIdx, (m) => { if (m?.type === 'ack') acked.current = true })
  const step = useCallback((dir) => {
    acked.current = false
    post.current({ type: 'step', dir })
    setTimeout(() => { if (!acked.current) setIdx(readHash() + dir) }, 250)
  }, [setIdx])

  useEffect(() => {
    if (!running) return
    t0.current = performance.now() - elapsed * 1000
    const id = setInterval(() => setElapsed((performance.now() - t0.current) / 1000), 250)
    return () => clearInterval(id)
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (['arrowright', 'pagedown', ' '].includes(k)) { e.preventDefault(); if (!running && idx === 0) setRunning(true); step(1) }
      else if (['arrowleft', 'pageup'].includes(k)) { e.preventDefault(); step(-1) }
      else if (k === 's') setRunning((r) => !r)
      else if (k === 'r') { setRunning(false); setElapsed(0) }
      else if (k === 't') toggleTheme()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, running, setIdx, toggleTheme, step])

  const S = SLIDES[idx], N = SLIDES[idx + 1]
  const ini = toSec(S.inicio), fin = toSec(S.fin)
  const delta = fin != null ? fin - elapsed : null
  const status = delta == null ? 'var(--muted)' : elapsed < ini - 10 ? 'var(--good)' : delta < 0 ? 'var(--bad)' : 'var(--accent)'
  document.title = `Presentador · ${idx + 1}/${SLIDES.length}`

  return (
    <div className="presenter">
      <main>
        <div className="kicker">{String(idx + 1).padStart(2, '0')} / {SLIDES.length} · {ENTREGAS[S.ent]} · {S.eje} {ini != null && <span className="time">· {S.inicio} – {S.fin}</span>}</div>
        <h1>{S.titulo}</h1>
        <div className="notes">{S.notas.map((n, i) => <p key={i}>{rich(n)}</p>)}</div>
      </main>
      <aside className="side">
        <div className="card">
          <div className="label">Cronómetro · objetivo {mmss(DURACION)}</div>
          <div className="clock" style={{ color: elapsed > DURACION ? 'var(--bad)' : 'var(--text)' }}>{mmss(elapsed)}</div>
          <div className="small" style={{ color: status, marginTop: 4 }}>
            {delta == null ? 'Slide de respaldo' : !running && elapsed === 0 ? 'Iniciá con S o con la primera flecha' : elapsed < ini - 10 ? `Vas adelantado ${mmss(ini - elapsed)}` : delta < 0 ? `Pasado ${mmss(-delta)} de esta slide` : `Quedan ${mmss(delta)} para esta slide`}
          </div>
          <div className="btns" style={{ marginTop: 14 }}>
            <button onClick={() => setRunning((r) => !r)}>{running ? 'Pausar (S)' : 'Iniciar (S)'}</button>
            <button onClick={() => { setRunning(false); setElapsed(0) }}>Reiniciar (R)</button>
          </div>
        </div>
        <div className="btns">
          <button onClick={() => step(-1)} style={{ flex: 1 }}>← Anterior</button>
          <button onClick={() => step(1)} style={{ flex: 1 }}>Siguiente →</button>
        </div>
        {N && (
          <div className="card">
            <div className="label">Sigue</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, marginTop: 6, lineHeight: 1.15 }}>{N.titulo}</div>
            <div className="small muted" style={{ marginTop: 4 }}>{ENTREGAS[N.ent]} · {N.eje}</div>
          </div>
        )}
        <div className="card" style={{ maxHeight: 300, overflow: 'auto' }}>
          <div className="label" style={{ marginBottom: 8 }}>Todas</div>
          {SLIDES.map((s, i) => (
            <div key={s.id} onClick={() => setIdx(i)} style={{ cursor: 'pointer', padding: '4px 0', fontSize: 14, color: i === idx ? 'var(--accent)' : 'var(--text-2)', display: 'flex', gap: 8 }}>
              <span className="num muted" style={{ width: 44 }}>{s.inicio}</span>{s.titulo}
            </div>
          ))}
        </div>
        <p className="small muted">Esta ventana controla la presentación. Las flechas avanzan; S inicia o pausa el cronómetro. La primera flecha desde la portada lo inicia sola.</p>
      </aside>
    </div>
  )
}
