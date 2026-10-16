# ¿Cómo se predice el surge (recargo)?

Explicación simple, para todo el equipo, de cómo funciona el modelo de `has_surge` de la Entrega 3. Todos los números salen de `6_Resultados/metricas.json`.

---

## 1. Qué queremos predecir

Cuando la demanda supera a la oferta, Lyft aplica un **recargo** (surge): el precio se multiplica por 1,25, 1,5, 2 o más. Con recargo, el mismo viaje sale en promedio **46% más caro**.

La pregunta es: **cuando alguien cotiza un viaje en Lyft, ¿va a tener recargo, sí o no?**

- `has_surge = 1` → tiene recargo
- `has_surge = 0` → no tiene

Solo usamos **Lyft sin Shared**: Uber no informa su multiplicador y Shared nunca tiene recargo. Son **255.953 cotizaciones**, y solo el **8,2%** tiene recargo (1 de cada 12).

---

## 2. Con qué información predice

El modelo ve lo mismo que se sabe **en el momento de cotizar**:

| Tipo de dato | Ejemplos |
|---|---|
| **Lugar** | Zona de origen, zona de destino y la **tasa histórica de recargo de la ruta** (qué % de las veces esa ruta tuvo recargo en los días de entrenamiento) |
| **Viaje** | Distancia, producto (Lyft, Lyft XL, Lux, Lux Black, Lux Black XL) |
| **Momento** | Hora, día de la semana, fin de semana, hora pico, si es de noche |
| **Clima** | Temperatura, lluvia, humedad, viento, nubosidad |

**Lo que NO ve, a propósito:** el precio y el `surge_multiplier`. Esos datos ya contienen la respuesta, porque el precio incluye el recargo. Si se los diéramos, el modelo "haría trampa" (eso se llama *fuga de datos*).

---

## 3. Cómo aprende

### Paso 1 · Separar el pasado del futuro

- **Entrenamiento:** cotizaciones del 25/11 al 14/12/2018 (196.558).
- **Prueba:** cotizaciones del 15 al 18/12 (59.395), días que el modelo **nunca vio**.

No mezclamos al azar porque cotizaciones del mismo minuto y la misma ruta comparten el recargo. El modelo "reconocería" las de prueba y parecería mucho mejor de lo que es: con mezcla al azar, el random forest parecería un 87% mejor.

### Paso 2 · Arreglar el desbalance

Como solo el 8% tiene recargo, un modelo sin ayuda aprende a decir **siempre "no"**. Así acierta el 91,7% de las veces… pero no detecta ni un recargo.

Usamos **pesos de clase**: equivocarse en un viaje **con** recargo "cuesta" **6,12** y equivocarse en uno **sin** recargo "cuesta" **0,54**. Es como decirle al modelo: *"un recargo que se te escapa es 11 veces más grave que una falsa alarma"*. Así se obliga a prestarle atención a los recargos.

También probamos submuestreo y SMOTE. Elegimos pesos de clase porque dio el mejor resultado en validación y no inventa ni descarta datos.

### Paso 3 · Probar modelos y quedarse con el mejor

Probamos 4 algoritmos (regresión logística, árbol de decisión, random forest y gradient boosting), cada uno con varias configuraciones. Para elegir usamos **solo los días de entrenamiento**: entrenamos con los primeros días y vimos qué tan bien predecía los siguientes.

Ganó **gradient boosting** (`HistGradientBoostingClassifier`).

### Cómo funciona gradient boosting

Es un equipo de **200 árboles de decisión chiquitos** (de hasta 15 hojas cada uno) que trabajan **en serie**:

1. El primer árbol hace una predicción simple, por ejemplo: *"si la ruta tiene mucho recargo histórico, el riesgo es alto"*.
2. El segundo árbol se concentra en **los casos donde el primero se equivocó** y lo corrige un poco.
3. El tercero corrige lo que quedó mal después del segundo… y así hasta 200.
4. La predicción final es **la suma de todas las correcciones**.

Cada árbol corrige solo un poquito (*learning rate* = 0,05) para no exagerar con casos raros. Es la misma idea de **AdaBoost** que vimos en clase, en una versión más moderna.

---

## 4. Cómo predice una cotización nueva

Cuando llega una cotización, el modelo:

1. **Calcula un puntaje de riesgo entre 0 y 1** sumando lo que dicen los 200 árboles.
2. **Lo compara con un umbral de 0,55:**
   - puntaje ≥ 0,55 → **"va a tener recargo"** (alerta);
   - puntaje < 0,55 → **"no va a tener recargo"**.

El umbral no es 0,5 a ciegas: lo elegimos con los días de entrenamiento como el que mejor equilibra recargos detectados y falsas alarmas (máximo F1).

> **Ojo:** el puntaje **no es la probabilidad real**. Con los pesos de clase el modelo "exagera" el riesgo a propósito. Un puntaje de 0,8 no quiere decir 80% de chance. Para saber la chance real hay que mirar los deciles (sección 6).

### Tres cotizaciones reales del período de prueba

| Cotización | Puntaje | Predicción | ¿Tuvo recargo? |
|---|---:|---|---|
| **Back Bay → Haymarket Square**, Lux Black XL, 2,95 millas, sábado 3 h | **0,79** | Recargo | Sí ✔ |
| **North End → Beacon Hill**, Lux Black, 1,78 millas, domingo 4 h | **0,06** | Sin recargo | No ✔ |
| **Theatre District → Haymarket Square**, Lyft, 1,75 millas, lunes 15 h | **0,52** | Sin recargo (justo debajo del umbral) | No ✔ |

**El lugar de salida domina el puntaje.** El puntaje promedio por zona de origen en la prueba va de **0,16** (North End y Haymarket Square) a **0,61** (Back Bay), igual que las tasas reales de recargo de esas zonas (1,8% y 13,4%).

---

## 5. Qué tan bien funciona (en los 4 días de prueba)

La matriz de confusión del modelo:

| | Predijo **sin recargo** | Predijo **con recargo** |
|---|---:|---:|
| **Real: sin recargo** | **34.590** · acierto (VN) | **19.877** · falsa alarma (FP) |
| **Real: con recargo** | **1.937** · no detectado (FN) | **2.991** · detectado (VP) |

En palabras:

- **Detecta 6 de cada 10 recargos** (recall 60,7%).
- **De cada 100 alertas, 13 son recargos reales** (precisión 13,1%). Si avisara al azar, acertaría 8.
- **Accuracy 63,3%**, menor que el 91,7% de decir siempre "no", porque ahora el modelo **sí avisa** y a veces se equivoca.
- **Accuracy balanceada 62,1%**, contra 50% del azar: acierta el 63,5% de los viajes sin recargo y el 60,7% de los con recargo.

**¿Por qué tantas falsas alarmas?** Porque preferimos avisar de más: para el pasajero, un recargo que no le avisaron le cuesta 46% más, y una falsa alarma solo le hace perder unos minutos comparando con Uber.

---

## 6. Para qué sirve en la práctica: ordenar el riesgo

El modelo **no adivina** viaje por viaje, pero **sí ordena** las cotizaciones de más riesgosa a menos riesgosa. Si se dividen las cotizaciones de prueba en 10 grupos según su puntaje:

| Grupo (decil) | % real con recargo |
|---|---:|
| 10% de mayor riesgo | **15,7%** (casi el doble del promedio) |
| 10% siguiente | 13,3% |
| … | … |
| 10% de menor riesgo | **1,1%** |

El **20% de mayor riesgo concentra el 35% de todos los recargos**.

**Recomendación para el pasajero:** si salís de **Back Bay, Fenway, Northeastern o Boston University**, la chance de recargo es mucho mayor: conviene comparar con Uber o caminar a una zona vecina.

---

## 7. Qué aprendió el modelo

Lo que más usa, de mayor a menor:

1. **La ruta** (su tasa histórica de recargo): lo más importante, lejos.
2. **La distancia.**
3. **La zona de destino.**
4. **El clima, la hora, el día y el producto: casi nada.**

**El recargo depende del lugar, no del momento ni del clima.**

---

## 8. Por qué no predice mejor

El recargo depende sobre todo de **cuántos pedidos y cuántos conductores hay en cada momento**, y eso **no está en el dataset**. El modelo solo ve el lugar, la hora y el clima, que explican una parte.

Los cuatro algoritmos llegan a un resultado muy parecido (ROC-AUC entre 0,65 y 0,68), lo que confirma que **el límite está en los datos, no en el modelo**. Lo anticipamos en la Entrega 2: que el recargo sea difícil de predecir también es un hallazgo.

---

## Resumen en 5 líneas

1. Predecimos si una cotización de Lyft tendrá recargo, sin mirar el precio.
2. Entrenamos con días pasados y probamos con días nuevos.
3. Usamos **pesos de clase** porque solo el 8% tiene recargo, y **gradient boosting**: 200 árboles que se corrigen entre sí.
4. Detecta **6 de cada 10 recargos**, con 13 aciertos cada 100 alertas (el azar da 8).
5. El recargo depende del **lugar de salida**; lo demás es oferta y demanda en tiempo real, que no tenemos.

**Más detalle:** informe (`1_Informe/`, sección 5), Colab (`2_Presentacion_Colab/`, secciones 6 a 9) y código (`3_Codigo/modelado_entrega3.py`, parte A).
