# Proyecto Integrador – Ciencia de Datos
**Universidad Tecnológica Nacional – Facultad Regional Córdoba**  
**Carrera:** Ingeniería en Sistemas de Información  
**Curso:** 5K1  
**Docente:** Marisa del Carmen Callejas  

---

## 📌 Descripción
Este repositorio contiene el desarrollo del **Trabajo Práctico Integrador de Ciencia de Datos**, cuyo objetivo es analizar los determinantes del precio en servicios de movilidad bajo demanda, tomando como caso de estudio los viajes de **Uber y Lyft en Boston, Massachusetts**.

El proyecto se organiza bajo el marco ágil **Scrum**, dividido en cuatro entregas (sprints), siguiendo el ciclo de vida de proyectos de ciencia de datos (**CRISP-DM**).

---

## 🎯 Objetivos del Proyecto
- Identificar y cuantificar los factores determinantes en el precio de los viajes.
- Anticipar cuándo y dónde aparece la tarifa dinámica (recargo por demanda).
- Explorar patrones temporales y geográficos en las tarifas de movilidad.
- Comparar el comportamiento tarifario entre Uber y Lyft bajo condiciones equivalentes.
- Evaluar el impacto de variables meteorológicas en los precios.
- Diseñar modelos predictivos rigurosos con control estricto de fuga de datos (*data leakage*).
- Comunicar hallazgos mediante técnicas de *data storytelling*.

---

## 📂 Datasets y Entregables

### 1. Dataset Crudo (Entrega 1)
- **Fuente:** [Kaggle - Uber and Lyft Dataset Boston, MA](https://www.kaggle.com/datasets/brllrb/uber-and-lyft-dataset-boston-ma)
- **Cobertura temporal:** 26/11/2018 – 18/12/2018 (18 de 24 fechas registradas).
- **Dimensiones:** 693.071 filas × 57 columnas (~350 MB crudo).
- **Ubicación:** [`Contenido Entrega 1/dataset.zip`](Contenido%20Entrega%201/dataset.zip)

### 2. Dataset Limpio Curado (Entrega 2)
- **Dimensiones:** 636.568 filas × 27 columnas (92% de los datos originales conservados).
- **Cambios clave:** Exclusión de 55.095 registros de `Taxi` (nulos en `price`), deduplicación de cotizaciones simultáneas, eliminación de distancias incoherentes, corrección de desfase UTC a hora local de Boston (UTC−5) y cálculo de `has_surge`.
- **Archivo:** [`Contenido Entrega 2/DataSet Segunda Entrega Sin Codificar/dataset_nueva_columna.zip`](Contenido%20Entrega%202/DataSet%20Segunda%20Entrega%20Sin%20Codificar/dataset_nueva_columna.zip)

### 3. Dataset Codificado Numérico (Base para Entrega 3)
- **Dimensiones:** 636.568 filas × 71 columnas puramente numéricas.
- **Técnicas aplicadas:**
  - Binaria (0/1): `is_uber`.
  - Ordinal Encoding (0 a 5): `service_tier_ord` (respetando la escala de gamas compartidas hasta premium).
  - One Hot Encoding (0/1): `name_*`, `source_*`, `destination_*`, `time_slot_*`, `short_summary_*`.
- **Archivos:**
  - Archivo comprimido: [`Contenido Entrega 2/Dataset Codificado/dataset_codificado.zip`](Contenido%20Entrega%202/Dataset%20Codificado/dataset_codificado.zip)
  - Script generador: [`Contenido Entrega 2/Dataset Codificado/codificar_bd.py`](Contenido%20Entrega%202/Dataset%20Codificado/codificar_bd.py)
  - Documentación técnica: [`Contenido Entrega 2/Dataset Codificado/Explicacion_Codificacion_BD.md`](Contenido%20Entrega%202/Dataset%20Codificado/Explicacion_Codificacion_BD.md)

---

## 🎯 Definición de Variables Objetivo para el Modelado (Sprint 3)

| Objetivo | Variable | Tipo de Problema | Subconjunto de Datos | Justificación Metodológica |
|---|---|---|---|---|
| **Objetivo 1** | `price` | **Regresión** continua | Uber + Lyft (636.568 registros) | Modelar la tarifa final en USD. Se recomienda modelar $\log(\text{price})$ por asimetría positiva en precios altos. |
| **Objetivo 2** | `has_surge` | **Clasificación** binaria | Lyft (excluyendo servicio `Shared`) (255.953 registros · 8,19% positivos) | Anticipar recargo por alta demanda (`surge_multiplier > 1.0`). Uber oculta su multiplicador explícito bajo *upfront pricing*, y `Shared` nunca tiene recargo. |

---

## 🚀 Lineamientos Metodológicos para el Sprint 3 (Modelado y Evaluación)

1. **Prevención de Data Leakage:**
   - Para predecir `has_surge`: **prohibido incluir `price` y `surge_multiplier`** como variables explicativas, ya que contienen directamente el recargo que se intenta predecir.
   - Para predecir `price`: evaluar modelos con y sin `surge_multiplier` como predictora para cuantificar su aporte real marginal.
2. **Estrategia de Partición y Validación:**
   - **Validación temporal por fecha (`datetime_local`):** No particionar de forma aleatoria simple. Como cotizaciones en la misma ruta y minuto comparten recargo por diseño del algoritmo dinámico, un split aleatorio infla artificialmente las métricas.
3. **Métricas en Datos Desbalanceados (`has_surge`):**
   - La tasa de viajes con surge es del **8,19%**.
   - No utilizar *Accuracy* (una regla trivial que prediga siempre 0 obtendría ~91,8% de precisión aparente).
   - Utilizar **PR-AUC (Precision-Recall AUC)**, **F1-Score**, **Recall** y **Matriz de Confusión**.
4. **Tratamiento de Multicolinealidad y Escalamiento:**
   - En modelos lineales: aplicar `drop_first=True` en las variables dummy para evitar la trampa de multicolinealidad perfecta.
   - En PCA o modelos basados en distancias (KNN, SVM, K-Means): aplicar estandarización previa (`StandardScaler`).

---

## 📁 Estructura del Repositorio

```text
├── Contenido Entrega 1/
│   ├── Entrega1_Grupo11.pdf                 # Informe oficial Sprint 1
│   ├── dataset.zip                          # Dataset crudo original (Kaggle)
│   ├── eda_initial.py                       # Script diagnóstico exploratorio inicial
│   ├── feature_engineering.py               # Exploración preliminar de features
│   ├── informe_limpieza_y_variables.md      # Informe diagnóstico y variables
│   └── limpiar_dataset.py                   # Script base de limpieza inicial
│
├── Contenido Entrega 2/
│   ├── Entrega2_Grupo11.pdf                 # Informe oficial Sprint 2
│   ├── requirements.txt                     # Dependencias del pipeline ETL
│   ├── TPI_Ciencia_de_Datos_Sprint2_ETL.ipynb # Notebook interactivo del Sprint 2
│   ├── DataSet Segunda Entrega Sin Codificar/
│   │   └── dataset_nueva_columna.zip        # Dataset limpio con 27 columnas y has_surge
│   ├── Dataset Codificado/
│   │   ├── codificar_bd.py                  # Script de encoding One Hot y Ordinal
│   │   ├── dataset_codificado.zip           # Dataset listo para modelado (71 columnas)
│   │   ├── Explicacion_Codificacion_BD.md   # Guía metodológica de codificación
│   │   └── Explicacion_Codificacion_BD.docx # Versión Word de respaldo
│   └── graficos/                            # 18 figuras de soporte visual (Antes vs Después)
│
├── .gitignore                               # Exclusiones de datasets intermedios y caché
└── README.md                                # Ficha técnica y guía integral del proyecto
```

---

## 🛠️ Metodología
El proyecto sigue las etapas de **CRISP-DM**:
1. Comprensión del negocio y del problema ✅
2. Adquisición y comprensión de los datos ✅
3. Preparación de los datos (ETL y Encoding) ✅
4. **Modelado y análisis (Sprint 3 - En curso)** ⏳
5. Evaluación y comunicación de resultados (Sprint 4) ⏳

La gestión se realiza con **Scrum**, incluyendo planificación, revisiones y retrospectivas en cada sprint.

---

## 📅 Cronograma de Sprints
- **Sprint 1:** Planificación y comprensión del dataset ✅
- **Sprint 2:** Limpieza, ETL, correcciones espaciotemporales y encoding ✅
- **Sprint 3:** Modelado predictivo (Regresión + Clasificación) y evaluación (30/10) ⏳
- **Sprint 4:** Presentación final (*data storytelling*) ⏳

---

## 👥 Integrantes (Grupo 11)
- Alvaro Perez (97986)
- Juan Ignacio Cremona (95789)
- Ignacio Gil (407114)
- Federico Gon (94470)
- Sofía Medina (88655)
- Facundo Dagnino Dailly (94307)

---

## 📚 Referencias
- Cátedra de Ciencia de Datos (2026). *Trabajo Práctico Integral – Proyecto de Ciencia de Datos*. UTN – FRC.
- Schwaber, K. & Sutherland, J. (2020). *La Guía de Scrum*.
- Chapman, P. et al. (2000). *CRISP-DM 1.0: Step-by-step data mining guide*.
- Provost, F. & Fawcett, T. (2013). *Data Science for Business*. O'Reilly Media.
- OpenStreetMap contributors. Nominatim (geocodificación de las zonas). Licencia ODbL.
