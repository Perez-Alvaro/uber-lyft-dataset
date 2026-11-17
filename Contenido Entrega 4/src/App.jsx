import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SLIDES, ENTREGAS } from './slides.jsx'
import { GALERIA } from './data/gallery.js'
import { DeckCtx } from './lib/ui.jsx'

const CHANNEL = 'g11-presentacion'
const readHash = () => {
  const n = parseInt((location.hash.match(/\d+/) || ['1'])[0], 10)
  return Math.min(SLIDES.length - 1, Math.max(0, n - 1))
}

// Sincroniza la ventana principal con la del presentador.
// 'go' = cambiar de slide · 'step' = el presentador pide avanzar/retroceder · 'ack' = la principal lo procesó
export function useSync(setIdx, onMsg) {
  const ch = useRef(null)
  const handler = useRef(onMsg)
  handler.current = onMsg
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return
    ch.current = new BroadcastChannel(CHANNEL)
    ch.current.onmessage = (e) => {
      if (e.data?.type === 'go') setIdx(e.data.idx, true)
      else handler.current?.(e.data)
    }
    return () => ch.current?.close()
  }, [setIdx])
  return useCallback((msg) => ch.current?.postMessage(typeof msg === 'number' ? { type: 'go', idx: msg } : msg), [])
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const q = new URLSearchParams(location.search)
    if (q.has('oscuro')) return 'dark'
    if (q.has('claro')) return 'light'
    try { return localStorage.getItem('g11-tema-v2') || 'light' } catch { return 'light' }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('g11-tema-v2', theme) } catch { /* sin almacenamiento */ }
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

function useScale() {
  const [s, setS] = useState(1)
  useLayoutEffect(() => {
    const fit = () => setS(Math.min(window.innerWidth / 1600, (window.innerHeight - 46) / 900))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return s
}

export default function App() {
  const [idx, setIdxRaw] = useState(readHash)
  const [panel, setPanel] = useState(null) // 'overview' | 'gallery' | 'help'
  const [img, setImg] = useState(null)
  const [, toggleTheme] = useTheme()
  const [chromeOn, setChromeOn] = useState(true)
  const scale = useScale()
  const post = useRef(() => {})

  const setIdx = useCallback((i, fromRemote = false) => {
    const n = Math.min(SLIDES.length - 1, Math.max(0, i))
    setIdxRaw(n)
    history.replaceState(null, '', `#/${n + 1}`)
    if (!fromRemote) post.current(n)
  }, [])
  // Pasos dentro de una slide: si la slide los consume, la flecha no cambia de slide
  const stepRef = useRef(null)
  const idxRef = useRef(idx)
  idxRef.current = idx
  const advance = useCallback((dir) => {
    if (stepRef.current?.(dir)) return
    setIdx(idxRef.current + dir)
  }, [setIdx])
  post.current = useSync(setIdx, (m) => {
    if (m?.type === 'step') { advance(m.dir); post.current({ type: 'ack' }) }
  })

  useEffect(() => {
    const onHash = () => setIdxRaw(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openImage = useCallback((i) => setImg(i), [])
  const ctx = useMemo(() => ({ openImage, go: setIdx, stepRef }), [openImage, setIdx])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && e.target.closest?.('button')) return
      if (e.target.closest?.('input, textarea')) {
        if (!['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp'].includes(e.key) || e.target.type === 'range') return
      }
      if (img != null) {
        if (e.key === 'Escape') setImg(null)
        else if (e.key === 'ArrowRight') setImg((i) => (i + 1) % GALERIA.length)
        else if (e.key === 'ArrowLeft') setImg((i) => (i - 1 + GALERIA.length) % GALERIA.length)
        return
      }
      if (e.key === 'Escape') { setPanel(null); return }
      const k = e.key.toLowerCase()
      if (['arrowright', 'pagedown', ' ', 'enter'].includes(k) && !panel) { e.preventDefault(); advance(1) }
      else if (['arrowleft', 'pageup', 'backspace'].includes(k) && !panel) { e.preventDefault(); advance(-1) }
      else if (k === 'home') setIdx(0)
      else if (k === 'end') setIdx(SLIDES.length - 1)
      else if (k === 'o') setPanel((p) => (p === 'overview' ? null : 'overview'))
      else if (k === 'h' || k === '?') setPanel((p) => (p === 'help' ? null : 'help'))
      else if (k === 't') toggleTheme()
      else if (k === 'b') setChromeOn((c) => !c)
      else if (k === 'f') {
        if (document.fullscreenElement) document.exitFullscreen?.()
        else document.documentElement.requestFullscreen?.().catch(() => {})
      } else if (k === 'p') {
        window.open(`${location.pathname}?presentador#/${idx + 1}`, 'g11-presentador', 'width=1100,height=760')
      } else if (/^[1-9]$/.test(k) && e.altKey) setIdx(+k - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, panel, img, setIdx, toggleTheme, advance])

  const S = SLIDES[idx]
  const Comp = S.C
  const ejesUsados = Object.entries(ENTREGAS).map(([e, name]) => ({ name, e: +e, slides: SLIDES.map((s, i) => [s, i]).filter(([s]) => s.ent === +e) }))
    .filter((x) => x.slides.length && x.e !== 0)

  return (
    <DeckCtx.Provider value={ctx}>
      <div className="viewport" style={{ paddingBottom: 46 }}>
        <div style={{ width: 1600 * scale, height: 900 * scale, position: 'relative' }}>
          <div className="stage" style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0 }}>
            <Comp key={S.id} />
          </div>
        </div>
      </div>
      <div className="nav-zone l" onClick={() => advance(-1)} aria-hidden />
      <div className="nav-zone r" onClick={() => advance(1)} aria-hidden />

      <footer className={'chrome' + (chromeOn ? '' : ' hidden')}>
        <span className="brand">G11 · UTN FRC</span>
        <div className="progress">
          {ejesUsados.map(({ name, slides }) => {
            const first = slides[0][1], last = slides[slides.length - 1][1]
            const on = idx >= first && idx <= last
            const fill = idx > last ? 100 : idx < first ? 0 : ((idx - first + 1) / slides.length) * 100
            return (
              <div key={name} className={'seg' + (on ? ' on' : '')} style={{ flex: slides.length }} onClick={() => setIdx(first)} title={name}>
                <span className="name">{name}</span>
                <span className="bar"><i style={{ width: fill + '%' }} /></span>
              </div>
            )
          })}
        </div>
        <span className="counter">{String(idx + 1).padStart(2, '0')} / {SLIDES.length}</span>
        <button className="icon-btn" onClick={() => setPanel('help')} title="Atajos (H)">?</button>
      </footer>

      {panel === 'overview' && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setPanel(null)}>
          <div className="overlay-head"><h2>Recorrido</h2><span className="label">O o Esc para cerrar</span></div>
          <div className="overview">
            {SLIDES.map((s, i) => (
              <button key={s.id} className={'ov-card' + (i === idx ? ' on' : '')} onClick={() => { setIdx(i); setPanel(null) }}>
                <span className="label">{String(i + 1).padStart(2, '0')} · {s.ent >= 1 && s.ent <= 4 ? `E${s.ent} · ` : ''}{s.eje}</span>
                <span className="t">{s.titulo}</span>
                <span className="label" style={{ marginTop: 'auto' }}>{s.inicio !== '—' ? `${s.inicio} – ${s.fin}` : 'Respaldo'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {panel === 'gallery' && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setPanel(null)}>
          <div className="overlay-head"><h2>Gráficos de las entregas 1 a 3</h2><span className="label">G o Esc para cerrar</span></div>
          <div className="gal-grid">
            {GALERIA.map((g, i) => (
              <button key={g.id} className="gal-item" onClick={() => setImg(i)}>
                <div className="ph"><img src={g.src} alt={g.titulo} loading="lazy" /></div>
                <div className="cap"><b>ENTREGA {g.entrega}</b>{g.titulo}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {panel === 'help' && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setPanel(null)}>
          <div className="overlay-head"><h2>Atajos de teclado</h2><span className="label">Esc para cerrar</span></div>
          <div className="help">
            <kbd>→ · Espacio · PgDn</kbd><span>Siguiente (también funciona con un presentador inalámbrico)</span>
            <kbd>← · PgUp</kbd><span>Anterior</span>
            <kbd>P</kbd><span>Abrir el modo presentador en otra ventana: guion, cronómetro y próxima slide, sincronizado</span>
            <kbd>F</kbd><span>Pantalla completa</span>
            <kbd>O</kbd><span>Vista general de todas las slides</span>
            <kbd>T</kbd><span>Cambiar entre tema claro y oscuro</span>
            <kbd>B</kbd><span>Ocultar / mostrar la barra inferior</span>
            <kbd>Inicio · Fin</kbd><span>Primera / última slide</span>
          </div>
        </div>
      )}

      {img != null && (
        <div className="lightbox" onClick={(e) => e.target === e.currentTarget && setImg(null)}>
          <button className="icon-btn lb-close" style={{ color: '#fff' }} onClick={() => setImg(null)}>Esc ✕</button>
          <button className="lb-arrow l" onClick={() => setImg((img - 1 + GALERIA.length) % GALERIA.length)} aria-label="Anterior">←</button>
          <img src={GALERIA[img].src} alt={GALERIA[img].titulo} />
          <div className="cap"><b>ENTREGA {GALERIA[img].entrega}</b>{GALERIA[img].titulo}<span style={{ opacity: 0.5 }}>{img + 1} / {GALERIA.length}</span></div>
          <button className="lb-arrow r" onClick={() => setImg((img + 1) % GALERIA.length)} aria-label="Siguiente">→</button>
        </div>
      )}
    </DeckCtx.Provider>
  )
}
