# Cambios respecto de la versión anterior de la Entrega 3

Grupo 11 · Ciencia de Datos 5K1 · UTN FRC

Este documento resume qué cambió entre la versión anterior de esta carpeta (commit `78f5fc7`, cuando se llamaba `Contenido Entrega 3 mejoras/`) y la versión actual, por qué y cómo cambian los resultados. El borrador preliminar (antes `Contenido Entrega 3/`) ahora está en la subcarpeta `Cosas que hicimos en casa/`, sin cambios en su contenido.

---

## Resumen en una tabla

| # | Cambio | Por qué | Dónde se ve |
|---|---|---|---|
| 1 | **Matriz de beneficio** para elegir el umbral de decisión, con análisis de sensibilidad del costo | El umbral de máximo F1 no tiene un significado de negocio. La matriz pone en dólares cada casilla (VP, FP, FN, VN) y elige el umbral que más conviene | Informe 5.4 · Figura 6 · Colab sección 9 |
| 2 | **Puntos de operación**: hasta dónde se pueden bajar los falsos negativos y cuánto cuesta en falsos positivos | Para justificar qué umbral definir y mostrar el límite del dominio | Informe 5.4 · Colab sección 9 |
| 3 | **Intervalos de confianza del 95%** (bootstrap de bloques por hora) | Para justificar los niveles de certeza de las métricas | Informe 4.2 y 5.4 · Colab secciones 5 y 8 |
| 4 | **Validación cruzada mezclada** (5 folds estratificados) como control de la temporal | Para comparar la validación por fecha con una mezclada; en las dos el balanceo se aplica solo al entrenamiento y se valida con datos reales | Informe 3.1 y 5.7 · Colab sección 12 |
| 5 | **Grillas de hiperparámetros extendidas** | Varios valores elegidos estaban en el borde de la grilla (C, alpha, profundidades, hojas); si el óptimo está en el borde, el parámetro no queda justificado | Informe 4.1 y 5.2 · `6_Resultados/*busqueda*.csv` |
| 6 | **Odds ratio con regularización débil (C = 1)** | Con la C muy chica de la logística elegida, los odds ratio quedaban encogidos hacia 1 | Informe 5.6 · Figura 8 |
| 7 | **¿Hace falta balancear?** Comparación sin balanceo con el umbral ajustado | "Sin balanceo no detecta nada" solo vale con umbral 0,5 | Informe 5.3 · Colab sección 7 |
| 8 | **Nuevas líneas base**: tasa histórica de la zona de origen y "siempre con recargo" | Comparar solo contra el azar agrandaba lo que aprenden los modelos | Informe 5.1 · Colab sección 6 |
| 9 | **Precio con y sin `surge_multiplier`** en todos los resúmenes | El multiplicador y el precio salen del mismo cálculo de la plataforma: lo honesto es mostrar los dos números | Informe 1 y 4.2 · Colab sección 5 · `DEFENSA_PROFE.md` |
| 10 | **Colab de presentación reorganizado** y **árbol de decisión** incluido | Foco en modelos, pruebas, decisiones, mejoras, accuracy, matriz de beneficio y curva ROC-AUC | `2_Presentacion_Colab/` (notebook y PDF) |
| 11 | **Corrida más rápida**: de ~25 minutos a ~15 minutos | Más procesos en paralelo y grillas de random forest y gradient boosting acotadas | `3_Codigo/modelado_entrega3.py` |
| 12 | **Carpetas renombradas**: `Contenido Entrega 3 mejoras/` pasó a ser `Contenido Entrega 3/`, y el borrador (antes `Contenido Entrega 3/`) quedó dentro, en `Cosas que hicimos en casa/` | Una sola carpeta para la Entrega 3, con el borrador como registro | Raíz del repositorio · links del README y del botón de Colab actualizados |

---

## Cómo cambian los resultados del modelo de recargo

El modelo elegido sigue siendo **gradient boosting con pesos de clase** (mismos hiperparámetros: `learning_rate = 0,05`, `max_leaf_nodes = 15`). Lo que cambia es el **umbral de decisión**, que ahora sale de la matriz de beneficio:

| Métrica (período de prueba) | Versión anterior (umbral de máximo F1, 0,55) | Versión actual (umbral de la matriz de beneficio, 0,57) |
|---|---:|---:|
| Accuracy | 63,3% | **68,6%** (IC 95%: 67,3% a 69,8%) |
| Accuracy balanceada | 62,1% | **60,8%** (IC 95%: 59,4% a 62,1%) |
| Precisión | 13,1% | **13,5%** (IC 95%: 12,7% a 14,3%) |
| Recall | 60,7% | **51,4%** (IC 95%: 48,4% a 54,5%) |
| Cotizaciones con aviso | 38,5% | **31,7%** |
| Beneficio (USD cada 1.000 cotizaciones) | USD 55 | **USD 56** (IC 95%: 35 a 78) |
| ROC-AUC / PR-AUC | 0,676 / 0,140 | 0,676 / 0,140 (no dependen del umbral) |

**Lectura:** la matriz de beneficio pide un modelo **más selectivo**. Avisa menos, con algo más de precisión, a cambio de detectar menos recargos. Como cada falsa alarma cuesta (supuesto: USD 1) y cada recargo evitado vale en promedio USD 8,73, conviene avisar solo cuando la probabilidad de recargo supera el 11,4%. Si una falsa alarma costara USD 2 o más, no convendría avisar nunca: es el límite de lo que permiten estos datos.

## Otros resultados nuevos

- **Línea base por zona de origen:** sin ningún modelo ya logra PR-AUC 0,118. El modelo elegido la supera por +0,022 (IC 95%: 0,015 a 0,029): la mejora es chica pero no es casualidad.
- **Validación cruzada mezclada:** da PR-AUC más altos que la temporal (por ejemplo, random forest 0,312 contra 0,126). Confirma que mezclar fechas infla las métricas; por eso se elige con la temporal.
- **Balanceo:** con el umbral ajustado, sin balanceo rinde casi igual (gradient boosting: USD 54 contra USD 56 cada 1.000 cotizaciones). Balancear mueve el umbral, no mejora el ranking.
- **Odds ratio (C = 1):** Northeastern 1,29, Boston University 1,24, Fenway 1,23, Back Bay 1,22, North End 0,38 y Haymarket 0,37. Antes, con la regularización fuerte, North End aparecía en 0,52.
- **Precio:** sin cambios en los resultados: random forest con surge, error medio USD 1,08 (IC 95%: 1,07 a 1,09) y R² 0,967; sin el multiplicador, USD 1,32 y R² 0,928.
- **Hiperparámetros:** con las grillas extendidas, los valores elegidos quedaron adentro. La logística pasó de C = 0,0001 a C = 0,00003; random forest de recargo pasó de profundidad 16 a 24 (su validación es plana desde 16: 0,1261 contra 0,1262) y el resto se mantuvo.
- **Balanceo con umbral ajustado:** en random forest, sin balanceo incluso rinde un poco mejor (USD 61 contra USD 55 cada 1.000 cotizaciones).

## Cambios en archivos

| Archivo | Qué cambió |
|---|---|
| `3_Codigo/modelado_entrega3.py` | Matriz de beneficio, sensibilidad, puntos de operación, intervalos de confianza, validación cruzada mezclada, línea base por zona, odds ratio con C = 1, comparación sin balanceo con umbral ajustado, grillas extendidas y más paralelismo |
| `1_Informe/Entrega3_Grupo11.docx` | Tablas y textos actualizados; secciones nuevas en 5.3, 5.4 y 5.7; nueva Figura 6; limitaciones, plan y referencias actualizados |
| `2_Presentacion_Colab/` | Notebook reorganizado (14 secciones) y PDF regenerado |
| `5_Graficos/` | Nueva `fig06_recargo_matriz_beneficio.png`; las figuras siguientes se renumeraron (`fig07` a `fig11`) |
| `6_Resultados/` | `metricas.json` con las claves nuevas (`A_matriz_beneficio`, `A_sensibilidad_costo`, `A_puntos_operacion`, `A_ic95`, `B_ic95`, `A_cv_mezclada`, `A_sin_balanceo_umbral`, `A_odds_info`) y CSV de búsquedas con las grillas extendidas |
| `DEFENSA_PROFE.md`, `LEEME.md`, `Modelos/README.md`, `COMO_SE_PREDICE_EL_SURGE.md`, `EXPLICACION_KMEANS_PRODUCTOS.md` y `7_Revision_version_preliminar/` | Cifras y referencias a figuras actualizadas |
