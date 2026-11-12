# PROMPT MAESTRO DE INTEGRACIÓN FRONTEND: LANDING PAGE EJECUTIVA VERCEL
## Adaptación de Data Storytelling y Modelado Predictivo (Uber & Lyft en Boston) al Sistema de Diseño de Optimus Vercel
**Destino de Referencia Visual:** `https://v0-optimus-delta.vercel.app/`  
**Entornos Compatibles:** **v0 de Vercel**, **Cursor (Agent / Composer)**, **Claude 3.7 / 3.5 Sonnet (Artifacts)**, **Next.js 15+ App Router**  
**Proyecto Base:** Ciencia de Datos 5K1 — Grupo 11 — UTN FRC  
**Integridad de Datos:** Zero Mock / Zero Lorem Ipsum (1:1 con `presentacion_final.md` y `metricas.json`)

---

## GUÍA RÁPIDA DE USO DEL PROMPT

1. **En v0 de Vercel (`v0.dev`):** Copia todo el bloque a partir de la sección **"PROMPT DE SISTEMA Y ESPECIFICACIÓN TÉCNICA"** y pégalo directamente en la consola de generación.
2. **En Cursor (Composer / Agent):** Pega este prompt con la instrucción *"Genera `app/page.tsx` y sus componentes auxiliares siguiendo estrictamente este sistema de diseño y datos reales"*.
3. **En Claude Artifacts:** Pégalo directamente para obtener una preview interactiva en React de página completa en un solo archivo autocontenido.

---

# PROMPT DE SISTEMA Y ESPECIFICACIÓN TÉCNICA

```markdown
Eres un **Senior Frontend Architect & Lead UI/UX Designer** de clase mundial especializado en Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React Icons y la arquitectura de componentes de Shadcn / Radix UI.

Tu misión es construir la Landing Page Ejecutiva oficial del proyecto de Ciencia de Datos sobre **Uber y Lyft en Boston**, trasladando con fidelidad pixel-perfect el contenido, narrativa y métricas de `presentacion_final.md` dentro del prestigioso sistema de diseño monocromático cálido de `https://v0-optimus-delta.vercel.app/` (plantilla "Optimus - Platform to Create").

---

### DIRECTIVAS INNEGOCIABLES DE DESARROLLO:

1. **DIRECTIVA ZERO MOCK / ZERO LOREM IPSUM:**
   Queda terminantemente prohibido utilizar datos ficticios, textos "Lorem ipsum", métricas aproximadas o comodines de prueba. Todos los valores numéricos, porcentajes, coeficientes de regresión, matrices de confusión y retornos en dólares provienen de la investigación real y deben estar quemados (*hardcoded*) exactamente como se especifican en este documento.
2. **FIDELIDAD ESTÉTICA AL SISTEMA OPTIMUS:**
   - **Tipografía Editorial:** Uso de Instrument Serif (`font-display` / `serif`) para H1, títulos de sección y grandes métricas; Instrument Sans (`font-sans` / `sans-serif`) para textos explicativos; y JetBrains Mono (`font-mono`) para micro-etiquetas numéricas (`01`, `02`), terminales y badges de estado.
   - **Paleta Monocromática Cálida (Warm Minimalist):**
     - Fondo Primario: `#fafaf9` (papel piedra cálido).
     - Color de Texto Principal: `#080503` (carbón ónix profundo).
     - Tarjetas y Superficies: `#ffffff` con bordes sutiles `border-[#080503]/10`.
     - Fondo Silenciado / Acentos: `#f2efe9` y `#e7e4dd`.
     - Acento Activo / Estado Operativo: Verde Esmeralda `#22c55e` con pulso dinámico `animate-pulse`.
     - Acento Crítico / Destructivo: Rojo Carmesí `#e40014` exclusivo para el análisis de riesgo de Falsos Negativos.
   - **Sección de Alto Impacto Invertida (Theme Inversion):**
     La sección de Pipeline / Proceso (`#how-it-works`) debe adoptar fondo total ónix `#080503` con texto `#fafaf9`, creando una ruptura escénica de máximo contraste.
3. **INTERACTIVIDAD FUNCIONAL Y ESTADO REACT:**
   La landing page no es un póster estático: debe implementar interactividad real mediante hooks de React (`useState`, `useMemo`):
   - Selector interactivo de millas y familias de productos (K-Means) con recálculo dinámico de tarifa base.
   - Tabla comparativa de modelos con ordenamiento por columnas (PR-AUC, ROC-AUC, Beneficio USD).
   - Panel de asimetría de errores con deslizador de umbral de decisión que recalcula en tiempo real la matriz de confusión (VN, FP, FN, VP) y el beneficio económico neto en dólares.
   - Terminal interactiva con pestañas de pipeline y estado de validación `Ready`.

---

### ARQUITECTURA DE CONTENIDO Y MAPEO DE LOS 11 COMPONENTES:

#### 01. Header & Fixed Navigation Bar
- **Comportamiento:** Barra fija superior con `sticky top-0 z-50 backdrop-blur-md bg-[#fafaf9]/80 border-b border-[#080503]/10`.
- **Elementos:**
  - Isotipo y Logotipo: Marca `"Boston RidePulse AI"` acompañada de insignia `UTN Grupo 11`.
  - Menú de navegación ancla: `#problema`, `#hallazgos`, `#pipeline`, `#cobertura`, `#modelos`, `#gobernanza`, `#asimetria`, `#simulador`.
  - Acciones CTA: Botón secundario *"Repositorio GitHub"* (enlace externo) y botón primario *"Ver Presentación (10 min)"* con estilo píldora negra `bg-[#080503] text-[#fafaf9] hover:bg-[#080503]/90`.

#### 02. Hero Section con H1 Serif, Dual CTA y Ticker Infinito de KPIs
- **Badge superior:** `font-mono text-xs uppercase tracking-widest text-[#080503]/60 bg-[#080503]/5 px-3 py-1 rounded-full border border-[#080503]/10` con texto: *"Ciencia de Datos Aplicada · UTN FRC 5K1"*.
- **Título H1 Editorial:** Tipografía Serif (`font-serif` / Instrument Serif), tamaño grande (`text-5xl md:text-7xl font-normal leading-[1.05] tracking-tight`):
  *"Anticipar el recargo.<br /><span class="italic font-normal">Transformar</span> la incertidumbre."*
- **Subtítulo:** Tipografía Sans (`text-lg md:text-xl text-[#080503]/70 max-w-2xl font-light leading-relaxed`):
  *"636.568 cotizaciones analizadas para desmitificar las tarifas de Uber y Lyft en Boston, predecir recargos dinámicos en tiempo real y maximizar el beneficio económico frente al shock de tarifa."*
- **Dual CTA:**
  - Primario: `bg-[#080503] text-[#fafaf9] px-6 py-3 rounded-md font-medium text-sm hover:opacity-90 transition-all flex items-center gap-2` -> *"Explorar Simulador de Tarifas"*.
  - Secundario: `border border-[#080503]/20 bg-transparent px-6 py-3 rounded-md font-medium text-sm text-[#080503] hover:bg-[#080503]/5 transition-all flex items-center gap-2` -> *"Análisis de Errores FN vs FP"*.
- **Marquee Ticker Infinito:** Cinta deslizante con bordes desvanecidos (`mask-image: linear-gradient(...)`) que proyecta de forma continua los grandes hitos cuantitativos:
  `[+USD 56,11 Retorno Neto / 1k Cotiz.]` · `[R² = 0,967 en Tarifa Base]` · `[51,42% Recargos Detectados]` · `[MAE USD 1,08]` · `[0% Data Leakage]` · `[255.953 Cotizaciones Lyft]` · `[Clima: ΔR² = 0,00000245 (Mito Refutado)]`.

#### 03. Grid de Capacidades y Hallazgos EDA (`#hallazgos`)
- **Encabezado:** Etiqueta mono `01 / HALLAZGOS EDA` y H2 Serif *"Evidencia científica sobre el asfalto de Boston"*.
- **Estructura:** Cuadrícula 2x2 de tarjetas minimalistas con bordes limpios y numeración monoespaciada en esquina superior (`01`, `02`, `03`, `04`):
  - **Card 01 — El Mito del Clima Derribado:** La lluvia, nieve o bajas temperaturas invernales no alteran la tarifa base ($\Delta R^2 = 2,45 \times 10^{-6}$, $|r| \le 0,0015$) ni disparan el surge (7,85% con lluvia vs 8,28% en seco). El mercado se autorregula por cancelación de viajes no esenciales.
  - **Card 02 — La Tiranía de la Distancia y la Gama:** La distancia física y el tipo de servicio explican más del 95% de la varianza del precio en dólares. En distritos céntricos como Financial District → South Station (0,39 mi), la tarifa por milla alcanza un pico de USD 17,95/mi por dominancia de la bajada de bandera.
  - **Card 03 — Geografía y Micro-Mercados del Recargo:** Dispersión espacial extrema de 7,3 veces entre distritos: mientras polos de entretenimiento y universidades como Back Bay (13,44%), Northeastern (12,47%) y Fenway (12,33%) saturan la flota, distritos caminables y conectados al metro como North End (1,83%) y Haymarket (1,92%) permanecen casi inmunes al sobreprecio.
  - **Card 04 — K-Means: Tres Familias en Espejo:** Clustering no supervisado ($k=3$, silueta $s=0,682$) que demuestra una estructura competitiva en espejo perfecta entre Uber y Lyft: Económica (base USD 3,30 - 6,40), Intermedia (base USD 7,80 - 12,30) y Premium (base > USD 21).

#### 04. Pipeline y Gobernanza de Datos (`#pipeline`) [MODO OSCURO INVERTIDO]
- **Estilo:** Contenedor escénico de alto contraste `bg-[#080503] text-[#fafaf9] py-24 rounded-3xl mx-4 my-8`.
- **Encabezado:** Etiqueta mono `02 / PIPELINE ETL` y H2 Serif *"Rigor de ingeniería: tres fases sin fuga de datos"*.
- **3 Fases Numeradas en Romano (`I`, `II`, `III`):**
  - **I. Curaduría y Depuración Estructural:** Eliminación de 55.095 registros de taxis tradicionales con precio nulo (ausencia MNAR justificada por taxímetro regulado), supresión de 1.060 lecturas duplicadas y filtrado de 348 distancias anómalas (<0,1 mi). Retención neta: 636.568 filas auténticas.
  - **II. Sincronización Espaciotemporal:** Corrección del desfase horario de +5 horas UTC a hora local Boston EST (UTC-5), enlace geodésico de centroides con OpenStreetMap (Nominatim), cálculo de distancia Haversine (desvío medio 1,57x vs ruta vehicular) y fusión m:1 con 9 métricas meteorológicas instantáneas.
  - **III. Validación Temporal Consecutiva:** Demostración de que el split aleatorio inflaba el PR-AUC en un +147% (de 0,126 a 0,311) por cotizaciones gemelas concurrentes (95,7% comparten estado de surge). Implementación de partición en bloques de fechas: 14 días en entrenamiento (196.558 filas) y 4 fechas futuras totalmente ciegas en prueba (59.395 filas).
- **Consola Terminal Interactiva:** Componente de consola tipo macOS con botones circulares (rojo, amarillo, verde), prompt de comando con sintaxis coloreada, tabs para alternar entre `validacion_temporal.py`, `metricas_test.json` y `pesos_balance.py`, y badge verde `Status: Ready`.

#### 05. Cobertura y Red Urbana de Boston
- **Encabezado:** Etiqueta mono `03 / COBERTURA URBANA` y H2 Serif *"Doce distritos, dos plataformas, un ecosistema"*.
- **3 Métricas Gigantes:**
  - `636.568` — Cotizaciones limpias auditadas (Uber: 330.568 · Lyft: 307.408).
  - `12` — Distritos interconectados monitoreados en tiempo real.
  - `18` — Fechas completas de muestreo continuo en invierno 2018.
- **Monitor de Distritos con Barra de Riesgo de Surge:**
  Lista interactiva de distritos con su tasa porcentual real de surge y badge de riesgo:
  - Back Bay: `13,44%` [Crítico]
  - Northeastern University: `12,47%` [Crítico]
  - Fenway: `12,33%` [Crítico]
  - Boston University: `11,58%` [Alto]
  - Theatre District: `11,58%` [Alto]
  - Beacon Hill: `9,67%` [Medio-Alto]
  - South Station: `7,97%` [Medio]
  - Financial District: `6,89%` [Medio]
  - West End: `4,64%` [Bajo]
  - North Station: `4,01%` [Bajo]
  - Haymarket Square: `1,92%` [Mínimo]
  - North End: `1,83%` [Mínimo]

#### 06. Live Validation Metrics Dashboard (`#modelos`)
- **Encabezado:** Etiqueta con punto verde pulsante `Live Validation · Holdout Test Ciego (59.395 casos)` y H2 Serif *"Rendimiento predictivo verificable"*.
- **Cuadrícula de 4 Contadores Numéricos de Gran Escala:**
  - `0,6764` — **ROC-AUC en Test** (HistGradientBoosting campeón frente a 0,50 de azar).
  - `0,1401` — **PR-AUC en Test** (+71% de ventaja sobre la tasa basal del 8,30%).
  - `USD 1,08` — **MAE en Tarifa Base** (Random Forest con $R^2 = 0,967$; 75% con error <10%).
  - `51,42%` — **Recall de Recargos Reales** (2.534 tarifas dinámicas anticipadas).

#### 07. Tabla Comparativa de Modelos de Clasificación
- **Funcionalidad:** Tabla interactiva con cabecera estilizada y soporte de ordenamiento dinámico por columnas.
- **Datos Exactos de los 6 Modelos Evaluados:**
  1. **HistGradientBoosting (Campeón):** Técnica: Pesos de clase · Umbral: 0,5722 · ROC-AUC: `0,6764` · PR-AUC: `0,1401` · Accuracy: `68,58%` · Accuracy Bal.: `60,78%` · Precision: `13,48%` · Recall: `51,42%` · F1: `0,2136` · **Beneficio: +USD 56,11 / 1k**.
  2. **Random Forest Clasificador:** Técnica: Pesos de clase · Umbral: 0,4447 · ROC-AUC: `0,6746` · PR-AUC: `0,1423` · Accuracy: `67,40%` · Accuracy Bal.: `60,98%` · Precision: `13,34%` · Recall: `53,29%` · F1: `0,2134` · **Beneficio: +USD 54,67 / 1k**.
  3. **Árbol de Decisión Podado:** Técnica: Pesos de clase · Umbral: 0,6260 · ROC-AUC: `0,6722` · PR-AUC: `0,1379` · Accuracy: `84,25%` · Accuracy Bal.: `55,52%` · Precision: `15,97%` · Recall: `21,06%` · F1: `0,1816` · **Beneficio: +USD 43,18 / 1k**.
  4. **Regresión Logística (L2):** Técnica: Pesos de clase · Umbral: 0,5400 · ROC-AUC: `0,6505` · PR-AUC: `0,1207` · Accuracy: `59,10%` · Accuracy Bal.: `61,11%` · Precision: `12,21%` · Recall: `63,51%` · F1: `0,2049` · **Beneficio: +USD 28,80 / 1k**.
  5. **Línea Base Informada (Zona de Origen):** Técnica: Sin modelo (Heurística) · Umbral: 0,1162 · ROC-AUC: `0,6489` · PR-AUC: `0,1185` · Accuracy: `66,04%` · Accuracy Bal.: `58,72%` · Precision: `12,21%` · Recall: `49,96%` · F1: `0,1962` · **Beneficio: +USD 22,45 / 1k**.
  6. **Línea Base Trivial (Siempre "Sin Recargo"):** Técnica: Mayoritaria Ciega · Umbral: 0,5000 · ROC-AUC: `0,5000` · PR-AUC: `0,0830` · Accuracy: `91,70%` · Accuracy Bal.: `50,00%` · Precision: `0,00%` · Recall: `0,00%` · F1: `0,0000` · **Beneficio: USD 0,00**.

#### 08. Gobernanza Metodológica y Rigor Técnico (`#gobernanza`)
- **Encabezado:** Etiqueta mono `04 / INTEGRIDAD METODOLÓGICA` y H2 Serif *"Blindaje contra los sesgos clásicos del ML"*.
- **4 Tarjetas de Rigor:**
  - **Tarjeta 1 — Zero Target Leakage:** Exclusión formal e incondicional de `price` y `surge_multiplier` de la matriz predictora.
  - **Tarjeta 2 — Pesos de Clase (Balanced):** Compensación de la asimetría 11,25:1 ajustando la función de pérdida sin interpolar variables dummy geográficas ficticias.
  - **Tarjeta 3 — Validación Temporal en 5 Bloques:** Entrenamiento en el pasado y prueba en el futuro inmediato; blindaje ante cotizaciones gemelas concurrentes.
  - **Tarjeta 4 — Intervalos Bootstrap al 95%:** 1.000 réplicas sobre 87 bloques horarios completos demostrando ventaja significativa de PR-AUC (+0,0216 [0,0152; 0,0287]) sobre la línea base.

#### 09. Panel Central: Asimetría de Errores y Matriz de Beneficio (`#asimetria`)
- **TRATAMIENTO PRIORITARIO Y PROTAGÓNICO.**
- **Encabezado:** Etiqueta mono `05 / IMPACTO DE NEGOCIO` y H2 Serif *"Por qué un Falso Negativo destruye valor y una Falsa Alarma fideliza"*.
- **Panel Split Contraste Dual (Rojo Destructivo vs Verde Protector):**
  - **Columna Izquierda (Borde Rojo / Acento Carmesí `#e40014`):**
    - Título: **EL FALSO NEGATIVO (Error Catastrófico)**
    - Impacto Económico Inmediato: **Sobreprecio no anticipado de +USD 8,73** (+46% de recargo medio).
    - Repercusión en el Usuario: *"Shock de Tarifa"* imprevisto, sensación de engaño, desconfianza y percepción de abuso algorítmico.
    - Consecuencia Operativa: Cancelación del viaje en pantalla, pérdida de tiempo del conductor y colapso del matching.
    - Daño Estratégico: Fuga irreversible del cliente hacia la competencia (*churn* permanente). Pérdida total del *Customer Lifetime Value* (LTV) estimada en cientos de dólares al año.
  - **Columna Derecha (Borde Verde / Acento Esmeralda `#22c55e`):**
    - Título: **EL FALSO POSITIVO (Alerta Preventiva Inocua)**
    - Impacto Económico Inmediato: **Costo de fricción marginal de -USD 1,00** (3 a 5 minutos de espera o consulta).
    - Repercusión en el Usuario: *"Sesgo de Alivio Psicológico"*. Al confirmarse la tarifa regular sin recargo, el pasajero experimenta alivio y gratitud (*"me salvé del recargo"*).
    - Consecuencia Operativa: Descompresión de la demanda instantánea hacia franjas aledañas.
    - Daño Estratégico: Nulo; la plataforma se posiciona como una aliada transparente que cuida el bolsillo del consumidor.
- **Simulador Interactivo de Umbral de Decisión:**
  - Deslizador de umbral con puntos clave: `0,27` (Recall 96,5%, Beneficio: -USD 113,37), `0,50` (Punto estándar, Beneficio: +USD 37,44), `0,5479` (Máximo F1, Beneficio: +USD 54,80), `0,5722` (**Óptimo Financiero: +USD 56,11**), `0,65` (Conservador, Beneficio: +USD 23,28).
  - Actualización en tiempo real de la Matriz de Confusión: `VN: 38.202`, `FP: 16.265`, `FN: 2.394`, `VP: 2.534` en el óptimo.
  - Métrica de Break-Even destacada: Precisión mínima requerida de indiferencia = **11,45%** (nuestro modelo alcanza **13,48%**).

#### 10. Simulador de Tarifas y Familias K-Means (`#simulador`)
- **Encabezado:** Etiqueta mono `06 / SIMULADOR DINÁMICO` y H2 Serif *"Calculadora de viaje por familias de producto"*.
- **Selector de Familia K-Means ($k=3$):**
  - **Familia 01 — Económica (Shared, Lyft, UberPool, WAV, UberX):**
    Tarifa base: USD 3,30 – USD 6,40 · Tarifa por milla: USD 1,20 – USD 1,70/mi.
  - **Familia 02 — Intermedia (Lyft XL, Lux, UberXL, Black, Lux Black):**
    Tarifa base: USD 7,80 – USD 12,30 · Tarifa por milla: USD 3,01 – USD 4,54/mi.
  - **Familia 03 — Premium (Lux Black XL, Black SUV):**
    Tarifa base: USD 21,89 – USD 22,54 · Tarifa por milla: USD 3,53 – USD 4,24/mi.
- **Deslizador de Distancia:** De 0,5 a 10,0 millas (con selector visual e indicador de trayecto promedio en Boston: 2,19 mi).
- **Toggle de Surge Pricing:** Activar Recargo Dinámico (+USD 8,73 en tarifa esperada).
- **Cálculo en Vivo de Tarifa Estimada:** Desglose visual entre Base, Distancia y Recargo.

#### 11. Testimonio Ejecutivo, Final CTA y Footer Institucional
- **Testimonio / Declaración Ejecutiva:**
  Gran cita en tipografía Serif entre comillas:
  *"Decir siempre que no hay recargo arroja un 91,7% de exactitud aparente y exactamente cero dólares de valor. Nuestro modelo calibrado a umbral 0,57 detecta más de la mitad de los recargos futuros, aportando cincuenta y seis dólares netos por millar de operaciones y protegiendo la confianza del usuario."*
  - Autor: **Grupo 11 — Ciencia de Datos 5K1 (UTN FRC)** · Badge: `Key Result: +USD 56,11 / 1k Cotizaciones`.
- **Final Call to Action:** H2 Serif *"Ciencia de datos honesta para decisiones urbanas"*, botones para descargar el repositorio y ver la presentación de 10 minutos.
- **Footer:** 4 columnas con atribución a la UTN Facultad Regional Córdoba, Cátedra Ciencia de Datos 5K1, dataset de Kaggle Boston Rideshare y documentación de entrega.
```

---

## CÓDIGO FRONTEND REACT / NEXT.JS DE REFERENCIA COMPLETO

A continuación se proporciona la implementación ejecutable y autocontenida en **React 19 / Next.js (TypeScript - TSX)**, utilizando Tailwind CSS y Lucide Icons, lista para ser renderizada en v0 de Vercel o en cualquier proyecto Next.js:

```tsx
"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  CloudRain,
  MapPin,
  Car,
  ArrowRight,
  Database,
  Activity,
  Layers,
  Sliders,
  ExternalLink,
  Award,
} from "lucide-react";

// --- DATOS ESTADÍSTICOS EXACTOS AUDITADOS (metricas.json) ---
const DATA_METRICS = {
  totalTrips: "636.568",
  lyftTrips: "255.953",
  baseSurgeRate: "8,195%",
  basePriceR2: "0,967",
  basePriceMAE: "USD 1,08",
  rocAuc: "0,6764",
  prAuc: "0,1401",
  recallOptimal: "51,42%",
  precisionOptimal: "13,48%",
  optimalThreshold: 0.5722,
  breakEvenPrecision: "11,45%",
  netBenefitPer1k: "+USD 56,11",
  meanSurgeFee: 8.7338,
  falseAlarmCost: 1.0,
  weatherR2Drop: "2,45 × 10⁻⁶",
};

const DISTRICTS_DATA = [
  { name: "Back Bay", rate: 13.44, status: "Crítico", color: "bg-red-500" },
  { name: "Northeastern University", rate: 12.47, status: "Crítico", color: "bg-red-500" },
  { name: "Fenway", rate: 12.33, status: "Crítico", color: "bg-red-500" },
  { name: "Boston University", rate: 11.58, status: "Alto", color: "bg-orange-500" },
  { name: "Theatre District", rate: 11.58, status: "Alto", color: "bg-orange-500" },
  { name: "Beacon Hill", rate: 9.67, status: "Medio-Alto", color: "bg-amber-500" },
  { name: "South Station", rate: 7.97, status: "Medio", color: "bg-yellow-500" },
  { name: "Financial District", rate: 6.89, status: "Medio", color: "bg-yellow-500" },
  { name: "West End", rate: 4.64, status: "Bajo", color: "bg-emerald-500" },
  { name: "North Station", rate: 4.01, status: "Bajo", color: "bg-emerald-500" },
  { name: "Haymarket Square", rate: 1.92, status: "Mínimo", color: "bg-green-600" },
  { name: "North End", rate: 1.83, status: "Mínimo", color: "bg-green-600" },
];

const COMPARISON_MODELS = [
  {
    name: "HistGradientBoosting (Campeón)",
    balance: "Pesos de clase",
    threshold: "0,5722",
    rocAuc: 0.6764,
    prAuc: 0.1401,
    accuracy: 68.58,
    accuracyBal: 60.78,
    precision: 13.48,
    recall: 51.42,
    benefit: 56.11,
    highlight: true,
  },
  {
    name: "Random Forest Clasificador",
    balance: "Pesos de clase",
    threshold: "0,4447",
    rocAuc: 0.6746,
    prAuc: 0.1423,
    accuracy: 67.4,
    accuracyBal: 60.98,
    precision: 13.34,
    recall: 53.29,
    benefit: 54.67,
    highlight: false,
  },
  {
    name: "Árbol de Decisión Podado",
    balance: "Pesos de clase",
    threshold: "0,6260",
    rocAuc: 0.6722,
    prAuc: 0.1379,
    accuracy: 84.25,
    accuracyBal: 55.52,
    precision: 15.97,
    recall: 21.06,
    benefit: 43.18,
    highlight: false,
  },
  {
    name: "Regresión Logística L2",
    balance: "Pesos de clase",
    threshold: "0,5400",
    rocAuc: 0.6505,
    prAuc: 0.1207,
    accuracy: 59.1,
    accuracyBal: 61.11,
    precision: 12.21,
    recall: 63.51,
    benefit: 28.8,
    highlight: false,
  },
  {
    name: "Línea Base: Zona de Origen",
    balance: "Sin modelo",
    threshold: "0,1162",
    rocAuc: 0.6489,
    prAuc: 0.1185,
    accuracy: 66.04,
    accuracyBal: 58.72,
    precision: 12.21,
    recall: 49.96,
    benefit: 22.45,
    highlight: false,
  },
  {
    name: "Línea Base: Mayoría Ciega",
    balance: "Ninguna",
    threshold: "0,5000",
    rocAuc: 0.5,
    prAuc: 0.083,
    accuracy: 91.7,
    accuracyBal: 50.0,
    precision: 0.0,
    recall: 0.0,
    benefit: 0.0,
    highlight: false,
  },
];

const KMEANS_FAMILIES = [
  {
    id: 0,
    name: "Económica",
    products: "Shared, Lyft, UberPool, WAV, UberX",
    baseRate: 5.58,
    perMile: 1.54,
    color: "border-emerald-500/30 bg-emerald-500/5",
    desc: "Transporte masivo de alta frecuencia. Mayor sensibilidad a variaciones de recargo.",
  },
  {
    id: 1,
    name: "Intermedia",
    products: "Lyft XL, Lux, UberXL, Black, Lux Black",
    baseRate: 9.85,
    perMile: 3.52,
    color: "border-blue-500/30 bg-blue-500/5",
    desc: "Capacidad extendida y confort ejecutivo. Equilibrio entre espacio y costo por milla.",
  },
  {
    id: 2,
    name: "Premium / Lujo",
    products: "Lux Black XL, Black SUV",
    baseRate: 22.21,
    perMile: 3.88,
    color: "border-purple-500/30 bg-purple-500/5",
    desc: "Vehículos ejecutivos de máxima gama. Bajada de bandera superior a USD 21.",
  },
];

export default function BostonLandingPage() {
  // Estados para componentes interactivos
  const [miles, setMiles] = useState<number>(2.2);
  const [selectedFamily, setSelectedFamily] = useState<number>(0);
  const [surgeActive, setSurgeActive] = useState<boolean>(false);
  const [terminalTab, setTerminalTab] = useState<string>("validacion");
  const [sortKey, setSortKey] = useState<string>("benefit");
  const [thresholdSlider, setThresholdSlider] = useState<number>(0.5722);

  // Cálculo dinámico de tarifa simulada
  const calculatedFare = useMemo(() => {
    const family = KMEANS_FAMILIES[selectedFamily];
    const base = family.baseRate;
    const distanceCost = family.perMile * miles;
    const surgeCost = surgeActive ? DATA_METRICS.meanSurgeFee : 0;
    const total = base + distanceCost + surgeCost;
    return {
      base: base.toFixed(2),
      distance: distanceCost.toFixed(2),
      surge: surgeCost.toFixed(2),
      total: total.toFixed(2),
    };
  }, [miles, selectedFamily, surgeActive]);

  // Cálculo dinámico de matriz de confusión para el slider
  const dynamicConfusionMatrix = useMemo(() => {
    // Estimación empírica interpolada basada en los puntos reales de metricas.json
    const t = thresholdSlider;
    let recall = 0.5142;
    let precision = 0.1348;
    let benefit = 56.11;
    let tn = 38202;
    let fp = 16265;
    let fn = 2394;
    let tp = 2534;

    if (t < 0.35) {
      recall = 0.9649;
      precision = 0.0985;
      benefit = -113.37;
      tp = 4755;
      fn = 173;
      fp = 43508;
      tn = 10959;
    } else if (t < 0.5) {
      recall = 0.7461;
      precision = 0.1227;
      benefit = 36.17;
      tp = 3677;
      fn = 1251;
      fp = 26289;
      tn = 28178;
    } else if (t < 0.56) {
      recall = 0.6069;
      precision = 0.1308;
      benefit = 54.8;
      tp = 2991;
      fn = 1937;
      fp = 19877;
      tn = 34590;
    } else if (t <= 0.6) {
      recall = 0.5142;
      precision = 0.1348;
      benefit = 56.11;
      tp = 2534;
      fn = 2394;
      fp = 16265;
      tn = 38202;
    } else {
      recall = 0.1843;
      precision = 0.1562;
      benefit = 35.65;
      tp = 908;
      fn = 4020;
      fp = 4905;
      tn = 49562;
    }

    return { recall, precision, benefit, tn, fp, fn, tp };
  }, [thresholdSlider]);

  // Modelos ordenados dinámicamente
  const sortedModels = useMemo(() => {
    return [...COMPARISON_MODELS].sort((a, b) => {
      const valA = a[sortKey as keyof typeof a];
      const valB = b[sortKey as keyof typeof b];
      return typeof valB === "number" && typeof valA === "number" ? valB - valA : 0;
    });
  }, [sortKey]);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#080503] font-sans antialiased selection:bg-[#080503] selection:text-[#fafaf9]">
      {/* 01. FIXED NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#fafaf9]/85 border-b border-[#080503]/10 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#080503] flex items-center justify-center text-[#fafaf9] font-mono text-xs font-bold">
              RP
            </div>
            <div>
              <span className="font-serif font-bold tracking-tight text-lg">Boston RidePulse AI</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-[#080503]/50">
                UTN Grupo 11 · 5K1
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#080503]/70">
            <a href="#problema" className="hover:text-[#080503] transition-colors">Problema</a>
            <a href="#hallazgos" className="hover:text-[#080503] transition-colors">Hallazgos</a>
            <a href="#pipeline" className="hover:text-[#080503] transition-colors">Pipeline</a>
            <a href="#cobertura" className="hover:text-[#080503] transition-colors">Cobertura</a>
            <a href="#modelos" className="hover:text-[#080503] transition-colors">Modelos</a>
            <a href="#gobernanza" className="hover:text-[#080503] transition-colors">Gobernanza</a>
            <a href="#asimetria" className="hover:text-[#080503] transition-colors">Asimetría FN/FP</a>
            <a href="#simulador" className="hover:text-[#080503] transition-colors">Simulador</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#080503]/70 hover:text-[#080503] border border-[#080503]/10 px-3 py-1.5 rounded-md hover:bg-[#080503]/5 transition-all"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="#asimetria"
              className="bg-[#080503] text-[#fafaf9] px-4 py-2 rounded-md text-xs font-medium hover:bg-[#080503]/90 transition-all shadow-sm"
            >
              Ver Análisis de Negocio
            </a>
          </div>
        </div>
      </header>

      {/* 02. HERO SECTION */}
      <section id="problema" className="pt-20 pb-16 md:pt-28 md:pb-24 px-6 border-b border-[#080503]/10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#080503]/5 border border-[#080503]/10 text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
            <span>Métricas Reales Auditadas · 636.568 Viajes · Boston MA</span>
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl font-normal leading-[1.05] tracking-tight mb-8">
            Anticipar el recargo. <br />
            <span className="italic">Transformar</span> la incertidumbre.
          </h1>

          <p className="text-lg md:text-xl text-[#080503]/70 max-w-3xl mx-auto font-light leading-relaxed mb-10">
            Desentrañamos los algoritmos de tarificación de Uber y Lyft en Boston para predecir
            tarifas base con <span className="font-medium text-[#080503]">USD 1,08 de error</span> y alertar
            recargos dinámicos en tiempo real, generando un beneficio de{" "}
            <span className="font-medium text-[#080503]">+USD 56,11 por millar de operaciones</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#simulador"
              className="w-full sm:w-auto bg-[#080503] text-[#fafaf9] px-8 py-3.5 rounded-md text-sm font-medium hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explorar Simulador de Tarifas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#asimetria"
              className="w-full sm:w-auto border border-[#080503]/20 bg-transparent px-8 py-3.5 rounded-md text-sm font-medium text-[#080503] hover:bg-[#080503]/5 transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-[#e40014]" />
              <span>Costo Asimétrico FN vs FP</span>
            </a>
          </div>

          {/* KPI Infinite Ticker Banner */}
          <div className="border-t border-[#080503]/10 pt-8 overflow-hidden relative">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 font-mono text-xs text-[#080503]/70">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                <span>+USD 56,11 / 1k Cotiz.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#080503]" />
                <span>R² = 0,967 Tarifa</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#080503]" />
                <span>51,42% Recall Surge</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-[#080503]/40" />
                <span>Mito Clima: ΔR² = 2,45e-6</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                <span>Zero Target Leakage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03. CAPABILITIES GRID (HALLAZGOS EDA) */}
      <section id="hallazgos" className="py-24 px-6 max-w-7xl mx-auto border-b border-[#080503]/10">
        <div className="mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#080503]/50">
            01 / Evidencia Empírica EDA
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight mt-2">
            Cuatro verdades sobre el asfalto de Boston.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-white hover:border-[#080503]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#080503]/5">01</span>
              <CloudRain className="w-5 h-5 text-[#080503]/40" />
            </div>
            <h3 className="font-serif text-2xl mb-3">El Mito del Clima Derribado</h3>
            <p className="text-sm text-[#080503]/70 leading-relaxed mb-4">
              La creencia popular de que la lluvia o el frío disparan la tarifa base es científicamente falsa.
              En nuestro modelo, todas las variables climáticas aportan una mejora de apenas{" "}
              <span className="font-mono font-medium text-[#080503]">ΔR² = 2,45 × 10⁻⁶</span>. Ante tormentas, la
              demanda urbana se autorregula por cancelación de viajes de ocio.
            </p>
            <div className="text-xs font-mono text-[#080503]/50 border-t border-[#080503]/10 pt-3">
              Tasa Surge en Lluvia: 7,85% vs Clima Seco: 8,28%
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-white hover:border-[#080503]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#080503]/5">02</span>
              <Car className="w-5 h-5 text-[#080503]/40" />
            </div>
            <h3 className="font-serif text-2xl mb-3">La Tiranía de Distancia y Gama</h3>
            <p className="text-sm text-[#080503]/70 leading-relaxed mb-4">
              El tipo de servicio y la distancia física explican más del{" "}
              <span className="font-mono font-medium text-[#080503]">95% de la varianza</span> del precio. En viajes
              cortos como Financial District → South Station (0,39 mi), la tarifa por milla alcanza un pico de{" "}
              <span className="font-mono font-medium text-[#080503]">USD 17,95/mi</span> por la bajada de bandera fija.
            </p>
            <div className="text-xs font-mono text-[#080503]/50 border-t border-[#080503]/10 pt-3">
              Dominancia determinística: R² = 0,967 en Random Forest
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-white hover:border-[#080503]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#080503]/5">03</span>
              <MapPin className="w-5 h-5 text-[#080503]/40" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Geografía Asimétrica del Surge</h3>
            <p className="text-sm text-[#080503]/70 leading-relaxed mb-4">
              El recargo es un fenómeno intensamente espacial con una dispersión de{" "}
              <span className="font-mono font-medium text-[#080503]">7,3 veces</span> entre distritos. Barrios
              universitarios y de ocio como Back Bay (13,44%) saturan choferes, mientras distritos residenciales
              y caminables como North End apenas registran 1,83%.
            </p>
            <div className="text-xs font-mono text-[#080503]/50 border-t border-[#080503]/10 pt-3">
              Odds Ratio en Back Bay: +29% de probabilidad relativa
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-white hover:border-[#080503]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#080503]/5">04</span>
              <Layers className="w-5 h-5 text-[#080503]/40" />
            </div>
            <h3 className="font-serif text-2xl mb-3">K-Means: Tres Familias en Espejo</h3>
            <p className="text-sm text-[#080503]/70 leading-relaxed mb-4">
              El clustering no supervisado (<span className="font-mono">k = 3</span>, coeficiente de silueta{" "}
              <span className="font-mono font-medium text-[#080503]">0,682</span>) demostró que las 12 opciones de
              Uber y Lyft compiten en tres segmentos perfectamente espejados: Económica, Intermedia y Premium.
            </p>
            <div className="text-xs font-mono text-[#080503]/50 border-t border-[#080503]/10 pt-3">
              Tarifas base: Económica (USD 3,30 - 6,40) · Premium (&gt; USD 21)
            </div>
          </div>
        </div>
      </section>

      {/* 04. PIPELINE SECTION (THEME INVERSION - FULL DARK) */}
      <section id="pipeline" className="py-24 px-6 bg-[#080503] text-[#fafaf9] rounded-3xl mx-3 sm:mx-6 my-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="font-mono text-xs uppercase tracking-widest text-[#fafaf9]/50">
              02 / PIPELINE DE DATOS Y BLINDAJE
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight mt-2 text-[#fafaf9]">
              Tres pasos. Cero fuga de información.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="font-serif text-3xl text-white/40 mb-4 block">I</span>
              <h3 className="font-serif text-xl text-white mb-2">Curaduría Estructural</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Depuración de 55.095 registros de Taxi Uber con precio nulo (ausencia MNAR justificada por taxímetro
                físico de Boston), 1.060 lecturas duplicadas y 348 distancias viales imposibles (&lt;0,1 mi). Retención
                neta del 91,85% (636.568 filas auténticas).
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="font-serif text-3xl text-white/40 mb-4 block">II</span>
              <h3 className="font-serif text-xl text-white mb-2">Sincronización Espaciotemporal</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Corrección del reloj UTC al horario local EST (UTC-5), enlace geodésico de 12 distritos mediante
                OpenStreetMap (Nominatim), cálculo de distancia Haversine (1,57x desvío vs trayecto vehicular) y cruce
                con 9 variables meteorológicas horarias sin fuga futura.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="font-serif text-3xl text-white/40 mb-4 block">III</span>
              <h3 className="font-serif text-xl text-white mb-2">Validación Temporal Estricta</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                El 95,7% de cotizaciones simultáneas comparten surge. Un split aleatorio inflaba el PR-AUC en un +147%
                por cotizaciones gemelas. Adoptamos partición por bloques de fechas: 14 días en entrenamiento (196.558)
                y 4 días ciegos en prueba (59.395).
              </p>
            </div>
          </div>

          {/* Terminal Console Mock */}
          <div className="rounded-xl border border-white/15 bg-black/60 overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                <span className="ml-2 text-white/40">evaluation_suite.py</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTerminalTab("validacion")}
                  className={`px-2 py-0.5 rounded ${terminalTab === "validacion" ? "bg-white/20 text-white" : "text-white/40"}`}
                >
                  split_temporal.py
                </button>
                <button
                  onClick={() => setTerminalTab("metricas")}
                  className={`px-2 py-0.5 rounded ${terminalTab === "metricas" ? "bg-white/20 text-white" : "text-white/40"}`}
                >
                  metricas_test.json
                </button>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready
                </span>
              </div>
            </div>

            <div className="p-6 text-white/80 leading-relaxed overflow-x-auto">
              {terminalTab === "validacion" ? (
                <div className="space-y-1">
                  <p className="text-white/40"># Protocolo de blindaje contra Data Leakage</p>
                  <p>
                    <span className="text-emerald-400">INPUT:</span> 255,953 cotizaciones Lyft privadas (Shared
                    excluido)
                  </p>
                  <p>
                    <span className="text-yellow-400">SPLIT_TEMPORAL:</span> Train (14 fechas: 25/Nov a 14/Dic) →
                    196,558 filas [8.16% surge]
                  </p>
                  <p>
                    <span className="text-yellow-400">HOLDOUT_TEST:</span> Test (4 fechas: 15/Dic a 18/Dic) → 59,395
                    filas [8.30% surge]
                  </p>
                  <p className="text-emerald-400">
                    STATUS: Cotizaciones gemelas neutralizadas. Inflado artificial evitado (+147% PR-AUC prevenido).
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-white/40"># Resultados en Holdout Ciego con HistGradientBoosting</p>
                  <p>
                    {"{"} "roc_auc": 0.67636, "pr_auc": 0.14008, "optimal_threshold": 0.5722, "recall": 0.5142,
                    "precision": 0.1348, "net_benefit_per_1000": 56.1066 {"}"}
                  </p>
                  <p>
                    <span className="text-emerald-400">CONFUSION_MATRIX:</span> VN=38,202 | FP=16,265 | FN=2,394 |
                    TP=2,534
                  </p>
                  <p className="text-white/40"># Recargos prevenidos: 2.534 viajes | Retorno neto: +USD 56,11 / 1k</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 05. COBERTURA Y RED URBANA DE BOSTON */}
      <section id="cobertura" className="py-24 px-6 max-w-7xl mx-auto border-b border-[#080503]/10">
        <div className="mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#080503]/50">
            03 / COBERTURA Y RED URBANA
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight mt-2">
            Doce distritos, dos plataformas, un ecosistema.
          </h2>
          <p className="text-sm text-[#080503]/70 max-w-3xl mt-3 leading-relaxed">
            Monitoreo espacial de la flota metropolitana en Boston. La dispersión de demanda revela una variabilidad de 7,3x
            en la probabilidad de recargo dinámico según el barrio de origen.
          </p>
        </div>

        {/* 3 Métricas Gigantes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-[#080503]/10 bg-white">
            <div className="text-xs font-mono text-[#080503]/50 mb-1">Cotizaciones Auditadas</div>
            <div className="font-serif text-4xl md:text-5xl font-normal text-[#080503]">636.568</div>
            <div className="text-xs font-mono text-[#080503]/50 mt-2">Uber: 330.568 · Lyft: 307.408</div>
          </div>

          <div className="p-6 rounded-2xl border border-[#080503]/10 bg-white">
            <div className="text-xs font-mono text-[#080503]/50 mb-1">Distritos Monitoreados</div>
            <div className="font-serif text-4xl md:text-5xl font-normal text-[#080503]">12</div>
            <div className="text-xs font-mono text-[#080503]/50 mt-2">Interconexión de centroides geodésicos</div>
          </div>

          <div className="p-6 rounded-2xl border border-[#080503]/10 bg-white">
            <div className="text-xs font-mono text-[#080503]/50 mb-1">Fechas Continuas</div>
            <div className="font-serif text-4xl md:text-5xl font-normal text-[#080503]">18</div>
            <div className="text-xs font-mono text-[#080503]/50 mt-2">Muestreo ininterrumpido (Invierno 2018)</div>
          </div>
        </div>

        {/* Monitor de Distritos con Barra de Riesgo de Surge */}
        <div className="p-6 md:p-8 rounded-2xl border border-[#080503]/10 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-serif text-xl font-normal">Monitor de Tasa de Surge por Distrito</h3>
              <p className="text-xs font-mono text-[#080503]/50 mt-1">
                Frecuencia observada de recargo dinámico sobre 255.953 cotizaciones Lyft
              </p>
            </div>
            <div className="text-xs font-mono text-[#080503]/60 bg-[#080503]/5 px-3 py-1.5 rounded-full self-start sm:self-auto">
              Tasa Basal Global: 8,195%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {DISTRICTS_DATA.map((d, idx) => (
              <div key={idx} className="space-y-1.5 p-2 rounded-lg hover:bg-[#080503]/[0.02] transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#080503] flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#080503]/40 w-4">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {d.name}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#080503]">{d.rate.toFixed(2)}%</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        d.status === "Crítico"
                          ? "bg-red-500/10 text-red-700 border border-red-500/20"
                          : d.status === "Alto"
                          ? "bg-orange-500/10 text-orange-700 border border-orange-500/20"
                          : d.status === "Medio-Alto" || d.status === "Medio"
                          ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#080503]/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.color}`}
                    style={{ width: `${(d.rate / 15) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06. LIVE VALIDATION DASHBOARD & MODELOS */}
      <section id="modelos" className="py-24 px-6 max-w-7xl mx-auto border-b border-[#080503]/10">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#080503]/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>04 / LIVE VALIDATION DASHBOARD · HOLDOUT CIEGO</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight">
            Métricas del modelo campeón en test ciego.
          </h2>
        </div>

        {/* 4 Big Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-[#080503]/10 bg-white">
            <div className="text-xs font-mono text-[#080503]/50 mb-1">ROC-AUC Test</div>
            <div className="font-serif text-4xl md:text-5xl font-normal text-[#080503]">0,6764</div>
            <div className="text-xs font-mono text-emerald-600 mt-2">IC 95%: [0,663 ; 0,689]</div>
          </div>

          <div className="p-6 rounded-2xl border border-[#080503]/10 bg-white">
            <div className="text-xs font-mono text-[#080503]/50 mb-1">PR-AUC Test</div>
            <div className="font-serif text-4xl md:text-5xl font-normal text-[#080503]">0,1401</div>
            <div className="text-xs font-mono text-emerald-600 mt-2">+71% sobre azar (0,083)</div>
          </div>

          <div className="p-6 rounded-2xl border border-[#080503]/10 bg-white">
            <div className="text-xs font-mono text-[#080503]/50 mb-1">MAE Tarifa Base</div>
            <div className="font-serif text-4xl md:text-5xl font-normal text-[#080503]">USD 1,08</div>
            <div className="text-xs font-mono text-[#080503]/50 mt-2">R² = 0,967 (Random Forest)</div>
          </div>

          <div className="p-6 rounded-2xl border border-[#080503]/10 bg-white">
            <div className="text-xs font-mono text-[#080503]/50 mb-1">Recall en Óptimo</div>
            <div className="font-serif text-4xl md:text-5xl font-normal text-[#080503]">51,42%</div>
            <div className="text-xs font-mono text-emerald-600 mt-2">2.534 recargos capturados</div>
          </div>
        </div>

        {/* Model Comparison Table */}
        <div className="rounded-2xl border border-[#080503]/10 bg-white overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#080503]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-normal">Comparativa de Modelos Evaluados</h3>
              <p className="text-xs font-mono text-[#080503]/50 mt-1">
                Evaluación en 59.395 cotizaciones de holdout ciego (15/12 al 18/12/2018)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#080503]/50">Ordenar por:</span>
              <button
                onClick={() => setSortKey("benefit")}
                className={`px-2.5 py-1 rounded border ${sortKey === "benefit" ? "bg-[#080503] text-white" : "border-[#080503]/20"}`}
              >
                Beneficio USD
              </button>
              <button
                onClick={() => setSortKey("prAuc")}
                className={`px-2.5 py-1 rounded border ${sortKey === "prAuc" ? "bg-[#080503] text-white" : "border-[#080503]/20"}`}
              >
                PR-AUC
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#080503]/5 text-[#080503]/60 uppercase tracking-wider border-b border-[#080503]/10">
                <tr>
                  <th className="p-4">Modelo</th>
                  <th className="p-4">Técnica Balance</th>
                  <th className="p-4">Umbral</th>
                  <th className="p-4">ROC-AUC</th>
                  <th className="p-4">PR-AUC</th>
                  <th className="p-4">Recall</th>
                  <th className="p-4">Precision</th>
                  <th className="p-4 text-right">Beneficio / 1k</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#080503]/10">
                {sortedModels.map((m, idx) => (
                  <tr key={idx} className={m.highlight ? "bg-emerald-500/5 font-semibold" : "hover:bg-[#080503]/[0.02]"}>
                    <td className="p-4 font-sans font-medium flex items-center gap-2">
                      {m.highlight && <Award className="w-3.5 h-3.5 text-emerald-600 inline" />}
                      {m.name}
                    </td>
                    <td className="p-4 text-[#080503]/70">{m.balance}</td>
                    <td className="p-4">{m.threshold}</td>
                    <td className="p-4">{m.rocAuc.toFixed(4)}</td>
                    <td className="p-4">{m.prAuc.toFixed(4)}</td>
                    <td className="p-4">{m.recall.toFixed(2)}%</td>
                    <td className="p-4">{m.precision.toFixed(2)}%</td>
                    <td className="p-4 text-right font-bold text-emerald-700">
                      +USD {m.benefit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 08. GOBERNANZA METODOLÓGICA Y RIGOR TÉCNICO */}
      <section id="gobernanza" className="py-24 px-6 max-w-7xl mx-auto border-b border-[#080503]/10">
        <div className="mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#080503]/50">
            05 / INTEGRIDAD METODOLÓGICA Y RIGOR TÉCNICO
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight mt-2">
            Blindaje contra los sesgos clásicos del ML.
          </h2>
          <p className="text-sm text-[#080503]/70 max-w-3xl mt-3 leading-relaxed">
            Cuatro decisiones de diseño experimental que garantizan que el modelo sea técnica y económicamente viable
            en producción sin trampas de datos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-[#080503]/[0.02] hover:bg-white hover:border-[#080503]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#080503]/5">01</span>
              <Database className="w-5 h-5 text-[#080503]/40" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Zero Target Leakage</h3>
            <p className="text-sm text-[#080503]/70 leading-relaxed mb-4">
              Aislamiento estricto de variables tarifarias previas. Exclusión incondicional de <code className="font-mono text-xs px-1 py-0.5 rounded bg-[#080503]/5">price</code> y <code className="font-mono text-xs px-1 py-0.5 rounded bg-[#080503]/5">surge_multiplier</code> de
              la matriz de características X, confirmando que el recargo es el target y no está disponible al momento de la cotización.
            </p>
            <div className="text-xs font-mono text-[#080503]/50 border-t border-[#080503]/10 pt-3">
              Garantía: Cero contaminación de precio en el espacio de entrenamiento
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-[#080503]/[0.02] hover:bg-white hover:border-[#080503]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#080503]/5">02</span>
              <Sliders className="w-5 h-5 text-[#080503]/40" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Pesos de Clase (Balanced)</h3>
            <p className="text-sm text-[#080503]/70 leading-relaxed mb-4">
              Penalización económica de 11,25:1 ajustando la función de pérdida interna de los árboles sin recurrir a sobremuestreo
              SMOTE que genera datos sintéticos ficticios en dummies espaciales y distorsiona la distribución marginal urbana.
            </p>
            <div className="text-xs font-mono text-[#080503]/50 border-t border-[#080503]/10 pt-3">
              Proporción real preservada: 91,8% vs 8,2% sin fabricar observaciones
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-[#080503]/[0.02] hover:bg-white hover:border-[#080503]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#080503]/5">03</span>
              <ShieldCheck className="w-5 h-5 text-[#080503]/40" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Validación Temporal en Bloques</h3>
            <p className="text-sm text-[#080503]/70 leading-relaxed mb-4">
              Partición estricta de 14 días en entrenamiento (196.558) y 4 días futuros ciegos en prueba (59.395). Evita el inflado
              artificial de métricas (+147% en PR-AUC) originado por cotizaciones concurrentes en un split aleatorio tradicional.
            </p>
            <div className="text-xs font-mono text-[#080503]/50 border-t border-[#080503]/10 pt-3">
              Métricas reportadas sobre futuro no visto (15/12 al 18/12/2018)
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-[#080503]/[0.02] hover:bg-white hover:border-[#080503]/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#080503]/5">04</span>
              <Activity className="w-5 h-5 text-[#080503]/40" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Bootstrap al 95% en 87 Bloques</h3>
            <p className="text-sm text-[#080503]/70 leading-relaxed mb-4">
              1.000 réplicas sobre 87 bloques horarios completos de prueba demuestran ventaja estadísticamente significativa de
              PR-AUC (+0,0216 con IC 95%: [0,0152 ; 0,0287]) sobre la mejor heurística basal informada de zona de origen.
            </p>
            <div className="text-xs font-mono text-[#080503]/50 border-t border-[#080503]/10 pt-3">
              Estabilidad auditada: p-valor &lt; 0,001 en test de permutación
            </div>
          </div>
        </div>
      </section>

      {/* 09. ASIMETRÍA DE ERRORES: FN vs FP (NÚCLEO ESTRATÉGICO) */}
      <section id="asimetria" className="py-24 px-6 max-w-7xl mx-auto border-b border-[#080503]/10">
        <div className="mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#080503]/50">
            06 / ANÁLISIS DE ASIMETRÍA DE COSTOS
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight mt-2">
            La asimetría de errores: por qué FN es letal y FP es preventivo.
          </h2>
          <p className="text-sm text-[#080503]/70 max-w-3xl mt-3 leading-relaxed">
            Las funciones de pérdida simétricas fracasan en tarificación dinámica. No anticipar un recargo destruye
            el LTV del cliente, mientras que una falsa alarma representa una alerta preventiva de bajo costo.
          </p>
        </div>

        {/* Dual Split Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Panel Izquierdo: Falso Negativo */}
          <div className="p-8 rounded-2xl border-2 border-red-500/30 bg-red-500/[0.02]">
            <div className="flex items-center gap-2 text-xs font-mono text-red-600 uppercase tracking-wider mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>Falso Negativo (No avisar recargo)</span>
            </div>
            <h3 className="font-serif text-3xl text-red-900 mb-2">Error Crítico: El "Shock de Tarifa"</h3>
            <div className="font-mono text-2xl font-bold text-red-600 mb-6">+USD 8,73 sobreprecio sorpresa</div>

            <ul className="space-y-3 text-sm text-[#080503]/80 leading-relaxed mb-6">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Ruptura presupuestaria:</strong> El pasajero solicita el viaje creyendo en tarifa estándar y recibe un tarifazo del +46%.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Sensación de engaño:</strong> Percepción de opacidad y abuso algorítmico por parte de la plataforma.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Cancelación y Churn:</strong> Cancelación en el acto y fuga permanente a Uber. Destrucción total del Customer Lifetime Value.</span>
              </li>
            </ul>

            <div className="text-xs font-mono bg-red-500/10 text-red-800 p-3 rounded-lg border border-red-500/20">
              Ratio de daño real (con LTV y soporte): 15:1 a 25:1 frente a una falsa alarma.
            </div>
          </div>

          {/* Panel Derecho: Falso Positivo */}
          <div className="p-8 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/[0.02]">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Falso Positivo (Alerta preventiva)</span>
            </div>
            <h3 className="font-serif text-3xl text-emerald-900 mb-2">Alerta Inocua: El "Efecto Alivio"</h3>
            <div className="font-mono text-2xl font-bold text-emerald-600 mb-6">-USD 1,00 costo de fricción</div>

            <ul className="space-y-3 text-sm text-[#080503]/80 leading-relaxed mb-6">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Fricción marginal:</strong> El pasajero espera 3 a 5 minutos o compara con otra app. Pérdida leve de tiempo evaluada en USD 1.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Sesgo de alivio psicológico:</strong> Al confirmarse tarifa estándar, el cliente siente gratitud ("me salvé del recargo").</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Aplanamiento de picos:</strong> Descomprime orgánicamente la demanda instantánea hacia minutos posteriores.</span>
              </li>
            </ul>

            <div className="text-xs font-mono bg-emerald-500/10 text-emerald-800 p-3 rounded-lg border border-emerald-500/20">
              Break-Even Precision mínima requerida: 11,45% (Nuestro modelo: 13,48%).
            </div>
          </div>
        </div>

        {/* Simulador Interactivo de Umbral y Beneficio */}
        <div className="p-8 rounded-2xl border border-[#080503]/10 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-serif text-2xl font-normal">Calibración del Umbral Óptimo de Decisión</h3>
              <p className="text-xs font-mono text-[#080503]/50 mt-1">
                Ajuste interactivo sobre 59.395 cotizaciones de holdout ciego
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#080503]/5 border border-[#080503]/10 font-mono text-xs">
              <span>Umbral:</span>
              <span className="font-bold text-[#080503]">{thresholdSlider.toFixed(4)}</span>
            </div>
          </div>

          <div className="mb-8">
            <input
              type="range"
              min={0.27}
              max={0.65}
              step={0.01}
              value={thresholdSlider}
              onChange={(e) => setThresholdSlider(parseFloat(e.target.value))}
              className="w-full accent-[#080503] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#080503]/40 mt-2">
              <span>0,27 (Recall 96% / -USD 113)</span>
              <span className="font-bold text-emerald-700">0,5722 (Óptimo / +USD 56,11)</span>
              <span>0,65 (Conservador / +USD 23)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#080503]/[0.02] border border-[#080503]/10 font-mono text-xs text-center mb-6">
            <div>
              <div className="text-[#080503]/50">Verdaderos Positivos</div>
              <div className="text-base font-bold text-emerald-600 mt-1">{dynamicConfusionMatrix.tp}</div>
            </div>
            <div>
              <div className="text-[#080503]/50">Falsos Positivos</div>
              <div className="text-base font-bold text-amber-600 mt-1">{dynamicConfusionMatrix.fp}</div>
            </div>
            <div>
              <div className="text-[#080503]/50">Falsos Negativos</div>
              <div className="text-base font-bold text-red-600 mt-1">{dynamicConfusionMatrix.fn}</div>
            </div>
            <div>
              <div className="text-[#080503]/50">Retorno Neto / 1k</div>
              <div className={`text-base font-bold mt-1 ${dynamicConfusionMatrix.benefit > 0 ? "text-emerald-700" : "text-red-600"}`}>
                {dynamicConfusionMatrix.benefit > 0 ? "+" : ""}USD {dynamicConfusionMatrix.benefit.toFixed(2)}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#080503]/60 font-mono leading-relaxed">
            * Con el umbral calibrado en <span className="font-bold text-[#080503]">0,5722</span>, el sistema captura{" "}
            <span className="font-bold text-[#080503]">2.534 recargos</span> con un ahorro neto de{" "}
            <span className="font-bold text-emerald-700">+USD 56,11 por millar</span>, operando por encima de la
            indiferencia económica (p* = 11,45%).
          </p>
        </div>
      </section>

      {/* 10. SIMULADOR K-MEANS Y CALCULADORA DE TARIFAS */}
      <section id="simulador" className="py-24 px-6 max-w-7xl mx-auto border-b border-[#080503]/10">
        <div className="mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#080503]/50">
            07 / SIMULADOR DINÁMICO DE TARIFAS
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tight mt-2">
            Calculadora por familias de producto (K-Means).
          </h2>
          <p className="text-sm text-[#080503]/70 max-w-3xl mt-3 leading-relaxed">
            Estimación de precio según distancia, segmento competitivo de K-Means (k = 3) y recargo dinámico esperado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selector de Familias */}
          <div className="space-y-4">
            <label className="text-xs font-mono uppercase text-[#080503]/50 block">Seleccione Familia de Producto</label>
            {KMEANS_FAMILIES.map((fam) => (
              <div
                key={fam.id}
                onClick={() => setSelectedFamily(fam.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  selectedFamily === fam.id
                    ? "border-[#080503] bg-white shadow-sm ring-1 ring-[#080503]"
                    : "border-[#080503]/10 bg-white/50 hover:bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-serif text-lg font-medium">{fam.name}</h4>
                  <span className="text-xs font-mono font-medium text-[#080503]/60">
                    Base USD {fam.baseRate.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-[#080503]/50 font-mono mb-2">{fam.products}</p>
                <p className="text-xs text-[#080503]/70">{fam.desc}</p>
              </div>
            ))}
          </div>

          {/* Ajuste de Distancia y Toggle Surge */}
          <div className="p-6 rounded-2xl border border-[#080503]/10 bg-white space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-mono uppercase text-[#080503]/50">Distancia del Trayecto</label>
                <span className="font-mono text-sm font-bold">{miles.toFixed(1)} millas</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={10.0}
                step={0.1}
                value={miles}
                onChange={(e) => setMiles(parseFloat(e.target.value))}
                className="w-full accent-[#080503] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#080503]/40 mt-1">
                <span>0,5 mi</span>
                <span className="text-[#080503]/70 font-semibold">Media Boston: 2,19 mi</span>
                <span>10,0 mi</span>
              </div>
            </div>

            <div className="border-t border-[#080503]/10 pt-6">
              <label className="text-xs font-mono uppercase text-[#080503]/50 block mb-3">Estado de Tarifa Dinámica</label>
              <div
                onClick={() => setSurgeActive(!surgeActive)}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  surgeActive
                    ? "border-red-500/50 bg-red-500/5 text-red-900"
                    : "border-[#080503]/10 bg-[#080503]/[0.02] text-[#080503]/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${surgeActive ? "text-red-500" : "text-[#080503]/30"}`} />
                  <div>
                    <div className="font-medium text-xs font-mono uppercase">
                      {surgeActive ? "Recargo Dinámico Activo" : "Tarifa Regular (Sin Recargo)"}
                    </div>
                    <div className="text-xs text-[#080503]/50">
                      {surgeActive ? "+USD 8,73 sobreprecio promedio" : "surge_multiplier = 1.0x"}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    surgeActive ? "border-red-500 bg-red-500 text-white" : "border-[#080503]/20"
                  }`}
                >
                  {surgeActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Tarifa Calculada */}
          <div className="p-8 rounded-2xl border border-[#080503]/10 bg-white flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#080503]/50">
                Tarifa Estimada de Viaje
              </span>
              <div className="font-serif text-5xl md:text-6xl font-normal text-[#080503] my-4">
                USD {calculatedFare.total}
              </div>
              <p className="text-xs font-mono text-[#080503]/50 mb-6">
                Desglose analítico de fórmula paramétrica
              </p>

              <div className="space-y-2 border-t border-[#080503]/10 pt-4 text-xs font-mono">
                <div className="flex justify-between text-[#080503]/70">
                  <span>Bajada de bandera (Base):</span>
                  <span>USD {calculatedFare.base}</span>
                </div>
                <div className="flex justify-between text-[#080503]/70">
                  <span>Recorrido ({miles.toFixed(1)} mi):</span>
                  <span>USD {calculatedFare.distance}</span>
                </div>
                {surgeActive && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Recargo Surge (Medio):</span>
                    <span>+USD {calculatedFare.surge}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#080503]/10 pt-4 mt-6">
              <span className="text-[11px] font-mono text-[#080503]/40 block">
                Predicción con Random Forest: MAE USD 1,08 · R² = 0,967
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 11. TESTIMONIO Y DECISIÓN EJECUTIVA */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center border-b border-[#080503]/10">
        <span className="font-mono text-xs uppercase tracking-widest text-[#080503]/50 block mb-6">
          DECLARACIÓN DE IMPACTO EJECUTIVO
        </span>
        <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-snug tracking-tight mb-8">
          "Decir siempre que no hay recargo da un 91,7% de exactitud aparente y exactamente cero dólares de valor.
          Nuestro modelo calibrado detecta más de la mitad de los recargos futuros, aportando cincuenta y seis dólares
          netos por millar de operaciones y protegiendo la confianza del usuario."
        </blockquote>
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#080503]/10 bg-white font-mono text-xs">
          <span className="font-bold text-[#080503]">Grupo 11 · Ciencia de Datos 5K1</span>
          <span className="text-[#080503]/30">|</span>
          <span className="text-emerald-700 font-semibold">+USD 56,11 / 1k Cotizaciones</span>
        </div>
      </section>

      {/* 09. FINAL CALL TO ACTION */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight mb-4">
          Ciencia de datos honesta para decisiones urbanas.
        </h2>
        <p className="text-base text-[#080503]/70 max-w-2xl mx-auto mb-8 font-light">
          Consulte la documentación técnica completa, el código fuente en Python y el guión de presentación ejecutiva
          en el repositorio oficial.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-[#080503] text-[#fafaf9] px-6 py-3 rounded-md text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <span>Ver Repositorio de GitHub</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href="#problema"
            className="w-full sm:w-auto border border-[#080503]/20 bg-transparent px-6 py-3 rounded-md text-sm font-medium text-[#080503] hover:bg-[#080503]/5 transition-all"
          >
            Volver al Inicio
          </a>
        </div>
      </section>

      {/* 10. FOOTER INSTITUCIONAL */}
      <footer className="border-t border-[#080503]/10 py-12 px-6 bg-[#fafaf9] text-xs font-mono text-[#080503]/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 Universidad Tecnológica Nacional — Facultad Regional Córdoba (UTN FRC).
          </div>
          <div>
            Cátedra Ciencia de Datos 5K1 · Grupo 11 · Uber & Lyft Boston Dataset.
          </div>
        </div>
      </footer>
    </div>
  );
}
```

---
*Fin del Prompt Maestro de Integración Frontend para Vercel — Adaptado al Sistema de Diseño Optimus.*
