// Todos los números salen de Contenido Entrega 3/6_Resultados/metricas.json,
// de los CSV de esa carpeta o de los gráficos de la Entrega 2.
// Los valores corregidos siguen la sección 11 de Contexto.md.

export const DATASET = {
  crudo: 693071,
  columnasCrudo: 57,
  limpio: 636568,
  columnasLimpio: 27,
  columnasCodificado: 71,
  conservado: 0.918,
  zonas: 12,
  productos: 12,
  fechasConDatos: 18,
  fechasTotales: 24,
}

export const ETL_PASOS = [
  { label: 'Dataset crudo (Kaggle)', valor: 693071, tipo: 'total' },
  { label: 'Taxi sin precio', valor: -55095, nota: 'cobran por taxímetro' },
  { label: 'Copias de una misma cotización', valor: -1060, nota: 'duplicados exactos' },
  { label: 'Distancias imposibles', valor: -348, nota: '~0 millas en rutas reales' },
  { label: 'Dataset limpio', valor: 636568, tipo: 'total' },
]

export const PLATAFORMAS = {
  uber: { cotizaciones: 329414, conRecargo: 0 },
  lyft: { cotizaciones: 307154, conRecargo: 20975 },
}

// Precio mediano de Lyft sin y con recargo (Entrega 2, gráfico 10)
export const PRECIO_RECARGO = [
  { producto: 'Lyft', sin: 9, con: 13.5, pct: 50 },
  { producto: 'Lyft XL', sin: 13.5, con: 22.5, pct: 67 },
  { producto: 'Lux', sin: 16.5, con: 22.5, pct: 36 },
  { producto: 'Lux Black', sin: 22.5, con: 32.5, pct: 44 },
  { producto: 'Lux Black XL', sin: 30, con: 42.5, pct: 42 },
]

export const RECARGO = {
  filas: 255953,
  positivos: 20975,
  tasa: 0.08194863900794286,
  train: 196558,
  test: 59395,
  fechasTrain: 14,
  fechasTest: 4,
  sobreprecioMedio: 8.73380071041316,
  multiplicadorMedio: 1.46,
  gemelas: 0.957,
  pesos: { sin: 0.5444488147536716, con: 6.124446937122204 },
  lluvia: 0.0785,
  seco: 0.0828,
}

// Tasa de recargo por zona de origen + posición aproximada (OpenStreetMap)
export const ZONAS = [
  { zona: 'Back Bay', tasa: 0.1343570057581574, lat: 42.3507, lon: -71.0800 },
  { zona: 'Northeastern University', tasa: 0.12473037606677295, lat: 42.3352, lon: -71.0890 },
  { zona: 'Fenway', tasa: 0.12326006467638374, lat: 42.3488, lon: -71.0975 },
  { zona: 'Theatre District', tasa: 0.11578650098842135, lat: 42.3513, lon: -71.0643 },
  { zona: 'Boston University', tasa: 0.11577220529646122, lat: 42.3505, lon: -71.1035 },
  { zona: 'Beacon Hill', tasa: 0.0966935521909344, lat: 42.3587, lon: -71.0680 },
  { zona: 'South Station', tasa: 0.07965140795577004, lat: 42.3507, lon: -71.0553 },
  { zona: 'Financial District', tasa: 0.06891025641025642, lat: 42.3564, lon: -71.0555 },
  { zona: 'West End', tasa: 0.04641191160533384, lat: 42.3639, lon: -71.0636 },
  { zona: 'North Station', tasa: 0.040073982737361284, lat: 42.3662, lon: -71.0622 },
  { zona: 'Haymarket Square', tasa: 0.019229867267013742, lat: 42.3620, lon: -71.0577 },
  { zona: 'North End', tasa: 0.018280678728789725, lat: 42.3651, lon: -71.0543 },
]

// % de la varianza del precio que explica cada variable por sí sola (Entrega 2, gráfico 7)
export const PESO_FACTORES = [
  { label: 'Producto elegido', v: 77.4 },
  { label: 'Nivel de servicio', v: 76.6 },
  { label: 'Distancia', v: 11.9 },
  { label: 'Multiplicador de recargo', v: 5.8 },
  { label: 'Zona de origen', v: 2.5 },
  { label: 'Zona de destino', v: 2.3 },
  { label: 'Plataforma (Uber/Lyft)', v: 0.7 },
  { label: 'Hora local', v: 0 },
  { label: 'Condición climática', v: 0 },
  { label: 'Intensidad de lluvia', v: 0 },
  { label: 'Temperatura', v: 0 },
]

// Importancia por permutación en el modelo de precio (caída de R² en log)
export const IMPORTANCIA_PRECIO = [
  { grupo: 'Producto', caida: 1.621593194333429 },
  { grupo: 'Distancia', caida: 0.2559909156669566 },
  { grupo: 'Recargo (surge)', caida: 0.017947903502382328 },
  { grupo: 'Zona de destino', caida: 0.0030929584928999962 },
  { grupo: 'Zona de origen', caida: 0.002231087912110352 },
  { grupo: 'Clima', caida: 2.4467580089782004e-6 },
  { grupo: 'Hora y día', caida: -3.9665255146167e-5 },
]

// Importancia por permutación en el modelo de recargo (caída de PR-AUC)
export const IMPORTANCIA_RECARGO = [
  { grupo: 'Ruta (tasa histórica)', caida: 0.04741008306409736 },
  { grupo: 'Distancia', caida: 0.02543233588967023 },
  { grupo: 'Zona de destino', caida: 0.00835627135213086 },
  { grupo: 'Clima', caida: 0.00214966307209243 },
  { grupo: 'Zona de origen', caida: 0.0004262201063380174 },
  { grupo: 'Producto', caida: 0 },
  { grupo: 'Hora y día', caida: -0.0004900901888308292 },
]

// Regresión de precio, período de prueba (15 al 18/12)
export const REGRESION = [
  { modelo: 'Línea base', detalle: 'mediana por producto', mae: 3.0370274219833795, r2: 0.7582638204505873, dentro10: 0.34128651662693443 },
  { modelo: 'Ridge', detalle: 'con surge', mae: 1.3895997170621235, r2: 0.9514462834284634, dentro10: 0.6547941330962868 },
  { modelo: 'Árbol de decisión', detalle: 'con surge', mae: 1.0896172974828435, r2: 0.9656146209517646, dentro10: 0.7357603674222527 },
  { modelo: 'Random forest', detalle: 'con surge', mae: 1.0776539451022662, r2: 0.9670688444666662, dentro10: 0.7495589047368917, elegido: true },
]
export const REGRESION_SIN_SURGE = { mae: 1.3206453091142656, r2: 0.9284537694321604 }
export const REGRESION_DATOS = { train: 488074, test: 148494, predictoras: 67 }

// Clasificación de recargo: PR-AUC en la prueba ciega
export const CLASIFICACION = [
  { modelo: 'Azar (tasa real)', prauc: 0.08296994696523276, roc: 0.5, tipo: 'base' },
  { modelo: 'Tasa histórica de la zona', prauc: 0.11846189227426793, roc: 0.6489019999510011, tipo: 'base' },
  { modelo: 'Regresión logística', prauc: 0.12066600748888354, roc: 0.6504902702762473, val: 0.11971145561435081 },
  { modelo: 'Árbol de decisión', prauc: 0.13789958644550412, roc: 0.6721560478416695, val: 0.12458061455538413 },
  { modelo: 'Random forest', prauc: 0.1423335868486619, roc: 0.6745994823298225, val: 0.1261972885938512 },
  { modelo: 'Gradient boosting', prauc: 0.14007849575537804, roc: 0.67636241421888, val: 0.1359320966221036, elegido: true },
]

// PR-AUC en validación de Gradient boosting según la técnica de balanceo
export const BALANCEO = [
  { tecnica: 'Sin balanceo', filas0: 180511, filas1: 16047, val: 0.1344335404224124, recall05: 0 },
  { tecnica: 'Submuestreo 1:1', filas0: 16047, filas1: 16047, val: 0.1302238999374014, nota: 'tira el 91% de los datos' },
  { tecnica: 'SMOTE 1:1', filas0: 180511, filas1: 180511, val: 0.11564425143137916, nota: 'inventa cotizaciones "0,37 de Back Bay"' },
  { tecnica: 'Pesos de clase', filas0: 180511, filas1: 16047, val: 0.1359320966221036, elegido: true, nota: 'solo datos reales · error en recargo pesa ×11' },
]

// Partición aleatoria vs temporal (PR-AUC en prueba)
export const PARTICION = [
  { modelo: 'Árbol de decisión', aleatoria: 0.15263867051211844, temporal: 0.13789958644550412 },
  { modelo: 'Gradient boosting', aleatoria: 0.17210057616656646, temporal: 0.14007849575537804 },
  { modelo: 'Random forest', aleatoria: 0.30859547318877917, temporal: 0.1423335868486619 },
]
export const CV_MEZCLADA_RF = { mezclada: 0.31169729003439006, temporal: 0.1261972885938512 }

// Umbral final con la matriz corregida (FN = −USD 8,73), crítica de la docente.
// Fuente: Contenido Entrega 3/8_Pruebas_critica_FN/resultados (gradient boosting, prueba 15 al 18/12).
export const FINAL = {
  umbral: 0.34636786437024575,
  umbralAntes: 0.5702445188921351,
  accuracy: 0.3733479249095042,
  accBal: 0.6130151706746537,
  precision: 0.10778312199387845,
  recall: 0.9003652597402597,
  npv: 0.9730648965933403,
  roc: 0.6766092946127991,
  prauc: 0.14012180991604922,
  alertas: 0.6930886438252378,
  beneficio: -112.84489261233561,
  tn: 17738, fp: 36729, fn: 491, tp: 4437,
  vp: 7.73380071041316,
  costoFalsa: 1,
  costoFN: 8.73380071041316,
  chanceMinima: 0.05724884464146962,
}
// Matriz de confusión antes y después de darle costo al falso negativo (mismas predicciones)
export const MATRIZ_FN = {
  antes: { umbral: 0.5702445188921351, costoFN: 0, tn: 37791, fp: 16676, fn: 2329, tp: 2599, escapan: 0.4726055194805195, npv: 0.9419491525423729, avisa: 0.32452226618402225 },
  despues: { umbral: 0.34636786437024575, costoFN: 8.73380071041316, tn: 17738, fp: 36729, fn: 491, tp: 4437, escapan: 0.09963474025974026, npv: 0.9730648965933403, avisa: 0.6930886438252378 },
}
// Sensibilidad al costo del falso negativo (supuesto: cuánto vale la confianza rota)
export const SENS_FN = [
  { costo: 0, umbral: 0.5702, escapan: 0.4726, avisa: 0.3245, npv: 0.9419 },
  { costo: 4.37, umbral: 0.4157, escapan: 0.1550, avisa: 0.6011, npv: 0.9678 },
  { costo: 8.73, umbral: 0.3464, escapan: 0.0996, avisa: 0.6931, npv: 0.9731 },
  { costo: 17.47, umbral: 0.1694, escapan: 0.0136, avisa: 0.8955, npv: 0.9892 },
]
export const SIEMPRE_NO = { accuracy: 0.9170300530347673, recall: 0, tn: 54467, fn: 4928 }

// recargo_deciles_riesgo.csv
export const DECILES = [
  [1, 0.15673400673400673, 931, 0.18892045454545456, 1.8890455215029078],
  [2, 0.13301902677218386, 790, 0.3492288961038961, 1.6032193780709945],
  [3, 0.11582491582491583, 688, 0.4888392857142857, 1.3959863789409246],
  [4, 0.11584441825223102, 688, 0.6284496753246753, 1.3962214330542333],
  [5, 0.09410774410774411, 559, 0.7418831168831169, 1.1342389328895013],
  [6, 0.0823370937868328, 489, 0.841112012987013, 0.9923725011097675],
  [7, 0.05169220407476006, 307, 0.9034090909090909, 0.6230232266680954],
  [8, 0.04663299663299663, 277, 0.9596185064935064, 0.5620468415212734],
  [9, 0.02256272099680081, 134, 0.986810064935065, 0.27193847678672567],
  [10, 0.010942760942760943, 65, 1.0, 0.1318882480104071],
].map(([d, tasa, positivos, captura, lift]) => ({ d, tasa, positivos, captura, lift }))

// K-Means sobre los 12 productos (tarifa base y precio por milla)
export const KMEANS = {
  k: 3,
  silueta: [0.5739203025987692, 0.6820000244398456, 0.6114492320105543, 0.5472328901839408, 0.41644449832622454],
  inercia: [8.114376608152414, 2.003618220542792, 0.9582051843726886, 0.6945281987968999, 0.47918231147251394],
  ks: [2, 3, 4, 5, 6],
  productos: [
    { producto: 'Shared', plataforma: 'Lyft', base: 3.2985531098064835, milla: 1.2500558251725913, grupo: 'Económico' },
    { producto: 'Lyft', plataforma: 'Lyft', base: 5.585840153045569, milla: 1.7001074441981006, grupo: 'Económico' },
    { producto: 'UberPool', plataforma: 'Uber', base: 6.125478917213666, milla: 1.198807214260361, grupo: 'Económico' },
    { producto: 'WAV', plataforma: 'Uber', base: 6.390296435338202, milla: 1.542077729637606, grupo: 'Económico' },
    { producto: 'UberX', plataforma: 'Uber', base: 6.402403407911015, milla: 1.5339552841880069, grupo: 'Económico' },
    { producto: 'Lyft XL', plataforma: 'Lyft', base: 7.794609983486996, milla: 3.194210189714004, grupo: 'Intermedio' },
    { producto: 'Lux', plataforma: 'Lyft', base: 8.762530535390177, milla: 3.842135518535836, grupo: 'Intermedio' },
    { producto: 'UberXL', plataforma: 'Uber', base: 9.065195142560182, milla: 3.0144422349147297, grupo: 'Intermedio' },
    { producto: 'Black', plataforma: 'Uber', base: 12.105300422064577, milla: 3.8396082065609325, grupo: 'Intermedio' },
    { producto: 'Lux Black', plataforma: 'Lyft', base: 12.313272173989503, milla: 4.539472622030009, grupo: 'Intermedio' },
    { producto: 'Lux Black XL', plataforma: 'Lyft', base: 21.888801135544618, milla: 4.2382977192447555, grupo: 'Premium' },
    { producto: 'Black SUV', plataforma: 'Uber', base: 22.538251320451387, milla: 3.5275602589053308, grupo: 'Premium' },
  ],
}

// Pares Uber / Lyft por nivel y diferencia de Lyft vs Uber (B_h2)
export const NIVELES = [
  { nivel: 'Compartido', uber: 'UberPool', lyft: 'Shared', dif: -0.29466748739609044 },
  { nivel: 'Estándar', uber: 'UberX', lyft: 'Lyft', dif: -0.03306078857796999 },
  { nivel: 'XL', uber: 'UberXL', lyft: 'Lyft XL', dif: -0.04429208597835235 },
  { nivel: 'Black', uber: 'Black', lyft: 'Lux Black', dif: 0.07963325039398701 },
  { nivel: 'Black XL', uber: 'Black SUV', lyft: 'Lux Black XL', dif: 0.04741341596363146 },
]

// Calendario: 24 fechas del 25/11 al 18/12/2018
// estado: 'completa' | 'parcial' | 'sin'  ·  rol: 'train' | 'test' | null
export const CALENDARIO = [
  ['25/11', 'parcial', 'train'], ['26/11', 'completa', 'train'], ['27/11', 'completa', 'train'],
  ['28/11', 'completa', 'train'], ['29/11', 'completa', 'train'], ['30/11', 'completa', 'train'],
  ['01/12', 'completa', 'train'], ['02/12', 'completa', 'train'], ['03/12', 'completa', 'train'],
  ['04/12', 'parcial', 'train'], ['05/12', 'sin', null], ['06/12', 'sin', null],
  ['07/12', 'sin', null], ['08/12', 'sin', null], ['09/12', 'parcial', 'train'],
  ['10/12', 'sin', null], ['11/12', 'sin', null], ['12/12', 'parcial', 'train'],
  ['13/12', 'completa', 'train'], ['14/12', 'completa', 'train'], ['15/12', 'completa', 'test'],
  ['16/12', 'completa', 'test'], ['17/12', 'completa', 'test'], ['18/12', 'completa', 'test'],
].map(([fecha, estado, rol]) => ({ fecha, estado, rol }))

export const EQUIPO = [
  'Álvaro Pérez', 'Juan Ignacio Cremona', 'Ignacio Gil',
  'Federico Gon', 'Sofía Medina', 'Facundo Dagnino Dailly',
]

// Precio mediano por producto (Entrega 2, gráfico 06)
export const PRECIO_PRODUCTO = [
  ['Shared', 'Lyft', 7], ['UberPool', 'Uber', 8.5], ['Lyft', 'Lyft', 9], ['UberX', 'Uber', 9.5], ['WAV', 'Uber', 9.5],
  ['Lyft XL', 'Lyft', 13.5], ['UberXL', 'Uber', 15], ['Lux', 'Lyft', 16.5], ['Black', 'Uber', 19.5],
  ['Lux Black', 'Lyft', 22.5], ['Black SUV', 'Uber', 28.5], ['Lux Black XL', 'Lyft', 30],
].map(([producto, plataforma, precio]) => ({ producto, plataforma, precio }))

// Correlación de Pearson con el precio (Entrega 2, gráfico 17)
export const CLIMA_CORR = [
  ['Temperatura', 0], ['Prob. de lluvia', 0], ['Intensidad de lluvia', 0], ['Humedad', -0.001],
  ['Nubosidad', 0.001], ['Viento', 0.001], ['Visibilidad', 0.002], ['Distancia (referencia)', 0.345],
].map(([label, r]) => ({ label, r }))

// Las 57 columnas originales por bloque (Contexto.md 4.4)
export const COLUMNAS = [
  ['Identificación y tiempo', 7], ['Viaje y servicio', 8], ['Ubicación', 2], ['Clima', 40],
]

// Entrega 1 · primeras pistas sobre el recargo de Lyft (paneles de surge_active_insights.png)
export const PISTA_PRODUCTO = [
  ['Lyft', 8.2], ['Lyft XL', 8.2], ['Lux', 8.2], ['Lux Black', 8.2], ['Lux Black XL', 8.2], ['Shared', 0],
]
export const PISTA_ZONA = [
  ['Back Bay', 11.2], ['Northeastern University', 10.4], ['Fenway', 10.3], ['Boston University', 9.6],
  ['Theatre District', 9.6], ['Beacon Hill', 8.1], ['South Station', 6.6], ['Financial District', 5.7],
  ['West End', 3.9], ['North Station', 3.3], ['Haymarket Square', 1.6], ['North End', 1.5],
]
export const PISTA_CORR = [
  ['Índice UV', -0.0061], ['Sensación térmica', -0.0048], ['Nubosidad', -0.0045], ['Prob. de lluvia', -0.0041],
  ['Temperatura', -0.0037], ['Presión', -0.0032], ['Humedad', -0.0029], ['Viento', 0.0026], ['Visibilidad', 0.0026],
  ['Día de la semana', -0.0022], ['Ráfagas de viento', 0.0021], ['Intensidad de lluvia', -0.0015], ['Hora del día', -0.0011],
]
export const PISTA_AUC = [
  { t: 'Solo clima + hora', s: 'sin ruta ni producto', v: 0.50 },
  { t: 'Ruta + producto', s: 'tabla histórica', v: 0.70 },
  { t: 'Modelo completo', s: 'ruta + producto + clima + hora', v: 0.71 },
]

// % de cotizaciones de Lyft (sin Shared) con recargo, por hora local (leído del gráfico 18 de la Entrega 2; ±0,05 pp)
export const RECARGO_HORA = [
  8.10, 8.17, 7.50, 8.48, 8.02, 8.02, 8.06, 8.34, 9.60, 8.06, 7.87, 7.00,
  8.02, 8.13, 7.68, 8.93, 8.42, 8.44, 7.92, 8.50, 8.15, 8.46, 8.42, 8.08,
]
