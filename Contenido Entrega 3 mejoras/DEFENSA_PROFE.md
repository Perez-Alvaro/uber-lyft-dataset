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

- **Separación por fecha, no al azar:** entrenamiento del 25/11 al 14/12 y prueba del 15 al 18/12 (4 días que el modelo nunca vio). Cotizaciones del mismo minuto y ruta comparten el recargo; con mezcla al azar, los modelos parecían hasta un 87% mejores.
- **Hiperparámetros elegidos por búsqueda en grilla** con validación temporal en orden: siempre se valida con fechas posteriores a las de entrenamiento. La prueba final no se usó para elegir nada.
- **Balanceo de clases (recargo):** comparamos sin balanceo, submuestreo, SMOTE y pesos de clase, aplicados solo al entrenamiento.

## Modelos probados y resultados

**Precio (regresión).** Probamos Ridge, árbol de decisión y random forest.

| Modelo elegido | Error medio | R² | Viajes con error ≤ 10% |
|---|---|---|---|
| **Random forest con surge** | USD 1,08 | **0,967** | 75% (línea base: 34%) |

**Recargo (clasificación).** Probamos regresión logística, árbol de decisión, random forest y gradient boosting.

| Modelo elegido | Accuracy | Accuracy balanceada | Recall | Precisión |
|---|---|---|---|---|
| **Gradient boosting con pesos de clase** | 63,3% | 62,1% | 60,7% | 13,1% |
| *Referencia: decir siempre "sin recargo"* | *91,7%* | *50,0%* | *0%* | *–* |

La accuracy del recargo se lee contra la línea base. Decir siempre "sin recargo" acierta el 91,7%, pero no detecta ningún recargo. El modelo baja la accuracy porque sí avisa: detecta 6 de cada 10 recargos, y de cada 100 avisos 13 son reales (el azar acierta 8).

### Por qué el recargo quedó en 63% de accuracy

1. **Las clases están muy desbalanceadas.** Solo el 8,2% de las cotizaciones tiene recargo. Un modelo que no aprende nada y dice siempre "no" ya acierta el 91,7%, así que la accuracy alta en este problema no indica un buen modelo.
2. **Priorizamos detectar recargos.** Con pesos de clase y un umbral elegido para maximizar el F1, el modelo avisa más, y cada aviso equivocado (falsa alarma) baja la accuracy. Lo elegimos así porque un recargo no avisado le cuesta al pasajero un 46% más, mientras que una falsa alarma solo le hace perder unos minutos comparando con Uber.
3. **Subir la accuracy es fácil, pero empeora el modelo.** Con un umbral más alto el mismo modelo llega a 89% de accuracy, pero detecta solo 1 de cada 10 recargos. Desde 0,80 deja de avisar y vuelve al 91,7% de "siempre no".
4. **Falta la información que realmente define el recargo.** El recargo depende de cuántos pedidos y conductores hay en cada minuto, y eso no está en el dataset. Con lugar, hora, distancia y clima, dos cotizaciones casi idénticas pueden tener o no recargo. Por eso los cuatro algoritmos llegan al mismo techo (ROC-AUC entre 0,65 y 0,68): el límite está en los datos, no en el modelo.
5. **La evaluación es honesta.** Probamos con días que el modelo nunca vio. Con una partición al azar los resultados parecían hasta un 87% mejores, pero esa mejora era falsa.

En resumen: el 63% de accuracy es el costo de detectar el 61% de los recargos. La métrica que muestra la mejora real es la accuracy balanceada: 62,1%, contra 50% del azar.

**Complementario (no supervisado).** Con K-Means agrupamos los 12 productos según su tarifa base y su precio por milla. El codo y la silueta coinciden en k = 3 (silueta 0,68).

## Qué descubrimos

1. **El precio es estructural y predecible:** lo explican el producto y la distancia. La hora y el clima casi no aportan.
2. **Uber y Lyft arman el precio igual:** los 12 productos forman 3 familias de tarifa (económico, intermedio y premium), y cada producto de Uber cae en la misma familia que su equivalente de Lyft. Lyft es más barato en los económicos y más caro en los Black.
3. **El recargo depende del lugar, no del momento:** salir de Back Bay, Fenway o las universidades aumenta la chance de recargo; salir de North End o Haymarket la reduce a la mitad.
4. **El recargo es difícil de anticipar:** los cuatro algoritmos llegan a un techo parecido (ROC-AUC entre 0,65 y 0,68). El límite está en los datos: falta la oferta y la demanda en tiempo real.
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
| Código y resultados | `3_Codigo/modelado_entrega3.py` y `6_Resultados/metricas.json` |
