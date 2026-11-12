# Contexto completo del proyecto · Entregas 1, 2 y 3 (insumo para la Entrega 4)

**Trabajo Práctico Integrador · Ciencia de Datos · UTN FRC · Curso 5K1 · Grupo 11**
**Proyecto:** *Análisis de los determinantes del precio en servicios de movilidad bajo demanda: el caso de Uber y Lyft en Boston, Massachusetts*

> **Para qué sirve este documento.** Reúne en un solo lugar todo lo hecho en las tres primeras entregas (negocio, datos, decisiones, modelos y resultados) para construir la Entrega 4 (presentación final de *data storytelling*). Todas las cifras de la Entrega 3 salen de `Contenido Entrega 3/6_Resultados/metricas.json` y del informe `Contenido Entrega 3/1_Informe/Entrega3_Grupo11.docx`; las de las Entregas 1 y 2, de sus informes PDF. Si dos documentos del repositorio no coinciden, acá se usa el valor del informe oficial y del `metricas.json` (ver la sección 11, "Inconsistencias detectadas").

---

## Índice

1. [Ficha del proyecto](#1-ficha-del-proyecto)
2. [La consigna de la cátedra y los criterios de evaluación](#2-la-consigna-de-la-cátedra-y-los-criterios-de-evaluación)
3. [El problema de negocio](#3-el-problema-de-negocio)
4. [El dataset](#4-el-dataset)
5. [Entrega 1 · Planificación y obtención de datos](#5-entrega-1--planificación-y-obtención-de-datos)
6. [Entrega 2 · Limpieza y preparación de datos (ETL)](#6-entrega-2--limpieza-y-preparación-de-datos-etl)
7. [Entrega 3 · Modelado y análisis de resultados](#7-entrega-3--modelado-y-análisis-de-resultados)
8. [Conocimiento obtenido: la historia completa en clave de negocio](#8-conocimiento-obtenido-la-historia-completa-en-clave-de-negocio)
9. [Entrega 4 · Qué se pide y cómo armarla con lo que ya tenemos](#9-entrega-4--qué-se-pide-y-cómo-armarla-con-lo-que-ya-tenemos)
10. [Glosario de conceptos y métricas](#10-glosario-de-conceptos-y-métricas)
11. [Inconsistencias detectadas en documentos anteriores](#11-inconsistencias-detectadas-en-documentos-anteriores)
12. [Mapa del repositorio y reproducibilidad](#12-mapa-del-repositorio-y-reproducibilidad)
13. [Referencias](#13-referencias)

---

## 1. Ficha del proyecto

| Campo | Detalle |
|---|---|
| Universidad | Universidad Tecnológica Nacional, Facultad Regional Córdoba (UTN FRC) |
| Carrera | Ingeniería en Sistemas de Información |
| Cátedra / Curso | Ciencia de Datos · 5K1 · ciclo 2026 |
| Docente | Ing. Marisa del Carmen Callejas |
| Grupo | 11 |
| Integrantes | Álvaro Pérez (97986) · Juan Ignacio Cremona (95789) · Ignacio Gil (407114) · Federico Gon (94470) · Sofía Medina (88655) · Facundo Dagnino Dailly (94307) |
| Formato de entrega | Informe tipo *paper* científico (plantilla de la cátedra) + defensa oral en cada entrega |
| Metodología | Ciclo de vida CRISP-DM, gestionado con Scrum (un sprint por entrega) |
| Repositorio | `github.com/Perez-Alvaro/uber-lyft-dataset` |

### Cronograma

| Sprint | Entrega | Objetivo | Fecha | Estado |
|---|---|---|---|---|
| 1 | Entrega 1 | Planificación y obtención de datos | 11/09/2026 | ✅ Entregada |
| 2 | Entrega 2 | Limpieza y preparación de datos (ETL) | 02/10/2026 | ✅ Entregada |
| 3 | Entrega 3 | Modelado y análisis de resultados | 30/10/2026 | ✅ Entregada |
| 4 | Entrega 4 | Presentación final (*data storytelling*) | 06/11, 11/11, 13/11 o 18/11/2026 | ⏳ En preparación |

### Correspondencia con CRISP-DM

| Etapa CRISP-DM | Dónde se hizo |
|---|---|
| 1. Comprensión del negocio | Entrega 1 (problema, objetivos, hipótesis) y Entrega 2 (nuevo objetivo `has_surge`) |
| 2. Comprensión de los datos | Entrega 1 (diagnóstico inicial) y Entrega 2 (EDA y calidad) |
| 3. Preparación de los datos | Entrega 2 (ETL, integración, ingeniería de variables, codificación) |
| 4. Modelado | Entrega 3 |
| 5. Evaluación | Entrega 3 (validación temporal, líneas base, matriz de beneficio, intervalos de confianza) |
| 6. Despliegue / comunicación | Entrega 4 (*storytelling*) |

---

## 2. La consigna de la cátedra y los criterios de evaluación

**Objetivo general de la cátedra:** aplicar el ciclo de vida completo de un proyecto de Ciencia de Datos, desde la planificación y la adquisición de datos hasta el modelado, el análisis y la comunicación de resultados, para extraer información valiosa, oculta y significativa, y proponer soluciones a problemas reales identificando patrones y tendencias.

| Entrega | Qué pedía la consigna |
|---|---|
| **1 · Planificación y obtención de datos** | Plan de proyecto con Scrum. Buscar un dataset (mínimo 20.000 filas), posiblemente unificando fuentes. Indicar origen, contexto e *insights* posibles. Justificar la selección y los objetivos iniciales. |
| **2 · ETL** | EDA visual y estadístico. Análisis de calidad: detección y tratamiento de datos erróneos, nulos o inconsistentes. Estrategia para cada caso (eliminación, imputación, etc.). Integración de fuentes externas, selección y filtrado de variables. Justificar cada decisión. Preparar el dataset objetivo. |
| **3 · Modelado** | Al menos 2 algoritmos (clasificación, clustering, etc.). Definir y justificar los parámetros. Evaluar con métricas apropiadas (precisión y eficacia). Identificar patrones o tendencias. Interpretar el conocimiento obtenido en relación con el problema original. |
| **4 · Presentación final (*data storytelling*)** | Presentación que incluya: **problema y objetivo**; **dataset y metodología**; **principales hallazgos y resultados**; **decisiones técnicas clave**; **conclusiones y recomendaciones**. |

**Condiciones:** formato *paper* científico; presentaciones orales obligatorias en cada entrega; la entrega final debe reflejar el trabajo colectivo y los aportes individuales.

**Criterios de evaluación:** expresión oral · claridad conceptual y dominio técnico · coherencia entre problema, datos y modelo · conocimiento del dominio, métodos y herramientas · justificación de decisiones en cada etapa · trabajo en equipo y organización · participación en cada entrega · claridad y creatividad en la comunicación · cumplimiento de plazos.

---

## 3. El problema de negocio

### 3.1 Contexto

Las plataformas de movilidad bajo demanda (*ride-hailing*), como Uber y Lyft, cambiaron el transporte urbano. A diferencia del taxi, cuya tarifa está regulada y es previsible, estas empresas calculan el precio de cada viaje con algoritmos que combinan:

- la **distancia** y la duración estimadas,
- la **categoría de servicio** elegida (compartido, estándar, XL, premium, black…),
- un **factor de ajuste por demanda instantánea**: la tarifa dinámica (*surge pricing* en Uber, *prime time* en Lyft), que multiplica el precio por 1,25; 1,5; 2 o más cuando la demanda supera a la oferta.

Esa falta de transparencia genera un problema para los tres actores del ecosistema:

| Actor | Problema |
|---|---|
| **Pasajero** | No puede anticipar cuánto le va a costar el viaje ni saber cuándo conviene esperar, caminar a otra zona o cambiar de plataforma. |
| **Conductor** | No sabe en qué zonas y franjas horarias es más rentable operar. |
| **Plataforma** | Necesita calibrar su política tarifaria para maximizar ingresos sin deteriorar la demanda ni la percepción de equidad. |

### 3.2 Pregunta de investigación

> **¿Qué factores influyen en el precio de un viaje y qué tan bien podemos predecirlo usando datos pasados de los viajes y del clima?**

A partir de la devolución de la cátedra en la Entrega 1, la pregunta se partió en dos (Entrega 2):

| | **Objetivo 1** | **Objetivo 2** (agregado en la Entrega 2) |
|---|---|---|
| Variable | `price` (USD) | `has_surge` (0/1) |
| Pregunta | ¿Cuánto cuesta el viaje? | ¿Esta cotización tiene recargo por demanda? |
| Parte del precio que explica | **Estructural** (producto y distancia) | **Dinámica** (cuándo y dónde se paga de más) |
| Tipo de problema | Regresión supervisada | Clasificación binaria |
| Datos | Uber + Lyft · 636.568 cotizaciones | Lyft sin Shared · 255.953 cotizaciones |

### 3.3 Objetivo general y objetivos específicos (Entrega 1)

**General:** identificar y cuantificar los factores que influyen en el precio de los viajes de Uber y Lyft, extraer patrones significativos y analizar la posibilidad de predecir su comportamiento a partir de datos históricos de viajes y clima.

**Específicos:**
1. Explorar y caracterizar el comportamiento de los precios según distancia, tipo de servicio, empresa, ubicación y momento del día.
2. Identificar los principales factores asociados a las variaciones del precio.
3. Analizar patrones temporales y geográficos (horarios, días, recorridos entre zonas, períodos de mayor y menor demanda).
4. Comparar el comportamiento tarifario de Uber y Lyft en condiciones similares.
5. Identificar segmentos o perfiles de viajes con comportamiento tarifario similar (EDA y, si corresponde, agrupamiento).
6. Comunicar los hallazgos con visualizaciones y *data storytelling* para usuarios y operadores.

### 3.4 Hipótesis H1 a H6

Son los *insights* esperados de la Entrega 1 (sección 4.4), numerados en orden. Se contrastaron en las Entregas 2 y 3:

| # | Hipótesis | Estado final (Entrega 3) |
|---|---|---|
| **H1** | El producto y la distancia son los principales factores del precio | ✅ **Confirmada** |
| **H2** | Uber y Lyft difieren según el nivel de servicio | ✅ **Confirmada** |
| **H3** | Hay patrones horarios y por día en el precio y el recargo | ❌ **No se confirma** |
| **H4** | Hay corredores origen–destino con mayor costo por milla | ✅ **Confirmada** (por la tarifa base fija en viajes cortos) |
| **H5** | El mal clima encarece los viajes | ❌ **Rechazada** |
| **H6** | Los viajes forman segmentos tarifarios homogéneos | ✅ **Confirmada** (3 familias de tarifa, K-Means) |

### 3.5 Por qué el segundo objetivo (`has_surge`) genera valor

- **Impacto económico concreto:** con recargo, el multiplicador promedio es ×1,46: el mismo viaje cuesta en promedio **un 46% más**. Según el producto, el precio mediano sube entre 36% y 67%.
- **Es frecuente:** el 8,19% de las cotizaciones de Lyft (sin Shared) tiene recargo, alrededor de **1 de cada 12**.
- **Tiene patrones aprendibles:** la tasa de recargo varía **7,3 veces** según la zona de origen (de 1,8% en North End a 13,4% en Back Bay).
- **Sirve a cada actor:** al pasajero (esperar, caminar, cambiar de app; Uber no informa su recargo), al conductor (dónde ubicarse) y a la plataforma (dónde falta oferta).
- **Completa la historia del precio:** el objetivo 1 explica la parte estructural y el objetivo 2 la dinámica.
- Ya en la Entrega 2 se anticipó que **un resultado modesto también sería un hallazgo**: significaría que el recargo depende de la oferta y la demanda en tiempo real, que no están en el dataset. Eso es exactamente lo que se encontró.

---

## 4. El dataset

### 4.1 Identificación

| Atributo | Detalle |
|---|---|
| Nombre | *Uber and Lyft Dataset Boston, MA* |
| Fuente | Kaggle, usuario *brllrb*: https://www.kaggle.com/datasets/brllrb/uber-and-lyft-dataset-boston-ma |
| Archivo | `rideshare_kaggle.csv` (viajes y clima **ya unidos** en un solo archivo) |
| Recolección | Consultas periódicas a las API públicas de estimación de tarifas de Uber y Lyft, más registros meteorológicos horarios (DarkSky) |
| Cobertura geográfica | Boston, Massachusetts (EE. UU.), **12 zonas** de origen y destino |
| Cobertura temporal | 26/11/2018 al 18/12/2018 (en hora local hay datos en **18 de 24 fechas**, y solo 14 completas) |
| Volumen crudo | **693.071 filas × 57 columnas** (~350 MB en disco, ~725 MB en RAM) |
| Granularidad | Una fila = una **cotización** (consulta de tarifa) de un producto, para una ruta, en un instante |
| Licencia / ética | Datos públicos, sin información personal de pasajeros ni conductores |

**Importante para la narrativa:** el dataset registra **cotizaciones** (lo que la app ofrecía cobrar), no viajes realizados.

### 4.2 Las 12 zonas

Back Bay · Beacon Hill · Boston University · Fenway · Financial District · Haymarket Square · North End · North Station · Northeastern University · South Station · Theatre District · West End.

### 4.3 Los 12 productos y sus niveles equivalentes (`service_tier`)

| Nivel (`service_tier_ord`) | Uber | Lyft | Precio medio del nivel |
|---|---|---|---:|
| 0 · Compartido | UberPool | Shared | USD 7,44 |
| 1 · Estándar | UberX, WAV | Lyft | USD 9,72 |
| 2 · XL | UberXL | Lyft XL | USD 15,51 |
| 3 · Premium | — | Lux (exclusivo de Lyft) | USD 17,77 |
| 4 · Black | Black | Lux Black | USD 21,76 |
| 5 · Black XL | Black SUV | Lux Black XL | USD 31,27 |

El producto **Taxi** de Uber también aparecía en el crudo, pero se eliminó (no tiene precio; ver D01).

### 4.4 Las 57 columnas originales, por bloque

| Bloque | Variables |
|---|---|
| Identificación y tiempo | `id`, `timestamp`, `datetime`, `hour`, `day`, `month`, `timezone` |
| Viaje y servicio | `source`, `destination`, `distance`, `cab_type`, `product_id`, `name`, `price`, `surge_multiplier` |
| Ubicación | `latitude`, `longitude` |
| Clima (~40 columnas) | `temperature`, `apparentTemperature`, `humidity`, `windSpeed`, `windGust`, `visibility`, `visibility.1`, `precipIntensity`, `precipProbability`, `cloudCover`, `pressure`, `uvIndex`, `dewPoint`, `ozone`, `moonPhase`, `windBearing`, `short_summary`, `long_summary`, `icon` y agregados diarios con sus marcas de tiempo (`temperatureHigh`, `temperatureHighTime`, `sunriseTime`, `sunsetTime`, etc.) |

### 4.5 Por qué se eligió (justificación de la Entrega 1)

1. **Volumen holgado:** 693.071 filas contra el mínimo de 20.000 exigido; permite particiones robustas y validación cruzada.
2. **Riqueza de variables:** numéricas, categóricas, temporales, geográficas y meteorológicas.
3. **Dominio comprensible:** el precio de una app de viajes es cercano para cualquier audiencia, ideal para el *storytelling*.
4. **Acceso público y sin conflictos éticos.**

---

## 5. Entrega 1 · Planificación y obtención de datos

**Entregable:** `Contenido Entrega 1/Entrega1_Grupo11.pdf` (11/09/2026).

### 5.1 Qué se hizo

- Se definió el problema, la pregunta de investigación, el objetivo general y seis objetivos específicos (sección 3).
- Se seleccionó y documentó el dataset (sección 4).
- Se plantearon los *insights* esperados, que luego se numeraron como hipótesis H1–H6:
  - peso relativo de distancia, categoría y otras características en el precio;
  - comparación sistemática Uber vs Lyft en recorridos equivalentes;
  - patrones temporales de demanda y recargo por hora y día;
  - corredores origen–destino con mayor costo por kilómetro;
  - evaluación empírica de que el mal clima encarece el precio;
  - segmentación de viajes en grupos tarifarios homogéneos.
- En ese momento la variable objetivo era solo `price` (regresión), con `surge_multiplier` mencionado como posible complemento para clasificación.

### 5.2 Plan de proyecto con Scrum

| Rol | Responsabilidad |
|---|---|
| Product Owner | Representa los objetivos analíticos y las expectativas de la cátedra; prioriza el backlog y valida los incrementos. |
| Scrum Master | Facilita las ceremonias, remueve impedimentos y cuida los plazos. |
| Equipo de desarrollo | Adquisición, preparación, modelado, documentación y presentación. |

- **Sprints** de la duración del intervalo entre entregas; cada entrega es el incremento del sprint.
- **Ceremonias:** Sprint Planning, Daily Standup, Sprint Review y Sprint Retrospective.

**Backlog del Sprint 1 (todo finalizado):** definición del problema, pregunta y objetivos (Product Owner) · búsqueda y comparación de datasets candidatos · verificación de volumen, licencia y pertinencia · documentación de estructura, variables y justificación (Juan Ignacio Cremona) · redacción del informe y preparación de la defensa oral.

### 5.3 Trabajo técnico preliminar (scripts en `Contenido Entrega 1/`)

| Script | Qué hace |
|---|---|
| `eda_initial.py` | Clase `DatasetProfilerETL`: auditoría de completitud y duplicados, esquema y redundancias (hash MD5 de columnas), análisis de mercado y tarifas, análisis espacio-temporal y generación de un plan de acción para el ETL. |
| `limpiar_dataset.py` | Primera limpieza: elimina las filas de Taxi y las columnas idénticas (detectadas por hash). |
| `feature_engineering.py` | Primeras variables temporales (hora, día, fin de semana, hora pico) y un **intento de inferir el surge de Uber** con el ratio precio/milla contra la mediana de la ruta (≥ 1,20 → surge). Exporta a Parquet. |
| `informe_limpieza_y_variables.md` | Informe diagnóstico pre-ETL y propuesta de las dos variables objetivo. |

**Decisión que nació acá:** la inferencia del recargo de Uber por precio por milla, validada sobre Lyft, acertaba solo el **61%**. Se descartó: el objetivo `has_surge` se limita a Lyft.

---

## 6. Entrega 2 · Limpieza y preparación de datos (ETL)

**Entregables:** `Contenido Entrega 2/Entrega2_Grupo11.pdf` (02/10/2026), notebook `TPI_Ciencia_de_Datos_Sprint2_ETL.ipynb`, dataset limpio `dataset_nueva_columna.zip`, dataset codificado `dataset_codificado.zip` y 18 gráficos en `graficos/`.

### 6.1 Cambio de alcance: nace `has_surge`

`has_surge = 1` si `surge_multiplier > 1`, y 0 si vale 1. Cada decisión de diseño se verificó con los datos:

| Decisión | Evidencia |
|---|---|
| Solo Lyft | En Uber, `surge_multiplier` vale 1 en los **385.663** registros (Uber oculta su multiplicador en su *upfront pricing*): no informa nada. |
| No hacer regresión sobre el multiplicador | El 97,0% de los registros vale 1,0: el modelo tendería a predecir siempre 1,0. |
| No hacer multiclase | Las clases altas casi no tienen casos: ×2,5 → 154 y ×3 → 12. |
| Binaria | La clase positiva junta todos los niveles de recargo: **20.975 casos (8,19%)**. Distribución de los positivos: ×1,25: 11.085 · ×1,5: 5.065 · ×1,75: 2.420 · ×2: 2.239 · ×2,5: 154 · ×3: 12. |
| Excluir Lyft Shared | Nunca tiene recargo (0 de 51.233). Incluirlo agregaría ceros garantizados (6,82% de positivos en vez de 8,19%). |
| Alternativa a futuro | Tres clases: sin recargo (1,0), leve (1,25–1,5) y alto (≥ 1,75). |

**Riesgos previstos y cómo se controlaron:**
- **Fuga de datos:** `price` y `surge_multiplier` contienen la respuesta (el precio ya incluye el recargo) → se excluyen del dataset de `has_surge`.
- **`surge_multiplier` para predecir `price`:** se conserva, porque la app lo muestra al cotizar (no es información del futuro); en la Entrega 3 se entrena con y sin él.
- **Filas no independientes:** en el **95,7%** de los grupos (ruta, minuto) todos los productos comparten el valor de `has_surge` (el recargo es de la zona y el momento, no del producto) → la validación se agrupa **por fecha**.

### 6.2 Tres problemas ocultos descubiertos en el dataset

| Hallazgo | Evidencia | Consecuencia |
|---|---|---|
| **La hora está en UTC**, no en hora de Boston (UTC−5) | `hour` coincide con la hora UTC en el 100% de las filas y con la local en el 0%, aunque `timezone` dice America/New_York. | Se recalculó la hora local. Sin esto, todos los patrones horarios quedaban corridos 5 horas. |
| **El clima se unió por hora, no por zona** | Un solo registro de clima por hora (332 horas). Cada hora recibe el clima de una sola zona, que coincide con el origen del viaje solo en el 8,4% (igual que el azar). | `latitude`/`longitude` no describen el viaje y se descartan. El clima se usa como contexto de la ciudad por hora. |
| **Faltan fechas** | De 24 fechas (hora local) hay datos en 18 y solo 14 completas. Faltan el 05/12, 06/12, 07/12, 08/12, 10/12 y 11/12. | Las conclusiones por día de la semana se toman con cautela. Corrige los "23 días de cobertura" de la Entrega 1. |

### 6.3 Análisis exploratorio (EDA)

#### Objetivo 1: `price`

| Variable | n | Media | Mediana | Desvío | Mín. | Máx. | Asimetría |
|---|---:|---:|---:|---:|---:|---:|---:|
| Precio total (USD) | 637.976 | 16,55 | 13,50 | 9,32 | 2,50 | 97,50 | 1,05 |
| Precio Uber | 330.568 | 15,80 | 12,50 | 8,56 | 4,50 | 89,50 | 1,05 |
| Precio Lyft | 307.408 | 17,35 | 16,50 | 10,02 | 2,50 | 97,50 | 0,98 |
| Distancia (millas) | 637.976 | 2,19 | 2,16 | 1,14 | 0,02 | 7,86 | 0,82 |

*(registros con precio, antes de la limpieza)*

- **Distribución:** asimetría a la derecha (1,05): muchos viajes baratos y pocos muy caros. Con logaritmo baja a −0,10 → **decisión: modelar `log(price)`**.
- **Peso de cada factor (H1)**, porcentaje de la variación del precio que explica cada variable por sí sola (η² o R²): **producto 77,4%** · nivel de servicio 76,6% · **distancia 11,9%** · multiplicador de recargo 5,8% · zona de origen 2,5% · zona de destino 2,3% · plataforma 0,7% · hora, clima, día, lluvia y temperatura ≈ 0%. Producto y distancia juntos explican ~**91,8%**.
- **Uber vs Lyft (H2)**, a igual distancia y sin recargo: Lyft es más barato en los económicos (Compartido −17,6%, Estándar −5,3%, XL −10,0%) y más caro en los Black (Black +15,4%, Black XL +5,3%). La relación precio–distancia crece **por escalones**, no en línea recta → conviene probar árboles.
- **Precio mediano por producto:** Shared 7,0 · UberPool 8,5 · Lyft 9,0 · UberX 9,5 · WAV 9,5 · Lyft XL 13,5 · UberXL 15,0 · Lux 16,5 · Black 19,5 · Lux Black 22,5 · Black SUV 28,5 · Lux Black XL 30,0 USD.
- **Corredores (H4):** el precio por milla más alto es Financial District → South Station (USD 17,95/milla) en una ruta muy corta (~0,4 millas): en viajes cortos pesa la tarifa base.
- **Clima (H5):** sin relación lineal con el precio (|r| máximo = 0,0015).
- **Efecto del recargo:** precio mediano sin y con recargo por producto de Lyft: Lyft +50%, Lyft XL +67%, Lux +36%, Lux Black +44%, Lux Black XL +42%.

#### Objetivo 2: `has_surge`

- **Zona de origen: el factor más claro.** Tasa de recargo por origen: Back Bay 13,4% · Northeastern University 12,5% · Fenway 12,3% · Boston University 11,6% · Theatre District 11,6% · Beacon Hill 9,7% · South Station 8,0% · Financial District 6,9% · West End 4,6% · North Station 4,0% · Haymarket Square 1,9% · North End 1,8%.
- **Hora (H3):** variación moderada, entre 7,0% (11 h) y 9,6% (8 h). En hora pico 8,5% contra 8,1% fuera de ella. Por día de la semana, diferencias mínimas.
- **Producto:** los cinco productos de Lyft con recargo tienen **la misma tasa (8,19%)** y Shared tiene 0%: el recargo es de la zona y el momento.
- **Clima:** sin efecto visible (con lluvia 7,85% contra 8,28% sin lluvia).

### 6.4 Calidad de los datos en cinco dimensiones

| Dimensión | Resultado medido | Acción |
|---|---|---|
| Completitud | 55.095 nulos (7,95%), **solo en `price`**; el 100% es Taxi y 0 en el resto | Eliminar Taxi |
| Validez | 9 de 10 reglas sin violaciones; 406 distancias < 0,1 mi entre zonas distintas. Atípicos de precio (IQR por producto): 21.665, el 85,4% explicado por recargo o distancia | Eliminar distancias imposibles; conservar atípicos reales |
| Consistencia | 1 registro de clima por hora; lat/long no son del viaje; `hour` en UTC | Hora local; descartar lat/long; clima como contexto horario |
| Unicidad | 1.677 copias de una misma cotización (1.046 exactas y 631 que difieren en fracciones de segundo); 13.378 filas con igual clave pero distinto precio/distancia | Eliminar copias; conservar cotizaciones distintas |
| Cobertura temporal | Por hora: pareja (coef. de variación 0,074). Por día: 18 de 24 fechas, 4 parciales | No imputar; documentar y validar agrupando por fecha |

**Criterio de outliers:** IQR de Tukey (k = 1,5) **dentro de cada producto**, porque un IQR global marcaría como atípicos a 5.589 viajes premium normales. Los 21.665 atípicos se **conservan**: son precios reales (el fenómeno a modelar).

**¿Por qué no se imputó el precio de Taxi?** Es un faltante **estructural, no aleatorio**: en Boston el taxi cobra por taxímetro y la app no da precio cerrado por adelantado. No hay ningún precio de Taxi para imputar con fundamento; imputar inventaría tarifas.

### 6.5 Tabla de decisiones (D01 a D16)

| # | Problema | Estrategia | Impacto |
|---|---|---|---|
| D01 | 55.095 nulos en `price`, todos de Taxi | Eliminar el producto Taxi completo | −55.095 filas |
| D02 | Registros idénticos salvo `id` (incluye diferencias de fracciones de segundo) | Eliminar copias, conservar la primera | −1.060 filas |
| D03 | 13.378 filas con igual ruta, producto y *timestamp* pero distinto precio/distancia | Conservar (son cotizaciones distintas) | Sin cambios |
| D04 | Distancias de 0,02–0,04 mi entre zonas distintas (solo Uber; en Lyft la mínima es 0,39 mi) | Eliminar `distance < 0,1` | −348 filas |
| D05 | 21.665 atípicos de precio | Conservar; tratar la asimetría con `log(price)` | Sin cambios |
| D06 | `hour/day/month/datetime` en UTC; `timezone` constante e incorrecto | Reemplazar por `datetime_local`, `hour_local`, `day_of_week` | −6 col. |
| D07 | `latitude/longitude` son del registro de clima, no del viaje | Descartar; usar coordenadas reales (OSM) | −2 col. |
| D08 | `visibility.1` = `visibility`; `product_id` ↔ `name` 1 a 1 | Descartar ambas | −2 col. |
| D09 | Viajes y clima unidos sin clave documentada | Separar y volver a unir por hora UTC con validación muchos-a-uno | Sin cambios |
| D10 | No hay ubicación real de las zonas | Incorporar coordenadas de OpenStreetMap y derivar `straight_line_miles` | +1 col. |
| D11 | 40 columnas de clima, con agregados diarios, marcas de tiempo y pares \|r\| > 0,85 | Conservar las variables horarias útiles y descartar 31 | −31 col. |
| D12 | Columnas auxiliares de tiempo duplicadas | Descartar `datetime_utc`, `hora_utc`, `date_local`, `dia_semana` | −4 col. |
| D13 | En Uber `surge_multiplier` vale siempre 1 | Restringir `has_surge` a Lyft | −329.414 filas (solo dataset de surge) |
| D14 | Lyft Shared nunca tiene recargo | Excluir Shared del dataset de `has_surge` | −51.201 filas (solo dataset de surge) |
| D15 | `price` y `surge_multiplier` contienen la respuesta de `has_surge` | Excluirlas; también `cab_type` (constante) y `service_tier` (= `name` en Lyft) | −4 col. |
| D16 | ¿`surge_multiplier` como predictora de `price`? | Conservarla en el dataset de precio y entrenar con y sin ella en la Entrega 3 | Sin cambios |

**Resultado neto:** 693.071 → **636.568 filas** (se conserva el 91,85%; −56.503 filas, casi todas por Taxi).

### 6.6 Integración de fuentes

**Viajes + clima.** Como el archivo llega unido, se separó en una tabla de viajes y otra de clima (332 filas, una por hora), se validó que la hora es clave única y se volvió a unir por hora con validación muchos-a-uno: el 100% de los viajes con clima y los valores originales reproducidos exactamente. No se puede unir por zona porque esa información se perdió en la unión de Kaggle; las zonas están a pocos kilómetros y el clima resultó irrelevante, así que la aproximación es razonable.

**Fuente externa: OpenStreetMap (Nominatim).** Coordenadas reales de las 12 zonas, con un script reproducible y control de que cada punto cae en Boston. Sirvió para: (1) detectar las 406 distancias imposibles entre zonas separadas por al menos 0,33 millas en línea recta; (2) confirmar qué representaban las coordenadas del dataset; (3) crear `straight_line_miles` (correlación 0,84 con la distancia del viaje; el recorrido real es en mediana **1,57 veces** la línea recta).

### 6.7 Selección e ingeniería de variables: de 57 a 27 columnas

**Clima descartado (31 columnas):**

| Motivo | Columnas |
|---|---|
| Redundantes (4) | `apparentTemperature` (r = 0,95 con temperatura), `dewPoint` (0,87), `windGust` (0,94 con viento), `precipProbability` (es un pronóstico) |
| Agregados diarios (9) | `temperatureHigh/Low/Min/Max`, `apparentTemperatureHigh/Low/Min/Max`, `precipIntensityMax` |
| Marcas de tiempo diarias (12) | `windGustTime`, `temperatureHighTime`, … , `uvIndexTime`, `sunriseTime`, `sunsetTime` (correlación ≥ 0,998 con el tiempo; amanecer y atardecer se usan antes para crear `is_dark`) |
| Texto e íconos (2) | `icon`, `long_summary` |
| Sin relación plausible (4) | `uvIndex`, `moonPhase`, `ozone`, `windBearing` |

Además se descartaron `timezone`, `visibility.1`, `product_id`, `latitude`, `longitude` y las columnas de tiempo en UTC. En la tabla de clima horaria hay 80 pares de variables con |r| > 0,85.

**Variables nuevas:**

| Variable | Definición |
|---|---|
| `datetime_local` | *Timestamp* en hora local de Boston (UTC−5) |
| `hour_local` | Hora local (0 a 23) |
| `day_of_week` | 0 = lunes … 6 = domingo |
| `is_weekend` | 1 si es sábado o domingo |
| `time_slot` | Franja: Madrugada (0–5 h), Mañana (6–11 h), Tarde (12–17 h), Noche (18–23 h) |
| `is_rush_hour` | 1 en días hábiles de 7 a 9 h y de 16 a 19 h |
| `is_dark` | 1 si el viaje es antes del amanecer o después del atardecer |
| `is_raining` | 1 si `precipIntensity > 0` |
| `service_tier` | Nivel equivalente entre plataformas (6 niveles) |
| `straight_line_miles` | Distancia en línea recta entre zonas (OpenStreetMap) |
| `has_surge` | Objetivo 2 |

**Las 27 columnas del dataset limpio:** `id`, `datetime_local`, `hour_local`, `day_of_week`, `is_weekend`, `time_slot`, `is_rush_hour`, `is_dark`, `cab_type`, `name`, `service_tier`, `source`, `destination`, `distance`, `straight_line_miles`, `temperature`, `humidity`, `windSpeed`, `visibility`, `precipIntensity`, `is_raining`, `cloudCover`, `pressure`, `short_summary`, `surge_multiplier`, `has_surge`, `price`.

### 6.8 Antes y después

| Métrica | Antes | Después |
|---|---:|---:|
| Registros | 693.071 | **636.568** |
| Columnas | 57 | **27** |
| Nulos en `price` | 55.095 (7,95%) | **0** |
| Memoria RAM | ~725 MB | < 130 MB (−80%) |
| Formato | CSV plano | CSV + ZIP (126 MB → 26 MB) y Parquet (31,1 MB contra 125,0 MB en CSV) |

### 6.9 Datasets resultantes

| Archivo | Filas | Columnas | Uso |
|---|---:|---:|---|
| `rideshare_kaggle.csv` (original) | 693.071 | 57 | Sin modificar |
| `dataset_nueva_columna` (limpio, con `has_surge`) | 636.568 | 27 | Dataset limpio general |
| `dataset_price` | 636.568 | 26 | `price` · Uber + Lyft · 23 predictoras |
| `dataset_surge_lyft` | 255.953 | 23 | `has_surge` · Lyft sin Shared · 20 predictoras · 8,19% positivos · sin `price` ni `surge_multiplier` |

### 6.10 Codificación de variables categóricas (dataset codificado)

Script `Dataset Codificado/codificar_bd.py`. Entrada: dataset limpio (636.568 × 27). Salida: **636.568 × 71**, todo numérico salvo `id` y `datetime_local`.

| Columna | Valores | Técnica | Resultado |
|---|---|---|---|
| `cab_type` | Uber, Lyft | Binaria | `is_uber` (1 = Uber) |
| `name` | 12 productos | One Hot Encoding | 12 columnas `name_*` |
| `service_tier` | 6 niveles | Ordinal | `service_tier_ord` (0 = Compartido … 5 = Black XL) |
| `time_slot` | 4 franjas | One Hot | 4 columnas `time_slot_*` |
| `source` | 12 zonas | One Hot | 12 columnas `source_*` |
| `destination` | 12 zonas | One Hot | 12 columnas `destination_*` |
| `short_summary` | 9 climas | One Hot | 9 columnas `short_summary_*` |

**Criterio:** sin orden → One Hot (para no inventar un orden falso, por ejemplo que "Lux > UberX"); con orden natural → Ordinal (el precio medio sube por nivel); dos valores → binaria. Antes de codificar se quitaron espacios de `short_summary` (venía `" Rain "`). Validaciones: misma cantidad de filas, sin nulos, exactamente un 1 por grupo One Hot, `is_uber` coincide con los productos de Uber.

**Recomendaciones que se dejaron para la Entrega 3:** no usar juntas las tres codificaciones del servicio (`name_*` ya determina `is_uber` y `service_tier_ord`); `drop_first` en modelos lineales; `StandardScaler` antes de PCA o modelos de distancia; `log(price)`; filtrar `is_uber == 0` y `name_Shared == 0` para `has_surge`; validar por fecha.

### 6.11 Defensa oral de la Entrega 2

Notebook Colab con 4 bloques (~5 minutos): diagnóstico inicial y la decisión de no imputar (Juan Ignacio Cremona) · criterios de selección y *dashboard* antes vs después (Ignacio Gil y Federico Gon) · dispersión de tarifas y formulación de los dos objetivos (Sofía Medina) · validación de los objetivos y reglas para el Sprint 3 (Facundo Dagnino Dailly).

### 6.12 Backlog del Sprint 2 (todo finalizado)

Redefinición del alcance con `has_surge` (Product Owner y equipo) · carga y comprensión de la estructura · EDA de `price` y `has_surge` · calidad en cinco dimensiones y tratamiento · integración de fuentes (clima y OpenStreetMap) · selección de variables y datasets · informe y defensa oral.

---

## 7. Entrega 3 · Modelado y análisis de resultados

**Entregables** (`Contenido Entrega 3/`): informe `1_Informe/Entrega3_Grupo11.docx` (30/10/2026), Colab ejecutado `2_Presentacion_Colab/Presentacion_Entrega3_Grupo11.ipynb` (+ PDF), código `3_Codigo/modelado_entrega3.py`, datasets de modelado y balanceados (`4_Datasets/`), 11 figuras (`5_Graficos/`), métricas y tablas (`6_Resultados/`).

### 7.1 Resumen de los tres análisis

| Objetivo | Tipo | Modelos probados | Ganador (elegido por validación) | Resultado en la prueba |
|---|---|---|---|---|
| **`price`** | Regresión | Ridge, árbol de decisión y random forest, cada uno con y sin `surge_multiplier` | **Random forest con surge** | MAE **USD 1,08** · R² **0,967** · el 75% de los viajes con error ≤ 10% (sin surge: USD 1,32 y R² 0,928) |
| **`has_surge`** | Clasificación binaria | Regresión logística, árbol de decisión, random forest y gradient boosting, cada uno con 4 técnicas de balanceo | **Gradient boosting con pesos de clase**, umbral 0,57 (matriz de beneficio) | Recall **51,4%** · precisión **13,5%** (azar 8,3%) · accuracy 68,6% · accuracy balanceada **60,8%** · ROC-AUC 0,676 · PR-AUC 0,140 · **USD 56 de beneficio cada 1.000 cotizaciones** |
| **Productos** | Clustering (no supervisado) | K-Means con k de 2 a 6 | **k = 3** (silueta 0,68) | 3 familias de tarifa: económico, intermedio y premium |

### 7.2 Punto de partida: decisiones heredadas de la Entrega 2

| Decisión | Cómo se aplicó |
|---|---|
| Modelar `log(price)` (D05) | Los modelos de precio se entrenan en log; las métricas se reportan en dólares. |
| Entrenar el precio con y sin `surge_multiplier` (D16) | Cada modelo se entrena dos veces, con su propia búsqueda; el multiplicador entra como `log_surge`. |
| Excluir `price` y `surge_multiplier` de `has_surge` (D15) | `has_surge` se predice solo con lugar, momento, producto, distancia y clima. |
| Validar agrupando por fecha | Prueba = 4 fechas posteriores; búsqueda con validación temporal en orden; comparación con CV mezclada. |
| No usar juntas las tres codificaciones del servicio | Se usan las 12 `name_*`; `is_uber` y `service_tier_ord` quedan fuera. |
| `drop_first` en modelos lineales | Cada grupo One Hot pierde una categoría de referencia (ver 7.4). Los árboles usan todas. |

**Variables nuevas sobre el dataset codificado:**

| Variable | Qué es | Por qué |
|---|---|---|
| `hour_sin`, `hour_cos` | sin(2π·hora/24) y cos(2π·hora/24) | La hora es cíclica: las 23 h están al lado de las 0 h. |
| `log_distance` | Logaritmo de la distancia | La tarifa no crece en línea recta con la distancia. |
| `log_surge` | Logaritmo del multiplicador | En escala log, log(precio × surge) = log(precio) + log(surge). |
| `ruta` | Par origen → destino | Para calcular la **tasa histórica de recargo de la ruta** con `TargetEncoder` dentro del pipeline (solo con filas de entrenamiento, con validación cruzada interna: no filtra la respuesta). |

**Datasets de modelado (`4_Datasets/`):**

| Dataset | Filas | Columnas | Contenido |
|---|---:|---:|---|
| `dataset_modelado_price` | 636.568 | 75 | Uber + Lyft · 67 predictoras + `log_surge` · objetivo `price` y `log_price` |
| `dataset_modelado_surge` | 255.953 | 65 | Lyft sin Shared · 60 predictoras (incluye la ruta) · sin `price` ni `surge_multiplier` |
| `surge_train_submuestreo` | 32.094 | 64 | Entrenamiento con submuestreo · 50% con recargo |
| `surge_train_smote` | 361.022 | 63 | Entrenamiento con SMOTE · 50% · columna `sintetica` marca las filas inventadas |
| `surge_test_sin_balancear` | 59.395 | 64 | Prueba con la proporción real (8,3%) |

### 7.3 Diseño experimental: validación temporal

**Por qué no separar al azar:** en el 95,7% de los grupos (ruta, minuto) todos los productos comparten `has_surge`. Con partición al azar, cotizaciones "gemelas" del mismo minuto y ruta quedan en entrenamiento y en prueba, y el modelo las reconoce. Se midió: con partición aleatoria el random forest parece **más del doble de bueno** (PR-AUC 0,309 contra 0,142 por fecha).

**Nivel 1 · Prueba final (*holdout* temporal).** Simula el uso real: aprender del pasado y predecir días nunca vistos. **No se usa para elegir nada.**

| Partición | Fechas | `price` (Uber + Lyft) | `has_surge` (Lyft sin Shared) | Tasa de recargo |
|---|---|---:|---:|---:|
| Entrenamiento | 25/11 al 14/12/2018 (14 fechas) | 488.074 | 196.558 | 8,16% |
| Prueba | 15/12 al 18/12/2018 (4 fechas, sábado a martes) | 148.494 | 59.395 | 8,30% |

**Nivel 2 · Validación cruzada temporal en orden (clase `FechasEnOrden`).** Para elegir hiperparámetros, técnica de balanceo, umbral y modelo. Las 14 fechas de entrenamiento se agrupan en 5 bloques consecutivos; en el fold *i* se entrena con los bloques 1 a *i* y se valida con el *i*+1 (4 folds). Nunca se valida con fechas anteriores a las de entrenamiento.

| Bloque | Fechas | Cotizaciones `has_surge` | Uso |
|---|---|---:|---|
| 1 | 25/11 al 26/11 | 17.875 | Solo entrenamiento |
| 2 | 27/11 al 28/11 | 58.291 | Valida el fold 1 |
| 3 | 29/11 al 30/11 | 33.141 | Valida el fold 2 |
| 4 | 01/12 al 02/12 | 33.319 | Valida el fold 3 |
| 5 | 03/12 al 14/12 (6 fechas) | 53.932 | Valida el fold 4 |

**Nivel 3 · Validación cruzada mezclada (control).** 5 folds estratificados con mezcla. No se usa para elegir: mide cuánto se inflan las métricas al mezclar fechas (ver 7.6.11).

En todos los niveles, el **balanceo se aplica solo a los folds de entrenamiento** y la validación y la prueba siempre tienen la proporción real.

### 7.4 Preprocesamiento según el tipo de modelo

| | Lineales (Ridge, logística) | Árboles (árbol, random forest, gradient boosting) |
|---|---|---|
| Dummies | Cada grupo pierde una columna de referencia (equivale a `drop_first`) | Todas las columnas |
| Referencias | Zona **South Station** (su tasa, 8,0%, es la del promedio), producto **Lyft** (recargo) o **UberX** (precio), franja **Mañana**, clima **Clear** | No aplica |
| Escalado | `StandardScaler` (necesario para la regularización) | También en el pipeline de `has_surge` (no cambia nada a los árboles, pero SMOTE usa distancias) |

South Station se eligió a propósito: como su tasa de recargo es la promedio, un odds ratio se lee como "más o menos chance que una zona típica". Todo el preprocesamiento vive **dentro de un pipeline** (se ajusta solo con el entrenamiento de cada fold).

### 7.5 Objetivo 1 · `price` (regresión)

#### 7.5.1 Datos
Uber + Lyft, 636.568 cotizaciones, 67 predictoras (producto, distancia, zonas, hora, día, clima). Se modela `log(price)`: en escala log los errores son relativos (equivocarse por USD 2 en un viaje de USD 8 pesa más que en uno de USD 40); para reportar en dólares se aplica la exponencial.

#### 7.5.2 Algoritmos e hiperparámetros
Métrica para elegir: **RMSE en log(price) en la validación temporal**. Cada variante (con y sin surge) tuvo su propia búsqueda. Para los árboles, la búsqueda se hizo sobre una muestra de 150.000 filas del entrenamiento y el modelo final se reentrenó con todo. Las grillas se extendieron hasta que el valor elegido quedara **dentro** (no en el borde).

| Algoritmo | Por qué | Fijo | Grilla | Elegido con surge | Elegido sin surge |
|---|---|---|---|---|---|
| **Ridge** (lineal con L2) | Referencia simple e interpretable; la L2 estabiliza coeficientes con dummies correlacionadas | Escalado, referencias | `alpha`: 0,01 · 0,1 · 1 · 10 · 100 · 1.000 · 10.000 · 100.000 (8) | `alpha = 1000` | `alpha = 1000` |
| **Árbol de decisión** | Capta los escalones de la tarifa | — | `max_depth`: 6 · 10 · 14 · 18 · 24 · 30; `min_samples_leaf`: 5 · 20 · 100 · 300 (24) | profundidad 18, hojas de 20 | profundidad 24, hojas de 100 |
| **Random forest** | Más estable que un árbol solo | `max_features = 0,5`; 60 árboles en la búsqueda, 150 en el final | `max_depth`: 12 · 16 · 24 · 32; `min_samples_leaf`: 2 · 5 · 20 · 50 (16) | profundidad 16, hojas de 5 | profundidad 24, hojas de 20 |

**Pruebas que justifican la elección (variante con surge, RMSE log):**

| Modelo | Prueba | Configuración | Validación | Entrenamiento |
|---|---|---|---:|---:|
| Ridge | Elegida | alpha = 1000 | 0,1380 | 0,1380 |
| | Más simple | alpha = 100.000 | 0,2599 | 0,2597 |
| | Más compleja | alpha = 0,01 | 0,1497 | 0,1372 |
| Árbol | Elegida | prof. 18 · hojas 20 | 0,1343 | 0,1200 |
| | Más simple | prof. 6 · hojas 300 | 0,2665 | 0,2667 |
| | Más compleja | prof. 30 · hojas 5 | 0,1486 | 0,0962 |
| Random forest | **Elegida** | prof. 16 · hojas 5 | **0,1269** | 0,1087 |
| | Más simple | prof. 12 · hojas 50 | 0,1365 | 0,1332 |
| | Más compleja | prof. 32 · hojas 2 | 0,1289 | 0,0787 |

La configuración más compleja tiene mucho menos error en entrenamiento que en validación (memoriza); la más simple se queda corta en los dos. Entre los seis modelos (3 algoritmos × con/sin surge) ganó **random forest con surge** (RMSE log en validación 0,1269).

#### 7.5.3 Resultados en la prueba (148.494 cotizaciones, 15 al 18/12)

| Modelo | Variante | MAE | RMSE | MAPE | Error ≤ 10% | R² | R² (log) |
|---|---|---:|---:|---:|---:|---:|---:|
| Línea base (mediana por producto) | – | USD 3,04 | USD 4,59 | 19,8% | 34,1% | 0,758 | 0,794 |
| Ridge | sin surge | USD 1,62 | USD 2,80 | 10,4% | 62,0% | 0,910 | 0,928 |
| Ridge | con surge | USD 1,39 | USD 2,06 | 9,6% | 65,5% | 0,951 | 0,942 |
| Árbol de decisión | sin surge | USD 1,35 | USD 2,53 | 8,9% | 70,9% | 0,927 | 0,939 |
| Árbol de decisión | con surge | USD 1,09 | USD 1,73 | 8,0% | 73,6% | 0,966 | 0,950 |
| Random forest | sin surge | USD 1,32 | USD 2,50 | 8,7% | 71,8% | 0,928 | 0,941 |
| **Random forest ★** | **con surge** | **USD 1,08** | **USD 1,70** | **7,8%** | **75,0%** | **0,967** | **0,953** |

- **Los árboles superan al lineal** (USD 1,08 contra 1,39 con las mismas variables): el precio crece por escalones y la tarifa por milla cambia según el producto.
- **Eficacia en simple:** el 75% de los viajes se predice con error ≤ 10%, contra el 34% de la línea base.
- **`surge_multiplier` aporta, pero poco:** sin él, R² 0,928 y MAE USD 1,32; con él, el MAE baja un 18%. Se informan los dos números porque el multiplicador y el precio salen del mismo cálculo de la plataforma.
- **Certeza (IC 95%, bootstrap de las 87 horas de prueba, 1.000 réplicas):** MAE USD 1,07 a 1,09 · R² 0,966 a 0,968 · error ≤ 10% entre 74,7% y 75,2%. Sin surge: MAE USD 1,31 a 1,34, R² 0,926 a 0,931.
- **Error por producto (MAE relativo al precio medio):** Lux Black XL 4,1% · Lux Black 4,3% · Black SUV 4,4% · Lyft 5,6% · Lux 5,7% · Black 5,9% · Lyft XL 6,8% · WAV 9,5% · UberXL 9,6% · UberX 9,6% · UberPool 10,5% · **Shared 18,9%** (el precio compartido depende del emparejamiento con otros pasajeros, que no está en los datos).

#### 7.5.4 Interpretación

**Importancia por permutación por familias** (caída del R² en log al mezclar todas las columnas de un grupo; solo para interpretar):

| Familia | Caída de R² |
|---|---:|
| Producto | 1,62 |
| Distancia | 0,26 |
| Recargo (surge) | 0,018 |
| Zona de destino | 0,003 |
| Zona de origen | 0,002 |
| Clima | 0,000 |
| Hora y día | 0,000 |

**Uber vs Lyft según el modelo** (variando solo producto y distancia): Shared −29% frente a UberPool · Lyft −3% frente a UberX · Lyft XL −4% frente a UberXL · Lux Black +8% frente a Black · Lux Black XL +5% frente a Black SUV. Lux no se compara (es exclusivo de Lyft).

**Conclusión:** el precio es **estructural y predecible**. Con el producto, la distancia y el multiplicador se estima con un error de alrededor de un dólar. La hora y el clima no lo mueven (H1 y H2 confirmadas, H5 rechazada).

### 7.6 Objetivo 2 · `has_surge` (clasificación)

#### 7.6.1 Datos
Solo Lyft sin Shared: 255.953 cotizaciones; **8,19%** con recargo (20.975), es decir 11 sin recargo por cada una con recargo. **60 predictoras:** zonas de origen y destino, tasa histórica de la ruta, distancia, producto, hora, día, franja y clima. Fuera, por fuga de datos: `price` y `surge_multiplier`.

#### 7.6.2 Líneas base (período de prueba)

| Línea base | Accuracy | Accuracy balanceada | Precisión | Recall | F1 | ROC-AUC | PR-AUC |
|---|---:|---:|---:|---:|---:|---:|---:|
| Siempre "sin recargo" | **91,7%** | 50,0% | 0% | **0%** | 0,000 | 0,500 | 0,083 |
| Siempre "con recargo" | 8,3% | 50,0% | 8,3% | 100% | 0,153 | 0,500 | 0,083 |
| Azar con la tasa real | 85,0% | 50,1% | 8,4% | 8,2% | 0,083 | 0,501 | 0,083 |
| Tasa histórica de la zona de origen (sin modelo) | 66,0% | 58,7% | 12,2% | 50,0% | 0,196 | 0,649 | **0,118** |

Decir siempre "no" acierta el 91,7% y no detecta nada. La referencia más exigente es la **tasa de la zona de origen** (PR-AUC 0,118). Por eso la accuracy se informa **siempre junto a la línea base y a la accuracy balanceada** (50% = azar).

#### 7.6.3 Algoritmos e hiperparámetros
Búsqueda en grilla (`GridSearchCV`) con la validación temporal. Métrica para elegir: **PR-AUC en validación** (se concentra en la clase minoritaria; su valor de azar es la tasa de recargo, ≈ 0,08). **4 algoritmos × 4 técnicas de balanceo = 16 búsquedas, 520 configuraciones.**

| Algoritmo | Por qué | Fijo | Grilla | Combinaciones | Elegido (pesos de clase) |
|---|---|---|---|---:|---|
| **Regresión logística** | Modelo base de clasificación de la cátedra; da probabilidades y odds ratio | L2, `lbfgs`, 3.000 iteraciones | `C`: 0,00001 · 0,00003 · 0,0001 · 0,0003 · 0,001 · 0,01 · 0,1 · 1 · 10 | 9 | `C = 0,00003` |
| **Árbol de decisión** | Reglas legibles; escalones e interacciones | — | `max_depth`: 3 · 5 · 7 · 9 · 12 · 15 · 20 · 25 · 30 · 40; `min_samples_leaf`: 20 · 100 · 500 · 1.000 · 2.000; `criterion`: gini · entropy | 100 | gini, profundidad 12, hojas de 500 |
| **Random forest** | Bagging: promedia árboles y reduce el sobreajuste | 150 árboles, `max_features = sqrt` | `max_depth`: 7 · 10 · 16 · 24; `min_samples_leaf`: 5 · 10 · 50 | 12 | profundidad 24, hojas de 10 |
| **Gradient boosting** (`HistGradientBoostingClassifier`) | Árboles en serie, cada uno corrige al anterior (la idea de AdaBoost vista en clase, en versión moderna) | 200 árboles, `min_samples_leaf = 100`, `l2_regularization = 1` | `learning_rate`: 0,02 · 0,05 · 0,1; `max_leaf_nodes`: 7 · 15 · 31 | 9 | `learning_rate = 0,05`, `max_leaf_nodes = 15` |

**Qué significa cada hiperparámetro:** `C` = inversa de la regularización (C chica achica coeficientes y generaliza mejor entre fechas cuando la señal es débil) · `max_depth` = cuántas preguntas seguidas hace el árbol · `min_samples_leaf` = mínimo de cotizaciones por hoja · `criterion` = medida de pureza (gini o entropía) · `learning_rate` = cuánto corrige cada árbol nuevo · `max_leaf_nodes` = tamaño máximo de cada árbol del boosting.

**El sobreajuste, visto en los datos** (pesos de clase, PR-AUC):

| Modelo | Configuración | Validación | Entrenamiento |
|---|---|---:|---:|
| Árbol | Más simple (prof. 3, hojas 2.000) | 0,115 | 0,123 |
| Árbol | **Elegida** (prof. 12, hojas 500) | **0,125** | 0,159 |
| Árbol | Más compleja (prof. 40, hojas 20) | 0,103 | **0,427** |
| Gradient boosting | **Elegida** (lr 0,05, 15 hojas) | **0,136** | 0,240 |
| Gradient boosting | Más compleja (lr 0,1, 31 hojas) | 0,132 | 0,424 |
| Random forest | Elegida (prof. 24, hojas 10) | 0,126 | 0,510 |

El árbol más complejo tiene casi el triple de PR-AUC en entrenamiento pero es **peor** en fechas nuevas: memoriza días puntuales (Figura 3 del informe). En random forest la profundidad elegida (24) quedó en el borde, pero la validación es plana desde 16 (0,1261 contra 0,1262).

**Aporte de la tasa histórica de la ruta:** con y sin ella, el PR-AUC en validación cambia como máximo 0,003 (los modelos ya captaban la ruta combinando las dummies de origen y destino). Se mantiene porque no empeora y deja explícita la información de cada ruta.

#### 7.6.4 Balanceo de clases: cuatro técnicas

| Técnica | Qué hace | Filas para entrenar | % con recargo |
|---|---|---:|---:|
| Sin balanceo | Datos tal cual | 196.558 | 8,2% |
| Submuestreo (`RandomUnderSampler` 1:1) | Descarta al azar no-recargos hasta igualar (tira 164.464 filas, el 91% de la clase mayoritaria) | 32.094 | 50% |
| SMOTE 1:1 | Crea recargos sintéticos interpolando entre 5 vecinos cercanos | 361.022 | 50% |
| **Pesos de clase** (`class_weight = "balanced"`) | No toca los datos: un error en un recargo pesa **6,12** y en un no-recargo **0,54** (11 veces más) | 196.558 | 8,2% |

Pesos: w₁ = 196.558 / (2 × 16.047) ≈ 6,12 · w₀ = 196.558 / (2 × 180.511) ≈ 0,54.

**Gradient boosting con cada técnica** (umbral 0,5, período de prueba):

| Técnica | Accuracy | Acc. balanceada | Recall | Precisión | PR-AUC validación |
|---|---:|---:|---:|---:|---:|
| Sin balanceo | 91,7% | 50,0% | 0,0% | 0,0% | 0,134 |
| Submuestreo | 53,8% | 62,8% | 73,6% | 12,2% | 0,130 |
| SMOTE | 91,6% | 50,1% | 0,3% | 15,9% | 0,116 |
| **Pesos de clase (elegida)** | 54,2% | 63,1% | 73,7% | 12,3% | **0,136** |

**Qué se aprendió:**
- **Balancear no mejora el ranking, mueve el umbral.** El PR-AUC casi no cambia (0,134 sin balanceo vs 0,136 con pesos). Lo que cambia es que las probabilidades suben y superan el 0,5.
- **El submuestreo funciona pero desperdicia datos** (entrena con 32.094 filas).
- **SMOTE no conviene con nuestros datos:** la mayoría de las variables son dummies y al interpolar crea valores imposibles como "0,37 de Back Bay", que los árboles memorizan.
- **Se eligieron pesos de clase** porque formaron el par con mejor PR-AUC en validación (gradient boosting + pesos, 0,136) y usan solo datos reales. Por algoritmo, la mejor técnica en validación fue: logística, árbol y random forest → sin balanceo; gradient boosting → pesos de clase.

**¿Hace falta balancear si también se ajusta el umbral?** Se entrenó cada algoritmo sin balanceo y se le eligió el umbral con la matriz de beneficio:

| Modelo | Sin balanceo (umbral ajustado) | Pesos de clase (umbral ajustado) |
|---|---|---|
| Regresión logística | umbral 0,10 · USD 26 | umbral 0,54 · USD 29 |
| Árbol de decisión | umbral 0,14 · USD 51 | umbral 0,63 · USD 43 |
| Random forest | umbral 0,12 · USD 61 | umbral 0,44 · USD 55 |
| Gradient boosting | umbral 0,11 · USD 54 | umbral 0,57 · USD 56 |

*(beneficio en la prueba, USD cada 1.000 cotizaciones)* Con el umbral ajustado, sin balanceo rinde casi igual. Confirma que balancear mueve el umbral. Se mantienen los pesos de clase porque fue el mejor par en validación y deja el umbral en una escala más fácil de leer.

#### 7.6.5 Elección del modelo final (solo con validación)

| Algoritmo (pesos de clase) | PR-AUC validación | ROC-AUC validación | F1 validación |
|---|---:|---:|---:|
| **Gradient boosting ★** | **0,136 ± 0,012** | 0,659 | 0,205 |
| Random forest | 0,126 ± 0,006 | 0,653 | 0,204 |
| Árbol de decisión | 0,125 ± 0,014 | 0,637 | 0,197 |
| Regresión logística | 0,120 ± 0,004 | 0,649 | 0,201 |

Los cuatro quedan cerca: **el límite no está en el algoritmo sino en la información disponible**.

#### 7.6.6 El umbral de decisión: matriz de beneficio

El umbral 0,5 es arbitrario. Se eligió con una **matriz de beneficio** que pone un valor en dólares a cada casilla de la matriz de confusión, comparado con no tener modelo:

| | Predice **sin recargo** | Predice **con recargo** (aviso) |
|---|---|---|
| **Real: sin recargo** | VN · USD 0 | FP · **−USD 1,00** (el pasajero compara o espera sin necesidad; supuesto: ~5 minutos) |
| **Real: con recargo** | FN · USD 0 (paga el recargo, igual que sin modelo) | VP · **+USD 7,73** (evita el recargo medio de USD 8,73 y pierde USD 1 en comparar) |

- **Recargo medio (USD 8,73):** diferencia entre el precio con y sin multiplicador en las cotizaciones con recargo del entrenamiento. **El costo de la falsa alarma (USD 1) es un supuesto del equipo.**
- **Regla de decisión:** conviene avisar si la probabilidad de recargo supera costo / recargo = 1 / 8,73 = **11,4%** (precisión mínima).
- **Procedimiento:** con las predicciones de la validación temporal se calcula el beneficio de cada umbral, se elige el máximo y se aplica **tal cual** a la prueba.
- **Resultado:** umbral **0,57**. Con el de máximo F1 (0,55) el modelo avisaba en el 38,5% de las cotizaciones (beneficio USD 55); con la matriz, en el **31,7%** (USD 56): más selectivo. Con umbral 0,5: USD 37. Avisar siempre: −USD 275.
- Con pesos de clase el puntaje **no es una probabilidad real** (el modelo exagera el riesgo a propósito).

**Sensibilidad al costo de una falsa alarma:**

| Costo de una falsa alarma | Precisión mínima | Umbral | Avisa en | Recall | Precisión | Beneficio / 1.000 |
|---|---:|---:|---:|---:|---:|---:|
| USD 0,50 | 5,7% | 0,32 | 74,0% | 92,7% | 10,4% | USD 301 |
| **USD 1,00** | **11,4%** | **0,57** | **31,7%** | **51,4%** | **13,5%** | **USD 56** |
| USD 1,50 | 17,2% | 0,72 | 0,6% | 1,5% | 21,5% | USD 2 |
| USD 2,00 | 22,9% | no avisar | 0% | 0% | – | USD 0 |
| USD 3,00 | 34,3% | no avisar | 0% | 0% | – | USD 0 |

Cuanto más cuesta una falsa alarma, más selectivo debe ser el modelo; desde USD 2 no conviene avisar nunca.

**Hasta dónde se pueden bajar los falsos negativos** (umbral fijado en validación, medido en la prueba):

| Recargos a detectar | Umbral | Recall real | FN | FP | Precisión | Accuracy | Beneficio / 1.000 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 90% | 0,27 | 96,5% | 173 | 43.508 | 9,9% | 26,5% | −USD 113 |
| 80% | 0,38 | 87,0% | 639 | 34.152 | 11,2% | 41,4% | −USD 17 |
| 70% | 0,45 | 81,4% | 919 | 29.423 | 12,0% | 48,9% | USD 27 |
| 60% | 0,50 | 74,6% | 1.251 | 26.289 | 12,3% | 53,6% | USD 36 |
| 50% | 0,54 | 63,4% | 1.802 | 20.887 | 13,0% | 61,8% | USD 55 |
| 40% | 0,57 | 51,3% | 2.400 | 16.229 | 13,5% | 68,6% | USD 56 |
| 30% | 0,60 | 35,2% | 3.193 | 10.210 | 14,5% | 77,4% | USD 54 |
| 20% | 0,62 | 18,4% | 4.020 | 4.905 | 15,6% | 85,0% | USD 36 |
| 10% | 0,66 | 8,2% | 4.525 | 1.734 | 18,9% | 89,5% | USD 23 |

**Límite del dominio:** bajar los falsos negativos siempre cuesta muchos falsos positivos, y la precisión nunca pasa de ~20% (máximo 19,7% detectando al menos el 5% de los recargos). **Conviene enfocarse en la precisión**, con avisos de bajo costo para el pasajero.

#### 7.6.7 Resultados en la prueba (15 al 18/12, 59.395 cotizaciones)

| Modelo (pesos de clase) | Umbral | Accuracy | Acc. balanceada | Precisión | Recall | F1 | F1 macro | F1 weighted | ROC-AUC | PR-AUC | Beneficio / 1.000 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Gradient boosting ★** | 0,57 | **68,6%** | **60,8%** | **13,5%** | 51,4% | **0,214** | 0,509 | 0,755 | **0,676** | 0,140 | **USD 56** |
| Regresión logística | 0,54 | 59,1% | 61,1% | 12,2% | 63,5% | 0,205 | 0,465 | 0,682 | 0,650 | 0,121 | USD 29 |
| Random forest | 0,44 | 67,4% | 61,0% | 13,3% | 53,3% | 0,213 | 0,504 | 0,746 | 0,675 | 0,142 | USD 55 |
| Árbol de decisión | 0,63 | 84,3% | 55,5% | 16,0% | 21,1% | 0,182 | 0,547 | 0,852 | 0,672 | 0,138 | USD 43 |

**Matriz de confusión del modelo elegido** (4.928 con recargo y 54.467 sin):

| | Predijo **sin recargo** | Predijo **con recargo** |
|---|---:|---:|
| **Real: sin recargo** | **VN = 38.202** (acierto) | **FP = 16.265** (falsa alarma · error tipo I) |
| **Real: con recargo** | **FN = 2.394** (recargo no detectado · error tipo II) | **VP = 2.534** (recargo anticipado) |

- **Accuracy** = (2.534 + 38.202) / 59.395 = **68,6%**
- **Precisión** = 2.534 / 18.799 = **13,5%** → de cada 100 alertas, 13 o 14 son recargos reales (el azar acierta 8)
- **Recall** = 2.534 / 4.928 = **51,4%** → detecta 5 de cada 10 recargos
- **Especificidad** = 38.202 / 54.467 = **70,1%**
- **Accuracy balanceada** = (51,4% + 70,1%) / 2 = **60,8%**

La accuracy del modelo (68,6%) es **menor** que la de decir siempre "no" (91,7%) porque el modelo **sí avisa** y al avisar comete falsas alarmas. No es un retroceso: si se eligiera el umbral para maximizar la accuracy, el modelo volvería a responder siempre "sin recargo".

**Niveles de certeza (IC 95%, 1.000 remuestreos *bootstrap* de las 87 horas de prueba; se remuestrean horas completas porque las cotizaciones de una misma hora comparten el recargo):**

| Métrica | Valor | IC 95% |
|---|---:|---|
| Accuracy | 68,6% | 67,3% a 69,8% |
| Accuracy balanceada | 60,8% | 59,4% a 62,1% |
| Precisión | 13,5% | 12,7% a 14,3% |
| Recall | 51,4% | 48,4% a 54,5% |
| F1 | 0,214 | 0,203 a 0,225 |
| ROC-AUC | 0,676 | 0,663 a 0,689 |
| PR-AUC | 0,140 | 0,132 a 0,150 |
| Beneficio (USD / 1.000) | 56 | 35 a 78 |
| Ventaja de PR-AUC sobre la tasa de la zona | +0,022 | +0,015 a +0,029 |

El modelo está por encima del azar **con certeza**, y su ventaja sobre la regla simple por zona es positiva en todo el intervalo: chica, pero no es casualidad. El beneficio también es positivo en todo el intervalo.

#### 7.6.8 Curvas ROC y Precisión-Recall
- Los cuatro modelos están por encima del azar (ROC-AUC entre 0,650 y 0,676), pero lejos de un clasificador fuerte.
- **ROC-AUC 0,676:** si se toma al azar una cotización con recargo y una sin recargo, el modelo le da más puntaje a la que tiene recargo el **68%** de las veces.
- **PR-AUC 0,140** contra un azar de 0,083 (la tasa de recargo): ~70% por encima del azar. La curva PR muestra mejor el límite: la precisión se mantiene baja en casi todo el recorrido. Con clases desbalanceadas, la curva ROC puede verse optimista porque los muchos verdaderos negativos "diluyen" las falsas alarmas.

#### 7.6.9 Interpretación: qué aprendió el modelo

**Importancia por permutación por familias** (caída de PR-AUC; solo para interpretar):

| Familia | Caída de PR-AUC |
|---|---:|
| Ruta (tasa histórica) | 0,047 |
| Distancia | 0,025 |
| Zona de destino | 0,008 |
| Clima | 0,002 |
| Zona de origen | 0,000 (su efecto ya está dentro de la ruta) |
| Producto | 0,000 |
| Hora y día | 0,000 |

**Odds ratio de la regresión logística** contra South Station. Se calculan con una logística de **regularización débil (C = 1)**, porque la elegida (C = 0,00003) encoge los coeficientes hacia 0 y los odds ratio hacia 1:

| Zona de origen | Odds ratio (C = 1) | Lectura |
|---|---:|---|
| Northeastern University | 1,29 | +29% de chance relativa de recargo |
| Boston University | 1,24 | +24% |
| Fenway | 1,23 | +23% |
| Back Bay | 1,22 | +22% |
| Theatre District | 1,17 | +17% |
| Beacon Hill | 1,12 | +12% |
| Financial District | 0,97 | ≈ promedio |
| West End | 0,74 | −26% |
| North Station | 0,72 | −28% |
| North End | 0,38 | −62% |
| Haymarket Square | 0,37 | −63% |

La tasa histórica de la ruta: +1 desvío → odds ratio 1,40. Con la logística elegida (C = 0,00003) los valores se encogen (por ejemplo, North End 0,65, Back Bay 1,29): por eso no se usa para interpretar.

**Primeras reglas del árbol (Figura 9):** el árbol separa primero según el lugar (tasa histórica de la ruta y zonas de origen) y después la distancia termina de ordenar el riesgo.

**Deciles de riesgo (Figura 10):** ordenando las cotizaciones de prueba por el puntaje del modelo:

| Decil | Tasa real de recargo | Lift | Captura acumulada |
|---:|---:|---:|---:|
| 1 (más riesgoso) | 15,7% | 1,9× | 19% |
| 2 | 13,3% | 1,6× | 35% |
| 3 | 11,6% | 1,4× | 49% |
| 4 | 11,6% | 1,4× | 63% |
| 5 | 9,4% | 1,1× | 74% |
| 6 | 8,2% | 1,0× | 84% |
| 7 | 5,2% | 0,6× | 90% |
| 8 | 4,7% | 0,6× | 96% |
| 9 | 2,3% | 0,3× | 99% |
| 10 (menos riesgoso) | 1,1% | 0,1× | 100% |

El 20% más riesgoso concentra el **35%** de los recargos y la mitad más riesgosa, el **74%**. **El modelo sirve para priorizar, no para adivinar cotización por cotización.**

**Conclusión:** el recargo depende del **lugar** (ruta y zona de origen), no de la hora ni del clima. El resto depende de la oferta y la demanda en tiempo real (pedidos vs conductores disponibles), que no están en el dataset. Por eso ningún modelo pasa de un ROC-AUC de ~0,68.

#### 7.6.10 Por qué validar por fecha: la evidencia

**Partición aleatoria (75/25 estratificada) contra partición por fecha:**

| Modelo | ROC-AUC aleatoria | ROC-AUC por fecha | PR-AUC aleatoria | PR-AUC por fecha | Inflado |
|---|---:|---:|---:|---:|---:|
| Árbol de decisión | 0,700 | 0,672 | 0,153 | 0,138 | +11% |
| Random forest | 0,825 | 0,675 | 0,309 | 0,142 | +117% |
| Gradient boosting | 0,712 | 0,676 | 0,172 | 0,140 | +23% |

**Validación cruzada temporal contra mezclada** (PR-AUC promedio ± desvío entre folds):

| Modelo | CV temporal en orden (4 folds) | CV mezclada (5 folds) | Inflado |
|---|---:|---:|---:|
| Regresión logística | 0,120 ± 0,004 | 0,126 ± 0,003 | +5% |
| Árbol de decisión | 0,125 ± 0,014 | 0,150 ± 0,005 | +20% |
| Random forest | 0,126 ± 0,006 | 0,312 ± 0,005 | +147% |
| Gradient boosting | 0,136 ± 0,012 | 0,178 ± 0,003 | +31% |

Mezclar fechas hace parecer mejores a todos los modelos, sobre todo al random forest, que memoriza cotizaciones "gemelas". Con partición aleatoria, además, random forest parecía el mejor modelo cuando por fecha queda parejo con gradient boosting.

### 7.7 Análisis complementario · K-Means de los 12 productos (familias tarifarias)

**Pregunta:** ¿se pueden agrupar los productos según cómo arman su precio? (objetivo específico 5 de la Entrega 1; hipótesis H6).

1. **Variables.** Para cada producto se ajustó una recta `precio = tarifa base + precio por milla × distancia` con los viajes **sin recargo** del **entrenamiento** (no se mezcla el surge ni se usa la prueba). Cada producto queda descripto por dos números.
2. **Estandarización** (`StandardScaler`), porque K-Means usa distancias euclidianas: sin escalar, la tarifa base (rango ~3 a 22) dominaría al precio por milla (~1,2 a 4,5).
3. **Elección de k** (k = 2 a 6, `n_init = 50`):

| k | 2 | **3** | 4 | 5 | 6 |
|---|---:|---:|---:|---:|---:|
| Inercia (codo) | 8,11 | **2,00** | 0,96 | 0,69 | 0,48 |
| Silueta | 0,574 | **0,682** | 0,611 | 0,547 | 0,416 |

El codo y la silueta coinciden en **k = 3**; una silueta de 0,68 indica grupos bien separados.

**Tabla por producto:**

| Producto | Plataforma | Tarifa base (USD) | Por milla (USD) | R² de la recta | Familia |
|---|---|---:|---:|---:|---|
| Shared | Lyft | 3,30 | 1,25 | 0,41 | Económico |
| Lyft | Lyft | 5,59 | 1,70 | 0,81 | Económico |
| UberPool | Uber | 6,13 | 1,20 | 0,45 | Económico |
| WAV | Uber | 6,39 | 1,54 | 0,54 | Económico |
| UberX | Uber | 6,40 | 1,53 | 0,54 | Económico |
| Lyft XL | Lyft | 7,79 | 3,19 | 0,86 | Intermedio |
| Lux | Lyft | 8,76 | 3,84 | 0,89 | Intermedio |
| UberXL | Uber | 9,07 | 3,01 | 0,62 | Intermedio |
| Black | Uber | 12,11 | 3,84 | 0,83 | Intermedio |
| Lux Black | Lyft | 12,31 | 4,54 | 0,89 | Intermedio |
| Lux Black XL | Lyft | 21,89 | 4,24 | 0,82 | Premium |
| Black SUV | Uber | 22,54 | 3,53 | 0,74 | Premium |

**Las tres familias:**

| Familia | Productos | Tarifa base | Por milla |
|---|---|---|---|
| **Económico** | Shared, Lyft, UberPool, WAV, UberX | USD 3,3 a 6,4 | USD 1,20 a 1,70 |
| **Intermedio** | Lyft XL, Lux, UberXL, Black, Lux Black | USD 7,8 a 12,3 | USD 3,01 a 4,54 |
| **Premium** | Lux Black XL, Black SUV | USD 21,9 a 22,5 | USD 3,53 a 4,24 |

**Hallazgos:**
- Las diferencias de precio entre productos **no son continuas**: hay un escalón entre los económicos y el resto (el precio por milla se **duplica**) y otro entre los Black y los vehículos grandes de lujo (la tarifa base casi se **duplica**).
- **Uber y Lyft arman el precio igual:** cada producto de Uber cae en la misma familia que su equivalente de Lyft. Las diferencias de H2 son ajustes dentro de cada familia.
- **Explica H4 (viajes cortos caros por milla):** precio por milla = tarifa base / distancia + precio por milla. En UberX, un viaje de 1 milla cuesta USD 7,94 por milla y uno de 5 millas, USD 2,81. La ruta más cara por milla (Financial District → South Station, USD 17,95/milla) es muy corta, no es una zona cara.
- **Limitación:** son 12 puntos; el análisis es descriptivo.
- **Antes** se probó un K-Means de **rutas**, pero la silueta era plana para todos los k (no había grupos naturales), así que se reemplazó.

### 7.8 Balance de hipótesis tras el modelado

| Hipótesis | Evidencia | Estado |
|---|---|---|
| H1 · Producto y distancia son los principales factores del precio | Dominan la importancia del modelo de precio (caídas de R² 1,62 y 0,26); R² = 0,967 | Confirmada |
| H2 · Uber y Lyft difieren según el nivel | Lyft más barato en económicos (Shared −29%) y más caro en Black (+8%) | Confirmada |
| H3 · Patrones horarios y por día | Hora y día con importancia ≈ 0 en ambos modelos | No se confirma |
| H4 · Corredores con mayor costo por milla | Rutas muy cortas (hasta USD 17,95/milla) por la tarifa base fija | Confirmada |
| H5 · El mal clima encarece | Sin efecto en precio ni en recargo, aun con modelos no lineales | Rechazada |
| H6 · Segmentos tarifarios homogéneos | 12 productos → 3 familias bien separadas (silueta 0,68) | Confirmada |

### 7.9 Limitaciones (declaradas en el informe)

1. **Falta la oferta y la demanda en tiempo real**, el determinante principal del recargo.
2. **Período corto:** 18 fechas; la prueba cubre 4 días (sábado a martes). Los resultados pueden cambiar en otras épocas.
3. **Clima de la ciudad, no de la zona** (un registro por hora).
4. **Retransformación del log:** la exponencial estima la mediana del precio, no la media; subestima levemente los viajes caros.
5. **Búsqueda acotada** en los modelos más costosos (12 combinaciones de random forest y 9 de gradient boosting en recargo; árboles de precio sobre 150.000 filas).
6. **Supuestos de la matriz de beneficio:** el costo de USD 1 es un supuesto, y se asume que el aviso permite evitar todo el recargo (optimista).
7. **La interpretación usa el período de prueba** (importancia y deciles con modelos ya entrenados): no hay fuga, pero no es una segunda evaluación independiente.

### 7.10 De la versión preliminar a la final (qué se corrigió)

La Entrega 3 tuvo un borrador ("Cosas que hicimos en casa", hoy eliminado del repositorio) y dos rondas de revisión. Lo que cambió:

| | Preliminar | Final |
|---|---|---|
| Dataset de entrada | Dataset limpio sin codificar (recodificaba con otro criterio) | Dataset codificado de la Entrega 2 (`name_*`) |
| Partición | **Aleatoria** (contradecía lo comprometido) | Por fecha + validación temporal en orden |
| Hiperparámetros | Fijos a mano, sin justificar | Búsqueda en grilla, grillas extendidas hasta que el valor quede adentro |
| Umbral | 0,5 fijo | Matriz de beneficio en validación (antes, máximo F1) |
| Métricas | Sin línea base ni PR-AUC | + accuracy balanceada, PR-AUC, F1 macro/weighted, curvas, 4 líneas base, IC 95% |
| Modelos de `has_surge` | Logística y árbol | + random forest y gradient boosting |
| Modelos de `price` | Lineal sin regularizar y árbol, sin surge | Ridge, árbol y random forest, con y sin surge, contra línea base |
| Interpretación | No había | Importancia por familias, odds ratio, reglas del árbol, deciles, H1–H6 |
| Tercer análisis | Multiclase de Uber (circular: predecía el servicio usando el precio) | K-Means de los 12 productos |
| Informe | Markdown con emojis y links locales | `.docx` formato *paper* |

**Cómo cambiaron los números (no comparables uno a uno):** recall del recargo 83,4% → 51,4% (el preliminar avisaba en el 57% de las cotizaciones) · precisión 12,0% → 13,5% · ROC-AUC 0,683 → 0,676 (la validación por fecha quita el optimismo) · R² del precio 0,906 → 0,967 · MAE USD 1,85 (sin verificar) → USD 1,08.

**Segunda revisión del equipo (12 observaciones, todas resueltas):** `drop_first` en lineales con South Station como referencia · memoria y tiempos de random forest · se agregó gradient boosting y la tasa histórica de la ruta · búsqueda propia por técnica y variante · `GroupKFold` reemplazado por validación temporal en orden · K-Means de rutas reemplazado por el de productos · aclaración de que la importancia sobre la prueba es solo interpretativa · la constante 1,57 se calcula del dataset (1,567) · Lux sin par en Uber · notebooks guardados ejecutados · README actualizado.

**Última iteración (antes de entregar):** matriz de beneficio y sensibilidad · puntos de operación · IC 95% por *bootstrap* de bloques · CV mezclada como control · odds ratio con C = 1 · comparación sin balanceo con umbral ajustado · nuevas líneas base (zona de origen y "siempre con recargo") · precio con y sin surge en todos los resúmenes · Colab reorganizado · corrida de ~25 a ~15 minutos.

**Pedidos explícitos de la profesora que se atendieron:** explicar por qué se eligió cada modelo y qué pruebas se hicieron (elegida, segunda, más simple y más compleja), e informar la **accuracy** en todas las tablas, siempre contra la línea base y junto a la accuracy balanceada.

### 7.11 Defensa oral de la Entrega 3

- **Soporte:** Colab `Presentacion_Entrega3_Grupo11.ipynb`, 14 celdas, 5 secciones, ya ejecutado y con el código oculto. Objetivo de tiempo: ~6:30 min.
- **Secciones:** (1) cómo entrenamos: fuga de datos, validación temporal y balanceo (fig04) · (2) comparación de modelos (fig01 y tablas) · (3) matriz de confusión y matriz de beneficio (fig05 y fig06) · (4) curvas ROC y PR (fig07) · (5) resultados finales, hipótesis y K-Means (fig11).
- **Guion y preguntas probables:** `GUION_DEFENSA_SPRINT3.md` (ojo con sus inconsistencias, sección 11).

### 7.12 Backlog del Sprint 3 (todo finalizado)

Diseño experimental (partición temporal y validación en orden) · modelos de precio con y sin surge · modelos de recargo · comparación de técnicas de balanceo y ajuste del umbral · pruebas y justificación de hiperparámetros · familias tarifarias con K-Means · interpretación frente a H1–H6 (Product Owner y equipo) · informe y defensa oral (Colab) · matriz de beneficio y sensibilidad · intervalos de confianza · CV mezclada como control.

**Próximos pasos que el propio informe dejó para el Sprint 4:**
1. Ordenar la historia en dos partes: la parte **estructural** del precio (objetivo 1) y la parte **dinámica**, el recargo (objetivo 2).
2. Llevar los hallazgos a **recomendaciones concretas** para el pasajero (zonas de alto riesgo, cuándo comparar plataformas), el conductor y la plataforma.
3. Seleccionar **pocas visualizaciones** (mapa de riesgo por zona, curva tarifaria Uber vs Lyft, deciles de riesgo) y redactar el *paper* final con la plantilla de la cátedra.

---

## 8. Conocimiento obtenido: la historia completa en clave de negocio

### 8.1 El mensaje central en una frase

> **El precio de un viaje en Boston es una fórmula casi fija (producto + distancia) que se puede predecir con un dólar de error; lo único impredecible es el recargo, que depende del lugar y, sobre todo, de la oferta y la demanda del momento, que ninguna app publica.**

### 8.2 Los hallazgos principales

| # | Hallazgo | Evidencia clave |
|---|---|---|
| 1 | **El precio es estructural.** El producto elegido y la distancia lo explican casi todo. | EDA: producto 77,4%, distancia 11,9%. Modelo: R² 0,967, MAE USD 1,08, 75% de viajes con error ≤ 10%. |
| 2 | **El clima y la hora no cambian el precio** (contra la creencia popular). | \|r\| máx. 0,0015; importancia 0,000 en el modelo; recargo con lluvia 7,85% vs 8,28% sin lluvia. |
| 3 | **El mercado tiene tres escalones de precio**, y Uber y Lyft se espejan. | K-Means k = 3 (silueta 0,68): económico, intermedio, premium; cada producto de Uber cae con su par de Lyft. |
| 4 | **Ninguna app es siempre la más barata**: depende del nivel. | Lyft más barato en económicos (Shared −29% vs UberPool, Lyft −3% vs UberX, Lyft XL −4% vs UberXL) y más caro en Black (+8% y +5%). |
| 5 | **Los viajes muy cortos son los más caros por milla** por la tarifa base. | Financial District → South Station: USD 17,95/milla. UberX: USD 7,94/milla en 1 milla vs USD 2,81 en 5 millas. |
| 6 | **El recargo es caro y frecuente.** | 1 de cada 12 cotizaciones de Lyft; +46% en promedio; USD 8,73 de sobreprecio medio. |
| 7 | **El recargo es un fenómeno de lugar, no de reloj.** | Tasa por origen de 1,8% (North End) a 13,4% (Back Bay), 7,3 veces; la ruta es la variable más importante del modelo. |
| 8 | **El recargo solo se puede anticipar parcialmente** y hay un techo informativo. | Los 4 algoritmos topan en ROC-AUC ~0,65–0,68; precisión nunca > ~20%. Falta oferta/demanda en tiempo real. |
| 9 | **Aun así, el modelo tiene valor si se usa para priorizar.** | El 10% más riesgoso tiene 1,9× la tasa promedio; el 20% más riesgoso concentra el 35% de los recargos; USD 56 de beneficio cada 1.000 cotizaciones (IC 35 a 78). |
| 10 | **Las decisiones metodológicas cambian las conclusiones.** | Validar al azar infla el PR-AUC hasta +147%; la accuracy sola (91,7%) premia a un modelo que no detecta nada. |

### 8.3 Recomendaciones por actor (derivadas de los resultados)

**Para el pasajero**
- Si sale de **Back Bay, Northeastern University, Fenway, Boston University o Theatre District**, conviene comparar con la otra app antes de pedir: son las zonas con más recargo (11,6% a 13,4%). En **North End, Haymarket Square, North Station y West End** el riesgo es bajo (< 5%).
- En los niveles **económicos** (compartido, estándar, XL) Lyft suele ser más barato; en los **Black**, Uber.
- No hace falta "esperar a que deje de llover" ni evitar ciertas horas: ni el clima ni la hora cambian la tarifa base.
- Para tramos muy cortos, la tarifa base hace que el costo por milla se dispare: caminar puede convenir.
- Un aviso de "posible recargo" del modelo es una invitación a comparar (cuesta poco), no una certeza.

**Para el conductor**
- Las zonas con recargo más frecuente son estructurales y repetibles (universidades y Back Bay/Fenway): ubicarse cerca de esos orígenes aumenta la chance de viajes con recargo.
- La hora del día, por sí sola, no garantiza recargo en estos datos.

**Para la plataforma**
- La tarifa base ya es transparente y predecible: comunicarla con claridad no tiene costo competitivo.
- El recargo es predecible solo en parte con datos públicos: para anticiparlo de verdad hacen falta datos de oferta y demanda en tiempo real (pedidos abiertos, conductores conectados).
- Un sistema de avisos debe priorizar la **precisión** (pocas falsas alarmas): si una falsa alarma le cuesta al usuario USD 2 o más, no conviene avisar nunca con esta información.

**Para un proyecto futuro (trabajo futuro)**
- Incorporar oferta y demanda en tiempo real; usar el dataset de dos archivos (`cab_rides.csv` + `weather.csv`) para unir el clima por zona; ampliar el período; probar la versión de tres clases del recargo (sin, leve, alto); calibrar las probabilidades.

---

## 9. Entrega 4 · Qué se pide y cómo armarla con lo que ya tenemos

### 9.1 La consigna

Presentación tipo *storytelling* que incluya:
1. **Problema y objetivo**
2. **Dataset y metodología utilizada**
3. **Principales hallazgos y resultados**
4. **Decisiones técnicas clave**
5. **Conclusiones y recomendaciones**

Más: informe en formato *paper* (plantilla de la cátedra), presentación oral, y que la entrega final refleje el **trabajo colectivo y los aportes individuales**. Fechas posibles: 06/11, 11/11, 13/11 o 18/11/2026.

### 9.2 Arco narrativo sugerido (una propuesta, a decidir por el equipo)

| Momento | Pregunta que responde | Contenido | Visual disponible |
|---|---|---|---|
| **1. El gancho** | ¿Por qué me debería importar? | "Pedís el mismo viaje dos veces y te cobran distinto." Con recargo, el mismo viaje cuesta 46% más, y pasa en 1 de cada 12 cotizaciones de Lyft. | E2: fig. precio con y sin recargo (`graficos/10_precio_con_y_sin_recargo.png`) |
| **2. El problema y los actores** | ¿Quién sufre la falta de transparencia? | Pasajero, conductor, plataforma. Pregunta de investigación y los dos objetivos (parte estructural y parte dinámica). | Tabla de los dos objetivos |
| **3. Los datos y su "letra chica"** | ¿Con qué trabajamos y qué tuvimos que arreglar? | 693.071 cotizaciones, 12 zonas, noviembre–diciembre 2018. Los tres problemas ocultos (hora en UTC, clima por hora, fechas faltantes), Taxi sin precio. 57 → 27 columnas, 636.568 filas. | E2: `11_cobertura_temporal.png`, `01_filas_antes_despues.png`, `02_nulos_antes_despues.png` |
| **4. Acto 1: el precio es una fórmula** | ¿De qué depende cuánto pago? | Producto + distancia ≈ todo. Random forest: USD 1,08 de error, R² 0,967. Clima y hora: cero. Tres familias de tarifa (K-Means). Uber vs Lyft por nivel. | E2: `07_peso_de_cada_factor.png`; E3: `fig01`, `fig02`, `fig11` |
| **5. Acto 2: el recargo es el misterio** | ¿Cuándo y dónde pago de más? | Mapa de riesgo por zona. Por qué la accuracy engaña (91,7% sin detectar nada). Los 4 modelos topan en ~0,68: falta la oferta y la demanda en tiempo real. | E2: `09_recargo_por_zona.png`; E3: `fig05`, `fig07`, `fig08` |
| **6. Del modelo al dinero** | ¿Sirve para algo un modelo "modesto"? | Matriz de beneficio: USD 56 cada 1.000 cotizaciones, umbral 0,57, avisos selectivos. Deciles: el 20% más riesgoso concentra el 35% de los recargos. | E3: `fig06`, `fig10` |
| **7. Decisiones técnicas clave** | ¿Por qué confiar en estos números? | Fuga de datos (sin precio para predecir el recargo) · validación por fecha (mezclar infla hasta +147%) · `log(price)` · pesos de clase vs SMOTE · umbral por negocio · IC 95%. | E3: `fig03`, `fig04` |
| **8. Conclusiones y recomendaciones** | ¿Y ahora qué? | Balance H1–H6. Recomendaciones por actor (sección 8.3). Limitaciones y trabajo futuro. | Tabla de hipótesis |

### 9.3 Inventario de visualizaciones disponibles

**Entrega 2** (`Contenido Entrega 2/graficos/`): `01_filas_antes_despues` · `02_nulos_antes_despues` · `03_columnas_antes_despues` · `04_correlacion_clima_antes_despues` · `05_distancias_imposibles` · `06_precio_por_producto` · `07_peso_de_cada_factor` · `08_recargo_distribucion` · `09_recargo_por_zona` · `10_precio_con_y_sin_recargo` · `11_cobertura_temporal` · `12_coordenadas_clima_vs_zonas` · `13_precio_distribucion` · `14_recargo_uber_vs_lyft` · `15_recargo_por_producto` · `16_precio_vs_distancia_por_nivel` · `17_clima_vs_objetivos` · `18_recargo_por_hora`.

**Entrega 3** (`Contenido Entrega 3/5_Graficos/`):

| Figura | Contenido |
|---|---|
| `fig01_precio_real_vs_predicho` | Precio real vs predicho y MAE por producto |
| `fig02_precio_importancia_y_tarifas` | Importancia por familias (precio) y tarifa aprendida por producto según distancia (Uber vs Lyft) |
| `fig03_recargo_validacion_profundidad` | Curva de validación del árbol (sobreajuste) |
| `fig04_recargo_balanceo` | Distribución de clases por técnica y recall de cada una |
| `fig05_recargo_matrices_confusion` | Matrices de confusión de los modelos finales |
| `fig06_recargo_matriz_beneficio` | Matriz de beneficio, beneficio por umbral y sensibilidad al costo |
| `fig07_recargo_curvas_roc_pr` | Curvas ROC y Precisión-Recall |
| `fig08_recargo_importancia_odds_ratio` | Importancia por familias (recargo) y odds ratio (C = 1) |
| `fig09_recargo_arbol_reglas` | Primeros tres niveles del árbol |
| `fig10_recargo_deciles_riesgo` | Tasa real de recargo por decil de riesgo |
| `fig11_productos_kmeans` | Codo, silueta y los 12 productos agrupados |

Visualizaciones que el informe de la Entrega 3 sugirió y **todavía no existen** como figura propia: un **mapa de riesgo por zona** con las coordenadas de OpenStreetMap (la Figura 7 de la Entrega 2 tiene una versión en dispersión) y una **curva tarifaria Uber vs Lyft** enfocada en el pasajero.

### 9.4 Números clave para tener a mano

| Tema | Número |
|---|---|
| Dataset crudo | 693.071 filas × 57 columnas |
| Dataset limpio | 636.568 filas × 27 columnas (91,85% conservado) |
| Dataset codificado | 636.568 × 71 |
| Taxi eliminado | 55.095 filas (7,95%, 100% de los nulos de precio) |
| Fechas con datos | 18 de 24 (14 completas) |
| Dataset de recargo | 255.953 cotizaciones de Lyft sin Shared · 20.975 con recargo (8,19%) |
| Recargo encarece | +46% en promedio (multiplicador medio ×1,46) · USD 8,73 de sobreprecio medio |
| Tasa de recargo por zona | 1,8% (North End) a 13,4% (Back Bay) |
| Cotizaciones gemelas | En el 95,7% de los grupos (ruta, minuto) todos los productos comparten el recargo |
| Partición | Train 25/11–14/12 (14 fechas) · Test 15–18/12 (4 fechas) |
| Precio · modelo | Random forest con surge · MAE USD 1,08 (IC 1,07–1,09) · R² 0,967 · 75% con error ≤ 10% |
| Precio · sin surge | MAE USD 1,32 · R² 0,928 |
| Precio · línea base | MAE USD 3,04 · R² 0,758 · 34% con error ≤ 10% |
| Recargo · modelo | Gradient boosting + pesos de clase · umbral 0,57 |
| Recargo · métricas | Accuracy 68,6% · acc. balanceada 60,8% · precisión 13,5% · recall 51,4% · F1 0,214 · ROC-AUC 0,676 · PR-AUC 0,140 |
| Recargo · línea base | "Siempre no": accuracy 91,7%, recall 0% · zona de origen: PR-AUC 0,118 |
| Matriz de confusión | VN 38.202 · FP 16.265 · FN 2.394 · VP 2.534 |
| Matriz de beneficio | VP +USD 7,73 · FP −USD 1 · precisión mínima 11,4% · USD 56 / 1.000 cotizaciones (IC 35–78) |
| Pesos de clase | 6,12 (recargo) vs 0,54 (sin recargo) |
| Búsquedas | 520 configuraciones de recargo (16 búsquedas) |
| Partición aleatoria | Infla el PR-AUC del random forest de 0,142 a 0,309 (+117%); CV mezclada +147% |
| K-Means | k = 3 · silueta 0,682 · inercia 2,00 |
| Deciles | Decil 1: 15,7% (1,9×) · 20% más riesgoso = 35% de los recargos · 50% más riesgoso = 74% |

### 9.5 Preguntas que probablemente haga la cátedra (y respuesta corta)

| Pregunta | Respuesta corta |
|---|---|
| ¿Por qué una accuracy de 68,6% es mejor que 91,7%? | Porque el 91,7% es de decir siempre "no" y detecta 0 recargos. Nuestro modelo detecta el 51% con accuracy balanceada 60,8% (azar 50%) y genera USD 56 cada 1.000 cotizaciones. |
| ¿Por qué no separar al azar? | Porque en el 95,7% de los grupos ruta–minuto todos los productos comparten el recargo; al azar, las "gemelas" quedan en train y test y el PR-AUC se infla hasta +147%. |
| ¿Por qué SMOTE no sirvió? | Interpola dummies y crea cotizaciones imposibles ("0,37 de Back Bay"); su PR-AUC en validación fue el peor. Pesos de clase usa solo datos reales. |
| ¿De dónde sale el umbral 0,57? | De maximizar el beneficio en la validación temporal (VP +7,73, FP −1); se aplica tal cual a la prueba. |
| ¿Por qué el recargo no supera ~0,68 de ROC-AUC? | Porque depende de pedidos y conductores en tiempo real, que no están en el dataset. Los cuatro algoritmos topan igual: el límite es la información, no el modelo. |
| ¿Por qué `log(price)`? | Asimetría 1,05 → −0,10; errores relativos; los atípicos son precios reales. |
| ¿Es legítimo usar `surge_multiplier` para el precio? | Sí, la app lo muestra al cotizar; igual se informa con y sin él (USD 1,08 vs 1,32). |
| ¿Por qué no imputaron el precio de Taxi? | Faltante estructural: Taxi cobra por taxímetro, no hay ninguna referencia para imputar. |
| ¿Por qué solo Lyft para el recargo? | En Uber el multiplicador vale siempre 1 (lo oculta en su *upfront pricing*); inferirlo por precio/milla acertaba solo el 61%. |
| ¿Por qué estandarizar en K-Means y no en árboles? | K-Means usa distancias; los árboles cortan una variable por vez y no dependen de la escala. |
| ¿Por qué los odds ratio con C = 1? | La C elegida (0,00003) encoge los coeficientes hacia 0 y los odds ratio hacia 1; para interpretar se usa una regularización débil. |
| Bagging vs boosting | Bagging (random forest) entrena árboles en paralelo y promedia: baja la varianza. Boosting entrena en serie, cada árbol corrige los errores del anterior: baja el sesgo. |

---

## 10. Glosario de conceptos y métricas

| Término | Significado en este proyecto |
|---|---|
| **Cotización** | Una consulta de precio a la app (no un viaje realizado). Es la unidad del dataset. |
| **Surge / prime time / recargo** | Multiplicador dinámico del precio cuando la demanda supera a la oferta (`surge_multiplier`). |
| **`has_surge`** | 1 si `surge_multiplier > 1`; objetivo de clasificación. |
| **Upfront pricing** | Precio cerrado que Uber muestra por adelantado; esconde el multiplicador (por eso vale siempre 1 en Uber). |
| **Fuga de datos (data leakage)** | Usar información que no estaría disponible al predecir o que contiene la respuesta (por ejemplo, usar `price` para predecir `has_surge`). |
| **Holdout temporal** | Separar las últimas fechas como prueba final, nunca usada para elegir. |
| **Validación temporal en orden** | Validar siempre con fechas posteriores a las de entrenamiento (`FechasEnOrden`). |
| **One Hot / Ordinal / Binaria** | Codificación de categorías sin orden, con orden y con dos valores. |
| **`drop_first` / categoría de referencia** | Quitar una dummy por grupo en modelos lineales para evitar la multicolinealidad perfecta. |
| **Regularización (L2, `alpha`, `C`)** | Penalizar coeficientes grandes para generalizar mejor. En Ridge, `alpha` grande = más regularización; en logística, `C` chica = más regularización. |
| **MAE / RMSE / MAPE / R²** | Error absoluto medio (USD) / raíz del error cuadrático medio (castiga errores grandes) / error relativo medio / proporción de la variación explicada. |
| **Error ≤ 10%** | Porcentaje de viajes cuyo precio se predice con un error de hasta 10%: lo más parecido a una "accuracy" en regresión. |
| **Accuracy (exactitud)** | (VP + VN) / total. Engañosa con clases desbalanceadas. |
| **Accuracy balanceada** | Promedio entre el acierto en cada clase (recall y especificidad); 50% = azar. |
| **Precisión** | VP / (VP + FP): de las alertas, cuántas eran recargos reales. |
| **Recall (sensibilidad)** | VP / (VP + FN): de los recargos reales, cuántos detectó. |
| **Especificidad** | VN / (VN + FP): de los sin recargo, cuántos acertó. |
| **F1** | Media armónica de precisión y recall. Macro: promedio simple por clase; weighted: ponderado por soporte. |
| **ROC-AUC** | Probabilidad de que el modelo puntúe más alto a una cotización con recargo que a una sin recargo. 0,5 = azar. |
| **PR-AUC** | Área bajo la curva Precisión-Recall; su azar es la tasa de positivos (≈ 0,083). Métrica principal con desbalance. |
| **Umbral de decisión** | Puntaje a partir del cual el modelo dice "con recargo". |
| **Matriz de beneficio** | Valor en dólares de cada casilla de la matriz de confusión; sirve para elegir el umbral con criterio de negocio. |
| **Submuestreo / SMOTE / pesos de clase** | Técnicas de balanceo: quitar mayoritarios / crear minoritarios sintéticos / pesar más los errores en la minoritaria. |
| **TargetEncoder** | Reemplaza una categoría (la ruta) por la tasa de la respuesta en el entrenamiento, con validación cruzada interna. |
| **Importancia por permutación** | Cuánto empeora el modelo al mezclar al azar un grupo de variables. |
| **Odds ratio** | Cuántas veces cambia la razón de chances de recargo frente a la categoría de referencia (South Station). |
| **Lift / deciles** | Cuántas veces la tasa real de un grupo supera al promedio, ordenando por riesgo. |
| **Bootstrap de bloques** | Remuestrear horas completas (no filas sueltas) para construir intervalos de confianza respetando la dependencia. |
| **K-Means / inercia / silueta** | Agrupamiento por distancias / suma de distancias al centro (codo) / qué tan separado está cada punto de otros grupos (−1 a 1). |
| **Random forest / gradient boosting** | Ensambles de árboles: en paralelo con promedio (bagging) / en serie corrigiendo errores (boosting). |

---

## 11. Inconsistencias detectadas en documentos anteriores

Para no repetirlas en la Entrega 4. **Usar siempre los valores del informe oficial y de `metricas.json`.**

| Documento | Qué dice | Valor correcto |
|---|---|---|
| `GUION_DEFENSA_SPRINT3.md` (sección 2) | "Back Bay aumenta la probabilidad de recargo un 29% respecto a South Station, mientras North End la reduce un 35%" | Esos valores salen de la logística **elegida** (C = 0,00003), que el propio informe dice que no se usa para interpretar. Con **C = 1**: Northeastern 1,29, Back Bay 1,22, North End 0,38 (−62%), Haymarket 0,37. |
| `GUION_DEFENSA_SPRINT3.md` (sección 2) | Árbol "con poda preventiva en profundidad 6" | El árbol de recargo elegido tiene **profundidad 12** y hojas de 500. |
| `GUION_DEFENSA_SPRINT3.md` (P3) | SMOTE hace caer el PR-AUC "a 0,113" | 0,113 es el PR-AUC en **prueba** del árbol con SMOTE. En validación, SMOTE dio 0,109 (árbol) y 0,116 (gradient boosting). |
| `GUION_DEFENSA_SPRINT3.md` (P4) | "Multiplicador promedio de 1,42" | En la Entrega 2 el multiplicador promedio con recargo es **×1,46**. El valor usado en la matriz es el **sobreprecio medio de USD 8,73**. |
| `modelos implementados.md` (2.1) | "UberPool presentaba NaN en `price`" | Los nulos eran **100% del producto Taxi**. |
| `modelos implementados.md` (2.3) | "Entrenamiento: días 1 al 16 de noviembre; validación 17 al 22" | Entrenamiento **25/11 al 14/12**; prueba **15 al 18/12**; 5 bloques de validación (ver 7.3). |
| `modelos implementados.md` (6.4) | Familia intermedia con USD 2,30–2,90 por milla; tarifas base "8 a 12" y "> 21" | Intermedio: **USD 3,01 a 4,54** por milla y base 7,8 a 12,3; Premium: **3,53 a 4,24** por milla y base 21,9 a 22,5. |
| `modelos implementados.md` y guion | "Producto y distancia explican más del 95% de la varianza" | El EDA da **~91,8%** (77,4% + 11,9% por separado); el modelo completo logra R² 0,967. Mejor decir "producto y distancia dominan". |
| `modelos implementados.md` (6.3) | Inercia "1,10 en k = 4" | **0,96** en k = 4. |
| `LEEME.md`, `README.md`, `Modelos/README.md` | Enlaces a `DEFENSA_PROFE.md`, `COMO_SE_PREDICE_EL_SURGE.md`, `EXPLICACION_KMEANS_PRODUCTOS.md` y `Cosas que hicimos en casa/` | Esos archivos se **eliminaron** en el commit `c8a02cc`; los enlaces quedaron rotos. |
| `informe_limpieza_y_variables.md` | "Ruta del dataset: `Contenido Entrega 2 y 3/…`" | La carpeta actual es `Contenido Entrega 2/DataSet Segunda Entrega Sin Codificar/`. |
| Entrega 2 | 406 distancias < 0,1 mi detectadas vs 348 eliminadas | No es contradicción: las 406 se midieron sobre el crudo y las 348 son las que quedaban tras sacar Taxi y duplicados. |

---

## 12. Mapa del repositorio y reproducibilidad

```text
uber-lyft-dataset/
├── README.md                                 ficha técnica del proyecto
├── Contexto.md                               ← este documento
├── Trabajo_Practico_Ciencia_Datos_UTN_5k1.pdf.pdf   consigna de la cátedra
├── Marco Teorico/                            guías teóricas de la cátedra
│   ├── 01_Calidad_Datos_y_ETL.md             6 dimensiones de calidad, nulos, outliers, encoding
│   ├── 02_EDA_Estadistica_y_Visualizacion.md  estadística, boxplot, feature engineering, PCA
│   ├── 03_Modelos_Supervisados_y_Balanceo.md  logística, árboles, RF, AdaBoost, desbalance, métricas
│   ├── 04_No_Supervisado_y_Mineria_Texto.md   K-Means, jerárquico, Apriori/FP-Growth, texto
│   └── 05_Guia_Trabajo_Practico_UTN.md        requisitos de las 4 entregas y rúbrica
├── Contenido Entrega 1/
│   ├── Entrega1_Grupo11.pdf                  informe oficial
│   ├── dataset.zip                           dataset crudo de Kaggle
│   ├── eda_initial.py · limpiar_dataset.py · feature_engineering.py
│   └── informe_limpieza_y_variables.md
├── Contenido Entrega 2/
│   ├── Entrega2_Grupo11.pdf                  informe oficial
│   ├── TPI_Ciencia_de_Datos_Sprint2_ETL.ipynb
│   ├── requirements.txt
│   ├── graficos/                             18 figuras
│   ├── DataSet Segunda Entrega Sin Codificar/dataset_nueva_columna.zip   (636.568 × 27)
│   └── Dataset Codificado/                   codificar_bd.py · dataset_codificado.zip (636.568 × 71) · explicación
└── Contenido Entrega 3/
    ├── LEEME.md · CAMBIOS_RESPECTO_VERSION_ANTERIOR.md · GUION_DEFENSA_SPRINT3.md/.pdf
    ├── modelos implementados.md/.pdf         guía teórica de los modelos (ver sección 11)
    ├── Modelos/README.md                     cómo se hizo cada modelo, paso a paso
    ├── 1_Informe/Entrega3_Grupo11.docx       informe oficial
    ├── 2_Presentacion_Colab/                 notebook ejecutado (14 celdas) + PDF
    ├── 3_Codigo/modelado_entrega3.py         genera 4_, 5_ y 6_ (partes A: recargo, B: precio, C: K-Means)
    ├── 4_Datasets/                           datasets de modelado y balanceados
    ├── 5_Graficos/                           fig01 a fig11
    ├── 6_Resultados/                         metricas.json + CSV (precio_*, recargo_*, productos_*)
    └── 7_Revision_version_preliminar/        qué se corrigió del borrador
```

**Reproducir la Entrega 3:**

```bash
pip install -r "Contenido Entrega 3/3_Codigo/requirements.txt"
python "Contenido Entrega 3/3_Codigo/modelado_entrega3.py"           # completo, ~15 min con 10 núcleos
python "Contenido Entrega 3/3_Codigo/modelado_entrega3.py" --rapido  # prueba en ~2 min
```

Lee `Contenido Entrega 2/Dataset Codificado/dataset_codificado.zip`, usa semilla fija (`SEED = 42`) y genera todo lo de `4_Datasets/`, `5_Graficos/` y `6_Resultados/`. Probado con Python 3.12, scikit-learn 1.9 e imbalanced-learn 0.14. Si hay poca memoria, bajar `N_JOBS_PESADO`.

**Dónde está cada número:** todas las métricas en `6_Resultados/metricas.json` (claves `A_*` = recargo, `B_*` = precio, `C` = K-Means). Búsquedas completas en `recargo_busqueda_*.csv` y `precio_busqueda_*.csv`.

**Herramientas:** Python (pandas, NumPy, scikit-learn, imbalanced-learn, matplotlib, seaborn, SciPy, PyArrow), Google Colab, OpenStreetMap Nominatim, Git/GitHub.

---

## 13. Referencias

- Cátedra de Ciencia de Datos (2026). *Trabajo Práctico Integral – Proyecto de Ciencia de Datos*. UTN FRC.
- Cátedra de Ciencia de Datos (2026). Material de clase: *EDA: el paso que puede cambiar por completo un proyecto de Data Science*; *Regresión logística* (Día 7); *Ajuste y balanceo de modelos, hiperparámetros* (Día 8); *Aprendizaje no supervisado: escoger la cantidad de clusters* (Clase 7). UTN FRC.
- Kaggle. *Uber and Lyft Dataset Boston, MA*. https://www.kaggle.com/datasets/brllrb/uber-and-lyft-dataset-boston-ma
- OpenStreetMap contributors. Nominatim (geocodificación). Licencia ODbL. https://nominatim.openstreetmap.org
- Schwaber, K. y Sutherland, J. (2020). *La Guía de Scrum*.
- Chapman, P. et al. (2000). *CRISP-DM 1.0: Step-by-step data mining guide*. SPSS Inc.
- Provost, F. y Fawcett, T. (2013). *Data Science for Business*. O'Reilly Media (cap. 7: matriz de beneficio y valor esperado).
- Tukey, J. W. (1977). *Exploratory Data Analysis*. Addison-Wesley.
- Kaufman, S., Rosset, S. y Perlich, C. (2012). Leakage in data mining: Formulation, detection, and avoidance. *ACM TKDD*, 6(4).
- Chawla, N. V. et al. (2002). SMOTE: Synthetic Minority Over-sampling Technique. *JAIR*, 16, 321–357.
- Saito, T. y Rehmsmeier, M. (2015). The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets. *PLoS ONE*, 10(3).
- Efron, B. y Tibshirani, R. J. (1993). *An Introduction to the Bootstrap*. Chapman & Hall.
- Breiman, L. (2001). Random Forests. *Machine Learning*, 45(1), 5–32.
- Friedman, J. H. (2001). Greedy function approximation: A gradient boosting machine. *Annals of Statistics*, 29(5), 1189–1232.
- Micci-Barreca, D. (2001). A preprocessing scheme for high-cardinality categorical attributes in classification and prediction problems. *ACM SIGKDD Explorations*, 3(1), 27–32.
- Pedregosa, F. et al. (2011). Scikit-learn: Machine Learning in Python. *JMLR*, 12, 2825–2830.
- Lemaître, G., Nogueira, F. y Aridas, C. K. (2017). Imbalanced-learn. *JMLR*, 18(17), 1–5.
