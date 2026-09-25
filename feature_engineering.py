"""
Etapa 2 del ETL: Feature Engineering, Construcción de Targets y Exportación Parquet.
Toma 'rideshare_clean.csv' y genera 'rideshare_features.parquet'.
"""

from pathlib import Path
import numpy as np
import pandas as pd

INPUT_FILE = Path("rideshare_clean.csv")
OUTPUT_FILE = Path("rideshare_features.parquet")


def aplicar_feature_engineering():
    if not INPUT_FILE.exists():
        raise FileNotFoundError(f"No se encontró {INPUT_FILE}. Ejecuta primero limpiar_dataset.py.")

    print("[1/4] Cargando dataset limpio...")
    df = pd.read_csv(INPUT_FILE)

    print("[2/4] Creando variables temporales...")
    # Parsear datetime para extraer variables cíclicas y de negocio
    df["datetime"] = pd.to_datetime(df["datetime"])
    df["hour"] = df["datetime"].dt.hour.astype(np.int8)
    df["day_of_week"] = df["datetime"].dt.dayofweek.astype(np.int8)
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(np.int8)

    # Hora pico urbana en Boston: 7 a 9 AM y 16 a 19 PM en días hábiles
    df["rush_hour"] = (
        (df["is_weekend"] == 0)
        & (((df["hour"] >= 7) & (df["hour"] <= 9)) | ((df["hour"] >= 16) & (df["hour"] <= 19)))
    ).astype(np.int8)

    print("[3/4] Abriendo la 'caja negra' de Uber y calculando Targets...")
    # Ajuste de distancia para evitar divisiones por 0 o anomalías ultra cortas
    df["distance_adj"] = df["distance"].clip(lower=0.1)
    df["price_per_mile"] = df["price"] / df["distance_adj"]

    # Mediana base de cada ruta fija y servicio (tarifa sin dinamismo)
    base_rates = df.groupby(["source", "destination", "name"])["price_per_mile"].transform(
        "median"
    )
    df["uber_surge_ratio"] = (df["price_per_mile"] / base_rates).round(3)

    # TARGET 2: is_surge (Unificado)
    # Lyft: surge_multiplier explícito > 1.0
    # Uber: ratio implícito >= 1.20 (20% por encima de la mediana base)
    df["is_surge"] = np.where(
        (df["cab_type"] == "Lyft") & (df["surge_multiplier"] > 1.0),
        1,
        np.where((df["cab_type"] == "Uber") & (df["uber_surge_ratio"] >= 1.20), 1, 0),
    ).astype(np.int8)

    print("[4/4] Limpiando columnas de ruido y optimizando memoria...")
    # Columnas que no aportan al modelado predictivo o timestamps secundarios del clima
    cols_a_borrar = [
        "id",
        "timestamp",
        "datetime",
        "timezone",
        "product_id",
        "distance_adj",
        "price_per_mile",  # se borra para evitar data leakage
    ]
    time_cols = [c for c in df.columns if "Time" in c]
    df = df.drop(columns=cols_a_borrar + time_cols, errors="ignore")

    # Downcasting de categóricas
    cat_cols = ["cab_type", "name", "source", "destination", "short_summary", "icon"]
    for c in cat_cols:
        if c in df.columns:
            df[c] = df[c].astype("category")

    # Downcasting numérico de 64 a 32 bits
    float_cols = df.select_dtypes(include=["float64"]).columns
    df[float_cols] = df[float_cols].astype(np.float32)

    # Exportación a Parquet
    df.to_parquet(OUTPUT_FILE, index=False)
    print(f"\n[OK] Proceso completado exitosamente:")
    print(f" - Archivo guardado: {OUTPUT_FILE}")
    print(f" - Dimensiones: {df.shape[0]:,} filas y {df.shape[1]} columnas")
    print(f" - Tasa de viajes con Surge detectada: {df['is_surge'].mean()*100:.2f}%")


if __name__ == "__main__":
    aplicar_feature_engineering()
