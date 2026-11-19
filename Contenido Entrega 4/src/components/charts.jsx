import { useMemo, useState } from 'react'
import { fInt, fDec, fPct, fUsd, Tip, Num } from '../lib/ui.jsx'
import {
  PISTA_PRODUCTO, PISTA_ZONA, PISTA_CORR, PISTA_AUC, RECARGO_HORA,
  PRECIO_RECARGO, ETL_PASOS, CALENDARIO, PARTICION, ZONAS, KMEANS, DECILES, RECARGO, BALANCEO, FINAL,
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
  const gid = useMemo(() => 'hshine' + Math.random().toString(36).slice(2, 8), [])
  return (
    <div style={{ position: 'relative', width }}>
      <svg width={width} height={H + (refs.length ? 22 : 0)} className="dim-others">
        <defs>
          <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="140" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            <animateTransform attributeName="gradientTransform" type="translate" from={`${labelW - 160} 0`} to={`${width} 0`} dur="3.4s" begin="2s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
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
              {w > 0 && r.strong && <rect className="anim-loop" x={labelW} y={y + (rowH - barH) / 2} width={w} height={barH} rx={4} fill={`url(#${gid})`} />}
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
// Precio normal (gris) + lo que suma el recargo (tramo rayado animado), por producto
export function Dumbbell({ width = 680, rowH = 58 }) {
  const [h, setH] = useState(null)
  const labelW = 128, rightW = 170, barH = 34
  const max = Math.max(...PRECIO_RECARGO.map((r) => r.con))
  const plotW = width - labelW - rightW
  const x = (v) => labelW + (v / max) * plotW
  const H = PRECIO_RECARGO.length * rowH
  const top = PRECIO_RECARGO.reduce((a, r) => (r.pct > a.pct ? r : a))
  const usd = (v) => 'USD ' + fDec(v, v % 1 ? 1 : 0)
  return (
    <div style={{ position: 'relative' }}>
      <div className="legend" style={{ marginBottom: 18, fontSize: 16, gap: 26 }}>
        <span><i style={{ display: 'inline-block', width: 22, height: 14, borderRadius: 3, background: 'var(--neutral)', opacity: 0.42 }} />Precio normal</span>
        <span><i className="surge-swatch" />Lo que suma el recargo</span>
      </div>
      <svg width={width} height={H} className="dim-others" style={{ overflow: 'visible' }}>
        <defs>
          <pattern id="surge-stripes" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <rect width="16" height="16" fill="var(--recargo)" />
            <rect width="7" height="16" fill="#fff" opacity=".28" />
            <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="16 0" dur="0.9s" additive="sum" repeatCount="indefinite" />
          </pattern>
        </defs>
        {PRECIO_RECARGO.map((r, i) => {
          const y = i * rowH + rowH / 2
          const esTop = r === top
          const pillW = 64
          return (
            <g key={r.producto} className="row hov" onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}>
              <rect className="hit" x={0} y={y - rowH / 2 + 4} width={width} height={rowH - 8} rx={8} />
              <text x={labelW - 16} y={y} dy=".35em" textAnchor="end" className="lbl" style={{ fontSize: 17, fontWeight: esTop ? 600 : 400, fill: esTop ? 'var(--text)' : undefined }}>{r.producto}</text>
              {/* precio normal */}
              <rect className="growx" style={{ '--d': i * 1.5 }} x={labelW} y={y - barH / 2} width={x(r.sin) - labelW} height={barH} rx={5} fill="var(--neutral)" opacity=".42" />
              <text className="fade" style={{ '--d': 6 + i }} x={labelW + 10} y={y} dy=".35em" fill="var(--text)" fontFamily="var(--mono)" fontSize={14} fontWeight={600}>{usd(r.sin)}</text>
              {/* lo que suma el recargo */}
              <rect className="growx surge-seg" style={{ '--d': 8 + i * 1.5 }} x={x(r.sin)} y={y - barH / 2} width={x(r.con) - x(r.sin)} height={barH} rx={5} fill="url(#surge-stripes)" />
              {/* total con recargo + % */}
              <g className="fade" style={{ '--d': 12 + i }}>
                <text x={x(r.con) + 14} y={y} dy=".35em" className="val" style={{ fontSize: 17, fontWeight: 600, fill: 'var(--recargo)' }}>{usd(r.con)}</text>
                <g className={esTop ? 'pill-pulse' : undefined}>
                  <rect x={x(r.con) + 104} y={y - 14} width={pillW} height={28} rx={14} fill={esTop ? 'var(--recargo)' : 'var(--recargo-soft, rgba(176,122,46,.14))'} />
                  <text x={x(r.con) + 104 + pillW / 2} y={y} dy=".35em" textAnchor="middle" className="val" style={{ fontSize: 15, fontWeight: 700, fill: esTop ? '#fff' : 'var(--recargo)' }}>+{r.pct}%</text>
                </g>
              </g>
            </g>
          )
        })}
      </svg>
      {h != null && (
        <Tip x={x(PRECIO_RECARGO[h].con)} y={h * rowH + rowH / 2 + 24}>
          <b>{PRECIO_RECARGO[h].producto}</b> · precio mediano<br />
          {fUsd(PRECIO_RECARGO[h].sin)} sin recargo → <span className="acc">{fUsd(PRECIO_RECARGO[h].con)}</span> con recargo<br />
          el recargo suma <b>{fUsd(PRECIO_RECARGO[h].con - PRECIO_RECARGO[h].sin)}</b> (+{PRECIO_RECARGO[h].pct}%)
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
              {i < 5 && <circle className="zone-ripple anim-loop" style={{ animationDelay: `${1.6 + i * 0.5}s`, '--r': p.r }} cx={p.x} cy={p.y} r={p.r} fill="none" stroke="var(--accent)" strokeWidth={2} />}
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
          return <rect key={g} className="fade km-hull" style={{ '--d': 8 + gi, '--kd': `${gi * 0.8}s` }} x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={22} fill={GRUPO_COLOR[g]} fillOpacity={0.1} stroke={GRUPO_COLOR[g]} strokeOpacity={0.45} strokeDasharray="4 4" />
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
  const labelW = 170, rowH = 76, max = 361022, plotW = width - labelW - 230
  const x = (v) => (v / max) * plotW
  return (
    <div>
      <div className="legend" style={{ marginBottom: 12, fontSize: 16 }}>
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
              <text x={labelW - 14} y={y + 38} dy=".35em" textAnchor="end" className={b.elegido ? 'lbl-strong' : 'lbl'} style={{ fontSize: 17 }}>{b.tecnica}</text>
              <rect className="growx" style={{ '--d': i * 2 }} x={labelW} y={y + 24} width={w0} height={28} rx={5} fill="var(--neutral)" />
              <rect className={'growx' + (b.elegido ? ' bal-pick' : '')} style={{ '--d': i * 2 + 1 }} x={labelW + w0 + 2} y={y + 24} width={Math.max(3, w1)} height={28} rx={5} fill="var(--accent)" />
              <text x={labelW + w0 + w1 + 12} y={y + 38} dy=".35em" className="val-muted" style={{ fontSize: 14 }}>{fInt(b.filas0 + b.filas1)} filas</text>
              <text x={width - 6} y={y + 38} dy=".35em" textAnchor="end" className="val" style={{ fontSize: 20, fontWeight: b.elegido ? 700 : 400, fill: b.elegido ? 'var(--accent)' : 'var(--text-2)' }}>{fDec(b.val, 3)}</text>
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
export const UMBRALES = [...CURVAS.umbral, {
  t: FINAL.umbral, tp: FINAL.tp, fp: FINAL.fp, fn: FINAL.fn, tn: FINAL.tn, b: FINAL.beneficio,
}].sort((a, b) => a.t - b.t)
export const N_TEST = CURVAS.n
export function BeneficioCurva({ t, width = 560, height = 230, elegido }) {
  const pad = { l: 64, r: 14, t: 14, b: 34 }
  const xs = UMBRALES
  const x = (v) => pad.l + ((v - 0.2) / 0.6) * (width - pad.l - pad.r)
  const ymin = -160, ymax = 95
  const y = (v) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (height - pad.t - pad.b)
  const path = xs.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.b).toFixed(1)}`).join(' ')
  const cur = xs.reduce((a, p) => (Math.abs(p.t - t) < Math.abs(a.t - t) ? p : a), xs[0])
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Ahorro neto en la prueba final según el límite de riesgo. El límite 0,57 se fijó previamente en validación.">
      <line x1={pad.l} x2={width - pad.r} y1={y(0)} y2={y(0)} stroke="var(--line-2)" />
      <text x={pad.l - 8} y={y(0)} dy=".35em" textAnchor="end" className="tick">0</text>
      <text x={pad.l - 8} y={pad.t + 6} textAnchor="end" className="tick" style={{ fontSize: 12 }}>más</text>
      <text x={pad.l - 8} y={pad.t + 20} textAnchor="end" className="tick" style={{ fontSize: 12 }}>ahorro ↑</text>
      {[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((v) => <text key={v} x={x(v)} y={height - 12} textAnchor="middle" className="tick">{fDec(v, 1)}</text>)}
      <path d={`${path} L${x(0.8)},${y(0)} L${x(0.2)},${y(0)} Z`} fill="var(--accent-soft)" opacity={0.6} />
      <path className="draw" pathLength="1" d={path} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
      <line x1={x(elegido)} x2={x(elegido)} y1={pad.t} y2={height - pad.b} stroke="var(--text-2)" strokeDasharray="3 4" />
      <text x={x(elegido) + 6} y={height - pad.b - 6} className="val-muted" style={{ fontSize: 12 }}>límite elegido: 0,57</text>
      {(() => {
        const pk = xs.reduce((a, p) => (p.b > a.b ? p : a), xs[0])
        return (
          <g>
            <circle className="anim-loop peak-ring" cx={x(pk.t)} cy={y(pk.b)} r={10} fill="none" stroke="var(--good)" strokeWidth={2} />
            <text x={x(pk.t)} y={y(pk.b) - 16} textAnchor="middle" className="lbl-strong" style={{ fontSize: 12, fill: 'var(--good)' }}>máximo ahorro</text>
          </g>
        )
      })()}
      <text x={x(0.24)} y={y(-120)} className="lbl" style={{ fontSize: 12, fill: 'var(--bad)' }}>las falsas alarmas</text>
      <text x={x(0.24)} y={y(-120) + 15} className="lbl" style={{ fontSize: 12, fill: 'var(--bad)' }}>se comen el ahorro</text>
      <text x={x(0.79)} y={y(-40)} textAnchor="end" className="lbl" style={{ fontSize: 12, fill: 'var(--muted)' }}>se escapan recargos:</text>
      <text x={x(0.79)} y={y(-40) + 15} textAnchor="end" className="lbl" style={{ fontSize: 12, fill: 'var(--muted)' }}>el ahorro cae a cero</text>
      <circle cx={x(cur.t)} cy={y(cur.b)} r={7} fill="var(--text)" stroke="var(--accent)" strokeWidth={3} />
    </svg>
  )
}

/* ───────────────── Recorrido: la pregunta que se bifurca ───────────────── */
export function ForkLine({ width = 1424, height = 300 }) {
  const col = width / 4
  const xs = [0, 1, 2, 3].map((i) => i * col + 12)
  const sp = Math.min(88, height * 0.29), y0 = height / 2, yA = y0 - sp, yB = y0 + sp
  const compact = height < 250, fs = compact ? 17 : 21, fv = compact ? 19 : 24, ot = compact ? 14 : 24, ob = compact ? 30 : 40
  const fx = xs[1] - 110
  const end = width - 14
  const trunk = `M${xs[0]},${y0} L${fx},${y0}`
  const branch = (y) => `C${fx + 60},${y0} ${xs[1] - 40},${y} ${xs[1]},${y} L${end},${y}`
  const ramas = [
    { y: yA, c: 'var(--precio)', d: `${trunk} ${branch(yA)}` },
    { y: yB, c: 'var(--recargo)', d: `${trunk} ${branch(yB)}` },
  ]
  // Fracción del recorrido que corresponde al tronco (para cambiar el color de la partícula al bifurcarse)
  const curva = Math.hypot(xs[1] - fx, yA - y0) * 1.12
  const k = ((fx - xs[0]) / (fx - xs[0] + curva + end - xs[1])).toFixed(3)
  const DUR = 6, N = 5, START = 1.8
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }} aria-label="La pregunta del precio se divide en dos variables en la Entrega 2">
      <defs>
        <filter id="fork-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      {/* Trazos base */}
      <path className="draw" pathLength="1" d={trunk} stroke="var(--text-2)" strokeWidth={4} fill="none" strokeLinecap="round" />
      {ramas.map((r) => (
        <path key={r.y} className="draw" style={{ '--d': 3 }} pathLength="1" d={`M${fx},${y0} ${branch(r.y)}`} stroke={r.c} strokeWidth={6} fill="none" strokeLinecap="round" />
      ))}
      {/* Flujo continuo sobre las ramas */}
      {ramas.map((r) => (
        <path key={`f${r.y}`} className="anim-loop" d={`M${fx},${y0} ${branch(r.y)}`} stroke="var(--bg)" strokeOpacity=".55" strokeWidth={2} fill="none" strokeDasharray="2 22" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" from="0" to="-240" dur="3s" repeatCount="indefinite" />
        </path>
      ))}
      {/* Partículas que viajan del tronco a cada rama */}
      {ramas.map((r, ri) => Array.from({ length: N }, (_, i) => {
        const begin = `${START + (i * DUR) / N + ri * (DUR / N / 2)}s`
        return (
          <g key={`${ri}-${i}`} className="anim-loop" opacity="0">
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.04;0.92;1" dur={`${DUR}s`} begin={begin} repeatCount="indefinite" />
            <animateMotion dur={`${DUR}s`} begin={begin} repeatCount="indefinite" path={r.d} calcMode="linear" />
            <circle r={13} filter="url(#fork-glow)" opacity=".7">
              <animate attributeName="fill" values={`var(--text-2);var(--text-2);${r.c};${r.c}`} keyTimes={`0;${k};${Math.min(1, +k + 0.04)};1`} dur={`${DUR}s`} begin={begin} repeatCount="indefinite" />
            </circle>
            <circle r={6} fill="var(--bg)" />
          </g>
        )
      }))}
      {/* Nodos con pulso */}
      <circle cx={xs[0]} cy={y0} r={11} fill="var(--text-2)" />
      <circle className="anim-loop" cx={xs[0]} cy={y0} r={11} fill="none" stroke="var(--text-2)" strokeWidth={2}>
        <animate attributeName="r" values="11;30" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".6;0" dur="2.4s" repeatCount="indefinite" />
      </circle>
      {xs.slice(1).map((x, i) => (
        <g key={x} className="pop" style={{ '--d': 8 + i * 3 }}>
          {ramas.map((r) => (
            <g key={r.y}>
              <circle className="anim-loop" cx={x} cy={r.y} r={11} fill="none" stroke={r.c} strokeWidth={2}>
                <animate attributeName="r" values="11;28" dur="2.4s" begin={`${START + 0.6 * (i + 1)}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values=".7;0" dur="2.4s" begin={`${START + 0.6 * (i + 1)}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={r.y} r={11} fill={r.c} stroke="var(--bg)" strokeWidth={3.5} />
            </g>
          ))}
        </g>
      ))}
      <text x={xs[0] + 22} y={y0 - 22} className="lbl" style={{ fontSize: compact ? 17 : 20 }}>Solo el precio</text>
      <g className="fade" style={{ '--d': 10 }}>
        <text x={xs[1] + 26} y={yA - ot} className="lbl-strong" style={{ fontSize: fs, fill: 'var(--precio)' }}>PRECIO · parte estructural · regresión</text>
        <text x={xs[1] + 26} y={yB + ob} className="lbl-strong" style={{ fontSize: fs, fill: 'var(--recargo)' }}>RECARGO · parte dinámica · clasificación</text>
        <text x={end} y={yA - ot} textAnchor="end" className="val" style={{ fontSize: fv, fontWeight: 600, fill: 'var(--precio)' }}>USD 1,08 de error</text>
        <text x={end} y={yB + ob} textAnchor="end" className="val" style={{ fontSize: fv, fontWeight: 600, fill: 'var(--recargo)' }}>+USD 56 cada 1.000 cotiz.</text>
      </g>
    </svg>
  )
}

/* ───────────────── Cotizaciones según el aumento aplicado ───────────────── */
const MULT = [['+25%', 11085], ['+50%', 5065], ['+75%', 2420], ['+100%', 2239], ['+150%', 154], ['+200%', 12]]
export function SurgeCollapse({ width = 600 }) {
  return (
    <div role="img" aria-label="Cantidad de cotizaciones por aumento: 25%, 11.085; 50%, 5.065; 75%, 2.420; 100%, 2.239; 150%, 154; 200%, 12. Todos se agrupan como cotizaciones con recargo.">
      <HBar rows={MULT.map(([label, value]) => ({ label, value, text: fInt(value), color: 'var(--recargo)' }))} width={width} rowH={31} labelW={80} valueW={76} barH={18} max={11085} d={3} />
    </div>
  )
}

/* ───────────────── Las 57 columnas por bloque ───────────────── */
export function ColumnBlocks({ blocks, width = 1300 }) {
  const total = blocks.reduce((a, b) => a + b[1], 0)
  const colors = ['var(--mid)', 'var(--eco)', 'var(--prem)', 'var(--neutral)']
  const gap = 4, H = 104, TOP = 66
  const cw = (width - (total - 1) * gap) / total
  // Llave sobre el último bloque (clima), el que domina el dataset
  const last = blocks[blocks.length - 1]
  const x0 = (total - last[1]) * (cw + gap), x1 = width
  const pct = Math.round((last[1] / total) * 100)
  let k = 0
  return (
    <div>
      <svg width={width} height={H + TOP} style={{ overflow: 'visible' }}>
        <g className="fade" style={{ '--d': 14 }}>
          <path d={`M${x0 + 2},${TOP - 24} v-8 H${x1 - 2} v8`} fill="none" stroke="var(--text-2)" strokeWidth={1.5} />
          <text x={(x0 + x1) / 2} y={TOP - 42} textAnchor="middle" className="lbl-strong" style={{ fontSize: 19 }}>
            {pct} % de las columnas son clima
          </text>
        </g>
        {blocks.flatMap(([name, n], bi) => Array.from({ length: n }, () => {
          const i = k++
          return (
            <g key={i} className="pop" style={{ '--d': i * 0.35 }}>
              <rect className="col-wave" style={{ animationDelay: `${1.6 + i * 0.06}s` }} x={i * (cw + gap)} y={TOP} width={cw} height={H} rx={4} fill={colors[bi]} opacity={bi === 3 ? 0.55 : 0.92} />
            </g>
          )
        }))}
      </svg>
      <div style={{ display: 'flex', gap: 52, marginTop: 18 }}>
        {blocks.map(([name, n], bi) => (
          <div key={name} className="fade" style={{ '--d': 10 + bi, display: 'flex', gap: 12, alignItems: 'baseline' }}>
            <i className="sq" style={{ background: colors[bi], opacity: bi === 3 ? 0.55 : 0.92, width: 16, height: 16 }} />
            <span className="num" style={{ fontSize: 32 }}>{n}</span>
            <span className="t2" style={{ fontSize: 20 }}>{name}</span>
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

/* ───────────────── Entrega 1 · primeras pistas (4 paneles) ───────────────── */
const pct1 = (v) => fDec(v, 1) + ' %'
function PanelHead({ t, s }) {
  return (
    <div className="pz-head">
      <div className="pz-t">{t}</div>
      <div className="pz-s">{s}</div>
    </div>
  )
}

// 1 · Tasa de recargo por producto: todos iguales, Shared en cero
function PistaProducto() {
  const max = 10
  return (
    <div className="pz">
      <PanelHead t="% de cotizaciones con recargo, por producto" s="De cada 100 pedidos de cada producto, ¿cuántos vinieron con recargo?" />
      <div className="pz-body" style={{ '--lw': '140px', '--vw': '140px', gap: 16 }}>
        <div className="prow" style={{ marginBottom: -6 }}>
          <span />
          <div className="ptrack" style={{ height: 22, background: 'transparent' }}>
            <div className="pmark fade" style={{ '--d': 10, left: `${(8.2 / max) * 100}%` }}><span>todos en 8,2 %</span></div>
          </div>
          <span />
        </div>
        {PISTA_PRODUCTO.map(([n, v], i) => {
          const cero = v === 0
          return (
            <div key={n} className={'prow' + (cero ? ' prow-key' : '')}>
              <span className="plab">{n}</span>
              <div className={'ptrack' + (cero ? ' ptrack-empty' : '')} style={{ '--bh': '34px' }}>
                {!cero && <div className="pbar growx" style={{ '--d': i * 1.5, '--sd': `${2 + i * 0.12}s`, width: `${(v / max) * 100}%`, background: 'var(--recargo)' }} />}
              </div>
              {cero
                ? <span className="ppill pulse fade" style={{ '--d': 12 }}>0 % · nunca</span>
                : <span className="pval fade" style={{ '--d': 6 + i }}>{pct1(v)}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 2 · Tasa de recargo por zona de origen
function PistaZona() {
  const max = Math.max(...PISTA_ZONA.map((z) => z[1]))
  const last = PISTA_ZONA.length - 1
  return (
    <div className="pz">
      <PanelHead t="% de cotizaciones con recargo, según la zona de origen" s="El barrio donde empieza el viaje cambia mucho la chance de recargo" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 18, flex: 1, minHeight: 0 }}>
        <div className="pz-body" style={{ '--lw': '178px', '--vw': '64px', gap: 7 }}>
          {PISTA_ZONA.map(([n, v], i) => {
            const ext = i === 0 || i === last
            return (
              <div key={n} className="prow">
                <span className="plab" style={{ fontSize: 15, fontWeight: ext ? 600 : 400, color: ext ? 'var(--text)' : undefined }}>{n}</span>
                <div className="ptrack" style={{ '--bh': '22px' }}>
                  <div className="pbar growx" style={{ '--d': i * 0.8, '--sd': `${2 + i * 0.08}s`, width: `${(v / max) * 100}%`, background: `color-mix(in srgb, var(--recargo) ${30 + (70 * v) / max}%, var(--card-2))` }} />
                </div>
                <span className="pval fade" style={{ '--d': 6 + i * 0.6, fontSize: 15, fontWeight: ext ? 700 : 400 }}>{pct1(v)}</span>
              </div>
            )
          })}
        </div>
        <div className="pbracket fade" style={{ '--d': 14 }}>
          <div className="pbracket-line" />
          <div className="pbracket-txt">
            <div className="pbig pulse">7×</div>
            <div>más recargo en <b>Back Bay</b> que en <b>North End</b></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 3 · Correlación de clima y hora con el recargo: todas pegadas al cero
function PistaClima() {
  const W = 760, x0 = 30, x1 = W - 20, axisY = 232
  const x = (r) => x0 + r * (x1 - x0)
  const bands = [[0, 0.1, 'nula'], [0.1, 0.3, 'débil'], [0.3, 0.5, 'moderada'], [0.5, 1, 'fuerte']]
  const dots = [...PISTA_CORR].sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))
  const cx = x(0.006) - 2
  return (
    <div className="pz">
      <PanelHead t="¿Cuánto se relacionan el clima y la hora con el recargo?" s="Correlación de cada variable con tener recargo, en una escala de 0 (ninguna relación) a 1 (relación total)" />
      <svg width={W} height={300} style={{ overflow: 'visible', marginTop: 8 }}>
        {bands.map(([a, b, n], i) => (
          <g key={n} className="fade" style={{ '--d': 2 + i }}>
            <rect x={x(a) + (i ? 2 : 0)} y={axisY} width={x(b) - x(a) - 2} height={14} rx={3} fill={`color-mix(in srgb, var(--text-2) ${12 + i * 22}%, transparent)`} />
            <text x={(x(a) + x(b)) / 2} y={axisY + 40} textAnchor="middle" className="lbl" style={{ fontSize: 15 }}>{n}</text>
          </g>
        ))}
        {[0, 0.1, 0.3, 0.5, 1].map((t) => (
          <text key={t} x={x(t)} y={axisY + 66} textAnchor="middle" className="val-muted" style={{ fontSize: 13 }}>{fDec(t, t % 1 ? 1 : 0)}</text>
        ))}
        {/* las 13 variables caen al cero */}
        {dots.map(([n, r], i) => (
          <circle key={n} className="pdot" style={{ '--from': `${180 + ((i * 137) % 480)}px`, '--d': i }} cx={cx} cy={axisY - 14 - i * 13.5} r={6} fill={i === dots.length - 1 ? 'var(--recargo)' : 'var(--neutral)'}>
            <title>{`${n}: r = ${fDec(r, 4)}`}</title>
          </circle>
        ))}
        <ellipse className="pring" cx={cx} cy={axisY - 14 - 6 * 13.5} rx={20} ry={104} fill="none" stroke="var(--recargo)" strokeWidth={2} strokeDasharray="6 6" />
        <g className="fade" style={{ '--d': 18 }}>
          <path d={`M${cx + 30},${axisY - 110} C${cx + 60},${axisY - 110} ${cx + 70},${axisY - 130} ${cx + 96},${axisY - 130}`} fill="none" stroke="var(--recargo)" strokeWidth={1.6} />
          <text x={cx + 104} y={axisY - 136} className="lbl-strong" style={{ fontSize: 20 }}>Las 13 variables de clima y hora están acá</text>
          <text x={cx + 104} y={axisY - 110} className="lbl" style={{ fontSize: 17 }}>Ninguna supera |r| = 0,006: es como si no existieran</text>
        </g>
      </svg>
      <div className="pchips fade" style={{ '--d': 20 }}>{PISTA_CORR.map(([n]) => n).join(' · ')}</div>
    </div>
  )
}

// 4 · ROC-AUC de cada combinación de variables, contra el azar
function PistaAuc() {
  const lo = 0.5, hi = 0.8
  const w = (v) => `${((v - lo) / (hi - lo)) * 100}%`
  return (
    <div className="pz">
      <PanelHead t="¿Qué tan bien se puede anticipar el recargo con cada grupo de variables?" s="ROC-AUC: 0,50 es lo mismo que tirar una moneda; 1 sería acertar siempre" />
      <div className="pz-body" style={{ '--lw': '250px', '--vw': '76px', gap: 34, paddingTop: 10 }}>
        {PISTA_AUC.map((r, i) => {
          const azar = r.v <= lo
          return (
            <div key={r.t} className="prow">
              <span className="plab" style={{ textAlign: 'left' }}>
                <b style={{ display: 'block', color: 'var(--text)', fontSize: 18 }}>{r.t}</b>
                <span style={{ fontSize: 14 }}>{r.s}</span>
              </span>
              <div className="ptrack" style={{ '--bh': '42px' }}>
                {azar
                  ? <div className="pazar fade" style={{ '--d': 6 }}><span className="pcoin">½</span>igual que tirar una moneda</div>
                  : <div className="pbar growx" style={{ '--d': 4 + i * 4, '--sd': `${2.4 + i * 0.3}s`, width: w(r.v), background: 'var(--recargo)' }} />}
              </div>
              <span className="pval fade" style={{ '--d': 8 + i * 3, fontSize: 22, fontWeight: 600, color: azar ? 'var(--muted)' : 'var(--recargo)' }}>{fDec(r.v, 2)}</span>
            </div>
          )
        })}
        <div className="prow" style={{ marginTop: -18 }}>
          <span />
          <div className="paxis">
            {[0.5, 0.6, 0.7, 0.8].map((t) => <span key={t} style={{ left: w(t) }}>{fDec(t, 2)}{t === 0.5 ? ' · azar' : ''}</span>)}
          </div>
          <span />
        </div>
        <div className="pnote fade" style={{ '--d': 16 }}>Sumar clima y hora a la ruta mejora apenas <b>+0,01</b>.</div>
      </div>
    </div>
  )
}

const PISTA_PANELES = [PistaProducto, PistaZona, PistaClima, PistaAuc]
export function PistaPanel({ step }) {
  const P = PISTA_PANELES[step]
  return <P key={step} />
}

/* ───────────────── ETL: de cuántas filas partimos y con cuántas nos quedamos ───────────────── */
export function LimpiezaFlow({ width = 790 }) {
  const crudo = ETL_PASOS[0].valor, limpio = ETL_PASOS[ETL_PASOS.length - 1].valor
  const quitados = ETL_PASOS.filter((p) => p.tipo !== 'total')
  const totalQuitado = crudo - limpio
  const W = width, barY = 34, barH = 54
  const xk = (limpio / crudo) * W
  // los tramos chicos se dibujan con un ancho mínimo para que se vean
  const mins = [0, 5, 4]
  let xr = W
  const segs = [...quitados].reverse().map((q, ri) => {
    const i = quitados.length - 1 - ri
    const w = i === 0 ? xr - xk : Math.max(mins[i], (-q.valor / crudo) * W)
    xr -= w
    return { ...q, i, x: xr, w }
  }).reverse()
  return (
    <div className="lf">
      <div className="lf-nums">
        <div className="rv" style={{ '--d': 2 }}>
          <div className="label">Empezamos con</div>
          <div className="num lf-big" style={{ color: 'var(--text-2)' }}><Num value={crudo} delay={300} /></div>
          <div className="t2 lf-cap">cotizaciones (dataset crudo de Kaggle)</div>
        </div>
        <div className="lf-arrow fade" style={{ '--d': 8 }}>→</div>
        <div className="rv" style={{ '--d': 6 }}>
          <div className="label" style={{ color: 'var(--accent)' }}>Nos quedamos con</div>
          <div className="num lf-big" style={{ color: 'var(--accent)' }}><Num value={limpio} delay={1500} /></div>
          <div className="t2 lf-cap">cotizaciones limpias · <b style={{ color: 'var(--text)' }}>el {fDec((limpio / crudo) * 100, 1)} %</b></div>
        </div>
      </div>
      <svg width={W} height={196} style={{ overflow: 'visible', marginTop: 30 }}>
        <defs>
          <linearGradient id="lf-shine" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="160" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".45" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            <animateTransform attributeName="gradientTransform" type="translate" from="-200 0" to={`${W + 40} 0`} dur="3.2s" begin="3s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
        {/* la parte que se conserva: aparece gris y se vuelve dorada */}
        <rect className="growx lf-keep" x={0} y={barY} width={xk} height={barH} rx={6} />
        <rect x={0} y={barY} width={xk} height={barH} rx={6} fill="url(#lf-shine)" className="anim-loop" />
        {/* hueco que dejan las filas eliminadas */}
        <rect className="lf-hole anim-loop" x={xk + 1} y={barY + 1} width={W - xk - 2} height={barH - 2} rx={6} fill="none" stroke="var(--bad)" strokeWidth={1.5} strokeDasharray="5 5" />
        {/* tramos eliminados: arrancan en la barra y se desprenden hacia abajo */}
        {segs.map((sg) => (
          <rect key={sg.label} className="lf-drop" style={{ '--d': sg.i }} x={sg.x} y={barY} width={sg.w} height={barH} rx={3} fill="var(--bad)" />
        ))}
        {/* llaves */}
        <g className="fade" style={{ '--d': 22 }}>
          <path d={`M2,${barY - 10} v-8 H${xk - 2} v8`} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
          <text x={xk / 2} y={barY - 26} textAnchor="middle" className="lbl-strong" style={{ fontSize: 16, fill: 'var(--accent)' }}>se conserva el {fDec((limpio / crudo) * 100, 1)} %</text>
        </g>
        <g className="fade" style={{ '--d': 26 }}>
          <path d={`M${xk + 2},${barY + barH + 66} v8 H${W - 2} v-8`} fill="none" stroke="var(--bad)" strokeWidth={1.5} />
          <text x={W} y={barY + barH + 98} textAnchor="end" className="lbl-strong" style={{ fontSize: 16, fill: 'var(--bad)' }}>se eliminan {fInt(totalQuitado)} · {fDec((totalQuitado / crudo) * 100, 1)} %</text>
        </g>
      </svg>
      <div className="lf-list">
        {quitados.map((q, i) => (
          <div key={q.label} className={'lf-row rv' + (i === 0 ? ' key' : '')} style={{ '--d': 18 + i * 2 }}>
            <span className="num lf-val">−{fInt(-q.valor)}</span>
            <span><b>{q.label}</b><span className="muted"> · {q.nota}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────────── Columnas: de 57 a 27 ───────────────── */
const COL_GRUPOS = [
  { n: 16, t: 'se conservan', c: 'var(--precio)', keep: true },
  { n: 31, t: 'clima repetido o sin relación', c: 'var(--neutral)' },
  { n: 6, t: 'hora en UTC', c: 'var(--neutral)' },
  { n: 2, t: 'coordenadas del clima', c: 'var(--neutral)' },
  { n: 2, t: 'copias exactas', c: 'var(--neutral)' },
]
export function ColumnasFlow({ width = 1360 }) {
  const numW = 120, unit = (width - numW) / 57, bw = unit - 4, bh = 64
  const y1 = 34, y2 = 262
  let k = 0
  const grupos = COL_GRUPOS.map((g) => { const s = k; k += g.n; return { ...g, s } })
  const cx = (g) => (g.s + g.n / 2) * unit - 2
  const lblY = y1 + bh + 26
  const quitados = grupos.filter((g) => !g.keep)
  return (
    <svg width={width} height={y2 + bh + 70} style={{ overflow: 'visible' }}>
      {/* fila Antes */}
      <text x={0} y={y1 - 14} className="label fade" style={{ '--d': 1, fontSize: 14, fill: 'var(--muted)', letterSpacing: '.1em' }}>ANTES · DATASET CRUDO</text>
      <text x={width} y={y1 + bh / 2} dy=".35em" textAnchor="end" className="num fade" style={{ '--d': 6, fontSize: 46, fill: 'var(--text-2)' }}>57</text>
      {grupos.flatMap((g) => Array.from({ length: g.n }, (_, j) => {
        const i = g.s + j
        return (
          <g key={`a${i}`} className="pop" style={{ '--d': i * 0.3 }}>
            <rect className={g.keep ? undefined : 'cf-out'} style={g.keep ? undefined : { animationDelay: `${2.6 + (i - 16) * 0.025}s` }} x={i * unit} y={y1} width={bw} height={bh} rx={3} fill={g.c} />
          </g>
        )
      }))}
      {/* motivos de lo eliminado */}
      <g className="fade" style={{ '--d': 24 }}>
        <path d={`M${16 * unit},${y1 + bh + 8} v6 H${57 * unit - 4} v-6`} fill="none" stroke="var(--bad)" strokeWidth={1.5} />
        <text x={(16 * unit + 57 * unit) / 2} y={y1 + bh + 34} textAnchor="middle" className="lbl-strong" style={{ fontSize: 17, fill: 'var(--bad)' }}>41 eliminadas</text>
        {quitados.map((g, i) => {
          const lvl = i < 2 ? 0 : i - 1
          const ty = lblY + 34 + lvl * 22
          const small = g.n <= 2
          return (
            <g key={g.t}>
              {small && <line x1={cx(g)} x2={cx(g)} y1={y1 + bh + 14} y2={ty - 14} stroke="var(--line-2)" />}
              <text x={small ? cx(g) + 6 : cx(g)} y={ty} textAnchor={small ? 'end' : 'middle'} className="lbl" style={{ fontSize: 15 }} dx={small ? -10 : 0}>
                <tspan className="num" style={{ fontWeight: 600, fill: 'var(--text)' }}>{g.n}</tspan> {g.t}
              </text>
            </g>
          )
        })}
      </g>
      {/* flecha */}
      <g className="fade" style={{ '--d': 30 }}>
        <path className="cf-arrow" d={`M${8 * unit},${y1 + bh + 12} V${y2 - 32}`} stroke="var(--precio)" strokeWidth={2} strokeDasharray="4 6" fill="none" />
        <path d={`M${8 * unit - 7},${y2 - 40} l7,10 l7,-10`} stroke="var(--precio)" strokeWidth={2} fill="none" />
      </g>
      {/* fila Después */}
      <text x={0} y={y2 - 14} className="label fade" style={{ '--d': 30, fontSize: 14, fill: 'var(--accent)', letterSpacing: '.1em' }}>DESPUÉS · DATASET LIMPIO</text>
      <text x={width} y={y2 + bh / 2} dy=".35em" textAnchor="end" className="num cf-in" style={{ animationDelay: '3.4s', fontSize: 46, fill: 'var(--accent)' }}>27</text>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={`k${i}`} className="cf-move" style={{ '--dy': `${y1 - y2}px`, animationDelay: `${3 + i * 0.03}s` }} x={i * unit} y={y2} width={bw} height={bh} rx={3} fill="var(--precio)" />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <g key={`n${i}`} className="cf-new" style={{ animationDelay: `${3.8 + i * 0.09}s` }}>
          <rect className="col-wave" style={{ animationDelay: `${5 + i * 0.12}s` }} x={(16 + i) * unit} y={y2} width={bw} height={bh} rx={3} fill="var(--accent)" />
        </g>
      ))}
      <g className="cf-in" style={{ animationDelay: '4.6s' }}>
        <text x={8 * unit} y={y2 + bh + 30} textAnchor="middle" className="lbl" style={{ fontSize: 15 }}><tspan className="num" style={{ fontWeight: 600, fill: 'var(--precio)' }}>16</tspan> conservadas</text>
        <text x={(16 + 5.5) * unit} y={y2 + bh + 30} textAnchor="middle" className="lbl" style={{ fontSize: 15 }}><tspan className="num" style={{ fontWeight: 600, fill: 'var(--accent)' }}>11</tspan> nuevas</text>
      </g>
    </svg>
  )
}

/* ───────────────── Precio: el mismo error de USD 2 pesa distinto ───────────────── */
export function ErrorRelativo({ width = 620 }) {
  const unit = (width - 150) / 42, bh = 38, err = 2
  const viajes = [{ p: 10, y: 30 }, { p: 40, y: 118 }]
  return (
    <svg width={width} height={190} style={{ overflow: 'visible' }}>
      <defs>
        <pattern id="err-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="var(--bad)" /><rect width="4" height="10" fill="#fff" opacity=".3" />
          <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="10 0" dur="0.8s" additive="sum" repeatCount="indefinite" />
        </pattern>
      </defs>
      {viajes.map((v, i) => {
        const w = v.p * unit
        const pct = Math.round((err / v.p) * 100)
        return (
          <g key={v.p}>
            <text x={0} y={v.y - 10} className="lbl" style={{ fontSize: 15 }}>Viaje de <tspan style={{ fontWeight: 700, fill: 'var(--text)' }}>USD {v.p}</tspan></text>
            <rect className="growx" style={{ '--d': 2 + i * 4 }} x={0} y={v.y} width={w} height={bh} rx={5} fill="color-mix(in srgb, var(--precio) 30%, var(--card))" />
            <g className="err-in" style={{ animationDelay: `${1.3 + i * 0.5}s` }}>
              <rect className="err-chunk" x={w - err * unit} y={v.y - 4} width={err * unit} height={bh + 8} rx={4} fill="url(#err-stripes)" />
            </g>
            <g className="fade" style={{ '--d': 20 + i * 6 }}>
              <text x={w + 16} y={v.y + bh / 2} dy=".35em" className="num" style={{ fontSize: 34, fontWeight: 600, fill: 'var(--bad)' }}>{pct} %</text>
              <text x={w + 16 + (pct > 9 ? 92 : 70)} y={v.y + bh / 2} dy=".35em" className="lbl" style={{ fontSize: 14 }}>del precio</text>
            </g>
          </g>
        )
      })}
      <g className="fade" style={{ '--d': 16 }}>
        <rect x={0} y={172} width={14} height={14} rx={2} fill="url(#err-stripes)" />
        <text x={22} y={184} className="lbl" style={{ fontSize: 14 }}>el mismo error de <tspan style={{ fontWeight: 700, fill: 'var(--bad)' }}>USD 2</tspan> en los dos viajes</text>
      </g>
    </svg>
  )
}

/* ───────────────── Recargo: todos los aumentos se agrupan en "sí" ───────────────── */
const AUMENTOS = [['+25%', 11085], ['+50%', 5065], ['+75%', 2420], ['+100%', 2239], ['+150%', 154], ['+200%', 12]]
export function RecargoSiNo({ width = 620 }) {
  const labelW = 64, maxW = 190, rowH = 30, top = 8
  const max = AUMENTOS[0][1]
  const yes = { x: width - 190, y: top + 6, w: 190, h: rowH * 6 - 12 }
  const ymid = yes.y + yes.h / 2
  const total = AUMENTOS.reduce((a, r) => a + r[1], 0)
  return (
    <svg width={width} height={top + rowH * 6 + 8} style={{ overflow: 'visible' }}>
      {AUMENTOS.map(([l, v], i) => {
        const y = top + i * rowH + rowH / 2
        const w = Math.max(3, (v / max) * maxW)
        return (
          <g key={l}>
            <text x={labelW - 10} y={y} dy=".35em" textAnchor="end" className="val" style={{ fontSize: 15 }}>{l}</text>
            <rect className="growx" style={{ '--d': i }} x={labelW} y={y - 9} width={w} height={18} rx={3} fill="var(--recargo)" />
            <text className="fade" style={{ '--d': 6 + i }} x={labelW + w + 8} y={y} dy=".35em" fill="var(--muted)" fontFamily="var(--mono)" fontSize={13}>{fInt(v)}</text>
            <path className="sino-flow anim-loop" style={{ animationDelay: `${i * 0.15}s` }} d={`M${labelW + maxW + 62},${y} C${yes.x - 60},${y} ${yes.x - 60},${ymid} ${yes.x - 4},${ymid}`} fill="none" stroke="var(--recargo)" strokeWidth={1.6} strokeDasharray="3 7" />
          </g>
        )
      })}
      <g className="pop" style={{ '--d': 16 }}>
        <rect className="sino-yes" x={yes.x} y={yes.y} width={yes.w} height={yes.h} rx={14} fill="var(--recargo)" />
        <text x={yes.x + yes.w / 2} y={ymid - 18} textAnchor="middle" style={{ fontFamily: 'var(--serif)', fontSize: 48, fill: '#fff' }}>“Sí”</text>
        <text x={yes.x + yes.w / 2} y={ymid + 22} textAnchor="middle" fill="#fff" fontFamily="var(--mono)" fontSize={16} fontWeight={600}>{fInt(total)}</text>
        <text x={yes.x + yes.w / 2} y={ymid + 44} textAnchor="middle" fill="#fff" opacity=".85" fontFamily="var(--sans)" fontSize={13}>cotizaciones con recargo</text>
      </g>
    </svg>
  )
}

/* ───────────────── Medidor circular (porcentaje de 0 a 100) ───────────────── */
export function Gauge({ value, label, color = 'var(--precio)', size = 150, d = 0, muted = false }) {
  const r = size / 2 - 12, c = size / 2
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="gauge" style={{ width: size }}>
      <svg width={size} height={size}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="color-mix(in srgb, var(--text-2) 14%, transparent)" strokeWidth={14} />
        {v > 0 && <circle className="gauge-arc" style={{ '--v': v, '--d': d }} cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" pathLength="100" strokeDasharray={`${v} 100`} transform={`rotate(-90 ${c} ${c})`} />}
        {v > 2 && <circle className="gauge-glint anim-loop" style={{ '--v': v, animationDelay: `${2 + d * 0.15}s` }} cx={c} cy={c} r={r} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth={6} strokeLinecap="round" pathLength="100" strokeDasharray="1.5 98.5" transform={`rotate(-90 ${c} ${c})`} />}
        <text x={c} y={c} dy=".35em" textAnchor="middle" className="num" style={{ fontSize: size * 0.16, fontWeight: 600, fill: muted ? 'var(--muted)' : color }}>{fDec(value, value % 1 ? 1 : 0)}%</text>
      </svg>
      <div className="gauge-lbl" style={muted ? { color: 'var(--muted)' } : null}>{label}</div>
    </div>
  )
}

/* ───────────────── Recargo con lluvia vs sin lluvia ───────────────── */
export function LluviaVsSeco({ lluvia, seco }) {
  const max = 0.1
  const items = [
    { k: 'lluvia', t: 'Con lluvia', v: lluvia },
    { k: 'seco', t: 'Sin lluvia', v: seco },
  ]
  return (
    <div className="lvs">
      {items.map((it, i) => (
        <div key={it.k} className={'lvs-card rv lvs-' + it.k} style={{ '--d': 4 + i * 2 }}>
          <div className="lvs-sky" aria-hidden>
            {it.k === 'lluvia'
              ? <>
                  <span className="lvs-cloud" />
                  {Array.from({ length: 9 }, (_, j) => <i key={j} className="lvs-drop anim-loop" style={{ left: `${14 + j * 9}%`, animationDelay: `${(j * 0.37) % 1.2}s` }} />)}
                </>
              : <span className="lvs-sun"><span className="lvs-rays anim-loop" /></span>}
          </div>
          <div className="lvs-t">{it.t}</div>
          <div className="num lvs-v">{fDec(it.v * 100, 1)} %</div>
          <div className="lvs-bar"><div className="growx" style={{ '--d': 8 + i * 2, width: `${(it.v / max) * 100}%` }} /></div>
          <div className="lvs-s">de las cotizaciones con recargo</div>
        </div>
      ))}
    </div>
  )
}

/* ───────────────── Recargo por hora del día (casi plano) ───────────────── */
export function HoraLinea({ width = 860, height = 420 }) {
  const pad = { l: 46, r: 20, t: 26, b: 40 }, maxY = 12
  const x = (h) => pad.l + (h / 23) * (width - pad.l - pad.r)
  const y = (v) => pad.t + (1 - v / maxY) * (height - pad.t - pad.b)
  const d = RECARGO_HORA.map((v, h) => `${h ? 'L' : 'M'}${x(h)},${y(v)}`).join(' ')
  const lo = Math.min(...RECARGO_HORA), hi = Math.max(...RECARGO_HORA)
  const hMax = RECARGO_HORA.indexOf(hi), hMin = RECARGO_HORA.indexOf(lo)
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {[0, 2, 4, 6, 8, 10, 12].map((t) => (
        <g key={t} className="axis"><line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} /><text x={pad.l - 10} y={y(t)} dy=".35em" textAnchor="end">{t} %</text></g>
      ))}
      {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => <text key={h} x={x(h)} y={height - 12} textAnchor="middle" className="tick">{h} h</text>)}
      <rect className="fade" style={{ '--d': 10 }} x={pad.l} y={y(hi)} width={width - pad.l - pad.r} height={y(lo) - y(hi)} fill="var(--accent-soft)" />
      <text className="fade" style={{ '--d': 12, fontSize: 15, fill: 'var(--recargo)' }} x={width - pad.r - 6} y={y(hi) - 8} textAnchor="end" fontWeight="600">todo el día se mueve entre {fDec(lo, 1)} % y {fDec(hi, 1)} %</text>
      <path className="draw" pathLength="1" d={d} fill="none" stroke="var(--recargo)" strokeWidth={3.5} strokeLinejoin="round" />
      {RECARGO_HORA.map((v, h) => <circle key={h} className="pop" style={{ '--d': 6 + h * 0.4 }} cx={x(h)} cy={y(v)} r={h === hMax || h === hMin ? 7 : 4} fill="var(--recargo)" stroke="var(--card)" strokeWidth={2} />)}
      <g className="fade" style={{ '--d': 16 }}>
        <text x={x(hMax)} y={y(hi) - 16} textAnchor="middle" className="lbl-strong" style={{ fontSize: 15 }}>máx. {fDec(hi, 1)} % · 8 h</text>
        <text x={x(hMin)} y={y(lo) + 26} textAnchor="middle" className="lbl-strong" style={{ fontSize: 15 }}>mín. {fDec(lo, 1)} % · 11 h</text>
      </g>
      <g className="anim-loop">
        <circle r={16} fill="var(--recargo)" opacity=".22"><animateMotion dur="8s" begin="2s" repeatCount="indefinite" path={d} /></circle>
        <circle r={7} fill="var(--card)" stroke="var(--recargo)" strokeWidth={3}><animateMotion dur="8s" begin="2s" repeatCount="indefinite" path={d} /></circle>
      </g>
    </svg>
  )
}

/* Rango del recargo: según la zona vs según la hora, en la misma escala */
export function RangoCompare({ width = 380 }) {
  const max = 12, padL = 6, padR = 6
  const x = (v) => `${padL + (v / max) * (100 - padL - padR)}%`
  const items = [
    { t: 'Según la zona de salida', lo: 1.5, loN: 'North End', hi: 11.2, hiN: 'Back Bay', c: 'var(--recargo)', d: 4 },
    { t: 'Según la hora del día', lo: 7.0, loN: '11 h', hi: 9.6, hiN: '8 h', c: 'var(--neutral)', d: 10 },
  ]
  return (
    <div className="rango" style={{ width }}>
      {items.map((it) => (
        <div key={it.t} className="rango-item rv" style={{ '--d': it.d }}>
          <div className="rango-head">
            <span className="rango-t">{it.t}</span>
            <span className="num rango-dif" style={{ color: it.c === 'var(--neutral)' ? 'var(--text-2)' : it.c }}>{fDec(it.hi - it.lo, 1)} puntos</span>
          </div>
          <div className="rango-track">
            <div className="rango-bar growx" style={{ '--d': it.d + 2, left: x(it.lo), width: `calc(${x(it.hi)} - ${x(it.lo)})`, background: it.c }} />
            <span className="rango-dot pop" style={{ '--d': it.d + 1, left: x(it.lo), borderColor: it.c }} />
            <span className="rango-dot pop" style={{ '--d': it.d + 5, left: x(it.hi), borderColor: it.c }} />
          </div>
          <div className="rango-ends">
            <span style={{ left: x(it.lo) }}><b className="num">{fDec(it.lo, 1)} %</b>{it.loN}</span>
            <span style={{ left: x(it.hi) }}><b className="num">{fDec(it.hi, 1)} %</b>{it.hiN}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ───────────────── Primeras reglas del árbol de decisión, en palabras ───────────────── */
const ARBOL = [
  { id: 0, lv: 0, pos: 0.5, q: 'Ruta > 6,3 %', n: 100, c: null, k: 'ruta' },
  { id: 1, lv: 1, pos: 0.25, q: 'Ruta > 3,4 %', n: 36.1, c: 'no', k: 'ruta', p: 0, e: 'no' },
  { id: 2, lv: 1, pos: 0.75, q: 'Ruta > 9,4 %', n: 63.9, c: 'si', k: 'ruta', p: 0, e: 'sí' },
  { id: 3, lv: 2, pos: 0.125, q: 'Distancia ≤ 3,2 mi', n: 18.0, c: 'no', k: 'dist', p: 1, e: 'no' },
  { id: 4, lv: 2, pos: 0.375, q: 'Ruta > 4,8 %', n: 18.1, c: 'no', k: 'ruta', p: 1, e: 'sí' },
  { id: 5, lv: 2, pos: 0.625, q: 'Distancia ≤ 5,2 mi', n: 18.3, c: 'no', k: 'dist', p: 2, e: 'no' },
  { id: 6, lv: 2, pos: 0.875, q: 'Ruta > 13 %', n: 45.6, c: 'si', k: 'ruta', p: 2, e: 'sí' },
]
export function ArbolReglas({ width = 760 }) {
  const nw = 166, nh = 66, gapY = 128, top = 10
  const X = (n) => n.pos * width, Y = (n) => top + n.lv * gapY
  const edge = (n) => { const p = ARBOL[n.p]; return `M${X(p)},${Y(p) + nh} C${X(p)},${Y(p) + nh + 40} ${X(n)},${Y(n) - 40} ${X(n)},${Y(n)}` }
  const camino = (leaf) => {
    const a = ARBOL[leaf], b = ARBOL[a.p], r = ARBOL[0]
    const seg = (p, q) => `C${X(p)},${Y(p) + nh + 40} ${X(q)},${Y(q) - 40} ${X(q)},${Y(q)}`
    return `M${X(r)},${Y(r) + nh / 2} L${X(r)},${Y(r) + nh} ${seg(r, b)} L${X(b)},${Y(b) + nh} ${seg(b, a)} L${X(a)},${Y(a) + nh / 2}`
  }
  return (
    <svg width={width} height={top + 2 * gapY + nh + 10} style={{ overflow: 'visible' }}>
      {ARBOL.filter((n) => n.lv > 0).map((n) => (
        <g key={'e' + n.id}>
          <path className="draw" style={{ '--d': 2 + n.lv * 3 }} pathLength="1" d={edge(n)} fill="none" stroke="var(--line-2)" strokeWidth={2} />
          <text className="fade" style={{ '--d': 6 + n.lv * 3 }} x={(X(n) + X(ARBOL[n.p])) / 2 + (n.pos < ARBOL[n.p].pos ? -14 : 14)} y={Y(n) - 34} textAnchor="middle" fontFamily="var(--mono)" fontSize={13} fill="var(--muted)">{n.e}</text>
        </g>
      ))}
      {[3, 6, 4, 5].map((leaf, i) => (
        <circle key={leaf} r={7} fill="var(--recargo)" stroke="var(--card)" strokeWidth={2} className="anim-loop" opacity="0">
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="2.4s" begin={`${2.4 + i * 2.4}s;arbol${leaf}.end+${(4 - 1) * 2.4}s`} id={`arbol${leaf}`} />
          <animateMotion dur="2.4s" begin={`${2.4 + i * 2.4}s;arbol${leaf}.end+${(4 - 1) * 2.4}s`} path={camino(leaf)} />
        </circle>
      ))}
      {ARBOL.map((n) => {
        const col = n.k === 'ruta' ? 'var(--recargo)' : 'var(--neutral)'
        return (
          <g key={n.id} className="pop" style={{ '--d': 1 + n.lv * 4 + (n.id % 2) }}>
            <rect className={n.k === 'ruta' ? 'arbol-ruta' : undefined} x={X(n) - nw / 2} y={Y(n)} width={nw} height={nh} rx={12} fill="var(--card)" stroke={col} strokeWidth={n.k === 'ruta' ? 2.5 : 1.5} />
            <rect x={X(n) - nw / 2} y={Y(n)} width={6} height={nh} rx={3} fill={col} />
            <text x={X(n)} y={Y(n) + 27} textAnchor="middle" className="lbl-strong" style={{ fontSize: 16 }}>{n.q}</text>
            <text x={X(n)} y={Y(n) + 48} textAnchor="middle" fontFamily="var(--mono)" fontSize={11.5} fill="var(--text-2)">
              {fDec(n.n, n.n % 1 ? 1 : 0)} %{n.c ? ' · ' : ' de las filas'}{n.c && <tspan fill={n.c === 'si' ? 'var(--recargo)' : 'var(--muted)'} fontWeight="700">{n.c === 'si' ? 'con recargo' : 'sin recargo'}</tspan>}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
