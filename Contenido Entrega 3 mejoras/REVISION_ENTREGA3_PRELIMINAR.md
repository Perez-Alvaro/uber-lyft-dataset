# Revisión de la versión preliminar de la Entrega 3

Qué estaba mal o faltaba en `Contenido Entrega 3/` y cómo se resolvió en `Contenido Entrega 3 mejoras/`.

La carpeta preliminar **no se tocó**: queda como registro del punto de partida y para comparar las dos versiones. Todo lo nuevo está en esta carpeta.

---

## Resumen rápido

| | Preliminar | Mejorada |
|---|---|---|
| Dataset de entrada | `dataset_nueva_columna.zip` (sin codificar) | `dataset_codificado.zip` (el último de la Entrega 2) |
| Partición train/test | Aleatoria | Por fecha: train hasta el 14/12, test del 15 al 18/12 |
| Hiperparámetros | Fijos a mano, sin justificar | Búsqueda en grilla con validación agrupada por fecha, tabla de justificación |
| Umbral de decisión | 0,5 fijo | Elegido por F1 sobre el train (sin mirar el test) |
| Métricas de has_surge | Recall, precision, F1, ROC-AUC | + PR-AUC, F1 macro/weighted, curvas ROC y PR, líneas base |
| Modelos de price | Lineal sin regularizar y árbol, sin surge_multiplier | Ridge, árbol y random forest, cada uno con y sin surge_multiplier |
| Interpretación | No había | Importancia por familias, odds ratio, reglas del árbol, deciles de riesgo, hipótesis H1–H6 |
| Tercer análisis | Multiclase de Uber (circular) | K-Means de rutas (objetivo de la Entrega 1) |
| Informe | `.md` con emojis y links locales de Windows | `Entrega3_Grupo11.docx` con el formato de la Entrega 2 |
| Dataset de salida | No había | `datasets/dataset_modelado_price.zip` y `datasets/dataset_modelado_surge.zip` |

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
Lo medimos: con partición aleatoria el PR-AUC del random forest sale **un 49% más alto** (0,202 frente a 0,135), y el random forest parece mejor que el árbol cuando no lo es.
→ Test = 4 fechas posteriores; los hiperparámetros se eligen con `GroupKFold` por fecha dentro del train. La comparación aleatoria vs temporal está en la sección 5.7 del informe.

**3. La clasificación multiclase de Uber era circular.**
Predecía el servicio (`service_tier`) usando `price` y `price_per_mile`. El precio es la variable objetivo del objetivo 1 y depende del servicio elegido: predecir el servicio a partir del precio es ir al revés y no responde ninguna pregunta del proyecto. Tampoco estaba en el plan de la Entrega 2. Además decía "clases balanceadas" cuando Estándar tiene el doble que el resto (33,3%).
→ Se eliminó. En su lugar hay una segmentación de rutas con K-Means (codo y silueta), ligada a un objetivo específico de la Entrega 1 y a las hipótesis H4 y H6.

**4. Los números del informe no se podían reproducir.**
- El informe reporta MAE de regresión, pero `ejecutar_experimentos_sprint3.py` no calcula MAE (lo importa y no lo usa).
- El notebook no tiene ninguna celda ejecutada (sin salidas).
- El script usa una muestra de 100 mil filas para la regresión y el notebook el dataset completo, así que dan resultados distintos.

→ Un solo script (`modelado_entrega3.py`) genera todas las cifras en `resultados/metricas.json` y los CSV. El notebook se arma a partir del mismo código.

### Importantes (requisitos de la consigna que faltaban)

**5. Hiperparámetros sin justificar.** `max_depth = 12`, `10` y `8`, y la `C` por defecto de la regresión logística, sin búsqueda ni explicación. La consigna pide "definir el valor de los parámetros y justificar los utilizados".
→ Búsqueda en grilla para los 6 modelos, tabla con el rol de cada parámetro y por qué se eligió, y curva de validación del árbol que muestra el sobreajuste.

**6. Umbral fijo en 0,5.** Con datos desbalanceados el umbral define el compromiso entre recall y precisión, y la clase de matriz de confusión pide interpretarlo.
→ Se elige con predicciones fuera de fold sobre el train (máximo F1) y se aplica tal cual al test.

**7. Métricas incompletas.** Faltaba el PR-AUC que prometimos en la Entrega 2, no había curvas ROC graficadas, no se reportaban los promedios macro y weighted, y no había líneas base (por ejemplo, "siempre sin recargo", que tiene 91,7% de accuracy).
→ Están todas, más la curva Precisión-Recall y dos líneas base.

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

No son comparables uno a uno, porque la versión preliminar usaba partición aleatoria. Igual conviene tenerlos a mano:

| Métrica | Preliminar | Mejorada | Por qué cambia |
|---|---|---|---|
| Árbol de recargo: recall | 83,4% | 52,2% | Umbral elegido por F1 en vez de 0,5, y test en fechas nuevas |
| Árbol de recargo: precisión | 12,0% | 13,9% | Menos alertas, pero más acertadas |
| Árbol de recargo: F1 | 0,210 | 0,220 | Hiperparámetros ajustados (hojas de ≥ 500 cotizaciones) |
| Árbol de recargo: ROC-AUC | 0,683 | 0,671 | La validación por fecha saca el optimismo de la partición aleatoria |
| Árbol de recargo: PR-AUC | no se reportaba | 0,142 | Métrica principal comprometida en la Entrega 2 |
| Mejor modelo de precio: R² | 0,906 (árbol) | 0,968 (random forest) | 12 productos (`name_*`), `surge_multiplier` y dataset completo |
| Mejor modelo de precio: MAE | USD 1,85 (sin verificar) | USD 1,05 | Ídem; sin `surge_multiplier` da USD 1,33 |

El recall baja porque antes el modelo marcaba "con recargo" a **más de la mitad** de las cotizaciones (57%): detectaba muchos recargos a costa de muchísimas falsas alarmas.

---

## Qué hay en esta carpeta

| Archivo o carpeta | Contenido |
|---|---|
| `Entrega3_Grupo11.docx` | Informe para entregar (formato de la Entrega 2) |
| `REVISION_ENTREGA3_PRELIMINAR.md` | Este documento |
| `modelado_entrega3.py` | Script reproducible: modelos, balanceo, umbral, interpretación, K-Means y exportación de datasets. Corre en ~6 min; `--rapido` lo prueba en 1 min con el 15% de los datos |
| `TPI_Ciencia_de_Datos_Sprint3_Modelado.ipynb` | El mismo código como notebook (en Colab, subir `dataset_codificado.zip` a la sesión) |
| `datasets/dataset_modelado_price.zip` | 636.568 × 75 · Uber + Lyft, con `particion` (train/test), `log_surge` y `log_price` |
| `datasets/dataset_modelado_surge.zip` | 255.953 × 64 · Lyft sin Shared, con `particion`, sin `price` ni `surge_multiplier` |
| `graficos/` | Las 10 figuras del informe |
| `resultados/` | `metricas.json`, búsquedas de hiperparámetros, comparación de balanceo, reporte de clasificación, importancias, odds ratio, deciles, predicciones del test y clusters |
| `requirements.txt` | Dependencias (incluye `imbalanced-learn`) |

Para regenerar todo: `pip install -r requirements.txt` y `python modelado_entrega3.py` desde esta carpeta (lee `../Contenido Entrega 2/Dataset Codificado/dataset_codificado.zip`).
