# Proyecto Integrador – Ciencia de Datos  
**Universidad Tecnológica Nacional – Facultad Regional Córdoba**  
**Carrera:** Ingeniería en Sistemas de Información  
**Curso:** 5K1  
**Docente:** Marisa del Carmen Callejas  

## 📌 Descripción
Este repositorio contiene el desarrollo del **Trabajo Práctico Integrador de Ciencia de Datos**, cuyo objetivo es analizar los determinantes del precio en servicios de movilidad bajo demanda, tomando como caso de estudio los viajes de **Uber y Lyft en Boston, Massachusetts**.

El proyecto se organiza bajo el marco ágil **Scrum**, dividido en cuatro entregas (sprints), siguiendo el ciclo de vida de proyectos de ciencia de datos (**CRISP-DM**).

## 🎯 Objetivos
- Identificar y cuantificar los factores que influyen en el precio de los viajes.  
- Explorar patrones temporales y geográficos en las tarifas.  
- Comparar el comportamiento tarifario entre Uber y Lyft en condiciones similares.  
- Evaluar el impacto de las condiciones meteorológicas en los precios.  
- Comunicar hallazgos mediante visualizaciones y técnicas de *data storytelling*.  

## 📂 Dataset
- **Nombre:** Uber and Lyft Dataset Boston, MA  
- **Fuente:** [Kaggle](https://www.kaggle.com/datasets/brllrb/uber-and-lyft-dataset-boston-ma)  
- **Cobertura temporal:** 26/11/2018 – 18/12/2018  
- **Registros crudos:** 693.071 (57 columnas, ~350 MB)  
- **Registros procesados:** 637.976 filas limpias y 44 columnas optimizadas (~14.76 MB en Parquet)  
- **Variables Objetivo:**  
  - **Target 1 (Regresión):** `price` (costo del viaje en USD).  
  - **Target 2 (Clasificación):** `is_surge` (presencia de tarifa dinámica unificada: Lyft `surge_multiplier > 1.0` o Uber `uber_surge_ratio >= 1.20`).  
  - **Métrica Derivada:** `uber_surge_ratio` (ratio implícito entre precio por milla y la mediana base de la ruta).  

## 🔄 Pipeline de Datos (ETL & Feature Engineering)
1. **Etapa 1 - Limpieza y Consistencia (`limpiar_dataset.py`):**
   - Exclusión de 55.095 registros correspondientes al servicio `Taxi` de Uber (`price == NaN`).
   - Detección algorítmica y eliminación de columnas redundantes idénticas (p. ej. `visibility.1`).
   - Generación del archivo intermedio `rideshare_clean.csv`.
2. **Etapa 2 - Feature Engineering y Optimización (`feature_engineering.py`):**
   - **Ingeniería Temporal:** Extracción de `hour`, `day_of_week`, `is_weekend` y definición de `rush_hour` (horas pico laborales en Boston: 7–9 AM y 16–19 PM).
   - **Inferencia de Tarifa Dinámica:** Modelado de tarifa base por ruta (`source`, `destination`, `name`), cálculo de `uber_surge_ratio` y unificación en la etiqueta binaria `is_surge` (tasa detectada: **8.54%**).
   - **Optimización y Curación:** Eliminación de identificadores irrelevantes (`id`, `timestamp`, `datetime`, timestamps secundarios de clima) y variables que introduzcan data leakage (`price_per_mile`, `distance_adj`).
   - **Downcasting de Memoria:** Variables categóricas a `category`, numéricas reales a `float32`.
   - **Exportación:** `rideshare_features.parquet` (14.76 MB, alta velocidad de lectura I/O).

## 🛠️ Metodología
El proyecto sigue las etapas de **CRISP-DM**:  
1. Comprensión del negocio y del problema.  
2. Adquisición y comprensión de los datos.  
3. Preparación de los datos (ETL & Feature Engineering) ✅.  
4. Modelado y análisis (Sprint 3).  
5. Evaluación y comunicación de resultados (Sprint 4).  

La gestión se realiza con **Scrum**, incluyendo planificación, *daily standups*, revisiones y retrospectivas en cada sprint.

## 📅 Plan de Proyecto
- **Sprint 1:** Planificación y selección del dataset ✅  
- **Sprint 2:** Limpieza y preparación de datos (ETL & Feature Engineering) ✅  
- **Sprint 3:** Modelado y análisis de resultados ⏳  
- **Sprint 4:** Presentación final (*data storytelling*) ⏳  

## 👥 Integrantes
- Alvaro Perez (97986)  
- Juan Ignacio Cremona (95789)  
- Ignacio Gil (407114)  
- Federico Gon (94470)  
- Sofía Medina (88655)  
- Facundo Dagnino Dailly (94307)  

## 📚 Referencias
- Cátedra de Ciencia de Datos (2026). Trabajo Práctico Integral – Proyecto de Ciencia de Datos. UTN – FRC.  
- Schwaber, K. & Sutherland, J. (2020). *La Guía de Scrum*.  
- Chapman, P. et al. (2000). *CRISP-DM 1.0: Step-by-step data mining guide*.  
- Provost, F. & Fawcett, T. (2013). *Data Science for Business*. O’Reilly Media.  

---

✨ Este README servirá como guía inicial para el repositorio, documentando el propósito, metodología y organización del proyecto.