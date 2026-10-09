"""Limpia el dataset de viajes para la etapa ETL."""

import argparse
import hashlib
from pathlib import Path

import pandas as pd


SCRIPT_DIR = Path(__file__).resolve().parent
WORKSPACE_DIR = SCRIPT_DIR.parent


def find_input_path() -> Path:
    candidates = (
        WORKSPACE_DIR / "rideshare_kaggle.csv",
        SCRIPT_DIR / "rideshare_kaggle.csv",
        Path.cwd() / "rideshare_kaggle.csv",
    )
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        "No se encontro rideshare_kaggle.csv en el directorio del proyecto."
    )


def clean_dataset(input_path: Path, output_path: Path) -> None:
    data = pd.read_csv(input_path)

    if "name" not in data.columns:
        raise KeyError("El dataset no contiene la columna 'name'.")

    taxi_mask = data["name"].astype("string").str.strip().str.casefold().eq("taxi")
    taxi_rows_removed = int(taxi_mask.sum())
    data = data.loc[~taxi_mask].copy()

    column_groups = {}
    redundant_columns = []
    for column in data.columns:
        column_hash = hashlib.md5(
            pd.util.hash_pandas_object(data[column], index=False).values.tobytes()
        ).hexdigest()
        representative = column_groups.get(column_hash)
        if representative is not None and data[column].equals(data[representative]):
            redundant_columns.append(column)
        else:
            column_groups[column_hash] = column
    data = data.drop(columns=redundant_columns)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    data.to_csv(output_path, index=False)

    print(f"Filas originales: {len(data) + taxi_rows_removed:,}")
    print(f"Filas Taxi eliminadas: {taxi_rows_removed:,}")
    print(f"Columnas redundantes eliminadas: {redundant_columns or 'ninguna'}")
    print(f"Filas finales: {len(data):,}")
    print(f"Columnas finales: {len(data.columns)}")
    print(f"Archivo limpio: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Elimina viajes Taxi y columnas identicas del dataset."
    )
    parser.add_argument(
        "input",
        nargs="?",
        type=Path,
        help="Ruta al CSV original (por defecto: rideshare_kaggle.csv).",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Ruta del CSV limpio (por defecto: junto al archivo original).",
    )
    args = parser.parse_args()

    input_path = args.input.resolve() if args.input else find_input_path()
    if not input_path.exists():
        raise FileNotFoundError(f"No se encontro el archivo: {input_path}")

    output_path = args.output.resolve() if args.output else input_path.with_name(
        "rideshare_clean.csv"
    )
    clean_dataset(input_path, output_path)


if __name__ == "__main__":
    main()
