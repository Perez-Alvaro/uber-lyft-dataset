# Modelos Implementados: Sintesis Metodologica y Resultados
**Catedra:** Ciencia de Datos - Curso 5K1 (UTN-FRC)  
**Proyecto:** Uber y Lyft en Boston, MA | **Entrega 3 (Modelado Predictivo y Evaluacion)**

---

## 1. Regresion de Tarifa (`price` en USD)
* **Objetivo:** Predecir el valor continuo del viaje en USD sobre 636.568 registros (Uber + Lyft).
* **Target:** Se modelo sobre $\log(\text{price})$ para mitigar la asimetria generada por viajes de lujo.
* **Modelos ensayados:**
  * **Ridge Regression (lineal regularizado):** Linea base lineal. Capta la tendencia general pero no segmenta tarifas base fijas.
  * **Arbol de Decision Regresor:** Capta la combinacion de producto y distancia mediante divisiones binarias sucesivas.
  * **Random Forest Regresor (Modelo Campeon):**
    * **Con `surge_multiplier`:** $R^2 = 0.967$ | MAE = **USD 1.08** (75% de los viajes con error $\le 10\%$).
    * **Sin `surge_multiplier` (escenario ciego):** $R^2 = 0.928$ | MAE = **USD 1.32**.
* **Hallazgo clave:** El precio es enteramente **estructural**: la combinacion de producto (`name_*`) y distancia explica mas del 95% de la varianza. El clima y la hora no tienen impacto en la tarifa base.

---

## 2. Clasificacion Binaria de Recargo Dinamico (`has_surge` en Lyft)
* **Objetivo:** Anticipar si una cotizacion tendra recargo (`surge_multiplier > 1.0`) en 255.953 cotizaciones de Lyft (excluyendo `Shared`).
* **Control de Data Leakage:** Exclusion estricta de `price` y `surge_multiplier` como predictores.
* **El dilema del desbalance:** Solo el **8.2%** de las cotizaciones tiene recargo. Un clasificador trivial que diga siempre "sin recargo" logra un **91.7% de Accuracy**, pero un **Recall del 0%** (no detecta ningun recargo).
* **Tratamiento de balanceo:** Se compararon en entrenamiento la linea base sin balancear, submuestreo, SMOTE y **pesos de clase (`class_weight='balanced'`)**, siendo este ultimo el metodo optimo por sensibilizar la funcion de perdida sin inventar datos sinteticos en variables dummy.
* **Modelos ensayados:**
  * **Regresion Logistica:** Regularizacion fuerte para interpretar coeficientes espaciales (Odds Ratio).
  * **Arbol de Decision:** Modelo explicable de caja blanca podado para evitar sobreajuste (`max_depth=5` o min 500 muestras por hoja).
  * **Random Forest Clasificador:** Ensamble de embolsado para evaluar estabilidad.
  * **Gradient Boosting (Modelo Campeon):**
    * **Accuracy Balanceada:** **60.8%** (frente al 50.0% del azar).
    * **Recall:** **51.4%** (detecta mas de la mitad de todos los recargos reales en fechas futuras).
    * **Precision:** **13.5%** (frente al 8.2% de la tasa base poblacional).
    * **ROC-AUC:** **0.676** | **PR-AUC:** **0.140**.
* **Seleccion del Umbral con Matriz de Beneficio Economico:**
  * En lugar del corte estandar de 0.50, se fijo en **0.57** asignando valores monetarios: VP = +USD 7.73 (recargo medio ahorrado), FP = -USD 1.00 (espera/comparacion innecesaria).
  * Genera una ganancia neta demostrada de **+USD 56 cada 1.000 cotizaciones**, reduciendo alertas espurias.
* **Hallazgo espacial:** El recargo responde a un fenomeno **espacial y no horario**: orígenes como Northeastern (Odds Ratio 1.29) o Fenway (1.23) duplican la probabilidad respecto a Haymarket (0.37) o North End (0.38).

---

## 3. Aprendizaje No Supervisado: Segmentacion con K-Means
* **Objetivo:** Agrupar los 12 productos de Uber y Lyft segun su tarifa base de arranque y su costo por milla en viajes sin recargo.
* **Validacion del numero de clusters ($k$):** El **Metodo del Codo** y el **Coeficiente de Silueta** coincidieron en un optimo contundente de **$k = 3$**, con una silueta de **$s = 0.682$**.
* **Tres familias tarifarias simetricas descubiertas:**
  1. **Economica:** Shared, UberPool, Lyft, UberX, WAV (tarifa base de USD 3 a 6 y USD 1.2 a 1.7 por milla).
  2. **Intermedia:** Lyft XL, Lux, UberXL, Black, Lux Black (tarifa base de USD 8 a 12).
  3. **Premium:** Black SUV y Lux Black XL (tarifa base de arranque superior a USD 21).
* **Hallazgo competitivo:** Uber y Lyft estructuran sus gamas de forma gemela. Lyft es mas barata en la base accesible y Uber es mas competitiva en las gamas ejecutivas y de lujo.
