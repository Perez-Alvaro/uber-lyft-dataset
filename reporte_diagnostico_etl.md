# Reporte Diagnóstico y Plan de Acción Pre-ETL
**Proyecto**: Análisis de Factores Determinantes en el Precio de Viajes (Uber & Lyft - Boston)  
**Entrega**: Sprint 1 - Hito 1 (Arquitectura de Datos y Plan de Trabajo)  
**Cátedra**: Ciencia de Datos — UTN FRC (Curso 5K1)  
**Fecha de corte**: Sprint 1 / Preparación para Sprint 2 (ETL)  

---

## 1. Resumen Ejecutivo del Diagnóstico
- **Volumen Crudo**: 693.071 filas y 57 columnas.
- **Tamaño en disco**: 350.36 MB (comprimido en repositorio: 44.5 MB en `dataset.zip`).
- **Clave Primaria (`id`)**: Unicidad del 100% (693.071 IDs únicos, 0 duplicados).
- **Filas Duplicadas Globales**: 0 registros repetidos.
- **Ventana de Tiempo**: Del `2018-11-26 03:40:46` al `2018-12-18 19:15:10` (aprox. 23 días consecutivos en Boston, MA).
- **Puntos Geográficos**: 12 zonas estratégicas de Boston conectadas en 72 rutas origen-destino evaluadas.

---

## 2. Hallazgos Críticos de Calidad de Datos

### A. Imputación / Filtrado de Valores Nulos en `price`
- **Total de Nulos**: 55.095 registros (7.95% del total).
- **Causa Raíz Identificada**: El 100% de los nulos corresponden al servicio `name == 'Taxi'` de Uber. En Boston, los taxis tradicionales solicitados por la aplicación liquidan el viaje con taxímetro urbano oficial, por lo que la API no genera una tarifa por adelantado (`price` = NaN).
- **Acción ETL para Sprint 2**:
  1. Para modelos de predicción de tarifas por adelantado: **Filtrar y excluir** las filas de `Taxi` (quedando 637.976 registros limpios).
  2. No imputar con media o regresión, ya que alteraría la realidad de mercado y la distribución del resto de los servicios.

### B. Redundancia de Columnas Meteorológicas
- La columna `visibility.1` es una duplicación estricta al 100% de `visibility` (identidad celda por celda).
- Múltiples columnas climáticas expresan medidas derivadas con marcas de tiempo secundarias (p. ej. `temperatureHighTime`, `windGustTime`, `uvIndexTime`).
- **Acción ETL para Sprint 2**:
  - Eliminar `visibility.1`.
  - Reducir dimensionalidad climática conservando las variables de impacto directo para el viaje (`temperature`, `apparentTemperature`, `precipIntensity`, `precipProbability`, `humidity`, `windSpeed`, `short_summary`, `icon`).

---

## 3. Análisis de Estrategia Tarifaria: ¿Cómo determina el precio Uber vs. Lyft?

Uno de los hallazgos más relevantes del EDA es la marcada asimetría en cómo ambas empresas gestionan la tarifa dinámica (*surge pricing*), lo cual condiciona el diseño analítico del proyecto:

### A. Comportamiento en Lyft: Tarifa Dinámica Explícita
* **Mecanismo**: Lyft utiliza una fórmula clásica multiplicativa y reactiva ante la escasez de oferta inmediata:
  $$\text{Precio} = (\text{Tarifa Base} + \text{Tiempo} \times \text{TarifaTiempo} + \text{Distancia} \times \text{TarifaDistancia}) \times \mathbf{SurgeMultiplier}$$
* **Distribución observada en los datos**:
  * Factor $\times 1.0$ (tarifa regular): 286.433 viajes (93.18%)
  * Factores con sobrecargo ($\times 1.25$ a $\times 3.0$): 20.975 viajes (6.82%)
* **Implicancia**: Es una variable continua/ordinal observable directamente en el atributo `surge_multiplier`.

### B. Comportamiento en Uber: *Upfront Pricing* (Tarifa Cerrada Predictiva)
* **Mecanismo**: En 2018, Uber ya había implementado su sistema de *Upfront Pricing* y desvinculación de tarifas (*Fare Decoupling*):
  1. **Tarifa cerrada al usuario**: Al solicitar el viaje, el pasajero ve una tarifa final garantizada (ej. \$18.50 USD), sin desglosar el multiplicador de surge en pantalla ni en la API pública. Por esta razón técnica, el campo `surge_multiplier` de Uber es **constantemente 1.0 en el 100% de los registros (385.663 filas)**.
  2. **Modelos predictivos de disposición a pagar (*Willingness-to-pay*)**: El precio no responde únicamente a la oferta/demanda del minuto, sino a modelos de Machine Learning que estiman la elasticidad del usuario según la ruta (origen-destino), hora, previsiones de demanda futura en la zona de destino y alternativas de transporte público disponibles.
  3. **Desacoplamiento de cobro/pago**: Uber le cobra al usuario según su disposición a pagar y le paga al conductor según tiempo/distancia recorridos más incentivos puntuales.

---

## 4. Nuevas Variables a Predecir Recomendadas (Sprint 3)

Más allá de la variable principal de regresión (`price`), el diagnóstico sugiere incorporar un enfoque dual (Regresión + Clasificación) para enriquecer el trabajo académico:

1. **Ocurrencia de Tarifa Dinámica (`surge_pricing_active`) — Clasificación Binaria (Recomendada):**
   * Predecir si un viaje sufrirá o no recargo por alta demanda (`1` vs `0`).
   * Permite evaluar métricas de clasificación en datos desbalanceados (Precision, Recall, ROC-AUC, Matriz de Confusión) y medir el impacto real de la lluvia, nieve y horarios pico.
2. **Estimación de Sobrecargo Implícito en Uber (`uber_surge_ratio`) — Variable Derivada:**
   * En el Sprint 2 (ETL), se calculará el ratio entre la tarifa observada por milla y la tarifa mediana base de cada ruta. Ratios $> 1.2$ permitirán imputar y modelar la tarifa dinámica "oculta" de Uber.
3. **Plataforma más Económica (`cheaper_platform`) — Clasificación:**
   * Emparejamiento de rutas y horarios para determinar qué servicio (Uber o Lyft) resulta estadísticamente más conveniente bajo condiciones climáticas dadas.

---

## 5. Plan de Transformación Recomendado (Sprint 2 - ETL)

| Paso | Operación Técnica | Justificación Metodológica |
| :---: | :--- | :--- |
| **P1** | Filtrar `price.isna()` (excluir categoría `Taxi`) | Eliminar registros sin tarifa cerrada disponible por uso de taxímetro oficial. |
| **P2** | Estandarización Temporal (`datetime`) | Parsear timestamps y generar variables derivadas: `day_of_week`, `is_weekend`, `hour`, `rush_hour` (pico laboral vs. valle). |
| **P3** | Optimización de Memoria (Downcasting) | Convertir discretas a `category` y reales a `float32`. Reduce el uso de RAM de ~725 MB a < 85 MB para procesamiento fluido. |
| **P4** | Depuración de Redundancias | Eliminar `visibility.1` y timestamps de pronósticos climáticos secundarios. |
| **P5** | Feature Engineering de Tarifas | Construir la métrica de **precio por milla** (`price_per_mile`) y el **indicador de sobrecargo implícito** para Uber. |
| **P6** | Enriquecimiento Geoespacial | Calcular distancias Manhattan y euclidiana entre coordenadas de origen y destino para validar la coherencia de `distance`. |
| **P7** | Exportación de Datos Curados | Generar el dataset procesado en formato Apache Parquet (`rideshare_clean.parquet`) y CSV limpio para los notebooks del Sprint 2 y 3. |

---
*Reporte de diagnóstico actualizado para la planificación del Sprint 2 — Proyecto Integrador Ciencia de Datos UTN FRC.*
