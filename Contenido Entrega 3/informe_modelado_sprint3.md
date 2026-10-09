# Informe Metodológico y Experimental — Sprint 3 (Modelado Predictivo y Evaluación)
**Proyecto**: Análisis de Factores Determinantes en el Precio de Viajes (Uber & Lyft — Boston, MA)  
**Universidad**: Universidad Tecnológica Nacional – Facultad Regional Córdoba (UTN-FRC)  
**Carrera**: Ingeniería en Sistemas de Información | **Cátedra**: Ciencia de Datos | **Curso**: 5K1  
**Docente**: Ing. Marisa del Carmen Callejas  
**Grupo 11**: Alvaro Perez, Juan Ignacio Cremona, Ignacio Gil, Federico Gon, Sofía Medina, Facundo Dagnino Dailly  

---

## 📌 1. Resumen Ejecutivo del Sprint 3
En este Sprint se desarrolló la etapa de **Modelado y Evaluación** del ciclo CRISP-DM, respondiendo de forma directa a las pautas y directivas de la cátedra:
1. **Auditoría de distribuciones y desbalance**: Diagnóstico del target continuo (`price`) y análisis del desbalance extremo de tarifa dinámica en Lyft (`has_surge`).
2. **Laboratorio de Balanceo de Datos**: Comparación empírica en el conjunto de entrenamiento de:
   - *Línea Base* (desbalanceado real ~92/8).
   - *Undersampling* (eliminación aleatoria de casos sin surge).
   - *Oversampling* (generación sintética con SMOTE).
   - *Ponderación de Costo / Algorítmica* (`class_weight='balanced'`).
3. **Modelos de Regresión (`price`)**: Comparación entre **Regresión Lineal** (OLS directa y logarítmica) y **Árbol de Decisión Regresor**, analizando $R^2$, RMSE y MAE.
4. **Modelos de Clasificación Binaria (`has_surge`)**: Entrenamiento de **Regresión Logística** y **Árbol de Decisión** con sus respectivas **Matrices de Confusión**, evaluando Recall, Precision, F1-Score y ROC-AUC bajo estricto control de *Data Leakage*.
5. **Modelos de Clasificación Multiclase en Uber (`service_tier`)**: Inferencia del nivel de servicio contratado a partir de distancia y costo por milla (`price_per_mile`), analizando la **Matriz de Confusión Multiclase ($5 \times 5$)**.

---

## 📈 2. Resultados: Modelos de Regresión de Tarifa (`price`)

Para responder al objetivo de predecir el precio del viaje en USD, se contrastaron modelos lineales frente a árboles con las variables: `distance`, `straight_line_miles`, `service_tier`, `cab_type`, `time_slot`, `is_rush_hour`, `is_weekend`, `temperature`, `humidity` y `windSpeed`.

| Modelo de Regresión | Transformación del Target | $R^2$ (Varianza Explicada) | RMSE ($ USD) | MAE ($ USD) |
| :--- | :---: | :---: | :---: | :---: |
| **Regresión Lineal Simple (OLS)** | Directa (`price`) | 0.8818 | \$3.23 | \$2.28 |
| **Regresión Lineal Logarítmica** | $\log(\text{price})$ | 0.8875 | \$3.15 | \$2.19 |
| **Árbol de Decisión Regresor (depth=12)** | Directa (`price`) | **0.9055** | **\$2.89** | **\$1.85** |

### Conclusiones de Regresión:
- El **Árbol de Decisión Regresor** superó a los modelos lineales alcanzando un **$R^2 = 0.9055$** y un error promedio de **\$1.85 USD**, debido a que segmenta de forma natural las tarifas fijas de cada nivel de servicio (`service_tier`) combinadas con la distancia.
- La **Regresión Logarítmica** demostró ser superior a la lineal directa para mitigar el impacto de tarifas muy altas (Lux Black XL, Black SUV), reduciendo el RMSE a \$3.15 USD.

---

## ⚖️ 3. Resultados: Clasificación Binaria y Laboratorio de Balanceo (`has_surge`)

En el subconjunto de Lyft sin Shared (255.953 cotizaciones), el target presenta un **desbalance crítico**:
- **Clase 0 (Sin Surge):** 91.81% (234.978 cotizaciones)
- **Clase 1 (Con Surge):** 8.19% (20.975 cotizaciones)

> 🛡️ **Garantía Metodológica:** Para evitar *Data Leakage*, `price` y `surge_multiplier` fueron **estrictamente excluidas**. Todas las técnicas de balanceo se aplicaron **exclusivamente sobre el Train Set** (75%), evaluando siempre sobre el Test Set real (25%).

### Comparativa de Técnicas de Balanceo:

| Técnica de Balanceo | Modelo | Recall (Detección de Surge) | Precision | F1-Score | ROC-AUC | Matriz de Confusión [TN, FP / FN, TP] |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Desbalanceado (Base)** | Regresión Logística | **0.00%** | 0.00% | 0.0000 | 0.6551 | `[58744, 0 / 5244, 0]` |
| | Árbol de Decisión | **1.77%** | 48.95% | 0.0342 | 0.6869 | `[58647, 97 / 5151, 93]` |
| **2. Undersampling (Ratio 1:2)** | Regresión Logística | **0.00%** | 0.00% | 0.0000 | 0.6533 | `[58744, 0 / 5244, 0]` |
| | Árbol de Decisión | **9.50%** | 18.79% | 0.1262 | 0.6868 | `[56588, 2156 / 4746, 498]` |
| **3. Oversampling (SMOTE 1:2)** | Regresión Logística | **2.00%** | 14.34% | 0.0351 | 0.6541 | `[58117, 627 / 5139, 105]` |
| | Árbol de Decisión | **1.58%** | 26.35% | 0.0299 | 0.6233 | `[58512, 232 / 5161, 83]` |
| **4. Ponderación Algorítmica (`class_weight='balanced'`)** | **Regresión Logística** | **74.77%** | 11.71% | **0.2025** | 0.6541 | `[29141, 29603 / 1323, 3921]` |
| | **Árbol de Decisión** | **83.41%** | 11.98% | **0.2095** | **0.6830** | `[26650, 32094 / 870, 4374]` |

### Hallazgo Central de Negocio:
1. **El modelo sin balancear fracasa por completo**: El clasificador trivial dice siempre "Sin Surge" logrando un Accuracy engañoso de 91.8%, pero un **Recall del 0.00%** (incapaz de predecir la tarifa dinámica).
2. **SMOTE y Undersampling moderado**: Mejoran marginalmente la detección pero sufren en datos de alta dimensionalidad con solapamiento geográfico.
3. **La Ponderación Algorítmica (`class_weight='balanced'`) es el método campeón**: Logra que el modelo detecte entre el **74.77% y el 83.41% de todos los viajes con recargo real** (4.374 aciertos sobre 5.244 en Test), convirtiéndose en la herramienta útil para el usuario y la plataforma.

---

## 🎯 4. Resultados: Clasificación Multiclase en Uber (`service_tier`)

Dado que Uber oculta su tarifa dinámica bajo el esquema cerrado de *Upfront Pricing*, se modeló la inferencia de producto/gama a partir de variables económicas: `distance`, `price`, `price_per_mile` ($= \text{price} / \text{distance}$) y `straight_line_miles`.

- **Muestra evaluada:** 329.414 cotizaciones de Uber.
- **Clases balanceadas:** Compartido (16.7%), Estándar (33.3%), XL (16.7%), Black (16.7%), Black XL (16.7%).

| Modelo Multiclase | Accuracy Global | Macro F1-Score | Weighted F1-Score |
| :--- | :---: | :---: | :---: |
| **Regresión Logística Multinomial (Softmax)** | 81.76% | 0.7974 | 0.8120 |
| **Árbol de Decisión Multiclase (depth=8)** | **86.66%** | **0.8663** | **0.8664** |

### Análisis de la Matriz de Confusión Multiclase ($5 \times 5$):
- **Diagonal Principal dominante:** La gran mayoría de cotizaciones se clasifican en su nivel exacto (precisión superior al 95% en gamas extremas como *Compartido* y *Black XL*).
- **Confusiones naturales:** El 13% de error restante ocurre casi exclusivamente entre gamas contiguas de costo similar (por ejemplo, *UberX* vs. *UberPool* en distancias muy cortas), lo que valida la robustez de las fronteras de decisión aprendidas.

---

## 📁 5. Estructura de Entregables del Sprint 3
Los artefactos quedan versionados en [`Contenido Entrega 3/`](file:///c:/Users/perez/OneDrive/Escritorio/VS%20LOCAL/uber-lyft-dataset/Contenido%20Entrega%203):
- **Notebook Maestro para Google Colab:** [`TPI_Ciencia_de_Datos_Sprint3_Modelado.ipynb`](file:///c:/Users/perez/OneDrive/Escritorio/VS%20LOCAL/uber-lyft-dataset/Contenido%20Entrega%203/TPI_Ciencia_de_Datos_Sprint3_Modelado.ipynb) (autoejecutable, con badge de Colab y carga automática).
- **Script de Reproducibilidad:** [`ejecutar_experimentos_sprint3.py`](file:///c:/Users/perez/OneDrive/Escritorio/VS%20LOCAL/uber-lyft-dataset/Contenido%20Entrega%203/ejecutar_experimentos_sprint3.py).
- **Galería de Gráficos:**
  - `01_regresion_precio_predicciones.png` (Dispersión real vs predicho y residuos).
  - `02_matrices_confusion_surge_balanceo.png` (8 matrices de confusión comparando las 4 técnicas).
  - `03_matriz_confusion_uber_multiclase.png` (Matrices 5x5 de Softmax y Árbol).
  - `04_uber_separabilidad_servicios.png` (Fronteras de dispersión precio vs distancia).
- **Requisitos de Entorno:** [`requirements.txt`](file:///c:/Users/perez/OneDrive/Escritorio/VS%20LOCAL/uber-lyft-dataset/Contenido%20Entrega%203/requirements.txt).
