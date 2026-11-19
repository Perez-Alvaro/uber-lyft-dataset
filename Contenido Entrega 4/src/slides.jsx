import { useMemo, useState } from 'react'
import { Head, Num, Track, Figura, Brand, useSteps, useDeck, fInt, fDec, fPct, fUsd } from './lib/ui.jsx'
import { findImg } from './data/gallery.js'
import {
  HBar, Dumbbell, Waterfall, ZoneMap, FareCompare, tarifaEn, Balanceo,
  KMeansScatter, Curvas, BeneficioCurva, UMBRALES, N_TEST, ForkLine, SurgeCollapse,
  ColumnBlocks, UtcBig, AsymBars, Donut, ActorIcon, PistaPanel, LimpiezaFlow, ColumnasFlow, ErrorRelativo, RecargoSiNo, Gauge, LluviaVsSeco, HoraLinea, RangoCompare, ArbolReglas,
} from './components/charts.jsx'
import {
  DATASET, PLATAFORMAS, RECARGO, ZONAS, PESO_FACTORES, REGRESION, REGRESION_SIN_SURGE, REGRESION_DATOS, IMPORTANCIA_RECARGO,
  CLASIFICACION, FINAL, SIEMPRE_NO, NIVELES, EQUIPO, PRECIO_PRODUCTO, CLIMA_CORR, COLUMNAS,
} from './data/metrics.js'

// Secciones de la barra de progreso: el recorrido por las entregas
export const ENTREGAS = {
  0: 'Inicio',
  1: 'E1 · Dominio',
  2: 'E2 · ETL y exploración',
  3: 'E3 · Modelado',
  4: 'E4 · Valor y cierre',
  5: 'Anexo',
}
const E = (n) => `Entrega ${n}`
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
    <div className="slide free" style={{ padding: '64px 88px 56px' }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 620px', alignItems: 'center', gap: 24 }}>
        <div>
          <div className="kicker rv">Trabajo Práctico Integrador · Entrega 4 · Data storytelling</div>
          <h1 className="rv" style={{ '--d': 1, fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 100, lineHeight: 0.98, margin: '28px 0 0', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            El precio es una fórmula.<br />El <em style={{ color: 'var(--accent)' }}>recargo</em>, un misterio.
          </h1>
          <p className="lede rv" style={{ '--d': 3, maxWidth: 680, fontSize: 25, marginTop: 28 }}>
            Uber y Lyft en Boston: lo que aprendimos de <B><Num value={DATASET.crudo} /></B> cotizaciones a lo largo de cuatro entregas.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 30 }}>
            <Brand name="Uber" size={46} d={6} />
            <span className="muted pop-in" style={{ '--d': 8, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 30 }}>vs</span>
            <Brand name="Lyft" size={46} d={10} />
          </div>
        </div>
        <div className="rv" style={{ '--d': 2, justifySelf: 'end' }}><MapaRutas fit w={620} h={540} /></div>
      </div>
      <div className="rv" style={{ '--d': 6, display: 'flex', gap: 48, alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 24 }}>
        <div style={{ flex: 'none' }}>
          <div className="label">Ciencia de Datos · UTN FRC · 5K1</div>
          <div style={{ fontSize: 32, fontWeight: 600, marginTop: 6 }}>Grupo 11</div>
        </div>
        <div className="t2" style={{ fontSize: 18, lineHeight: 1.6 }}>{EQUIPO.join(' · ')}</div>
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
            <p style={{ fontSize: 22, lineHeight: 1.4, fontStyle: 'italic' }}>“{p.q}”</p>
            <p className="t2" style={{ fontSize: 19, lineHeight: 1.45, marginTop: 14 }}>{p.h}</p>
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
      <Head ent={E(1)} eje="Introducción del dominio" title={<>Un dataset de <em>cotizaciones</em>, no de viajes</>} />
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
        <p className="sub">Más de dos tercios son clima: la primera pista de que había mucho para limpiar</p>
        <div style={{ marginTop: 20 }}><ColumnBlocks blocks={COLUMNAS} width={1350} /></div>
      </div>
      <p className="muted fade" style={{ '--d': 8, fontSize: 17, marginTop: 18 }}>Fuente: datos públicos de Kaggle, tomados de las APIs de precios de ambas apps (Boston, 25/11 al 18/12/2018).</p>
    </div>
  )
}

/* ═════════════ E1 · Zonas y productos ═════════════ */
function ZonasProductos() {
  const rows = PRECIO_PRODUCTO.map((p) => ({ label: p.producto, value: p.precio, text: fUsd(p.precio, 1), color: p.plataforma === 'Uber' ? 'var(--uber)' : 'var(--lyft)' }))
  return (
    <div className="slide">
      <Head ent={E(1)} eje="Introducción del dominio" title={<>12 zonas de Boston, <em>12 productos</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1fr 1.1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Las 12 zonas de origen y destino</h3>
          <p className="sub">Del centro histórico a las universidades</p>
          <MapaRutas scale={1} w={680} h={500} />
        </div>
        <div className="card rv" style={{ '--d': 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3>Precio mediano por producto</h3>
            <div className="legend" style={{ alignItems: 'center', gap: 18 }}><span><i className="sq" style={{ background: 'var(--uber)' }} /><Brand name="Uber" size={18} d={5} /></span><span><i className="sq" style={{ background: 'var(--lyft)' }} /><Brand name="Lyft" size={18} d={7} /></span></div>
          </div>
          <p className="sub">De un viaje compartido a un Black XL: de USD 7 a USD 30</p>
          <HBar rows={rows} width={640} rowH={40} labelW={130} barH={20} max={32} />
        </div>
      </div>
    </div>
  )
}

/* ═════════════ E1 · Problema ═════════════ */
function Problema() {
  return (
    <div className="slide">
      <Head ent={E(1)} eje="Introducción del dominio · el problema" track="recargo" title={<>El mismo viaje puede costar <em>hasta 67% más</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.35fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Cuánto cuesta cada producto de <Brand name="Lyft" size={23} d={4} />, sin y con recargo</h3>
          <p className="sub">Precio mediano de un mismo viaje. El tramo naranja es lo que se agrega cuando hay más pedidos que conductores (“surge”)</p>
          <Dumbbell width={740} rowH={78} />
        </div>
        <Side gap={40}>
          <div><Big c="var(--recargo)" size={74}>1 de cada 12</Big><Say size={21} style={{ marginTop: 10 }}>cotizaciones de <Brand name="Lyft" size={21} /> tiene recargo</Say></div>
          <div><Big d={6} size={74}><Num value={RECARGO.sobreprecioMedio} format={(v) => 'USD ' + fDec(v, 2)} /></Big><Say d={7} size={21} style={{ marginTop: 10 }}>de sobreprecio medio, y el pasajero <B>no sabe cuándo</B> le va a tocar</Say></div>
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
      <Head ent={E(1)} eje="Introducción del dominio · primer descubrimiento" track="recargo" title={<><Brand name="Uber" size={60} d={1} /> <em>esconde</em> su recargo. <Brand name="Lyft" size={60} d={3} /> lo muestra.</>} />
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
          <Say d={10} size={21}><Brand name="Uber" size={21} /> cobra un <B>precio cerrado</B> que esconde el multiplicador. Intentamos deducirlo y <B>acertábamos solo el 61%</B>.</Say>
          <Say d={12} size={21}><B c="var(--recargo)">Consecuencia:</B> el recargo solo se puede estudiar con <Brand name="Lyft" size={21} />, y eso nos llevó a separar el problema en dos.</Say>
          <p className="muted small rv" style={{ '--d': 13 }}>Precios de ejemplo: medianas del dataset (UberX USD 9,50 · Lyft USD 9 → 13,50 con recargo).</p>
        </div>
      </div>
    </div>
  )
}

/* ═════════════ E1 · Primeras pistas (4 paneles, de a uno) ═════════════ */
const PISTAS = [
  { img: 'insights_1.png', t: 'Lyft Shared nunca tiene recargo', d: 'El resto de los productos, todos parejos en 8,2%.' },
  { img: 'insights_2.png', t: 'La zona de origen cambia el recargo hasta 7 veces', d: 'De 1,5% en North End a 11,2% en Back Bay.' },
  { img: 'insights_3.png', t: 'Clima y hora: correlación prácticamente nula', d: 'Ninguna variable pasa de |r| = 0,006.' },
  { img: 'insights_4.png', t: 'Lo que predice es la ruta, no el clima', d: 'Ruta y producto: 0,70. Clima y hora solos: 0,50, como el azar.' },
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
          <p className="t2 rv" style={{ '--d': 9, fontSize: 18, marginTop: 8, paddingLeft: 20 }}>Eran hipótesis: en las entregas siguientes las <B>verificamos con rigor</B>.</p>
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
    ['Variable objetivo', 'price → log(price)', 'has_surge = 1 si surge_multiplier > 1'],
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
      <p className="t2 rv" style={{ '--d': 12, fontSize: 18, marginTop: 16 }}>Más un análisis no supervisado (K-Means) para agrupar los 12 productos según cómo cobran.</p>
    </div>
  )
}

/* ═════════════ E2 · Limpieza ═════════════ */
function Limpieza() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Algo importante del ETL" track="ambas" title={<>Limpiar con <em>criterio de dominio</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2, padding: '30px 34px' }}>
          <LimpiezaFlow width={790} />
        </div>
        <Side>
          <Big c="var(--bad)" size={70}>55.095</Big>
          <Say size={21}>de las filas eliminadas son <B>Taxi sin precio</B>. No las imputamos: en Boston cobran por taxímetro y no hay ninguna referencia. Eran el 100% de los nulos.</Say>
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E2 · Columnas ═════════════ */
function Columnas() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Algo importante del ETL" title={<>De 57 a 27 columnas: <em>menos es más</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '30px 32px 20px', flex: 'none' }}>
        <ColumnasFlow width={1360} />
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 50, marginTop: 26 }}>
        <Say d={5}>Eliminamos <B>41 columnas</B>: 31 de clima repetido o sin relación, 6 de tiempo en UTC, 2 coordenadas y 2 copias.</Say>
        <Say d={7}>Creamos <B>11 nuevas</B>: hora local, franja horaria, nivel de servicio, distancia en línea recta, has_surge…</Say>
      </div>
    </div>
  )
}

/* ═════════════ E2 · UTC ═════════════ */
function HoraUTC() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Algo importante del ETL" title={<>La hora decía Boston, pero <em>estaba en UTC</em></>} />
      <div className="card rv" style={{ '--d': 2, padding: '34px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="label">Hora en el dataset</span><span className="label bad">Coincidía con UTC en el 100% de las filas</span></div>
        <div style={{ margin: '14px 0' }}><UtcBig width={1360} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="label">Hora real en Boston (UTC − 5)</span><span className="label acc">Corregido</span></div>
      </div>
      <Say d={8} style={{ marginTop: 34 }}>Sin corregirlo, el <B>pico de las 8 de la mañana</B> aparecía a las <B c="var(--bad)">13</B>, y todos los patrones horarios quedaban corridos 5 horas.</Say>
    </div>
  )
}

/* ═════════════ E2 · Tratamiento por variable ═════════════ */
function Tratamiento() {
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Algo importante del ETL" track="ambas" title={<>Cómo preparamos <em>el precio y el recargo</em></>} />
      <div className="tratamiento-grid">
        <section className="card precio-card tratamiento-col rv" style={{ '--d': 2, '--variable': 'var(--precio)' }}>
          <Track v="precio" />
          <h2>El mismo error pesa distinto</h2>
          <div className="tratamiento-grafico" style={{ paddingTop: 14 }}>
            <ErrorRelativo width={620} />
          </div>
          <div className="tratamiento-paso">
            <span className="num">precio</span><span className="tp-arrow">→</span><span className="num">log(precio)</span><span className="tp-arrow">→</span><span className="num">predicción en USD</span>
          </div>
          <p className="tratamiento-idea">Con el logaritmo el modelo aprende de los <B>errores en proporción al precio</B>, no en dólares sueltos.</p>
        </section>
        <section className="card recargo-card tratamiento-col rv" style={{ '--d': 3, '--variable': 'var(--recargo)' }}>
          <Track v="recargo" />
          <h2>Simplificamos a “sí” o “no”</h2>
          <div className="tratamiento-grafico tratamiento-grafico-recargo">
            <p className="tratamiento-contexto">Cotizaciones de Lyft según el aumento aplicado: <B>todas pasan a ser “sí”</B></p>
            <RecargoSiNo width={620} />
          </div>
          <div className="tratamiento-ejemplos tratamiento-clases">
            <div><span>Sin aumento<br /><span className="num" style={{ fontSize: 15 }}>{fInt(RECARGO.filas - RECARGO.positivos)}</span></span><strong>No</strong></div>
            <div><span>Cualquier aumento<br /><span className="num" style={{ fontSize: 15 }}>{fInt(RECARGO.positivos)} · {fDec(RECARGO.tasa * 100, 1)} %</span></span><strong>Sí</strong></div>
          </div>
          <p className="tratamiento-idea">Anticipamos <B>si habrá recargo</B>. Usamos solo Lyft, sin el servicio Shared.</p>
        </section>
      </div>
      <p className="tratamiento-cierre rv" style={{ '--d': 4 }}>Para anticipar el recargo usamos ruta, hora y clima. <B>El precio final y el multiplicador quedan fuera</B>: ya revelan la respuesta.</p>
    </div>
  )
}

/* ═════════════ E2 · Hallazgo: fórmula del precio ═════════════ */
function HallazgoFormula() {
  const rows = PESO_FACTORES.filter((f, i) => i !== 1 && i < 9).map((f, i) => ({
    label: f.label, value: f.v, text: fDec(f.v, 1) + '%', strong: i < 2, color: i < 2 ? 'var(--precio)' : 'var(--neutral)',
  }))
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Qué hallazgos encontramos" track="precio" title={<>El precio es una fórmula: <em>producto + distancia</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.45fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Qué parte de la variación del precio explica cada variable</h3>
          <p className="sub">Cada una por sí sola, sobre las {fInt(DATASET.limpio)} cotizaciones</p>
          <HBar rows={rows} width={820} rowH={54} labelW={270} barH={26} max={100} tip={(r) => <><b>{r.label}</b><br />explica el {r.text} de la variación del precio</>} />
        </div>
        <Side gap={30}>
          <div className="rv formula-eq" style={{ '--d': 3 }}>
            <span>precio ≈</span><span className="fx-chip">producto</span><span>+</span><span className="fx-chip">distancia</span>
          </div>
          <div className="rv" style={{ '--d': 4, display: 'flex', gap: 22, justifyContent: 'space-between' }}>
            <Gauge value={77.4} label="Producto elegido" d={5} />
            <Gauge value={11.9} label="Distancia" color="color-mix(in srgb, var(--precio) 65%, var(--card))" d={8} />
            <Gauge value={0} label="Hora y clima" muted d={11} />
          </div>
          <Say d={7} size={21}>Cada variable por sí sola: lo que el pasajero <B>elige</B> y lo que <B>recorre</B> definen casi todo el precio. La <B>hora</B> y el <B>clima</B>, nada.</Say>
          <p className="rv h-pill good-pill" style={{ '--d': 9 }}>Hipótesis H1 · ✓ confirmada</p>
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
          <p className="sub">Elegí el nivel y pasá el mouse por el gráfico</p>
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
  const rows = CLIMA_CORR.map((c) => ({
    label: c.label, value: Math.abs(c.r), text: (c.r < 0 ? '−' : '') + fDec(Math.abs(c.r), 3),
    color: c.label.startsWith('Distancia') ? 'var(--precio)' : 'var(--neutral)', strong: c.label.startsWith('Distancia'),
  }))
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Qué hallazgos encontramos · mito derribado" track="ambas" title={<>“Cuando llueve, el viaje sale más caro.” <em>No.</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Correlación de cada variable climática con el precio</h3>
          <p className="sub">La distancia, como referencia de lo que sí importa</p>
          <HBar rows={rows} width={800} rowH={54} labelW={240} barH={26} max={0.4} />
          <p className="rv" style={{ '--d': 9, fontSize: 17, color: 'var(--text-2)', margin: '10px 0 0' }}>Las 7 variables de clima quedan en <b>≈ 0</b>; la distancia, en <b style={{ color: 'var(--precio)' }}>0,345</b>.</p>
        </div>
        <Side gap={26}>
          <div className="label rv" style={{ '--d': 3 }}>¿Hay más recargo cuando llueve?</div>
          <LluviaVsSeco lluvia={RECARGO.lluvia} seco={RECARGO.seco} />
          <Say d={10} size={21}>Prácticamente igual: con lluvia hay incluso <B>un poco menos</B> de recargo.</Say>
          <p className="rv h-pill bad-pill" style={{ '--d': 11 }}>Hipótesis H5 “el mal clima encarece los viajes” · ✗ rechazada</p>
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E2 · Hallazgo: zonas ═════════════ */
function HallazgoZonas() {
  const max = ZONAS[0].tasa, min = ZONAS[ZONAS.length - 1].tasa
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Qué hallazgos encontramos" track="recargo" title={<>El recargo depende del <em>lugar</em></>} />
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
          <Say d={9} size={20}>Las zonas calientes: <B>universidades, Fenway, Back Bay y Theatre District</B>. Las del norte casi no tienen recargo.</Say>
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
          <p className="sub">Hora local de Boston · Lyft sin Shared · promedio general 8,2 %</p>
          <HoraLinea width={860} height={400} />
        </div>
        <div className="card rv" style={{ '--d': 4, display: 'flex', flexDirection: 'column' }}>
          <h3>¿Qué mueve más el recargo?</h3>
          <p className="sub">Diferencia entre el valor más bajo y el más alto de recargo</p>
          <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}><RangoCompare width={380} /></div>
          <p className="rv" style={{ '--d': 16, fontSize: 18, color: 'var(--text-2)', margin: '0 0 14px' }}>La zona mueve el recargo <B>casi 4 veces más</B> que la hora.</p>
          <p className="rv h-pill bad-pill" style={{ '--d': 12, alignSelf: 'stretch', textAlign: 'center' }}>Hipótesis H3 “hay patrones por hora” · ✗ no se confirma</p>
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
  const rf = REGRESION.find((r) => r.elegido), base = REGRESION[0], ridge = REGRESION[1]
  const rows = REGRESION.map((r) => ({ modelo: r.modelo, que: QUE[r.modelo], v: r.mae, elegido: r.elegido }))
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Qué modelos usamos" track="precio" title={<>El precio se predice con <em>un dólar de error</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 32 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>¿Cuántos dólares se equivoca cada modelo, en promedio?</h3>
          <p className="sub">Prueba final: {fInt(REGRESION_DATOS.test)} cotizaciones de fechas que el modelo nunca vio · <b>menos es mejor</b></p>
          <ModelRows rows={rows} max={3.2} color="var(--precio)" fmt={(v) => fUsd(v)} />
          <p className="modelo-nota">El árbol y random forest casi empatan. Ganó random forest porque tuvo el menor error en validación, antes de mirar la prueba.</p>
        </div>
        <div className="card precio-card modelo-eleccion modelo-col rv" style={{ '--d': 4, '--modelo-color': 'var(--precio)' }}>
          <div className="label">Elegido para el precio</div>
          <h2>Random forest</h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span className="modelo-metrica num"><Num value={rf.mae} format={(v) => fUsd(v)} /></span>
            <span className="modelo-metrica-texto" style={{ margin: 0 }}>de error medio<br />por cotización</span>
          </div>
          <div className="label" style={{ marginTop: 18 }}>Por qué este modelo</div>
          <Razones color="var(--precio)" items={[
            ['Es el que menos se equivoca', `${fDec((1 - rf.mae / base.mae) * 100, 0)} % menos error que usar el precio típico`, `−${fDec((1 - rf.mae / base.mae) * 100, 0)}%`],
            ['Capta combinaciones', `producto × distancia no crece en línea recta: Ridge erra ${fUsd(ridge.mae)}`, null],
            ['Funciona en fechas nuevas', `${fDec(rf.dentro10 * 100, 0)} % de las cotizaciones con menos de 10 % de error`, '3 de 4'],
          ]} />
          <p className="modelo-nota" style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--line)' }}>Sin conocer el recargo, el error medio sube a USD {fDec(REGRESION_SIN_SURGE.mae, 2)}.</p>
        </div>
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
      <Head ent={E(3)} eje="Qué modelos usamos · no supervisado" track="precio" title={<>Los 12 productos forman <em>3 familias de tarifa</em></>} />
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
          <Say d={11} size={20}>Cada producto de <Brand name="Uber" size={20} /> cae junto a su par de <Brand name="Lyft" size={20} />: <B>compiten en espejo</B>. Hipótesis H6 <span className="good" style={{ fontWeight: 600 }}>✓</span></Say>
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E3 · Desbalance ═════════════ */
function ModeloDesbalance() {
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Qué modelos usamos · cómo entrenamos" track="recargo" title={<>Con solo 8% de recargos, <em>¿cómo se aprende?</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Lo que ve el modelo al entrenar, según la técnica</h3>
          <p className="sub">Filas por clase · a la derecha, PR-AUC en validación (gradient boosting)</p>
          <div style={{ marginTop: 18 }}><Balanceo width={760} /></div>
        </div>
        <Side gap={16}>
          <div className="trap rv" style={{ '--d': 3 }}>
            <div className="label" style={{ color: 'var(--bad)' }}>La trampa</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6 }}>
              <span className="num" style={{ fontSize: 54, color: 'var(--bad)' }}>{fPct(SIEMPRE_NO.accuracy)}</span>
              <span style={{ fontSize: 18 }}>de aciertos diciendo <B>siempre “no”</B></span>
            </div>
            <div className="t2" style={{ fontSize: 17, marginTop: 4 }}>…y <B>0</B> recargos detectados. Por eso no medimos con exactitud.</div>
          </div>
          {[['✗', 'Submuestreo', 'tira el 91 % de los datos'], ['✗', 'SMOTE', 'inventa cotizaciones “0,37 de Back Bay”'], ['✓', 'Pesos de clase', 'datos reales; errar un recargo pesa ×11']].map(([ok, t, d], i) => (
            <div key={t} className={'tech rv' + (ok === '✓' ? ' ok' : '')} style={{ '--d': 6 + i * 2 }}>
              <span className="tech-i">{ok}</span>
              <span><B>{t}</B><span className="t2" style={{ display: 'block', fontSize: 17 }}>{d}</span></span>
            </div>
          ))}
        </Side>
      </div>
    </div>
  )
}

/* ═════════════ E3 · Modelos de recargo ═════════════ */
function ModelosRecargo() {
  const [tipo, setTipo] = useState('val')
  const enValidacion = tipo === 'val'
  const QUE = {
    'Regresión logística': 'una fórmula de probabilidad en línea recta',
    'Árbol de decisión': 'una serie de preguntas sí / no',
    'Random forest': 'promedia cientos de árboles distintos',
    'Gradient boosting': 'cada árbol corrige los errores del anterior',
  }
  const gb = CLASIFICACION.find((c) => c.elegido), rf = CLASIFICACION.find((c) => c.modelo === 'Random forest'), azar = CLASIFICACION[0].prauc
  const rows = CLASIFICACION.filter((c) => c.val != null).map((c) => ({ modelo: c.modelo, que: QUE[c.modelo], v: enValidacion ? c.val : c.prauc, elegido: c.elegido }))
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Qué modelos usamos" track="recargo" title={<>Para el recargo elegimos <em>gradient boosting</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr', gap: 32 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <h3>¿Qué modelo encuentra mejor los recargos?</h3>
            <div className="seg-ctrl" style={{ flexShrink: 0 }}>
              {[['val', 'Validación'], ['test', 'Prueba'], ['pr', 'Curvas']].map(([v, label]) => <button key={v} className={tipo === v ? 'on' : ''} onClick={() => setTipo(v)}>{label}</button>)}
            </div>
          </div>
          <p className="sub">PR-AUC: qué tan bien pone primero las cotizaciones que sí tienen recargo · <b>más es mejor</b> · {enValidacion ? 'con estos datos elegimos' : tipo === 'test' ? 'prueba final, después de elegir' : 'prueba final'}</p>
          {tipo !== 'pr'
            ? <div key={tipo}><ModelRows rows={rows} max={0.16} color="var(--recargo)" fmt={(v) => fDec(v, 3)} azar={azar} /></div>
            : <Curvas tipo="pr" width={780} height={330} />}
          <p className="modelo-nota">{enValidacion ? 'Gradient boosting tuvo el mejor puntaje en validación: por eso lo elegimos.' : 'En la prueba, random forest quedó apenas arriba (0,142 vs 0,140): prácticamente un empate. No cambiamos la elección después de ver la prueba.'}</p>
        </div>
        <div className="modelo-recargo-lateral">
          <div className="card recargo-card modelo-eleccion rv" style={{ '--d': 4, '--modelo-color': 'var(--recargo)' }}>
            <div className="label">Elegido para anticipar el recargo</div>
            <h2>Gradient boosting</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span className="modelo-metrica num"><Num value={gb.val} format={(v) => fDec(v, 3)} /></span>
              <span className="modelo-metrica-texto" style={{ margin: 0 }}>PR-AUC en validación<br />el azar da ≈ {fDec(azar, 3)}</span>
            </div>
            <div className="label" style={{ marginTop: 18 }}>Por qué este modelo</div>
            <Razones color="var(--recargo)" items={[
              ['El mejor en validación', `superó a random forest (${fDec(rf.val, 3)}), el segundo`, `+${fDec((gb.val / rf.val - 1) * 100, 0)}%`],
              ['Mucho mejor que el azar', 'ordena el riesgo: los avisos caen donde hay recargo', `${fDec(gb.val / azar, 1)}×`],
              ['Aprende de sus errores', 'cada árbol nuevo se enfoca en los recargos que el anterior no vio', null],
            ]} />
          </div>
          <p className="modelo-limite rv" style={{ '--d': 9 }}>Ningún modelo pasa mucho de 0,14: para mejorar falta información de <B>pedidos y conductores en tiempo real</B>.</p>
        </div>
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
          <p className="t2" style={{ fontSize: 16, marginTop: 10 }}>Si se mezcla al azar la ruta, el modelo pierde casi todo; si se mezclan clima u hora, no cambia nada.</p>
        </div>
        <div className="card rv" style={{ '--d': 4 }}>
          <h3>Las primeras preguntas que hace el árbol de decisión</h3>
          <p className="sub">“Ruta &gt; 6,3 %” = en esa ruta hubo recargo en más del 6,3 % de las cotizaciones de entrenamiento · el % de cada caja es la parte de las filas que llega ahí</p>
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
      <Head ent={E(4)} eje="Qué valor ofrecemos" track="recargo" title={<>No todos los errores <em>cuestan lo mismo</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Error 1: no avisa y hay recargo */}
        <div className="card rv" style={{ '--d': 2, display: 'grid', gridTemplateColumns: '236px 1fr', gap: 28, alignItems: 'center', borderColor: 'color-mix(in srgb, var(--bad) 40%, transparent)', background: 'linear-gradient(180deg, var(--bad-soft), transparent 75%), var(--card)' }}>
          <Phone d={3}>
            <div className="ph-app">Lyft<span className="ph-route">Back Bay → Fenway</span></div>
            <div className="ph-row"><span>Tarifa estimada</span><span className="muted">sin aviso</span></div>
            <div className="ph-btn">Pedir viaje</div>
            <div className="ph-receipt pop" style={{ '--d': 10 }}>
              <div className="ph-small">Recargo por demanda ×1,46</div>
              <div className="ph-big bad">+USD 8,73</div>
            </div>
          </Phone>
          <div>
            <div className="label bad">Error 1 · no avisa y hay recargo</div>
            <div className="num" style={{ fontSize: 64, lineHeight: 1, marginTop: 14, color: 'var(--bad)' }}><Num value={8.73} format={(v) => '−USD ' + fDec(v, 2)} delay={900} /></div>
            <p className="say" style={{ fontSize: 20, marginTop: 14 }}>El pasajero pide tranquilo y paga el sobreprecio <B>por sorpresa</B>.</p>
          </div>
        </div>
        {/* Error 2: avisa y no había */}
        <div className="card rv" style={{ '--d': 4, display: 'grid', gridTemplateColumns: '236px 1fr', gap: 28, alignItems: 'center' }}>
          <Phone d={5}>
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
          </Phone>
          <div>
            <div className="label">Error 2 · avisa y no había recargo</div>
            <div className="num" style={{ fontSize: 64, lineHeight: 1, marginTop: 14, color: 'var(--text-2)' }}>−USD 1</div>
            <p className="say" style={{ fontSize: 20, marginTop: 14 }}>Perdió un minuto comparando, <B>y no hacía falta</B>. Una molestia.</p>
          </div>
        </div>
      </div>
      {/* Balanza */}
      <div className="card recargo-card rv" style={{ '--d': 8, marginTop: 24, display: 'grid', gridTemplateColumns: 'auto auto 1fr 420px', gap: 26, alignItems: 'center', padding: '22px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="token big pop" style={{ '--d': 18 }}>8,73</span>
          <span className="small t2" style={{ lineHeight: 1.3 }}>1 recargo<br />sorpresa</span>
        </div>
        <span className="num" style={{ fontSize: 40, color: 'var(--muted)' }}>=</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="token pop" style={{ '--d': 20 + i }}>1</span>
          ))}
          <span className="token pop" style={{ '--d': 28, fontSize: 12 }} aria-label="0,73 de una falsa alarma">0,73</span>
          <span className="small t2" style={{ marginLeft: 8, lineHeight: 1.3 }}>8,7 falsas<br />alarmas</span>
        </div>
        <p className="say" style={{ fontSize: 20 }}>
          Por eso avisar conviene aunque acierte <B>1 de cada 8,7 avisos</B> (11,4%). Cada acierto ahorra <B c="var(--good)">USD 7,73</B> netos.
        </p>
      </div>
    </div>
  )
}

/* ═════════════ E4 · Simulador del umbral ═════════════ */
function Umbral() {
  const [t, setT] = useState(FINAL.umbral)
  const cur = useMemo(() => UMBRALES.reduce((a, p) => (Math.abs(p.t - t) < Math.abs(a.t - t) ? p : a), UMBRALES[0]), [t])
  const beneficio = (cur.tp * FINAL.vp - cur.fp * FINAL.costoFalsa) / N_TEST * 1000
  const pct = ((t - 0.2) / 0.6) * 100
  const presets = [[0.3, 'Más avisos'], [FINAL.umbral, 'Elegido: 0,57'], [0.7, 'Menos avisos']]
  return (
    <div className="slide free umbral-slide">
      <Head ent={E(4)} eje="Qué valor ofrecemos" track="recargo" title={<>¿Cuándo conviene avisar? <em>Buscamos el mayor ahorro</em></>} />
      <ol className="umbral-pasos rv" style={{ '--d': 2 }}>
        <li><span className="umbral-paso-num">1</span><div><h2>Probamos distintos límites</h2><p>Más bajo: más avisos.<br />Más alto: menos avisos.</p></div></li>
        <li><span className="umbral-paso-num">2</span><div><h2>Calculamos el ahorro neto</h2><p>Un acierto suma <B c="var(--good)">≈USD 7,73</B>.<br />Una falsa alarma resta <B c="var(--bad)">USD 1</B>.</p></div></li>
        <li><span className="umbral-paso-num">3</span><div><h2>Elegimos el máximo</h2><p>En validación, el mayor ahorro fue con <B>0,57</B>.<br />Lo probamos en fechas nuevas, sin cambiarlo.</p></div></li>
      </ol>
      <div className="umbral-paneles">
        <section className="card recargo-card umbral-explorar rv" style={{ '--d': 3 }}>
          <div className="label">Explorá la regla de aviso</div>
          <p className="umbral-regla">Avisamos si el <B>puntaje de riesgo</B> alcanza <span className="num">{fDec(cur.t, 2)}</span></p>
          <div className="umbral-control">
            <input type="range" min={0.2} max={0.8} step={0.0001} value={t} style={{ '--p': pct + '%' }} onChange={(e) => setT(+e.target.value)} aria-label="Límite del puntaje de riesgo para avisar" aria-valuetext={fDec(cur.t, 4)} />
            <div className="umbral-presets">{presets.map(([v, l]) => <button key={v} className="chip btn" style={Math.abs(cur.t - v) < 0.0001 ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--text)' } : null} onClick={() => setT(v)}>{l}</button>)}</div>
          </div>
          <div className="umbral-chart-label"><span>Ahorro neto según el límite</span></div>
          <BeneficioCurva t={cur.t} elegido={FINAL.umbral} width={748} height={190} />
          <p className="cuenta-porque">
            {cur.t < FINAL.umbral - 0.02 ? <>Con un límite más bajo avisamos más, pero <B c="var(--bad)">las falsas alarmas crecen más rápido</B> que los aciertos.</>
              : cur.t > FINAL.umbral + 0.02 ? <>Con un límite más alto casi no hay falsas alarmas, pero <B c="var(--bad)">se escapan muchos recargos</B> y se ahorra menos.</>
              : <><B>0,57 es el punto de equilibrio</B>: el límite con mayor ahorro neto en validación. La curva (prueba final) confirma que queda cerca del máximo.</>}
          </p>
        </section>
        <section className="card umbral-cliente rv" style={{ '--d': 4 }}>
          <div className="label">El valor de un aviso correcto</div>
          <div className="umbral-cliente-escena">
            <Phone d={5}>
              <div className="ph-alert pop" style={{ '--d': 7 }}>
                <b>⚠ Posible recargo</b>
                <span>Compará con otra app o esperá unos minutos.</span>
              </div>
              <div className="ph-app">Lyft<span className="ph-route">Back Bay → Fenway</span></div>
              <div className="ph-btn ghost">Comparar opciones</div>
              <div className="ph-receipt pop" style={{ '--d': 9 }}>
                <div className="ph-small">Si evitás el recargo</div>
                <div className="ph-big good">Ahorrás USD {fDec(RECARGO.sobreprecioMedio, 2)}</div>
                <div className="ph-note">Sobreprecio promedio evitado</div>
              </div>
            </Phone>
            <div className="umbral-cliente-relato">
              <h2>Un aviso a tiempo permite ahorrar</h2>
              <p>Si el pasajero <B>compara o espera</B> y evita el recargo:</p>
              <div className="umbral-ahorro-persona">
                <div className="num">USD {fDec(FINAL.vp, 2)}</div>
                <p>de ahorro neto estimado<br />por aviso correcto</p>
              </div>
              <p className="umbral-cliente-detalle"><B>USD {fDec(RECARGO.sobreprecioMedio, 2)}</B> de recargo evitado, menos <B>USD {fDec(FINAL.costoFalsa, 0)}</B> de costo supuesto por comparar.</p>
            </div>
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
      ['recargo', 'Si salís de Back Bay, Fenway, Theatre District o las universidades, compará con la otra app.'],
      ['precio', <>En niveles económicos suele convenir <Brand name="Lyft" size={20} />; en los Black, <Brand name="Uber" size={20} />.</>],
      ['precio', 'No hace falta esperar a que pare de llover.'],
    ]],
    ['Conductor', [
      ['recargo', 'Las zonas con más recargo son estables: universidades, Fenway, Back Bay.'],
      ['recargo', 'La hora sola no garantiza recargo.'],
    ]],
    ['Plataforma', [
      ['precio', 'La tarifa base ya es predecible: comunicarla bien no cuesta nada.'],
      ['recargo', 'Avisos selectivos: si una falsa alarma cuesta USD 2 o más, no conviene avisar.'],
    ]],
  ]
  return (
    <div className="slide">
      <Head ent={E(4)} eje="Qué valor ofrecemos" track="ambas" title={<>Qué puede hacer <em>cada actor</em> con esto</>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26 }}>
        {recs.map(([who, items], i) => (
          <div key={who} className="card rv actor-card" style={{ '--d': 2 + i * 2, padding: '30px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--accent)' }}>
              <span className="actor-ico" style={{ animationDelay: `${i * 0.6}s` }}><ActorIcon who={who} size={60} /></span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 42, color: 'var(--text)' }}>{who}</span>
            </div>
            <ul className="clean" style={{ display: 'grid', gap: 18, marginTop: 24 }}>
              {items.map(([tr, t], j) => (
                <li key={j} className="rv" style={{ '--d': 3 + i * 2 + j, display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, fontSize: 21, lineHeight: 1.45, color: 'var(--text-2)' }}>
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
    ['H1', 'Producto y distancia definen el precio', true, 'Producto explica el 77 % y distancia el 12 %'],
    ['H2', 'Uber y Lyft difieren según el nivel', true, 'Compartido: Lyft 29 % más barato · Black: Uber 8 % más barato'],
    ['H3', 'Hay patrones por hora y día', false, 'Según la hora, el recargo solo va de 7,0 % a 9,6 %'],
    ['H4', 'Hay recorridos más caros por milla', true, 'Rutas cortas: hasta USD 17,95 por milla, por la tarifa base'],
    ['H5', 'El mal clima encarece los viajes', false, 'Recargo con lluvia 7,9 % vs 8,3 % sin lluvia'],
    ['H6', 'Los productos forman grupos tarifarios', true, '3 familias de tarifa: económico, intermedio y premium'],
  ]
  return (
    <div className="slide">
      <Head ent={E(4)} eje="Qué hallazgos encontramos · balance final" track="ambas" title={<>Lo que creíamos en la Entrega 1, <em>y lo que encontramos</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '320px 1fr', gap: 50, alignItems: 'center' }}>
        <div className="rv" style={{ '--d': 2 }}><Donut ok={4} total={6} size={300} /></div>
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
function Cierre() {
  return (
    <div className="slide free" style={{ padding: '64px 88px 96px' }}>
      <div className="kicker rv">Conclusión · el recorrido completo</div>
      <div className="rv" style={{ '--d': 1, marginTop: 10 }}><ForkLine width={1424} height={200} /></div>
      <div className="grid rv" style={{ '--d': 6, gridTemplateColumns: '1fr 1fr', gap: 26, marginTop: 10 }}>
        <div className="card precio-card" style={{ padding: '30px 36px' }}>
          <Track v="precio" />
          <p style={{ fontFamily: 'var(--serif)', fontSize: 42, lineHeight: 1.1, marginTop: 18 }}>Es una fórmula predecible.</p>
          <div className="num precio" style={{ fontSize: 72, marginTop: 16 }}>USD 1,08</div>
          <p className="t2" style={{ fontSize: 20, marginTop: 4 }}>de error medio, con producto y distancia</p>
        </div>
        <div className="card recargo-card" style={{ padding: '30px 36px' }}>
          <Track v="recargo" />
          <p style={{ fontFamily: 'var(--serif)', fontSize: 42, lineHeight: 1.1, marginTop: 18 }}>Se anticipa en parte, y ya vale dinero.</p>
          <div className="num recargo" style={{ fontSize: 72, marginTop: 16 }}>+USD 56</div>
          <p className="t2" style={{ fontSize: 20, marginTop: 4 }}>cada 1.000 cotizaciones, anticipando el 51% de los recargos</p>
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }} className="rv">
        <div className="t2" style={{ fontSize: 17 }}>Grupo 11 · {EQUIPO.join(' · ')}</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 72, fontStyle: 'italic' }}>¡Gracias!</div>
      </div>
    </div>
  )
}

/* ═════════════ Anexo · preguntas ═════════════ */
function AnexoPreguntas() {
  const qa = [
    ['¿Por qué 68,6% de exactitud es mejor que 91,7%?', 'El 91,7% es decir siempre “no” y no detecta recargos. El modelo detecta el 51%, con exactitud balanceada 60,8% (azar = 50%) y +USD 56 cada 1.000 cotizaciones.'],
    ['¿Por qué no separar al azar?', 'En el 95,7% de los grupos ruta–minuto los productos comparten el recargo. Al azar, las gemelas quedan en train y test y el PR-AUC se infla hasta +147%.'],
    ['¿Por qué SMOTE no sirvió?', 'Interpola variables 0/1 y crea cotizaciones imposibles; tuvo el peor PR-AUC en validación.'],
    ['¿De dónde sale el umbral 0,57?', 'De maximizar el beneficio en la validación temporal (VP +7,73, FP −1). Se aplicó tal cual a la prueba.'],
    ['¿Por qué el recargo no supera ~0,68 de ROC-AUC?', 'Depende de pedidos y conductores en tiempo real, que no están en los datos. Los cuatro algoritmos topan igual.'],
    ['¿Es legítimo usar el surge para predecir el precio?', 'Sí: la app lo muestra al cotizar. Sin él: MAE USD 1,32 en vez de 1,08.'],
    ['¿Por qué log(precio)?', 'La asimetría pasa de 1,05 a −0,10 y los errores pasan a ser relativos.'],
    ['¿Por qué solo Lyft para el recargo?', 'En Uber el multiplicador vale siempre 1 (precio cerrado). Inferirlo por precio por milla acertaba solo el 61%.'],
  ]
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
      </div>
    </div>
  )
}

/* ═════════════ Índice + guion ═════════════ */
const S = (id, ent, eje, titulo, inicio, fin, C, notas) => ({ id, ent, eje, titulo, inicio, fin, C, notas })
export const SLIDES = [
  S('portada', 0, 'Portada', 'Portada', '0:00', '0:22', Portada, [
    'Buenas. Somos el Grupo 11. Les vamos a contar lo que aprendimos de casi **700 mil cotizaciones** de Uber y Lyft en Boston, a lo largo de las cuatro entregas.',
  ]),
  S('recorrido', 0, 'Nuestro recorrido', 'Cuatro entregas, una pregunta que fue cambiando', '0:22', '1:04', Recorrido, [
    'Este es el hilo de la presentación. En la **Entrega 1** la pregunta era una sola: qué influye en el precio y si se puede predecir.',
    'En la **Entrega 2** la pregunta **se partió en dos**: la parte estructural del precio y la parte dinámica, el recargo. Desde ahí cada variable tiene su color: **verde para precio, ámbar para recargo**.',
    'En la **3** modelamos cada una, y hoy les contamos **qué valor tiene**.',
  ]),
  S('dominio', 1, 'Introducción del dominio', 'Un dataset de cotizaciones', '1:04', '1:29', Dominio, [
    'El dominio: plataformas de viaje en Boston, fines de 2018. Cada fila es una **cotización**, lo que la app ofrecía cobrar, no un viaje hecho.',
    'Vean que **más de dos tercios de las columnas eran clima**: la primera pista de que había mucho para limpiar.',
  ]),
  S('zonas-productos', 1, 'Introducción del dominio', '12 zonas, 12 productos', '1:29', '1:45', ZonasProductos, [
    '12 zonas de Boston, del centro histórico a las universidades, y 12 productos: desde un viaje compartido de **USD 7** hasta un Black XL de **USD 30**.',
  ]),
  S('problema', 1, 'Introducción del dominio · el problema', 'El mismo viaje puede costar hasta 67% más', '1:45', '2:05', Problema, [
    'El problema: con recargo, **el mismo producto cuesta entre 36% y 67% más**. Pasa en **1 de cada 12** cotizaciones y el sobreprecio medio es **USD 8,73**. El pasajero no sabe cuándo le va a tocar.',
  ]),
  S('uber-esconde', 1, 'Introducción del dominio · primer descubrimiento', 'Uber esconde su recargo', '2:05', '2:22', UberEsconde, [
    'Primer descubrimiento: **Uber nunca muestra su multiplicador**, porque cobra precio cerrado. Lyft sí. Intentamos deducirlo y acertábamos solo el 61%, así que el recargo se estudia **solo con Lyft**.',
  ]),
  S('pistas', 1, 'Introducción del dominio · primeras pistas', 'Las primeras pistas', '2:22', '3:13', PrimerasPistas, [
    'Esta slide tiene **4 pasos**: cada flecha muestra el siguiente panel del gráfico de la Entrega 1; después de la cuarta, pasa a la slide siguiente.',
    '1) **Shared nunca tiene recargo**. 2) **La zona** lo cambia hasta 7 veces. 3) **Clima y hora**: correlación nula. 4) Lo que predice es **la ruta**: el clima solo da 0,50, como el azar.',
    'Eran pistas; en las entregas siguientes las verificamos.',
  ]),
  S('dos-variables', 2, 'Qué predecimos', 'Una pregunta, dos variables', '3:13', '3:42', DosVariables, [
    'Qué predecimos. **Variable A, el precio**: regresión con las 636 mil cotizaciones. **Variable B, el recargo**: clasificación sí o no, solo con Lyft, donde **solo 8 de cada 100** tienen recargo.',
    'Como son problemas distintos, se miden distinto: el precio en dólares de error; el recargo en capacidad de detectarlo y en dólares ganados.',
  ]),
  S('limpieza', 2, 'Algo importante del ETL', 'Limpiar con criterio de dominio', '3:42', '3:56', Limpieza, [
    'ETL. Conservamos el **91,8%**. Lo más grande: **55 mil Taxis sin precio**. No los imputamos, porque cobran por taxímetro y no hay referencia.',
  ]),
  S('columnas', 2, 'Algo importante del ETL', 'De 57 a 27 columnas', '3:56', '4:10', Columnas, [
    'De 57 columnas quedaron **27**: eliminamos clima repetido y columnas en UTC, y creamos 11 nuevas, como la hora local y has_surge.',
  ]),
  S('utc', 2, 'Algo importante del ETL', 'La hora estaba en UTC', '4:10', '4:24', HoraUTC, [
    'Encontramos que la hora decía Boston pero **estaba en UTC**. Sin corregirlo, el pico de las 8 aparecía a las 13.',
  ]),
  S('tratamiento', 2, 'Algo importante del ETL', 'Cómo preparamos el precio y el recargo', '4:24', '4:45', Tratamiento, [
    'En el **precio**, errar dos dólares pesa más en un viaje de diez que en uno de cuarenta. Ajustamos la escala para aprender de los **errores proporcionales**.',
    'Para el **recargo**, agrupamos todos los aumentos en un **sí o no**, solo con Lyft sin Shared. Para anticiparlo, dejamos fuera el precio final y el multiplicador: ya revelan la respuesta.',
    'Si preguntan por el ajuste del precio: usamos el logaritmo y luego convertimos la predicción a dólares.',
  ]),
  S('h-formula', 2, 'Qué hallazgos encontramos', 'El precio es una fórmula', '4:45', '4:57', HallazgoFormula, [
    'Hallazgos sobre el **precio**: el producto que elegís y la distancia lo definen casi todo. Hora y clima: nada.',
  ]),
  S('h-apps', 2, 'Qué hallazgos encontramos', 'Ninguna app es siempre la más barata', '4:57', '5:19', HallazgoApps, [
    '**Ninguna app es siempre la más barata**. (Cambiar de nivel en vivo.) En los económicos gana Lyft; en los Black, Uber.',
  ]),
  S('h-clima', 2, 'Qué hallazgos encontramos', 'El mito del clima', '5:19', '5:34', MitoClima, [
    'Y un mito derribado: **la lluvia no encarece el viaje**. La correlación es cero, y con lluvia hay incluso un poco menos de recargo.',
  ]),
  S('h-zonas', 2, 'Qué hallazgos encontramos', 'El recargo depende del lugar', '5:34', '5:46', HallazgoZonas, [
    'Sobre el **recargo**: depende del **lugar**. Saliendo de Back Bay es **7,3 veces** más frecuente que desde North End.',
  ]),
  S('h-hora', 2, 'Qué hallazgos encontramos', 'Y casi nada de la hora', '5:46', '5:55', HallazgoHora, [
    'Y casi nada de la hora: se mueve entre 7 y 9,6%.',
  ]),
  S('m-precio', 3, 'Qué modelos usamos', 'El precio se predice con un dólar de error', '5:55', '6:07', ModeloPrecio, [
    'Para el **precio**, elegimos **random forest**: combina muchos árboles y capta las tarifas según producto y distancia. Fue el de menor error en validación, aunque mejoró poco respecto de un árbol. En la prueba: **USD 1,08 de error medio**.',
  ]),
  S('m-kmeans', 3, 'Qué modelos usamos · no supervisado', '3 familias de tarifa', '6:07', '6:21', ModeloKMeans, [
    'Con **K-Means** encontramos **3 familias de tarifa**. Cada producto de Uber cae junto a su par de Lyft: compiten en espejo.',
  ]),
  S('m-desbalance', 3, 'Qué modelos usamos · cómo entrenamos', 'Cómo aprender con 8% de recargos', '6:21', '6:39', ModeloDesbalance, [
    'Para el **recargo**: sin hacer nada, el modelo dice siempre que no y **acierta 91,7% sin detectar nada**. Elegimos **pesos de clase**: datos reales, y errar un recargo pesa 11 veces más.',
  ]),
  S('m-recargo', 3, 'Qué modelos usamos', 'Por qué elegimos gradient boosting', '6:39', '6:58', ModelosRecargo, [
    'Para el **recargo**, elegimos **gradient boosting**: cada árbol corrige errores anteriores. Ganó en validación al distinguir las cotizaciones con recargo, que son pocas: **0,136 contra 0,126 de random forest**. En la prueba quedaron cerca; falta información de pedidos y conductores en tiempo real.',
  ]),
  S('m-mira', 3, 'Qué modelos usamos', 'Lo que mira el modelo', '6:58', '7:10', QueMira, [
    'Y lo que más mira el modelo es la **ruta**: qué tan seguido hubo recargo en ese recorrido.',
  ]),
  S('v-asimetria', 4, 'Qué valor ofrecemos', 'No todos los errores cuestan lo mismo', '7:10', '7:27', Asimetria, [
    'El valor. Pensemos en un aviso de “posible recargo” en la app. **Error 1**: no avisa y hay recargo → el pasajero paga **USD 8,73** de sorpresa.',
    '**Error 2**: avisa y no había → perdió un minuto comparando, lo valuamos en **USD 1**.',
    'En la balanza: **un recargo sorpresa pesa como 8,7 falsas alarmas**. Por eso avisar conviene aunque acierte 1 de cada 8,7 avisos.',
  ]),
  S('v-umbral', 4, 'Qué valor ofrecemos', '¿Cuándo conviene avisar?', '7:27', '7:57', Umbral, [
    'Probamos distintos límites del puntaje de riesgo. Para cada uno, sumamos **USD 7,73 netos por acierto** y restamos **USD 1 por falsa alarma**, el costo supuesto de comparar.',
    'Elegimos el **0,57 porque maximiza el ahorro en validación**. Después lo aplicamos sin cambiarlo a fechas nuevas. La curva visible corresponde a esa prueba final; no la usamos para elegir.',
    '(Mover el control y volver a «Elegido».) La curva muestra **USD 56 netos cada mil cotizaciones** con el límite elegido. El celular muestra lo que significa un aviso correcto para un pasajero: si compara o espera y evita el recargo, se ahorra en promedio **USD 8,73**. Descontando el costo supuesto de **USD 1 por comparar**, son **USD 7,73 netos**.',
    'Si preguntan por el 0,57: es un puntaje del modelo, no un 57% de avisos correctos. El valor exacto elegido fue 0,5722009526. Los cálculos usan USD 7,73380071 por acierto; la pantalla redondea los importes.',
  ]),
  S('v-recos', 4, 'Qué valor ofrecemos', 'Qué puede hacer cada actor', '7:57', '8:08', Recomendaciones, [
    'Al **pasajero**: comparar si sale de zonas calientes. Al **conductor**: ubicarse ahí. A la **plataforma**: avisos selectivos.',
  ]),
  S('hipotesis', 4, 'Qué hallazgos encontramos · balance final', 'Las hipótesis de la Entrega 1', '8:08', '8:23', Hipotesis, [
    'Cerrando el recorrido: de las 6 hipótesis de la Entrega 1, **4 se confirmaron** y **2 no**: ni la hora ni el clima.',
  ]),
  S('cierre', 4, 'Conclusión', 'Conclusión', '8:23', '8:41', Cierre, [
    'En resumen: el **precio** es una fórmula y se predice con un dólar de error. El **recargo** se anticipa en parte, y ya vale **USD 56 cada mil cotizaciones**. Muchas gracias.',
  ]),
  S('anexo-qa', 5, 'Anexo', 'Preguntas probables', '—', '—', AnexoPreguntas, ['Respuestas cortas para la ronda de preguntas.']),
]
