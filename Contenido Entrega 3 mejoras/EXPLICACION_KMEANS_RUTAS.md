# K-Means de rutas: por qué lo usamos y qué nos dice

Explicación para el equipo del análisis complementario de la Entrega 3 (sección 6 del informe, sección 10 del Colab, figura 10).

## En una frase

Agrupamos las 72 rutas de Boston según cuánto miden, cuánto cuestan por milla y qué tan seguido tienen recargo. Así vemos qué **tipos de rutas** hay y descubrimos que el precio por milla lo define la **distancia** y el recargo lo define la **zona de origen**.

---

## Por qué lo usamos

**1. Lo prometimos en la Entrega 1.** Uno de los objetivos específicos fue:

> *"Identificar segmentos o perfiles de viajes con comportamientos tarifarios similares mediante técnicas de análisis exploratorio y, si resulta pertinente, de agrupamiento."*

Y uno de los insights esperados fue *"la segmentación de los viajes en grupos con comportamiento tarifario homogéneo"* (H6). Sin este análisis, esa parte quedaba sin responder, y la cátedra evalúa la coherencia entre entregas.

**2. Responde también H4** (*"hay corredores con mayor costo por milla"*) con un método, no solo con un gráfico.

**3. Es un tipo de algoritmo distinto.** Todo lo demás de la entrega es **supervisado**: el modelo aprende de una respuesta conocida (el precio o si hubo recargo). K-Means es **no supervisado**: no le decimos qué buscar, encuentra los grupos solo. La consigna pide algoritmos de "clasificación, clustering, etc." y en la clase 7 vimos justamente K-Means con el método del codo y la silueta.

**4. Reemplaza algo que estaba mal.** La versión preliminar tenía una clasificación de Uber que predecía el servicio a partir del precio, que era circular. Este análisis ocupa ese lugar con algo que sí aporta al problema.

---

## Qué es K-Means (versión corta)

1. Se elige cuántos grupos queremos (*k*).
2. El algoritmo ubica *k* puntos centrales y asigna cada ruta al centro más cercano.
3. Mueve cada centro al promedio de sus rutas y repite hasta que nada cambia.

Resultado: rutas parecidas quedan en el mismo grupo.

---

## Qué datos le dimos

Cada una de las **72 rutas** (pares origen → destino) se describe con 3 números:

| Variable | Qué mide | Por qué esta |
|---|---|---|
| Distancia media | Millas promedio de la ruta | Es el segundo factor del precio |
| Precio por milla | Mediana de USD por milla, **solo en el nivel Estándar** (UberX, WAV, Lyft) | Compara rutas sin que influya qué producto se pidió |
| Tasa de recargo | % de cotizaciones de Lyft con recargo en esa ruta | Es nuestro objetivo 2 |

Las tres se **estandarizaron** (media 0, desvío 1). K-Means mide distancias, y sin estandarizar la variable con números más grandes dominaría el resultado.

---

## Cómo elegimos la cantidad de grupos (k)

Probamos k de 2 a 8 con los dos métodos de la clase 7:

| k | 2 | 3 | 4 | 5 | 6 | **7** | 8 |
|---|---|---|---|---|---|---|---|
| Inercia (codo) | 117,7 | 79,9 | 55,3 | 41,7 | 30,3 | **26,0** | 21,9 |
| Silueta | 0,438 | 0,427 | 0,412 | 0,441 | 0,449 | **0,457** | 0,447 |

- **Codo:** la inercia siempre baja; la curva se aplana a partir de 6–7.
- **Silueta:** el máximo está en **k = 7**, y lo elegimos por eso (la clase dice que es la métrica más confiable de las dos).

---

## Qué grupos salieron

Ordenados de más caro a más barato por milla. El número de grupo es el mismo que en la figura 10.

| Grupo | Perfil | Rutas | Distancia | USD por milla | Recargo | Ejemplos |
|---|---|---:|---:|---:|---:|---|
| 5 | Muy cortas, tarifa mínima | 7 | 0,59 mi | 13,02 | 5,8% | Financial District → South Station · Theatre District → South Station |
| 2 | Cortas en el norte, casi sin recargo | 9 | 1,23 mi | 6,66 | 2,1% | North Station → North End · Haymarket Square → Financial District |
| 7 | Cortas intermedias | 7 | 1,44 mi | 5,90 | 6,9% | South Station → Theatre District · Beacon Hill → Haymarket Square |
| 3 | Cortas en la zona oeste, **mucho recargo** | 11 | 1,61 mi | 5,28 | **12,5%** | Back Bay → Boston University · Back Bay → Fenway |
| 4 | Largas desde el norte, poco recargo | 10 | 2,72 mi | 3,82 | 3,7% | West End → Northeastern University · North Station → Northeastern University |
| 6 | Largas desde el oeste, **con recargo** | 22 | 2,75 mi | 3,78 | **11,3%** | Northeastern University → North Station · Boston University → Theatre District |
| 1 | Las más largas | 6 | 4,49 mi | 2,99 | 9,8% | Fenway → Financial District · Boston University → Financial District |

---

## Qué información nos da

### 1. Las rutas cortas son las más caras por milla (confirma H4)

El grupo 5 paga **USD 13 por milla**, más de 4 veces que las rutas largas (USD 3). El extremo es **Financial District → South Station: USD 17,95 por milla** en un viaje de 0,39 millas. No es que esa zona sea cara: en un viaje corto pesa mucho la **tarifa base** (lo que se cobra solo por subir al auto).

### 2. El recargo depende de dónde salís, no de qué tan largo es el viaje

Los grupos 3 y 6 tienen distancias muy distintas (1,6 y 2,7 millas) pero el mismo patrón: **mucho recargo**, y ambos salen de **Back Bay, Fenway y las universidades** (Boston University, Northeastern). En cambio, los grupos 2 y 4, que salen del **norte** (North End, North Station, West End, Haymarket), casi no tienen recargo.

- Más recargo: **Back Bay → Boston University (15,3%)** y Back Bay → Fenway (15,1%).
- Menos recargo: **Haymarket Square → Beacon Hill (0,6%)**.

Es lo mismo que encontró el modelo de clasificación: la **zona de origen** es la variable más importante, y salir de Back Bay, Fenway o las universidades duplica la chance de recargo. Dos métodos distintos (uno supervisado y uno no supervisado) llegan a la misma conclusión, y eso la refuerza.

### 3. Hay dos ejes independientes

- **Distancia → precio por milla:** cuanto más corta la ruta, más cara por milla.
- **Zona de origen → recargo:** oeste y universidades con mucho recargo; norte con poco.

Por eso salen 7 grupos y no 2 o 3: se combinan los dos ejes (corta/larga × mucho/poco recargo, más los extremos).

### 4. Sirve para el storytelling de la Entrega 4

Da recomendaciones concretas y fáciles de contar:

- **Al pasajero:** si salís de Back Bay o de las universidades, compará con Uber o caminá a una zona vecina. Para tramos muy cortos, el precio por milla es alto por la tarifa base.
- **Al conductor:** las zonas del oeste concentran la demanda que genera recargo.

---

## Limitaciones (decirlas antes de que pregunten)

- **La silueta es baja y casi plana (0,41 a 0,46).** Las rutas no forman grupos bien separados sino más bien un continuo. Por eso tomamos los grupos como una **descripción útil**, no como categorías naturales, y **H6 queda "parcial"**.
- **Son solo 72 puntos** (una fila por ruta), así que el análisis es descriptivo, no predictivo.
- El precio por milla se calculó solo con el nivel Estándar para comparar rutas en igualdad de condiciones. Con los productos premium los valores cambian, aunque el patrón se mantiene.

---

## Para la defensa oral

**Guion de 30 segundos:**

> "Como análisis complementario, y para cumplir el objetivo de segmentación de la Entrega 1, agrupamos las 72 rutas con K-Means según distancia, precio por milla y recargo. Elegimos 7 grupos por el coeficiente de silueta. Vimos dos cosas: las rutas muy cortas son las más caras por milla por la tarifa base, y el recargo se concentra en las rutas que salen de Back Bay, Fenway y las universidades, sean cortas o largas. Coincide con lo que encontró el modelo de clasificación. La silueta es baja, así que lo tomamos como una descripción y no como grupos naturales."

**Preguntas probables:**

| Pregunta | Respuesta |
|---|---|
| ¿Por qué 7 grupos? | Es el máximo del coeficiente de silueta entre k = 2 y 8; el codo también se aplana ahí. |
| ¿Por qué estandarizaron? | K-Means usa distancias; sin estandarizar, el precio por milla (valores de 3 a 18) pesaría más que la tasa de recargo (de 0 a 0,15). |
| ¿Por qué solo el nivel Estándar? | Para comparar rutas sin el efecto del producto: un Black SUV es caro en cualquier ruta. |
| La silueta es baja, ¿sirve? | Sirve como descripción. Indica que no hay grupos naturales muy marcados, y por eso H6 queda "parcial". |
| ¿Por qué no por viaje en vez de por ruta? | Queríamos perfiles de rutas (corredores), que es lo accionable para el pasajero, y H4 habla de corredores. |

---

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Texto del informe | `1_Informe/Entrega3_Grupo11.docx`, sección 6 y tabla de hipótesis (sección 7) |
| En la presentación | `2_Presentacion_Colab/`, sección 10 |
| Gráfico (codo, silueta y grupos) | `5_Graficos/fig10_rutas_kmeans.png` |
| Las 72 rutas con su grupo | `6_Resultados/rutas_clusters.csv` |
| Promedios de cada grupo | `6_Resultados/rutas_perfil_clusters.csv` |
| Código | `3_Codigo/modelado_entrega3.py`, sección "PARTE C" |
