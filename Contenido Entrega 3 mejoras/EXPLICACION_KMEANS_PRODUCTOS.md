# K-Means de productos: por qué lo usamos y qué nos dice

Explicación para el equipo del análisis complementario de la Entrega 3 (sección 6 del informe, sección 10 del Colab, figura 10).

## En una frase

Agrupamos los **12 productos** de Uber y Lyft según **cuánto cobran por subir** (tarifa base) y **cuánto cobran por milla**. Salen **3 familias de tarifa** bien separadas: económico, intermedio y premium.

---

## Por qué lo usamos

**1. Lo prometimos en la Entrega 1.** Uno de los objetivos específicos fue *"identificar segmentos o perfiles de viajes con comportamientos tarifarios similares mediante… agrupamiento"*, y uno de los insights esperados fue *"la segmentación de los viajes en grupos con comportamiento tarifario homogéneo"* (H6).

**2. Explica cómo se arma el precio.** El modelo de precio dice que el producto es lo que más pesa (H1); este análisis muestra **por qué**: cada producto tiene una tarifa base y un precio por milla, y esas dos cosas forman tres escalones.

**3. Explica H4** (los viajes cortos son caros por milla), por la tarifa base.

**4. Es un tipo de algoritmo distinto.** El resto de la entrega es **supervisado**. K-Means es **no supervisado**: no le decimos qué buscar. En la clase 7 vimos K-Means con el método del codo y la silueta.

**5. Reemplaza al K-Means de rutas.** Ese daba una silueta casi plana (no había grupos naturales). Este tiene una estructura clara.

---

## Qué datos le dimos

Para cada producto ajustamos una recta **precio = tarifa base + precio por milla × distancia**, usando solo los viajes **sin recargo** del período de **entrenamiento**: así no se mezcla el efecto del surge ni se usa la prueba. Las dos variables se estandarizaron antes de agrupar, porque K-Means usa distancias.

| Producto | Plataforma | Tarifa base (USD) | Por milla (USD) | Familia |
|---|---|---:|---:|---|
| Shared | Lyft | 3,30 | 1,25 | Económico |
| Lyft | Lyft | 5,59 | 1,70 | Económico |
| UberPool | Uber | 6,13 | 1,20 | Económico |
| WAV | Uber | 6,39 | 1,54 | Económico |
| UberX | Uber | 6,40 | 1,53 | Económico |
| Lyft XL | Lyft | 7,79 | 3,19 | Intermedio |
| Lux | Lyft | 8,76 | 3,84 | Intermedio |
| UberXL | Uber | 9,07 | 3,01 | Intermedio |
| Black | Uber | 12,11 | 3,84 | Intermedio |
| Lux Black | Lyft | 12,31 | 4,54 | Intermedio |
| Lux Black XL | Lyft | 21,89 | 4,24 | Premium |
| Black SUV | Uber | 22,54 | 3,53 | Premium |

---

## Cómo elegimos la cantidad de grupos (k)

| k | 2 | **3** | 4 | 5 | 6 |
|---|---|---|---|---|---|
| Inercia (codo) | 8,11 | **2,00** | 0,96 | 0,69 | 0,48 |
| Silueta | 0,574 | **0,682** | 0,611 | 0,547 | 0,416 |

- **Codo:** la inercia cae muy fuerte hasta k = 3 y después casi no baja.
- **Silueta:** tiene un **máximo claro en k = 3** (0,682). Una silueta mayor a 0,5 indica grupos bien separados.
- Los dos métodos coinciden, así que **k = 3** no es una elección arbitraria.

---

## Qué grupos salieron

| Familia | Productos | Tarifa base (USD) | Por milla (USD) |
|---|---|---:|---:|
| **Económico** | Shared, Lyft, UberPool, WAV, UberX | 3,3 a 6,4 | 1,20 a 1,70 |
| **Intermedio** | Lyft XL, Lux, UberXL, Black, Lux Black | 7,8 a 12,3 | 3,01 a 4,54 |
| **Premium** | Lux Black XL, Black SUV | 21,9 a 22,5 | 3,53 a 4,24 |

---

## Qué información nos da

### 1. Los 12 productos se reducen a 3 escalones

Las diferencias de precio no son continuas. Entre los económicos y los intermedios **el precio por milla se duplica**; entre los intermedios y los premium **la tarifa base casi se duplica**.

### 2. Uber y Lyft arman el precio igual

Cada producto de Uber cae en la misma familia que su equivalente de Lyft: UberPool y Shared, UberX y Lyft, UberXL y Lyft XL, Black y Lux Black, Black SUV y Lux Black XL. Compiten con la misma estructura de precio, y las diferencias de H2 (Lyft más barato en los económicos, más caro en los Black) son ajustes **dentro** de cada familia.

### 3. Por qué los viajes cortos son caros por milla (H4)

La tarifa base se cobra siempre, así que el precio por milla de un viaje es **tarifa base / distancia + precio por milla**. En UberX (base USD 6,40, USD 1,53 por milla):

- un viaje de **1 milla** sale **USD 7,94 por milla**;
- uno de **5 millas** sale **USD 2,81 por milla**.

Por eso la ruta más cara por milla es Financial District → South Station (USD 17,95 por milla): es muy corta (0,41 millas), no es una zona cara.

### 4. Sirve para el storytelling de la Entrega 4

- **Al pasajero:** pasar de un producto económico a uno intermedio duplica lo que paga por milla; en viajes cortos pesa la tarifa base.
- **A la plataforma:** las dos empresas usan la misma escalera de precios; la competencia está en los ajustes dentro de cada familia.

---

## Limitaciones (decirlas antes de que pregunten)

- **Son solo 12 puntos.** El análisis es descriptivo: resume la estructura de precios. Los grupos casi se ven a simple vista; K-Means los formaliza y la silueta confirma que están bien separados.
- **La recta es una aproximación.** Describe bien los productos caros (R² de hasta 0,89) y de forma más aproximada los económicos (R² de 0,41 a 0,5 aprox.), donde pesan más los escalones de la tarifa y, en Shared y UberPool, el emparejamiento con otros pasajeros. Alcanza para comparar productos, que es el objetivo.

---

## Para la defensa oral

**Guion de 30 segundos:**

> "Como análisis no supervisado, y para cumplir el objetivo de segmentación de la Entrega 1, calculamos para cada uno de los 12 productos su tarifa base y su precio por milla, con viajes sin recargo, y los agrupamos con K-Means. Tanto el codo como la silueta marcan 3 grupos, con silueta 0,68: económico, intermedio y premium. Muestra dos cosas: que Uber y Lyft arman el precio igual, porque cada producto cae en la misma familia que su equivalente, y que los viajes cortos son caros por milla por la tarifa base."

**Preguntas probables:**

| Pregunta | Respuesta |
|---|---|
| ¿Por qué 3 grupos? | El codo y la silueta coinciden: la silueta tiene su máximo en k = 3 (0,68) y la inercia deja de bajar fuerte ahí. |
| ¿Cómo calcularon la tarifa base? | Con una recta precio ~ distancia por producto, usando solo viajes sin recargo del entrenamiento. La ordenada al origen es la tarifa base y la pendiente, el precio por milla. |
| ¿Por qué sin recargo? | Para medir la tarifa "normal". Con recargo el precio se multiplica y mezclaría dos efectos. |
| Son solo 12 productos, ¿tiene sentido K-Means? | Es un resumen descriptivo. Lo valioso es que la silueta confirma grupos bien separados y que los equivalentes de Uber y Lyft caen juntos. |
| ¿Por qué no lo hicieron con rutas? | Lo probamos: la silueta daba casi igual para todos los k, no había grupos naturales. Con productos la estructura es clara. |

---

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Texto del informe | `1_Informe/Entrega3_Grupo11.docx`, sección 6 y tabla de hipótesis (sección 7) |
| En la presentación | `2_Presentacion_Colab/`, sección 10 |
| Gráfico (codo, silueta y productos) | `5_Graficos/fig10_productos_kmeans.png` |
| Los 12 productos con su familia | `6_Resultados/productos_tarifa_clusters.csv` |
| Resumen de cada familia | `6_Resultados/productos_perfil_clusters.csv` |
| Código | `3_Codigo/modelado_entrega3.py`, sección "PARTE C" |
