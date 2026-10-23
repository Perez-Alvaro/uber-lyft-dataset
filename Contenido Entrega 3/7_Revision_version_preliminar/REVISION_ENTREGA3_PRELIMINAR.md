# Revisión de la versión preliminar de la Entrega 3

Qué estaba mal o faltaba en el borrador (subcarpeta `Cosas que hicimos en casa/`, antes llamada `Contenido Entrega 3/`) y cómo se resolvió en la versión final (`Contenido Entrega 3/`, antes llamada `Contenido Entrega 3 mejoras/`).

El contenido del borrador **no se tocó**: queda como registro del punto de partida y para comparar las dos versiones.

---

## Resumen rápido

| | Preliminar | Mejorada |
|---|---|---|
| Dataset de entrada | `dataset_nueva_columna.zip` (sin codificar) | `dataset_codificado.zip` (el último de la Entrega 2) |
| Partición train/test | Aleatoria | Por fecha: train hasta el 14/12, test del 15 al 18/12 |
| Hiperparámetros | Fijos a mano, sin justificar | Búsqueda en grilla con validación temporal en orden (5 bloques de fechas), tabla de justificación |
| Umbral de decisión | 0,5 fijo | Elegido con una matriz de beneficio sobre las predicciones de validación dentro del train (sin mirar el test) |
| Métricas de has_surge | Accuracy, recall, precision, F1, ROC-AUC (sin línea base) | + accuracy balanceada, PR-AUC, F1 macro/weighted, curvas ROC y PR, líneas base |
| Modelos de has_surge | Regresión logística y árbol | Regresión logística, árbol, random forest y gradient boosting (elegido por validación) |
| Modelos de price | Lineal sin regularizar y árbol, sin surge_multiplier | Ridge, árbol y random forest, cada uno con y sin surge_multiplier |
| Interpretación | No había | Importancia por familias, odds ratio, reglas del árbol, deciles de riesgo, hipótesis H1–H6 |
| Tercer análisis | Multiclase de Uber (circular) | K-Means de los 12 productos: 3 familias de tarifa (objetivo de la Entrega 1) |
| Informe | `.md` con emojis y links locales de Windows | `1_Informe/Entrega3_Grupo11.docx` con el formato de la Entrega 2 |
| Presentación oral | Notebook sin ejecutar, con todo el código a la vista | `2_Presentacion_Colab/`: notebook-presentación ya ejecutado, código oculto, gráficos en orden y una demo en vivo |
| Datasets de salida | No había | `4_Datasets/datasets modelado/` (price y surge) y `4_Datasets/datasets balanceados/` (submuestreo, SMOTE y test real) |

---

## Lo que estaba bien y se conservó

- `has_surge` solo con Lyft sin Shared.
- Excluir `price` y `surge_multiplier` del modelo de recargo (fuga de datos).
- Modelar `log(price)`.
- Comparar las cuatro estrategias de balanceo vistas en clase (sin balanceo, submuestreo, SMOTE y pesos de clase) aplicándolas **solo al train**.
- Regresión logística y árbol de decisión como modelos base.

---

## Problemas encontrados

### Críticos (cambian los resultados o contradicen lo comprometido con la cátedra)

**1. No usaba el dataset codificado.**
Cargaba `dataset_nueva_columna.zip` y volvía a codificar con `get_dummies`, con otro criterio (`service_tier` + `cab_type` en vez de `name_*`). Se duplicaba el trabajo de la Entrega 2 y el modelo de precio perdía el detalle de los 12 productos.
→ Ahora parte de `dataset_codificado.zip` y usa las 12 columnas `name_*`, como recomendaba `Explicacion_Codificacion_BD.md`.

**2. Partición aleatoria.**
Todos los modelos usaban `train_test_split` al azar. Eso contradice lo que dijimos en la Entrega 2 (validar agrupando por fecha, porque en el 95,7% de los grupos ruta–minuto todos los productos comparten `has_surge`) e infla las métricas: cotizaciones del mismo minuto y ruta quedan en train y en test.
Lo medimos: con partición aleatoria el PR-AUC del random forest sale **más del doble** (0,309 frente a 0,142), y el random forest parece mucho mejor que gradient boosting cuando en realidad quedan parejos (0,141 y 0,140 por fecha).
→ Test = 4 fechas posteriores; los hiperparámetros se eligen con una validación temporal en orden dentro del train (5 bloques de fechas: cada fold valida con fechas posteriores a las de entrenamiento). La comparación aleatoria vs temporal está en la sección 5.7 del informe.

**3. La clasificación multiclase de Uber era circular.**
Predecía el servicio (`service_tier`) usando `price` y `price_per_mile`. El precio es la variable objetivo del objetivo 1 y depende del servicio elegido: predecir el servicio a partir del precio es ir al revés y no responde ninguna pregunta del proyecto. Tampoco estaba en el plan de la Entrega 2. Además decía "clases balanceadas" cuando Estándar tiene el doble que el resto (33,3%).
→ Se eliminó. En su lugar hay un K-Means de los 12 productos según su tarifa base y su precio por milla (codo y silueta coinciden en k = 3, silueta 0,68), ligado a un objetivo específico de la Entrega 1 y a las hipótesis H4 y H6. Primero se probó un K-Means de rutas, pero su silueta era plana (ver la segunda revisión, punto 6).

**4. Los números del informe no se podían reproducir.**
- El informe reporta MAE de regresión, pero `ejecutar_experimentos_sprint3.py` no calcula MAE (lo importa y no lo usa).
- El notebook no tiene ninguna celda ejecutada (sin salidas).
- El script usa una muestra de 100 mil filas para la regresión y el notebook el dataset completo, así que dan resultados distintos.

→ Un solo script (`3_Codigo/modelado_entrega3.py`) genera todas las cifras en `6_Resultados/metricas.json` y los CSV. El Colab de presentación lee esos mismos resultados.

### Importantes (requisitos de la consigna que faltaban)

**5. Hiperparámetros sin justificar.** `max_depth = 12`, `10` y `8`, y la `C` por defecto de la regresión logística, sin búsqueda ni explicación. La consigna pide "definir el valor de los parámetros y justificar los utilizados".
→ Búsqueda en grilla para todos los modelos (cada combinación de modelo y técnica de balanceo, y cada variante con/sin surge, tiene su propia búsqueda), tabla con el rol de cada parámetro y por qué se eligió, y curva de validación del árbol que muestra el sobreajuste.

**6. Umbral fijo en 0,5.** Con datos desbalanceados el umbral define el compromiso entre recall y precisión, y la clase de matriz de confusión pide interpretarlo.
→ Se elige con las predicciones de la validación temporal dentro del train y se aplica tal cual al test. Primero se usó el máximo F1; en la versión actual se usa una matriz de beneficio (recargo evitado frente al costo de una falsa alarma), con análisis de sensibilidad.

**7. Métricas incompletas.** Faltaba el PR-AUC que prometimos en la Entrega 2, no había curvas ROC graficadas, no se reportaban los promedios macro y weighted, y no había líneas base (por ejemplo, "siempre sin recargo", que tiene 91,7% de accuracy).
→ Están todas, más la curva Precisión-Recall y dos líneas base.

**Sobre la accuracy (la profe la remarcó):** la versión preliminar la mostraba, pero sin compararla con nada. Ahora se informa en todas las tablas y se lee **siempre contra la línea base** (91,7% de decir siempre "no"), junto con la **accuracy balanceada** (promedio del acierto en cada clase; 50% = azar). El modelo final (gradient boosting) tiene 68,6% de accuracy y 60,8% de accuracy balanceada: acierta el 70,1% de los viajes sin recargo y el 51,4% de los viajes con recargo. Está explicado en las secciones 3.3, 5.1 y 5.4 del informe y en las secciones 6 (con una demo en vivo) y 8 del Colab.

**8. Conclusión de balanceo sobredimensionada.** El informe llamaba a `class_weight` "método campeón" y "herramienta útil" mirando solo el recall (83%), con una precisión de 12% contra 8% de azar. No explicaba que el ROC-AUC casi no cambia al balancear: balancear corre las probabilidades respecto del umbral, no mejora el ranking. Tampoco explicaba por qué SMOTE rinde mal.
→ El informe compara las técnicas con métricas que dependen y que no dependen del umbral, y explica el problema de SMOTE con variables dummy: interpola valores imposibles como "0,4 de Back Bay" y los árboles los memorizan.

**9. Regresión incompleta.** No usaba `surge_multiplier` ni entrenaba con y sin él (decisión D16), el modelo lineal no estaba regularizado (la Entrega 2 prometía uno regularizado) y había un solo modelo de árboles.
→ Ridge, árbol y random forest, cada uno con y sin `surge_multiplier`, comparados contra una línea base que solo conoce el producto.

**10. Sin interpretación.** No había importancia de variables, coeficientes ni contraste con las hipótesis H1–H6, que la consigna pide ("identificar patrones" e "interpretar los resultados en relación con el problema original").
→ Importancia por permutación por familias de variables, odds ratio, primeras reglas del árbol, deciles de riesgo y tabla de hipótesis.

### Menores y de forma

**11. Código y textos inconsistentes.** El docstring del script habla de una técnica "Combinado" (`SMOTEENN`), que se importa pero no se usa; la cuarta técnica en realidad es pesos de clase. "Regresión Lineal Simple" usa más de 10 variables (es regresión múltiple).

**12. Hora y día como números lineales** en la regresión logística: trata las 23 h como lejos de las 0 h.
→ Se agregaron `hour_sin` y `hour_cos` (codificación cíclica).

**13. Formato del informe.** Markdown con emojis, enlaces locales de Windows (`file:///c:/Users/perez/...`) que no abren en otra computadora, números en formato inglés (`0.9055`, `$2.89`) y figuras sin numerar. La cátedra pide formato paper.
→ `Entrega3_Grupo11.docx` con la estructura y el estilo de la Entrega 2 (portada, índice, figuras y tablas numeradas, referencias).

---

## Cómo cambian los números (para la defensa oral)

No son comparables uno a uno, porque la versión preliminar usaba partición aleatoria y umbral fijo. Igual conviene tenerlos a mano:

| Métrica | Preliminar (árbol) | Versión final (gradient boosting) | Por qué cambia |
|---|---|---|---|
| Recargo: recall | 83,4% | 51,4% | Umbral elegido con la matriz de beneficio en validación en vez de 0,5, y prueba en fechas nuevas |
| Recargo: precisión | 12,0% | 13,5% | Menos alertas, pero más acertadas |
| Recargo: F1 | 0,210 | 0,214 | Hiperparámetros elegidos por validación temporal |
| Recargo: ROC-AUC | 0,683 | 0,676 | La validación por fecha saca el optimismo de la partición aleatoria |
| Recargo: PR-AUC | no se reportaba | 0,140 | Métrica principal comprometida en la Entrega 2 |
| Recargo: accuracy balanceada | no se reportaba | 60,8% | Para leer la accuracy contra el azar (50%) |
| Precio: R² | 0,906 (árbol) | 0,967 (random forest con surge) | 12 productos (`name_*`), `surge_multiplier` y dataset completo |
| Precio: MAE | USD 1,85 (sin verificar) | USD 1,08 | Ídem; sin `surge_multiplier` da USD 1,32 |

El recall baja porque antes el modelo marcaba "con recargo" a **más de la mitad** de las cotizaciones (57%): detectaba muchos recargos a costa de muchísimas falsas alarmas.

---

## Segunda revisión: observaciones del equipo sobre la versión mejorada

Después de la primera versión mejorada, el equipo marcó 12 problemas. Todos quedaron resueltos:

| # | Observación | Cómo se resolvió |
|---|---|---|
| 1 | Faltaba `drop_first` en la logística y Ridge | Cada grupo one-hot pierde una categoría de referencia (zona South Station, producto Lyft/UberX, franja Mañana, clima Clear). Los odds ratio ahora se leen "contra South Station", la zona con la tasa promedio. Los árboles siguen usando todas las columnas. |
| 2 | La búsqueda del random forest podía quedarse sin memoria; los tiempos estaban contradichos | Las búsquedas de random forest y gradient boosting usan pocos procesos en paralelo (`N_JOBS_PESADO`, configurable) y la grilla de precio se achicó. Todos los documentos dicen ~25 min. |
| 3 | Solo 3 modelos, sin boosting | Se agregó **gradient boosting** (`HistGradientBoostingClassifier`) y la variable **tasa histórica de recargo de la ruta**, calculada solo con el entrenamiento (`TargetEncoder` dentro del pipeline). Resultado en la sección 5.2 del informe. |
| 4 | Hiperparámetros elegidos para una sola técnica / variante | Ahora cada combinación modelo × técnica de balanceo, y cada variante con/sin surge, tiene **su propia búsqueda**. |
| 5 | `GroupKFold` no respeta el orden temporal | Se reemplazó por una **validación temporal en orden**: 5 bloques de fechas consecutivos; cada fold entrena con los anteriores y valida con el siguiente. El umbral también se elige con esas predicciones. |
| 6 | K-Means con k=7 defendido como "óptimo"; precio por milla redundante con la distancia | Con rutas la silueta era plana (no había grupos naturales), así que se **reemplazó por un K-Means de los 12 productos** según su tarifa base y su precio por milla (estimados sin recargo con el entrenamiento). Codo y silueta coinciden en **k = 3** (silueta 0,68): tres familias de tarifa bien separadas. |
| 7 | Importancia por permutación sobre el test | Se aclara en el informe (secciones 4.3, 5.6 y limitaciones) que se usa solo para interpretar, con el modelo ya entrenado. Además, **el modelo final ahora se elige por validación**, no por el test. |
| 8 | Ruta de fuente de macOS | Comentado: en Windows Calibri ya viene instalada; si no está, se usa DejaVu Sans y no cambia nada más. |
| 9 | Constante mágica 1,57 | Se calcula del dataset (mediana de `distance / straight_line_miles` = 1,567). |
| 10 | Lux sin pareja en la comparación Uber vs Lyft | Lux es el nivel Premium, exclusivo de Lyft: se aclara en el código y el informe, y se grafica punteado como "sin par en Uber". |
| 11 | Notebooks sin salidas | El Colab de presentación se guarda **ejecutado**, con todos los gráficos y tablas, y además en **PDF** en la misma carpeta. |
| 12 | README desactualizado | El README raíz ahora lista las dos carpetas, marca la preliminar como borrador y el Sprint 3 como finalizado. |

Además, a pedido de la profe:

- **Por qué se eligió cada modelo y qué pruebas se hicieron:** el informe (secciones 3.2, 4.1 y 5.2) y el Colab (secciones 3 y 4) muestran, para cada modelo, la configuración elegida, la segunda mejor, una más simple y una más compleja, con sus puntajes de validación, y la comparación entre algoritmos.
- **Accuracy:** se informa en todas las tablas, siempre junto a la línea base y la accuracy balanceada.

---

## Qué hay en la carpeta nueva

La estructura completa y qué abrir para cada cosa están en [`../LEEME.md`](../LEEME.md).

Los cambios de la versión actual respecto de la anterior (matriz de beneficio, intervalos de confianza, validación cruzada mezclada, grillas extendidas, etc.) están en [`../CAMBIOS_RESPECTO_VERSION_ANTERIOR.md`](../CAMBIOS_RESPECTO_VERSION_ANTERIOR.md).
