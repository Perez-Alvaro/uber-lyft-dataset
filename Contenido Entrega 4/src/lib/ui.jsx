import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { GALERIA, findImg } from '../data/gallery.js'

// ── Formato es-AR ──
export const fInt = (n) => Math.round(n).toLocaleString('es-AR')
export const fDec = (n, d = 2) => n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d })
export const fPct = (x, d = 1) => fDec(x * 100, d) + '%'
export const fUsd = (n, d = 2) => 'USD ' + fDec(n, d)

// ── Contexto del deck (abrir galería / lightbox desde cualquier slide) ──
export const DeckCtx = createContext({ openImage: () => {}, go: () => {}, stepRef: { current: null } })
export const useDeck = () => useContext(DeckCtx)

// ── Pasos dentro de una slide: las flechas recorren 0..n-1 antes de cambiar de slide ──
export function useSteps(n) {
  const { stepRef } = useDeck()
  const [s, setS] = useState(0)
  const cur = useRef(0)
  cur.current = s
  useEffect(() => {
    stepRef.current = (dir) => {
      const nx = cur.current + dir
      if (nx < 0 || nx >= n) return false
      cur.current = nx
      setS(nx)
      return true
    }
    return () => { stepRef.current = null }
  }, [n, stepRef])
  return [s, setS]
}

// ── Número que cuenta hacia arriba al montar ──
export function Num({ value, format = fInt, duration = 1300, delay = 250, className = '' }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, t0
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('estatico')
    if (reduce) { setV(value); return }
    const start = performance.now() + delay
    const tick = (now) => {
      if (now < start) { raf = requestAnimationFrame(tick); return }
      t0 ??= now
      const p = Math.min(1, (now - t0) / duration)
      const e = 1 - Math.pow(1 - p, 4)
      setV(value * e)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    // respaldo: si el navegador frena requestAnimationFrame (pestaña en segundo plano), igual termina en el valor final
    const done = setTimeout(() => setV(value), delay + duration + 120)
    return () => { cancelAnimationFrame(raf); clearTimeout(done) }
  }, [value, duration, delay])
  return <span className={'num ' + className}>{format(v)}</span>
}

// ── Chips que abren el gráfico original de una entrega anterior ──
export function Origen({ ids, style }) {
  const { openImage } = useDeck()
  return (
    <div className="sources" style={style}>
      <span className="label">Gráficos originales</span>
      {ids.map((id) => {
        const i = findImg(id)
        if (i < 0) return null
        const it = GALERIA[i]
        const code = id.startsWith('fig') ? id.slice(0, 5).replace('fig', 'Fig ') : id.startsWith('surge') ? 'Insights' : 'Fig ' + id.slice(0, 2)
        return (
          <button key={id} className="chip btn" onClick={() => openImage(i)} title={it.titulo}>
            <span className="acc num" style={{ fontSize: 12 }}>E{it.entrega}</span> {code}
          </button>
        )
      })}
    </div>
  )
}

// ── Gráfico original de una entrega anterior, embebido en la slide ──
export function Figura({ id, h = 520, d = 3, style, caption }) {
  const { openImage } = useDeck()
  const i = findImg(id)
  if (i < 0) return null
  const g = GALERIA[i]
  return (
    <figure className="fig rv" style={{ '--d': d, ...style }} onClick={() => openImage(i)} title="Clic para ampliar">
      <img src={g.src} alt={g.titulo} style={{ maxHeight: h }} />
      <figcaption><span className="fig-tag">Entrega {g.entrega}</span>{caption ?? g.titulo}</figcaption>
    </figure>
  )
}

// ── Nombre de la app con su color de marca (texto, no el logo oficial) ──
// d = retraso de la animación de entrada (opcional)
export function Brand({ name, size = 22, d, style }) {
  return (
    <span className={'brand brand-' + name.toLowerCase() + (d != null ? ' pop-in' : '')} style={{ fontSize: size, '--d': d, ...style }}>{name}</span>
  )
}

// ── Tooltip posicionado en coordenadas del gráfico ──
export function Tip({ x, y, children, show = true }) {
  if (!show) return null
  return <div className="tip" style={{ left: x, top: y }}>{children}</div>
}

// ── Distintivo de variable (precio / recargo / ambas) ──
const TRACK = { precio: 'Variable · Precio', recargo: 'Variable · Recargo', ambas: 'Precio y recargo' }
export function Track({ v }) {
  if (!v) return null
  return <span className={'track ' + v}><i />{TRACK[v]}</span>
}

// ── Encabezado: entrega de origen + eje de la cátedra + variable + título ──
export function Head({ ent, eje, track, title, lede }) {
  return (
    <header className="slide-head">
      <div className="head-row rv" style={{ '--d': 0 }}>
        <div className={'kicker' + (track ? ' k-' + track : '')}>
          {ent && <span className="ent-tag">{ent}</span>}
          {ent && eje && <span className="time">·</span>}
          {eje && <span>{eje}</span>}
        </div>
        <Track v={track} />
      </div>
      <h1 className={'title rv' + (track ? ' t-' + track : '')} style={{ '--d': 1 }}>{title}</h1>
      {lede && <p className="lede rv" style={{ '--d': 2 }}>{lede}</p>}
    </header>
  )
}
