# K-Means de rutas: por qué lo usamos y qué nos dice

Explicación para el equipo del análisis complementario de la Entrega 3 (sección 6 del informe, sección 10 del Colab, figura 10).

## En una frase

Agrupamos las 72 rutas de Boston según **qué tan largas son** y **qué tan seguido tienen recargo**. Así vemos qué tipos de rutas hay y confirmamos que el precio por milla lo define la **distancia** y el recargo lo define la **zona de origen**.

---

## Por qué lo usamos

**1. Lo prometimos en la Entrega 1.** Uno de los objetivos específicos fue:

> *"Identificar segmentos o perfiles de viajes con comportamientos tarifarios similares mediante técnicas de análisis exploratorio y, si resulta pertinente, de agrupamiento."*

Y uno de los insights esperados fue *"la segmentación de los viajes en grupos con comportamiento tarifario homogéneo"* (H6). Sin este análisis, esa parte quedaba sin responder.

**2. Responde también H4** (*"hay corredores con mayor costo por milla"*).

**3. Es un tipo de algoritmo distinto.** Todo lo demás de la entrega es **supervisado** (el modelo aprende de una respuesta conocida). K-Means es **no supervisado**: no le decimos qué buscar, encuentra los grupos solo. En la clase 7 vimos justamente K-Means con el método del codo y la silueta.

**4. Reemplaza algo que estaba mal.** La versión preliminar tenía una clasificación de Uber que predecía el servicio a partir del precio (circular).

---

## Qué es K-Means (versión corta)

1. Se elige cuántos grupos queremos (*k*).
2. El algoritmo ubica *k* puntos centrales y asigna cada ruta al centro más cercano.
3. Mueve cada centro al promedio de sus rutas y repite hasta que nada cambia.

---

## Qué datos le dimos

Cada ruta (par origen → destino) se describe con **2 variables**, estandarizadas (media 0, desvío 1) porque K-Means mide distancias:

| Variable | Qué mide |
|---|---|
| Distancia media | Millas promedio de la ruta |
| Tasa de recargo | % de cotizaciones de Lyft con recargo en esa ruta |

**¿Y el precio por milla?** Lo calculamos (mediana de USD por milla en el nivel Estándar: UberX, WAV y Lyft), pero **no lo usamos para agrupar**: está casi determinado por la distancia (correlación -0,98 en escala log), porque en los viajes cortos pesa la tarifa base. Usarlo sería contar la distancia dos veces. Lo usamos para **describir** los grupos.

---

## Cómo elegimos la cantidad de grupos (k)

| k | 2 | 3 | **4** | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|
| Inercia (codo) | 73,1 | 47,9 | **34,3** | 23,2 | 18,2 | 14,5 | 12,5 |
| Silueta | 0,448 | 0,444 | **0,451** | 0,460 | 0,461 | 0,457 | 0,461 |

- **Codo:** la inercia baja siempre, sin un quiebre claro.
- **Silueta:** es **casi igual para todos los k** (entre 0,44 y 0,46). Eso significa que las rutas no forman grupos naturales muy marcados: son más bien un continuo.
- Como ningún k es claramente mejor, elegimos **k = 4 por interpretabilidad**: separa el largo del viaje y el nivel de recargo, con una silueta (0,451) prácticamente igual al máximo.

---

## Qué grupos salieron

Numerados de la ruta más corta a la más larga (igual que en la figura 10).

| Grupo | Perfil | Rutas | Distancia | USD por milla | Recargo | Ejemplos |
|---|---|---:|---:|---:|---:|---|
| 1 | Cortas, poco recargo | 18 | 0,98 mi | 8,81 | 3,9% | South Station → Financial District · Beacon Hill → Haymarket Square |
| 2 | Medias, mucho recargo | 34 | 2,25 mi | 4,62 | 11,7% | Back Bay → Boston University · Back Bay → Fenway |
| 3 | Medias, poco recargo | 13 | 2,54 mi | 4,09 | 4,1% | South Station → West End · South Station → North Station |
| 4 | Las más largas | 7 | 4,34 mi | 3,02 | 9,9% | Fenway → Financial District · Northeastern University → Financial District |

---

## Qué información nos da

### 1. Las rutas cortas son las más caras por milla (confirma H4)

El precio por milla cae a medida que la ruta es más larga. El extremo es **Financial District → South Station: USD 17,95 por milla** en un viaje de 0,41 millas. No es que esa zona sea cara: en un viaje corto pesa mucho la **tarifa base** (lo que se cobra solo por subir al auto).

### 2. El recargo depende de dónde salís, no de qué tan largo es el viaje

El recargo alto aparece en rutas de distintas distancias y siempre saliendo del **oeste**: Back Bay, Fenway y las universidades (Boston University, Northeastern). Las rutas que salen del **norte** (North End, North Station, West End, Haymarket) casi no tienen recargo.

- Más recargo: **Back Bay → Boston University (15,3%)** y Back Bay → Fenway (15,1%).
- Menos recargo: **Haymarket Square → Beacon Hill (0,6%)**.

Es lo mismo que encontraron los modelos de clasificación: **el lugar** (la ruta y la zona de origen) es lo que más pesa. Dos métodos distintos llegan a la misma conclusión.

### 3. Sirve para el storytelling de la Entrega 4

- **Al pasajero:** si salís de Back Bay o de las universidades, compará con Uber o caminá a una zona vecina. En tramos muy cortos el precio por milla es alto por la tarifa base.
- **Al conductor:** las zonas del oeste concentran la demanda que genera recargo.

---

## Limitaciones (decirlas antes de que pregunten)

- **La silueta es baja y casi plana:** no hay grupos naturales muy marcados. Por eso tomamos los grupos como una **descripción útil**, no como categorías naturales, y **H6 queda "parcial"**.
- **Son solo 72 puntos** (una fila por ruta): el análisis es descriptivo, no predictivo.

---

## Para la defensa oral

**Guion de 30 segundos:**

> "Como análisis complementario, y para cumplir el objetivo de segmentación de la Entrega 1, agrupamos las 72 rutas con K-Means según su distancia y su tasa de recargo. El precio por milla no lo usamos para agrupar porque depende casi totalmente de la distancia. La silueta salió pareja para todos los k, así que elegimos 4 grupos porque se interpretan bien. Vimos dos cosas: las rutas cortas son las más caras por milla por la tarifa base, y el recargo se concentra en las rutas que salen del oeste, sean cortas o largas. Coincide con lo que encontraron los modelos de clasificación."

**Preguntas probables:**

| Pregunta | Respuesta |
|---|---|
| ¿Por qué 4 grupos? | La silueta es casi igual para todos los k (0,44 a 0,46): ningún k es claramente mejor. Elegimos 4 porque se interpreta bien (largo del viaje × nivel de recargo). |
| ¿Por qué no usaron el precio por milla? | Porque está casi determinado por la distancia (correlación -0,98 en log): agruparía dos veces por lo mismo. |
| ¿Por qué estandarizaron? | K-Means usa distancias; sin estandarizar, la distancia (0,5 a 5 millas) pesaría mucho más que la tasa de recargo (0 a 0,15). |
| La silueta es baja, ¿sirve? | Sirve como descripción. Indica que no hay grupos naturales muy marcados, y por eso H6 queda "parcial". |

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
