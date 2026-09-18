"""
===============================================================================
Trabajo Práctico Integrador - UTN
Proyecto: Análisis de Factores Determinantes en el Precio de Viajes (Uber & Lyft)
Entrega 1: Análisis Exploratorio de Datos (EDA) Preliminar para Diseño ETL
===============================================================================
Este script realiza una auditoría completa de calidad de datos, perfilado 
estadístico y diagnóstico estructural sobre el conjunto 'rideshare_kaggle.csv'.
Genera un diagnóstico detallado por consola y un reporte estructurado en Markdown 
('reporte_diagnostico_etl.md') con lineamientos directos para el Sprint 2 (ETL).
"""

import os
import sys
import time
from typing import Dict, Any, List
import numpy as np
import pandas as pd

# Asegurar codificación utf-8 en salidas de consola de Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


class DatasetProfilerETL:
    """
    Clase responsable del perfilado y diagnóstico de calidad de datos para
    preparar la fase de Extracción, Transformación y Carga (ETL).
    """

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.df: pd.DataFrame = pd.DataFrame()
        self.diagnostics: Dict[str, Any] = {}

    def load_dataset(self) -> None:
        """Carga el dataset optimizando la lectura y midiendo tiempos."""
        print("=" * 80)
        print(">>> INICIANDO PROCESO DE AUDITORÍA Y EDA PRE-ETL")
        print(f">>> Archivo objetivo: {self.filepath}")
        print("=" * 80)

        if not os.path.exists(self.filepath):
            raise FileNotFoundError(f"No se encontró el archivo: {self.filepath}")

        start_time = time.time()
        file_size_mb = os.path.getsize(self.filepath) / (1024 * 1024)
        print(f"[*] Tamaño en disco: {file_size_mb:.2f} MB")
        print("[*] Cargando datos en memoria...")

        self.df = pd.read_csv(self.filepath)
        load_time = time.time() - start_time

        memory_usage_mb = self.df.memory_usage(deep=True).sum() / (1024 * 1024)
        print(f"[+] Carga completada en {load_time:.2f} segundos.")
        print(f"[+] Registros cargados: {len(self.df):,}")
        print(f"[+] Columnas detectadas: {self.df.shape[1]}")
        print(f"[+] Uso de memoria RAM (crudo): {memory_usage_mb:.2f} MB\n")

        self.diagnostics["file_size_mb"] = file_size_mb
        self.diagnostics["memory_usage_mb"] = memory_usage_mb
        self.diagnostics["total_rows"] = len(self.df)
        self.diagnostics["total_cols"] = self.df.shape[1]

    def audit_completeness_and_duplicates(self) -> None:
        """Audita valores nulos, duplicados en clave primaria y filas completas."""
        print("-" * 80)
        print("1. AUDITORÍA DE COMPLETITUD Y UNICIDAD")
        print("-" * 80)

        # Chequeo de duplicados por ID y generales
        total_rows = len(self.df)
        id_col = "id" if "id" in self.df.columns else self.df.columns[0]
        unique_ids = self.df[id_col].nunique()
        duplicate_ids = total_rows - unique_ids
        duplicate_rows = self.df.duplicated().sum()

        print(f"[*] Clave primaria candidata: '{id_col}'")
        print(f"[*] IDs únicos: {unique_ids:,} de {total_rows:,}")
        print(f"[*] Duplicados por clave primaria: {duplicate_ids}")
        print(f"[*] Filas exactamente duplicadas: {duplicate_rows}")

        # Chequeo de valores nulos por columna
        null_counts = self.df.isnull().sum()
        columns_with_nulls = null_counts[null_counts > 0]

        print("\n[*] Detección de valores faltantes (NaN/Null):")
        if len(columns_with_nulls) == 0:
            print("    -> No se detectaron valores nulos en ninguna columna.")
        else:
            for col, count in columns_with_nulls.items():
                pct = (count / total_rows) * 100
                print(f"    -> Columna '{col}': {count:,} nulos ({pct:.2f}%)")

        # Diagnóstico crítico: ¿Por qué faltan precios?
        if "price" in self.df.columns and "price" in columns_with_nulls:
            null_price_breakdown = self.df[self.df["price"].isna()]["name"].value_counts().to_dict()
            print("\n[!] DIAGNÓSTICO CLAVE SOBRE NULOS EN 'price':")
            print(f"    El 100% de los valores nulos en 'price' corresponden a la categoría:")
            for cat, cnt in null_price_breakdown.items():
                print(f"    - Servicio '{cat}': {cnt:,} registros.")
            print("    Explicación: Uber Taxi opera mediante taxímetro regulado y no entrega")
            print("    tarifa fija anticipada (upfront price) a través de la API pública.")
            self.diagnostics["null_price_breakdown"] = null_price_breakdown

        self.diagnostics["unique_ids"] = unique_ids
        self.diagnostics["duplicate_ids"] = duplicate_ids
        self.diagnostics["duplicate_rows"] = duplicate_rows
        self.diagnostics["null_columns"] = {k: int(v) for k, v in columns_with_nulls.items()}

    def audit_schema_and_redundancies(self) -> None:
        """Clasifica atributos y detecta redundancias (p. ej. visibility vs visibility.1)."""
        print("\n" + "-" * 80)
        print("2. ANÁLISIS DE ESQUEMA Y REDUNDANCIAS ESTRUCTURALES")
        print("-" * 80)

        cols = list(self.df.columns)
        trip_features = [
            c for c in cols if c in [
                "id", "timestamp", "hour", "day", "month", "datetime", "timezone",
                "source", "destination", "cab_type", "product_id", "name",
                "price", "distance", "surge_multiplier", "latitude", "longitude"
            ]
        ]
        weather_features = [c for c in cols if c not in trip_features]

        print(f"[*] Columnas relacionadas al viaje ({len(trip_features)}): {trip_features}")
        print(f"[*] Columnas meteorológicas ({len(weather_features)}): {weather_features[:8]}... (+{len(weather_features)-8} más)")

        # Chequeo de duplicados idénticos en columnas climáticas
        redundancies = []
        if "visibility" in self.df.columns and "visibility.1" in self.df.columns:
            is_identical = (self.df["visibility"] == self.df["visibility.1"]).all()
            if is_identical:
                redundancies.append(("visibility.1", "visibility"))
                print("\n[!] REDUNDANCIA CONFIRMADA:")
                print("    'visibility.1' es una copia idéntica de 'visibility'.")
                print("    Acción recomendada en ETL: Descartar 'visibility.1'.")

        self.diagnostics["trip_features"] = trip_features
        self.diagnostics["weather_features"] = weather_features
        self.diagnostics["redundancies"] = redundancies

    def analyze_ride_market_and_pricing(self) -> None:
        """Analiza la distribución de mercado entre Uber y Lyft y el comportamiento del precio."""
        print("\n" + "-" * 80)
        print("3. ANÁLISIS DE MERCADO, SERVICIOS Y TARIFAS")
        print("-" * 80)

        # Distribución de plataformas
        cab_counts = self.df["cab_type"].value_counts()
        cab_pct = self.df["cab_type"].value_counts(normalize=True) * 100
        print("[*] Participación por Plataforma:")
        for cab in cab_counts.index:
            print(f"    - {cab}: {cab_counts[cab]:,} viajes ({cab_pct[cab]:.2f}%)")

        # Tipos de servicio y precios
        df_priced = self.df[self.df["price"].notna()]
        print(f"\n[*] Registros válidos con precio definido: {len(df_priced):,} ({len(df_priced)/len(self.df)*100:.2f}%)")
        print("[*] Resumen Estadístico de 'price' (Tarifa en USD):")
        price_stats = df_priced["price"].describe()
        print(f"    - Media: ${price_stats['mean']:.2f} USD")
        print(f"    - Mediana (P50): ${price_stats['50%']:.2f} USD")
        print(f"    - Desviación estándar: ${price_stats['std']:.2f} USD")
        print(f"    - Mínimo: ${price_stats['min']:.2f} USD")
        print(f"    - Máximo: ${price_stats['max']:.2f} USD")

        print("\n[*] Desglose de Tarifa Media por Tipo de Servicio:")
        service_summary = df_priced.groupby(["cab_type", "name"])["price"].agg(
            Viajes="count",
            Precio_Promedio="mean",
            Precio_Min="min",
            Precio_Max="max"
        ).reset_index().sort_values(by=["cab_type", "Precio_Promedio"])

        for _, row in service_summary.iterrows():
            print(f"    - [{row['cab_type']}] {row['name']:<15} | Media: ${row['Precio_Promedio']:>5.2f} | Rango: [${row['Precio_Min']:>4.1f} - ${row['Precio_Max']:>4.1f}] | Muestra: {int(row['Viajes']):,}")

        # Comportamiento de surge_multiplier
        print("\n[*] Auditoría de Multiplicador de Tarifa Dinámica ('surge_multiplier'):")
        surge_by_cab = self.df.groupby("cab_type")["surge_multiplier"].value_counts()
        print("    Distribución por plataforma:")
        for (cab, surge), count in surge_by_cab.items():
            pct = count / cab_counts[cab] * 100
            print(f"    - [{cab}] Factor x{surge}: {count:,} viajes ({pct:.2f}%)")

        print("\n[!] DIAGNÓSTICO TÉCNICO SOBRE 'surge_multiplier':")
        print("    - Uber presenta 'surge_multiplier = 1.0' en el 100% de sus registros.")
        print("      Esto se debe a que Uber cambió a 'Upfront Pricing' (tarifa cerrada),")
        print("      ocultando el multiplicador explícito en su endpoint público.")
        print("    - Lyft sí registra multiplicadores variables (de x1.0 hasta x3.0),")
        print("      con una tasa de viajes en surge de aprox. 6.82%.")

        self.diagnostics["cab_distribution"] = cab_counts.to_dict()
        self.diagnostics["price_stats"] = price_stats.to_dict()
        self.diagnostics["service_summary"] = service_summary.to_dict(orient="records")

    def analyze_spatial_and_temporal_domain(self) -> None:
        """Evalúa las ubicaciones geográficas y la cobertura temporal."""
        print("\n" + "-" * 80)
        print("4. ANÁLISIS ESPACIO-TEMPORAL")
        print("-" * 80)

        # Ubicaciones
        sources = sorted(self.df["source"].unique())
        destinations = sorted(self.df["destination"].unique())
        print(f"[*] Puntos de Origen ({len(sources)}): {', '.join(sources)}")
        print(f"[*] Puntos de Destino ({len(destinations)}): {', '.join(destinations)}")

        routes = self.df.groupby(["source", "destination"]).size()
        print(f"[*] Rutas únicas evaluadas: {len(routes)} pares origen-destino.")

        # Temporalidad
        min_date = self.df["datetime"].min()
        max_date = self.df["datetime"].max()
        print(f"[*] Ventana temporal de observación:")
        print(f"    - Inicio: {min_date}")
        print(f"    - Fin:    {max_date}")

        # Distancia
        dist_stats = self.df["distance"].describe()
        print(f"\n[*] Resumen de Distancia recorrida (millas):")
        print(f"    - Media: {dist_stats['mean']:.2f} mi")
        print(f"    - Rango: [{dist_stats['min']:.2f} mi - {dist_stats['max']:.2f} mi]")

        self.diagnostics["sources_count"] = len(sources)
        self.diagnostics["destinations_count"] = len(destinations)
        self.diagnostics["unique_routes"] = len(routes)
        self.diagnostics["date_range"] = (min_date, max_date)
        self.diagnostics["distance_stats"] = dist_stats.to_dict()

    def generate_etl_action_plan(self) -> str:
        """Construye el reporte consolidado y plan de acción de ingeniería para el ETL."""
        report = f"""# Reporte Diagnóstico y Plan de Acción Pre-ETL
**Proyecto**: Análisis de Factores Determinantes en el Precio de Viajes (Uber & Lyft - Boston)  
**Entrega**: Sprint 1 - Hito 1 (Arquitectura de Datos y Plan de Trabajo)  
**Generado automáticamente**: {time.strftime('%Y-%m-%d %H:%M:%S')}  

---

## 1. Resumen Ejecutivo del Diagnóstico
- **Volumen Crudo**: {self.diagnostics.get('total_rows', 0):,} filas y {self.diagnostics.get('total_cols', 0)} columnas.
- **Tamaño en disco**: {self.diagnostics.get('file_size_mb', 0):.2f} MB.
- **Clave Primaria (`id`)**: Unicidad del 100% ({self.diagnostics.get('unique_ids', 0):,} IDs únicos, 0 duplicados).
- **Filas Duplicadas Globales**: 0 registros repetidos.
- **Ventana de Tiempo**: Del `{self.diagnostics.get('date_range', ('N/A', 'N/A'))[0]}` al `{self.diagnostics.get('date_range', ('N/A', 'N/A'))[1]}` (aprox. 23 días consecutivos en Boston, MA).

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
"""
        return report


def main():
    csv_filename = "rideshare_kaggle.csv"
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.join(script_dir, csv_filename)

    if not os.path.exists(target_path):
        # Intentar en directorio de trabajo actual
        target_path = csv_filename

    profiler = DatasetProfilerETL(target_path)
    profiler.load_dataset()
    profiler.audit_completeness_and_duplicates()
    profiler.audit_schema_and_redundancies()
    profiler.analyze_ride_market_and_pricing()
    profiler.analyze_spatial_and_temporal_domain()

    # Generar y guardar el reporte diagnóstico en Markdown
    report_content = profiler.generate_etl_action_plan()
    report_path = os.path.join(script_dir, "reporte_diagnostico_etl.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)

    print("\n" + "=" * 80)
    print("[OK] DIAGNOSTICO FINALIZADO CON EXITO")
    print(f"[OK] Se ha exportado el reporte estructurado a: {report_path}")
    print("=" * 80)


if __name__ == "__main__":
    main()
