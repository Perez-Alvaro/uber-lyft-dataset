# MODELOS IMPLEMENTADOS: GUÍA TEÓRICA Y METODOLÓGICA DE ESTUDIO
**Cátedra:** Ciencia de Datos – UTN-FRC (Curso 5K1)  
**Proyecto:** Determinantes de Tarifa y Recargo Dinámico en Plataformas de Movilidad (Uber & Lyft en Boston, MA)  
**Destinatarios:** Estudiantes de grado, equipo de desarrollo y tribunal evaluador (Sprint 3)  
**Respaldo Bibliográfico:** Marco Teórico de la Cátedra (Documentos 01 al 05)

---

## 1. Introducción y Contexto del Problema

El desarrollo del Sprint 3 aborda dos grandes desafíos de negocio del transporte compartido (*ride-hailing*), complementados por una segmentación no supervisada del catálogo de servicios:

```
                                  PROBLEMAS ABORDADOS
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
   EJE REGRESIÓN                  EJE CLASIFICACIÓN                EJE NO SUPERVISADO
Predicción de Tarifa           Detección de Recargo            Segmentación de Productos
 (Valor continuo en USD)       (Evento binario sí/no)          (Estructura tarifaria base)
   Target: log(price)             Target: has_surge               K-Means Clustering
   N = 636.568 viajes            N = 255.953 cotizaciones          N = 12 productos
  Random Forest (R²=0.967)      HistGradientBoosting (AUC=0.676)    3 clusters (s=0.682)
```

1. **Predicción Continua de Tarifa (Regresión):** Estimar el precio final del viaje ($Y \in \mathbb{R}$) a partir de atributos espaciales, de servicio y temporales sobre un universo de **636.568 registros** combinados de Uber y Lyft.
2. **Detección Anticipada de Recargo Dinámico (Clasificación Binaria):** Identificar si una cotización experimentará tarifa dinámica (*surge pricing*, $Y \in \{0, 1\}$) en **255.953 cotizaciones** de Lyft (excluyendo la modalidad *Shared*, que por diseño operativo de la plataforma no admite recargo multiplicador).
3. **Caracterización de la Oferta (Clustering No Supervisado):** Descubrir si los 12 productos comerciales comercializados por ambas empresas responden a agrupamientos intrínsecos según su tarifa base y su costo por milla.

Esta guía tiene un doble propósito pedagógico: explicar en lenguaje accesible y riguroso el fundamento matemático y operativo de cada técnica implementada, y dotar al alumno de la argumentación teórica requerida para defender cada decisión de diseño frente al tribunal docente.

---

## 2. Fundamentos Metodológicos y Calidad de Datos

De acuerdo con la guía `01_Calidad_Datos_y_ETL.md`, los datos solo generan valor cuando son *aptos para el propósito* (*fit for purpose*). Cualquier error en la etapa de preparación contamina los estimadores predictivos, un fenómeno sintetizado en el axioma de la ciencia de datos: *"basura entra, basura sale"* (*garbage in, garbage out*).

### 2.1. Las 6 Dimensiones de Calidad Aplicadas al Pipeline
1. **Amplitud y Completitud (*Completeness*):** En el dataset original, las cotizaciones de UberPool presentaban valores faltantes (`NaN`) en la variable `price` cuando no había disponibilidad de emparejamiento. Estos registros fueron filtrados justificadamente para preservar la integridad de los modelos de regresión.
2. **Coherencia (*Consistency*):** Se garantizó que ningún viaje registre distancias nulas o negativas, ni precios inconsistentes con la tarifa de arranque de cada categoría.
3. **Exactitud (*Accuracy*):** Validación de coordenadas geográficas dentro del radio urbano de Boston y consistencia en los nombres de los 12 distritos analizados.
4. **Formato (*Format*):** Parseo de fechas a estándar Unix/ISO y casteo de variables numéricas a coma flotante de doble precisión.
5. **Período de Tiempo (*Timeliness*):** Muestra representativa de noviembre y diciembre de 2018, capturando días laborales, fines de semana y eventos climáticos invernales.
6. **Integridad (*Integrity*):** Exclusión de duplicados exactos e incompatibilidades de identificador único.

### 2.2. Protocolo de Prevención de Fuga de Información (*Data Leakage*)
La fuga de información ocurre cuando un modelo de predicción tiene acceso durante su entrenamiento a variables que no estarían disponibles en el momento operativo en que debe realizarse la inferencia. 

* **Regla estricta en Clasificación:** Para predecir si una cotización tendrá recargo (`has_surge`), es mandatorio **excluir como predictores tanto `price` como `surge_multiplier`**. Si incluyéramos el precio, el modelo aprendería un atajo trivial: *"si el precio es inusualmente alto para esa distancia, seguro hay recargo"*, logrando un rendimiento artificial que colapsaría en producción.

### 2.3. Validación Temporal Consecutiva (`FechasEnOrden`) vs. K-Fold Aleatorio
La cátedra promueve la validación cruzada para medir la capacidad de generalización. Sin embargo, aplicar un K-Fold aleatorio convencional sobre datos de movilidad urbana constituye un grave error metodológico:

```
PARTICIÓN ALEATORIA (INCORRECTA - GENERA LEAKAGE):
Fold 1 Train: [Minuto 10:02 - UberX] ────────┐  (Cotizaciones gemelas del mismo minuto)
Fold 1 Test:  [Minuto 10:02 - Lyft]   ◄──────┘  ¡El modelo memoriza el minuto, no aprende!
Resultado: PR-AUC artificialmente inflado a 0.309 (+147% de falsedad).

PARTICIÓN TEMPORAL CONSECUTIVA (CORRECTA - PROTOCOLO DEL PROYECTO):
Entrenamiento: [Días 1 al 16 de Noviembre] ────────► Modelo aprende patrones históricos
Validación:    [Días 17 al 22 de Noviembre] ────────► Se evalúa sobre el futuro jamás visto
Resultado: PR-AUC honesto y generalizable de 0.140.
```

En el 95.7% de los pares (ruta, minuto), todos los servicios de la plataforma comparten el mismo estado de recargo dinámico. Una partición aleatoria colocaría una cotización en entrenamiento y su "gemela" del mismo minuto en evaluación, permitiendo al algoritmo memorizar eventos aislados en lugar de aprender regularidades causales. Por ello, se implementó una **partición temporal consecutiva de 5 folds**, entrenando estrictamente con el pasado para predecir el futuro.

### 2.4. Ingeniería de Atributos y Codificación de Variables
Siguiendo las pautas de `02_EDA_Estadistica_y_Visualizacion.md`:
* **Transformación Logarítmica del Precio ($\log(\text{price})$):** La distribución del precio presenta una asimetría positiva (*right-skewed*), con una larga cola derecha de servicios VIP que superan los USD 50. Según el criterio de Tukey ($1.5 \text{ IQR}$), estos valores serían catalogados erróneamente como outliers eliminables. La transformación logarítmica comprime la cola derecha, estabiliza la varianza (homocedasticidad) y transforma los errores aditivos en errores porcentuales simétricos: errar por USD 2 en una tarifa de USD 8 representa un 25% de desviación, mientras que en un viaje de USD 40 es solo un 5%. En escala logarítmica, ambos errores se ponderan ecuánimemente.
* **Codificación Cíclica Temporal:** Las horas del día (0 a 23) presentan una discontinuidad artificial en el reloj numérico (la distancia entre las 23:00 h y las 00:00 h parece de 23 unidades cuando en realidad es de solo 1 hora). Se aplicaron transformaciones trigonométricas:
  $$\text{hour\_sin} = \sin\left(\frac{2\pi \cdot \text{hour}}{24}\right), \quad \text{hour\_cos} = \cos\left(\frac{2\pi \cdot \text{hour}}{24}\right)$$
* **La Trampa de las Variables Ficticias (*Dummy Variable Trap*) y la Zona Ancla:** Al aplicar One-Hot Encoding a variables nominales en modelos lineales, debe descartarse obligatoriamente una columna (`drop_first=True`) para evitar una matriz de rango incompleto por colinealidad perfecta ($\sum D_i = 1$). En este proyecto se seleccionó a **South Station** como categoría de referencia urbana porque su tasa histórica de recargo (8.0%) y su nivel de tarifa coinciden exactamente con el promedio global de Boston. De este modo, los coeficientes del modelo expresan directamente cuánto se desvía cada barrio respecto al comportamiento medio de la ciudad.

---

## 3. Modelos de Regresión: De la Línea Base a Ensambles

En el eje de regresión, el objetivo es predecir una cantidad monetaria continua ($Y \in \mathbb{R}$) minimizando las desviaciones entre el precio predicho $\hat{y}_i$ y el precio real observado $y_i$.

### 3.1. Ridge Regression (Línea Base Lineal Regularizada)
* **Fundamento Matemático:** Extiende la regresión lineal por Mínimos Cuadrados Ordinarios (MCO) añadiendo una penalización por la norma euclidiana $L_2$ de los coeficientes:
  $$\min_{\beta} \sum_{i=1}^{n} (y_i - X_i \beta)^2 + \alpha \sum_{j=1}^{p} \beta_j^2$$
* **Intuición Pedagógica:** Ante una matriz con 67 predictores (múltiples dummies de origen, destino y producto), MCO tiende a asignar coeficientes gigantescos y opuestos a variables correlacionadas. La regularización $L_2$ actúa como un **"resorte mecánico"** que tira de todos los coeficientes hacia cero, impidiendo que ninguno crezca desmedidamente y estabilizando la predicción.
* **Comportamiento en el Proyecto:** Se fijó un hiperparámetro de penalización $\alpha = 1000$. Aunque Ridge capta la pendiente media de precio por milla, presenta una limitación estructural insalvable: no puede modelar saltos escalonados ni combinaciones disjuntas (por ejemplo, que una categoría ejecutiva tenga un costo de arranque fijo de USD 15 independientemente de la distancia).

### 3.2. Árbol de Decisión Regresor (*Decision Tree Regressor*)
* **Fundamento Matemático:** Realiza particiones binarias sucesivas y ortogonales en el espacio de atributos, buscando en cada nodo la variable $X_j$ y el punto de corte $s$ que maximicen la reducción de la varianza intragrupo (MSE):
  $$\Delta \text{Varianza} = \text{MSE}_{\text{nodo}} - \left( \frac{N_L}{N} \text{MSE}_L + \frac{N_R}{N} \text{MSE}_R \right)$$
* **Intuición Pedagógica:** Divide el mapa de datos en una cuadrícula de rectángulos. Si un viaje pertenece al rectángulo "Producto = Black SUV" y "Distancia > 3 millas", le asigna como tarifa estimada el promedio de los viajes históricos en ese casillero.
* **Control de Hiperparámetros:** Los árboles no podados sufren de alta varianza (memorizan el ruido). Se restringió su crecimiento fijando `max_depth = 18` y un mínimo de muestras por hoja `min_samples_leaf = 20`.

### 3.3. Random Forest Regresor (Modelo Campeón de Regresión)
* **Fundamento Matemático (Bagging + Subespacios Aleatorios):** Entrena un ensamble de $B = 150$ árboles de decisión independientes. Cada árbol se entrena sobre una muestra bootstrap (remuestreo con reemplazo del mismo tamaño que el dataset original) y en cada división considera solo un subconjunto aleatorio de variables ($m = 0.5 \cdot p$). La predicción final es el promedio no ponderado de todos los árboles:
  $$\hat{y}_{\text{RF}} = \frac{1}{B} \sum_{b=1}^{B} \hat{f}_b(X)$$
* **Por qué reduce el error:** Si cada árbol individual tiene varianza $\sigma^2$ y la correlación media entre ellos es $\rho$, la varianza del ensamble promediado es:
  $$\text{Var}(\hat{y}_{\text{RF}}) = \rho \sigma^2 + \frac{1 - \rho}{B} \sigma^2$$
  Al forzar a cada árbol a utilizar variables aleatorias distintas, se reduce la correlación $\rho$, haciendo que la varianza global colapse y la superficie de predicción sea suave y altamente precisa.

### 3.4. Tabla Comparativa de Modelos de Regresión

| Dimensión Analizada | Ridge Regression ($\alpha=1000$) | Árbol de Decisión (`max_depth=18`) | Random Forest Regresor (Campeón) |
|---|---|---|---|
| **Paradigma Matemático** | Lineal paramétrico con norma $L_2$ | No paramétrico, partición ortogonal | Ensamble paralelo (Bagging) de 150 árboles |
| **Supuesto de Linealidad** | Sí (asume relación lineal en $\log(\text{price})$) | No (captura relaciones no lineales libres) | No (captura interacciones de alto orden) |
| **Riesgo de Sobreajuste** | Bajo (restringido por el término $\alpha$) | Muy Alto (requiere poda estricta) | Bajo (el promediado estabiliza la varianza) |
| **Interpretabilidad** | Alta (pesos $\beta$ directos por variable) | Alta (recorrido visual de reglas IF-THEN) | Media-Baja (requiere importancia por permutación) |
| **Costo Computacional** | Muy rápido ($\approx 2$ segundos) | Rápido ($\approx 5$ segundos) | Alto ($\approx 45$ segundos de cómputo paralelo) |
| **$R^2$ Con Recargo** | $0.951$ | $0.966$ | **$0.967$** |
| **MAE Con Recargo** | USD 1.39 | USD 1.09 | **USD 1.08** (75.0% viajes con error $\le 10\%$) |
| **$R^2$ Sin Recargo (Ciego)** | $0.910$ | $0.927$ | **$0.928$** |
| **MAE Sin Recargo (Ciego)** | USD 1.62 | USD 1.35 | **USD 1.32** |

> **Conclusión del Eje Regresión:** El precio de un viaje es **abrumadoramente estructural**. El tipo de producto contratado y la distancia física del trayecto explican más del 95% de la varianza. El análisis de importancia por permutación demostró que factores ambientales (lluvia, temperatura, viento) o la hora del día tienen una importancia de $0.000$: no alteran la tarifa base. Random Forest resulta campeón indiscutido por capturar las pendientes exactas de cada gama de producto y sus tarifas mínimas de arranque.

---

## 4. Modelos de Clasificación y el Desafío del Desbalance

En el eje de clasificación, el objetivo es predecir un evento discreto: si una cotización de Lyft sufrirá recargo dinámico (`has_surge = 1`) o no (`has_surge = 0`).

```
                DISTRIBUCIÓN REAL DE CLASES EN LYFT (TEST SET: 59.395 COTIZACIONES)
┌───────────────────────────────────────────────────────────────────────────────────┬─────────┐
│                               SIN RECARGO (91.8%)                                 │ RECARGO │
│                               54.467 cotizaciones                                 │  (8.2%) │
│                                                                                   │  4.928  │
└───────────────────────────────────────────────────────────────────────────────────┴─────────┘
                                                                                         ▲
                                                                                  Clase de Interés
```

### 4.1. La Paradoja del Accuracy Trivial
En el conjunto de prueba ciego (59.395 cotizaciones), solo **4.928 viajes (8.195%)** presentaron recargo dinámico. 
* Un clasificador ingenuo que decida predecir siempre la clase mayoritaria (*"nunca hay recargo"*) obtendría:
  $$\text{Accuracy} = \frac{54.467 + 0}{59.395} = \mathbf{91.70\%}$$
* Sin embargo, su capacidad para alertar al usuario es nula:
  $$\text{Recall} = \frac{0}{4.928} = \mathbf{0.00\%}$$
Este fenómeno, advertido explícitamente en `03_Modelos_Supervisados_y_Balanceo.md`, demuestra que **el Accuracy tradicional es una métrica engañosa e inválida para problemas desbalanceados**. La cátedra exige evaluar mediante **Accuracy Balanceada**, **Precision**, **Recall**, y fundamentalmente el **Área Bajo la Curva Precision-Recall (PR-AUC)**.

### 4.2. Evaluación de Técnicas de Balanceo de Clases

| Técnica de Balanceo | Mecanismo Teórico | Tamaño de Train | Patología / Efecto en este Dataset | Decisión Metodológica |
|---|---|---|---|---|
| **Línea Base (Sin balancear)** | Función de pérdida ordinaria ($w_0 = w_1 = 1$). | 196.558 filas | El modelo ignora la clase minoritaria y se sesga hacia el 0. Recall = 0% en corte 0.50. | Descartada por inútil para el negocio. |
| **Submuestreo (*Under-sampling*)** | Elimina al azar registros de la clase mayoritaria hasta igualar la minoritaria (50/50). | 32.094 filas | **Pérdida del 91% de los datos reales.** Se descarta variabilidad geográfica y temporal indispensable. | Descartada por alta inestabilidad muestral. |
| **SMOTE (*Over-sampling* sintético)** | Genera vecinos artificiales interpolando linealmente entre casos positivos en el espacio euclidiano. | 361.022 filas | **Falla crítica en datos One-Hot:** Interpolar entre una coordenada de "Back Bay" y "Beacon Hill" crea registros ficticios con valor 0.4 en una variable dummy, deformando el espacio de decisión. | Descartada formalmente tras verificar sobreajuste en árboles. |
| **Pesos de Clase (`class_weight='balanced'`)** | Modifica la función de costo asignando mayor penalización a los errores de la clase minoritaria: $w_j = \frac{N}{2 \cdot N_j}$. | **196.558 filas** | Modifica las probabilidades estimadas (las desplaza hacia arriba), requiriendo calibración del umbral. | **Seleccionada como óptima:** Preserva el 100% de la información real sin inventar datos espurios. |

En el esquema de pesos balanceados de scikit-learn, el factor aplicado a la clase con recargo es:
$$w_1 = \frac{196.558}{2 \cdot 16.098} \approx \mathbf{6.12}, \quad w_0 = \frac{196.558}{2 \cdot 180.460} \approx \mathbf{0.54}$$
Errar un recargo cuesta 11.3 veces más en la función de pérdida que errar un viaje estándar, forzando al algoritmo a sensibilizarse ante la clase minoritaria.

### 4.3. Algoritmos de Clasificación Ensayados

#### 1. Regresión Logística (*Logistic Regression*)
Modela la probabilidad del evento mediante la función sigmoide:
$$P(Y=1|X) = \sigma(z) = \frac{1}{1 + e^{-(\beta_0 + \sum \beta_i X_i)}}$$
El logaritmo de la razón de probabilidades (*logit*) es una función lineal:
$$\text{Logit} = \log\left(\frac{p}{1-p}\right) = \beta_0 + \sum_{i=1}^p \beta_i X_i \implies \text{Odds Ratio} = e^{\beta_i}$$
* **Odds Ratios Espaciales Clave:** Al fijar a South Station como categoría base ($OR = 1.00$), el modelo revela que el recargo responde a la geografía urbana:
  - **Northeastern University:** $OR = 1.29$ (29% más de probabilidad relativa de recargo que la media).
  - **Fenway:** $OR = 1.23$ (23% más de probabilidad).
  - **Haymarket:** $OR = 0.37$ (63% menos de probabilidad relativa de recargo).
  - **North End:** $OR = 0.38$ (62% menos de probabilidad relativa).

#### 2. Árbol de Decisión Clasificador (*Decision Tree Classifier*)
Segmenta el espacio calculando en cada nodo la reducción de la **impureza de Gini**:
$$I_G = 1 - \sum_{k=0}^{1} p_k^2 = 1 - (p_0^2 + p_1^2)$$
* **La trampa del árbol libre:** Un árbol sin restricciones memoriza las secuencias temporales pasadas, alcanzando $PR\text{-}AUC_{\text{train}} = 0.427$ pero colapsando a $PR\text{-}AUC_{\text{val}} = 0.103$ en validación. 
* **Poda preventiva:** Al forzar `max_depth = 12` y `min_samples_leaf = 500`, se detiene la ramificación espuria y la generalización mejora sustancialmente ($PR\text{-}AUC_{\text{val}} = 0.125$).

#### 3. Random Forest Clasificador
Aplica votación por mayoría promediada sobre 150 árboles con subespacios aleatorios (`max_features='sqrt'`). Logra un buen desempeño ($ROC\text{-}AUC = 0.675$, $PR\text{-}AUC = 0.142$), pero presenta mayor propensión a sobrestimar la certidumbre en las hojas ante cotizaciones contiguas en el tiempo.

#### 4. Gradient Boosting (`HistGradientBoostingClassifier`) — Modelo Campeón
* **Fundamento Matemático:** A diferencia de Random Forest (que entrena en paralelo), Gradient Boosting entrena de forma **secuencial**. Cada nuevo árbol débil $h_m(x)$ se ajusta en la dirección del gradiente negativo de la función de pérdida logarítmica (los pseudo-residuos del ensamble acumulado):
  $$F_m(x) = F_{m-1}(x) + \eta \cdot h_m(x)$$
  donde $\eta = 0.05$ representa la tasa de aprendizaje (*learning rate*).
* **Innovación Histograma (`HistGB`):** Discretiza los atributos continuos en 256 contenedores enteros (*bins* tipo histograma). Esto reduce la complejidad algorítmica de ordenar millones de muestras de $\mathcal{O}(n \log n)$ a $\mathcal{O}(n)$, acelerando drásticamente el cómputo y permitiendo regularizar mediante un número acotado de hojas (`max_leaf_nodes = 15`) y penalización $L_2 = 1.0$.

### 4.4. Matriz de Confusión Desmitificada (Umbral Operacional 0.57)
Evaluada sobre las **59.395 cotizaciones del conjunto de prueba ciego**:

```
                       MATRIZ DE CONFUSIÓN (HISTGRADIENTBOOSTING @ 0.57)
                                      PREDICCIÓN DEL MODELO
                             Predice SIN RECARGO    Predice CON RECARGO
                          ┌───────────────────────┬───────────────────────┐
      Real SIN RECARGO    │  VN = 38.202 cotiz.   │  FP = 16.265 cotiz.   │
   REALIDAD               │ (Acierto de no viaje) │ (Falsa alarma inocua) │
                          ├───────────────────────┼───────────────────────┤
      Real CON RECARGO    │  FN = 2.394 cotiz.    │  VP = 2.534 cotiz.    │
                          │ (Recargo no avisado)  │ (¡Recargo evitado!)   │
                          └───────────────────────┴───────────────────────┘
```

* **Verdaderos Positivos (VP = 2.534):** El modelo avisó que habría tarifa dinámica y efectivamente la hubo. El usuario pudo anticiparse y ahorrar dinero.
* **Falsos Negativos (FN = 2.394):** El modelo no detectó el recargo; el usuario pagó tarifa dinámica sin advertencia previa.
* **Falsos Positivos (FP = 16.265):** Falsa alarma. El sistema advirtió recargo pero la cotización era estándar.
* **Verdaderos Negativos (VN = 38.202):** Viajes normales predichos correctamente como normales.

#### Métricas Derivadas Oficiales:
* **Recall (Exhaustividad):** $\frac{VP}{VP + FN} = \frac{2.534}{2.534 + 2.394} = \mathbf{51.42\%}$ (se captura más de la mitad de todos los recargos futuros del mercado).
* **Precisión:** $\frac{VP}{VP + FP} = \frac{2.534}{2.534 + 16.265} = \mathbf{13.48\%}$ (supera en un 64% a la tasa base poblacional del 8.2%).
* **Accuracy Balanceada:** $\frac{\text{Sensibilidad} + \text{Especificidad}}{2} = \frac{0.5142 + (38.202 / 54.467)}{2} = \mathbf{60.78\%}$ (un 10.8% por encima del azar puro del 50%).
* **Accuracy Global:** $\frac{38.202 + 2.534}{59.395} = \mathbf{68.58\%}$.

---

## 5. Evaluación Económica y Toma de Decisiones

La cátedra enfatiza en `05_Guia_Trabajo_Practico_UTN.md` que un proyecto de ciencia de datos no concluye con métricas estadísticas abstractas, sino con su **traducción a valor tangible para la toma de decisiones**.

### 5.1. Comparativa Teórica: Curva ROC vs. Curva Precision-Recall
* **Curva ROC (Área = 0.676):** Grafica la Tasa de Verdaderos Positivos ($TPR$) contra la Tasa de Falsos Positivos ($FPR = \frac{FP}{FP + TN}$). En este dataset, el número de negativos reales es masivo ($TN = 54.467$). Por lo tanto, aun existiendo 16.000 falsas alarmas, el denominador $FP + TN$ diluye el cociente, manteniendo el $FPR$ falsamente moderado.
* **Curva PR (Área = 0.140):** Grafica la Precisión contra el Recall. La línea base de una curva PR en un clasificador puramente aleatorio es exactamente igual a la prevalencia positiva del dataset:
  $$\text{Línea Base PR} = \frac{\text{Positivos Reales}}{N} = \frac{4.928}{59.395} = \mathbf{0.082} \quad (8.2\%)$$
  Alcanzar un $PR\text{-}AUC = 0.140$ significa que el modelo opera un **70.7% por encima de la densidad del azar**, identificando de forma consistente los conglomerados espaciales con alta probabilidad de recargo.

### 5.2. La Matriz de Beneficio Económico y Calibración de Umbral
En lugar de aceptar el umbral por defecto de $0.50$ (que asume costos simétricos), se modeló la función de utilidad esperada del pasajero:

$$\mathbb{E}[\text{Beneficio}] = \text{VP} \cdot (V_{\text{VP}}) - \text{FP} \cdot (C_{\text{FP}}) + \text{VN} \cdot (0) - \text{FN} \cdot (0)$$

* **Valor de un Verdadero Positivo ($V_{\text{VP}} = +USD\ 7.73$):** Al alertarse el recargo, el usuario espera 5 minutos o compara con Uber, ahorrando el sobreprecio medio observado ($USD\ 8.73$) menos el costo de oportunidad de su tiempo ($USD\ 1.00$).
* **Costo de un Falso Positivo ($C_{\text{FP}} = -USD\ 1.00$):** Falsa alarma inocua. El usuario abre la otra app o espera 5 minutos en vano.
* **Costos de VN y FN ($USD\ 0.00$):** Representan el status quo del negocio (el usuario viaja como lo hacía habitualmente).

#### Derivación Matemática del Umbral de Indiferencia (*Break-even Precision*):
Una alerta solo debe emitirse si la probabilidad esperada de recargo $p$ compensa el riesgo de una falsa alarma:
$$p \cdot V_{\text{VP}} - (1-p) \cdot C_{\text{FP}} > 0 \implies p^* = \frac{C_{\text{FP}}}{V_{\text{VP}} + C_{\text{FP}}} = \frac{1.00}{7.73 + 1.00} = \frac{1.00}{8.73} \approx \mathbf{11.45\%}$$

Debido a que el modelo fue entrenado con pesos balanceados, las probabilidades predichas se encuentran reescaladas. La optimización directa en la partición temporal identificó que el umbral operacional óptimo es **$0.57$**:

```
                          CURVA DE BENEFICIO ECONÓMICO POR UMBRAL
     Beneficio Neto
      (USD / 1k cotiz.)
          ▲
  +$60 ───┼───────────────────────────● Punto Óptimo (Umbral 0.57: +USD 56.11)
          │                         ╱   ╲
  +$40 ───┼───────────●────────────╱     ╲────────● Umbral Clásico (0.50: +USD 35.20)
          │          Máximo F1    ╱         ╲
  +$20 ───┼───────── (0.55: +$52)╱           ╲
          │                     ╱             ╲
    $0 ───┼────────────────────╱───────────────╲──────────────────────► Umbral
          0.10               0.50     0.55   0.57      0.70    1.00
```

* **Ventaja frente al umbral 0.50:** Aumenta la ganancia económica en un 60% al filtrar cotizaciones dudosas.
* **Ventaja frente al punto de máximo F1 (0.55):** Es más selectivo, reduciendo las falsas alarmas del 38.5% al 31.7% sin resignar capturas de recargos relevantes, generando una ganancia validada de **+USD 56.11 por cada 1.000 cotizaciones**.

### 5.3. El Techo Estructural del Dataset
¿Por qué el modelo de recargo no alcanza un ROC-AUC de 0.90 como el de regresión de precio?
* El algoritmo de tarifa dinámica de Lyft responde a variables dinámicas en tiempo real: **ratio de pasajeros con la app abierta vs. conductores conectados en la celda GPS**, cancelaciones recientes y velocidad de tráfico minuto a minuto.
* Como el dataset público no contiene la oferta ni la demanda instantánea, **el modelo predice únicamente a partir de la geografía y el calendario**. Un ROC-AUC de $0.676$ representa el **techo informativo estructural de los datos abiertos**. Cualquier valor superior reportado en la literatura con este dataset revela invariablemente fuga de datos temporal o inclusión del precio.

---

## 6. Aprendizaje No Supervisado: Segmentación de Productos

En cumplimiento de `04_No_Supervisado_y_Mineria_Texto.md`, se aplicó agrupamiento particional no supervisado sobre los 12 productos comerciales de Uber y Lyft para determinar si compiten en franjas homogéneas.

### 6.1. Caracterización de Atributos de Producto
Para no distorsionar la estructura tarifaria con el recargo dinámico, se aislaron exclusivamente los viajes estándar sin recargo. Para cada uno de los 12 productos se ajustó una regresión individual simple ($P = \beta_0 + \beta_1 \cdot \text{Distancia}$), extrayendo dos métricas operativas directas:
1. **Tarifa Base de Arranque ($\beta_0$):** Rango de USD 3.00 a USD 22.00.
2. **Costo por Milla ($\beta_1$):** Rango de USD 1.20 a USD 3.50 por milla recorrida.

### 6.2. Requisito Ineludible de Estandarización (`StandardScaler`)
K-Means utiliza la distancia euclidiana en el espacio $\mathbb{R}^2$:
$$d(x, \mu) = \sqrt{(x_{\text{base}} - \mu_{\text{base}})^2 + (x_{\text{milla}} - \mu_{\text{milla}})^2}$$
Como la tarifa base varía en un rango numérico de casi 20 unidades ($3$ a $22$) mientras que el costo por milla solo varía en $2.3$ unidades ($1.2$ a $3.5$), **si no se aplicara estandarización ($\mu=0, \sigma=1$), la tarifa base dominaría el 90% de la distancia euclidiana**, provocando que el algoritmo ignore por completo el costo por milla. La estandarización previa con `StandardScaler` es un requisito matemático obligatorio.

### 6.3. Determinación Rigurosa del Número Óptimo de Clusters ($k$)
Se evaluó el espacio de agrupamiento combinando dos criterios complementarios:

```
               MÉTODO DEL CODO (INERCIA WCSS)             COEFICIENTE DE SILUETA (s)
          Inercia                                     Silueta
            ▲                                           ▲
       8.11 ● k=2                                  0.70 ┼             ● k=3 (s = 0.682) [ÓPTIMO]
            │ ╲                                         │            ╱ ╲
       2.00 ┼──● k=3 [CODO DE INFLEXIÓN]           0.60 ┼──● k=2    ╱   ╲
            │   ╲                                       │ (0.574)  ╱     ● k=4 (0.611)
       1.10 ┼────● k=4                                  │         ╱
            └────┴───┴───┴──────► k                     └─────────┴───────┴──────► k
```

1. **Método del Codo (*Elbow Method*):** La Inercia Intracluster (WCSS) se reduce drásticamente de $8.11$ en $k=2$ a **$2.00$ en $k=3$**, tras lo cual la ganancia marginal se vuelve mínima (cae a $1.10$ en $k=4$).
2. **Coeficiente de Silueta (*Silhouette Score*):** Evalúa la cohesión interna frente a la separación intercluster:
   $$s_i = \frac{b_i - a_i}{\max(a_i, b_i)}$$
   Presenta un **máximo global absoluto en $k=3$ con $s = 0.682$**, superando ampliamente a $k=2$ ($0.574$) y $k=4$ ($0.611$).

### 6.4. Interpretación de los 3 Clusters Descubiertos

| Cluster Asignado | Denominación de Negocio | Servicios Incluidos | Tarifa Base Promedio | Costo por Milla | Estrategia Competitiva Observada |
|---|---|---|---|---|---|
| **Cluster 0** | **Gama Económica / Accesible** | Lyft, UberX, WAV, Shared, UberPool | USD 3.00 – 6.00 | USD 1.20 – 1.70 / mi | Competencia masiva de volumen y precios bajos. Lyft ofrece el arranque más barato del mercado en su servicio estándar. |
| **Cluster 1** | **Gama Intermedia / Ejecutiva** | Lyft XL, Lux, UberXL, Black, Lux Black | USD 8.00 – 12.00 | USD 2.30 – 2.90 / mi | Confort y capacidad ampliada para grupos y traslados ejecutivos. Simetría tarifaria exacta entre ambas compañías. |
| **Cluster 2** | **Gama Premium / Alta Gama** | Black SUV, Lux Black XL | > USD 21.00 | USD 3.00 – 3.50 / mi | Servicios de lujo con chofer profesional y vehículos de gran porte. Uber es más competitiva en este segmento que Lyft. |

> **Hallazgo:** Se confirma de forma analítica la **Hipótesis H6**: Uber y Lyft estructuran el mercado de Boston en tres niveles de servicio exactamente espejados, sin solapamientos entre franjas.

---

## 7. Herramientas de Estudio y Guía de Defensa Oral

### 7.1. La Gran Matriz Comparativa Integradora de Todos los Modelos

| Eje y Modelo | Tarea de ML | Supuesto Clave | Hiperparámetros Óptimos | Métrica Principal | Fortaleza Primaria | Debilidad Principal |
|---|---|---|---|---|---|---|
| **Ridge Regression** | Regresión ($Y \in \mathbb{R}$) | Linealidad global aditiva | $\alpha = 1000$ | $R^2 = 0.951$<br>MAE = USD 1.39 | Coeficientes estables, previene multicolinealidad. | Incapaz de modelar saltos escalonados de tarifa base. |
| **Árbol de Decisión Reg.** | Regresión ($Y \in \mathbb{R}$) | Segmentación ortogonal en cajas | `max_depth = 18`<br>`min_samples_leaf = 20` | $R^2 = 0.966$<br>MAE = USD 1.09 | Modela no-linealidades y combinaciones de producto. | Predicciones discontinuas en meseta; alta varianza. |
| **Random Forest Reg. (Campeón)** | Regresión ($Y \in \mathbb{R}$) | Agregación de árboles no correlacionados | `n_estimators = 150`<br>`max_depth = 16`<br>`max_features = 0.5` | **$R^2 = 0.967$**<br>**MAE = USD 1.08** | Varianza mínima; 75% viajes con error $\le 10\%$. | Mayor costo de memoria e inferencia lenta. |
| **Regresión Logística** | Clasificación ($Y \in \{0, 1\}$) | Relación lineal en espacio logit | $L_2$ (`lbfgs`), $C=1.0$ (interpret.) / $C=0.00003$ | ROC-AUC: 0.651<br>PR-AUC: 0.121 | Interpretabilidad matemática directa (Odds Ratios). | Frontera de decisión rígida ante interacciones ruta-hora. |
| **Árbol de Decisión Clas.** | Clasificación ($Y \in \{0, 1\}$) | Pureza de nodo vía impureza Gini | `max_depth = 12`<br>`min_samples_leaf = 500` | ROC-AUC: 0.672<br>PR-AUC: 0.138 | Reglas de corte visuales de caja blanca transparentes. | Probabilidades en hojas discretizadas y poco calibradas. |
| **Random Forest Clas.** | Clasificación ($Y \in \{0, 1\}$) | Embolsado bootstrap de árboles | `n_estimators = 150`<br>`max_features = 'sqrt'` | ROC-AUC: 0.675<br>PR-AUC: 0.142 | Robusto ante ruido univariado y dummies aisladas. | Tiende a memorizar cotizaciones temporalmente cercanas. |
| **HistGradientBoosting (Campeón)** | Clasificación ($Y \in \{0, 1\}$) | Boosting de residuos en histogramas | `n_est = 200`, $\eta = 0.05$<br>`max_leaf_nodes = 15`, $L_2 = 1$ | **ROC-AUC: 0.676**<br>**PR-AUC: 0.140** | **Recall 51.4%**, **+USD 56/1k**, probabilísticamente estable. | Modelo de caja negra (requiere SHAP o importancia). |
| **K-Means Clustering** | No Supervisado | Distancia euclidiana esférica | $k = 3$, init K-Means++<br>`StandardScaler` | **Silueta $s = 0.682$**<br>WCSS = 2.00 | Descubre 3 niveles de servicio sin requerir etiquetas. | Sensible a outliers y escala previa de variables. |

---

### 7.2. Cuatro Analogías Cotidianas para Afianzar Conceptos Abstractos

Para comunicar conceptos complejos con fluidez y naturalidad durante la defensa oral, el alumno puede apoyarse en estas analogías didácticas:

1. **El Detector de Humo (La Paradoja del Accuracy y la Calibración del Umbral):**
   > *"Imaginen un detector de humo en un edificio donde hay fuego solo una vez cada 10 años. Si apagamos el detector para que no suene jamás, tendrá un 99.9% de exactitud diciendo que no hay fuego. Pero el día del incendio, el edificio se quemará por completo. Eso es lo que hace un modelo sin balancear cuando predice siempre 'sin recargo'. Ajustar el umbral a 0.57 equivale a calibrar la ruedita de sensibilidad del sensor: si lo ponemos hipersensible sonará con el vapor de las tostadas (falsas alarmas costosas); si lo ponemos muy duro no avisará las llamas. El umbral 0.57 es el punto exacto donde la alarma maximiza la protección al menor costo de molestias."*

2. **El Consejo de Expertos (Bagging y Random Forest):**
   > *"Random Forest es como convocar a un **consejo de 150 tasadores independientes**: a cada uno se le da una carpeta con casos levemente distintos y se le permite mirar solo un subconjunto de fotos de la propiedad. Cada experto emite su tasación por separado y al final promediamos sus votos. Aunque algún tasador individual sobrestime o se equivoque, los errores aislados se cancelan entre sí, logrando una tasación colectiva sumamente certera y estable."*

3. **El Alpinista en la Niebla (Gradient Boosting y Descenso de Gradiente):**
   > *"Gradient Boosting opera como un **alpinista que desciende una montaña empinada cubierta de densa niebla**. Como no puede ver la cumbre ni el valle completo de una sola mirada, tantea con sus botas la pendiente del terreno bajo sus pies (calcula el gradiente negativo de la función de pérdida) y da un paso prudente y corto en dirección a la bajada (la tasa de aprendizaje $\eta = 0.05$). En cada paso, un nuevo árbol corrige la desviación del paso anterior hasta alcanzar con seguridad el fondo del valle de los errores."*

4. **El GPS Tarifario y la Recta de 45° (Regresión de Precio Determinística):**
   > *"Predecir el precio de un Uber es como leer la pantalla de un GPS o un taxímetro digital: no importa si afuera hay tormenta de nieve o si son las tres de la mañana, la máquina aplica una bajada de bandera fija y suma una cantidad exacta por cada milla transitada. Por eso nuestro Random Forest alcanza un $R^2$ de 0.967: dibuja una recta perfecta de 45 grados entre lo real y lo predicho porque la tarifa es una fórmula matemática fija de catálogo y distancia, no una ruleta influenciada por el clima."*

5. **La Balanza Trucada a Propósito (Pesos de Clase vs. SMOTE):**
   > *"Entrenar con pesos de clase (`class_weight='balanced'`) no altera la realidad ni inventa clientes de mentira en el sistema. Es exactamente como ponerle un contrapeso de 6 kilos de plomo a los errores de recargo y uno de apenas 500 gramos a los errores normales. Le avisamos de antemano a la computadora que equivocarse con un recargo le va a doler 11 veces más en su nota final, forzándola a prestar atención a lo que de verdad le importa al usuario."*

---

### 7.3. Guía Rápida de Repreguntas de Examen (Top 10)

Este banco de preguntas sintetiza las interpelaciones más habituales y agudas del tribunal docente en la cátedra de Ciencia de Datos:

#### P1: ¿Por qué dicen que su clasificador de recargo es exitoso con un Accuracy del 68.6%, si una regla tonta que prediga siempre "sin recargo" logra un 91.7%?
> **Respuesta del Estudiante:**  
> "Porque en un entorno con solo 8.2% de cotizaciones positivas, la Accuracy global es una métrica engañosa. La regla tonta alcanza 91.7% de accuracy pero tiene un **Recall del 0%**: es absolutamente incapaz de avisarle al usuario sobre un recargo. Nuestro modelo con HistGradientBoosting y pesos balanceados prioriza la detección de la clase crítica: alcanza una **Accuracy Balanceada del 60.8%** (más de 10 puntos por encima del azar del 50%), un **Recall del 51.4%** (captura más de la mitad de todos los recargos futuros del mercado) y genera un **beneficio económico medido de +USD 56 cada 1.000 cotizaciones**."

#### P2: ¿Por qué fracasó la técnica SMOTE en este proyecto siendo el método de sobremuestreo más popular?
> **Respuesta del Estudiante:**  
> "SMOTE opera interpolando linealmente entre vecinos cercanos en el espacio vectorial continuo. En nuestro dataset, la inmensa mayoría de las características son variables dummies binarias creadas por One-Hot Encoding (barrios de origen, destino y categorías). Al interpolar entre dos cotizaciones, SMOTE genera puntos sintéticos irreales, como asignarle un valor de '0.4' a la pertenencia a Back Bay, lo cual es ontológicamente absurdo para una bandera binaria. Los árboles de decisión memorizan estas combinaciones artificiales y sobreajustan en entrenamiento, degradando el rendimiento en fechas futuras. Por eso adoptamos **pesos de clase (`class_weight='balanced'`)**, que no altera la distribución muestral real y penaliza 11 veces más el error de la clase positiva."

#### P3: ¿Cómo interpretan conceptualmente un Odds Ratio de 1.29 en la Regresión Logística?
> **Respuesta del Estudiante:**  
> "Un Odds Ratio de 1.29 en la variable dummy `from_Northeastern_University` significa que, manteniendo constantes todos los demás factores (distancia, producto, clima y hora), la razón de probabilidades (*odds*) de sufrir tarifa dinámica saliendo de Northeastern es un **29% superior** a si el viaje parte de nuestra categoría de referencia urbana, South Station (cuya tasa histórica de recargo es del 8.0%, idéntica a la media de Boston). Por el contrario, orígenes como Haymarket presentan un Odds Ratio de 0.37, reduciendo la probabilidad relativa en un 63% respecto al promedio."

#### P4: ¿Por qué implementaron una validación temporal consecutiva (`FechasEnOrden`) en lugar de un K-Fold estratificado tradicional?
> **Respuesta del Estudiante:**  
> "Porque las cotizaciones provienen de una serie temporal continua donde el 95.7% de los productos comparten el mismo estado de recargo en el mismo minuto y trayecto. Si hubiésemos aplicado un K-Fold aleatorio, cotizaciones 'gemelas' del mismo minuto habrían quedado repartidas simultáneamente en entrenamiento y prueba, provocando una severa fuga de datos (*data leakage*). Comprobamos empíricamente que con partición aleatoria el Random Forest infla su PR-AUC a 0.309 (más del doble de su valor real) porque simplemente memoriza el minuto. La validación temporal consecutiva en 5 bloques simula las condiciones reales de producción: entrenar con el pasado y predecir días futuros que el algoritmo jamás vio."

#### P5: ¿Por qué afirman que el precio de los viajes es 'estructural' y que el clima no influye en la tarifa base?
> **Respuesta del Estudiante:**  
> "Al evaluar la importancia por permutación sobre el Random Forest de regresión ($R^2 = 0.967$), encontramos que la combinación de tipo de producto (`name_*`) y la distancia recorrida explica más del 95% de la varianza del precio. Al permutar al azar las variables climáticas (temperatura, lluvia, viento) o la hora del día, el error del modelo no empeora en absoluto (impacto de 0.000). Esto refuta la creencia popular de que Uber o Lyft cobran más caro el viaje base por lluvia o frío; la tarifa responde a una fórmula paramétrica determinística de arranque más millaje."

#### P6: ¿Por qué fijaron el umbral de decisión en 0.57 y no en el corte clásico de 0.50 o en el punto de máximo F1?
> **Respuesta del Estudiante:**  
> "El umbral de 0.50 es un estándar arbitrario que asume que equivocarse hacia un lado o hacia el otro cuesta exactamente lo mismo. En el transporte urbano, una falsa alarma le hace perder al usuario 5 minutos comparando apps (costo de USD 1.00), mientras que detectar un recargo real le permite evitar un sobreprecio medio de USD 8.73 (ahorro neto de +USD 7.73). Calibramos el umbral optimizando directamente una Matriz de Beneficio Económico en la partición temporal. El umbral 0.57 maximiza el retorno financiero (+USD 56 / 1k viajes) y es más selectivo que el máximo F1 (0.55), reduciendo las falsas alarmas del 38.5% al 31.7%."

#### P7: ¿Por qué le dieron tanta importancia al PR-AUC si el ROC-AUC ya alcanzaba un respetable 0.676?
> **Respuesta del Estudiante:**  
> "Porque la curva ROC incluye en su eje de abscisas a la Tasa de Falsos Positivos ($FPR = \frac{FP}{FP+TN}$). Al tener una clase negativa abrumadoramente mayoritaria (54.467 cotizaciones), el denominador es gigantesco, por lo que miles de falsas alarmas quedan visualmente camufladas y el ROC-AUC luce optimista. En contraste, la Curva Precision-Recall enfrenta directamente los aciertos verdaderos contra las falsas alarmas ($\text{Precisión} = \frac{TP}{TP+FP}$). Con una tasa base del 8.2%, alcanzar un PR-AUC de 0.140 demuestra que el modelo casi duplica la precisión del azar en las alertas prioritarias, siendo la métrica de referencia en desbalance."

#### P8: ¿Qué diferencia teórica existe entre Bagging y Boosting, y por qué triunfó Boosting en clasificación?
> **Respuesta del Estudiante:**  
> "Bagging (Random Forest) entrena múltiples árboles complejos en paralelo de forma independiente sobre muestras bootstrap y promedia sus predicciones para **reducir la varianza**. Boosting (Gradient Boosting), en cambio, entrena árboles poco profundos en secuencia, donde cada nuevo estimador se enfoca específicamente en modelar los residuos del ensamble acumulado para **reducir el sesgo**. En clasificación de recargo, Gradient Boosting triunfó porque su discretización en histogramas ajusta las fronteras sutiles de decisión espacial de manera mucho más prudente y suave, evitando que el modelo memorice cotizaciones aisladas y logrando mayor consistencia temporal."

#### P9: ¿Por qué fue obligatorio estandarizar con `StandardScaler` en K-Means pero no fue necesario en los Árboles de Decisión?
> **Respuesta del Estudiante:**  
> "Los árboles de decisión toman decisiones univariadas ortogonales ordenando valores en un solo eje a la vez; la escala métrica de la variable no altera los puntos de división. K-Means, en cambio, se fundamenta en distancias euclidianas geométricas en $\mathbb{R}^n$. Al agrupar los productos por su 'Tarifa Base' (USD 3 a 22) y su 'Costo por Milla' (USD 1.2 a 3.5), si no hubiéramos estandarizado a media 0 y varianza 1, la tarifa base habría tenido una escala numérica 6 veces más ancha, monopolizando la distancia euclidiana y anulando por completo la influencia del costo por milla."

#### P10: ¿Por qué aplicaron una transformación logarítmica ($\log(\text{price})$) a la variable objetivo en regresión?
> **Respuesta del Estudiante:**  
> "La distribución de tarifas presenta una marcada asimetría positiva con colas pesadas provocadas por viajes de alta gama (Black SUV, Lux Black XL) de más de USD 50 u 80. Predecir directamente el precio forzaría al algoritmo a sobredimensionar los errores absolutos en viajes caros en desmedro de los viajes económicos. Al tomar $\log(\text{price})$, estabilizamos la varianza (homocedasticidad) y convertimos los desvíos aditivos en proporciones porcentuales: errar por USD 2 en un viaje de USD 8 representa un 25% de error relativo, mientras que en uno de USD 40 es solo un 5%. En escala logarítmica, ambos errores se ponderan con absoluta justicia matemática."
