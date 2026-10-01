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
- Anticipar cuándo y dónde aparece la tarifa dinámica (recargo por demanda).
- Explorar patrones temporales y geográficos en las tarifas.
- Comparar el comportamiento tarifario entre Uber y Lyft en condiciones similares.
- Evaluar el impacto de las condiciones meteorológicas en los precios.
- Comunicar hallazgos mediante visualizaciones y técnicas de *data storytelling*.

## 📂 Dataset
- **Nombre:** Uber and Lyft Dataset Boston, MA
- **Fuente:** [Kaggle](https://www.kaggle.com/datasets/brllrb/uber-and-lyft-dataset-boston-ma)
- **Cobertura temporal:** 26/11/2018 – 18/12/2018 (hay datos en 18 de 24 fechas)
- **Registros crudos:** 693.071 (57 columnas, ~350 MB)
- **Dataset final (Entrega 2):** **636.568 filas y 27 columnas** → [`CSV Nueva Columna/dataset_nueva_columna.zip`](CSV%20Nueva%20Columna/dataset_nueva_columna.zip)

### Variables objetivo
| Objetivo | Variable | Tipo | Datos |
|---|---|---|---|
| 1 | `price` (precio del viaje en USD) | Regresión | Uber + Lyft · 636.568 viajes |
| 2 | `has_surge` (1 si `surge_multiplier` > 1, 0 si no) | Clasificación binaria | Solo Lyft, sin Shared · 255.953 viajes · 8,19% con recargo |

**¿Por qué `has_surge` solo con Lyft (sin Shared)?**
- Uber nunca informa el recargo: `surge_multiplier` vale 1 en sus 385.663 registros (no lo informa por separado; según el diagnóstico del grupo, ya usaba *upfront pricing*, con el recargo incluido en el precio).
- Lyft Shared nunca tiene recargo (0 de 51.233 viajes): incluirlo agregaría ceros garantizados.
- Los multiplicadores altos casi no existen (×2,5: 154 casos; ×3: 12), por eso se reformula como sí/no en lugar de regresión o multiclase.

> **Exploración descartada:** en `feature_engineering.py` se probó inferir el recargo oculto de Uber (`uber_surge_ratio` ≥ 1,20, unificado en `is_surge`). Validada sobre Lyft, donde el recargo real es conocido, esa regla acierta solo el 61% de las veces que marca recargo (precisión) y detecta el 76% de los recargos reales, por lo que no se usa como objetivo.

## 🔄 Pipeline de Datos (ETL)
1. **Etapa 1 – Limpieza inicial (`limpiar_dataset.py`):**
   - Exclusión de 55.095 registros de `Taxi` (Uber), que no tienen precio.
   - Eliminación de columnas idénticas (`visibility.1`).
   - Genera el archivo intermedio `rideshare_clean.csv`.
2. **Etapa 2 – ETL completo de la Entrega 2 (genera `dataset_nueva_columna.csv`):**
   - **Calidad en 5 dimensiones:** completitud, validez, consistencia, unicidad y cobertura temporal.
   - **Limpieza:** además de lo anterior, se eliminan 1.060 copias de una misma cotización y 348 distancias imposibles (< 0,1 millas entre zonas distintas). Los precios altos se conservan: el 85% se explica por recargo o distancia.
   - **Corrección horaria:** `hour`, `day` y `datetime` del dataset están en **UTC**. Se recalcula la hora de Boston (UTC − 5 h).
   - **Clima:** se unió por hora (una sola zona por hora) y `latitude`/`longitude` son las del registro de clima, no las del viaje. Se usa como clima de la ciudad por hora y se reducen las variables climáticas de 40 a 9.
   - **Fuente externa:** coordenadas reales de las 12 zonas (OpenStreetMap) → `straight_line_miles`.
   - **Variables nuevas:** `hour_local`, `day_of_week`, `is_weekend`, `time_slot`, `is_rush_hour`, `is_dark`, `is_raining`, `service_tier`, `straight_line_miles` y `has_surge`.

> `feature_engineering.py` corresponde a una versión exploratoria anterior (calcula la hora a partir de `datetime`, que está en UTC, y define `is_surge`). Se mantiene como referencia.

## 📁 Cómo usar `dataset_nueva_columna`
1. Descomprimir `CSV Nueva Columna/dataset_nueva_columna.zip` (el CSV pesa 126 MB y supera el límite de 100 MB de GitHub).
2. Columnas (27): `id`, `datetime_local`, `hour_local`, `day_of_week`, `is_weekend`, `time_slot`, `is_rush_hour`, `is_dark`, `cab_type`, `name`, `service_tier`, `source`, `destination`, `distance`, `straight_line_miles`, `temperature`, `humidity`, `windSpeed`, `visibility`, `precipIntensity`, `is_raining`, `cloudCover`, `pressure`, `short_summary`, `surge_multiplier`, `has_surge`, `price`.
3. **Objetivo 1 (`price`):** usar todas las filas. `id` y `datetime_local` no son predictoras.
4. **Objetivo 2 (`has_surge`):** filtrar `cab_type == "Lyft"` y `name != "Shared"`, y **no usar `price` ni `surge_multiplier`** (contienen la respuesta: fuga de datos).
5. Validar agrupando por fecha: las cotizaciones de una misma ruta y minuto comparten el recargo.

## 🛠️ Metodología
El proyecto sigue las etapas de **CRISP-DM**:
1. Comprensión del negocio y del problema.
2. Adquisición y comprensión de los datos.
3. Preparación de los datos (ETL) ✅.
4. Modelado y análisis (Sprint 3).
5. Evaluación y comunicación de resultados (Sprint 4).

La gestión se realiza con **Scrum**, incluyendo planificación, *daily standups*, revisiones y retrospectivas en cada sprint.

## 📅 Plan de Proyecto
- **Sprint 1:** Planificación y selección del dataset ✅
- **Sprint 2:** Limpieza y preparación de datos (ETL) ✅
- **Sprint 3:** Modelado y análisis de resultados (30/10) ⏳
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
- Provost, F. & Fawcett, T. (2013). *Data Science for Business*. O'Reilly Media.
- OpenStreetMap contributors. Nominatim (geocodificación de las zonas). Licencia ODbL.
