import { useMemo, useState } from 'react'
import { Head, Num, Track, Figura, Brand, useSteps, useDeck, fInt, fDec, fPct, fUsd } from './lib/ui.jsx'
import { findImg } from './data/gallery.js'
import {
  HBar, Dumbbell, Waterfall, ZoneMap, FareCompare, tarifaEn, Balanceo,
  KMeansScatter, Curvas, BeneficioCurva, UMBRALES, N_TEST, ForkLine, SurgeCollapse,
  ColumnBlocks, UtcBig, AsymBars, Donut, ActorIcon,
} from './components/charts.jsx'
import {
  DATASET, PLATAFORMAS, RECARGO, ZONAS, PESO_FACTORES, REGRESION, REGRESION_SIN_SURGE, IMPORTANCIA_RECARGO,
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
const RUTAS = [[0, 6], [2, 7], [4, 3], [1, 8], [5, 11], [3, 10], [0, 9], [2, 6], [4, 0], [7, 11], [1, 3]]
function MapaRutas({ scale = 1.05, w = 720, h = 560 }) {
  const LON0 = -71.114, LAT1 = 42.3705, KX = 9000 * scale, KY = 12180 * scale
  const pts = ZONAS.map((z) => ({ ...z, x: (z.lon - LON0) * KX, y: (LAT1 - z.lat) * KY }))
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
          <text x={p.x + 10} y={p.y - 10} className="val-muted" style={{ fontSize: 13, fontFamily: 'var(--sans)' }}>{p.zona}</text>
        </g>
      ))}
      <style>{`@keyframes flow { to { stroke-dashoffset: -140; } }`}</style>
    </svg>
  )
}
function Portada() {
  return (
    <div className="slide free" style={{ padding: '88px 88px 96px' }}>
      <div style={{ position: 'absolute', right: 60, top: 150 }}><MapaRutas /></div>
      <div className="kicker rv">Trabajo Práctico Integrador · Entrega 4 · Data storytelling</div>
      <h1 className="rv" style={{ '--d': 1, fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 108, lineHeight: 0.98, margin: '34px 0 0', maxWidth: 1000, letterSpacing: '-0.02em' }}>
        El precio es una fórmula.<br />El <em style={{ color: 'var(--accent)' }}>recargo</em>, un misterio.
      </h1>
      <p className="lede rv" style={{ '--d': 3, maxWidth: 760, fontSize: 25, marginTop: 30 }}>
        Uber y Lyft en Boston: lo que aprendimos de <B><Num value={DATASET.crudo} /></B> cotizaciones a lo largo de cuatro entregas.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 34 }}>
        <Brand name="Uber" size={46} d={6} />
        <span className="muted pop-in" style={{ '--d': 8, fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 30 }}>vs</span>
        <Brand name="Lyft" size={46} d={10} />
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', gap: 48, alignItems: 'flex-end' }} className="rv">
        <div>
          <div className="label">Ciencia de Datos · UTN FRC · 5K1</div>
          <div style={{ fontSize: 34, fontWeight: 600, marginTop: 8 }}>Grupo 11</div>
        </div>
        <div className="t2" style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 640 }}>{EQUIPO.join(' · ')}</div>
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
      <div className="rv" style={{ '--d': 4, margin: '14px 0 10px' }}><ForkLine width={1424} height={230} /></div>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
        {[[<Num value={DATASET.crudo} />, <>cotizaciones de <Brand name="Uber" size={22} d={6} /> y <Brand name="Lyft" size={22} d={8} /></>], ['24 días', 'del 25/11 al 18/12/2018'], ['57', 'columnas, con el clima de cada hora']].map(([n, t], i) => (
          <div key={i} className="rv" style={{ '--d': 2 + i }}>
            <div className="num" style={{ fontSize: 70, lineHeight: 1 }}>{n}</div>
            <div className="t2" style={{ fontSize: 21, marginTop: 10 }}>{t}</div>
          </div>
        ))}
      </div>
      <div className="card rv" style={{ '--d': 5, marginTop: 44, padding: '30px 34px' }}>
        <h3>Las 57 columnas originales, por bloque</h3>
        <p className="sub">Más de dos tercios son clima: la primera pista de que había mucho para limpiar</p>
        <div style={{ marginTop: 20 }}><ColumnBlocks blocks={COLUMNAS} width={1350} /></div>
      </div>
      <Say d={8} style={{ marginTop: 30 }}>Cada fila responde: <B>¿cuánto cobra este producto, en esta ruta, en este momento?</B> Datos públicos de Kaggle, tomados de las APIs de precios de ambas apps.</Say>
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
          <h3>Precio mediano de cada producto de <Brand name="Lyft" size={23} d={4} />, sin y con recargo</h3>
          <p className="sub">El recargo (“surge”) multiplica el precio cuando hay más pedidos que conductores</p>
          <Dumbbell width={780} rowH={76} />
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
      <div className="grid" style={{ gridTemplateColumns: '520px 1fr', gap: 44, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 26 }}>
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
          <div className="stepper-frame" onClick={() => openImage(findImg(PISTAS[step].img.replace('.png', '')))} title="Clic para ampliar este gráfico">
            {PISTAS.map((p, i) => (
              <img key={p.img} src={`${import.meta.env.BASE_URL}graficos/${p.img}`} alt={p.t}
                className={'stepper-img' + (i === step ? ' on' : i < step ? ' past' : '')} />
            ))}
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
function DosVariables() {
  const rows = [
    ['La pregunta', '¿Cuánto me va a costar?', '¿Me van a cobrar recargo?'],
    ['Qué parte del precio', 'Estructural: producto y distancia', 'Dinámica: cuándo y dónde se paga de más'],
    ['Tipo de problema', 'Regresión: un número en USD', 'Clasificación: sí o no'],
    ['Datos', <>{fInt(DATASET.limpio)} cotizaciones · <Brand name="Uber" size={20} /> y <Brand name="Lyft" size={20} /></>, <>{fInt(RECARGO.filas)} cotizaciones · solo <Brand name="Lyft" size={20} /> sin Shared</>],
    ['Variable objetivo', 'price → log(price)', 'has_surge = 1 si surge_multiplier > 1'],
    ['Dificultad', 'Precios asimétricos (pocos muy caros)', 'Solo 8,2% tiene recargo'],
    ['Cómo se mide', 'Error en USD y R²', 'PR-AUC, recall y USD ganados'],
  ]
  return (
    <div className="slide">
      <Head ent={E(2)} eje="Qué predecimos" track="ambas" title={<>Una pregunta, <em>dos variables</em></>} />
      <div className="cmp">
        <div className="cc rl" style={{ borderTop: 'none' }} />
        <div className="cc cp hd rv" style={{ '--d': 2 }}><span className="track precio" style={{ padding: '6px 12px' }}><i />Variable A</span><span style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1 }}>Precio</span></div>
        <div className="cc cr hd rv" style={{ '--d': 3, marginLeft: 14 }}><span className="track recargo" style={{ padding: '6px 12px' }}><i />Variable B</span><span style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1 }}>Recargo</span></div>
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
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>De {fInt(DATASET.crudo)} a {fInt(DATASET.limpio)} cotizaciones: se conserva el 91,8%</h3>
          <p className="sub">Cada fila eliminada tiene un motivo concreto</p>
          <div style={{ marginTop: 18 }}><Waterfall width={840} /></div>
        </div>
        <Side>
          <Big c="var(--bad)" size={70}>55.095</Big>
          <Say size={21}>cotizaciones de <B>Taxi sin precio</B>. No las imputamos: en Boston cobran por taxímetro y no hay ninguna referencia. Eran el 100% de los nulos.</Say>
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
      <Figura id="03_columnas_antes_despues" h={440} />
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
          <div className="tratamiento-grafico">
            <Figura id="13_precio_distribucion" h={180} d={3} caption="Los precios, antes y después de ajustar la escala" />
          </div>
          <div className="tratamiento-ejemplos" aria-label="Ejemplos ilustrativos con un error de dos dólares">
            <span className="tratamiento-ejemplo-label">USD 2<br />de error</span>
            <div><span className="num tratamiento-cifra">20%</span><span>en un viaje de USD 10</span></div>
            <div><span className="num tratamiento-cifra">5%</span><span>en un viaje de USD 40</span></div>
          </div>
          <p className="tratamiento-idea">Ajustamos la escala para aprender de los <B>errores en proporción al precio</B>.</p>
        </section>
        <section className="card recargo-card tratamiento-col rv" style={{ '--d': 3, '--variable': 'var(--recargo)' }}>
          <Track v="recargo" />
          <h2>Simplificamos a “sí” o “no”</h2>
          <div className="tratamiento-grafico tratamiento-grafico-recargo">
            <p className="tratamiento-contexto">Cotizaciones según el aumento aplicado</p>
            <SurgeCollapse width={604} />
          </div>
          <div className="tratamiento-ejemplos tratamiento-clases">
            <div><span>Sin aumento</span><strong>No</strong></div>
            <div><span>Cualquier aumento</span><strong>Sí</strong></div>
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
          <HBar rows={rows} width={820} rowH={52} labelW={270} barH={22} max={100} tip={(r) => <><b>{r.label}</b><br />explica el {r.text} de la variación del precio</>} />
        </div>
        <Side gap={34}>
          <Say d={5}>Lo que el pasajero <B>elige</B> y lo que <B>recorre</B> definen casi todo el precio.</Say>
          <Say d={6}>La <B>hora</B> y el <B>clima</B> explican <B>0%</B>.</Say>
          <p className="t2 rv" style={{ '--d': 7, fontSize: 19 }}>Hipótesis H1 <span className="good" style={{ fontWeight: 600 }}>✓ confirmada</span></p>
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
            <FareCompare nivel={nivel} dist={dist} setDist={setDist} width={620} height={420} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 170, paddingTop: 26 }}>
              <div className="label">A {fDec(dist, 1)} millas</div>
              <div key={'u' + ni}><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><Brand name="Uber" size={22} d={0} /><span className="small t2">{nivel.uber}</span></div><div className="num" style={{ fontSize: 30, marginTop: 4 }}>{fUsd(pu)}</div></div>
              <div key={'l' + ni}><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><Brand name="Lyft" size={22} d={2} /><span className="small t2">{nivel.lyft}</span></div><div className="num" style={{ fontSize: 30, marginTop: 4 }}>{fUsd(pl)}</div></div>
              <div className="small t2" style={{ marginTop: 8 }}><Brand name={dif < 0 ? 'Lyft' : 'Uber'} size={17} /> es más barato por <b className="num" style={{ color: 'var(--text)' }}>{fDec(Math.abs(dif) * 100, 0)}%</b></div>
            </div>
          </div>
        </div>
        <div className="card rv" style={{ '--d': 3 }}>
          <h3><Brand name="Lyft" size={23} d={5} /> frente a <Brand name="Uber" size={23} d={7} />, por nivel</h3>
          <p className="sub">Diferencia promedio a igual distancia</p>
          <div style={{ display: 'grid', gap: 6, marginTop: 20 }}>
            {NIVELES.map((n, i) => {
              const w = (Math.abs(n.dif) / 0.3) * 34
              const lyftCheaper = n.dif < 0
              return (
                <div key={n.nivel} onClick={() => setNi(i)} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', alignItems: 'center', gap: 10, height: 54, cursor: 'pointer', opacity: i === ni ? 1 : 0.7 }}>
                  <span style={{ fontSize: 18, fontWeight: i === ni ? 600 : 400 }}>{n.nivel}</span>
                  <div style={{ position: 'relative', height: 22 }}>
                    <div style={{ position: 'absolute', left: '50%', top: -10, bottom: -10, width: 1, background: 'var(--line-2)' }} />
                    <div className="growx" style={{ '--d': i, position: 'absolute', top: 1, height: 20, borderRadius: 4, width: `${w}%`, background: lyftCheaper ? 'var(--lyft)' : 'var(--uber)', ...(lyftCheaper ? { right: '50%', transformOrigin: 'right center' } : { left: '50%' }) }} />
                    <span className="num" style={{ position: 'absolute', top: 0, fontSize: 16, ...(lyftCheaper ? { right: `calc(50% + ${w}% + 8px)` } : { left: `calc(50% + ${w}% + 8px)` }) }}>{n.dif > 0 ? '+' : '−'}{fDec(Math.abs(n.dif) * 100, 0)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="legend" style={{ marginTop: 18, justifyContent: 'space-between' }}>
            <span><i className="sq" style={{ background: 'var(--lyft)' }} /><Brand name="Lyft" size={16} /> más barato</span>
            <span><i className="sq" style={{ background: 'var(--uber)' }} /><Brand name="Uber" size={16} /> más barato</span>
          </div>
          <p className="t2 small" style={{ marginTop: 20 }}>Hipótesis H2 <span className="good" style={{ fontWeight: 600 }}>✓ confirmada</span></p>
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
          <HBar rows={rows} width={800} rowH={50} labelW={240} barH={22} max={0.4} />
        </div>
        <Side gap={36}>
          <div className="rv" style={{ '--d': 5 }}>
            <div className="label">Recargo con lluvia vs sin lluvia</div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', marginTop: 10 }}>
              <span className="num" style={{ fontSize: 56 }}>{fPct(RECARGO.lluvia, 1)}</span>
              <span className="muted" style={{ fontSize: 22 }}>vs</span>
              <span className="num" style={{ fontSize: 56 }}>{fPct(RECARGO.seco, 1)}</span>
            </div>
            <Say d={6} size={20} style={{ marginTop: 8 }}>Con lluvia hay incluso <B>un poco menos</B> de recargo.</Say>
          </div>
          <p className="t2 rv" style={{ '--d': 7, fontSize: 19 }}>Hipótesis H5: “el mal clima encarece los viajes” <span className="bad" style={{ fontWeight: 600 }}>✗ rechazada</span></p>
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
        <Side>
          <Big c="var(--recargo)" size={110}><Num value={max / min} format={(v) => fDec(v, 1) + '×'} /></Big>
          <Say size={22}>más recargo saliendo de <B>Back Bay (13,4%)</B> que de <B>North End (1,8%)</B>.</Say>
          <Say d={7} size={21}>Las zonas calientes: universidades, Fenway, Back Bay y Theatre District.</Say>
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
      <Figura id="18_recargo_por_hora" h={440} />
      <div style={{ display: 'flex', gap: 30, alignItems: 'baseline', marginTop: 24 }}>
        <div style={{ whiteSpace: 'nowrap' }}><Big size={52}>7,0 – 9,6%</Big></div>
        <Say>es todo lo que se mueve el recargo según la hora. Hipótesis H3 <span className="bad" style={{ fontWeight: 600 }}>✗ no se confirma</span></Say>
      </div>
    </div>
  )
}

/* ═════════════ E3 · Modelo de precio ═════════════ */
function ModeloPrecio() {
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Qué modelos usamos" track="precio" title={<>El precio se predice con <em>un dólar de error</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.45fr 1fr', gap: 40 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Error al estimar el precio · menos es mejor</h3>
          <p className="sub">Prueba final: {fInt(148494)} cotizaciones que el modelo nunca vio</p>
          <div style={{ display: 'grid', gap: 22, marginTop: 26 }}>
            {REGRESION.map((r, i) => (
              <div key={r.modelo} style={{ display: 'grid', gridTemplateColumns: '220px 1fr 130px', alignItems: 'center', gap: 16 }}>
                <div><div style={{ fontSize: 20, fontWeight: r.elegido ? 600 : 400 }}>{r.modelo}</div><div className="small muted">{r.detalle === 'con surge' ? 'con recargo' : r.detalle}</div></div>
                <div style={{ height: 30, background: 'var(--card-2)', borderRadius: 6 }}>
                  <div className="growx" style={{ '--d': 2 + i * 3, height: '100%', width: `${(r.mae / 3.1) * 100}%`, background: r.elegido ? 'var(--precio)' : 'var(--neutral)', borderRadius: 6 }} />
                </div>
                <div className="num" style={{ fontSize: 23, fontWeight: r.elegido ? 600 : 400 }}>{fUsd(r.mae)}</div>
              </div>
            ))}
          </div>
          <p className="muted small" style={{ marginTop: 22 }}>Elegimos el modelo con menor error en validación y luego lo evaluamos en fechas nuevas.</p>
        </div>
        <div className="card precio-card modelo-eleccion rv" style={{ '--d': 4, '--modelo-color': 'var(--precio)' }}>
          <div className="label">Elegido para el precio</div>
          <h2>Random forest</h2>
          <div className="modelo-metrica num"><Num value={REGRESION.find((r) => r.elegido).mae} format={(v) => fUsd(v)} /></div>
          <p className="modelo-metrica-texto">de error medio en la prueba final</p>
          <div className="modelo-motivos">
            <p><B>Combina muchos árboles</B> para captar cómo cambia la tarifa según el producto y la distancia.</p>
            <p>Tuvo el <B>menor error en validación</B>. La ventaja frente a un solo árbol fue pequeña.</p>
          </div>
          <div className="modelo-acierto">
            <div><B>3 de cada 4</B> cotizaciones con menos del 10% de error</div>
            <div className="modelo-acierto-barra" role="img" aria-label="El 75% de las cotizaciones tuvo menos del 10% de error"><div className="growx" style={{ '--d': 6, width: `${REGRESION.find((r) => r.elegido).dentro10 * 100}%` }} /></div>
          </div>
          <p className="modelo-nota">Sin conocer el recargo, el error medio fue USD {fDec(REGRESION_SIN_SURGE.mae, 2)}.</p>
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
          <div style={{ marginTop: 14 }}><Balanceo width={760} /></div>
        </div>
        <Side gap={22}>
          <Say d={4} size={21}>Sin hacer nada, el modelo dice <B>siempre “no”</B>: acierta el <B c="var(--bad)">{fPct(SIEMPRE_NO.accuracy)}</B> y no detecta ningún recargo.</Say>
          {[['✗', 'Submuestreo', 'tira el 91% de los datos'], ['✗', 'SMOTE', 'inventa cotizaciones “0,37 de Back Bay”'], ['✓', 'Pesos de clase', 'datos reales; errar un recargo pesa ×11']].map(([ok, t, d], i) => (
            <div key={t} className="rv" style={{ '--d': 6 + i * 2, display: 'grid', gridTemplateColumns: '36px 1fr', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 26, color: ok === '✓' ? 'var(--good)' : 'var(--bad)' }}>{ok}</span>
              <span style={{ fontSize: 21 }}><B>{t}</B> <span className="t2">— {d}</span></span>
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
  const modelos = enValidacion ? CLASIFICACION.filter((c) => c.val != null) : CLASIFICACION
  const rows = modelos.map((c) => ({
    label: c.modelo, value: enValidacion ? c.val : c.prauc, text: fDec(enValidacion ? c.val : c.prauc, 3), strong: !!c.elegido,
    color: c.elegido ? 'var(--recargo)' : c.tipo === 'base' ? 'var(--line-2)' : 'var(--neutral)', c,
  }))
  return (
    <div className="slide">
      <Head ent={E(3)} eje="Qué modelos usamos" track="recargo" title={<>Para el recargo elegimos <em>gradient boosting</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '1.35fr 1fr', gap: 36 }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <h3>{tipo === 'pr' ? 'Curvas de la prueba final' : 'Qué tan bien distingue el riesgo'}</h3>
            <div className="seg-ctrl" style={{ flexShrink: 0 }}>
              {[['val', 'Validación'], ['test', 'Prueba'], ['pr', 'Curvas']].map(([v, label]) => <button key={v} className={tipo === v ? 'on' : ''} onClick={() => setTipo(v)}>{label}</button>)}
            </div>
          </div>
          <p className="sub">{enValidacion ? 'Con esta comparación elegimos · PR-AUC: más alto es mejor' : 'Prueba final del 15 al 18/12 · el azar vale 0,083 de PR-AUC'}</p>
          {tipo !== 'pr'
            ? <div key={tipo} style={{ marginTop: 18, minHeight: 350 }}><HBar rows={rows} width={780} rowH={enValidacion ? 78 : 58} labelW={250} barH={26} max={0.16} tip={(r) => <><b>{r.label}</b><br />PR-AUC en {enValidacion ? 'validación' : 'prueba'}: {fDec(r.value, 3)}</>} /></div>
            : <Curvas tipo="pr" width={780} height={320} />}
          <p className="modelo-nota">{enValidacion ? 'Gradient boosting obtuvo el mejor puntaje antes de abrir la prueba final.' : 'La prueba evalúa la elección previa. Random forest y gradient boosting quedaron muy cerca.'}</p>
        </div>
        <div className="modelo-recargo-lateral">
          <div className="card recargo-card modelo-eleccion rv" style={{ '--d': 4, '--modelo-color': 'var(--recargo)' }}>
            <div className="label">Elegido para anticipar el recargo</div>
            <h2>Gradient boosting</h2>
            <div className="modelo-motivos">
              <p>Agrega árboles que <B>corrigen los errores anteriores</B> y captan combinaciones de ruta y distancia.</p>
              <p>Logró el <B>mejor resultado en validación</B>: distinguió mejor las cotizaciones con recargo, que son pocas.</p>
            </div>
            <div className="modelo-validacion rv" style={{ '--d': 6 }}>
              <span className="num">{fDec(CLASIFICACION.find((c) => c.elegido).val, 3)}</span>
              <span>PR-AUC en validación<br />frente a {fDec(CLASIFICACION.find((c) => c.modelo === 'Random forest').val, 3)} de random forest</span>
            </div>
          </div>
          <p className="modelo-limite rv" style={{ '--d': 7 }}>En la prueba, los modelos rindieron parecido. Para mejorar falta información de <B>pedidos y conductores en tiempo real</B>.</p>
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
      <div className="grid" style={{ gridTemplateColumns: '1fr 1.15fr', gap: 36, alignItems: 'center' }}>
        <div className="card rv" style={{ '--d': 2 }}>
          <h3>Cuánto empeora si se desordena cada grupo</h3>
          <p className="sub">Importancia por permutación (caída de PR-AUC)</p>
          <HBar rows={imp} width={620} rowH={54} labelW={220} barH={22} max={0.05} />
        </div>
        <div>
          <Figura id="fig09_recargo_arbol_reglas" h={300} d={4} />
          <Say d={7} size={20} style={{ marginTop: 18 }}>El árbol lo confirma: su primera pregunta es <B>“¿qué tan seguido hubo recargo en esta ruta?”</B>. Clima y hora: casi nada.</Say>
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
        <li><span className="umbral-paso-num">3</span><div><h2>Elegimos en validación</h2><p>El mejor límite fue <B>0,57</B>.<br />Lo probamos en fechas nuevas, sin cambiarlo.</p></div></li>
      </ol>
      <div className="umbral-paneles">
        <section className="card recargo-card umbral-explorar rv" style={{ '--d': 3 }}>
          <div className="label">Explorá la regla de aviso</div>
          <p className="umbral-regla">Avisamos si el <B>puntaje de riesgo</B> alcanza <span className="num">{fDec(cur.t, 2)}</span></p>
          <div className="umbral-control">
            <input type="range" min={0.2} max={0.8} step={0.0001} value={t} style={{ '--p': pct + '%' }} onChange={(e) => setT(+e.target.value)} aria-label="Límite del puntaje de riesgo para avisar" aria-valuetext={fDec(cur.t, 4)} />
            <div className="umbral-presets">{presets.map(([v, l]) => <button key={v} className="chip btn" style={Math.abs(cur.t - v) < 0.0001 ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--text)' } : null} onClick={() => setT(v)}>{l}</button>)}</div>
          </div>
          <div className="umbral-chart-label"><span>Ahorro neto cada 1.000 cotizaciones de prueba</span><strong className="num" style={{ color: beneficio >= 0 ? 'var(--good)' : 'var(--bad)' }}>{beneficio >= 0 ? '+' : '−'}USD {fDec(Math.abs(beneficio), 2)}</strong></div>
          <BeneficioCurva t={cur.t} elegido={FINAL.umbral} width={748} height={172} />
          <div className="umbral-extremos"><span>Más avisos y más falsas alarmas</span><span>Menos avisos y menos recargos detectados</span></div>
          <p className="umbral-aclaracion">La curva muestra la <B>prueba final</B>. El límite se eligió antes, con los datos de validación.</p>
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
          <div key={who} className="card rv" style={{ '--d': 2 + i * 2, padding: '30px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--accent)' }}>
              <ActorIcon who={who} size={60} />
              <span style={{ fontFamily: 'var(--serif)', fontSize: 42, color: 'var(--text)' }}>{who}</span>
            </div>
            <ul className="clean" style={{ display: 'grid', gap: 18, marginTop: 24 }}>
              {items.map(([tr, t], j) => (
                <li key={j} className="rv" style={{ '--d': 3 + i * 2 + j, display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, fontSize: 20, lineHeight: 1.45, color: 'var(--text-2)' }}>
                  <i className="dot" style={{ marginTop: 10, background: tr === 'precio' ? 'var(--precio)' : 'var(--recargo)' }} />
                  <span style={{ minWidth: 0 }}>{t}</span>
                </li>
              ))}
            </ul>
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
    ['H1', 'Producto y distancia definen el precio', true],
    ['H2', 'Uber y Lyft difieren según el nivel', true],
    ['H3', 'Hay patrones por hora y día', false],
    ['H4', 'Hay recorridos más caros por milla', true],
    ['H5', 'El mal clima encarece los viajes', false],
    ['H6', 'Los productos forman grupos tarifarios', true],
  ]
  return (
    <div className="slide">
      <Head ent={E(4)} eje="Qué hallazgos encontramos · balance final" track="ambas" title={<>Lo que creíamos en la Entrega 1, <em>y lo que encontramos</em></>} />
      <div className="grid" style={{ gridTemplateColumns: '320px 1fr', gap: 50, alignItems: 'center' }}>
        <div className="rv" style={{ '--d': 2 }}><Donut ok={4} total={6} size={300} /></div>
        <div style={{ display: 'grid', gap: 12 }}>
          {hs.map(([k, h, ok], i) => (
            <div key={k} className="card rv" style={{ '--d': 3 + i, display: 'grid', gridTemplateColumns: '60px 1fr 170px', alignItems: 'center', gap: 18, padding: '18px 26px' }}>
              <span className="num muted" style={{ fontSize: 20 }}>{k}</span>
              <span style={{ fontSize: 23 }}>{h}</span>
              <span style={{ fontWeight: 600, fontSize: 19, color: ok ? 'var(--good)' : 'var(--bad)', textAlign: 'right' }}>{ok ? '✓ Confirmada' : '✗ No se cumple'}</span>
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
      <div className="rv" style={{ '--d': 1, marginTop: 10 }}><ForkLine width={1424} height={170} /></div>
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
