# Modelos de la Entrega 3: cómo hicimos cada cosa

Grupo 11 · Ciencia de Datos 5K1 · UTN FRC · Uber y Lyft en Boston

Este documento explica paso a paso cómo armamos, probamos y elegimos los modelos de la Entrega 3. Todos los números salen de [`../6_Resultados/metricas.json`](../6_Resultados/metricas.json) y el código está en [`../3_Codigo/modelado_entrega3.py`](../3_Codigo/modelado_entrega3.py) (partes A, B y C).

---

## Resumen en una tabla

| Objetivo | Tipo | Modelos probados | Ganador (elegido por validación) | Resultado en la prueba |
|---|---|---|---|---|
| **`price`**: cuánto cuesta el viaje | Regresión | Ridge, árbol de decisión y random forest, cada uno con y sin `surge_multiplier` | **Random forest con surge** | Error medio USD 1,08 · R² 0,967 · 75% de los viajes con error ≤ 10% |
| **`has_surge`**: si la cotización tiene recargo | Clasificación binaria | Regresión logística, árbol de decisión, random forest y gradient boosting, cada uno con 4 técnicas de balanceo | **Gradient boosting con pesos de clase** (umbral de la matriz de beneficio) | Detecta el 51,4% de los recargos · precisión 13,5% (azar 8,3%) · accuracy 68,6% · accuracy balanceada 60,8% · USD 56 de beneficio cada 1.000 cotizaciones |
| **Productos**: segmentos tarifarios | Clustering (no supervisado) | K-Means con k de 2 a 6 | **k = 3** (silueta 0,68) | 3 familias de tarifa: económico, intermedio y premium |

---

## 1. Punto de partida: los datos

Partimos del **dataset codificado de la Entrega 2** (`Contenido Entrega 2/Dataset Codificado/dataset_codificado.zip`): 636.568 filas y 71 columnas, todas numéricas.

Sobre ese dataset agregamos cuatro variables:

| Variable | Qué es | Por qué |
|---|---|---|
| `hour_sin`, `hour_cos` | Seno y coseno de la hora | La hora es cíclica: las 23 h están al lado de las 0 h. Si se usa la hora como número, un modelo lineal cree que están lejos. |
| `log_distance` | Logaritmo de la distancia | La tarifa no crece en línea recta con la distancia; en escala log la relación es más pareja. |
| `log_surge` | Logaritmo del `surge_multiplier` | Como el precio se modela en log, el multiplicador entra sumando: log(precio × surge) = log(precio) + log(surge). |
| `ruta` | Par origen → destino (por ejemplo, "Back Bay → Fenway") | Para calcular la **tasa histórica de recargo de cada ruta** en el modelo de `has_surge` (ver sección 4.2). |

Para el servicio usamos las **12 columnas `name_*`** (un producto por columna). Dejamos afuera `is_uber` y `service_tier_ord`, porque el producto ya las determina y usar las tres codificaciones juntas sería repetir la misma información.

---

## 2. Cómo separamos los datos: siempre por fecha

### Por qué no separar al azar

En la Entrega 2 medimos que, en el 95,7% de los grupos (ruta, minuto), todos los productos tienen el mismo valor de `has_surge`. Si se separan las filas al azar, cotizaciones "gemelas" del mismo minuto y la misma ruta quedan una en entrenamiento y otra en prueba. El modelo las reconoce y parece mucho mejor de lo que es.

Lo comprobamos: con partición al azar, el random forest de recargo parece **más del doble de bueno** (PR-AUC 0,309 contra 0,142 por fecha).

### Dos niveles de separación

**1. Prueba final (holdout temporal).** Es como simular el uso real: aprender del pasado y predecir días que el modelo nunca vio. **No se usa para elegir nada.**

| Partición | Fechas | `price` (Uber + Lyft) | `has_surge` (Lyft sin Shared) | Tasa de recargo |
|---|---|---:|---:|---:|
| Entrenamiento | 25/11 al 14/12/2018 (14 fechas) | 488.074 | 196.558 | 8,16% |
| Prueba | 15/12 al 18/12/2018 (4 fechas, sábado a martes) | 148.494 | 59.395 | 8,30% |

**2. Validación temporal en orden (dentro del entrenamiento).** Sirve para elegir los hiperparámetros, la técnica de balanceo, el umbral y el modelo final. Las 14 fechas de entrenamiento se agrupan en 5 bloques consecutivos, y en cada vuelta (fold) se entrena con los bloques anteriores y se valida con el siguiente:

| Bloque | Fechas | Cotizaciones (`has_surge`) | Uso |
|---|---|---:|---|
| 1 | 25/11 al 26/11 | 17.875 | Solo entrenamiento |
| 2 | 27/11 al 28/11 | 58.291 | Valida el fold 1 (entrena con el bloque 1) |
| 3 | 29/11 al 30/11 | 33.141 | Valida el fold 2 (entrena con los bloques 1 y 2) |
| 4 | 01/12 al 02/12 | 33.319 | Valida el fold 3 (entrena con los bloques 1 a 3) |
| 5 | 03/12 al 14/12 | 53.932 | Valida el fold 4 (entrena con los bloques 1 a 4) |

Así **nunca se valida con fechas anteriores a las de entrenamiento**. El puntaje de validación de cada configuración es el promedio de los 4 folds. En el código es la clase `FechasEnOrden`.

**3. Validación cruzada mezclada (control).** Además corrimos una validación cruzada estratificada de 5 folds **con mezcla** sobre el entrenamiento, también con el balanceo aplicado solo a los folds de entrenamiento y cada fold evaluado con datos reales. No se usa para elegir: sirve para medir cuánto se inflan las métricas cuando se mezclan fechas.

| Modelo (pesos de clase) | CV temporal en orden (4 folds) | CV mezclada (5 folds) | Diferencia |
|---|---:|---:|---:|
| Regresión logística | 0,120 ± 0,004 | 0,126 ± 0,003 | +5% |
| Árbol de decisión | 0,125 ± 0,014 | 0,150 ± 0,005 | +20% |
| Random forest | 0,126 ± 0,006 | 0,312 ± 0,005 | +147% |
| Gradient boosting | 0,136 ± 0,012 | 0,178 ± 0,003 | +31% |

PR-AUC promedio ± desvío entre folds. La mezcla hace parecer mejores a todos los modelos, sobre todo al random forest, que memoriza cotizaciones "gemelas". Por eso se elige con la temporal.

---

## 3. Preparación de las variables según el tipo de modelo

| | Modelos lineales (Ridge, logística) | Modelos de árboles (árbol, random forest, gradient boosting) |
|---|---|---|
| **Dummies** | Cada grupo one-hot pierde una columna de referencia (equivale a `drop_first`), para evitar la multicolinealidad perfecta | Usan todas las columnas |
| **Categorías de referencia** | Zona **South Station** (su tasa de recargo, 8,0%, es la del promedio), producto **Lyft** (en `has_surge`) o **UberX** (en `price`), franja **Mañana** y clima **Clear** | No aplica |
| **Escalado** | `StandardScaler`: necesario para que la regularización trate igual a todas las variables | También se escala en el pipeline de `has_surge` (no les cambia nada a los árboles, pero SMOTE lo necesita porque usa distancias) |

Elegimos South Station como referencia a propósito: como su tasa de recargo es la promedio, un odds ratio se lee directamente como "más o menos chance de recargo que una zona típica".

Todo el preprocesamiento vive **dentro de un pipeline**, así que en cada fold se ajusta solo con las filas de entrenamiento de ese fold.

---

## 4. Objetivo 2: `has_surge` (clasificación)

Lo explicamos primero porque es el más largo. Una explicación más simple, para todo el equipo, está en [`../COMO_SE_PREDICE_EL_SURGE.md`](../COMO_SE_PREDICE_EL_SURGE.md).

### 4.1 Qué datos usa

- **Solo Lyft sin Shared:** 255.953 cotizaciones. Uber no informa su multiplicador (usa *upfront pricing*) y Shared nunca tiene recargo.
- **Solo el 8,19% tiene recargo** (20.975 cotizaciones): hay 11 sin recargo por cada una con recargo.
- **60 predictoras:** zona de origen y destino, tasa histórica de la ruta, distancia, producto, hora, día, franja y clima.
- **Fuera, por fuga de datos:** `price` y `surge_multiplier`. Las dos contienen la respuesta (el precio ya incluye el recargo). Si se las diéramos, el modelo "haría trampa" (decisión D15 de la Entrega 2).

### 4.2 La tasa histórica de recargo de la ruta

Es el porcentaje de cotizaciones con recargo que tuvo cada par origen → destino. Se calcula con `TargetEncoder` **dentro del pipeline**: en cada ajuste usa solo las filas de entrenamiento, con una validación cruzada interna. Así el modelo nunca ve la respuesta de las filas que tiene que predecir.

Probamos cada modelo con y sin esta variable. La diferencia en validación fue de 0,003 de PR-AUC como máximo, porque los modelos ya captaban la ruta combinando las dummies de origen y destino. La dejamos porque no empeora los resultados y deja explícita la información de cada ruta.

### 4.3 Las líneas base: contra qué comparamos

| Línea base | Accuracy | Accuracy balanceada | Recall | PR-AUC |
|---|---:|---:|---:|---:|
| Decir siempre "sin recargo" | **91,7%** | 50,0% | 0% | 0,083 |
| Decir siempre "con recargo" | 8,3% | 50,0% | 100% | 0,083 |
| Decir "con recargo" al azar, con la tasa real | 85,0% | 50,1% | 8,2% | 0,083 |
| Tasa histórica de recargo de la zona de origen (sin modelo) | 66,0% | 58,7% | 50,0% | 0,118 |

Decir siempre "no" ya acierta el 91,7%. La referencia más exigente es la **tasa de la zona de origen**: sin ningún modelo, ordenar las cotizaciones por el recargo histórico de la zona ya da PR-AUC 0,118. Los modelos llegan a 0,14: aprenden algo más que "dónde sube", pero no mucho más. Por eso la accuracy sola engaña y la informamos **siempre junto a la línea base y a la accuracy balanceada** (promedio del acierto en cada clase; 50% = azar).

### 4.4 Los cuatro algoritmos y los hiperparámetros que probamos

Cada algoritmo se probó con una **búsqueda en grilla** (`GridSearchCV`) con la validación temporal en orden. La métrica para elegir fue el **PR-AUC en validación**: se concentra en la clase minoritaria y su valor de azar es la tasa de recargo (≈ 0,08). Las grillas se **extendieron hasta que el valor elegido quedara adentro** y no en un extremo: si el mejor valor es el borde de la grilla, el óptimo podría estar más allá y el parámetro no quedaría justificado.

| Algoritmo | Por qué lo elegimos | Fijo | Hiperparámetros probados | Combinaciones | Elegido (pesos de clase) |
|---|---|---|---|---:|---|
| **Regresión logística** | Modelo base de clasificación de la cátedra; da probabilidades y odds ratio interpretables | Penalización L2, `lbfgs`, 3000 iteraciones | `C`: 0,00001 · 0,00003 · 0,0001 · 0,0003 · 0,001 · 0,01 · 0,1 · 1 · 10 | 9 | `C = 0,00003` |
| **Árbol de decisión** | Reglas legibles; capta escalones e interacciones | — | `max_depth`: 3 · 5 · 7 · 9 · 12 · 15 · 20 · 25 · 30 · 40 <br> `min_samples_leaf`: 20 · 100 · 500 · 1000 · 2000 <br> `criterion`: gini · entropy | 100 | `gini`, `max_depth = 12`, `min_samples_leaf = 500` |
| **Random forest** | Promedia muchos árboles (bagging): reduce el sobreajuste de un árbol solo | 150 árboles, `max_features = sqrt` | `max_depth`: 7 · 10 · 16 · 24 <br> `min_samples_leaf`: 5 · 10 · 50 | 12 | `max_depth = 24`, `min_samples_leaf = 10` |
| **Gradient boosting** (`HistGradientBoostingClassifier`) | Árboles en serie, cada uno corrige al anterior (la idea de AdaBoost vista en clase, en versión moderna) | 200 árboles, `min_samples_leaf = 100`, `l2_regularization = 1` | `learning_rate`: 0,02 · 0,05 · 0,1 <br> `max_leaf_nodes`: 7 · 15 · 31 | 9 | `learning_rate = 0,05`, `max_leaf_nodes = 15` |

**Qué significa cada hiperparámetro:**
- **`C`** (logística): la inversa de la regularización. Una `C` chica achica los coeficientes, y eso generaliza mejor entre fechas cuando la señal es débil, como en nuestro caso.
- **`max_depth`**: cuántas preguntas seguidas puede hacer el árbol. Más profundidad memoriza más.
- **`min_samples_leaf`**: cuántas cotizaciones tiene que tener como mínimo cada hoja. Un valor alto evita reglas basadas en pocos casos.
- **`criterion`**: cómo mide el árbol la "pureza" de cada división (gini o entropía).
- **`learning_rate`**: cuánto corrige cada árbol nuevo. Más chico es más prudente.
- **`max_leaf_nodes`**: tamaño máximo de cada árbol del boosting.

**Cómo se ve el sobreajuste** (con pesos de clase):

| Modelo | Configuración | PR-AUC validación | PR-AUC entrenamiento |
|---|---|---:|---:|
| Árbol | Más simple (`max_depth = 3`) | 0,114 | 0,122 |
| Árbol | **Elegida** (`max_depth = 12`, hojas de 500) | **0,125** | 0,159 |
| Árbol | Más compleja (`max_depth = 40`, hojas de 20) | 0,103 | **0,427** |

El árbol más complejo tiene casi el triple de PR-AUC en entrenamiento que el elegido, pero es **peor** en fechas nuevas: memoriza días puntuales. Elegimos la configuración con mejor validación, no la mejor en entrenamiento. La Figura 3 del informe ([`../5_Graficos/fig03_recargo_validacion_profundidad.png`](../5_Graficos/fig03_recargo_validacion_profundidad.png)) muestra esta curva.

En random forest la mejor profundidad quedó en 24, el máximo de la grilla, pero la validación es plana desde 16 (0,1261 contra 0,1262) y sin límite de profundidad, probado en la versión anterior, no mejoraba.

Las búsquedas completas están en `../6_Resultados/recargo_busqueda_*.csv`.

### 4.5 El balanceo de clases: cuatro técnicas

Sin balanceo, el modelo aprende que decir siempre "no" le da 91,7% de acierto y nunca avisa un recargo. Probamos las tres técnicas vistas en clase y la versión sin balancear:

| Técnica | Qué hace | Filas para entrenar | % con recargo |
|---|---|---:|---:|
| Sin balanceo | Datos tal cual | 196.558 | 8,2% |
| Submuestreo (`RandomUnderSampler`) | Descarta al azar cotizaciones sin recargo hasta igualar las clases (tira el 91% de la clase mayoritaria) | 32.094 | 50% |
| SMOTE | Crea cotizaciones sintéticas con recargo, interpolando entre 5 vecinos cercanos | 361.022 | 50% |
| **Pesos de clase** (`class_weight = "balanced"`) | No cambia los datos: equivocarse en un recargo pesa **6,12** y en un no-recargo **0,54** | 196.558 | 8,2% |

Detalles importantes:
- **El balanceo se aplica solo al entrenamiento**, dentro de un pipeline de `imblearn`. En cada fold se balancea solo la parte de entrenamiento, y la validación y la prueba **siempre** tienen la proporción real.
- **Cada combinación de algoritmo y técnica tiene su propia búsqueda de hiperparámetros**: 4 algoritmos × 4 técnicas = 16 búsquedas, 520 configuraciones en total. Así la comparación es justa.
- Los datasets balanceados se exportaron a [`../4_Datasets/datasets balanceados/`](../4_Datasets/datasets%20balanceados/).

**Qué aprendimos:**
- **Balancear no mejora el ranking, mueve el umbral.** El PR-AUC casi no cambia (gradient boosting: 0,134 sin balanceo y 0,136 con pesos de clase). El modelo ordena las cotizaciones por riesgo casi igual; lo que cambia es que las probabilidades suben y superan el 0,5.
- **El submuestreo funciona, pero desperdicia datos:** entrena con solo 32.094 filas.
- **SMOTE no conviene con nuestros datos:** la mayoría de las variables son dummies, y al interpolar crea valores imposibles como "0,4 de Back Bay", que los árboles memorizan.
- **Elegimos pesos de clase** porque formó el par con mejor PR-AUC en validación (gradient boosting + pesos, 0,136) y además usa todos los datos reales sin inventar filas.

**¿Hace falta balancear si el umbral también se ajusta?** Sin balanceo, el problema es que con el umbral 0,5 el modelo nunca avisa. Para separar los dos efectos, entrenamos cada algoritmo sin balanceo y le elegimos el umbral con el mismo criterio que al modelo final (la matriz de beneficio, sección 4.7):

| Modelo | Sin balanceo (umbral ajustado) | Pesos de clase (umbral ajustado) |
|---|---:|---:|
| Regresión logística | USD 26 | USD 29 |
| Árbol de decisión | USD 51 | USD 43 |
| Random forest | USD 61 | USD 55 |
| Gradient boosting | USD 54 | USD 56 |

Beneficio en la prueba, en USD cada 1.000 cotizaciones. **Con el umbral ajustado, sin balanceo rinde casi igual** (en el árbol y en random forest, incluso un poco mejor): balancear mueve el umbral, no mejora el ranking. Los umbrales sin balanceo son mucho más bajos (0,10 a 0,14) porque las probabilidades no se corrieron.

### 4.6 Cómo elegimos el modelo final

Con la mejor configuración de cada combinación, elegimos el par **algoritmo + técnica con mayor PR-AUC en validación**. La prueba no interviene.

| Algoritmo (pesos de clase) | PR-AUC validación | ROC-AUC validación |
|---|---:|---:|
| **Gradient boosting** ★ | **0,136 ± 0,012** | 0,659 |
| Random forest | 0,126 ± 0,006 | 0,653 |
| Árbol de decisión | 0,125 ± 0,014 | 0,637 |
| Regresión logística | 0,120 ± 0,003 | 0,649 |

Gana gradient boosting, aunque los cuatro quedan cerca. Eso indica que **el límite no está en el algoritmo sino en la información disponible**.

### 4.7 El umbral de decisión: matriz de beneficio

Por defecto, un modelo dice "con recargo" si el puntaje es ≥ 0,5, pero ese número es arbitrario. Elegimos el umbral con una **matriz de beneficio**, que le pone un valor en dólares a cada casilla de la matriz de confusión (comparado con no tener modelo):

| | Predice **sin recargo** | Predice **con recargo** (aviso) |
|---|---|---|
| **Real: sin recargo** | VN · USD 0 | FP · **−USD 1,00**: el pasajero compara o espera sin necesidad (supuesto: unos 5 minutos) |
| **Real: con recargo** | FN · USD 0: paga el recargo, igual que sin modelo | VP · **+USD 7,73**: evita el recargo medio (USD 8,73, medido en el entrenamiento) y pierde el tiempo de comparar |

1. Con las predicciones de la validación temporal (cada bloque predicho por un modelo entrenado solo con fechas anteriores), calculamos el beneficio de cada umbral posible.
2. Nos quedamos con el que **maximiza el beneficio**.
3. Lo aplicamos **tal cual** a la prueba.

**Qué dice la matriz:** un aviso conviene si la probabilidad de recargo supera costo / recargo = 1 / 8,73 = **11,4%**. Para gradient boosting el umbral quedó en **0,57**. Con el umbral de máximo F1 (0,55) el modelo avisaba en el 38,5% de las cotizaciones; con la matriz, en el 31,7%: **es más selectivo**.

Con los pesos de clase, el puntaje **no es la probabilidad real**: el modelo exagera el riesgo a propósito, así que un puntaje de 0,8 no significa 80% de chance.

**Sensibilidad al costo de una falsa alarma** (el costo es un supuesto, así que repetimos la elección del umbral para varios valores):

| Costo de una falsa alarma | Precisión mínima | Umbral | Avisa en | Recall | Precisión | Beneficio / 1.000 |
|---|---:|---:|---:|---:|---:|---:|
| USD 0,50 | 5,7% | 0,32 | 74,0% | 92,7% | 10,4% | USD 301 |
| **USD 1,00** | **11,4%** | **0,57** | **31,7%** | **51,4%** | **13,5%** | **USD 56** |
| USD 1,50 | 17,2% | 0,72 | 0,6% | 1,5% | 21,5% | USD 2 |
| USD 2,00 | 22,9% | no avisar | 0% | 0% | – | USD 0 |
| USD 3,00 | 34,3% | no avisar | 0% | 0% | – | USD 0 |

**Hasta dónde se pueden bajar los falsos negativos** (umbral fijado en validación para detectar cada % de recargos, medido en la prueba):

| Recargos a detectar | Umbral | Recall real | FN | FP | Precisión | Accuracy | Beneficio / 1.000 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 90% | 0,27 | 96,5% | 173 | 43.508 | 9,9% | 26,5% | −USD 113 |
| 70% | 0,45 | 81,4% | 919 | 29.423 | 12,0% | 48,9% | USD 27 |
| 50% | 0,54 | 63,4% | 1.802 | 20.887 | 13,0% | 61,8% | USD 55 |
| 30% | 0,60 | 35,2% | 3.193 | 10.210 | 14,5% | 77,4% | USD 54 |
| 10% | 0,66 | 8,2% | 4.525 | 1.734 | 18,9% | 89,5% | USD 23 |

**En qué conviene enfocarse:** en la **precisión** (menos falsas alarmas), no en detectar todos los recargos. Bajar los falsos negativos siempre cuesta muchos falsos positivos, y la precisión del modelo nunca pasa de ~20%: es el **límite del dominio**, porque falta la oferta y la demanda en tiempo real. Si una falsa alarma costara USD 2 o más, no convendría avisar nunca.

### 4.8 Resultados en la prueba (15 al 18/12)

| Modelo | Umbral | Accuracy | Accuracy balanceada | Precisión | Recall | F1 | ROC-AUC | PR-AUC | Beneficio / 1.000 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Gradient boosting** ★ | 0,57 | **68,6%** | **60,8%** | **13,5%** | 51,4% | **0,214** | **0,676** | 0,140 | **USD 56** |
| Regresión logística | 0,54 | 59,1% | 61,1% | 12,2% | 63,5% | 0,205 | 0,651 | 0,121 | USD 29 |
| Random forest | 0,44 | 67,4% | 61,0% | 13,3% | 53,3% | 0,213 | 0,675 | 0,142 | USD 55 |
| Árbol de decisión | 0,63 | 84,3% | 55,5% | 16,0% | 21,1% | 0,182 | 0,672 | 0,138 | USD 43 |

**Matriz de confusión del modelo elegido** (59.395 cotizaciones: 4.928 con recargo y 54.467 sin):

| | Predijo **sin recargo** | Predijo **con recargo** |
|---|---:|---:|
| **Real: sin recargo** | **VN = 38.202** · acierto | **FP = 16.265** · falsa alarma |
| **Real: con recargo** | **FN = 2.394** · recargo no detectado | **VP = 2.534** · recargo detectado |

- **Accuracy** = (VP + VN) / total = (2.534 + 38.202) / 59.395 = **68,6%**
- **Precisión** = VP / (VP + FP) = 2.534 / 18.799 = **13,5%**: de cada 100 alertas, 13 o 14 son recargos reales (el azar acierta 8).
- **Recall** = VP / (VP + FN) = 2.534 / 4.928 = **51,4%**: detecta 5 de cada 10 recargos.
- **Especificidad** = VN / (VN + FP) = **70,1%**, y la accuracy balanceada es el promedio entre recall y especificidad: **60,8%**.

La accuracy (68,6%) es menor que la de decir siempre "no" (91,7%) porque el modelo **sí avisa** recargos y al avisar comete falsas alarmas.

**Niveles de certeza (intervalos de confianza del 95%).** Para que los números no dependan de la suerte de 4 días, hicimos 1.000 remuestreos por bootstrap de las 87 horas del período de prueba (se remuestrean horas completas, porque las cotizaciones de una misma hora comparten el recargo):

| Métrica | Valor | IC 95% |
|---|---:|---|
| Accuracy | 68,6% | 67,3% a 69,8% |
| Accuracy balanceada | 60,8% | 59,4% a 62,1% |
| Precisión | 13,5% | 12,7% a 14,3% |
| Recall | 51,4% | 48,4% a 54,5% |
| ROC-AUC | 0,676 | 0,663 a 0,689 |
| PR-AUC | 0,140 | 0,132 a 0,150 |
| Beneficio (USD / 1.000) | 56 | 35 a 78 |
| Ventaja de PR-AUC sobre la tasa de la zona | +0,022 | +0,015 a +0,029 |

El modelo está por encima del azar con certeza, y su ventaja sobre la regla simple por zona es positiva en todo el intervalo: chica, pero no es casualidad.

**Curva ROC:** un ROC-AUC de 0,676 significa que, si se toma al azar una cotización con recargo y una sin recargo, el modelo le da más puntaje a la que tiene recargo el 68% de las veces.

### 4.9 Interpretación: qué aprendió el modelo

**Importancia por permutación por familias.** Mezclamos al azar todas las columnas de un grupo a la vez (por ejemplo, las 12 dummies de zona de origen) y medimos cuánto cae el PR-AUC. Se calcula con el modelo ya entrenado, solo para interpretar.

| Familia | Caída de PR-AUC |
|---|---:|
| Ruta (tasa histórica) | 0,047 |
| Distancia | 0,025 |
| Zona de destino | 0,008 |
| Clima | 0,002 |
| Zona de origen | 0,000 (su efecto ya está dentro de la ruta) |
| Producto | 0,000 |
| Hora y día | 0,000 |

**Odds ratio de la regresión logística** (contra South Station), calculados con una logística de **regularización débil (C = 1)**, porque la elegida (C = 0,00003) encoge los coeficientes hacia 0 y los odds ratio hacia 1: salir de **Northeastern** multiplica la chance de recargo por 1,29, de **Boston University** por 1,24, de **Fenway** por 1,23 y de **Back Bay** por 1,22. Salir de **North End** (0,38) o **Haymarket Square** (0,37) la reduce a menos de la mitad. Con la logística elegida, North End daría 0,65: por eso no se usa para interpretar.

**Deciles de riesgo.** Si se ordenan las cotizaciones de prueba por el puntaje del modelo, el 10% más riesgoso tiene un 15,7% de recargos reales (1,9 veces el promedio) y el 10% menos riesgoso, un 1,1%. El 20% más riesgoso concentra el 35% de todos los recargos.

**Conclusión:** el recargo depende del **lugar** (ruta y zona de origen), no de la hora ni del clima. El resto depende de la oferta y la demanda en tiempo real, que no están en el dataset. Por eso ningún modelo pasa de un ROC-AUC de 0,68.

---

## 5. Objetivo 1: `price` (regresión)

### 5.1 Qué datos usa

- **Uber + Lyft:** 636.568 cotizaciones, 67 predictoras (producto, distancia, zonas, hora, día y clima).
- **Se modela `log(price)`**, no el precio directo: el precio tiene una cola larga de viajes caros, y en escala log los errores se vuelven relativos (equivocarse por USD 2 en un viaje de USD 8 pesa más que en uno de USD 40). Para reportar las métricas en dólares se vuelve con la exponencial (decisión D05 de la Entrega 2).
- **Dos variantes de cada modelo** (decisión D16): **sin** y **con** `surge_multiplier` (como `log_surge`). Así medimos cuánto aporta realmente el recargo. Es legítimo usarlo porque la app lo muestra al cotizar.

### 5.2 Los tres algoritmos y los hiperparámetros que probamos

La métrica para elegir fue el **RMSE en log(price) en validación** (validación temporal en orden). Cada variante (con y sin surge) tuvo su propia búsqueda. Para los árboles, la búsqueda se hizo sobre una muestra de 150.000 filas del entrenamiento (cada ajuste sobre ~500 mil filas tarda minutos) y el modelo final se reentrenó con el entrenamiento completo.

| Algoritmo | Por qué lo elegimos | Fijo | Hiperparámetros probados | Elegido (con surge) | Elegido (sin surge) |
|---|---|---|---|---|---|
| **Ridge** (regresión lineal con penalización L2) | Referencia simple e interpretable; la L2 estabiliza los coeficientes ante dummies correlacionadas (la Entrega 2 prometía un lineal regularizado) | Escalado, categorías de referencia | `alpha`: 0,01 · 0,1 · 1 · 10 · 100 · 1000 · 10.000 · 100.000 | `alpha = 1000` | `alpha = 1000` |
| **Árbol de decisión** | Capta los escalones de la tarifa | — | `max_depth`: 6 · 10 · 14 · 18 · 24 · 30 <br> `min_samples_leaf`: 5 · 20 · 100 · 300 | `max_depth = 18`, hojas de 20 | `max_depth = 24`, hojas de 100 |
| **Random forest** | Más estable que un árbol solo | `max_features = 0,5`; 60 árboles en la búsqueda y 150 en el modelo final | `max_depth`: 12 · 16 · 24 · 32 <br> `min_samples_leaf`: 2 · 5 · 20 · 50 | `max_depth = 16`, hojas de 5 | `max_depth = 24`, hojas de 20 |

- **`alpha`** (Ridge): cuánto se castigan los coeficientes grandes. Ganó `alpha = 1000`, ahora dentro de la grilla (que llega a 100.000); el error de validación casi no cambia con alpha porque el modelo lineal tiene pocos coeficientes para tantos datos.
- Con las grillas extendidas, todos los valores elegidos quedaron **dentro** de la grilla.

**El modelo elegido** fue el de menor RMSE en validación entre los seis (3 algoritmos × 2 variantes): **random forest con surge** (RMSE log 0,1269).

### 5.3 Resultados en la prueba

Comparados contra una **línea base** que solo conoce el producto (predice la mediana de precio de cada producto):

| Modelo | Variante | MAE | RMSE | MAPE | Error ≤ 10% | R² |
|---|---|---:|---:|---:|---:|---:|
| Línea base (mediana por producto) | – | USD 3,04 | USD 4,59 | 19,8% | 34,1% | 0,758 |
| Ridge | sin surge | USD 1,62 | USD 2,80 | 10,4% | 62,0% | 0,910 |
| Ridge | con surge | USD 1,39 | USD 2,06 | 9,6% | 65,5% | 0,951 |
| Árbol de decisión | sin surge | USD 1,35 | USD 2,53 | 8,9% | 70,9% | 0,927 |
| Árbol de decisión | con surge | USD 1,09 | USD 1,73 | 8,0% | 73,6% | 0,966 |
| Random forest | sin surge | USD 1,32 | USD 2,50 | 8,7% | 71,8% | 0,928 |
| **Random forest** ★ | **con surge** | **USD 1,08** | **USD 1,70** | **7,8%** | **75,0%** | **0,967** |

- **MAE:** error absoluto medio, en dólares. **RMSE:** como el MAE, pero castiga más los errores grandes. **MAPE:** error relativo medio. **Error ≤ 10%:** porcentaje de viajes cuyo precio se predice con un error de hasta 10% (es lo más parecido a una "accuracy" en regresión).
- **Los árboles superan al lineal** (USD 1,08 contra USD 1,39 con las mismas variables): el precio crece por escalones y la tarifa por milla cambia según el producto, cosa que una recta no capta del todo.
- **`surge_multiplier` aporta, pero poco:** sin él, el random forest ya logra R² = 0,928 y USD 1,32 de error medio; con él, el MAE baja un 18%. Informamos los dos números porque el multiplicador y el precio salen del mismo cálculo de la plataforma.
- **Certeza (IC 95%, bootstrap de las 87 horas de prueba):** error medio USD 1,07 a 1,09, R² 0,966 a 0,968 y viajes con error ≤ 10% entre 74,7% y 75,2%. Sin surge: USD 1,31 a 1,34.
- **Por producto:** el error va del 4,1% del precio medio en los productos caros al 18,9% en Shared, donde el precio depende del emparejamiento con otros pasajeros, que no está en los datos.

### 5.4 Interpretación

**Importancia por permutación por familias** (caída del R² en log al mezclar cada grupo):

| Familia | Caída de R² |
|---|---:|
| Producto | 1,62 |
| Distancia | 0,26 |
| Recargo (surge) | 0,018 |
| Zonas de destino y origen | 0,003 y 0,002 |
| Clima | 0,000 |
| Hora y día | 0,000 |

**Uber vs Lyft** (el modelo variando solo el producto y la distancia): Lyft es más barato en los económicos (Shared −29% frente a UberPool, Lyft −3% frente a UberX, Lyft XL −4% frente a UberXL) y más caro en los Black (Lux Black +8%, Lux Black XL +5%). Lux no se compara porque es exclusivo de Lyft.

**Conclusión:** el precio es estructural y predecible. Con el producto, la distancia y el multiplicador se estima con un error de alrededor de un dólar. La hora y el clima no lo mueven.

---

## 6. Análisis complementario: K-Means de los productos

Explicación completa en [`../EXPLICACION_KMEANS_PRODUCTOS.md`](../EXPLICACION_KMEANS_PRODUCTOS.md). En resumen:

1. **Variables.** Para cada uno de los 12 productos ajustamos una recta `precio = tarifa base + precio por milla × distancia`, usando solo los viajes **sin recargo** del **entrenamiento**. Cada producto queda descripto por dos números: su tarifa base y su precio por milla.
2. **Estandarización.** Las dos variables se estandarizaron (`StandardScaler`), porque K-Means usa distancias y si no la tarifa base dominaría.
3. **Elección de k.** Probamos k de 2 a 6, con `n_init = 50` (50 arranques distintos para no quedar en una mala solución):

| k | 2 | **3** | 4 | 5 | 6 |
|---|---:|---:|---:|---:|---:|
| Inercia (codo) | 8,11 | **2,00** | 0,96 | 0,69 | 0,48 |
| Silueta | 0,574 | **0,682** | 0,611 | 0,547 | 0,416 |

   El codo y la silueta coinciden en **k = 3**.

4. **Resultado.** Tres familias: **económico** (Shared, Lyft, UberPool, WAV, UberX), **intermedio** (Lyft XL, Lux, UberXL, Black, Lux Black) y **premium** (Lux Black XL, Black SUV). Cada producto de Uber cae en la misma familia que su equivalente de Lyft.

Primero probamos un K-Means de rutas, pero la silueta daba casi igual para todos los k (no había grupos naturales), así que lo reemplazamos.

---

## 7. Cómo reproducir todo

```bash
pip install -r ../3_Codigo/requirements.txt
python ../3_Codigo/modelado_entrega3.py           # completo, ~15 min con 10 núcleos
python ../3_Codigo/modelado_entrega3.py --rapido  # prueba en ~2 min (escribe en una carpeta temporal)
```

El script usa semilla fija (`SEED = 42`), así que da siempre los mismos resultados. Genera todo lo que está en `4_Datasets/`, `5_Graficos/` y `6_Resultados/`.

## 8. Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Código de `has_surge` | `3_Codigo/modelado_entrega3.py`, "PARTE A" |
| Código de `price` | `3_Codigo/modelado_entrega3.py`, "PARTE B" |
| Código del K-Means | `3_Codigo/modelado_entrega3.py`, "PARTE C" |
| Todas las métricas | `6_Resultados/metricas.json` |
| Búsquedas de hiperparámetros completas | `6_Resultados/recargo_busqueda_*.csv` y `precio_busqueda_*.csv` |
| Gráficos | `5_Graficos/fig01` a `fig11` (mismo número que en el informe; la matriz de beneficio es la `fig06`) |
| Informe completo | `1_Informe/Entrega3_Grupo11.docx` (secciones 3 a 7) |
| Presentación | `2_Presentacion_Colab/` |
