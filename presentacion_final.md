# Inteligencia Predictiva y Tarificación Dinámica en el Ridesharing de Boston
## Presentación Ejecutiva y Data Storytelling — Uber & Lyft en Boston, MA
**Institución:** Universidad Tecnológica Nacional — Facultad Regional Córdoba (UTN - FRC)  
**Cátedra:** Ciencia de Datos — Curso 5K1 | **Equipo:** Grupo 11  
**Duración Estricta:** 10 minutos (~1.300 a 1.500 palabras de guión oral continuo)  
**Fecha:** Noviembre 2026 | **Integridad:** Datos Reales Auditados 1:1 con Repositorio

---

## 1. Lineamientos Estratégicos de la Presentación

Una exposición ejecutiva de diez minutos ante decisores de negocio y la cátedra académica no debe concebirse como una lectura técnica de notebooks o scripts. Para maximizar el impacto y la persuasión, el relato se articula en una rigurosa selección de contenidos: se eliminan los tecnicismos redundantes y se destacan las decisiones metodológicas, el impacto económico tangible y la asimetría de costos.

### 1.1 Qué OMITIR con Rigor Taxativo (Elementos Descartados)

| Elemento Técnico a Descartar | Justificación Estratégica del Descarte | Riesgo Mitigado de su Inclusión |
| :--- | :--- | :--- |
| **Bloques de código Python y sintaxis pandas / scikit-learn** | Los directivos y evaluadores buscan entender el impacto de negocio y la validez analítica, no evaluar sintaxis de llamadas a funciones como `df.dropna()` o `GridSearchCV`. El código es el canal de implementación, no el valor del entregable. | Pérdida de atención inmediata, dispersión conceptual y reducción del tiempo disponible para insights clave. |
| **Fórmulas matemáticas abstractas de optimización** | El detalle de las derivadas de la pérdida logarítmica (*log-loss*) o el cálculo interno de divisiones por histogramas en Gradient Boosting es estándar de libro de texto y no aporta diferenciación al caso de Boston. | Fatiga en el auditorio y sensación de exposición académica teórica desconectada de la realidad del transporte. |
| **Tablas masivas de hiperparámetros de modelos descartados** | Describir las 520 combinaciones evaluadas en grillas intermedias para modelos no seleccionados (ej. valores de `C`, `max_depth` o `min_samples_leaf` de opciones subóptimas) agrega ruido irrelevante. | Sobrecarga cognitiva (*cognitive overload*) y entorpecimiento del hilo narrativo principal. |
| **Explicaciones teóricas genéricas de algoritmos estándar** | Definir qué es un ensamble de árboles o cómo funciona una regresión logística ante un tribunal especializado resulta pedagógicamente condescendiente. | Subestimación del receptor y pérdida de valiosos minutos para explicar las soluciones de ingeniería propias. |
| **Detalles anecdóticos de infraestructura de cómputo** | El tiempo de CPU o la memoria de la máquina local utilizada durante los entrenamientos carece de trascendencia estratégica para el producto. | Información accesoria sin ninguna relevancia para la toma de decisiones operativas. |
| **Variables meteorológicas secundarias de impacto nulo** | Detallar coeficientes de presión barométrica, punto de rocío o nubosidad secundaria cuando la prueba empírica demostró que su correlación con la tarifa es cero. | Distracción del hallazgo principal: el clima no incrementa la tarifa base ni dispara automáticamente el recargo. |

### 1.2 Qué DESTACAR con Máxima Prioridad (Aspectos Clave de Negocio)

| Aspecto Estratégico a Destacar | Justificación de Negocio e Impacto Cuantitativo | Métrica de Respaldo Auditada |
| :--- | :--- | :--- |
| **Retorno Financiero y Dólares Reales (Matriz de Beneficio)** | Trasladar las métricas estadísticas abstractas a ganancia neta en dólares por viaje: el modelo genera **+USD 56,11 netos por cada 1.000 cotizaciones** bajo el umbral calibrado de 0,5722. | +USD 56,11 / 1k cotizaciones; sobreprecio medio evitado: USD 8,73; break-even en 11,45% de precisión. |
| **La Asimetría Crítica de Errores (Falsos Negativos >> Falsos Positivos)** | Demostrar por qué no avisar un recargo (**Falso Negativo**) es letal: shock de tarifa (+USD 8,73), sensación de estafa, cancelación del viaje y fuga definitiva del cliente (*churn* de LTV). En contraste, una falsa alarma (**Falso Positivo**) es una alerta preventiva inocua (costo de fricción de USD 1,00) que al confirmarse en tarifa estándar genera alivio y gratitud. | Ratio de costo individual 8,73:1; ratio sistémico con LTV > 15:1; $V_{\text{VP}} = \text{+USD } 7,73$, $C_{\text{FP}} = \text{-USD } 1,00$. |
| **Honestidad Metodológica y Blindaje contra Data Leakage** | Exponer la prohibición categórica de `price` y `surge_multiplier` como predictores en clasificación, garantizando que el modelo opere solo con variables exógenas disponibles al momento de cotizar. | 0% de variables circulares; aislamiento formal de predictores previos al evento. |
| **Validación Temporal Estricta vs. Ilusión del Split Aleatorio** | Demostrar cómo una partición aleatoria estándar inflaba ficticiamente el PR-AUC en un **+147%** (de 0,126 a 0,311) por cotizaciones gemelas concurrentes (95,7% comparten surge). Defender la partición temporal en bloques (14 días train / 4 días test ciegos) como sello de fiabilidad en producción. | 196.558 filas en entrenamiento (14 fechas) y 59.395 filas en evaluación futura ciega (4 fechas). |
| **Trade-offs en el Desbalance Extremo de Clases** | Desmitificar la exactitud trivial: decir siempre "sin recargo" arroja 91,7% de exactitud y 0% de valor. Justificar el balanceo por **pesos de clase (`class_weight='balanced'`)** (11,25:1) rechazando SMOTE por deformar variables dummy geográficas y submuestreo por descartar el 91% de los datos. | Tasa basal real: 8,195%; pesos de clase: 6,124 (recargo) vs 0,544 (estándar); SMOTE distorsionó dummies espaciales. |
| **Desmitificación Científica del Mito Climático** | Refutar la creencia popular de que el mal tiempo encarece la tarifa: la lluvia o la nieve aportan una variación de $R^2$ de apenas dos millonésimas ($2,45 \times 10^{-6}$), pues la tarifa depende de la distancia y gama (>95% varianza). | Caída por permutación $\Delta R^2 = 2,45 \times 10^{-6}$; $|r| \le 0,0015$; tasa de surge con lluvia: 7,85% vs seca: 8,28%. |
| **Segmentación de Familias de Mercado (K-Means)** | Revelar mediante clustering ($k=3$, silueta 0,682) que los 12 productos de Uber y Lyft compiten en tres familias tarifarias perfectamente emparejadas en espejo: Económica, Intermedia y Premium. | 12 productos analizados; clusters Económico (base USD 3,30-6,40), Intermedio (base USD 7,80-12,30) y Premium (base > USD 21). |

---

## 2. Guión Completo de Data Storytelling para 10 Minutos (~1.440 Palabras)

> **Nota para el Orador:** El presente guión está redactado en lenguaje narrativo fluido y continuo, con cadencia profesional calibrada para una locución oral de 140 a 145 palabras por minuto. Se incluyen las marcas de tiempo estimadas y el desglose de palabras por cada uno de los siete ejes temáticos.

```
TIEMPO TOTAL: 10:00 minutos | CONTEO TOTAL: 1.474 palabras | CADENCIA: 147 palabras/minuto
```

---

### Eje 1: Introducción del Dominio — El Dilema de la Movilidad Urbana
**Tiempo:** `00:00 - 01:25` (85 segundos) | **Extensión:** ~185 palabras

Buenos días. Cada semana, cientos de miles de ciudadanos en Boston abren simultáneamente las aplicaciones de Uber y Lyft para trasladarse entre distritos históricos como North End, Back Bay o el Distrito Financiero. Sin embargo, detrás de la aparente simplicidad de pulsar un botón se esconde una de las dinámicas comerciales más opacas de la economía de plataformas: la tarificación algorítmica y el recargo dinámico o *surge pricing*.

Analizamos exhaustivamente seiscientas treinta y seis mil quinientas sesenta y ocho cotizaciones reales registradas entre noviembre y diciembre de dos mil dieciocho para desentrañar cómo compiten ambas plataformas bajo idénticas condiciones urbanas. Descubrimos una marcada asimetría de captura: mientras Lyft reporta explícitamente su multiplicador en cada consulta, Uber implementó una política de tarifa cerrada por adelantado (*upfront pricing*), camuflando el sobreprecio bajo una tarifa integral opaca.

Para el usuario y los gestores urbanos, esta volatilidad algorítmica genera incertidumbre presupuestaria constante. Nuestro objetivo fue transformar ese volumen masivo de datos en inteligencia estratégica: predecir con precisión la tarifa base y anticipar cuándo y dónde se activará el recargo dinámico.

---

### Eje 2: Qué Predecimos — Formulación, Desbalance y Blindaje Metodológico
**Tiempo:** `01:25 - 02:45` (80 segundos) | **Extensión:** ~190 palabras

Para resolver este desafío formulamos una arquitectura predictiva dual, blindada bajo estrictos estándares de integridad científica.

En primer lugar, un modelo de regresión continua sobre seiscientos treinta y seis mil viajes combinados de Uber y Lyft para predecir la tarifa final en dólares, utilizando una transformación logarítmica para estabilizar la asimetría de las gamas de lujo.

En segundo lugar, el núcleo de mayor valor y complejidad: un clasificador binario sobre doscientas cincuenta y cinco mil novecientas cincuenta y tres cotizaciones privadas de Lyft para anticipar la variable `has_surge`, excluyendo el servicio *Shared*, que por diseño comercial opera con tarifa fija y nunca aplica multiplicador dinámico.

Aquí enfrentamos el primer obstáculo crítico: un desbalance de clases extremo. En Boston, apenas el ocho coma dos por ciento de las cotizaciones sufren recargo dinámico. Una regla trivial que afirme ciegamente que *"nunca hay recargo"* obtendría una exactitud del noventa y uno coma siete por ciento, pero con valor comercial nulo al no detectar ningún evento.

Asimismo, blindamos el proceso contra la fuga de datos (*data leakage*): prohibimos taxativamente utilizar el precio y el multiplicador como variables predictoras, garantizando que el sistema aprenda patrones causales previos al viaje.

---

### Eje 3: Algo Importante del ETL — Curaduría Espaciotemporal y Validación Sin Fuga
**Tiempo:** `02:45 - 04:05` (80 segundos) | **Extensión:** ~195 palabras

La fiabilidad de un modelo se define en su ingeniería de datos. En el pipeline de extracción y limpieza depuramos cincuenta y cinco mil noventa y cinco cotizaciones de taxis tradicionales con tarifas nulas, un fenómeno estructural originado en la regulación municipal de Boston que exige taxímetro físico en lugar de tarifas prefijadas.

Un hallazgo crucial de dominio resolvió la trampa horaria: detectamos que los registros crudos estaban tabulados en tiempo UTC con cinco horas de desfase respecto al horario local de Boston. De no corregirlo, el pico matutino de las ocho de la mañana se habría analizado como la una de la tarde. Reconstruimos el tiempo local, vinculamos las coordenadas geodésicas de doce distritos mediante OpenStreetMap e integramos mediciones meteorológicas concurrentes.

Sin embargo, la decisión metodológica más determinante fue el protocolo de validación temporal. Descubrimos que en el noventa y cinco coma siete por ciento de las cotizaciones de un mismo minuto y trayecto, los productos comparten simultáneamente el recargo. Si hubiésemos aplicado una partición aleatoria convencional, cotizaciones gemelas habrían contaminado el entrenamiento y la prueba, inflando artificialmente el rendimiento en un ciento cuarenta y siete por ciento. Implementamos una partición cronológica estricta: catorce fechas consecutivas de entrenamiento y cuatro fechas futuras totalmente ciegas.

---

### Eje 4: Qué Hallazgos Encontramos — EDA y Desmitificación de Hipótesis
**Tiempo:** `04:05 - 05:30` (85 segundos) | **Extensión:** ~210 palabras

La exploración profunda de los datos nos permitió contrastar seis hipótesis fundamentales de negocio y derribar mitos populares arraigados en el imaginario colectivo.

El hallazgo más contundente fue la refutación del mito meteorológico. Ni la lluvia persistente, ni la nieve, ni las bajas temperaturas invernales incrementan la tarifa base ni disparan automáticamente la tarifa dinámica. En nuestro modelo de regresión, la inclusión de todas las variables climáticas aporta una variación de $R^2$ de apenas dos millonésimas, demostrando que las plataformas no cobran más por el mal tiempo per se. La demanda urbana bostoniana se autorregula: ante tormentas severas, los traslados no esenciales se cancelan y la presión sobre la flota se estabiliza.

En contraste, la tarifa final está gobernada de forma casi determinística por dos factores: la distancia física y la gama de servicio seleccionada, que explican más del noventa y cinco por ciento de la varianza del precio.

Mediante agrupamiento K-Means confirmamos que los doce productos del mercado se segmentan óptimamente en tres familias tarifarias en espejo: una franja Económica, una Intermedia y una Premium.

Finalmente, constatamos que el recargo es fuertemente geográfico: mientras en áreas residenciales como North End la tasa de recargo es del uno coma ocho por ciento, en polos universitarios como Back Bay y Fenway la probabilidad se multiplica por siete, alcanzando hasta el trece coma cuatro por ciento.

---

### Eje 5: Qué Modelos Usamos — Campeones, Balanceo y Techo de Datos
**Tiempo:** `05:30 - 07:00` (90 segundos) | **Extensión:** ~210 palabras

Evaluamos un abanico exhaustivo de modelos predictivos optimizados mediante validación cruzada temporal en bloques.

Para la regresión continua del precio, el campeón absoluto fue **Random Forest**, alcanzando un coeficiente de determinación **$R^2$ de cero coma novecientos sesenta y siete** y un error absoluto medio de apenas **un dólar con ocho centavos**, logrando que tres de cada cuatro viajes se estimen con un error inferior al diez por ciento.

En la clasificación de recargo dinámico, el modelo campeón fue **HistGradientBoosting**, superando a Random Forest, árboles de decisión y regresiones logísticas. Este algoritmo alcanzó en el conjunto de prueba ciego un **ROC-AUC de cero coma seiscientos setenta y seis** y un **PR-AUC de cero coma ciento cuarenta**, lo que representa una ventaja del **setenta y uno por ciento** sobre la tasa basal del mercado.

Para gestionar el desbalance de clases, comparamos submuestreo, SMOTE y ponderación de costos. Descartamos el submuestreo por desechar el noventa y uno por ciento de la muestra, y rechazamos SMOTE porque al interpolar entre dummies geográficas generaba anomalías espaciales absurdas. Adoptamos **pesos de clase balanceados**, penalizando once veces más el error en la clase minoritaria sin inventar datos artificiales.

Comprendimos además que el techo predictivo en torno a cero coma sesenta y ocho no es un defecto del algoritmo, sino el límite físico de variables públicas frente a la oferta instantánea privada de choferes.

---

### Eje 6: Qué Valor Ofrecemos — La Asimetría de Errores y Matriz de Beneficio
**Tiempo:** `07:00 - 08:45` (105 segundos) | **Extensión:** ~235 palabras

Llegamos al núcleo estratégico y de mayor impacto de nuestra investigación: la traducción de la ciencia de datos en rentabilidad financiera y protección del usuario.

En problemas de tarificación dinámica, los errores de clasificación tienen repercusiones radicalmente asimétricas que invalidan cualquier métrica simétrica tradicional.

Un **Falso Negativo** —no anticipar un recargo y prometer tarifa normal cuando el usuario sufre un sobreprecio medio de **ocho dólares con setenta y tres centavos**— es letal. Provoca el llamado *"shock de tarifa"*, una profunda sensación de engaño algorítmico, cancelación impulsiva del viaje y fuga definitiva del cliente hacia la competencia. Perder el valor de vida de un pasajero recurrente destruye cientos de dólares anuales para la plataforma.

En agudo contraste, un **Falso Positivo** —emitir una alerta preventiva cuando el viaje termina cobrándose sin recargo— representa un costo de fricción insignificante de apenas **un dólar**, asociado a esperar unos minutos. Lejos de indignar, genera en el usuario una reconfortante sensación de alivio al comprobar que pagó la tarifa estándar.

Por ello, construimos una Matriz de Beneficio Económico formal donde cada recargo anticipado genera siete dólares con setenta y tres centavos netos de ahorro, y cada falsa alarma descuenta un dólar. La precisión mínima de indiferencia financiera se sitúa en el once coma cuarenta y cinco por ciento.

Al calibrar el umbral óptimo de decisión en **cero coma cincuenta y siete veintidós**, nuestro modelo campeón captura **dos mil quinientas treinta y cuatro tarifas dinámicas reales (recall del cincuenta y uno coma cuarenta y dos por ciento)** y genera un retorno neto auditado de **más de cincuenta y seis dólares por cada mil cotizaciones**.

---

### Eje 7: Qué Aporta el Dominio y Cierre Ejecutivo
**Tiempo:** `08:45 - 10:00` (75 segundos) | **Extensión:** ~175 palabras

En conclusión, este proyecto demuestra de forma contundente que la ciencia de datos sin conocimiento de dominio colapsa en modelos engañosos e inaplicables.

Sin comprensión de negocio, un analista habría celebrado la exactitud trivial del noventa y uno coma siete por ciento que genera cero dólares de valor; habría caído en la trampa del split aleatorio publicando métricas infladas que fracasarían en producción; y habría optimizado umbrales simétricos tolerando shocks de tarifa que desangran la lealtad del cliente.

El dominio del ecosistema de Boston nos permitió validar que mientras la tarifa base es un compromiso contractual estable gobernado por la distancia y el tipo de servicio, el recargo dinámico es un pulso espaciotemporal concentrado en puntos neurálgicos de entretenimiento y universidades.

Entregamos a la organización una solución integral y accionable: capacidad de tarificar viajes con un error medio de apenas un dólar y un sistema de alerta temprana que detecta más de la mitad de los recargos futuros, aportando cincuenta y seis dólares netos por millar de operaciones y blindando la confianza del usuario.

Muchas gracias. Quedamos a disposición para sus preguntas.

---

## 3. Matriz de Evidencia Factual y Métricas Auditadas (1:1 con el Repositorio)

Para facilitar la verificación independiente por parte del equipo evaluador y la auditoría forense, la siguiente tabla consolida todas las métricas citadas en el guión, respaldadas por su ubicación exacta en los archivos fuente del repositorio:

| Dimensión Analítica | Métrica Exacta | Archivo Fuente en el Repositorio | Validación |
| :--- | :---: | :--- | :---: |
| **Volumen Limpio Total** | 636.568 cotizaciones | `metricas.json` (`dataset.filas`) | ✅ Exacto |
| **Muestra Evaluada en Surge (Lyft)** | 255.953 cotizaciones | `metricas.json` (`A_datos.filas`) | ✅ Exacto |
| **Tasa Basal de Recargo (Poblacional)** | 8,195% (20.975 casos) | `metricas.json` (`A_datos.tasa`) | ✅ Exacto |
| **Subconjunto de Entrenamiento (Train)** | 196.558 filas (14 fechas) | `metricas.json` (`A_datos.train`, `fechas_train`) | ✅ Exacto |
| **Subconjunto de Prueba (Test Ciego)** | 59.395 filas (4 fechas) | `metricas.json` (`A_datos.test`, `fechas_test`) | ✅ Exacto |
| **Accuracy Trivial ("Siempre No")** | 91,70% (Recall: 0,00%) | `metricas.json` (`A_lineas_base[0]`) | ✅ Exacto |
| **Sobreprecio Medio por Surge** | +USD 8,7338 (+46%) | `metricas.json` (`A_matriz_beneficio.recargo_medio`) | ✅ Exacto |
| **Costo Supuesto de Falsa Alarma** | -USD 1,0000 | `metricas.json` (`A_matriz_beneficio.costo_falsa_alarma`) | ✅ Exacto |
| **Beneficio Neto por VP** | +USD 7,7338 | `metricas.json` (`A_matriz_beneficio.vp`) | ✅ Exacto |
| **Precisión de Break-Even ($p^*$)** | 11,4498% ($\approx 11,45\%$) | `metricas.json` (`A_matriz_beneficio.precision_minima`) | ✅ Exacto |
| **Modelo Campeón de Recargo** | HistGradientBoosting | `metricas.json` (`A_elegido`) | ✅ Exacto |
| **Técnica de Balanceo Campeona** | Pesos de clase (balanced) | `metricas.json` (`A_tecnica_elegida`) | ✅ Exacto |
| **ROC-AUC en Test Ciego** | 0,67636 | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.roc_auc`) | ✅ Exacto |
| **PR-AUC en Test Ciego** | 0,14008 (+71% vs azar) | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.pr_auc`) | ✅ Exacto |
| **Umbral Óptimo de Decisión** | 0,5722 | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.umbral`) | ✅ Exacto |
| **Verdaderos Positivos en Test (TP)** | 2.534 recargos detectados | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.tp`) | ✅ Exacto |
| **Falsos Positivos en Test (FP)** | 16.265 falsas alarmas | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.fp`) | ✅ Exacto |
| **Falsos Negativos en Test (FN)** | 2.394 recargos perdidos | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.fn`) | ✅ Exacto |
| **Verdaderos Negativos en Test (VN)** | 38.202 normales correctos | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.tn`) | ✅ Exacto |
| **Recall en Test Ciego** | 51,4205% ($\approx 51,42\%$) | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.recall`) | ✅ Exacto |
| **Precisión en Test Ciego** | 13,4794% ($\approx 13,48\%$) | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.precision`) | ✅ Exacto |
| **Retorno Financiero Óptimo** | +USD 56,1066 / 1k cotiz. | `metricas.json` (`A_finales["Gradient boosting"].umbral_opt.beneficio_1000`) | ✅ Exacto |
| **Regresión Tarifa $R^2$ (Random Forest)** | 0,96707 (con surge) | `metricas.json` (`B_regresion[6].r2`) | ✅ Exacto |
| **Regresión Tarifa MAE (Random Forest)** | USD 1,0777 ($\approx \text{USD } 1,08$) | `metricas.json` (`B_regresion[6].mae`) | ✅ Exacto |
| **Regresión Tarifa sin Surge ($R^2$ / MAE)** | $R^2 = 0,9285$ / MAE USD 1,32 | `metricas.json` (`B_regresion[5]`) | ✅ Exacto |
| **Aporte Climático en Permutación** | $\Delta R^2 = 2,4468 \times 10^{-6}$ | `metricas.json` (`B_importancia.grupos[5].caida`) | ✅ Exacto |
| **Clustering K-Means de Productos** | $k=3$, silueta $s=0,6820$ | `metricas.json` (`C.k`, `C.silueta[1]`) | ✅ Exacto |
| **Zona con Mayor Tasa de Surge** | Back Bay (13,44%) | `metricas.json` (`A_datos.tasa_por_origen["Back Bay"]`) | ✅ Exacto |
| **Zona con Menor Tasa de Surge** | North End (1,83%) | `metricas.json` (`A_datos.tasa_por_origen["North End"]`) | ✅ Exacto |
