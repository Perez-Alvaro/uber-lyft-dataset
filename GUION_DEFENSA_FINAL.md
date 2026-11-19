# Guion de Defensa Oral y Anexo Técnico — Uber vs Lyft Boston (Grupo 11)

> **Ventana de defensa:** 10 minutos totales (~6:35 de exposición continua + ~3:25 para interrupciones y preguntas del jurado).  
> **Alineación:** Sigue el orden exacto de los **24 slides activos** en `Contenido Entrega 4/src/slides.jsx` (`01 portada` a `24 gracias`, incluyendo `22 valor-actores`) e integra la corrección sobre el costo de falsos negativos (`Contenido Entrega 3/8_Pruebas_critica_FN/`). En pantalla se muestran las **4 hipótesis consolidadas (`H1–H4`)**: `H1` hora ✗, `H2` categoría + distancia ✓, `H3` clima ✗, `H4` familias tarifarias ✓.

---

## Parte 1 — Guía de Defensa Oral

### Mapa de Bloques, los 24 Slides Activos y los 7 Criterios

| Bloque | Slides activos (`# id` — título exacto en `slides.jsx`) | Tiempo | Criterios cubiertos |
|---|---|---|---|
| **1** | `01 portada` (Portada) · `02 dominio` (Un dataset de cotizaciones) · `03 hipotesis-ini` (Qué define el precio y cuándo aparece el recargo) | `0:00–0:45` | **1. Introducción del dominio**, **2. Qué predecimos** (intro) |
| **2** | `04 limpieza` (Limpiar con criterio de dominio) · `05 utc` (La hora estaba en UTC) · `06 uber-esconde` (Uber esconde su recargo) | `0:45–1:40` | **5. Algo importante del ETL**, **6. Qué aporta el dominio** |
| **3** | `07 tratamiento` (Cómo preparamos el precio) · `08 tratamiento-recargo` (Cómo preparamos el recargo) | `1:40–2:20` | **2. Qué predecimos**, **5. Algo importante del ETL** |
| **4** | `09 clima-hora` (La hora no cambia el recargo) · `10 h-clima` (Con lluvia, el recargo no aumenta) · `11 h-zonas` (El recargo depende del lugar) · `12 h-formula` (El precio es una fórmula) | `2:20–3:15` | **3. Qué hallazgos encontramos** |
| **5** | `13 columnas` (De 57 a 27 columnas) | `3:15–3:35` | **5. Algo importante del ETL** |
| **6** | `14 m-desbalance` (Cómo aprender con 8% de recargos) · `15 m-recargo` (Por qué elegimos gradient boosting) | `3:35–4:30` | **4. Qué modelos usamos**, **6. Qué aporta el dominio** |
| **7** | `16 m-precio` (El precio se predice con un dólar de error) · `17 m-kmeans` (3 familias de tarifa) | `4:30–5:10` | **4. Qué modelos usamos**, **3. Qué hallazgos encontramos** |
| **8** | `18 v-asimetria` (No todos los errores cuestan lo mismo) · `19 v-fn` (Lo peor es decir sin recargo y que haya) · `20 v-umbral` (¿Cuándo conviene avisar?) | `5:10–6:05` | **7. Qué valor ofrecemos**, **6. Qué aporta el dominio** |
| **9** | `21 hipotesis` (Lo que creíamos y lo que encontramos) · `22 valor-actores` (Valor para el cliente, el conductor y la empresa) · `23 cierre` (Conclusión) · `24 gracias` (¡Gracias!) | `6:05–6:35` | **3. Qué hallazgos encontramos**, **7. Qué valor ofrecemos** |

---

<!-- BEGIN_ORAL_SCRIPT -->
### Bloque 1
**01–03** (`portada`, `dominio`, `hipotesis-ini`), **0:00–0:45** — **Criterios:** Introducción del dominio, Qué predecimos
- 693.071 cotizaciones
- 57 cols (clima)
- Precio, recargo, H1–H4

> "Buenas, somos el Grupo 11 y hoy comparamos Uber y Lyft en Boston. Trabajamos con 693.071 filas y 57 columnas de fines de 2018 en 12 barrios de la ciudad. Un punto clave del dominio: cada fila es una cotización que ofreció la app en ese instante, no un viaje realizado, y más de dos tercios de las columnas eran clima. Con esa base planteamos qué define el precio y cuándo aparece el recargo, ordenados en cuatro hipótesis iniciales sobre hora, categoría más distancia, lluvia y grupos tarifarios."

### Bloque 2
**04–06** (`limpieza`, `utc`, `uber-esconde`), **0:45–1:40** — **Criterios:** Algo importante del ETL, Qué aporta el dominio
- 636.568, sin Taxis
- UTC−5
- Solo Lyft

> "En el ETL conservamos el 91,8% de los datos: 636.568 filas limpias tras quitar duplicados y distancias imposibles. El descarte principal fueron 55.095 Taxis sin precio; por conocimiento del dominio sabemos que en Boston cobran por taxímetro regulado, así que imputarlos habría sido inventar tarifas. Además descubrimos que la hora estaba en UTC aunque decía Boston; al pasarla a UTC menos 5, el pico de las 8 dejó de figurar a las 13. Y como Uber usa precio cerrado sin mostrar multiplicador —deducirlo acertaba solo el 61%—, estudiamos el recargo únicamente en Lyft."

### Bloque 3
**07–08** (`tratamiento`, `tratamiento-recargo`), **1:40–2:20** — **Criterios:** Qué predecimos, Algo importante del ETL
- `log(price)`
- `has_surge` 8,2%
- Sin fuga

> "Predecimos dos variables concretas. Primero, el precio en dólares mediante regresión sobre 636.568 cotizaciones: como pocos viajes caros estiraban la cola hasta 97,5 dólares, aplicamos logaritmo para volverla casi simétrica, de 1,05 a −0,10, y medir errores en proporción al viaje. Segundo, el recargo como clasificación binaria en 255.953 viajes de Lyft sin Shared: agrupamos los seis multiplicadores en sí o no, con 8,2% positivo. Para evitar fuga de datos, nunca usamos el precio final ni el multiplicador como entrada al predecir recargo."

### Bloque 4
**09–12** (`clima-hora`, `h-clima`, `h-zonas`, `h-formula`), **2:20–3:15** — **Criterios:** Qué hallazgos encontramos
- H1 ✗ hora
- H3 ✗ lluvia
- Back Bay 7,3×; H2 ✓

> "Los hallazgos derribaron dos intuiciones muy comunes en la calle. Primero, la hora casi no cambia el recargo: oscila entre 7,0% y 9,6%, así que H1 no se cumple. Segundo, con lluvia tampoco aumenta: en Lyft aparece en 7,9% frente a 8,3% sin lluvia, y en el precio la correlación climática es prácticamente nula; H3 también cae. Lo que sí pesa en recargos es el lugar: salir de Back Bay multiplica por 7,3 la frecuencia frente a North End. En precio se confirma H2: categoría del servicio (77,4%) y distancia (11,9%) explican casi todo."

### Bloque 5
**13** (`columnas`), **3:15–3:35** — **Criterios:** Algo importante del ETL
- 57 → 27 cols
- −41, +11 nuevas
- Hora local, OSM

> "Como cierre del ETL pasamos de 57 a 27 columnas limpias. Sacamos 41 columnas entre clima repetido o diario, horas en UTC, coordenadas de la estación meteorológica y copias exactas, y creamos 11 nuevas con valor predictivo, como hora local, lluvia, nivel de servicio equivalente entre plataformas, distancia en línea recta medida con OpenStreetMap y la variable objetivo has_surge."

### Bloque 6
**14–15** (`m-desbalance`, `m-recargo`), **3:35–4:30** — **Criterios:** Qué modelos usamos, Qué aporta el dominio
- Pesos ×11
- Split temporal 95,7%
- Gradient Boosting

> "Con solo 8,2% de recargos, no balancear hace que el modelo diga siempre no y acierte 91,7% sin detectar nada. Descartamos submuestreo porque tiraba 91% de las filas y SMOTE porque inventaba zonas fraccionarias; elegimos pesos de clase reales. Además validamos por fecha porque el 95,7% de cotizaciones en la misma ruta y minuto comparten recargo, evitando fuga de datos. Probamos logística, árbol, random forest y elegimos Gradient Boosting: cada árbol corrige al anterior y lideró la validación temporal con 0,136 de PR-AUC."

### Bloque 7
**16–17** (`m-precio`, `m-kmeans`), **4:30–5:10** — **Criterios:** Qué modelos usamos, Qué hallazgos encontramos
- RF USD 1,08
- Sin surge 1,32
- K-Means 3 familias

> "Para estimar el precio comparamos línea base, Ridge, árbol y elegimos Random Forest: en prueba ciega logra un error medio de 1,08 dólares, R cuadrado de 0,967 y 75% de estimaciones dentro del 10%. Sin conocer el multiplicador de recargo al cotizar, el error sube a 1,32 dólares. Luego aplicamos K-Means no supervisado sobre tarifa base y precio por milla y confirmamos H4: los 12 productos forman tres familias espejo —Económico, Intermedio y Premium— entre ambas plataformas de Boston."

### Bloque 8
**18–20** (`v-asimetria`, `v-fn`, `v-umbral`), **5:10–6:05** — **Criterios:** Qué valor ofrecemos, Qué aporta el dominio
- FN −8,73 vs FP −1
- Umbral 0,35 (10%)
- NPV 97,3%; −113/1k

> "Acá integramos la corrección clave sobre falsos negativos. Decir sin recargo cuando sí hay cuesta al pasajero 8,73 dólares promedio más confianza rota, frente a un dólar supuesto de falsa alarma: esa diferencia pesa como 16,5 falsas alarmas. Al cambiar el falso negativo de cero a menos 8,73, el umbral óptimo en validación bajó de 0,57 a 0,35 sin reentrenar. En prueba, los recargos que se escapan cayeron del 47% al 10%, el sin recargo acierta el 97,3% y el costo neto baja de 725 a 113 dólares cada mil cotizaciones."

### Bloque 9
**21–24** (`hipotesis`, `valor-actores`, `cierre`, `gracias`), **6:05–6:35** — **Criterios:** Qué hallazgos encontramos, Qué valor ofrecemos
- 2/4 confirmadas
- 3 actores
- Cierre

> "En balance final confirmamos dos de cuatro hipótesis: categoría y distancia definen el precio y existen tres familias tarifarias, mientras hora y lluvia no mueven el recargo. Esto aporta valor concreto a todo el ecosistema de movilidad: el pasajero evita sobreprecios medios de 8,73 dólares comparando apps o esperando; el conductor ubica barrios con siete veces más recargo; y la plataforma estima tarifas con un dólar de error anticipando nueve de cada diez recargos. Muchas gracias, quedamos abiertos a todas sus preguntas sobre el proyecto."
<!-- END_ORAL_SCRIPT -->

---

## Parte 2 — Anexo Técnico de Defensa (Alineado a la Landing)

> **Uso en vivo:** Guías cortas ligadas a las **slides de `Contenido Entrega 4`** (`01` a `24`) y auditadas contra `metricas.json` y `resultados_costo_fn.json`. Ideal para responder en **15–20 segundos** señalando la pantalla.

---

### Anexo 1 — Matriz de Confusión y Crítica FN (`Slides 18 v-asimetria` y `19 v-fn`)

**En pantalla (`Slide 19`):** Alternás el botón **`Antes · 0,57` / `Después · 0,35`** sobre las mismas predicciones de *HistGradientBoosting* en el test ciego (`15–18/12/2018`: **`59.395`** cotizaciones de Lyft sin Shared; `54.467` sin recargo y `4.928` con recargo = `8,30%`). Sin reentrenar: solo cambia el corte de decisión tras darle costo al Falso Negativo.

| Métrica en Prueba (`n = 59.395`) | Antes (`FN = USD 0`, `@0,57`) | Después (`FN = −USD 8,73`, `@0,35`) | Qué señalás en pantalla |
|---|---:|---:|---|
| **VN** / **FP** (sobre `54.467` normales) | `37.791` / `16.676` | `17.738` / `36.729` | Más falsas alarmas (`−USD 1` supuesto) para proteger al pasajero |
| **FN** (se escapó) / **VP** (avisado) | `2.329` / `2.599` | **`491`** / **`4.437`** | Los recargos sorpresa caen de casi la mitad a menos de 500 |
| **% Recargos que se escapan (`FN / ConRecargo`)** | `47,3%` *(IC: 44,3–50,1%)* | **`10,0%`** *(IC: 8,6–11,5%)* | Pasa de perder **1 de cada 2** a solo **1 de cada 10** |
| **Recall (`VP / ConRecargo`)** | `52,7%` | **`90,0%`** | Anticipa **9 de cada 10** recargos reales |
| **NPV (`VN / (VN + FN)`) — Acierta *"no"*** | `94,2%` *(IC: 93,8–94,6%)* | **`97,3%`** *(IC: 96,9–97,7%)* | Cuando dice *"sin recargo"*, acierta el **`97,3%`** (`17.738 / 18.229`) |
| **Cotizaciones con aviso / Precisión** | `32,5%` / `13,5%` | `69,3%` / `10,8%` | Avisa en 7 de cada 10; precisión supera la tasa base (`8,3%`) |
| **Accuracy / Accuracy Balanceada** | `68,0%` / `61,1%` | `37,3%` / **`61,3%`** | Regla muda *"siempre no"* da `91,7%` acc con **`0%` recall** y `50%` bal. |

*(Nota de reproducibilidad: el corte original de E3 con `FN=0` era `0,5722` con `38.202 VN`, `16.265 FP`, `2.394 FN`, `2.534 VP`, `51,4%` recall y `+USD 56,11/1k`; la tabla usa la corrida controlada de `8_Pruebas_critica_FN` sobre las mismas predicciones exactas, `PR-AUC = 0,1401`.)*

| Sensibilidad al Costo del FN | `USD 0` (antes) | `USD 4,37` (mitad) | **`USD 8,73` (principal ★)** | `USD 17,47` (doble) |
|---|---:|---:|---:|---:|
| Umbral (val) / % Se escapan / Avisa en / NPV | `0,57` · `47,3%` · `32,5%` · `94,2%` | `0,42` · `15,5%` · `60,1%` · `96,8%` | **`0,35` · `10,0%` · `69,3%` · `97,3%`** | `0,17` · `1,4%` · `89,5%` · `98,9%` |

---

### Anexo 2 — Modelos Usados y Por Qué Elegimos Gradient Boosting (`Slides 14` a `17`)

- **En `Slide 14` (`m-desbalance`, balanceo + split temporal):** Con solo `8,2%` de positivos (`16.047` con recargo vs `180.511` sin recargo en train), elegimos **`class_weight="balanced"`** ($w_1 = \mathbf{6,12}$, $w_0 = \mathbf{0,54}$, pesa **`11,25×`** más errar un recargo; `PR-AUC val = 0,136`) frente a *Submuestreo* (`0,130`, tira `91%` de datos) y *SMOTE* (`0,116`, interpola dummies One-Hot creando valores imposibles como *"0,37 de Back Bay"*). Validamos por fecha (`25/11–14/12` train en bloques `FechasEnOrden` / `15–18/12` test) porque en el **`95,7%`** de los grupos `(ruta, minuto)` todos los productos comparten recargo: mezclar fechas al azar inflaba el `PR-AUC` de Random Forest hasta **`+147%` (`0,312`)**.
- **En `Slide 15` (`m-recargo`, botones `Validación / Prueba / Curvas`):** Usá **`Validación`** para mostrar por qué ganó Gradient Boosting (`0,136`); en **`Prueba`** aclarás que queda empatado con RF (`0,140` vs `0,142`) sin cambiar la decisión previa; y en **`Curvas`** mostrás `PR-AUC 0,140` (`~70%` sobre el azar de `0,083`), ya que con `54.467` negativos la curva ROC (`0,677`) diluye las falsas alarmas.

| Eje y Slide | Modelo (Hiperparámetros Clave) | Qué hace en simple | Val | Prueba Ciega | Estado |
|---|---|---|---:|---:|---|
| **Recargo** (`S15`) | *Líneas base:* Siempre "no" / Tasa zona | Dice `0` siempre / Frecuencia del barrio | — | `PR 0,083` / `0,118` | Referencias |
| **Recargo** (`S15`) | Regresión Logística (`L2, C=3e-5 / C=1`) | Frontera lineal + Odds Ratios (Northeastern `1,29` vs North End `0,38`, ref. South Station `8%`) | `PR 0,120` | `PR 0,121` · `ROC 0,651` | Descartado |
| **Recargo** (`S15`) | Árbol de Decisión (`gini, prof. 12, hoja 500`) | Reglas sí/no (5/7 de ruta, 2/7 distancia); sin poda (`prof. 40`) memorizaba (`0,427→0,103`) | `PR 0,125` | `PR 0,138` · `ROC 0,672` | Descartado |
| **Recargo** (`S15`) | Random Forest (`150 árb., prof. 24, hoja 10`) | Bagging paralelo (`sqrt`); memoriza train (`0,510→0,126`) | `PR 0,126` | `PR 0,142` · `ROC 0,675` | Descartado |
| **Recargo** (`S15`) | **`HistGradientBoosting` (`200 árb., lr 0,05, 15 hojas, L2 1`)** | **Boosting en serie** sobre histogramas ($\mathcal{O}(n)$); cada árbol corrige errores del previo | **`PR 0,136`** | **`ROC 0,677` · `PR 0,140` · `Rec 90,0%`** | **★ Campeón** |
| **Precio** (`S16`) | Línea base / Ridge (`α=1000`) / Árbol (`p.18, h.20`) | Mediana / lineal L2 / escalones (`log(price)`) | `RMSE 0,138 / 0,134` | `MAE 3,04 / 1,39 / 1,09` | Referencias |
| **Precio** (`S16`) | **Random Forest (`150 árb., prof. 16, hoja 5, f=0,5`)** | Promedia árboles; explica `75%` de viajes ≤10% error (sin surge: `MAE USD 1,32`) | **`RMSE 0,127`** | **`MAE USD 1,08` · `R² 0,967`** | **★ Campeón** |
| **Segmentos** (`S17`) | **K-Means (`k=3, StandardScaler, n_init=50`)** | Agrupa 12 productos por base + USD/milla (`s=0,682`, codo `2,00`): Eco `3,3–6,4`, Med `7,8–12,3`, Prem `21,9–22,5` | — | **Silueta `0,682`** | **★ 3 Familias** |

- **Por qué elegimos Gradient Boosting en 4 argumentos clave:**
  1. **Sin *data snooping*:** Ganó en **validación temporal** (`0,136 ± 0,012` vs `0,126 ± 0,006` RF) antes de tocar la prueba ciega (`15–18/12`).
  2. **Mucho menor sobreajuste:** RF memorizaba el entrenamiento (`0,510` train vs `0,126` val); Gradient Boosting regula con hojas chicas (`15`) y paso suave ($\eta=0,05$: `0,240` train vs `0,136` val).
  3. **Gana con la matriz corregida (`@0,35`):** Deja escapar menos recargos (**`10,0%`** vs `13,2%` RF), logra mayor **Recall (`90,0%` vs `86,8%`)**, mayor **NPV (`97,3%` vs `97,0%`)** y mejor **`ROC-AUC` (`0,6766`)**.
  4. **Boosting vs. Bagging + techo `~0,68`:** Bagging (RF) baja varianza en paralelo; Boosting baja sesgo corrigiendo residuos en serie. Los 4 modelos topan en `~0,68` ROC porque falta oferta/demanda GPS en tiempo real.

---

### Anexo 3 — Matriz de Beneficio y Valor Agregado (`Slides 18`, `20 v-umbral` y `22 valor-actores`)

**En pantalla (`Slide 20`):** Tocá **`Antes · 0,57`** y volvé a **`Elegido · 0,35`** mirando la línea roja **`"Sin avisos"`** (`−USD 724,64 / 1.000`) y el celular **`+USD 7,73 por aviso correcto`**:

| Escenario | `VN` | `FP` (supuesto) | `FN` | `VP` (`8,73−1`) | Chance mín. equilibrio | Umbral (val) | Resultado / `1.000` cotiz. |
|---|---:|---:|---:|---:|---|---|---|
| **Original E3 (`FN = USD 0`)** | `0` | `−USD 1,00` | `0` | **`+USD 7,73`** | `1 / 8,73 = 11,45%` | `0,57` (`0,5722`) | `+USD 56,11` *(IC: 35–78)* |
| **Corregida FN (`FN = −8,73`) ★** | `0` | `−USD 1,00` | **`−USD 8,73`** | **`+USD 7,73`** | `1 / 17,47 = 5,72%` | **`0,35`** (`0,3464`) | **`−USD 112,84`** vs `−USD 724,64` sin modelo |

- **Dato real vs. supuestos:** Los **`USD 8,73`** (`×1,46` promedio) salen directo de `16.047` recargos reales en entrenamiento. Son **supuestos explícitos** la falsa alarma (`FP = −USD 1,00`, ~5 min comparando) y la penalización extra por confianza rota del FN (`−USD 8,73`). Por eso **1 FN pesa como `16,5` falsas alarmas** (`7,73 − (−8,73) = USD 16,47`), reduciendo a la mitad la probabilidad real mínima que justifica avisar (`11,45% → 5,72%`, que por los pesos `×11` cae en `0,35`, tasa real `5,89%`).
- **¿Por qué da `−USD 112,84`? (Escudo anti-trampa):** No es que el modelo pierda plata: sin modelo ("siempre no"), los `4.928` recargos reales causan **`−USD 724,64` cada 1.000 cotizaciones**. Al umbral `0,35` bajamos ese daño en **`+USD 611,80 / 1.000` (`−84,4%`)** y superamos a la heurística de zona (`−USD 126,01/1k`). Además, el **Top 20% de riesgo** concentra el **`35%`** de los recargos (Decil 1: `15,7%`, `1,9×`).
- **Valor en `Slide 22` (`valor-actores`):** **Cliente:** evita `USD 8,73` en el `90%` de recargos (`97,3%` fiable si dice *"no"*), elige `Shared` (`0%` surge, `−29%` vs `UberPool`), usa Lyft en económicos y Uber en Black (`−8%`), y no espera por lluvia/hora (`Slide 10`). **Conductor:** prioriza barrios con **`7,3×`** más recargo (**Back Bay `13,4%`**, Northeastern `12,5%`, Fenway `12,3%` vs North End `1,8%`). **Empresa:** cotiza a `USD 1,08` MAE y reduce sorpresas de `47%` a `10%`. *(Equivalencia `Slide 21`: las 4 hipótesis en pantalla `H1–H4` consolidan las 6 de E1–E3; solo se suman Uber vs Lyft por nivel ✓ y viajes cortos caros por tarifa base ✓).*

---

### Anexo 4 — Analogías Express y Top 10 Repreguntas (Con Slide de Respaldo)

**Cinco analogías rápidas:** **1) Detector de humo (`S19–S20`):** apagarlo da `92%` de acierto sin detectar incendios; al temer quemarnos (`−8,73`), bajamos la perilla de `0,57` a `0,35`. **2) Balanza trucada (`S14`):** `class_weight` hace pesar `11×` más un recargo sin inventar viajes como SMOTE. **3) Consejo de 150 tasadores (`S16`):** *Bagging* promedia errores independientes. **4) Alpinista en la niebla (`S15`):** *Boosting* corrige errores paso a paso ($\eta=0,05$). **5) Taxímetro digital (`S12`):** tarifa base + distancia; ni lluvia ni hora la mueven.

1. **(`Slide 19`) ¿Por qué bajó el Accuracy a `37,3%` si decir siempre "no" daba `91,7%`?**
   > *"Porque `91,7%` con `0%` de recall es no avisar nunca. Para blindar contra falsos negativos avisamos más (`69,3%`), capturando el **`90,0%`** de recargos y subiendo la **Accuracy Balanceada a `61,3%`** (azar = `50%`)."*
2. **(`Slide 19`) ¿De dónde sale el `97,3%` cuando dice "sin recargo"?**
   > *"Es el **NPV**: sobre `18.229` veces que predijo 'sin recargo' en test, acertó `17.738` (`VN`) y falló solo `491` (`FN`). `17.738 / 18.229 = 97,3%` (antes era `94,2%`)."*
3. **(`Slide 20`) ¿Por qué el costo neto da negativo (`−USD 112,84 / 1k`)? ¿Perdemos plata?**
   > *"No: sin modelo, los `4.928` recargos de la calle generan un daño de **`−USD 724,64 / 1k`** (la línea roja). Con el umbral `0,35` reducimos esa pérdida a **`−USD 112,84`**, ahorrando **`+USD 611,80` cada 1.000 cotizaciones (`−84%`)**."*
4. **(`Slide 15`) ¿Por qué Gradient Boosting si en Prueba Random Forest dio `0,142` vs `0,140`?**
   > *"Elegimos en **validación temporal** sin tocar test, y ahí GB ganó (`0,136` vs `0,126`). RF sobreajustaba (`0,510→0,126`) y, ya bajo `FN = −8,73`, GB deja escapar menos recargos (`10,0%` vs `13,2%`) con mejor NPV (`97,3%`)."*
5. **(`Slide 15`) ¿Diferencia entre Bagging (RF) y Boosting (GB), y por qué topan en `ROC ~0,68`?**
   > *"Bagging promedia árboles en paralelo para bajar **varianza**; Boosting encadena árboles chicos corrigiendo residuos para bajar **sesgo**. Topan en `~0,68` porque faltan choferes y pedidos GPS en tiempo real (y en desbalance priorizamos `PR-AUC 0,140`, `+70%` sobre el azar `0,083`)."*
6. **(`Slide 20`) ¿Qué valores de la matriz son reales y cuáles supuestos, y por qué el umbral bajó a `0,35`?**
   > *"Los `USD 8,73` (`×1,46`) salen de `16.047` recargos reales; `FP = −USD 1` y la confianza rota `−USD 8,73` son supuestos. Eso reduce a la mitad la chance mínima para avisar (`11,45% → 5,72%`), que con pesos `×11` cae en `0,35`."*
7. **(`Slide 14`) ¿Por qué falló SMOTE y por qué validaron por fecha?**
   > *"SMOTE interpola dummies y crea zonas imposibles como '0,37 de Back Bay' (`PR 0,116`); pesos usa datos reales (`0,136`). Y por el **`95,7%`** de cotizaciones gemelas `(ruta, minuto)`, un split aleatorio infla RF **`+147%`** (`0,312`)."*
8. **(`Slide 15`) ¿Cómo se leen los Odds Ratios (`1,29` / `0,38`) en Logística?**
   > *"Con `C = 1` (la elegida `C = 3e-5` encoge coeficientes) frente a **South Station** (`8%`), salir de Northeastern sube `+29%` la chance relativa (`OR 1,29`) y de North End la baja `62%` (`0,38`)."*
9. **(`Slides 07` y `17`) ¿Por qué `log(price)` en regresión y `StandardScaler` en K-Means pero no en árboles?**
   > *"`log(price)` baja la asimetría (`1,05 → −0,10`) y mide errores proporcionales. Los árboles son invariantes a escala; K-Means usa distancia euclidiana y sin escalar la base (`USD 3–22`) taparía el USD/milla (`1,2–4,5`)."*
10. **(`Slides 04–06`) ¿Por qué eliminaron `55.095` Taxis y dejaron Uber fuera del recargo?**
    > *"En Boston el taxi va por taxímetro (`100%` nulos reales): imputarlo inventaría precios. Uber es precio cerrado (`surge = 1,0` siempre; inferirlo acertaba `61%`), así que `has_surge` solo usa Lyft sin Shared (`255.953`)."*
