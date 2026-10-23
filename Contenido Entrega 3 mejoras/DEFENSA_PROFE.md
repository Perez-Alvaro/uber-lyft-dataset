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
