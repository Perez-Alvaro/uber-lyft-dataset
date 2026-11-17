import { useMemo, useState } from 'react'
import { fInt, fDec, fPct, fUsd, Tip } from '../lib/ui.jsx'
import {
  PRECIO_RECARGO, ETL_PASOS, CALENDARIO, PARTICION, ZONAS, KMEANS, DECILES, RECARGO, BALANCEO,
} from '../data/metrics.js'
import CURVAS from '../data/curvas.json'
import TARIFAS from '../data/tarifas.json'

/* ───────────────── Barras horizontales genéricas ───────────────── */
export function HBar({ rows, width = 640, rowH = 36, labelW = 230, valueW = 90, barH = 16, max, fmt = (v) => v, d = 0, tip, refs = [] }) {
  const [h, setH] = useState(null)
  const m = max ?? Math.max(...rows.map((r) => r.value))
  const plotW = width - labelW - valueW
  const H = rows.length * rowH
  const bw = (v) => (v <= 0 ? 0 : Math.max(3, (v / m) * plotW))
  return (
    <div style={{ position: 'relative', width }}>
      <svg width={width} height={H + (refs.length ? 22 : 0)} className="dim-others">
        {refs.map((r) => (
          <g key={r.label} className="fade" style={{ '--d': 6 }}>
            <line x1={labelW + bw(r.value)} x2={labelW + bw(r.value)} y1={-4} y2={H + 4} stroke="var(--text-2)" strokeDasharray="3 4" />
            <text x={labelW + bw(r.value)} y={H + 18} textAnchor="middle" className="val-muted">{r.label}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = i * rowH
          const w = bw(r.value)
          return (
            <g key={r.label} className="row hov" onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}>
              <rect className="hit" x={0} y={y + 2} width={width} height={rowH - 4} rx={6} />
              <text x={labelW - 14} y={y + rowH / 2} dy=".35em" textAnchor="end" className={r.strong ? 'lbl-strong' : 'lbl'}>{r.label}</text>
              {w > 0 && <rect className="growx" style={{ '--d': i + d }} x={labelW} y={y + (rowH - barH) / 2} width={w} height={barH} rx={4} fill={r.color || 'var(--neutral)'} />}
              <text x={labelW + w + 10} y={y + rowH / 2} dy=".35em" className={r.strong ? 'val' : 'val-muted'} style={r.strong ? { fontWeight: 600 } : null}>{r.text ?? fmt(r.value)}</text>
            </g>
          )
        })}
        <line className="baseline" x1={labelW} x2={labelW} y1={0} y2={H} />
      </svg>
      {tip && h != null && <Tip x={labelW + bw(rows[h].value) / 2 + 20} y={h * rowH + 6}>{tip(rows[h])}</Tip>}
    </div>
  )
}

/* ───────────────── Precio con y sin recargo (dumbbell) ───────────────── */
export function Dumbbell({ width = 680, rowH = 58 }) {
  const [h, setH] = useState(null)
  const labelW = 130, max = 50
  const plotW = width - labelW - 70
  const x = (v) => labelW + (v / max) * plotW
  const H = PRECIO_RECARGO.length * rowH
  return (
    <div style={{ position: 'relative' }}>
      <div className="legend" style={{ marginBottom: 14 }}>
        <span><i className="dot" style={{ background: 'var(--neutral)' }} />Sin recargo</span>
        <span><i className="dot" style={{ background: 'var(--accent)' }} />Con recargo</span>
      </div>
      <svg width={width} height={H + 30} className="dim-others">
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <g key={t} className="axis">
            <line x1={x(t)} x2={x(t)} y1={0} y2={H} />
            <text x={x(t)} y={H + 22} textAnchor="middle">{t === 0 ? 'USD 0' : t}</text>
          </g>
        ))}
        {PRECIO_RECARGO.map((r, i) => {
          const y = i * rowH + rowH / 2
          return (
            <g key={r.producto} className="row hov" onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}>
              <rect className="hit" x={0} y={y - rowH / 2 + 4} width={width} height={rowH - 8} rx={8} />
              <text x={labelW - 16} y={y} dy=".35em" textAnchor="end" className="lbl">{r.producto}</text>
              <line className="growx" style={{ '--d': i }} x1={x(r.sin)} x2={x(r.con)} y1={y} y2={y} stroke="var(--line-2)" strokeWidth={6} strokeLinecap="round" />
              <circle className="pop" style={{ '--d': i }} cx={x(r.sin)} cy={y} r={9} fill="var(--neutral)" stroke="var(--card)" strokeWidth={2} />
              <circle className="pop" style={{ '--d': i + 6 }} cx={x(r.con)} cy={y} r={10} fill="var(--accent)" stroke="var(--card)" strokeWidth={2} />
              <text x={x(r.con) + 20} y={y} dy=".35em" className="val">+{r.pct}%</text>
            </g>
          )
        })}
      </svg>
      {h != null && (
        <Tip x={x(PRECIO_RECARGO[h].con)} y={h * rowH + 40}>
          <b>{PRECIO_RECARGO[h].producto}</b> · precio mediano<br />
          {fUsd(PRECIO_RECARGO[h].sin)} → <span className="acc">{fUsd(PRECIO_RECARGO[h].con)}</span>
        </Tip>
      )}
    </div>
  )
}

/* ───────────────── 8 de cada 100 cotizaciones ───────────────── */
const WAFFLE_ON = new Set([6, 17, 31, 44, 52, 68, 79, 93])
export function Waffle({ size = 24, gap = 6 }) {
  const cells = Array.from({ length: 100 }, (_, i) => i)
  const W = 10 * size + 9 * gap
  return (
    <svg width={W} height={W} role="img" aria-label="8 de cada 100 cotizaciones tienen recargo">
      {cells.map((i) => {
        const r = Math.floor(i / 10), c = i % 10
        const on = WAFFLE_ON.has(i)
        return (
          <rect key={i} className="pop" style={{ '--d': on ? 18 + [...WAFFLE_ON].indexOf(i) * 2 : (r + c) * 0.5 }}
            x={c * (size + gap)} y={r * (size + gap)} width={size} height={size} rx={5}
            fill={on ? 'var(--accent)' : 'var(--card-2)'} stroke={on ? 'none' : 'var(--line)'} />
        )
      })}
    </svg>
  )
}

/* ───────────────── Cascada del ETL ───────────────── */
export function Waterfall({ width = 820 }) {
  const [h, setH] = useState(null)
  const labelW = 290, rowH = 66, max = ETL_PASOS[0].valor
  const plotW = width - labelW - 90
  const x = (v) => labelW + (v / max) * plotW
  let acc = 0
  const rows = ETL_PASOS.map((p) => {
    if (p.tipo === 'total') { acc = p.valor; return { ...p, a: 0, b: p.valor } }
    const b = acc, a = acc + p.valor; acc = a
    return { ...p, a, b }
  })
  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={rows.length * rowH} className="dim-others">
        {rows.map((r, i) => {
          const y = i * rowH
          const total = r.tipo === 'total'
          const w = Math.max(4, x(r.b) - x(r.a))
          const fill = total ? (i === 0 ? 'var(--neutral)' : 'var(--accent)') : 'var(--bad)'
          return (
            <g key={r.label} className="row hov" onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}>
              <rect className="hit" x={0} y={y + 3} width={width} height={rowH - 6} rx={8} />
              <text x={labelW - 18} y={y + (r.nota ? 26 : rowH / 2)} dy={r.nota ? 0 : '.35em'} textAnchor="end" className={total ? 'lbl-strong' : 'lbl'}>{r.label}</text>
              {r.nota && <text x={labelW - 18} y={y + 46} textAnchor="end" className="val-muted" style={{ fontFamily: 'var(--sans)' }}>{r.nota}</text>}
              {!total && <line x1={x(r.b)} x2={x(r.b)} y1={y - rowH / 2 + 18} y2={y + rowH / 2} stroke="var(--line-2)" strokeDasharray="2 3" />}
              <rect className="growx" style={{ '--d': i * 2 }} x={x(r.a)} y={y + rowH / 2 - 11} width={w} height={22} rx={4} fill={fill} />
              <text x={Math.max(x(r.b), x(r.a) + w) + 12} y={y + rowH / 2} dy=".35em" className="val" style={total ? { fontWeight: 600 } : null}>
                {r.valor < 0 ? '−' + fInt(-r.valor) : fInt(r.valor)}
              </text>
            </g>
          )
        })}
      </svg>
      {h != null && h > 0 && h < rows.length - 1 && (
        <Tip x={x(rows[h].b) - 30} y={h * rowH + 16}>{fPct(-rows[h].valor / max, 2)} del dataset crudo</Tip>
      )}
    </div>
  )
}

/* ───────────────── UTC → hora de Boston ───────────────── */
export function UtcShift() {
  const utc = Array.from({ length: 9 }, (_, i) => i + 9)
  const cell = { width: 42, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 14 }
  const row = (label, vals, hi, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className="label" style={{ width: 84 }}>{label}</span>
      {vals.map((v) => (
        <span key={v} style={{ ...cell, background: v === hi ? color : 'var(--card-2)', color: v === hi ? 'var(--accent-ink)' : 'var(--muted)', fontWeight: v === hi ? 700 : 400 }}>
          {String(v).padStart(2, '0')}
        </span>
      ))}
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {row('Dataset', utc, 13, 'var(--bad)')}
      {row('Boston', utc.map((v) => v - 5), 8, 'var(--accent)')}
    </div>
  )
}

/* ───────────────── Calendario: fechas y partición temporal ───────────────── */
export function Calendario({ width = 1400 }) {
  const n = CALENDARIO.length, gap = 6
  const cw = (width - gap * (n - 1)) / n
  const ch = 54
  const xi = (i) => i * (cw + gap)
  const lastTrain = CALENDARIO.map((c) => c.rol).lastIndexOf('train')
  const firstTest = CALENDARIO.findIndex((c) => c.rol === 'test')
  return (
    <svg width={width} height={ch + 92}>
      <defs>
        <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="var(--card-2)" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--text-2)" strokeWidth="2.5" opacity=".6" />
        </pattern>
      </defs>
      {CALENDARIO.map((c, i) => {
        const fill = c.estado === 'sin' ? 'transparent' : c.estado === 'parcial' ? 'url(#hatch)' : c.rol === 'test' ? 'var(--accent)' : 'var(--text-2)'
        return (
          <g key={c.fecha} className="pop" style={{ '--d': i * 0.6 }}>
            <rect x={xi(i)} y={0} width={cw} height={ch} rx={8} fill={fill}
              stroke={c.estado === 'sin' ? 'var(--line-2)' : 'none'} strokeDasharray={c.estado === 'sin' ? '4 4' : null} opacity={c.estado === 'completa' && c.rol === 'train' ? 0.85 : 1} />
            <text x={xi(i) + cw / 2} y={ch / 2} dy=".35em" textAnchor="middle" className="num"
              style={{ fontSize: 12, fill: c.estado === 'completa' ? 'var(--bg)' : 'var(--muted)', fontWeight: 500 }}>{c.fecha}</text>
          </g>
        )
      })}
      <g className="fade" style={{ '--d': 12 }}>
        <path d={`M${xi(0)},${ch + 14} v8 H${xi(lastTrain) + cw} v-8`} fill="none" stroke="var(--text-2)" />
        <text x={(xi(0) + xi(lastTrain) + cw) / 2} y={ch + 48} textAnchor="middle" className="lbl-strong">Entrenamiento · 14 fechas · {fInt(RECARGO.train)} cotizaciones</text>
        <text x={(xi(0) + xi(lastTrain) + cw) / 2} y={ch + 72} textAnchor="middle" className="val-muted" style={{ fontFamily: 'var(--sans)' }}>validación cruzada en 5 bloques, siempre prediciendo fechas posteriores</text>
        <path d={`M${xi(firstTest)},${ch + 14} v8 H${xi(n - 1) + cw} v-8`} fill="none" stroke="var(--accent)" />
        <text x={(xi(firstTest) + xi(n - 1) + cw) / 2} y={ch + 48} textAnchor="middle" className="lbl-strong" style={{ fill: 'var(--accent)' }}>Prueba ciega · 4 fechas</text>
        <text x={(xi(firstTest) + xi(n - 1) + cw) / 2} y={ch + 72} textAnchor="middle" className="val-muted">{fInt(RECARGO.test)} cotiz.</text>
      </g>
    </svg>
  )
}

/* ───────────────── Partición aleatoria vs temporal ───────────────── */
export function Particion({ width = 560 }) {
  const labelW = 170, max = 0.34, groupH = 64, barH = 18
  const plotW = width - labelW - 110
  const x = (v) => (v / max) * plotW
  return (
    <div>
      <div className="legend" style={{ marginBottom: 14 }}>
        <span><i className="sq" style={{ background: 'var(--bad)' }} />Partición aleatoria (inflada)</span>
        <span><i className="sq" style={{ background: 'var(--text-2)' }} />Partición por fecha (real)</span>
      </div>
      <svg width={width} height={PARTICION.length * groupH}>
        {PARTICION.map((p, i) => {
          const y = i * groupH + 8
          const inf = p.aleatoria / p.temporal - 1
          return (
            <g key={p.modelo}>
              <text x={labelW - 14} y={y + barH + 2} dy=".35em" textAnchor="end" className="lbl">{p.modelo}</text>
              <rect className="growx" style={{ '--d': i * 2 }} x={labelW} y={y} width={x(p.aleatoria)} height={barH} rx={4} fill="var(--bad)" />
              <rect className="growx" style={{ '--d': i * 2 + 1 }} x={labelW} y={y + barH + 4} width={x(p.temporal)} height={barH} rx={4} fill="var(--text-2)" />
              <text x={labelW + x(p.aleatoria) + 10} y={y + barH / 2} dy=".35em" className="val">{fDec(p.aleatoria, 3)}</text>
              <text x={labelW + x(p.temporal) + 10} y={y + barH * 1.5 + 4} dy=".35em" className="val-muted">{fDec(p.temporal, 3)}</text>
              {inf > 0.5 && (
                <text x={labelW + x(p.aleatoria) + 66} y={y + barH / 2} dy=".35em" className="val" style={{ fill: 'var(--bad)', fontWeight: 700 }}>+{Math.round(inf * 100)}%</text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="label" style={{ marginTop: 4 }}>PR-AUC en la prueba · azar = 0,083</div>
    </div>
  )
}

/* ───────────────── Mapa de riesgo por zona ───────────────── */
const LON0 = -71.114, LAT1 = 42.3705, KX = 9000, KY = 12180
const LBL = {
  'Back Bay': [0, 44, 'middle'], 'Northeastern University': [32, 4, 'start'], Fenway: [0, 44, 'middle'],
  'Theatre District': [0, 46, 'middle'], 'Boston University': [0, -34, 'middle'], 'Beacon Hill': [-28, 4, 'end'],
  'South Station': [28, 4, 'start'], 'Financial District': [26, 4, 'start'], 'West End': [-24, 10, 'end'],
  'North Station': [-22, -4, 'end'], 'Haymarket Square': [20, 8, 'start'], 'North End': [20, -2, 'start'],
}
export function ZoneMap({ width = 700, height = 500 }) {
  const [h, setH] = useState(null)
  const max = ZONAS[0].tasa
  const min = ZONAS[ZONAS.length - 1].tasa
  const pts = ZONAS.map((z) => ({ ...z, x: (z.lon - LON0) * KX, y: (LAT1 - z.lat) * KY, r: 6 + 19 * Math.sqrt(z.tasa / max) }))
  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height}>
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <g key={f}>
            <line x1={0} x2={width} y1={height * f} y2={height * f} className="gridline" strokeDasharray="2 6" />
            <line y1={0} y2={height} x1={width * f} x2={width * f} className="gridline" strokeDasharray="2 6" />
          </g>
        ))}
        {pts.map((p, i) => {
          const [dx, dy, anchor] = LBL[p.zona]
          const op = 0.25 + 0.75 * ((p.tasa - min) / (max - min))
          return (
            <g key={p.zona} className="hov" onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}>
              <circle className="pop" style={{ '--d': 11 - i }} cx={p.x} cy={p.y} r={p.r} fill="var(--accent)" fillOpacity={op} stroke="var(--bg)" strokeWidth={2} />
              {h === i && <circle cx={p.x} cy={p.y} r={p.r + 6} fill="none" stroke="var(--accent)" strokeWidth={2} />}
              <text x={p.x + dx} y={p.y + dy - 8} textAnchor={anchor} className="lbl" style={{ fontSize: 13.5 }}>{p.zona}</text>
              <text x={p.x + dx} y={p.y + dy + 9} textAnchor={anchor} className="val" style={{ fontSize: 13, fill: i < 5 ? 'var(--accent)' : 'var(--muted)' }}>{fPct(p.tasa)}</text>
              <circle cx={p.x} cy={p.y} r={Math.max(p.r, 22)} fill="transparent" />
            </g>
          )
        })}
        <text x={width - 4} y={height - 6} textAnchor="end" className="val-muted" style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>Ubicación aproximada (OpenStreetMap) · tamaño y color = % con recargo</text>
      </svg>
      {h != null && (
        <Tip x={pts[h].x} y={pts[h].y - pts[h].r}>
          <b>{pts[h].zona}</b><br />
          {fPct(pts[h].tasa)} de las cotizaciones con recargo<br />
          <span className="muted">{fDec(pts[h].tasa / min, 1)}× North End</span>
        </Tip>
      )}
    </div>
  )
}

/* ───────────────── Uber vs Lyft: tarifa aprendida por distancia ───────────────── */
export function FareCompare({ nivel, dist, setDist, width = 760, height = 360 }) {
  const u = TARIFAS[nivel.uber], l = TARIFAS[nivel.lyft]
  const pad = { l: 56, r: 110, t: 34, b: 40 }
  const maxY = Math.ceil(Math.max(...u.map((p) => p[1]), ...l.map((p) => p[1])) / 10) * 10
  const x = (d) => pad.l + ((d - 0.5) / 5.5) * (width - pad.l - pad.r)
  const y = (v) => pad.t + (1 - v / maxY) * (height - pad.t - pad.b)
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p[0])},${y(p[1])}`).join(' ')
  const at = (pts) => pts.find((p) => Math.abs(p[0] - dist) < 1e-6)?.[1]
  const pu = at(u), pl = at(l)
  const ticks = Array.from({ length: maxY / 10 + 1 }, (_, i) => i * 10)
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const scale = r.width / width
    const px = (e.clientX - r.left) / scale
    const d = Math.round(((px - pad.l) / (width - pad.l - pad.r)) * 5.5 * 2) / 2 + 0.5
    setDist(Math.min(6, Math.max(0.5, d)))
  }
  return (
    <svg width={width} height={height} onMouseMove={onMove} style={{ cursor: 'crosshair' }} key={nivel.nivel}>
      {ticks.map((t) => (
        <g key={t} className="axis">
          <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} />
          <text x={pad.l - 10} y={y(t)} dy=".35em" textAnchor="end">{t}</text>
        </g>
      ))}
      {[0.5, 1, 2, 3, 4, 5, 6].map((d) => (
        <text key={d} x={x(d)} y={height - 14} textAnchor="middle" className="tick">{fDec(d, d % 1 ? 1 : 0)} mi</text>
      ))}
      <text x={pad.l - 10} y={12} textAnchor="end" className="tick" style={{ fontSize: 12 }}>USD</text>
      <line x1={x(dist)} x2={x(dist)} y1={pad.t} y2={height - pad.b} stroke="var(--text-2)" strokeDasharray="3 4" />
      <path className="draw" pathLength="1" d={path(u)} fill="none" stroke="var(--uber)" strokeWidth={2.5} />
      <path className="draw" style={{ '--d': 1 }} pathLength="1" d={path(l)} fill="none" stroke="var(--lyft)" strokeWidth={2.5} />
      <text x={x(6) + 12} y={y(u[u.length - 1][1])} dy={u[11][1] > l[11][1] ? '-.2em' : '.9em'} className="lbl-strong" style={{ fontSize: 14 }}>{nivel.uber}</text>
      <text x={x(6) + 12} y={y(l[l.length - 1][1])} dy={l[11][1] >= u[11][1] ? '-.2em' : '.9em'} className="lbl-strong" style={{ fontSize: 14 }}>{nivel.lyft}</text>
      {pu != null && <circle cx={x(dist)} cy={y(pu)} r={7} fill="var(--uber)" stroke="var(--card)" strokeWidth={2} />}
      {pl != null && <circle cx={x(dist)} cy={y(pl)} r={7} fill="var(--lyft)" stroke="var(--card)" strokeWidth={2} />}
    </svg>
  )
}
export const tarifaEn = (prod, d) => TARIFAS[prod].find((p) => Math.abs(p[0] - d) < 1e-6)?.[1]

/* ───────────────── K-Means: 12 productos en 3 familias ───────────────── */
const GRUPO_COLOR = { 'Económico': 'var(--eco)', Intermedio: 'var(--mid)', Premium: 'var(--prem)' }
const KLBL = {
  Shared: [0, 20, 'middle'], Lyft: [-12, -6, 'end'], UberPool: [12, 12, 'start'], WAV: null, UberX: [12, -6, 'start', 'UberX · WAV'],
  'Lyft XL': [-12, 4, 'end'], Lux: [-12, 4, 'end'], UberXL: [12, 6, 'start'], Black: [12, 4, 'start'], 'Lux Black': [12, -4, 'start'],
  'Lux Black XL': [-12, -8, 'end'], 'Black SUV': [-12, 6, 'end'],
}
export function KMeansScatter({ width = 640, height = 400 }) {
  const [h, setH] = useState(null)
  const pad = { l: 52, r: 24, t: 36, b: 44 }
  const x = (v) => pad.l + (v / 25) * (width - pad.l - pad.r)
  const y = (v) => pad.t + (1 - (v - 1) / 4) * (height - pad.t - pad.b)
  const groups = useMemo(() => {
    const g = {}
    KMEANS.productos.forEach((p) => { (g[p.grupo] ??= []).push(p) })
    return g
  }, [])
  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        {[1, 2, 3, 4, 5].map((t) => (
          <g key={t} className="axis"><line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} /><text x={pad.l - 10} y={y(t)} dy=".35em" textAnchor="end">{t}</text></g>
        ))}
        {[0, 5, 10, 15, 20, 25].map((t) => (
          <text key={t} x={x(t)} y={height - 16} textAnchor="middle" className="tick">{t}</text>
        ))}
        <text x={(pad.l + width - pad.r) / 2} y={height + 2} textAnchor="middle" className="tick">Tarifa base estimada (USD)</text>
        <text x={pad.l - 10} y={12} textAnchor="start" className="tick" style={{ fontSize: 12 }}>USD por milla</text>
        {Object.entries(groups).map(([g, ps], gi) => {
          const xs = ps.map((p) => x(p.base)), ys = ps.map((p) => y(p.milla))
          const x0 = Math.min(...xs) - 22, x1 = Math.max(...xs) + 22, y0 = Math.min(...ys) - 22, y1 = Math.max(...ys) + 22
          return <rect key={g} className="fade" style={{ '--d': 8 + gi }} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={22} fill={GRUPO_COLOR[g]} fillOpacity={0.1} stroke={GRUPO_COLOR[g]} strokeOpacity={0.45} strokeDasharray="4 4" />
        })}
        {KMEANS.productos.map((p, i) => {
          const cx = x(p.base), cy = y(p.milla), c = GRUPO_COLOR[p.grupo]
          const lb = KLBL[p.producto]
          return (
            <g key={p.producto} className="hov" onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}>
              {p.plataforma === 'Uber'
                ? <circle className="pop" style={{ '--d': i }} cx={cx} cy={cy} r={8} fill={c} stroke="var(--card)" strokeWidth={2} />
                : <rect className="pop" style={{ '--d': i }} x={cx - 7.5} y={cy - 7.5} width={15} height={15} rx={3} fill={c} stroke="var(--card)" strokeWidth={2} />}
              {lb && <text x={cx + lb[0]} y={cy + lb[1]} dy=".35em" textAnchor={lb[2]} className="lbl" style={{ fontSize: 13 }}>{lb[3] ?? p.producto}</text>}
              <circle cx={cx} cy={cy} r={16} fill="transparent" />
            </g>
          )
        })}
      </svg>
      {h != null && (() => {
        const p = KMEANS.productos[h]
        return (
          <Tip x={x(p.base)} y={y(p.milla) - 6}>
            <b>{p.producto}</b> <span className="muted">· {p.plataforma} · {p.grupo}</span><br />
            Base {fUsd(p.base)} + {fUsd(p.milla)}/milla
          </Tip>
        )
      })()}
    </div>
  )
}
export const GRUPOS_LEYENDA = Object.entries(GRUPO_COLOR)

/* ───────────────── Curvas ROC / Precisión-Recall ───────────────── */
const MODEL_ORDER = ['Regresión logística', 'Árbol de decisión', 'Random forest', 'Gradient boosting']
export function Curvas({ tipo, width = 470, height = 360 }) {
  const [h, setH] = useState(null)
  const pad = { l: 48, r: 16, t: 14, b: 44 }
  const ymax = tipo === 'roc' ? 1 : 0.3
  const x = (v) => pad.l + v * (width - pad.l - pad.r)
  const y = (v) => pad.t + (1 - Math.min(v, ymax) / ymax) * (height - pad.t - pad.b)
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(' ')
  const yt = tipo === 'roc' ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.1, 0.2, 0.3]
  const base = 0.08296994696523276 // tasa de recargo en la prueba
  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} key={tipo}>
        {yt.map((t) => (
          <g key={t} className="axis"><line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} /><text x={pad.l - 8} y={y(t)} dy=".35em" textAnchor="end">{fDec(t, t === 0 || t === 1 ? 0 : 2)}</text></g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={x(t)} y={height - 22} textAnchor="middle" className="tick">{fDec(t, t % 1 ? 2 : 0)}</text>)}
        <text x={(pad.l + width - pad.r) / 2} y={height - 2} textAnchor="middle" className="tick">{tipo === 'roc' ? 'Falsas alarmas (FPR)' : 'Recall: recargos detectados'}</text>
        {tipo === 'roc'
          ? <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="var(--muted)" strokeDasharray="4 5" />
          : <line x1={x(0)} y1={y(base)} x2={x(1)} y2={y(base)} stroke="var(--muted)" strokeDasharray="4 5" />}
        <text x={tipo === 'roc' ? x(0.62) : x(0.98)} y={tipo === 'roc' ? y(0.55) : y(base) + 18} textAnchor={tipo === 'roc' ? 'start' : 'end'} className="val-muted">azar</text>
        {MODEL_ORDER.map((m, i) => {
          const gb = m === 'Gradient boosting'
          const on = h == null ? gb : h === m
          return (
            <path key={m} className="draw" style={{ '--d': i }} pathLength="1" d={path(CURVAS.curvas[m][tipo])} fill="none"
              stroke={on ? 'var(--accent)' : 'var(--neutral)'} strokeWidth={on ? 3 : 1.5} strokeOpacity={on ? 1 : 0.7} />
          )
        })}
      </svg>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
        {MODEL_ORDER.map((m) => (
          <span key={m} className="chip" style={{ cursor: 'default', borderColor: (h ?? 'Gradient boosting') === m ? 'var(--accent)' : undefined }}
            onMouseEnter={() => setH(m)} onMouseLeave={() => setH(null)}>
            {m} <span className="num muted" style={{ fontSize: 12 }}>{fDec(tipo === 'roc' ? CURVAS.curvas[m].roc_auc : CURVAS.curvas[m].ap, 3)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ───────────────── Balanceo ───────────────── */
export function Balanceo({ width = 640 }) {
  const labelW = 150, rowH = 60, max = 361022, plotW = width - labelW - 150
  const x = (v) => (v / max) * plotW
  return (
    <div>
      <div className="legend" style={{ marginBottom: 12 }}>
        <span><i className="sq" style={{ background: 'var(--neutral)' }} />Sin recargo</span>
        <span><i className="sq" style={{ background: 'var(--accent)' }} />Con recargo</span>
        <span className="muted" style={{ marginLeft: 'auto' }}>PR-AUC validación (GB)</span>
      </div>
      <svg width={width} height={BALANCEO.length * rowH}>
        {BALANCEO.map((b, i) => {
          const y = i * rowH
          const w0 = x(b.filas0), w1 = x(b.filas1)
          return (
            <g key={b.tecnica}>
              {b.elegido && <rect x={-10} y={y + 2} width={width + 10} height={rowH - 4} rx={10} fill="var(--accent-soft)" />}
              <text x={labelW - 14} y={y + 30} dy=".35em" textAnchor="end" className={b.elegido ? 'lbl-strong' : 'lbl'}>{b.tecnica}</text>
              <rect className="growx" style={{ '--d': i * 2 }} x={labelW} y={y + 20} width={w0} height={20} rx={4} fill="var(--neutral)" />
              <rect className="growx" style={{ '--d': i * 2 + 1 }} x={labelW + w0 + 2} y={y + 20} width={Math.max(3, w1)} height={20} rx={4} fill="var(--accent)" />
              <text x={labelW + w0 + w1 + 12} y={y + 30} dy=".35em" className="val-muted">{fInt(b.filas0 + b.filas1)}</text>
              <text x={width - 6} y={y + 30} dy=".35em" textAnchor="end" className="val" style={{ fontSize: 17, fontWeight: b.elegido ? 700 : 400, fill: b.elegido ? 'var(--accent)' : 'var(--text-2)' }}>{fDec(b.val, 3)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ───────────────── Deciles de riesgo ───────────────── */
export function Deciles({ width = 620, height = 320 }) {
  const [h, setH] = useState(null)
  const pad = { l: 44, r: 12, t: 26, b: 34 }
  const max = 0.18
  const bw = (width - pad.l - pad.r) / 10
  const y = (v) => pad.t + (1 - v / max) * (height - pad.t - pad.b)
  const avg = 0.08296994696523276
  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} className="dim-others">
        {[0, 0.05, 0.1, 0.15].map((t) => (
          <g key={t} className="axis"><line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} /><text x={pad.l - 8} y={y(t)} dy=".35em" textAnchor="end">{t * 100}%</text></g>
        ))}
        {DECILES.map((d, i) => {
          const x0 = pad.l + i * bw + 6
          const top = i < 2
          return (
            <g key={d.d} className="row hov" onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}>
              <rect className="hit" x={x0 - 4} y={pad.t} width={bw - 4} height={height - pad.t - pad.b} rx={6} />
              <rect className="growy" style={{ '--d': i }} x={x0} y={y(d.tasa)} width={bw - 12} height={y(0) - y(d.tasa)} rx={4} fill={top ? 'var(--accent)' : 'var(--neutral)'} />
              <text x={x0 + (bw - 12) / 2} y={y(d.tasa) - 8} textAnchor="middle" className={top ? 'val' : 'val-muted'} style={{ fontSize: 12.5 }}>{fPct(d.tasa)}</text>
              <text x={x0 + (bw - 12) / 2} y={height - 12} textAnchor="middle" className="tick">D{d.d}</text>
            </g>
          )
        })}
        <line x1={pad.l} x2={width - pad.r} y1={y(avg)} y2={y(avg)} stroke="var(--text-2)" strokeDasharray="4 5" />
        <text x={width - pad.r} y={y(avg) - 7} textAnchor="end" className="val-muted">promedio 8,3%</text>
      </svg>
      {h != null && (
        <Tip x={pad.l + h * bw + bw / 2} y={y(DECILES[h].tasa) - 22}>
          <b>Decil {DECILES[h].d}</b> · {fInt(DECILES[h].positivos)} recargos reales<br />
          Tasa {fPct(DECILES[h].tasa)} · {fDec(DECILES[h].lift, 2)}× el promedio<br />
          <span className="muted">Acumulado: {fPct(DECILES[h].captura)} de todos los recargos</span>
        </Tip>
      )}
    </div>
  )
}

/* ───────────────── Laboratorio de umbral ───────────────── */
export const UMBRALES = CURVAS.umbral
export const N_TEST = CURVAS.n
export function BeneficioCurva({ t, width = 560, height = 230, elegido }) {
  const pad = { l: 50, r: 14, t: 14, b: 34 }
  const xs = UMBRALES
  const x = (v) => pad.l + ((v - 0.2) / 0.6) * (width - pad.l - pad.r)
  const ymin = -300, ymax = 100
  const y = (v) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (height - pad.t - pad.b)
  const path = xs.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.b).toFixed(1)}`).join(' ')
  const cur = xs.reduce((a, p) => (Math.abs(p.t - t) < Math.abs(a.t - t) ? p : a), xs[0])
  return (
    <svg width={width} height={height}>
      {[-300, -200, -100, 0, 100].map((v) => (
        <g key={v} className="axis"><line x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} style={v === 0 ? { stroke: 'var(--line-2)' } : null} /><text x={pad.l - 8} y={y(v)} dy=".35em" textAnchor="end">{v}</text></g>
      ))}
      {[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((v) => <text key={v} x={x(v)} y={height - 12} textAnchor="middle" className="tick">{fDec(v, 1)}</text>)}
      <path d={`${path} L${x(0.8)},${y(0)} L${x(0.2)},${y(0)} Z`} fill="var(--accent-soft)" opacity={0.6} />
      <path className="draw" pathLength="1" d={path} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
      <line x1={x(elegido)} x2={x(elegido)} y1={pad.t} y2={height - pad.b} stroke="var(--text-2)" strokeDasharray="3 4" />
      <text x={x(elegido) + 6} y={pad.t + 10} className="val-muted" style={{ fontSize: 12 }}>elegido en validación</text>
      <circle cx={x(cur.t)} cy={y(cur.b)} r={7} fill="var(--text)" stroke="var(--accent)" strokeWidth={3} />
    </svg>
  )
}

/* ───────────────── Recorrido: la pregunta que se bifurca ───────────────── */
export function ForkLine({ width = 1424, height = 190 }) {
  const col = width / 4
  const xs = [0, 1, 2, 3].map((i) => i * col + 9)
  const y0 = height / 2, yA = y0 - 52, yB = y0 + 52
  const fx = xs[1] - 60
  const end = width - 8
  return (
    <svg width={width} height={height} aria-label="La pregunta del precio se divide en dos variables en la Entrega 2">
      <path className="draw" pathLength="1" d={`M${xs[0]},${y0} L${fx},${y0}`} stroke="var(--text-2)" strokeWidth={3} fill="none" />
      <path className="draw" style={{ '--d': 3 }} pathLength="1" d={`M${fx},${y0} C${fx + 40},${y0} ${xs[1] - 20},${yA} ${xs[1]},${yA} L${end},${yA}`} stroke="var(--precio)" strokeWidth={4} fill="none" />
      <path className="draw" style={{ '--d': 3 }} pathLength="1" d={`M${fx},${y0} C${fx + 40},${y0} ${xs[1] - 20},${yB} ${xs[1]},${yB} L${end},${yB}`} stroke="var(--recargo)" strokeWidth={4} fill="none" />
      <circle cx={xs[0]} cy={y0} r={8} fill="var(--text-2)" />
      {xs.slice(1).map((x, i) => (
        <g key={x} className="pop" style={{ '--d': 8 + i * 3 }}>
          <circle cx={x} cy={yA} r={8} fill="var(--precio)" stroke="var(--bg)" strokeWidth={3} />
          <circle cx={x} cy={yB} r={8} fill="var(--recargo)" stroke="var(--bg)" strokeWidth={3} />
        </g>
      ))}
      <text x={xs[0] + 18} y={y0 - 14} className="lbl" style={{ fontSize: 16 }}>Solo el precio</text>
      <g className="fade" style={{ '--d': 10 }}>
        <text x={xs[1] + 20} y={yA - 16} className="lbl-strong" style={{ fontSize: 16, fill: 'var(--precio)' }}>PRECIO · parte estructural · regresión</text>
        <text x={xs[1] + 20} y={yB + 28} className="lbl-strong" style={{ fontSize: 16, fill: 'var(--recargo)' }}>RECARGO · parte dinámica · clasificación</text>
        <text x={end} y={yA - 16} textAnchor="end" className="val" style={{ fontSize: 16 }}>USD 1,08 de error</text>
        <text x={end} y={yB + 28} textAnchor="end" className="val" style={{ fontSize: 16 }}>+USD 56 cada 1.000 cotiz.</text>
      </g>
    </svg>
  )
}

/* ───────────────── Recargo: de 7 multiplicadores a una variable sí / no ───────────────── */
const MULT = [['×1,25', 11085], ['×1,5', 5065], ['×1,75', 2420], ['×2', 2239], ['×2,5', 154], ['×3', 12]]
export function SurgeCollapse({ width = 600 }) {
  const max = 11085, labelW = 70, plotW = width - labelW - 210
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <svg width={labelW + plotW + 70} height={MULT.length * 26}>
        {MULT.map(([k, v], i) => (
          <g key={k}>
            <text x={labelW - 10} y={i * 26 + 13} dy=".35em" textAnchor="end" className="val-muted">{k}</text>
            <rect className="growx" style={{ '--d': i }} x={labelW} y={i * 26 + 5} width={Math.max(3, (v / max) * plotW)} height={16} rx={3} fill="var(--recargo)" opacity={0.85} />
            <text x={labelW + Math.max(3, (v / max) * plotW) + 8} y={i * 26 + 13} dy=".35em" className="val-muted">{fInt(v)}</text>
          </g>
        ))}
      </svg>
      <div style={{ fontSize: 34, color: 'var(--muted)' }}>→</div>
      <div>
        <div className="num recargo" style={{ fontSize: 34 }}>{fInt(20975)}</div>
        <div className="small t2">has_surge = 1<br />(8,2% del total)</div>
      </div>
    </div>
  )
}

/* ───────────────── Las 57 columnas por bloque ───────────────── */
export function ColumnBlocks({ blocks, width = 1300 }) {
  const total = blocks.reduce((a, b) => a + b[1], 0)
  const colors = ['var(--mid)', 'var(--eco)', 'var(--prem)', 'var(--neutral)']
  const cw = (width - (total - 1) * 3) / total
  let k = 0
  return (
    <div>
      <svg width={width} height={70}>
        {blocks.flatMap(([name, n], bi) => Array.from({ length: n }, () => {
          const i = k++
          return <rect key={i} className="pop" style={{ '--d': i * 0.35 }} x={i * (cw + 3)} y={0} width={cw} height={70} rx={3} fill={colors[bi]} opacity={bi === 3 ? 0.55 : 0.9} />
        }))}
      </svg>
      <div style={{ display: 'flex', gap: 44, marginTop: 16 }}>
        {blocks.map(([name, n], bi) => (
          <div key={name} className="fade" style={{ '--d': 10 + bi, display: 'flex', gap: 10, alignItems: 'baseline' }}>
            <i className="sq" style={{ background: colors[bi], opacity: bi === 3 ? 0.55 : 0.9, width: 14, height: 14 }} />
            <span className="num" style={{ fontSize: 26 }}>{n}</span>
            <span className="t2" style={{ fontSize: 18 }}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────── UTC → hora local, las 24 horas ───────────────── */
export function UtcBig({ width = 1360 }) {
  const cw = width / 24, h = 46, gap = 150
  return (
    <svg width={width} height={h * 2 + gap + 40}>
      <text x={0} y={-10} className="label" />
      {Array.from({ length: 24 }, (_, i) => {
        const x = i * cw
        const hi = i === 13
        const j = (i + 19) % 24 // hora local = UTC − 5
        const xb = j * cw
        return (
          <g key={i}>
            <path className="draw" style={{ '--d': hi ? 6 : 2 + i * 0.1 }} pathLength="1"
              d={`M${x + cw / 2},${h + 4} C${x + cw / 2},${h + gap / 2} ${xb + cw / 2},${h + gap / 2} ${xb + cw / 2},${h + gap - 4}`}
              fill="none" stroke={hi ? 'var(--accent)' : 'var(--line-2)'} strokeWidth={hi ? 3 : 1.2} />
            <rect className="pop" style={{ '--d': i * 0.3 }} x={x + 3} y={0} width={cw - 6} height={h} rx={8} fill={hi ? 'var(--bad)' : 'var(--card-2)'} />
            <text x={x + cw / 2} y={h / 2} dy=".35em" textAnchor="middle" className="num" style={{ fontSize: 15, fill: hi ? '#fff' : 'var(--text-2)', fontWeight: hi ? 700 : 400 }}>{String(i).padStart(2, '0')}</text>
            <rect className="pop" style={{ '--d': 8 + i * 0.3 }} x={x + 3} y={h + gap} width={cw - 6} height={h} rx={8} fill={i === 8 ? 'var(--accent)' : 'var(--card-2)'} />
            <text x={x + cw / 2} y={h + gap + h / 2} dy=".35em" textAnchor="middle" className="num" style={{ fontSize: 15, fill: i === 8 ? 'var(--accent-ink)' : 'var(--text-2)', fontWeight: i === 8 ? 700 : 400 }}>{String(i).padStart(2, '0')}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ───────────────── Asimetría: dos costos ───────────────── */
export function AsymBars({ height = 330 }) {
  const items = [['8,73', 8.73, 'var(--bad)', 'No avisa y hay recargo'], ['1', 1, 'var(--neutral)', 'Avisa y no había']]
  return (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end', height }}>
      {items.map(([t, v, c, l], i) => (
        <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', width: 170 }}>
          <div className="num fade" style={{ '--d': 6 + i * 2, fontSize: 30, marginBottom: 10 }}>−USD {t}</div>
          <div className="growy" style={{ '--d': i * 4, width: 120, height: (v / 8.73) * (height - 110), background: c, borderRadius: '10px 10px 3px 3px' }} />
          <div className="small t2" style={{ marginTop: 12, textAlign: 'center' }}>{l}</div>
        </div>
      ))}
    </div>
  )
}

/* ───────────────── Dona de hipótesis ───────────────── */
export function Donut({ ok = 4, total = 6, size = 260 }) {
  const r = size / 2 - 22, c = 2 * Math.PI * r
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bad)" strokeOpacity={0.35} strokeWidth={28} />
      <circle className="donut" pathLength="1" cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--good)" strokeWidth={28}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ strokeDasharray: `${ok / total} 1`, '--off': ok / total }} />
      <text x={size / 2} y={size / 2 - 6} textAnchor="middle" className="num" style={{ fontSize: 56, fill: 'var(--text)' }}>{ok}/{total}</text>
      <text x={size / 2} y={size / 2 + 30} textAnchor="middle" className="lbl">confirmadas</text>
    </svg>
  )
}

/* ───────────────── Íconos simples por actor ───────────────── */
export function ActorIcon({ who, size = 64 }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="pop" aria-hidden>
      {who === 'Pasajero' && <g {...s}><circle cx="24" cy="14" r="7" /><path d="M10 42c1.5-9 7-14 14-14s12.5 5 14 14" /></g>}
      {who === 'Conductor' && <g {...s}><path d="M7 30l4-11c.6-1.8 2.3-3 4.2-3h17.6c1.9 0 3.6 1.2 4.2 3l4 11v7H7z" /><circle cx="15" cy="37" r="3.5" /><circle cx="33" cy="37" r="3.5" /><path d="M11 25h26" /></g>}
      {who === 'Plataforma' && <g {...s}><rect x="13" y="5" width="22" height="38" rx="4" /><path d="M21 37h6" /><path d="M18 15h12M18 21h8" /></g>}
    </svg>
  )
}
