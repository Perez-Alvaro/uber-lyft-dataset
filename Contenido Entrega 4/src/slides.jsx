import { useMemo, useState } from 'react'
import { Head, Num, Track, Figura, Brand, useSteps, useDeck, fInt, fDec, fPct, fUsd } from './lib/ui.jsx'
import { findImg } from './data/gallery.js'
import {
  HBar, Dumbbell, Waterfall, ZoneMap, FareCompare, tarifaEn, Balanceo,
  KMeansScatter, Curvas, BeneficioCurva, UMBRALES, N_TEST, ForkLine, SurgeCollapse,
  ColumnBlocks, UtcBig, AsymBars, Donut, ActorIcon, PistaPanel, PistaClima, LimpiezaFlow, MatrizFN, TablaModelos, ColumnasFlow, ErrorRelativo, RecargoSiNo, HusoHorario, MultiplicadorBinario, WaffleSiNo, PrecioLog, PrecioHistDuo, MultiplicadorFlujo, BalanceoGrande, Gauge, LluviaVsSeco, HoraLinea, RangoCompare, ArbolReglas,
} from './components/charts.jsx'
import {
  DATASET, PLATAFORMAS, RECARGO, ZONAS, PESO_FACTORES, REGRESION, REGRESION_SIN_SURGE, REGRESION_DATOS, IMPORTANCIA_RECARGO,
  CLASIFICACION, FINAL, SIEMPRE_NO, NIVELES, EQUIPO, PRECIO_PRODUCTO, COLUMNAS, MATRIZ_FN, SENS_FN, MULT_TOTAL, PRECIO_STATS,
} from './data/metrics.js'

// Secciones de la barra de progreso
export const ENTREGAS = {
  0: 'Intro',
  1: 'Dominio',
  2: 'ETL',
  3: 'Modelado',
  4: 'Conclusión',
}
const E = (n) => ENTREGAS[n]
const B = ({ children, c }) => <b style={{ color: c || 'var(--text)', fontWeight: 600 }}>{children}</b>
const Big = ({ children, c, size = 80, d = 4 }) => <div className="num rv" style={{ '--d': d, fontSize: size, lineHeight: 1, color: c }}>{children}</div>
const Side = ({ children, gap = 30 }) => <div style={{ display: 'flex', flexDirection: 'column', gap, justifyContent: 'center' }}>{children}</div>
const Say = ({ children, d = 5, size = 23, style }) => <p className="say rv" style={{ '--d': d, fontSize: size, ...style }}>{children}</p>

/* ═════════════ Portada ═════════════ */
// Desplazamiento de etiquetas que se pisan entre sí: [dx, dy, anchor]
const LBL = { Fenway: [10, 22], 'South Station': [10, 22], 'West End': [-10, 5, 'end'] }
const RUTAS = [[0, 6], [2, 7], [4, 3], [1, 8], [5, 11], [3, 10], [0, 9], [2, 6], [4, 0], [7, 11], [1, 3]]
function MapaRutas({ scale = 1.05, w = 720, h = 560, fit = false }) {
  const LON0 = -71.114, LAT1 = 42.3705, KX = 9000 * scale, KY = 12180 * scale
  let pts = ZONAS.map((z) => ({ ...z, x: (z.lon - LON0) * KX, y: (LAT1 - z.lat) * KY }))
  if (fit) {
    // Encaja el mapa en la caja (dejando lugar a la derecha para las etiquetas)
    const pad = { l: 16, r: 140, t: 40, b: 40 }
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y)
    const x0 = Math.min(...xs), y0 = Math.min(...ys)
    const bw = Math.max(...xs) - x0, bh = Math.max(...ys) - y0
    const s = Math.min((w - pad.l - pad.r) / bw, (h - pad.t - pad.b) / bh)
    const ox = pad.l + (w - pad.l - pad.r - bw * s) / 2, oy = pad.t + (h - pad.t - pad.b - bh * s) / 2
    pts = pts.map((p) => ({ ...p, x: ox + (p.x - x0) * s, y: oy + (p.y - y0) * s }))
  }
  return (
    <svg width={w} height={h} aria-hidden>
      <defs><radialGradient id="glow"><stop offset="0" stopColor="var(--accent)" stopOpacity=".5" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></radialGradient></defs>
      {RUTAS.map(([a, b], i) => {
        const p = pts[a], q = pts[b]
        const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2 - Math.abs(p.x - q.x) * 0.35 - 20
        return <path key={i} d={`M${p.x},${p.y} Q${mx},${my} ${q.x},${q.y}`} fill="none" stroke="var(--accent)" strokeOpacity=".6" strokeWidth={1.6} strokeDasharray="5 9" style={{ animation: `flow ${5 + (i % 4)}s linear infinite`, animationDelay: `${-i}s` }} />
      })}
      {pts.map((p, i) => (
        <g key={p.zona} className="pop" style={{ '--d': i }}>
          <circle cx={p.x} cy={p.y} r={12 + p.tasa * 160} fill="url(#glow)" />
          <circle cx={p.x} cy={p.y} r={5} fill="var(--accent)" />
          <text x={p.x + (LBL[p.zona]?.[0] ?? 10)} y={p.y + (LBL[p.zona]?.[1] ?? -10)} textAnchor={LBL[p.zona]?.[2] || 'start'} className="val-muted" style={{ fontSize: 13, fontFamily: 'var(--sans)' }}>{p.zona}</text>
        </g>
      ))}
      <style>{`@keyframes flow { to { stroke-dashoffset: -140; } }`}</style>
    </svg>
  )
}
function Portada() {
  return (
    <div className="slide free portada">
      <div className="portada-mapa" aria-hidden><MapaRutas fit w={1300} h={760} /></div>
      <div className="portada-centro">
        <div className="portada-logos">
          <span className="portada-logo pop-in" style={{ '--d': 2 }}><Brand name="Uber" size={200} /></span>
          <span className="portada-vs pop-in" style={{ '--d': 6 }}>vs</span>
          <span className="portada-logo pop-in" style={{ '--d': 9 }}><Brand name="Lyft" size={200} /></span>
        </div>
        <div className="portada-grupo rv" style={{ '--d': 12 }}>Grupo 11</div>
        <div className="label rv" style={{ '--d': 13, marginTop: 14 }}>Ciencia de Datos · UTN FRC · 5K1</div>
        <div className="t2 rv portada-equipo" style={{ '--d': 14 }}>{EQUIPO.join(' · ')}</div>
      </div>
    </div>
  )
}

/* ═════════════ Recorrido ═════════════ */
const PASOS = [
  { n: 1, f: '11/09', t: 'Dominio y datos', q: '¿Qué influye en el precio de un viaje y se puede predecir?', h: 'Elegimos el dataset y planteamos 6 hipótesis.' },
  { n: 2, f: '02/10', t: 'ETL y exploración', q: '¿Los datos son confiables? ¿Qué conviene predecir?', h: 'Limpiamos y la pregunta se partió en dos variables.' },
  { n: 3, f: '30/10', t: 'Modelado', q: '¿Qué tan bien se predice cada una?', h: 'Modelos supervisados + K-Means, validados por fecha.' },
  { n: 4, f: 'Hoy', t: 'Valor y conclusiones', q: '¿Para qué le sirve a un pasajero o a una plataforma?', h: 'Medimos el valor en dólares y revisamos las hipótesis.' },
]
function Recorrido() {
  return (
    <div className="slide">
      <Head eje="Nuestro recorrido" title={<>Cuatro entregas, <em>una pregunta que fue cambiando</em></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {PASOS.map((p, i) => (
          <div key={p.n} className="rv" style={{ '--d': 2 + i, paddingRight: 30 }}>
            <div className="label" style={{ color: p.n === 4 ? 'var(--accent)' : undefined }}>Entrega {p.n} · {p.f}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 36, marginTop: 6, lineHeight: 1.1 }}>{p.t}</div>
          </div>
        ))}
      </div>
      <div className="rv" style={{ '--d': 4, margin: '18px 0 22px' }}><ForkLine width={1424} height={320} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {PASOS.map((p, i) => (
          <div key={p.n} className="rv" style={{ '--d': 8 + i, paddingRight: 30 }}>
            <p style={{ fontSize: 25, lineHeight: 1.35, fontStyle: 'italic' }}>“{p.q}”</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═════════════ E1 · Dominio ═════════════ */
function Dominio() {
  return (
    <div className="slide">
      <Head ent={E(1)} eje="El dataset" title={<>Cotizaciones de Uber y Lyft en Boston, <em>nov – dic 2018</em></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content minmax(0, 1fr)', alignItems: 'center', marginTop: 6 }}>
        {[[<Num value={DATASET.crudo} />, <>cotizaciones de <Brand name="Uber" size={22} d={6} /> y <Brand name="Lyft" size={22} d={8} /></>], ['57', 'columnas, con el clima de cada hora']].map(([n, t], i) => (
          <div key={i} className="rv" style={{ '--d': 2 + i, padding: i ? '0 56px' : '0 56px 0 0', borderLeft: i ? '1px solid var(--line-2)' : 'none' }}>
            <div className="num" style={{ fontSize: 72, lineHeight: 1 }}>{n}</div>
            <div className="t2" style={{ fontSize: 21, marginTop: 12 }}>{t}</div>
          </div>
        ))}
        <div className="rv" style={{ '--d': 4, paddingLeft: 56, borderLeft: '1px solid var(--line-2)' }}>
          <div className="label">Cada fila responde</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 34, lineHeight: 1.15, marginTop: 10 }}>
            “¿Cuánto cobra <span className="acc">este producto</span>, en <span className="acc">esta ruta</span>, en <span className="acc">este momento</span>?”
          </div>
        </div>
      </div>
      <div className="card rv" style={{ '--d': 5, marginTop: 40, padding: '28px 34px 30px', flex: 'none' }}>
        <h3>Las 57 columnas originales, por bloque</h3>
        <div style={{ marginTop: 20 }}><ColumnBlocks blocks={COLUMNAS} width={1350} /></div>
      </div>
      <p className="muted fade" style={{ '--d': 8, fontSize: 17, marginTop: 18 }}>Fuente: Kaggle · APIs de precios de Uber y Lyft · Boston, 25/11 al 18/12/2018</p>
    </div>
  )
}

/* ═════════════ E1 · Zonas y productos ═════════════ */
function ZonasProductos() {
  const rows = PRECIO_PRODUCTO.map((p) => ({ label: p.producto, value: p.precio, text: fUsd(p.precio, 1), color: p.plataforma === 'Uber' ? 'var(--uber)' : 'var(--lyft)' }))
  return (
    <div className="slide">
      <Head ent={E(1)} eje="Zonas y productos" title={<>12 zonas de Boston, <em>12 productos</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1fr 1.1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Las 12 zonas de origen y destino</h3>
          <MapaRutas scale={1} w={680} h={500} />
        </div>
        <div className="card rv" style={{ '--d': 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3>Precio mediano por producto</h3>
            <div className="legend" style={{ alignItems: 'center', gap: 18 }}><span><i className="sq" style={{ background: 'var(--uber)' }} /><Brand name="Uber" size={18} d={5} /></span><span><i className="sq" style={{ background: 'var(--lyft)' }} /><Brand name="Lyft" size={18} d={7} /></span></div>
          </div>
          <HBar rows={rows} width={640} rowH={40} labelW={130} barH={20} max={32} />
        </div>
      </div>
    </div>
  )
}

/* ═════════════ Modelado · tabla comparativa ═════════════ */
function TablaComparativa() {
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Modelos · comparación" title={<>Comparación de <em>los modelos</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '24px 28px', flex: 'none' }}><TablaModelos width={1366} /></div>
      <p className="muted rv" style={{ '--d': 8, fontSize: 16, marginTop: 14 }}>Recargo: todos con pesos de clase, matriz corregida (FN = −USD 8,73) · elegimos con validación; el resto se mide en la prueba final.</p>
    </div>
  )
}

/* ═════════════ Dominio · hipótesis iniciales ═════════════ */
const HIPOTESIS_INI = [
  ['H1', 'Hay patrones por hora y día', 'recargo', '¿El recargo sube en ciertas horas?'],
  ['H2', 'La categoría del servicio y la distancia definen el precio', 'precio', '¿Qué explica cuánto se paga?'],
  ['H3', 'El mal clima encarece los viajes', 'ambas', '¿La lluvia sube el precio?'],
  ['H4', 'Los productos forman grupos tarifarios', 'precio', '¿Los 12 productos se agrupan?'],
]
/* Mini animaciones que representan cada hipótesis */
const H4_PUNTOS = [
  [10, 12, 18, 40, 0], [52, 8, 26, 48, 0], [88, 30, 14, 52, 0],
  [30, 50, 58, 18, 1], [70, 54, 66, 26, 1], [100, 10, 52, 28, 1],
  [16, 30, 94, 44, 2], [60, 30, 102, 52, 2], [40, 20, 96, 56, 2],
]
/* Veredicto de una hipótesis, igual en todas las slides que la prueban */
function HipVeredicto({ k, ok, d = 9, style }) {
  const h = HIPOTESIS_INI.find((x) => x[0] === k)
  return (
    <div className={'hipv rv ' + (ok ? 'ok' : 'no')} style={{ '--d': d, ...style }}>
      <span className="hipv-k">{k}</span>
      <span className="hipv-t">{h[1]}</span>
      <span className="hipv-stamp">{ok ? '✓ Confirmada' : '✗ No se cumple'}</span>
    </div>
  )
}
function HipIcon({ k }) {
  if (k === 'H1') return (
    <svg className="hip-ico" viewBox="0 0 120 80" aria-hidden>
      <circle cx="60" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1="60" y1="13" x2="60" y2="17" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 30} 60 40)`} />)}
      <line className="hip-hand-h" x1="60" y1="40" x2="60" y2="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line className="hip-hand-m" x1="60" y1="40" x2="60" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="40" r="3.5" fill="currentColor" />
    </svg>
  )
  if (k === 'H2') return (
    <svg className="hip-ico" viewBox="0 0 120 80" aria-hidden>
      <text x="6" y="24" fontFamily="var(--mono)" fontSize="14" fill="currentColor" fontWeight="700">$</text>
      <rect x="20" y="13" width="92" height="12" rx="6" fill="currentColor" opacity=".15" />
      <rect className="hip-price" x="20" y="13" width="92" height="12" rx="6" fill="currentColor" />
      <line x1="10" y1="60" x2="112" y2="60" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" opacity=".45" />
      <g className="hip-car">
        <rect x="6" y="46" width="22" height="10" rx="4" fill="currentColor" />
        <rect x="10" y="40" width="13" height="8" rx="3" fill="currentColor" />
        <circle cx="11" cy="58" r="3" fill="var(--card)" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="58" r="3" fill="var(--card)" stroke="currentColor" strokeWidth="2" />
      </g>
    </svg>
  )
  if (k === 'H3') return (
    <svg className="hip-ico" viewBox="0 0 120 80" aria-hidden>
      <g fill="currentColor" opacity=".55">
        <circle cx="46" cy="28" r="14" /><circle cx="64" cy="22" r="18" /><circle cx="80" cy="30" r="12" />
        <rect x="34" y="28" width="56" height="14" rx="7" />
      </g>
      {[38, 50, 62, 74, 86].map((x, i) => <line key={x} className="hip-drop" style={{ animationDelay: `${(i * 0.23) % 1}s` }} x1={x} y1="48" x2={x - 3} y2="58" stroke="#4a8fd8" strokeWidth="3" strokeLinecap="round" />)}
    </svg>
  )
  return (
    <svg className="hip-ico" viewBox="0 0 120 80" aria-hidden>
      {H4_PUNTOS.map(([x0, y0, x1, y1, g], i) => (
        <circle key={i} className="hip-dot" r="5" cx="0" cy="0" fill={['var(--precio)', 'color-mix(in srgb, var(--precio) 55%, var(--card))', 'var(--text-2)'][g]}
          style={{ '--x0': `${x0 + 6}px`, '--y0': `${y0 + 8}px`, '--x1': `${x1 + 6}px`, '--y1': `${y1 + 8}px`, animationDelay: `${i * 0.05}s` }} />
      ))}
    </svg>
  )
}
function HipotesisIniciales() {
  return (
    <div className="slide hip-slide">
      <Head ent={E(1)} eje="Hipótesis" title={<>¿Qué define el precio de un viaje, <em>y cuándo aparece el recargo?</em></>} />
      <div className="hip-grid">
        {HIPOTESIS_INI.map(([k, t, v, q], i) => (
          <div key={k} className={'card hip-card rv hip-' + v} style={{ '--d': 4 + i * 2 }}>
            <span className="hip-k">{k}</span>
            <div>
              <div className="hip-t">{t}</div>
              <div className="hip-q">{q}</div>
            </div>
            <span className="hip-anim"><HipIcon k={k} /><span className="hip-q-badge">?</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═════════════ ETL · clima y hora no mueven el recargo ═════════════ */
function ClimaHoraRecargo() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Recargo · la hora" track="recargo" title={<>La hora <em>no cambia el recargo</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '28px 32px', flex: 'none' }}>
        <h3>% de cotizaciones con recargo en cada hora del día</h3>
        <HoraLinea width={1340} height={430} simple />
      </div>
      <div className="rv" style={{ '--d': 8, display: 'flex', justifyContent: 'center', marginTop: 22 }}>
        <HipVeredicto k="H1" ok={false} d={8} style={{ zoom: 1.3 }} />
      </div>
    </div>
  )
}

/* ═════════════ E1 · Problema ═════════════ */
function Problema() {
  return (
    <div className="slide">
      <Head ent={E(0)} eje="El problema" track="recargo" title={<>El mismo viaje puede costar <em>hasta 67% más</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.35fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Cuánto cuesta cada producto de <Brand name="Lyft" size={23} d={4} />, sin y con recargo</h3>
          <p className="sub">Precio mediano · el tramo naranja es el recargo</p>
          <Dumbbell width={740} rowH={78} />
        </div>
        <Side gap={40}>
          <div><Big c="var(--recargo)" size={74}>1 de cada 12</Big><Say size={21} style={{ marginTop: 10 }}>cotizaciones de <Brand name="Lyft" size={21} /> tiene recargo</Say></div>
          <div><Big d={6} size={74}><Num value={RECARGO.sobreprecioMedio} format={(v) => 'USD ' + fDec(v, 2)} /></Big><Say d={7} size={21} style={{ marginTop: 10 }}>de sobreprecio medio, <B>sin previo aviso</B></Say></div>
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E1 · Uber esconde ═════════════ */
function UberEsconde() {
  const rows = [['Uber', PLATAFORMAS.uber, 'var(--uber)'], ['Lyft', PLATAFORMAS.lyft, 'var(--lyft)']]
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Recargo · Uber vs Lyft" track="recargo" title={<><Brand name="Uber" size={60} d={1} /> <em>esconde</em> su recargo. <Brand name="Lyft" size={60} d={3} /> lo muestra.</>} />
      <div className="grid" style={{ gridTemplateColumns: '650px 1fr', gap: 48, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 26, zoom: 1.27 }}>
          <Phone d={2}>
            <div className="ph-app uber">Uber<span className="ph-route">Back Bay → Fenway</span></div>
            <div className="ph-row"><span>UberX</span><span className="muted">4 asientos</span></div>
            <div className="ph-receipt pop" style={{ '--d': 9 }}>
              <div className="ph-small">Precio final</div>
              <div className="ph-big" style={{ color: '#16161a' }}>USD 9,50</div>
              <div className="ph-note">¿Tiene recargo? No se informa</div>
            </div>
          </Phone>
          <Phone d={4}>
            <div className="ph-app">Lyft<span className="ph-route">Back Bay → Fenway</span></div>
            <div className="ph-row"><span>Lyft</span><span className="muted">4 asientos</span></div>
            <div className="ph-badge pop" style={{ '--d': 12 }}>⚡ Recargo +50%</div>
            <div className="ph-receipt pop" style={{ '--d': 14 }}>
              <div className="ph-small">USD 9,00 + recargo</div>
              <div className="ph-big" style={{ color: '#b8008a' }}>USD 13,50</div>
              <div className="ph-note">El multiplicador se ve</div>
            </div>
          </Phone>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div className="card rv" style={{ '--d': 6, padding: '26px 30px' }}>
            <h3>Cotizaciones con multiplicador de recargo visible</h3>
            {rows.map(([n, p, c], i) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '84px 1fr 210px', alignItems: 'center', gap: 18, marginTop: 22 }}>
                <Brand name={n} size={28} d={7 + i * 2} />
                <div style={{ height: 34, background: 'var(--card-2)', borderRadius: 8, overflow: 'hidden' }}>
                  <div className="growx" style={{ '--d': 6 + i * 6, width: `${(p.conRecargo / p.cotizaciones / 0.075) * 100}%`, height: '100%', background: c, borderRadius: 8 }} />
                </div>
                <span className="num" style={{ fontSize: 19 }}>{fInt(p.conRecargo)} de {fInt(p.cotizaciones)}</span>
              </div>
            ))}
          </div>
          <Say d={12} size={22}><B c="var(--recargo)">→</B> El recargo se estudia solo con <Brand name="Lyft" size={22} />.</Say>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ E1 · Primeras pistas (4 paneles, de a uno) ═════════════ */
const PISTAS = [
  { img: 'insights_1.png', t: 'Shared nunca tiene recargo', d: 'El resto, todos en 8,2 %' },
  { img: 'insights_2.png', t: 'La zona cambia el recargo hasta 7×', d: 'De 1,5 % a 11,2 %' },
  { img: 'insights_3.png', t: 'Clima y hora: correlación nula', d: 'Ninguna pasa de |r| = 0,006' },
  { img: 'insights_4.png', t: 'Predice la ruta, no el clima', d: 'Ruta 0,70 · clima 0,50 (azar)' },
]
function PrimerasPistas() {
  const [step, setStep] = useSteps(PISTAS.length)
  const { openImage } = useDeck()
  return (
    <div className="slide">
      <Head ent={E(1)} eje="Introducción del dominio · primeras pistas" track="recargo" title={<>Las <em>primeras pistas</em> que vimos en la Entrega 1</>} />
      <div className="grid" style={{ gridTemplateColumns: '1.45fr 1fr', gap: 44, alignItems: 'center' }}>
        <div className="rv" style={{ '--d': 2 }}>
          <div className="pista-frame">
            <PistaPanel step={step} />
            <button className="pista-orig" onClick={() => openImage(findImg(PISTAS[step].img.replace('.png', '')))} title="Ver el gráfico original de la Entrega 1">ver original</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
            <span className="fig-tag">Entrega 1</span>
            <span className="t2" style={{ fontSize: 15 }}>¿Qué explica el recargo en Lyft? · panel {step + 1} de {PISTAS.length}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {PISTAS.map((p, i) => (
                <button key={p.img} className={'step-dot' + (i === step ? ' on' : '')} onClick={() => setStep(i)} aria-label={`Panel ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PISTAS.map((p, i) => (
            <div key={p.img} className="rv" style={{ '--d': 4 + i }}>
              <button className={'pista' + (i === step ? ' on' : '')} onClick={() => setStep(i)}>
                <span className="num pista-n">{i + 1}</span>
                <span>
                  <span className="pista-t">{p.t}</span>
                  <span className="pista-d">{p.d}</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═════════════ E2 · Dos variables ═════════════ */
/* Mini-visualizaciones de "Una pregunta, dos variables" */
const TAXI = ['9,50', '13,50', '16,50', '22,50', '32,50', '7,00']
function Taximetro() {
  return (
    <div className="mini-viz fade" style={{ '--d': 6 }}>
      <div className="taxi"><span className="taxi-usd">USD</span><span className="taxi-win"><span className="taxi-roll">{[...TAXI, TAXI[0]].map((v, i) => <span key={i}>{v}</span>)}</span></span></div>
      <div className="mini-cap">un número en dólares</div>
    </div>
  )
}
const CON_RECARGO = new Set([6, 19, 27, 44, 58, 63, 81, 96])
function Grilla100() {
  let k = 0
  return (
    <div className="mini-viz fade" style={{ '--d': 7 }}>
      <div className="g100">{Array.from({ length: 100 }, (_, i) => <i key={i} className={CON_RECARGO.has(i) ? 'on' : undefined} style={CON_RECARGO.has(i) ? { animationDelay: `${1.5 + (k++) * 0.35}s` } : undefined} />)}</div>
      <div className="mini-cap">sí o no · solo 8 de cada 100</div>
    </div>
  )
}
function DosVariables() {
  const rows = [
    ['La pregunta', '¿Cuánto me va a costar?', '¿Me van a cobrar recargo?'],
    ['Tipo de problema', 'Regresión: un número en USD', 'Clasificación: sí o no'],
    ['Datos', <>{fInt(DATASET.limpio)} cotizaciones · <Brand name="Uber" size={20} /> y <Brand name="Lyft" size={20} /></>, <>{fInt(RECARGO.filas)} cotizaciones · solo <Brand name="Lyft" size={20} /> sin Shared</>],
    ['Dificultad', 'Precios asimétricos (pocos muy caros)', 'Solo 8,2% tiene recargo'],
  ]
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Qué predecimos" track="ambas" title={<>Una pregunta, <em>dos variables</em></>} />
      <div className="cmp cmp-lg">
        <div className="cc rl" style={{ borderTop: 'none' }} />
        <div className="cc cp hd rv" style={{ '--d': 2 }}>
          <div className="hd-txt"><span className="track precio" style={{ padding: '6px 12px' }}><i />Variable A</span><span style={{ fontFamily: 'var(--serif)', fontSize: 48, lineHeight: 1 }}>Precio</span></div>
          <Taximetro />
        </div>
        <div className="cc cr hd rv" style={{ '--d': 3, marginLeft: 14 }}>
          <div className="hd-txt"><span className="track recargo" style={{ padding: '6px 12px' }}><i />Variable B</span><span style={{ fontFamily: 'var(--serif)', fontSize: 48, lineHeight: 1 }}>Recargo</span></div>
          <Grilla100 />
        </div>
        {rows.map(([k, a, b], i) => (
          <div key={k} style={{ display: 'contents' }}>
            <div className="cc rl rv" style={{ '--d': 4 + i }}>{k}</div>
            <div className={'cc cp rv' + (i === rows.length - 1 ? ' last' : '')} style={{ '--d': 4 + i, ...(i === 0 ? { fontWeight: 600, fontSize: 22 } : null) }}><span>{a}</span></div>
            <div className={'cc cr rv' + (i === rows.length - 1 ? ' last' : '')} style={{ '--d': 4 + i, marginLeft: 14, ...(i === 0 ? { fontWeight: 600, fontSize: 22 } : null) }}><span>{b}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═════════════ E2 · Limpieza ═════════════ */
function Limpieza() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Limpieza" track="ambas" title={<>Cómo <em>limpiamos el dataset</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2, padding: '30px 34px' }}>
          <LimpiezaFlow width={790} />
        </div>
        <Side gap={14}>
          <div className="label rv" style={{ '--d': 4, color: 'var(--bad)' }}>Cotizaciones de taxi eliminadas</div>
          <Big c="var(--bad)" size={128} d={5}><Num value={55095} delay={600} /></Big>
          <Say d={7} size={24} style={{ marginTop: 6 }}>Borramos los <B>taxis</B>: venían con el <B>precio vacío</B>.</Say>
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E2 · Columnas ═════════════ */
function Columnas() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Resultado del ETL" title={<>Dataset limpio: <em>de 57 a 27 columnas</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '22px 32px 6px', flex: 'none' }}>
        <ColumnasFlow width={1360} />
      </div>
      <div className="cols-sum">
        <div className="cols-box out rv" style={{ '--d': 5 }}>
          <div className="cols-head"><span className="cols-n num">−41</span><span>columnas que sacamos</span></div>
          <div className="cols-tags">
            {[['31', 'clima repetido o sin relación'], ['6', 'hora en UTC'], ['2', 'coordenadas del clima'], ['2', 'copias exactas']].map(([n, t], i) => (
              <span key={t} className="cols-tag pop" style={{ '--d': 8 + i }}><b className="num">{n}</b>{t}</span>
            ))}
          </div>
        </div>
        <div className="cols-box in rv" style={{ '--d': 7 }}>
          <div className="cols-head"><span className="cols-n num">+11</span><span>columnas que creamos</span></div>
          <div className="cols-tags">
            {['fecha y hora local', 'hora local', 'día de la semana', 'fin de semana', 'franja horaria', 'hora pico', 'de noche', 'llueve', 'nivel de servicio', 'distancia en línea recta', 'has_surge'].map((t, i) => (
              <span key={t} className={'cols-tag pop' + (t === 'has_surge' ? ' key' : '')} style={{ '--d': 12 + i * 0.6 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ E2 · UTC ═════════════ */
function HoraUTC() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Limpieza · horario" title={<>Corregimos el <em>huso horario</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '36px 32px', flex: 'none' }}><HusoHorario width={1356} /></div>
      <Say d={8} size={28} style={{ marginTop: 36 }}>Pasamos de <B>UTC</B> a hora de Boston (<B>UTC − 5</B>): el pico de las <B c="var(--accent)">8</B> aparecía a las <B c="var(--bad)">13</B>.</Say>
    </div>
  )
}

/* ═════════════ E2 · Tratamiento por variable ═════════════ */
function TratamientoPrecio() {
  return (
    <div className="slide tratamiento-precio">
      <Head ent={E(2)} eje="Variables a predecir" track="precio" title={<>Cómo preparamos <em>el precio</em></>} />
      <div className="card precio-card tratamiento-precio-panel rv" style={{ '--d': 2 }}>
        <h3>¿Por qué usamos el logaritmo?</h3>
        <div className="tratamiento-precio-grid">
          <section>
            <p className="trat-step"><span className="num">1</span><span>Los precios están <B>sesgados</B></span></p>
            <p className="tratamiento-explica">El logaritmo deja una distribución casi simétrica.</p>
            <PrecioHistDuo width={800} height={230} />
          </section>
          <section className="tratamiento-error">
            <p className="trat-step"><span className="num">2</span><span>El error se mide <B>en proporción al precio</B></span></p>
            <p className="tratamiento-explica">Un error de USD 2 pesa distinto según el viaje.</p>
            <div className="tratamiento-error-grafico"><ErrorRelativo width={480} /></div>
          </section>
        </div>
      </div>
    </div>
  )
}

function TratamientoRecargo() {
  return (
    <div className="slide tratamiento-recargo">
      <Head ent={E(2)} eje="Variables a predecir" track="recargo" title={<>Cómo preparamos <em>el recargo</em></>} />
      <section className="card recargo-card tratamiento-recargo-panel rv" style={{ '--d': 2 }}>
        <h3>De 7 valores a “sí” o “no”</h3>
        <p className="sub">Lyft sin Shared · {fInt(MULT_TOTAL)} cotizaciones · agrupamos los 6 niveles de aumento en una sola clase</p>
        <div className="tratamiento-recargo-grafico"><MultiplicadorFlujo width={1040} /></div>
      </section>
      <p className="tratamiento-cierre rv" style={{ '--d': 6 }}>Para anticipar el recargo <B>no usamos el precio final ni el multiplicador</B> como entrada: revelarían la respuesta.</p>
    </div>
  )
}

/* ═════════════ E2 · Hallazgo: fórmula del precio ═════════════ */
function HallazgoFormula() {
  const rows = PESO_FACTORES.filter((f, i) => i !== 1 && i < 9).map((f, i) => ({
    label: f.label, value: f.v, text: fDec(f.v, 1) + '%', strong: i < 2, color: i < 2 ? 'var(--precio)' : 'var(--neutral)',
  }))
  return (
    <div className="slide precio-formula">
      <Head ent={E(2)} eje="Precio · qué lo define" track="precio" title={<>El precio: <em>categoría del servicio + distancia</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.45fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Qué parte de la variación del precio explica cada variable</h3>
          <p className="sub">Cada una por sí sola, sobre las {fInt(DATASET.limpio)} cotizaciones</p>
          <HBar rows={rows} width={820} rowH={54} labelW={270} barH={26} max={100} tip={(r) => <><b>{r.label}</b><br />explica el {r.text} de la variación del precio</>} />
        </div>
        <Side gap={30}>
          <div className="rv formula-eq" style={{ '--d': 3 }}>
            <span>precio ≈</span>
            <div className="formula-terminos"><span className="fx-chip">categoría del servicio</span><span>+</span><span className="fx-chip">distancia</span></div>
          </div>
          <div className="rv" style={{ '--d': 4, display: 'flex', gap: 22, justifyContent: 'space-between' }}>
            <Gauge value={77.4} label="Categoría del servicio" d={5} />
            <Gauge value={11.9} label="Distancia" color="color-mix(in srgb, var(--precio) 65%, var(--card))" d={8} />
            <Gauge value={0} label="Hora y clima" muted d={11} />
          </div>
          <Say d={7} size={21}>Lo que el pasajero <B>elige</B> y lo que <B>recorre</B> definen el precio.</Say>
          <HipVeredicto k="H2" ok d={9} />
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E2 · Hallazgo: Uber vs Lyft ═════════════ */
function HallazgoApps() {
  const [ni, setNi] = useState(1)
  const [dist, setDist] = useState(2)
  const nivel = NIVELES[ni]
  const pu = tarifaEn(nivel.uber, dist), pl = tarifaEn(nivel.lyft, dist)
  const dif = pl / pu - 1
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Qué hallazgos encontramos" track="precio" title={<>Ninguna app es siempre la más barata: <em>depende del nivel</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 30 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Tarifa sin recargo según la distancia</h3>
            <div className="seg-ctrl">{NIVELES.map((n, i) => <button key={n.nivel} className={i === ni ? 'on' : ''} onClick={() => setNi(i)}>{n.nivel}</button>)}</div>
          </div>
          <p className="sub">Elegí un nivel</p>
          <div style={{ display: 'flex', gap: 22 }}>
            <FareCompare nivel={nivel} dist={dist} setDist={setDist} width={600} height={430} />
            <div className="fare-read">
              <div className="label" style={{ fontSize: 14 }}>Viaje de {fDec(dist, 1)} millas</div>
              <div key={'u' + ni}><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><Brand name="Uber" size={24} d={0} /><span className="t2" style={{ fontSize: 16 }}>{nivel.uber}</span></div><div className="num" style={{ fontSize: 38, marginTop: 4 }}>{fUsd(pu)}</div></div>
              <div key={'l' + ni}><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><Brand name="Lyft" size={24} d={2} /><span className="t2" style={{ fontSize: 16 }}>{nivel.lyft}</span></div><div className="num" style={{ fontSize: 38, marginTop: 4, color: 'var(--lyft)' }}>{fUsd(pl)}</div></div>
              <div className="fare-win" key={'w' + ni + dist} style={{ '--c': dif < 0 ? 'var(--lyft)' : 'var(--uber)' }}><Brand name={dif < 0 ? 'Lyft' : 'Uber'} size={19} /> más barato por <b className="num">{fDec(Math.abs(dif) * 100, 0)} %</b></div>
            </div>
          </div>
        </div>
        <div className="card rv" style={{ '--d': 3 }}>
          <h3><Brand name="Lyft" size={23} d={5} /> frente a <Brand name="Uber" size={23} d={7} />, por nivel</h3>
          <p className="sub">Diferencia promedio a igual distancia</p>
          <div className="lvu-head fade" style={{ '--d': 4 }}>
            <span style={{ color: 'var(--lyft)' }}>← <Brand name="Lyft" size={16} /> más barato</span>
            <span><Brand name="Uber" size={16} /> más barato →</span>
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            {NIVELES.map((n, i) => {
              const w = (Math.abs(n.dif) / 0.3) * 44
              const lyftCheaper = n.dif < 0
              return (
                <div key={n.nivel} className={'lvu-row' + (i === ni ? ' on' : '')} onClick={() => setNi(i)}>
                  <span className="lvu-n">{n.nivel}</span>
                  <div style={{ position: 'relative', height: 30 }}>
                    <div style={{ position: 'absolute', left: '50%', top: -14, bottom: -14, width: 2, background: 'var(--line-2)' }} />
                    <div className="growx lvu-bar" style={{ '--d': i + 4, width: `${w}%`, background: lyftCheaper ? 'var(--lyft)' : 'var(--uber)', ...(lyftCheaper ? { right: '50%', transformOrigin: 'right center' } : { left: '50%' }) }} />
                    <span className="num lvu-v" style={w > 25 ? { color: '#fff', right: `calc(50% + ${w}% - 70px)` } : { color: lyftCheaper ? 'var(--lyft)' : 'var(--text)', ...(lyftCheaper ? { right: `calc(50% + ${w}% + 10px)` } : { left: `calc(50% + ${w}% + 10px)` }) }}>{n.dif > 0 ? '+' : '−'}{fDec(Math.abs(n.dif) * 100, 0)} %</span>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="rv h-pill good-pill" style={{ '--d': 10, marginTop: 22 }}>Hipótesis H2 · ✓ confirmada</p>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ E2 · Mito del clima ═════════════ */
function MitoClima() {
  const diferencia = (RECARGO.seco - RECARGO.lluvia) * 100
  return (
    <div className="slide clima-slide">
      <Head ent={E(2)} eje="El clima · mito derribado" track="recargo" title={<>Con lluvia, el recargo <em>no aumenta</em></>} />
      <div className="clima-comparacion">
        <p className="clima-contexto rv" style={{ '--d': 2 }}>Frecuencia de recargo en las cotizaciones de Lyft</p>
        <LluviaVsSeco lluvia={RECARGO.lluvia} seco={RECARGO.seco} />
        <p className="clima-diferencia rv" style={{ '--d': 9 }}><B c="var(--recargo)">{fDec(diferencia, 1)} puntos porcentuales menos</B> con lluvia</p>
        <HipVeredicto k="H3" ok={false} d={10} />
      </div>
    </div>
  )
}

/* ═════════════ E2 · Hallazgo: zonas ═════════════ */
function HallazgoZonas() {
  const max = ZONAS[0].tasa, min = ZONAS[ZONAS.length - 1].tasa
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Recargo · la zona" track="recargo" title={<>El recargo depende del <em>lugar</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>% de cotizaciones con recargo según la zona de origen</h3>
          <ZoneMap width={780} height={510} />
        </div>
        <Side gap={26}>
          <Big c="var(--recargo)" size={110}><Num value={max / min} format={(v) => fDec(v, 1) + '×'} /></Big>
          <Say size={22} style={{ marginTop: -10 }}>más recargo saliendo de <B>Back Bay</B> que de <B>North End</B>.</Say>
          <div className="zcmp rv" style={{ '--d': 6 }}>
            {[[ZONAS[0].zona, max, 'var(--recargo)'], [ZONAS[ZONAS.length - 1].zona, min, 'var(--neutral)']].map(([z, v, c], i) => (
              <div key={z} className="zcmp-row">
                <span className="zcmp-n">{z}</span>
                <div className="zcmp-track"><div className="growx" style={{ '--d': 8 + i * 3, width: `${(v / max) * 100}%`, background: c }} /></div>
                <span className="num zcmp-v" style={{ color: i ? 'var(--muted)' : 'var(--recargo)' }}>{fPct(v)}</span>
              </div>
            ))}
          </div>
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E2 · Hallazgo: hora ═════════════ */
function HallazgoHora() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Qué hallazgos encontramos" track="recargo" title={<>…y casi nada de <em>la hora</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1fr 440px', gap: 28 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>% de cotizaciones de Lyft con recargo, hora por hora</h3>
          <p className="sub">Hora local · promedio 8,2 %</p>
          <HoraLinea width={860} height={400} />
        </div>
        <div className="card rv" style={{ '--d': 4, display: 'flex', flexDirection: 'column' }}>
          <h3>¿Qué mueve más el recargo?</h3>
          <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}><RangoCompare width={380} /></div>
          <p className="rv" style={{ '--d': 16, fontSize: 18, color: 'var(--text-2)', margin: '0 0 14px' }}>La zona mueve el recargo <B>casi 4 veces más</B> que la hora.</p>
          <p className="rv h-pill bad-pill" style={{ '--d': 12, alignSelf: 'stretch', textAlign: 'center' }}>Hipótesis H3 · ✗ no se confirma</p>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ E3 · Modelo de precio ═════════════ */
/* Filas de comparación de modelos: qué hace cada uno, barra, valor y sello de elegido */
function ModelRows({ rows, max, color, fmt, azar, mejorMenor }) {
  return (
    <div className="mrows">
      {azar != null && <div className="mrows-azar fade" style={{ '--d': 10, left: `calc(250px + 16px + (100% - 250px - 16px - 150px - 16px) * ${azar / max})` }}><span>azar ≈ {fDec(azar, 2)}</span></div>}
      {rows.map((r, i) => (
        <div key={r.modelo} className={'mrow rv' + (r.elegido ? ' on' : '')} style={{ '--d': 2 + i }}>
          <div>
            <div className="mrow-n">{r.modelo}</div>
            <div className="mrow-d">{r.que}</div>
          </div>
          <div className="mrow-track">
            <div className={'growx' + (r.elegido ? ' pbar' : '')} style={{ '--d': 3 + i * 3, position: 'relative', height: '100%', width: `${(r.v / max) * 100}%`, background: r.elegido ? color : 'var(--neutral)', borderRadius: 6, opacity: r.elegido ? 1 : 0.75 }} />
          </div>
          <div className="mrow-v">
            <span className="num" style={{ color: r.elegido ? color : undefined }}>{fmt(r.v)}</span>
            {r.elegido && <span className="mrow-badge" style={{ background: color }}>ELEGIDO</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
function Razones({ items, color }) {
  return (
    <ol className="razones">
      {items.map(([t, d, n], i) => (
        <li key={t} className="rv" style={{ '--d': 6 + i * 2 }}>
          <span className="razon-n" style={{ background: color }}>{i + 1}</span>
          <div><b>{t}</b><span>{d}</span></div>
          {n && <span className="num razon-dato" style={{ color }}>{n}</span>}
        </li>
      ))}
    </ol>
  )
}
function ModeloPrecio() {
  const QUE = {
    'Línea base': 'usa el precio típico de cada producto',
    Ridge: 'suma ponderada de las variables (en línea recta)',
    'Árbol de decisión': 'una serie de preguntas sí / no',
    'Random forest': 'promedia cientos de árboles distintos',
  }
  const rows = REGRESION.map((r) => ({ modelo: r.modelo, que: QUE[r.modelo], v: r.mae, elegido: r.elegido }))
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Modelos · precio" track="precio" title={<>El precio se predice con <em>un dólar de error</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '26px 34px', flex: 'none' }}>
        <h3>¿Cuántos dólares se equivoca cada modelo, en promedio?</h3>
        <p className="sub" style={{ margin: 0 }}>Error medio (MAE) · prueba final, {fInt(REGRESION_DATOS.test)} cotizaciones nuevas · <b>menos es mejor</b></p>
        <div style={{ marginTop: 22 }}>
          <BarrasSobreAzar rows={rows} lo={0} hi={3.2} ticks={[0, 1, 2, 3]} fmt={(v) => fUsd(v)} tickFmt={(t) => `USD ${t}`} menor color="precio" />
        </div>
        <p className="modelo-nota" style={{ marginTop: 12 }}>Random forest tuvo el menor error en validación; en la prueba queda apenas por debajo del árbol (USD 1,08 vs 1,09). Sin conocer el recargo, el error sube a USD {fDec(REGRESION_SIN_SURGE.mae, 2)}.</p>
      </div>
    </div>
  )
}

/* ═════════════ E3 · K-Means ═════════════ */
function ModeloKMeans() {
  const fam = [
    ['Económico', 'var(--eco)', 'Shared, Lyft, UberPool, WAV, UberX', 'USD 3,3 – 6,4', 'USD 1,2 – 1,7'],
    ['Intermedio', 'var(--mid)', 'Lyft XL, Lux, UberXL, Black, Lux Black', 'USD 7,8 – 12,3', 'USD 3,0 – 4,5'],
    ['Premium', 'var(--prem)', 'Lux Black XL, Black SUV', 'USD 21,9 – 22,5', 'USD 3,5 – 4,2'],
  ]
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Modelos · no supervisado" track="precio" title={<>Los 12 productos forman <em>3 familias de tarifa</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.15fr 1fr', gap: 34 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3>K-Means sobre tarifa base y precio por milla</h3>
            <span className="num small precio">k = 3 · silueta 0,68</span>
          </div>
          <KMeansScatter width={690} height={470} />
          <div className="legend" style={{ marginTop: 14 }}>
            <span><i className="dot" style={{ background: 'var(--text-2)' }} /><Brand name="Uber" size={17} d={8} /></span>
            <span><i className="sq" style={{ background: 'var(--text-2)' }} /><Brand name="Lyft" size={17} d={10} /></span>
          </div>
        </div>
        <Side gap={18}>
          {fam.map(([g, c, l, b, m], i) => (
            <div key={g} className="card rv" style={{ '--d': 4 + i * 2, borderLeft: `5px solid ${c}`, padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 23, fontWeight: 600 }}>{g}</span>
                <span className="num small t2">base {b} · {m}/mi</span>
              </div>
              <div className="t2" style={{ fontSize: 17, marginTop: 6 }}>{l}</div>
            </div>
          ))}
          <Say d={11} size={20}><Brand name="Uber" size={20} /> y <Brand name="Lyft" size={20} /> <B>compiten en espejo</B>.</Say>
          <HipVeredicto k="H4" ok d={12} />
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E3 · Desbalance ═════════════ */
function ModeloDesbalance() {
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Balanceo de datos" track="recargo" title={<>Con solo 8% de recargos, <em>¿cómo se aprende?</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '26px 32px', flex: 'none' }}>
        <h3>Lo que ve el modelo al entrenar, según la técnica</h3>
        <p className="sub">Filas de entrenamiento por clase · gradient boosting</p>
        <div style={{ marginTop: 16 }}><BalanceoGrande width={1356} /></div>
      </div>
    </div>
  )
}

/* ═════════════ E3 · Modelos de recargo ═════════════ */
/* Barras que arrancan en el azar: se ve cuánto mejora cada modelo sobre adivinar */
function BarrasSobreAzar({ rows, azar, hi = 0.145, lo, ticks: tk, fmt = (v) => fDec(v, 3), tickFmt = (t) => fDec(t, 2), menor = false, color = 'recargo' }) {
  const base = lo ?? azar
  const ticks = tk ?? [azar, 0.10, 0.12, 0.14]
  const x = (v) => ((v - base) / (hi - base)) * 100
  const best = menor ? Math.min(...rows.map((r) => r.v)) : Math.max(...rows.map((r) => r.v))
  return (
    <div className={'bsa bsa-' + color}>
      <div className="bsa-axis">
        <span />
        <div className="bsa-ticks">
          {ticks.map((t, i) => <span key={t} style={{ left: `${x(t)}%` }} className={i === 0 && azar != null ? 'azar' : i === 0 ? 'cero' : ''}>{i === 0 && azar != null ? `azar ${fDec(t, 3)}` : tickFmt(t)}</span>)}
        </div>
        <span />
      </div>
      {rows.map((r, i) => (
        <div key={r.modelo} className={'bsa-row rv' + (r.elegido ? ' on' : '')} style={{ '--d': 2 + i }}>
          <div className="bsa-name"><b>{r.modelo}</b><span>{r.que}</span></div>
          <div className="bsa-track">
            {ticks.slice(1).map((t) => <i key={t} className="bsa-grid" style={{ left: `${x(t)}%` }} />)}
            <div className={'bsa-bar growx' + (r.elegido ? ' pbar' : '')} style={{ '--d': 4 + i * 2, width: `${x(r.v)}%` }} />
          </div>
          <div className="bsa-val">
            <span className="num">{fmt(r.v)}</span>
            {(r.v === best || r.elegido) && <span className="bsa-badge">{r.elegido ? '★ Elegido' : 'mejor'}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
function ModelosRecargo() {
  const [tipo, setTipo] = useState('val')
  const enValidacion = tipo === 'val'
  const QUE = {
    'Regresión logística': 'una fórmula de probabilidad en línea recta',
    'Árbol de decisión': 'una serie de preguntas sí / no',
    'Random forest': 'promedia cientos de árboles distintos',
    'Gradient boosting': 'cada árbol corrige los errores del anterior',
  }
  const azar = CLASIFICACION[0].prauc
  const rows = CLASIFICACION.filter((c) => c.val != null).map((c) => ({ modelo: c.modelo, que: QUE[c.modelo], v: enValidacion ? c.val : c.prauc, elegido: c.elegido }))
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Modelos · recargo" track="recargo" title={<>Para el recargo elegimos <em>gradient boosting</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '26px 34px', flex: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <h3>¿Qué modelo encuentra mejor los recargos?</h3>
            <p className="sub" style={{ margin: 0 }}>{tipo === 'pr' ? 'Precisión y recargos detectados · prueba final · compará los modelos al cambiar el umbral' : <>PR-AUC · {enValidacion ? 'validación (con esto elegimos)' : 'prueba final'} · las barras arrancan en el azar: cuánto mejora cada modelo sobre adivinar</>}</p>
          </div>
          <div className="seg-ctrl" style={{ flexShrink: 0 }}>
            {[['val', 'Validación'], ['test', 'Prueba'], ['pr', 'Curvas']].map(([v, label]) => <button key={v} className={tipo === v ? 'on' : ''} onClick={() => setTipo(v)}>{label}</button>)}
          </div>
        </div>
        {tipo !== 'pr'
          ? <div key={tipo} style={{ marginTop: 22 }}><BarrasSobreAzar rows={rows} azar={azar} /></div>
          : <div style={{ marginTop: 16 }}><Curvas tipo="pr" width={1290} height={400} /></div>}
        {tipo === 'test' && <p className="modelo-nota" style={{ marginTop: 14 }}>En la prueba, random forest y gradient boosting quedan prácticamente empatados (0,142 vs 0,140). No cambiamos la elección.</p>}
      </div>
    </div>
  )
}

/* ═════════════ E3 · Qué mira el modelo ═════════════ */
function QueMira() {
  const imp = IMPORTANCIA_RECARGO.map((g, i) => ({
    label: g.grupo, value: Math.max(0, g.caida), text: g.caida <= 0 ? '≈ 0' : fDec(g.caida, 3), strong: i < 2,
    color: i < 2 ? 'var(--recargo)' : 'var(--neutral)',
  }))
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Qué modelos usamos" track="recargo" title={<>Lo que mira el modelo: <em>la ruta</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '620px 1fr', gap: 30 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Cuánto empeora si se desordena cada grupo</h3>
          <p className="sub">Importancia por permutación (caída de PR-AUC)</p>
          <HBar rows={imp} width={560} rowH={58} labelW={190} barH={24} max={0.05} />
        </div>
        <div className="card rv" style={{ '--d': 4 }}>
          <h3>Las primeras preguntas que hace el árbol de decisión</h3>
          <p className="sub">“Ruta &gt; 6,3 %” = la ruta tuvo recargo en más del 6,3 % de las veces</p>
          <div style={{ marginTop: 14 }}><ArbolReglas width={700} /></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <span className="h-pill" style={{ color: 'var(--recargo)', background: 'var(--accent-soft)' }}>5 de 7 preguntas son sobre la ruta</span>
            <span className="t2" style={{ fontSize: 16 }}>2 sobre la distancia · ninguna sobre clima u hora</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ E4 · Asimetría ═════════════ */
function Phone({ children, d = 0 }) {
  return (
    <div className="phone rv" style={{ '--d': d }}>
      <div className="phone-notch" />
      <div className="phone-status"><span>9:41</span><span>●●● 5G</span></div>
      {children}
    </div>
  )
}
function Asimetria() {
  return (
    <div className="slide">
      <Head ent={E(4)} eje="El costo de equivocarse" track="recargo" title={<>No todos los errores <em>cuestan lo mismo</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 28, flex: 'none' }}>
        {/* Error 1: no avisa y hay recargo */}
        <div className="card asim-error rv" style={{ '--d': 2, borderColor: 'color-mix(in srgb, var(--bad) 40%, transparent)', background: 'linear-gradient(180deg, var(--bad-soft), transparent 75%), var(--card)' }}>
          <header className="asim-error-head">
            <h3 className="asim-error-title bad">Falso negativo</h3>
            <p>No avisa y hay recargo</p>
          </header>
          <div className="phone-big"><Phone d={3}>
            <div className="ph-app">Lyft<span className="ph-route">Back Bay → Fenway</span></div>
            <div className="ph-row"><span>Tarifa estimada</span><span className="muted">sin aviso</span></div>
            <div className="ph-btn">Pedir viaje</div>
            <div className="ph-receipt pop" style={{ '--d': 10 }}>
              <div className="ph-small">Recargo por demanda ×1,46</div>
              <div className="ph-big bad">+USD 8,73</div>
            </div>
          </Phone></div>
          <div>
            <div className="num" style={{ fontSize: 64, lineHeight: 1, marginTop: 16, color: 'var(--bad)', whiteSpace: 'nowrap' }}><Num value={8.73} format={(v) => '−USD ' + fDec(v, 2)} delay={900} /></div>
          </div>
        </div>
        {/* Error 2: avisa y no había */}
        <div className="card asim-error rv" style={{ '--d': 4 }}>
          <header className="asim-error-head">
            <h3 className="asim-error-title">Falso positivo</h3>
            <p>Avisa y no había recargo</p>
          </header>
          <div className="phone-big"><Phone d={5}>
            <div className="ph-alert pop" style={{ '--d': 12 }}>
              <b>⚠ Posible recargo</b>
              <span>Compará con la otra app o esperá unos minutos</span>
            </div>
            <div className="ph-app">Lyft<span className="ph-route">Back Bay → Fenway</span></div>
            <div className="ph-btn ghost">Comparar</div>
            <div className="ph-receipt pop" style={{ '--d': 16 }}>
              <div className="ph-small">Resultado</div>
              <div className="ph-big good">✓ Tarifa normal</div>
            </div>
          </Phone></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
              <div className="num" style={{ fontSize: 64, lineHeight: 1, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>−USD 1</div>
              <span className="supuesto-tag">supuesto</span>
            </div>
            <p className="say" style={{ fontSize: 24, marginTop: 18 }}>Perdió unos minutos comparando <B>sin necesidad</B>.</p>
          </div>
        </div>
      </div>
      <div className="asim-formula-line rv" style={{ '--d': 8 }}>
        <span className="label">¿De dónde sale 8,73?</span>
        <span className="afl-eq"><b>recargo</b> = precio − precio ÷ multiplicador</span>
        <span className="muted">· promedio en 16.047 recargos =</span>
        <b className="num bad">USD 8,73</b>
      </div>
    </div>
  )
}

/* ═════════════ E4 · Simulador del umbral ═════════════ */
/* ═════════════ E4 · Corrección: costo del falso negativo ═════════════ */
function FalsoNegativo() {
  return (
    <div className="slide">
      <Head ent={E(4)} eje="Matriz de confusión" track="recargo" title={<>Lo peor es decir “sin recargo” <em>y que haya</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '24px 32px', flex: 'none', display: 'grid', placeItems: 'center' }}><MatrizFN width={1200} /></div>
    </div>
  )
}

function Umbral() {
  const [t, setT] = useState(FINAL.umbral)
  const cur = useMemo(() => UMBRALES.reduce((a, p) => (Math.abs(p.t - t) < Math.abs(a.t - t) ? p : a), UMBRALES[0]), [t])
  const pct = ((t - 0.2) / 0.6) * 100
  const presets = [[FINAL.umbral, `Elegido · ${fDec(FINAL.umbral, 2)}`], [FINAL.umbralAntes, `Antes · ${fDec(FINAL.umbralAntes, 2)}`]]
  const escapan = cur.fn / (cur.fn + cur.tp), avisa = (cur.tp + cur.fp) / (cur.tp + cur.fp + cur.fn + cur.tn)
  return (
    <div className="slide umbral-slide">
      <Head ent={E(4)} eje="Umbral de aviso" track="recargo" title={<>¿Cuándo conviene avisar? <em>Buscamos el menor costo</em></>} />
      <div className="umbral-paneles2">
        <section className="card recargo-card rv" style={{ '--d': 3, padding: '26px 30px' }}>
          <div className="um-top">
            <div className="um-regla">Avisar si el riesgo ≥ <span className="num">{fDec(cur.t, 2)}</span></div>
            <div className="um-presets">{presets.map(([v, l]) => <button key={v} className={'chip btn' + (Math.abs(cur.t - v) < 0.0001 ? ' on' : '')} onClick={() => setT(v)}>{l}</button>)}</div>
          </div>
          <input className="um-range" type="range" min={0.2} max={0.8} step={0.0001} value={t} style={{ '--p': pct + '%' }} onChange={(e) => setT(+e.target.value)} aria-label="Límite del puntaje de riesgo para avisar" aria-valuetext={fDec(cur.t, 4)} />
          <BeneficioCurva t={cur.t} elegido={FINAL.umbral} antes={FINAL.umbralAntes} width={800} height={300} />
          <p className="um-explica" key={cur.t < FINAL.umbral - 0.03 ? 'a' : Math.abs(cur.t - FINAL.umbralAntes) < 0.03 ? 'b' : cur.t > FINAL.umbral + 0.03 ? 'c' : 'd'}>
            {cur.t < FINAL.umbral - 0.03 ? <>Límite muy bajo: avisa casi siempre y <B c="var(--bad)">las falsas alarmas se acumulan</B>.</>
              : Math.abs(cur.t - FINAL.umbralAntes) < 0.03 ? <>Con <B>0,57</B> (antes) <B c="var(--bad)">se escapaba casi la mitad</B> de los recargos.</>
              : cur.t > FINAL.umbral + 0.03 ? <>Menos avisos, pero <B c="var(--bad)">se escapan más recargos</B>, y cada uno cuesta USD 8,73.</>
              : <><B>{fDec(FINAL.umbral, 2)}</B>: el menor costo en validación. Se escapa solo <B c="var(--good)">1 de cada 10</B> recargos.</>}
          </p>
          <div className="um-stats">
            <div><span className="label">Se escapan</span><span className="num" style={{ color: escapan > 0.2 ? 'var(--bad)' : 'var(--good)' }}>{fDec(escapan * 100, 0)} %</span><small>de los recargos</small></div>
            <div><span className="label">Avisa en</span><span className="num">{fDec(avisa * 100, 0)} %</span><small>de las cotizaciones</small></div>
          </div>
        </section>
        <section className="card umbral-cliente2 rv" style={{ '--d': 4 }}>
          <div className="phone-big"><Phone d={5}>
            <div className="ph-alert pop" style={{ '--d': 7 }}>
              <b>⚠ Posible recargo</b>
              <span>Compará con otra app o esperá unos minutos.</span>
            </div>
            <div className="ph-app">Lyft<span className="ph-route">Back Bay → Fenway</span></div>
            <div className="ph-btn ghost">Comparar opciones</div>
            <div className="ph-receipt pop" style={{ '--d': 9 }}>
              <div className="ph-small">Si evitás el recargo</div>
              <div className="ph-big good">Ahorrás USD {fDec(RECARGO.sobreprecioMedio, 2)}</div>
            </div>
          </Phone></div>
          <div className="um-ahorro rv" style={{ '--d': 8 }}>
            <span className="num">+USD {fDec(FINAL.vp, 2)}</span>
            <span>por aviso correcto</span>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ═════════════ E4 · Recomendaciones ═════════════ */
function Recomendaciones() {
  const DATO = {
    Pasajero: ['hasta 7×', 'más recargo según la zona de salida'],
    Conductor: ['13,4 % vs 1,8 %', 'Back Bay frente a North End'],
    Plataforma: ['USD 1,08', 'de error al estimar la tarifa'],
  }
  const recs = [
    ['Pasajero', [
      ['recargo', 'Saliendo de zonas calientes, compará con la otra app.'],
      ['precio', <>Económicos: <Brand name="Lyft" size={25} />. Black: <Brand name="Uber" size={25} />.</>],
      ['precio', 'La lluvia no encarece el viaje.'],
    ]],
    ['Conductor', [
      ['recargo', 'Las zonas con recargo son estables.'],
      ['recargo', 'La hora no garantiza recargo.'],
    ]],
    ['Plataforma', [
      ['precio', 'La tarifa base es predecible: comunicarla.'],
      ['recargo', 'Cuidar el “sin recargo”: hoy acierta el 97 %.'],
    ]],
  ]
  return (
    <div className="slide">
      <Head ent={E(4)} eje="Qué valor ofrecemos" track="ambas" title={<>Qué puede hacer <em>cada actor</em> con esto</>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26 }}>
        {recs.map(([who, items], i) => (
          <div key={who} className="card rv actor-card" style={{ '--d': 2 + i * 2, padding: '36px 34px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--accent)' }}>
              <span className="actor-ico" style={{ animationDelay: `${i * 0.6}s` }}><ActorIcon who={who} size={60} /></span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 42, color: 'var(--text)' }}>{who}</span>
            </div>
            <ul className="clean" style={{ display: 'grid', gap: 22, marginTop: 30 }}>
              {items.map(([tr, t], j) => (
                <li key={j} className="rv" style={{ '--d': 3 + i * 2 + j, display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, fontSize: 25, lineHeight: 1.45, color: 'var(--text-2)' }}>
                  <i className="dot" style={{ marginTop: 10, background: tr === 'precio' ? 'var(--precio)' : 'var(--recargo)' }} />
                  <span style={{ minWidth: 0 }}>{t}</span>
                </li>
              ))}
            </ul>
            <div className="actor-dato rv" style={{ '--d': 8 + i }}>
              <span className="num">{DATO[who][0]}</span>
              <span>{DATO[who][1]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="legend rv" style={{ '--d': 10, marginTop: 20 }}>
        <span><i className="dot" style={{ background: 'var(--precio)' }} />Viene del análisis del precio</span>
        <span><i className="dot" style={{ background: 'var(--recargo)' }} />Viene del análisis del recargo</span>
      </div>
    </div>
  )
}

/* ═════════════ E4 · Hipótesis ═════════════ */
function Hipotesis() {
  const hs = [
    ['H1', 'Hay patrones por hora y día', false, 'Según la hora, el recargo solo va de 7,0 % a 9,6 %'],
    ['H2', 'La categoría del servicio y la distancia definen el precio', true, 'La categoría del servicio explica el 77 % y la distancia el 12 %'],
    ['H3', 'El mal clima encarece los viajes', false, 'Recargo con lluvia 7,9 % vs 8,3 % sin lluvia'],
    ['H4', 'Los productos forman grupos tarifarios', true, '3 familias de tarifa: económico, intermedio y premium'],
  ]
  return (
    <div className="slide">
      <Head ent={E(4)} eje="Hipótesis · balance" track="ambas" title={<>Lo que creíamos al empezar, <em>y lo que encontramos</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '320px 1fr', gap: 50, alignItems: 'center' }}>
        <div className="rv" style={{ '--d': 2 }}><Donut ok={2} total={4} size={300} /></div>
        <div style={{ display: 'grid', gap: 10 }}>
          {hs.map(([k, h, ok, ev], i) => (
            <div key={k} className="card rv hyp-row" style={{ '--d': 3 + i, borderLeft: `4px solid ${ok ? 'var(--good)' : 'var(--bad)'}` }}>
              <span className="num muted" style={{ fontSize: 20 }}>{k}</span>
              <span><span style={{ fontSize: 22, display: 'block' }}>{h}</span><span className="t2" style={{ fontSize: 16 }}>{ev}</span></span>
              <span className={'hyp-stamp ' + (ok ? 'ok' : 'no')} style={{ animationDelay: `${1.2 + i * 0.35}s` }}>{ok ? '✓ Confirmada' : '✗ No se cumple'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═════════════ Cierre ═════════════ */
/* ═════════════ Gracias ═════════════ */
function Gracias() {
  return (
    <div className="slide free portada">
      <div className="portada-mapa" aria-hidden><MapaRutas fit w={1300} h={760} /></div>
      <div className="portada-centro">
        <div className="gracias-t pop-in" style={{ '--d': 2 }}>¡Gracias!</div>
        <div className="portada-logos" style={{ marginTop: 30 }}>
          <span className="pop-in" style={{ '--d': 6 }}><Brand name="Uber" size={64} /></span>
          <span className="portada-vs pop-in" style={{ '--d': 8, fontSize: 30 }}>vs</span>
          <span className="pop-in" style={{ '--d': 10 }}><Brand name="Lyft" size={64} /></span>
        </div>
        <div className="portada-grupo rv" style={{ '--d': 12, fontSize: 48, marginTop: 40 }}>Grupo 11</div>
        <div className="t2 rv portada-equipo" style={{ '--d': 14 }}>{EQUIPO.join(' · ')}</div>
      </div>
    </div>
  )
}

function Cierre() {
  return (
    <div className="slide free" style={{ padding: '64px 88px 96px', justifyContent: 'center' }}>
      <div className="kicker rv">Conclusión · el recorrido completo</div>
      <div className="rv" style={{ '--d': 1, marginTop: 10 }}><ForkLine width={1424} height={200} /></div>
      <div className="grid rv" style={{ '--d': 6, gridTemplateColumns: '1fr 1fr', gap: 26, marginTop: 10 }}>
        <div className="card precio-card" style={{ padding: '30px 36px' }}>
          <Track v="precio" />
          <p style={{ fontFamily: 'var(--serif)', fontSize: 42, lineHeight: 1.1, marginTop: 18 }}>Es una fórmula predecible.</p>
          <div className="num precio" style={{ fontSize: 72, marginTop: 16 }}>USD 1,08</div>
          <p className="t2" style={{ fontSize: 20, marginTop: 4 }}>de error medio, con categoría del servicio y distancia</p>
        </div>
        <div className="card recargo-card" style={{ padding: '30px 36px' }}>
          <Track v="recargo" />
          <p style={{ fontFamily: 'var(--serif)', fontSize: 42, lineHeight: 1.1, marginTop: 18 }}>Se anticipa: 9 de cada 10 recargos.</p>
          <div className="num recargo" style={{ fontSize: 72, marginTop: 16 }}>90 %</div>
          <p className="t2" style={{ fontSize: 20, marginTop: 4 }}>de los recargos anticipados · al decir “sin recargo” acierta el 97 %</p>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ Anexo · preguntas ═════════════ */
function AnexoPreguntas() {
  const qa = [
    ['¿Por qué la exactitud baja a 37 %?', 'Para que no se escapen recargos, el modelo avisa en 7 de cada 10 cotizaciones. Decir siempre “no” da 91,7 % de exactitud y 0 recargos detectados; el modelo anticipa el 90 % (exactitud balanceada 61 %, azar = 50 %).'],
    ['¿Por qué no separar al azar?', 'En el 95,7% de los grupos ruta–minuto los productos comparten el recargo. Al azar, las gemelas quedan en train y test y el PR-AUC se infla hasta +147%.'],
    ['¿Por qué SMOTE no sirvió?', 'Interpola variables 0/1 y crea cotizaciones imposibles; tuvo el peor PR-AUC en validación.'],
    ['¿De dónde sale el umbral 0,35?', 'Del menor costo total en validación, con el falso negativo a −USD 8,73 (antes, con FN = 0, era 0,57). Se aplicó tal cual a la prueba.'],
    ['¿Por qué el recargo no supera ~0,68 de ROC-AUC?', 'Depende de pedidos y conductores en tiempo real, que no están en los datos. Los cuatro algoritmos topan igual.'],
    ['¿Es legítimo usar el surge para predecir el precio?', 'Sí: la app lo muestra al cotizar. Sin él: MAE USD 1,32 en vez de 1,08.'],
    ['¿Por qué log(precio)?', 'La asimetría pasa de 1,05 a −0,10 y los errores pasan a ser relativos.'],
    ['¿Por qué solo Lyft para el recargo?', 'En Uber el multiplicador vale siempre 1 (precio cerrado). Inferirlo por precio por milla acertaba solo el 61%.'],
  ]
  const SENS = SENS_FN.map((r) => [r.costo ? `USD ${fDec(r.costo, 2)}` : 'USD 0 (antes)', fDec(r.umbral, 2), `${fDec(r.escapan * 100, 1)} %`, `${fDec(r.avisa * 100, 0)} %`, r.costo === 8.73])
  return (
    <div className="slide">
      <Head eje="Anexo · para la defensa" title={<>Preguntas <em>probables</em></>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {qa.map(([q, a], i) => (
          <div key={q} className="card rv" style={{ '--d': 2 + i * 0.5, padding: '16px 20px' }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{q}</div>
            <p className="t2" style={{ fontSize: 16, marginTop: 6, lineHeight: 1.45 }}>{a}</p>
          </div>
        ))}
        <div className="card rv" style={{ '--d': 7, padding: '16px 20px', gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>¿Qué valores de la matriz son supuestos? <span className="supuesto-tag" style={{ marginLeft: 6 }}>supuesto</span></div>
            <p className="t2" style={{ fontSize: 16, marginTop: 6, lineHeight: 1.45 }}>El recargo medio (USD 8,73) sale de los datos. Son supuestos la <b>falsa alarma</b> (USD 1: unos minutos comparando) y el <b>costo extra del falso negativo</b> (USD 8,73: la confianza rota, además del ahorro perdido). Si el costo del FN cambia:</p>
          </div>
          <table className="sens">
            <thead><tr><th>Costo del FN</th><th>Umbral</th><th>Se escapan</th><th>Avisa en</th></tr></thead>
            <tbody>{SENS.map((r) => <tr key={r[0]} className={r[4] ? 'on' : undefined}>{r.slice(0, 4).map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ Índice + guion ═════════════ */
const S = (id, ent, eje, titulo, inicio, fin, C, notas) => ({ id, ent, eje, titulo, inicio, fin, C, notas })
export const SLIDES = [
  // ── Intro
  S('portada', 0, 'Portada', 'Portada', '0:00', '0:20', Portada, [
    'Buenas. Somos el Grupo 11, y hoy comparamos Uber y Lyft en Boston.',
  ]),
  // ── Dominio
  S('dominio', 1, 'El dataset', 'Un dataset de cotizaciones', '0:20', '0:45', Dominio, [
    'El dataset: plataformas de viaje en Boston, fines de 2018. Cada fila es una **cotización**, lo que la app ofrecía cobrar, no un viaje hecho.',
    'Arrancamos con **57 columnas**, y **más de dos tercios eran clima**: había mucho para limpiar.',
  ]),
  S('hipotesis-ini', 1, 'Hipótesis', 'Qué define el precio y cuándo aparece el recargo', '0:45', '1:15', HipotesisIniciales, [
    'Nuestra pregunta: **qué define el precio** de un viaje y **cuándo aparece el recargo**. Analizamos casi 700 mil cotizaciones de Uber y Lyft en Boston.',
    'Arrancamos con **cuatro hipótesis**: patrones por hora y día, que la categoría del servicio y la distancia definen el precio, que el mal clima encarece los viajes y que los productos forman grupos tarifarios. Al final volvemos a ellas.',
  ]),
  // ── ETL
  S('limpieza', 2, 'Limpieza', 'Limpiar con criterio de dominio', '1:15', '1:35', Limpieza, [
    'ETL. Conservamos el **91,8%**. Lo más grande: **55 mil Taxis sin precio**. No los imputamos, porque cobran por taxímetro y no hay referencia.',
  ]),
  S('utc', 2, 'Limpieza · horario', 'La hora estaba en UTC', '1:35', '1:50', HoraUTC, [
    'La hora decía Boston pero **estaba en UTC**. La pasamos a **UTC − 5**: sin corregirlo, el pico de las 8 aparecía a las 13 y todos los patrones horarios quedaban corridos.',
  ]),
  S('uber-esconde', 2, 'Recargo · Uber vs Lyft', 'Uber esconde su recargo', '1:50', '2:10', UberEsconde, [
    'Sobre el **recargo**: **Uber es una caja negra**, cobra precio cerrado y nunca muestra el multiplicador. Lyft sí. Deducirlo acertaba solo el 61%, así que el recargo se estudia **solo con Lyft**.',
  ]),
  S('tratamiento', 2, 'Precio · variable a predecir', 'Cómo preparamos el precio', '2:10', '2:23', TratamientoPrecio, [
    '**Precio**: unos pocos viajes muy caros, hasta USD 97,5, estiraban la distribución (asimetría 1,05). Con el **logaritmo** queda casi simétrica (−0,10) y el modelo aprende errores en proporción al precio.',
    'El mismo error de **USD 2** representa el **20 %** de un viaje de USD 10 y el **5 %** de uno de USD 40.',
  ]),
  S('tratamiento-recargo', 2, 'Recargo · variable a predecir', 'Cómo preparamos el recargo', '2:23', '2:35', TratamientoRecargo, [
    '**Recargo**: venía en 6 multiplicadores, de ×1,25 a ×3, y cada uno por separado era muy poco. Los unimos en **sí / no**: **20.975 con recargo, el 8,2 %**.',
    'Para anticiparlo, **no usamos el precio final ni el multiplicador como entrada**, porque revelarían la respuesta.',
  ]),
  S('clima-hora', 2, 'Recargo · la hora', 'La hora no cambia el recargo', '2:35', '2:55', ClimaHoraRecargo, [
    'Si hubiera patrones por hora, esta línea tendría picos claros. Es **casi plana**: a cualquier hora, el recargo aparece más o menos igual. **H1 no se confirma.**',
  ]),
  S('h-clima', 2, 'Recargo · el clima', 'Con lluvia, el recargo no aumenta', '2:55', '3:15', MitoClima, [
    'En las cotizaciones de **Lyft**, el recargo aparece en el **7,9 % con lluvia** y en el **8,3 % sin lluvia**. Con lluvia hay incluso un poco menos: **0,4 puntos porcentuales** de diferencia. **H3 no se confirma.**',
  ]),
  S('h-zonas', 2, 'Recargo · la zona', 'El recargo depende del lugar', '3:15', '3:30', HallazgoZonas, [
    'Lo que sí influye es la **zona**: saliendo de Back Bay el recargo es **7,3 veces** más frecuente que desde North End.',
  ]),
  S('h-formula', 2, 'Precio · qué lo define', 'El precio es una fórmula', '3:30', '3:50', HallazgoFormula, [
    'Sobre el **precio**: la **categoría del servicio** y la **distancia** lo definen casi todo. **El horario no afecta el precio**, ni el clima. H2 se confirma.',
  ]),
  S('columnas', 2, 'Resultado del ETL', 'De 57 a 27 columnas', '3:50', '4:05', Columnas, [
    'Resultado del ETL: de **57 columnas pasamos a 27**. Sacamos clima repetido, horas en UTC, coordenadas y copias, y creamos 11 nuevas, como la hora local y has_surge.',
  ]),
  // ── Modelado
  S('m-desbalance', 3, 'Balanceo de datos', 'Cómo aprender con 8% de recargos', '4:05', '4:30', ModeloDesbalance, [
    'Primero, **balanceamos**: sin hacer nada, el modelo dice siempre que no y **acierta 91,7% sin detectar nada**.',
    'Probamos sin balanceo, submuestreo, SMOTE y **pesos de clase**. Elegimos pesos de clase: **no tira datos ni inventa cotizaciones** que no tienen sentido.',
  ]),
  S('m-recargo', 3, 'Modelos · recargo', 'Por qué elegimos gradient boosting', '4:30', '4:55', ModelosRecargo, [
    'Para el **recargo** probamos regresión logística, árbol, random forest y **gradient boosting**. Elegimos gradient boosting: cada árbol corrige los errores del anterior y fue el mejor en validación, **0,136 contra 0,126**.',
  ]),
  S('m-precio', 3, 'Modelos · precio', 'El precio se predice con un dólar de error', '4:55', '5:15', ModeloPrecio, [
    'Para el **precio** probamos Ridge, árbol y **random forest**. Elegimos random forest: el de menor error en validación. En la prueba, **USD 1,08 de error medio**.',
  ]),
  S('m-kmeans', 3, 'Modelos · no supervisado', '3 familias de tarifa', '5:15', '5:30', ModeloKMeans, [
    'Con **K-Means** encontramos **3 familias de tarifa**, y cada producto de Uber cae junto a su par de Lyft. **H4 se confirma.**',
  ]),
  // ── Conclusión
  S('v-asimetria', 4, 'El costo de equivocarse', 'No todos los errores cuestan lo mismo', '5:30', '5:55', Asimetria, [
    'Conclusión. **No todos los errores cuestan lo mismo**. Si la app no avisa y hay recargo, el pasajero paga **USD 8,73** de sorpresa. Si avisa y no había, perdió unos minutos: lo valuamos en **USD 1**, un supuesto.',
    'Un recargo sin aviso pesa como **16,5 falsas alarmas**: el ahorro perdido más la confianza rota, que suponemos igual al recargo medio.',
  ]),
  S('v-fn', 4, 'Matriz de confusión', 'Lo peor es decir sin recargo y que haya', '5:55', '6:25', FalsoNegativo, [
    'La docente nos marcó que **lo peor es decir “sin recargo” y que haya**. Antes ese error valía USD 0 y el umbral 0,57 dejaba escapar **casi la mitad** de los recargos.',
    '(Señalar la matriz.) Mismo modelo, nuevo umbral **0,35**: los recargos que se escapan bajan del **47 % al 10 %**, y el “sin recargo” acierta el **97 %**. El costo: avisa en 7 de cada 10 cotizaciones.',
  ]),
  S('v-umbral', 4, 'Umbral de aviso', '¿Cuándo conviene avisar?', '6:25', '6:55', Umbral, [
    'Para cada límite sumamos **USD 7,73 por acierto** y restamos **USD 1 por falsa alarma** y **USD 8,73 por recargo sin aviso**. El **0,35** dio el menor costo en validación y lo aplicamos sin cambiarlo.',
    '(Mover a «Antes: 0,57» y volver a «Elegido».) La curva es la prueba final: el 0,35 cae en la zona plana, cerca del mínimo.',
  ]),
  S('hipotesis', 4, 'Hipótesis · balance', 'Lo que creíamos y lo que encontramos', '6:55', '7:10', Hipotesis, [
    'De las 4 hipótesis, **2 se confirmaron**: la categoría del servicio y la distancia definen el precio, y los productos forman grupos. **2 no**: ni la hora ni el clima.',
  ]),
  S('cierre', 4, 'Conclusión', 'Conclusión', '7:10', '7:30', Cierre, [
    'En resumen: el **precio** es una fórmula y se predice con un dólar de error. El **recargo** se anticipa: **9 de cada 10**, y cuando la app dice “sin recargo” acierta el 97 %.',
  ]),
  S('gracias', 4, 'Gracias', '¡Gracias!', '7:30', '7:35', Gracias, [
    'Muchas gracias. ¿Preguntas?',
  ]),
]
