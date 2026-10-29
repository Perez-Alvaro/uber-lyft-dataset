# GUION DE DEFENSA ORAL — SPRINT 3: MODELADO PREDICTIVO Y EVALUACIÓN

**Cátedra:** Ciencia de Datos — Curso 5K1 (UTN-FRC)  
**Proyecto:** Determinantes de Precio y Tarifa Dinámica en Uber y Lyft (Boston, MA)  
**Grupo 11:** Álvaro Pérez, Juan Ignacio Cremona, Ignacio Gil, Federico Gon, Sofía Medina, Facundo Dagnino Dailly  
**Soporte Visual:** `Presentacion_Entrega3_Grupo11.ipynb` (Cuaderno Colab Sintetizado de 5 Secciones y 14 Celdas)  
**Tiempo Objetivo de Exposición:** **6 minutos 30 segundos** (Rango reglamentario: 5 a 7 minutos)  

---

## 1. PAUTAS DE ENTREGA Y COORDINACIÓN DE LA DEFENSA ORAL

Para asegurar una presentación oral de excelencia académica y profesionalismo técnico ante el tribunal docente de la cátedra:

1. **Ritmo y Tono:** Mantener un ritmo vocal natural de **140 a 145 palabras por minuto** (el guión está calibrado a exactamente 940 palabras habladas para 6:30 min). El tono debe ser seguro, analítico y enfocado en la justificación metodológica y el impacto de negocio, evitando la lectura mecánica de código.
2. **Sincronización con el Colab:** Proyectar el cuaderno sintetizado `Presentacion_Entrega3_Grupo11.ipynb`. Cada bloque del guión cuenta con una indicación visual explícita `[Avanzar a Celda...]` para garantizar que la pantalla y la voz marchen en sincronía estricta.
3. **Distribución del Equipo:** Las 5 secciones están concebidas para ser expuestas fluidamente por uno, dos o más integrantes mediante transiciones naturales, o por un expositor principal con el equipo apoyando en la ronda de repreguntas.
4. **Foco en Decisiones de Ingeniería:** El tribunal evaluará especialmente el criterio técnico: por qué se descartaron ciertas técnicas (ej. split aleatorio, SMOTE), cómo se tradujeron las probabilidades a dinero real y cómo se evitaron sesgos y fuga de información (*Data Leakage*).

---

## 2. MATRIZ DE ALINEACIÓN ESTRUCTURAL (COLAB SINTETIZADO VS. GUION ORAL)

| Sección Colab | Celdas Cuaderno | Soporte Visual Primario | Ventana Temporal | Duración | Mensaje Núcleo a Transmitir |
| :---: | :---: | :--- | :---: | :---: | :--- |
| **Sección 1** | Celdas 02 y 03 | Gráfico `fig04_recargo_balanceo.png` y resumen de partición | `00:00 - 01:15` | 1 min 15 s | Blindaje contra Data Leakage, validación temporal consecutiva (14 días train / 4 días test ciegos) y pesos de clase sin inventar datos sintéticos. |
| **Sección 2** | Celdas 04, 05 y 06 | Gráfico `fig01_precio_real_vs_predicho.png` y tabla de modelos | `01:15 - 02:45` | 1 min 30 s | Random Forest predice el precio con $R^2=0.967$ y MAE USD 1.08; el precio es determinístico (producto y distancia); Gradient Boosting lidera clasificación. |
| **Sección 3** | Celdas 07, 08 y 09 | Gráficos `fig05_confusion.png` y `fig06_beneficio.png` | `02:45 - 04:15` | 1 min 30 s | Descarte del umbral 0.50 ciego; calibración en umbral 0.57 que maximiza el beneficio en **+USD 56.11 cada 1.000 cotizaciones** (2.534 recargos detectados). |
| **Sección 4** | Celdas 10 y 11 | Gráfico `fig07_recargo_curvas_roc_pr.png` (Panel doble) | `04:15 - 05:30` | 1 min 15 s | Capacidad discriminativa global (ROC-AUC 0.676 y PR-AUC 0.140 sobre base de 8.3%); justificación causal del techo físico de ~0.68. |
| **Sección 5** | Celdas 12 y 13 | Gráfico `fig11_productos_kmeans.png` y balance de hipótesis | `05:30 - 06:30` | 1 min 00 s | Balance de hipótesis (H1 confirmada, H5 refutada, H6 confirmada con K-Means $k=3$, $s=0.682$); recomendaciones de negocio y cierre formal. |

---

## 3. GUION VERBAL LITERAL PASO A PASO (TEXTO DIRECTO DE EXPOSICIÓN ORAL)

### [00:00 - 01:15] SECCIÓN 1: CÓMO ENTRENAMOS LOS MODELOS (Preparación Básica, Validación Temporal, Balanceo)

*(Proyectar Celda 02 [Markdown] y avanzar a Celda 03 [Código] del Colab — Soporte visual en pantalla: Resumen de partición y `fig04_recargo_balanceo.png`)*

> **[Pausa inicial, contacto visual con el tribunal evaluador]**  
> "Buenas tardes profesores. En este Sprint 3 completamos el Modelado y Evaluación del ciclo CRISP-DM para responder: qué determina el precio base del viaje y si es posible anticipar la tarifa dinámica en Lyft.
>
> Para garantizar solidez metodológica y evitar vicios empíricos, fijamos tres decisiones clave:
>
> **Primero, control de Data Leakage:** prohibimos taxativamente `price` y `surge_multiplier` para clasificar el recargo, ya que contienen directamente el objetivo. Cualquier transformación se ajustó únicamente sobre entrenamiento.
>
> **Segundo, validación temporal estricta:** el 95.7% de las cotizaciones del mismo minuto y ruta comparten el recargo. Un split aleatorio mezclaría cotizaciones gemelas en train y test, inflando falsamente el PR-AUC de 0.140 a 0.309. Por eso dividimos por fechas: entrenamos con 196.558 casos de 14 fechas consecutivas y evaluamos en 59.395 casos de 4 fechas posteriores totalmente ciegas.
>
> **[Señalar el gráfico `fig04_recargo_balanceo.png` en pantalla]**  
> **Tercero, desbalance de clases:** con solo 8.2% de recargos, la Accuracy del 91.7% es engañosa pues un modelo ciego logra 0% de Recall. Descartamos submuestreo porque perdía el 90% de la muestra, y SMOTE porque generaba distorsiones en dummies categóricas. Seleccionamos pesos de clase (`class_weight='balanced'`), penalizando 11 veces más el error minoritario sobre datos 100% reales."

---

### [01:15 - 02:45] SECCIÓN 2: COMPARACIÓN DE LOS MODELOS QUE ENTRENAMOS

*(Avanzar a Celda 04 [Markdown], Celda 05 [Código] y Celda 06 [Código] del Colab — Soporte visual en pantalla: `fig01_precio_real_vs_predicho.png` y Tabla Comparativa de Modelos)*

> **[Transición fluida, tono analítico]**  
> "En la comparación de algoritmos, optimizamos dos familias bajo la misma partición temporal.
>
> Para clasificar el recargo dinámico evaluamos cuatro modelos:
> - Regresión Logística regularizada L2, cuyos Odds Ratios revelaron que orígenes como Back Bay aumentan la probabilidad de recargo un 29% respecto a South Station, mientras North End la reduce un 35%.
> - Árbol de Decisión, con poda preventiva en profundidad 6 para evitar sobreajuste.
> - Random Forest, con gran capacidad discriminativa.
> - Y Gradient Boosting (`HistGradientBoostingClassifier`), modelo campeón con un PR-AUC de 0.136 en validación al incorporar limpiamente la tasa histórica de la ruta.
>
> **[Señalar el gráfico `fig01_precio_real_vs_predicho.png` en pantalla]**  
> En la regresión continua del precio modelamos el logaritmo de la tarifa para estabilizar la varianza de las gamas ejecutivas.
>
> Como observan en la Figura 1, el campeón indiscutido fue Random Forest: alcanzó un R² de 0.967 y un error medio (MAE) de apenas 1 dólar con 08 centavos. Tres de cada cuatro viajes se predicen con un error menor al 10%. Incluso a ciegas sin el multiplicador de recargo, mantiene un MAE de 1 dólar con 32.
>
> La importancia por permutación confirmó que el servicio y la distancia explican más del 95% del valor, mientras que el clima no aporta nada, con una caída de R² despreciable de dos millonésimas. Esto confirma la Hipótesis 1 y refuta la Hipótesis 5: el clima no encarece las tarifas base."

---

### [02:45 - 04:15] SECCIÓN 3: MATRIZ DE CONFUSIÓN Y MATRIZ DE BENEFICIO ECONÓMICO

*(Avanzar a Celda 07 [Markdown], Celda 08 [Código] y Celda 09 [Código] del Colab — Soporte visual en pantalla: `fig05_recargo_matrices_confusion.png` y `fig06_recargo_matriz_beneficio.png`)*

> **[Tono enfático y de negocio]**  
> "Llegamos al aporte metodológico central: ¿cómo evaluamos el clasificador de recargo sobre los 59.395 casos de prueba futuros?
>
> **[Señalar la matriz de confusión `fig05_recargo_matrices_confusion.png` en pantalla]**  
> En el umbral estándar de 0.50 sin balancear tendríamos cero detecciones. Nuestro modelo calibrado detecta 2.534 recargos reales, logrando un Recall del 51.4% y una Accuracy Balanceada del 60.8%, superando ampliamente al 50% del azar.
>
> Pero en un entorno real no decidimos con un corte ciego de 0.50 ni buscando un F1 abstracto. Diseñamos una Matriz de Beneficio Económico que traduce las métricas a dinero tangible:
> - Cada Verdadero Positivo ahorra al usuario un promedio de +7 dólares con 73 centavos, al postergar el viaje o pedir Uber.
> - Cada Falso Positivo le cuesta -1 dólar en tiempo perdido de espera innecesaria.
>
> La precisión mínima de indiferencia es de 11.45%.
>
> **[Señalar la curva de beneficio `fig06_recargo_matriz_beneficio.png` en pantalla]**  
> Operar con el umbral 0.50 genera una ganancia de +USD 37 cada 1.000 cotizaciones. Sin embargo, al optimizar la función económica encontramos el punto óptimo exacto en el umbral 0.57.
>
> Este corte selectivo reduce falsas alarmas y maximiza el retorno a +56 dólares con 11 centavos cada 1.000 cotizaciones. Y el análisis de sensibilidad confirma su rentabilidad aun si el costo de una falsa alarma aumenta un 50%."

---

### [04:15 - 05:30] SECCIÓN 4: CURVA ROC (Y PR)

*(Avanzar a Celda 10 [Markdown] y Celda 11 [Código] del Colab — Soporte visual en pantalla: `fig07_recargo_curvas_roc_pr.png`)*

> **[Rigor analítico y estadístico]**  
> "Para evaluar la capacidad intrínseca del clasificador independientemente del umbral operativo, examinamos las curvas ROC y Precision-Recall sobre el conjunto de prueba ciego.
>
> **[Señalar la curva ROC a la izquierda del panel doble]**  
> En el panel izquierdo, la Curva ROC alcanza un área de 0.676 con Gradient Boosting y 0.675 con Random Forest, muy por encima de la diagonal de azar de 0.50, certificando capacidad real de ordenamiento de riesgo en fechas futuras.
>
> **[Señalar la curva Precision-Recall a la derecha del panel doble]**  
> Sin embargo, ante el fuerte desbalance la métrica determinante es Precision-Recall. Como observamos a la derecha, la tasa base poblacional es de solo 8.3%. Nuestro modelo alcanza un PR-AUC de 0.140, superando en más de un 70% a la línea base de mercado.
>
> ¿Por qué todos los algoritmos encuentran un techo en torno a 0.68 de ROC y 0.14 de PR?
>
> Por una razón causal de micro-mercado: la tarifa dinámica en Lyft es endógena, determinada por el balance instantáneo de choferes conectados y solicitudes en minutos específicos. Con variables exógenas públicas como clima, ruta y hora, 0.68 representa el límite físico de predictibilidad. El modelo extrae toda la señal disponible sin sobreajustar."

---

### [05:30 - 06:30] SECCIÓN 5: RESULTADOS FINALES Y BALANCE DE HIPÓTESIS

*(Avanzar a Celda 12 [Markdown] y Celda 13 [Código] del Colab — Soporte visual en pantalla: Tabla de Hipótesis H1-H6 y `fig11_productos_kmeans.png`)*

> **[Conclusión, síntesis ejecutiva y cierre formal]**  
> "Para concluir nuestra defensa, sintetizamos el balance de hipótesis:
>
> 1. **En Regresión del Precio:** confirmamos la Hipótesis 1. El valor del viaje se modela con 96.7% de precisión ($R^2=0.967$, MAE USD 1.08) según producto y distancia. Y refutamos categóricamente la Hipótesis 5: el clima adverso no encarece las tarifas base.
> 2. **En Tarifa Dinámica:** con pesos de clase y umbral económico 0.57, logramos un beneficio neto de +USD 56.11 cada 1.000 cotizaciones, capturando el 51.4% de los recargos futuros con 60.8% de accuracy balanceada.
> 3. **En Aprendizaje No Supervisado:** confirmamos la Hipótesis 6. K-Means con $k=3$ y silueta de 0.682 identificó tres familias tarifarias simétricas entre Uber y Lyft: Económica, Intermedia y Premium.
> 4. **En Rigor Metodológico:** la validación temporal en bloques sucesivos blindó al proyecto contra fuga de datos, garantizando métricas reproducibles en producción.
>
> Cumplimos así todos los compromisos del Sprint 3 bajo el marco CRISP-DM. Muchas gracias, y quedamos a disposición de sus preguntas."

---

## 4. TABLA DE AUDITORÍA CUANTITATIVA RIGUROSA (1:1 CON `metricas.json`)

Para garantizar total consistencia ante preguntas numéricas del tribunal evaluador, la siguiente tabla audita cada valor mencionado en el guión frente al archivo maestro `Contenido Entrega 3/6_Resultados/metricas.json`:

| Parámetro / Métrica | Valor Verbalizado en el Guión | Valor Exacto en `metricas.json` | Clave JSON / Ruta de Verificación | Estado |
| :--- | :---: | :---: | :--- | :---: |
| **Volumen Total Lyft (sin Shared)** | 255.953 cotizaciones | `255953` | `d['A_datos']['filas']` | ✅ Verificado |
| **Casos Positivos de Recargo (`has_surge=1`)**| 20.975 (8.2%) | `20975` (8.195%) | `d['A_datos']['positivos']`, `d['A_datos']['tasa']` | ✅ Verificado |
| **Conjunto de Entrenamiento (Train)** | 196.558 filas (14 fechas) | `196558` (14 fechas) | `d['A_datos']['train']`, `d['A_datos']['fechas_train']` | ✅ Verificado |
| **Conjunto de Evaluación (Test ciego)** | 59.395 filas (4 fechas) | `59395` (4 fechas) | `d['A_datos']['test']`, `d['A_datos']['fechas_test']` | ✅ Verificado |
| **Tasa de Positivos en Test** | 8.3% | `0.08297` (8.30%) | `d['A_datos']['tasa_test']` | ✅ Verificado |
| **Accuracy Trivial (Línea Base 'Siempre No')**| 91.7% | `0.91703` (91.70%) | `d['A_lineas_base'][0]['accuracy']` | ✅ Verificado |
| **Recall Trivial (Línea Base 'Siempre No')** | 0.0% | `0.0` | `d['A_lineas_base'][0]['recall']` | ✅ Verificado |
| **PR-AUC Inflado con Partición Mezclada** | > 0.309 (más del doble) | `0.30910` / `0.31170` | `d['A_cv_mezclada'][2]['pr_auc_mezclada']` | ✅ Verificado |
| **PR-AUC Real con Validación Temporal** | 0.126 (RF) / 0.136 (GB) | `0.12620` / `0.13593` | `d['A_cv_mezclada'][2]['pr_auc_temporal']` | ✅ Verificado |
| **Modelo Campeón de Recargo** | Gradient Boosting | `"Gradient boosting"` | `d['A_elegido']` | ✅ Verificado |
| **Técnica de Balanceo Seleccionada** | Pesos de clase (`balanced`) | `"pesos"` / `"balanced"` | `d['A_tecnica_elegida']['clave']` | ✅ Verificado |
| **Ahorro por Verdadero Positivo ($V_{TP}$)** | +USD 7.73 | `7.73380` | `d['A_matriz_beneficio']['vp']` | ✅ Verificado |
| **Costo por Falso Positivo ($C_{FP}$)** | -USD 1.00 | `-1.0` | `d['A_matriz_beneficio']['fp']` | ✅ Verificado |
| **Precisión Mínima Requerida ($p^*$)** | 11.45% | `0.11450` | `d['A_matriz_beneficio']['precision_minima']` | ✅ Verificado |
| **Beneficio en Umbral 0.50 (GB)** | +USD 37 / 1.000 cotiz. | `37.438` | `d['A_finales']['Gradient boosting']['umbral_0.5']['beneficio_1000']` | ✅ Verificado |
| **Umbral Óptimo de Beneficio** | 0.57 (0.5722) | `0.57220` | `d['A_finales']['Gradient boosting']['umbral_opt']['umbral']` | ✅ Verificado |
| **Beneficio Óptimo por 1.000 Cotizaciones** | +USD 56.11 (+USD 56) | `56.10659` | `d['A_finales']['Gradient boosting']['umbral_opt']['beneficio_1000']` | ✅ Verificado |
| **Verdaderos Positivos Detectados (TP Test)**| 2.534 recargos | `2534` | `d['A_finales']['Gradient boosting']['umbral_opt']['tp']` | ✅ Verificado |
| **Falsos Positivos en Test (FP Test)** | 16.265 alertas falsas | `16265` | `d['A_finales']['Gradient boosting']['umbral_opt']['fp']` | ✅ Verificado |
| **Verdaderos Negativos en Test (TN Test)** | 38.202 casos | `38202` | `d['A_finales']['Gradient boosting']['umbral_opt']['tn']` | ✅ Verificado |
| **Falsos Negativos en Test (FN Test)** | 2.394 no detectados | `2394` | `d['A_finales']['Gradient boosting']['umbral_opt']['fn']` | ✅ Verificado |
| **Recall en Test con Umbral 0.57** | 51.4% | `0.51420` (51.42%) | `d['A_finales']['Gradient boosting']['umbral_opt']['recall']` | ✅ Verificado |
| **Accuracy Balanceada en Test (GB 0.57)** | 60.8% | `0.60779` (60.78%) | `d['A_finales']['Gradient boosting']['umbral_opt']['accuracy_balanceada']`| ✅ Verificado |
| **Accuracy Global en Test (GB 0.57)** | 68.6% | `0.68585` (68.58%) | `d['A_finales']['Gradient boosting']['umbral_opt']['accuracy']` | ✅ Verificado |
| **Precisión en Test (GB 0.57)** | 13.5% | `0.13479` (13.48%) | `d['A_finales']['Gradient boosting']['umbral_opt']['precision']` | ✅ Verificado |
| **ROC-AUC en Test (GB)** | 0.676 | `0.67636` | `d['A_finales']['Gradient boosting']['umbral_opt']['roc_auc']` | ✅ Verificado |
| **PR-AUC en Test (GB)** | 0.140 | `0.14008` | `d['A_finales']['Gradient boosting']['umbral_opt']['pr_auc']` | ✅ Verificado |
| **Odds Ratio Mayor (Zona Back Bay)** | 1.287 (+29% riesgo) | `1.287` | `d['A_odds_elegida']` (vs South Station) | ✅ Verificado |
| **Odds Ratio Menor (Zona North End)** | 0.646 (-35% riesgo) | `0.646` | `d['A_odds_elegida']` (vs South Station) | ✅ Verificado |
| **$R^2$ Random Forest Precio (con surge)** | 0.967 (96.7%) | `0.96707` | `d['B_regresion'][6]['r2']` | ✅ Verificado |
| **MAE Random Forest Precio (con surge)** | USD 1.08 | `1.07765` | `d['B_regresion'][6]['mae']` | ✅ Verificado |
| **$R^2$ Random Forest Precio (sin surge)** | 0.928 | `0.92845` | `d['B_regresion'][5]['r2']` | ✅ Verificado |
| **MAE Random Forest Precio (sin surge)** | USD 1.32 | `1.32065` | `d['B_regresion'][5]['mae']` | ✅ Verificado |
| **Porcentaje de Viajes con Error $\le 10\%$** | 75.0% | `0.74956` (74.96%)| `d['B_pruebas']['Random forest']['p75_error']` | ✅ Verificado |
| **Impacto Climático en Precio (caída $R^2$)** | 0.000002 (despreciable) | `2.446e-06` | `d['B_importancia']['grupos'][5]['caida']` | ✅ Verificado |
| **Clustering K-Means ($k=3$) Silueta / Codo** | $s=0.682$, codo = 2.00 | `0.682`, `2.004` | `d['C']['silueta'][1]`, `d['C']['inercia'][1]` | ✅ Verificado |

---

## 5. MATRIZ DE DEFENSA TÉCNICA Y PREGUNTAS DEL TRIBUNAL DOCENTE (FAQ / REPREGUNTAS UTN)

Esta sección equipa a los alumnos para responder con solvencia las preguntas más punzantes que los docentes de la cátedra suelen formular en el coloquio:

#### P1: "¿Por qué no usan Accuracy como métrica principal si su modelo sin balancear daba 91.7%?"
> **Respuesta:** "Porque en un escenario con 91.8% de cotizaciones sin recargo, un clasificador ciego que responda siempre 'sin recargo' obtiene un 91.7% de accuracy diciendo que nunca hay recargo. Ese modelo tiene un Recall del 0%, no detecta ningún recargo y carece de todo valor de negocio. Por eso la cátedra y las buenas prácticas exigen usar métricas insensibles a la clase mayoritaria como PR-AUC, Accuracy Balanceada y Recall, que en nuestro modelo calibrado alcanzan 60.8% y 51.4% respectivamente."

#### P2: "¿Por qué afirman que una partición aleatoria clásica es metodológicamente incorrecta en este dataset?"
> **Respuesta:** "Porque en este dataset, en el 95.7% de las cotizaciones que ocurren dentro de la misma ruta y el mismo minuto, todos los productos de Lyft comparten el recargo. Si aplicáramos un `train_test_split` aleatorio, cotizaciones gemelas de ese mismo minuto caerían una en entrenamiento y otra en prueba. El algoritmo memorizaría la cotización hermana y el PR-AUC subiría engañosamente de 0.140 a 0.309 (más del doble). La única forma de medir generalización honesta hacia el futuro es mediante validación temporal estricta por bloques de fechas sucesivos."

#### P3: "¿Por qué falló SMOTE frente a los pesos de clase?"
> **Respuesta:** "SMOTE genera ejemplos sintéticos interpolando linealmente entre vecinos más cercanos. En variables numéricas continuas funciona bien, pero en nuestro dataset el 90% de las predictoras son dummies categóricas (como zonas o productos). SMOTE termina creando combinaciones geométricas imposibles, como '0.4 de Back Bay y 0.6 de Fenway'. Los árboles memorizan esos artefactos sintéticos y pierden generalización sobre datos reales, haciendo que el PR-AUC caiga a 0.113. Los pesos de clase (`class_weight='balanced'`), en cambio, sensibilizan la función de costo directamente sobre el 100% de los datos reales observados."

#### P4: "¿De dónde surgen los valores de la Matriz de Beneficio (+USD 7.73 y -USD 1.00)?"
> **Respuesta:** "Analizamos las cotizaciones con recargo en el entrenamiento: el multiplicador promedio es de 1.42 y el sobreprecio neto medio respecto a la tarifa base es de USD 8.73. Si el usuario recibe la alerta y posterga el viaje unos minutos o solicita Uber, ahorra ese sobreprecio (ahorro neto medio de +USD 7.73 descontando pequeños costos de ajuste). Por el contrario, si el modelo da una falsa alarma (FP), el usuario pierde tiempo abriendo otra aplicación o esperando innecesariamente, lo que valorizamos conservadoramente en -USD 1.00. La fórmula de precisión mínima requerida es $p^* = \frac{C_{FP}}{V_{TP} + C_{FP}} = 11.45\%$. Nuestro modelo supera esa valla (13.5%), logrando el beneficio máximo de +USD 56.11 cada 1.000 cotizaciones en el umbral 0.57."

#### P5: "¿Por qué el ROC-AUC no supera 0.68 a pesar de usar Gradient Boosting y Random Forest?"
> **Respuesta:** "No es una deficiencia algorítmica ni de hiperparámetros, sino una restricción fundamental de la información disponible. La tarifa dinámica de Lyft es un mecanismo endógeno de micro-mercado en tiempo real (relación instantánea entre choferes conectados y pedidos concurrentes). Nuestro dataset dispone de variables macro-ambientales (clima, distancias, hora). Esas variables permiten detectar zonas calientes estructurales (como Back Bay o Fenway), pero no capturan la fluctuación de conductores minuto a minuto. Con los datos públicos disponibles, 0.68 representa el límite físico del poder predictivo."

#### P6: "¿Por qué transformaron el precio a escala logarítmica (`log(price)`) en la regresión?"
> **Respuesta:** "La distribución del precio en viajes presenta una asimetría positiva muy pronunciada: la mayoría de los viajes económicos se concentran entre 5 y 15 dólares, pero existen viajes de lujo (como Black SUV) que superan los 80 dólares. Si entrenáramos directamente sobre la escala lineal, los errores cuadráticos en las tarifas altas dominarían la función de pérdida y descalibrarían el modelo en los viajes comunes. La transformación logarítmica estabiliza la varianza residual (homocedasticidad) y minimiza el error porcentual relativo."
