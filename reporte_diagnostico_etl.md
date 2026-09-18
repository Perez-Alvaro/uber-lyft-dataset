# Reporte Diagnóstico y Plan de Acción Pre-ETL
**Proyecto**: Análisis de Factores Determinantes en el Precio de Viajes (Uber & Lyft - Boston)  
**Entrega**: Sprint 1 - Hito 1 (Arquitectura de Datos y Plan de Trabajo)  
**Generado automáticamente**: 2026-09-18 09:36:55  

---

## 1. Resumen Ejecutivo del Diagnóstico
- **Volumen Crudo**: 693,071 filas y 57 columnas.
- **Tamaño en disco**: 350.36 MB.
- **Clave Primaria (`id`)**: Unicidad del 100% (693,071 IDs únicos, 0 duplicados).
- **Filas Duplicadas Globales**: 0 registros repetidos.
- **Ventana de Tiempo**: Del `2018-11-26 03:40:46` al `2018-12-18 19:15:10` (aprox. 23 días consecutivos en Boston, MA).

---

## 2. Hallazgos Críticos de Calidad de Datos

### A. Imputación / Filtrado de Valores Nulos en `price`
- **Total de Nulos**: 55.095 registros (7.95% del total).
- **Causa Raíz**: El 100% de los nulos corresponden al servicio `name == 'Taxi'` de Uber. En Boston, los taxis tradicionales solicitados por la aplicación liquidan el viaje con taxímetro urbano oficial, por lo que la API no genera una tarifa por adelantado (`price` = NaN).
- **Acción ETL requerida**:
  1. Para modelos de predicción de tarifas por adelantado: **Filtrar y excluir** las filas de `Taxi` (quedando 637.976 registros limpios).
  2. No intentar imputar con media o regresión, ya que desvirtuaría la naturaleza comercial del producto.

### B. Redundancia de Columnas Meteorológicas
- La columna `visibility.1` es una duplicación estricta de `visibility` (identidad en el 100% de las celdas).
- Múltiples columnas climáticas expresan medidas derivadas redundantes (p. ej. pares de valor y timestamp como `temperatureHighTime`, `windGustTime`).
- **Acción ETL requerida**:
  - Eliminar `visibility.1`.
  - Reducir dimensionalidad climática conservando las variables de impacto directo para el viaje (`temperature`, `apparentTemperature`, `precipIntensity`, `precipProbability`, `humidity`, `windSpeed`, `short_summary`, `icon`).

### C. Diferenciación de Tarifa Dinámica (`surge_multiplier`)
- **Uber**: `surge_multiplier` es constante en 1.0 para el 100% de los registros (debido a su migración hacia Upfront Pricing).
- **Lyft**: Registra factores dinámicos reales entre 1.0 y 3.0 (6.82% de viajes con sobrecargo).
- **Acción ETL requerida**:
  - Diseñar una variable derivada (feature engineering) para Uber que estime el sobrecargo implícito (comparando la tarifa por milla vs la tarifa base por categoría).

---

## 3. Plan de Transformación Recomendado (Sprint 2 - ETL)

| Paso | Operación | Justificación Técnica |
| :--- | :--- | :--- |
| **P1** | Filtrar `price.isna()` (excluir servicio `Taxi`) | Conservar solo registros con tarifa cerrada observable. |
| **P2** | Estandarización de Tipos de Datos (`datetime`) | Parsear `datetime` a tipo timestamp nativo y extraer variables: `day_of_week`, `is_weekend`, `rush_hour`. |
| **P3** | Optimización de Memoria (Downcasting) | Convertir `cab_type`, `name`, `source`, `destination` a `category`. Convertir floats a `float32`. Reduce el uso de RAM de ~350 MB a < 80 MB. |
| **P4** | Eliminación de Atributos Irrelevantes | Descartar `visibility.1` y timestamps secundarios de pronósticos futuros. |
| **P5** | Enriquecimiento Geoespacial | Calcular distancia Manhattan y euclidiana entre coordenadas de origen y destino como baseline de validación para `distance`. |
| **P6** | Exportación de Tablas Limpias | Guardar el dataset curado en formato optimizado (`.parquet` y `.csv` limpio). |

---
*Reporte generado por el pipeline de diagnóstico preliminar de UTN TPI.*
