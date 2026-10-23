# Entrega 3 · Resumen del modelado

Grupo 11 · Ciencia de Datos 5K1 · UTN FRC · Uber y Lyft en Boston

## El problema

¿Qué determina el precio de un viaje y qué tan bien se puede predecir? Lo dividimos en dos objetivos, definidos en la Entrega 2:

| | Objetivo 1 | Objetivo 2 |
|---|---|---|
| **Variable a predecir** | `price`: precio del viaje (USD) | `has_surge`: si la cotización tiene recargo (sí/no) |
| **Tipo** | Regresión | Clasificación binaria |
| **Datos** | Uber + Lyft · 636.568 cotizaciones | Lyft sin Shared · 255.953 cotizaciones (8,2% con recargo) |

**Variables predictoras:** producto (12 servicios), distancia, zona de origen y destino, hora, día, franja horaria y clima. En el recargo también usamos la tasa histórica de recargo de cada ruta. En el precio probamos cada modelo con y sin `surge_multiplier`. En el recargo se excluyeron `price` y `surge_multiplier`, porque contienen la respuesta (fuga de datos).

## Cómo trabajamos

- **Separación por fecha, no al azar:** entrenamiento del 25/11 al 14/12 y prueba del 15 al 18/12 (4 días que el modelo nunca vio).
- **Validación cruzada temporal en orden** (4 folds) para elegir hiperparámetros, técnica de balanceo, umbral y modelo. Como control, también corrimos una **validación cruzada mezclada** (5 folds estratificados): da resultados más optimistas (en random forest, más del doble de PR-AUC), porque cotizaciones del mismo minuto y ruta quedan a ambos lados. En las dos, el balanceo se aplica solo al entrenamiento y se valida contra datos reales.
- **Hiperparámetros por búsqueda en grilla**, con grillas extendidas hasta que el valor elegido quedara adentro y no en un extremo.
- **Balanceo de clases (recargo):** comparamos sin balanceo, submuestreo, SMOTE y pesos de clase.
- **Umbral de decisión elegido con una matriz de beneficio** y **niveles de certeza** con intervalos de confianza del 95% (bootstrap por horas).

## Modelos probados y resultados

**Precio (regresión).** Probamos Ridge, árbol de decisión y random forest.

| Modelo | Error medio | R² | Viajes con error ≤ 10% |
|---|---|---|---|
| **Random forest con surge** (elegido) | USD 1,08 (IC 95%: 1,07 a 1,09) | **0,967** | 75% (línea base: 34%) |
| Random forest sin surge | USD 1,32 | 0,928 | 72% |

**Recargo (clasificación).** Probamos regresión logística, árbol de decisión, random forest y gradient boosting.

| Modelo | Accuracy | Accuracy balanceada | Recall | Precisión |
|---|---|---|---|---|
| **Gradient boosting con pesos de clase** (elegido, umbral 0,57) | 68,6% | 60,8% | 51,4% | 13,5% |
| *Referencia: decir siempre "sin recargo"* | *91,7%* | *50,0%* | *0%* | *–* |
| *Referencia: tasa histórica de la zona de origen (sin modelo)* | *66,0%* | *58,7%* | *50,0%* | *12,2%* |

Intervalos de confianza del 95% del modelo elegido: accuracy 67,3% a 69,8%, accuracy balanceada 59,4% a 62,1%, ROC-AUC 0,663 a 0,689.

La accuracy del recargo se lee contra la línea base. Decir siempre "sin recargo" acierta el 91,7%, pero no detecta ningún recargo. El modelo baja la accuracy porque sí avisa: detecta 5 de cada 10 recargos, y de cada 100 avisos 13 o 14 son reales (el azar acierta 8).

### Por qué el recargo quedó en 69% de accuracy

1. **Las clases están muy desbalanceadas.** Solo el 8,2% de las cotizaciones tiene recargo. Un modelo que no aprende nada y dice siempre "no" ya acierta el 91,7%, así que una accuracy alta en este problema no indica un buen modelo.
2. **El modelo avisa recargos, y cada falsa alarma resta accuracy.** Con pesos de clase el modelo aprende a no ignorar los recargos; el umbral se eligió con la matriz de beneficio, que pide avisar solo cuando conviene.
3. **Subir la accuracy es fácil, pero empeora el modelo.** Con un umbral más alto llega a 89% de accuracy, pero detecta solo 1 de cada 10 recargos. En el extremo, deja de avisar y vuelve al 91,7% de "siempre no".
4. **Falta la información que realmente define el recargo.** El recargo depende de cuántos pedidos y conductores hay en cada minuto, y eso no está en el dataset. Por eso los cuatro algoritmos llegan al mismo techo (ROC-AUC entre 0,65 y 0,68): el límite está en los datos, no en el modelo.
5. **La evaluación es honesta.** Probamos con días que el modelo nunca vio. Con mezcla al azar los resultados parecían hasta el doble de buenos, pero esa mejora era falsa.

En resumen: la mejora real se ve en la accuracy balanceada (60,8%, contra 50% del azar) y en el beneficio de la matriz.

### Matriz de beneficio: en qué conviene enfocarse

| | Predice sin recargo | Predice con recargo (aviso) |
|---|---|---|
| **Real: sin recargo** | VN · USD 0 | FP · −USD 1,00 (compara o espera sin necesidad; supuesto) |
| **Real: con recargo** | FN · USD 0 (paga el recargo, igual que sin modelo) | VP · +USD 7,73 (evita el recargo medio de USD 8,73) |

- **Conviene avisar solo si la probabilidad de recargo supera el 11,4%** (USD 1 / USD 8,73). Con ese criterio el umbral es 0,57: el modelo avisa en el 32% de las cotizaciones y gana **USD 56 cada 1.000 cotizaciones** (IC 95%: 35 a 78). Con el umbral de máximo F1 avisaba de más (38%).
- **Conviene enfocarse en la precisión** (menos falsas alarmas), no en detectar todos los recargos: para detectar el 90% de los recargos hay que avisar en casi el 80% de las cotizaciones, y el beneficio se vuelve negativo.
- **Límite del dominio:** la precisión del modelo nunca supera ~20%. Si una falsa alarma costara USD 2 o más, no convendría avisar nunca.

**Curva ROC:** ROC-AUC de 0,676 (IC 95%: 0,663 a 0,689). Si se toma al azar una cotización con recargo y una sin recargo, el modelo le da más puntaje a la que tiene recargo el 68% de las veces. Está claramente por encima del azar (0,5), pero lejos de un clasificador fuerte.

**Complementario (no supervisado).** Con K-Means agrupamos los 12 productos según su tarifa base y su precio por milla. El codo y la silueta coinciden en k = 3 (silueta 0,68).

## Qué descubrimos

1. **El precio es estructural y predecible:** lo explican el producto y la distancia. La hora y el clima casi no aportan.
2. **Uber y Lyft arman el precio igual:** los 12 productos forman 3 familias de tarifa (económico, intermedio y premium), y cada producto de Uber cae en la misma familia que su equivalente de Lyft. Lyft es más barato en los económicos y más caro en los Black.
3. **El recargo depende del lugar, no del momento:** salir de Northeastern, Boston University, Fenway o Back Bay aumenta la chance de recargo; salir de North End o Haymarket la reduce a menos de la mitad.
4. **El recargo es difícil de anticipar:** los cuatro algoritmos llegan a un techo parecido. Aun así, el modelo supera con certeza a la regla simple por zona de origen (PR-AUC +0,022, IC 95%: 0,015 a 0,029).
5. **Uso práctico:** el modelo no acierta viaje por viaje, pero ordena el riesgo. El 20% de cotizaciones más riesgosas concentra el 35% de los recargos.

| Hipótesis (Entrega 1) | Resultado |
|---|---|
| H1 · Producto y distancia definen el precio | Confirmada |
| H2 · Uber y Lyft difieren según el nivel de servicio | Confirmada |
| H3 · Hay patrones horarios en precio y recargo | No se confirma |
| H4 · Hay rutas más caras por milla | Confirmada (las cortas, por la tarifa base) |
| H5 · El mal clima encarece los viajes | Rechazada |
| H6 · Hay segmentos tarifarios homogéneos | Confirmada (3 familias de productos) |

## Dónde ver el detalle

| Qué | Dónde |
|---|---|
| Informe completo (formato paper) | `1_Informe/Entrega3_Grupo11.docx` |
| Presentación | `2_Presentacion_Colab/` (Colab ya ejecutado y PDF) |
| Cómo se hizo cada modelo, paso a paso | `Modelos/README.md` |
| Qué cambió respecto de la versión anterior | `CAMBIOS_RESPECTO_VERSION_ANTERIOR.md` |
| Código y resultados | `3_Codigo/modelado_entrega3.py` y `6_Resultados/metricas.json` |
