"""Codificación de variables categóricas del dataset limpio (con has_surge).

Entrada : ../DataSet Segunda Entrega Sin Codificar/dataset_nueva_columna.zip  (636.568 filas x 27 columnas)
Salida  : dataset_codificado.csv (+ .zip)

- cab_type      -> is_uber (binaria 0/1)
- name          -> One Hot Encoding (12 columnas name_*)  <- servicios de Uber y Lyft
- service_tier  -> Ordinal Encoding (service_tier_ord, 0 = Compartido ... 5 = Black XL)
- time_slot, source, destination, short_summary -> One Hot Encoding
"""
from pathlib import Path

import pandas as pd

AQUI = Path(__file__).resolve().parent
ENTRADA = AQUI.parent / "DataSet Segunda Entrega Sin Codificar" / "dataset_nueva_columna.zip"
SALIDA = AQUI / "dataset_codificado.csv"

ORDEN_TIER = ["Compartido", "Estándar", "XL", "Premium", "Black", "Black XL"]
COLS_OHE = ["name", "time_slot", "source", "destination", "short_summary"]

df = pd.read_csv(ENTRADA)
filas, cols = df.shape

# Limpieza mínima: short_summary trae espacios al inicio y al final (" Rain ")
df["short_summary"] = df["short_summary"].str.strip()

# 1) Binaria: Uber = 1, Lyft = 0
df["cab_type"] = (df["cab_type"] == "Uber").astype("int8")
df = df.rename(columns={"cab_type": "is_uber"})

# 2) Ordinal: el nivel de servicio tiene un orden natural (confirmado por el precio medio)
df["service_tier"] = df["service_tier"].map({t: i for i, t in enumerate(ORDEN_TIER)}).astype("int8")
df = df.rename(columns={"service_tier": "service_tier_ord"})

# 3) One Hot Encoding: categorías nominales, sin orden. Cada grupo se inserta donde estaba la columna original.
for col in COLS_OHE:
    pos = df.columns.get_loc(col)
    dummies = pd.get_dummies(df[col], prefix=col, dtype="int8")
    dummies.columns = [c.replace(" ", "_") for c in dummies.columns]
    df = pd.concat([df.iloc[:, :pos], dummies, df.iloc[:, pos + 1:]], axis=1)

# Validaciones
assert len(df) == filas, "cambió la cantidad de filas"
assert df.isna().sum().sum() == 0, "aparecieron nulos"
for col in COLS_OHE:
    assert (df.filter(regex=f"^{col}_").sum(axis=1) == 1).all(), f"{col}: cada fila debe tener exactamente un 1"
uber = ["name_Black", "name_Black_SUV", "name_UberPool", "name_UberX", "name_UberXL", "name_WAV"]
assert (df[uber].sum(axis=1) == df["is_uber"]).all(), "is_uber no coincide con los productos de Uber"

df.to_csv(SALIDA, index=False)
df.to_csv(SALIDA.with_suffix(".zip"), index=False,
          compression={"method": "zip", "archive_name": SALIDA.name})
print(f"{filas} filas | {cols} -> {df.shape[1]} columnas | {SALIDA.name}")
