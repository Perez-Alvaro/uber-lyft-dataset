# Informe de Transformación de Datos (ETL) y Variables Predictivas
**Proyecto**: Análisis de Factores Determinantes en el Precio de Viajes (Uber & Lyft — Boston, MA)  
**Universidad**: Universidad Tecnológica Nacional – Facultad Regional Córdoba (UTN-FRC)  
**Carrera**: Ingeniería en Sistemas de Información | **Cátedra**: Ciencia de Datos | **Curso**: 5K1  
**Docente**: Ing. Marisa del Carmen Callejas  
**Etapa**: Sprint 2 (ETL) y Definición de Variables Objetivo para el Sprint 3 (Modelado)  

---

## 📌 1. Resumen Ejecutivo
Este documento detalla la auditoría cuantitativa y metodológica del pipeline de **Extracción, Transformación y Carga (ETL)** aplicado sobre el dataset de viajes de Boston, contrastando las métricas clave **ANTES y DESPUÉS de la limpieza**, y fundamentando la formulación de los **dos objetivos predictivos** solicitados por la cátedra:
1. **`price`** (Regresión continua — Tarifa en USD para Uber y Lyft).
2. **`has_surge`** (Clasificación binaria — Presencia de tarifa dinámica en Lyft).

---

## 🔍 2. Estado de los Datos: ANTES de la Limpieza (Raw)

El conjunto original (`rideshare_kaggle.csv`) integró registros de cotizaciones de viajes junto con observaciones climáticas de DarkSky:

* **Volumen inicial:** 693.071 filas $\times$ 57 columnas.
* **Tamaño en disco / RAM:** ~350 MB en disco / ~725 MB en memoria RAM (utilizando tipos sin optimizar `object` y `float64`).
* **Cobertura espacial y temporal:** 12 distritos de Boston entre el 26 de noviembre y el 18 de diciembre de 2018.

### Anomalías y Trampas Estructurales Detectadas:
1. **Concentración absoluta de nulos en `price`:**
   * **55.095 registros vacíos** (7.95% del total).
   * **Causa raíz:** El 100% corresponde al servicio `Taxi` de Uber. En Boston, los taxis tradicionales solicitados por la app cobran mediante el taxímetro oficial urbano, por lo que la API no entrega una tarifa fija cerrada por adelantado (*upfront price*).
2. **La trampa de la hora UTC:**
   * Los campos `datetime`, `hour`, `day` y `timestamp` estaban registrados en hora UTC (Londres), desfasados en **5 horas** respecto a la hora local real de Boston.
3. **La trampa de las coordenadas meteorológicas:**
   * `latitude` y `longitude` no correspondían al origen o destino del viaje, sino a la estación meteorológica que registró la medición climática general de la ciudad.
4. **Redundancia severa de columnas (41 columnas descartables):**
   * `visibility.1` era una duplicación idéntica celda por celda de `visibility` (hash MD5 idéntico, $r = 1.0$).
   * 12 columnas climáticas con sufijo `*Time` (marcas de tiempo Unix de hitos diarios futuros como `temperatureHighTime` o `windGustTime`) que saturaban de ruido y dimensionalidad irrelevante el modelo.
5. **Cotizaciones duplicadas y distancias incoherentes:**
   * 1.060 cotizaciones idénticas emitidas en el mismo segundo exacto para la misma ruta.
   * 348 viajes de Uber con distancias imposibles (< 0.1 millas entre distritos separados de Boston).

---

## ⚙️ 3. Criterios de Limpieza y Transformación (Pipeline ETL)

Las decisiones de ingeniería se basaron en criterios determinísticos y éticos de negocio:

| Operación / Filtro | Criterio Metodológico | Filas Afectadas |
| :--- | :--- | :---: |
| **1. Eliminación de Taxi** | Registros sin tarifa por uso de taxímetro legal (no imputar artificialmente) | **−55.095** |
| **2. Deduplicación de Cotizaciones** | Copias simultáneas emitidas en la misma consulta a la API | **−1.060** |
| **3. Corrección de Distancias Imposibles** | Registros de Uber con distancia < 0.1 mi entre zonas urbanas distintas | **−348** |
| **4. Precios Extremos (Outliers)** | **CONSERVADOS:** Se comprobó que el 85% se explica por servicios Lux/Black o surge | **0** |
| **TOTAL LIMPIO** | **Reducción del 8.1% (Conservación del 91.9% de los datos auténticos)** | **636.568 filas** |

### Selección y Creación de Columnas (De 57 a 27 Atributos):
* **Se eliminaron 41 columnas:** 31 de pronósticos climáticos futuros diarios/horarios redundantes, 6 de tiempo desfasado en UTC, 2 coordenadas meteorológicas y 2 copias (`visibility.1`, `product_id`).
* **Se conservaron 16 columnas originales:** `id`, `cab_type`, `name`, `source`, `destination`, `distance`, `surge_multiplier`, `price` y 8 variables climáticas directas (`temperature`, `humidity`, `windSpeed`, `visibility`, `precipIntensity`, `cloudCover`, `pressure`, `short_summary`).
* **Se crearon 11 variables calculadas útiles:**
  1. `datetime_local`: `timestamp` ajustado a hora local de Boston (UTC − 5 h).
  2. `hour_local`: Hora local (0 a 23).
  3. `day_of_week`: Día de la semana (0 = lunes … 6 = domingo).
  4. `is_weekend`: Indicador binario de fin de semana (1 = sábado/domingo).
  5. `time_slot`: Franja horaria (Madrugada, Mañana, Tarde, Noche).
  6. `is_rush_hour`: Indicador de hora pico laboral (días hábiles 7–9 h y 16–19 h).
  7. `is_dark`: Indicador de viaje nocturno antes del amanecer o tras el atardecer.
  8. `is_raining`: Indicador de lluvia activa (`precipIntensity > 0`).
  9. `service_tier`: Homologación de categorías entre plataformas (Compartido, Estándar, XL, Premium, Black, Black XL).
  10. `straight_line_miles`: Distancia euclidiana en línea recta obtenida de fuentes geoespaciales externas (OpenStreetMap).
  11. `has_surge`: Variable objetivo binaria de tarifa dinámica.

---

## 📊 4. Estado de los Datos: DESPUÉS de la Limpieza (Curated)

| Métrica / Dimensión | Antes de la Limpieza (`rideshare_kaggle.csv`) | Después de la Limpieza (`dataset_nueva_columna.csv`) | Impacto / Variación |
| :--- | :---: | :---: | :--- |
| **Total de Registros** | 693.071 | **636.568** | −56.503 filas (−8.1% por Taxi, duplicados y anomalías) |
| **Total de Columnas** | 57 | **27** | −30 columnas netas (−41 ruido / +11 derivadas útiles) |
| **Valores Nulos en `price`** | 55.095 (7.95%) | **0 (0.00%)** | 100% de completitud alcanzada |
| **Valores Nulos Globales** | 55.095 | **0** | Dataset 100% limpio y consistente |
| **Uso de Memoria RAM** | ~725.08 MB | **< 130 MB** | Reducción superior al 80% |
| **Formato de Entrega** | CSV plano | **CSV optimizado + ZIP (126 MB $\rightarrow$ 26 MB)** | Compatible con GitHub (< 100 MB) y Colab |

---

## 🎯 5. Variables a Predecir (Targets para Sprint 3)

### 1. Variable Objetivo 1: `price` (Regresión Continua)
* **Población objetivo:** Total del dataset limpio (**636.568 viajes de Uber y Lyft**).
* **Pregunta de negocio:** ¿Cuánto cuesta el viaje en dólares estadounidenses?
* **Rango:** [\$2.50 USD — \$97.50 USD], con media de \$16.55 y mediana de \$13.50.
* **Hallazgo clave de los datos:**
  * El tipo de servicio (`service_tier`) explica el **77%** de la varianza del precio.
  * La distancia recorrida explica el **12%**.
  * Juntos explican entre el **89% y el 92%** de la tarifa.
  * El clima y la hora casi no alteran el precio base de las aplicaciones.
* **Estrategia para Sprint 3:** Modelar $\log(\text{price})$ mediante algoritmos de ensamble (*LightGBM, XGBoost, Random Forest Regressor*) y evaluar con $R^2$, RMSE y MAE.

---

### 2. Variable Objetivo 2: `has_surge` (Clasificación Binaria)
* **Población objetivo:** **Solo viajes de Lyft, excluyendo la categoría Shared** (**255.953 viajes**).
* **Definición matemática:**
  $$
  \text{has\_surge} = \begin{cases} 
  1 & \text{si } \text{surge\_multiplier} > 1.0 \\[4pt]
  0 & \text{si } \text{surge\_multiplier} = 1.0 
  \end{cases}
  $$
* **Justificación técnica y metodológica:**
  1. **¿Por qué solo Lyft?** Uber reporta un valor estático de $1.0\times$ en sus 385.663 filas debido a que oculta el multiplicador en su sistema de *Upfront Pricing*. Intentar inferir el surge de Uber mediante el precio por milla arrojó una tasa de acierto de solo el 61% al validarlo sobre Lyft, por lo que introduciría falsos positivos y ruido.
  2. **¿Por qué sin viajes Shared?** Lyft Shared **nunca** cobra recargo dinámico (0 casos en 51.233 viajes); conservarlo solo inflaría artificialmente la clase negativa sin aportar capacidad predictiva.
  3. **Impacto en el usuario:** Cuando `has_surge == 1`, el viaje cuesta en promedio un **46% más caro**.
  4. **Desbalance de Clases:** La tasa de recargo en este subconjunto es del **8.19%** (20.975 viajes con sobrecargo vs. 234.978 regulares).
* **Estrategia para Sprint 3:**
  * **Prohibición de Data Leakage:** No utilizar `price` ni `surge_multiplier` como variables explicativas.
  * **Métricas adecuadas:** No evaluar con *Accuracy* (predecir siempre 0 ya acertaría el 91.8%). Emplear **PR-AUC (Precision-Recall AUC), F1-Score y Recall**.

---

## 🚀 6. Reproducibilidad y Soporte de Presentación

El análisis y los gráficos resultantes de esta etapa se encuentran implementados y listos para ejecutarse en el notebook interactivo de Google Colab:
* **Notebook principal:** `TPI_Ciencia_de_Datos_Sprint2_ETL.ipynb`
* **Dataset fuente limpio:** `CSV Nueva Columna/dataset_nueva_columna.zip`

---
*Documento oficial elaborado para el Trabajo Práctico Integrador — Cátedra de Ciencia de Datos (UTN-FRC).*
