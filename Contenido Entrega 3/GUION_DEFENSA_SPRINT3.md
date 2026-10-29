# Guion de Defensa Oral: Sprint 3 (Modelado Predictivo)
**Catedra:** Ciencia de Datos - Curso 5K1 (UTN-FRC)  
**Proyecto:** Determinantes de Precio y Tarifa Dinamica en Uber y Lyft (Boston, MA)  
**Grupo 11:** Alvaro Perez, Juan Ignacio Cremona, Ignacio Gil, Federico Gon, Sofia Medina, Facundo Dagnino Dailly  
**Soporte Visual:** `Presentacion_Entrega3_Grupo11.ipynb` / `Presentacion_Entrega3_Grupo11.pdf`

---

## 1. Curaduria de Graficos: Criterio de Calidad para la Exposicion

El proyecto dispone de 11 figuras tecnicas (`fig01` a `fig11`). Para una presentacion oral rigurosa y concisa de 10 a 12 minutos ante el tribunal docente, se priorizan los **5 graficos esenciales**, desplazando los 6 restantes a un bloque de anexo tecnico.

### Graficos Esenciales (Bloque Principal de Defensa)
1. **`fig01_precio_real_vs_predicho.png` (Regresion del Precio):** Demuestra el ajuste predictivo cuantitativo ($R^2=0.967$, MAE USD 1.08) y confirma que la tarifa es netamente estructural.
2. **`fig05_recargo_matrices_confusion.png` (Matrices de Confusion y Balanceo):** Contrapone visualmente el 91.7% de accuracy trivial frente al modelo calibrado con pesos de clase que logra un Recall del 51.4% (2.531 recargos detectados).
3. **`fig06_recargo_matriz_beneficio.png` (Matriz de Beneficio Economico):** Aporte metodologico distintivo. Fundamenta el umbral de corte de probabilidad en terminos monetarios (ganancia de +USD 56 cada 1.000 cotizaciones con umbral 0.57) en lugar de una metrica abstracta.
4. **`fig07_recargo_curvas_roc_pr.png` (Curvas ROC y Precision-Recall):** Rigor estadistico formal sobre datos futuros no vistos (ROC-AUC 0.676 y PR-AUC 0.140 sobre la tasa base del 8.2%).
5. **`fig11_productos_kmeans.png` (Clustering K-Means no supervisado):** Validación no supervisada mediante Metodo del Codo y Coeficiente de Silueta ($k=3$, $s=0.682$), agrupando los 12 productos en 3 familias simetricas entre Uber y Lyft.

### Graficos Secundarios (Bloque de Anexo y Respaldo Tecnico)
* `fig02_precio_importancia_y_tarifas`: Detalle de importancia de features (se menciona al explicar la Figura 1).
* `fig03_recargo_validacion_profundidad` y `fig09_recargo_arbol_reglas`: Respaldo para justificar la poda y evitar el sobreajuste del arbol.
* `fig04_recargo_balanceo`: Comparativa de distribuciones del laboratorio de balanceo.
* `fig08_recargo_importancia_odds_ratio`: Odds ratios geograficos de la regresion logistica.
* `fig10_recargo_deciles_riesgo`: Grafico de concentracion de riesgo acumulado (Lift Chart).

---

## 2. Analisis Metodologico de los 11 Graficos

| Grafico | Algoritmo / Metodo | Lectura de los Datos | Conclusion Tecnico-Metodologica |
| :--- | :--- | :--- | :--- |
| **`fig01`** | Random Forest Regresor sobre log(price). | Dispersion de valores predichos vs reales alineada en la diagonal principal. El 75% de los viajes tiene error relativo inferior al 10%. | Error medio de **USD 1.08** ($R^2=0.967$). Sin el multiplicador como predictor, el error es USD 1.32. El precio responde a una estructura deterministica. |
| **`fig02`** | Importancia por permutacion de variables. | Producto (`name_*`) y distancia concentran el 95% del peso. Factores climaticos y franjas horarias registran peso nulo. | Confirma H1 y refuta H5: el clima adverso no encarece la tarifa base en Boston. |
| **`fig03`** | Validacion temporal (`GroupKFold`) variando `max_depth`. | Divergencia abrupta entre train (1.0) y validacion despues de profundidad 5. | Evidencia empirica de sobreajuste que justifica la poda preventiva del arbol de decision. |
| **`fig04`** | Comparativa de tecnicas de balanceo. | Base (0% recall), Submuestreo (perdida de muestra), SMOTE (creacion de valores invalidos en variables binarias) y Pesos de clase. | `class_weight='balanced'` sensibiliza la funcion de perdida utilizando el 100% de cotizaciones reales. |
| **`fig05`** | Matrices de confusion en conjunto de prueba (59.395 casos). | Linea base sin balancear: 0 detecciones. Gradient Boosting con pesos de clase: 2.531 aciertos (Recall 51.4%). | Muestra el compromiso operativo necesario entre sensibilidad y volumen de falsas alarmas. |
| **`fig06`** | Matriz de beneficio economico y analisis de sensibilidad. | Asignacion monetaria: VP = +USD 7.73 (recargo evitado), FP = -USD 1.00 (espera/comparacion innecesaria). Maximo en umbral 0.57. | **Criterio optimo:** genera un beneficio de **+USD 56 cada 1.000 cotizaciones**. Supera al umbral estandar 0.50 reduciendo alertas espurias. |
| **`fig07`** | Curvas ROC (AUC=0.676) y Precision-Recall (AUC=0.140). | Desempeño sostenido por encima del clasificador aleatorio y de la tasa base poblacional (8.2%). | Certifica capacidad de discriminacion y ordenamiento de riesgo en fechas futuras no vistas. |
| **`fig08`** | Odds Ratio en Regresion Logistica (con regularizacion $C=1.0$). | Mayor probabilidad de recargo en Northeastern (1.29) y Fenway (1.23); minima en Haymarket (0.37) y North End (0.38). | El recargo responde a un fenomeno espacial/geografico antes que a un factor temporal. |
| **`fig09`** | Visualizacion de reglas del Arbol de Decision. | Divisiones iniciales estructuradas por tasa historica del origen y distancia. | Proporciona explicabilidad transparente (modelo de caja blanca) para usuarios y conductores. |
| **`fig10`** | Deciles de riesgo acumulado (Lift Chart). | El decil 10 concentra el 22% de todos los recargos; los dos deciles superiores concentran el 35%. | Valida la utilidad practica del modelo para identificar zonas calientes de alta demanda. |
| **`fig11`** | K-Means ($k=3$) con curvas de Inercia y Silueta. | Quiebre de inercia y maximo de silueta en $s=0.682$. Mapeo en 2D de Tarifa Base vs. Costo por Milla. | Confirma H6: identificacion de 3 familias tarifarias simetricas (Economica, Intermedia, Premium) entre ambas companias. |

---

## 3. Guion de Exposicion Oral (Paso a Paso con el Cuaderno Colab)

### Minutos 0 a 2: Introduccion y Control de Fuga de Datos (Seccion 1 del Colab)
> "Buenas tardes profesores. En esta Entrega 3 implementamos la etapa de Modelado Predictivo y Evaluacion del ciclo CRISP-DM, respondiendo a dos preguntas concretas:
> 1. Que determina el valor del viaje y con que precision se puede predecir (`price`).
> 2. Si es posible anticipar la aparicion de tarifa dinamica (`has_surge`) en Lyft.
>
> Antes de entrenar los algoritmos, aplicamos un riguroso protocolo contra la fuga de datos (*Data Leakage*):
> Primero, para clasificar el recargo prohibimos estrictamente el uso de `price` y `surge_multiplier`, ya que contienen directamente el fenomeno a predecir.
> Segundo, implementamos una particion temporal por fechas. En este dataset, cotizaciones del mismo minuto y trayecto comparten el recargo. Si hicieramos una particion aleatoria clasica, el modelo memorizaria cotizaciones gemelas e inflaria las metricas hasta un 87%. Por ello, entrenamos exclusivamente del 25 de noviembre al 14 de diciembre y evaluamos el rendimiento en 4 dias posteriores completamente ciegos para el modelo, del 15 al 18 de diciembre."

### Minutos 2 a 5: Objetivo 1 - Regresion del Precio (Seccion 2 del Colab - Figura 1)
> *(Presentar Seccion 2 y exhibir la Figura 1)*  
> "Para predecir el precio del viaje evaluamos modelos lineales regularizados (Ridge), arboles de decision y Random Forest, trabajando sobre la transformacion logaritmica de la tarifa para mitigar la asimetria de las gamas de lujo.
>
> Como se observa en la **Figura 1**, el modelo con mejor desempeño fue **Random Forest con multiplicador de recargo**, alcanzando un coeficiente de determinacion **$R^2 = 0.967$** y un error absoluto medio (MAE) de apenas **USD 1.08**. Tres de cada cuatro viajes se predicen con un error menor al 10%. En un escenario ciego donde no se disponga del multiplicador, el modelo mantiene una capacidad explicativa notable, con un MAE de USD 1.32.
>
> Este resultado confirma nuestra Hipotesis 1: el precio es una funcion netamente **estructural**, explicada por el tipo de producto contratado y la distancia. A su vez, los factores climaticos y horarios exhibieron un peso prácticamente despreciable, refutando la creencia popular de la Hipotesis 5 de que la lluvia o el frio encarecen las tarifas base."

### Minutos 5 a 8: Objetivo 2 - Clasificacion de Recargo y Dilema del Accuracy (Seccion 3 del Colab - Figura 5)
> *(Avanzar a Seccion 3 y exhibir la Figura 5)*  
> "Al abordar la clasificacion binaria del recargo dinamico nos enfrentamos a un **desbalance critico del 91.8% de viajes sin recargo frente a solo 8.2% con recargo**.
>
> Este contexto pone de manifiesto la trampa del Accuracy tradicional: un clasificador ingenuo que responda siempre 'sin recargo' obtiene un 91.7% de precision global aparente, pero un Recall del 0%, siendo nulo para el negocio.
>
> Tras comparar tecnicas de balanceo aplicadas unicamente en entrenamiento, determinamos que los pesos de clase (`class_weight='balanced'`) ofrecen la solucion optima, ya que penalizan fuertemente los errores en la clase minoritaria sin alterar la muestra con datos sinteticos o descartar informacion valiosa.
>
> En la matriz de confusion de la **Figura 5** vemos que el modelo final basado en Gradient Boosting logra un **Recall del 51.4%**, identificando 2.531 viajes con recargo real sobre fechas futuras no vistas, operando con una Accuracy Balanceada del 60.8% frente al 50% de una regla aleatoria."

### Minutos 8 a 10: Matriz de Beneficio y Curvas de Riesgo (Secciones 4 y 5 del Colab - Figuras 6 y 7)
> *(Avanzar a Secciones 4 y 5, exhibiendo Figuras 6 y 7)*  
> "Para definir el umbral de decision descartamos el valor estandar de 0.50 y el F1 abstracto, incorporando una **Matriz de Beneficio Economico**:
> - Acertar un recargo real le ahorra al pasajero en promedio **+USD 7.73** (permitiendole comparar con Uber o postergar el pedido).
> - Una falsa alarma le genera un costo estimado de **-USD 1.00** en tiempo invertido.
>
> Como ilustra la **Figura 6**, al modelar la curva de costos encontramos un punto optimo en el **umbral 0.57**. Este criterio selectivo maximiza el retorno, generando un beneficio de **+USD 56 cada 1.000 cotizaciones**.
>
> Respaldando esta calibracion, la **Figura 7** muestra un **ROC-AUC de 0.676** y un **PR-AUC de 0.140**. Todos los algoritmos ensayados tocan un techo similar cercano a 0.68 porque las variables exogenas del dataset (clima, trayecto y hora) no capturan la relacion oferta-demanda de choferes en tiempo real. No obstante, el modelo discrimina con solvencia el riesgo relativo."

### Minutos 10 a 11: Aprendizaje No Supervisado con K-Means (Seccion 6 del Colab - Figura 11)
> *(Avanzar a Seccion 6 y exhibir la Figura 11)*  
> "Finalmente, en cumplimiento de los objetivos no supervisados y para contrastar la Hipotesis 6, aplicamos **clustering particional K-Means** sobre los 12 productos de ambas companias, cruzando su tarifa de arranque (bajada de bandera) y su costo por milla en viajes sin recargo.
>
> El numero de agrupamientos se determino de manera rigurosa: el **Metodo del Codo y el Coeficiente de Silueta coincidieron en $k=3$, alcanzando un score de silueta de 0.682**, lo que garantiza clusters compactos y bien diferenciados.
>
> Como exhibe la **Figura 11**, los productos se ordenan de forma natural en tres familias equivalentes:
> 1. **Economica:** Shared, UberPool, Lyft, UberX y WAV (tarifa base de USD 3 a 6 y costo de USD 1.2 a 1.7 por milla).
> 2. **Intermedia:** Lyft XL, Lux, UberXL, Black y Lux Black (base de USD 8 a 12).
> 3. **Premium:** Black SUV y Lux Black XL (tarifas de arranque superiores a USD 21).
>
> El analisis evidencia que Lyft es mas competitiva en las opciones accesibles, mientras que Uber ofrece mejores valores en las gamas ejecutivas."

### Minutos 11 a 12: Cierre y Preguntas (Seccion 7 del Colab)
> *(Mostrar tabla final de conclusiones)*  
> "En sintesis: logramos modelar el precio con una precision del 96.7% respaldada en la arquitectura de producto y distancia; demostramos las limitaciones estructurales y la seleccion economica de umbral para el recargo dinamico; y segmentamos objetivamente las familias de servicio mediante metodos no supervisados.
>
> En el bloque de anexo del notebook disponemos del respaldo de hiperparámetros, arboles de reglas y análisis de sensibilidad para cualquier consulta puntual. Quedamos a disposicion de sus preguntas. Muchas gracias."
