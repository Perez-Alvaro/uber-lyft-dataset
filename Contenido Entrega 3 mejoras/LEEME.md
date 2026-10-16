# Entrega 3 · Modelado y análisis de resultados (versión final)

Grupo 11 · Ciencia de Datos 5K1 · UTN FRC · Uber y Lyft en Boston

> La carpeta `Contenido Entrega 3/` es la versión preliminar y quedó sin tocar. **Esta es la versión que se entrega y se presenta.** Qué cambió y por qué: [`7_Revision_version_preliminar/`](7_Revision_version_preliminar/REVISION_ENTREGA3_PRELIMINAR.md).

## Qué abrir según lo que necesites

| Necesito… | Abrir |
|---|---|
| El informe para entregar | [`1_Informe/Entrega3_Grupo11.docx`](1_Informe/) |
| Presentar en la defensa oral | [`2_Presentacion_Colab/Presentacion_Entrega3_Grupo11.ipynb`](2_Presentacion_Colab/) (abrir en Colab con el botón del principio) |
| Ver o cambiar el código de los modelos | [`3_Codigo/modelado_entrega3.py`](3_Codigo/) |
| Los datasets listos para modelar | [`4_Datasets/datasets modelado/`](4_Datasets/datasets%20modelado/) |
| Los datasets balanceados | [`4_Datasets/datasets balanceados/`](4_Datasets/datasets%20balanceados/) (con su propio LEEME) |
| Un gráfico | [`5_Graficos/`](5_Graficos/): `figNN` = número de figura del informe |
| Un número exacto | [`6_Resultados/metricas.json`](6_Resultados/) y las tablas CSV |
| Entender el K-Means de rutas (para qué sirve y qué dice) | [`EXPLICACION_KMEANS_RUTAS.md`](EXPLICACION_KMEANS_RUTAS.md) |

## Estructura

```
Contenido Entrega 3 mejoras/
├── LEEME.md                              ← este archivo
├── EXPLICACION_KMEANS_RUTAS.md           por qué usamos K-Means en las rutas y qué nos dice
├── 1_Informe/
│   └── Entrega3_Grupo11.docx             informe en formato paper (mismo estilo que la Entrega 2)
├── 2_Presentacion_Colab/
│   └── Presentacion_Entrega3_Grupo11.ipynb   notebook para la defensa oral (ya ejecutado)
├── 3_Codigo/
│   ├── modelado_entrega3.py              genera TODO lo de las carpetas 4, 5 y 6 (~7 min)
│   └── requirements.txt
├── 4_Datasets/
│   ├── datasets modelado/
│   │   ├── dataset_modelado_price.zip    636.568 × 75 · objetivo price (Uber + Lyft)
│   │   └── dataset_modelado_surge.zip    255.953 × 64 · objetivo has_surge (Lyft sin Shared)
│   └── datasets balanceados/
│       ├── LEEME_datasets_balanceados.md
│       ├── surge_train_submuestreo.zip   32.094 filas · 50% con recargo
│       ├── surge_train_smote.zip         361.022 filas · 50% con recargo
│       └── surge_test_sin_balancear.zip  59.395 filas · 8,3% con recargo (proporción real)
├── 5_Graficos/                           fig01 a fig10, igual que en el informe
├── 6_Resultados/                         metricas.json + CSV (prefijos precio_, recargo_, rutas_)
└── 7_Revision_version_preliminar/
    └── REVISION_ENTREGA3_PRELIMINAR.md   qué estaba mal en la versión preliminar
```

## Los resultados en cinco líneas

1. **Precio:** el random forest predice el precio con un error medio de **USD 1,05** (R² = 0,968). Lo explican el producto y la distancia; la hora y el clima no aportan.
2. **Recargo:** es difícil de anticipar (ROC-AUC ≈ 0,67). El mejor modelo (árbol de decisión) detecta el **52%** de los recargos con 13,9% de precisión, contra 8,3% del azar.
3. **Accuracy:** decir siempre "sin recargo" da 91,7% de accuracy y detecta 0 recargos. Por eso la accuracy se informa siempre junto con la **accuracy balanceada** (árbol: 61,5% contra 50% del azar), el recall y el PR-AUC.
4. **Balanceo:** comparamos sin balanceo, submuestreo, SMOTE y pesos de clase. Elegimos **pesos de clase**: mejor F1 y PR-AUC y no inventa filas. SMOTE empeora a los árboles.
5. **Patrón principal:** el recargo depende de la **zona de origen**. Salir de Back Bay, Fenway, Northeastern o Boston University duplica la chance de recargo.

## Cómo regenerar todo

```bash
pip install -r 3_Codigo/requirements.txt
python 3_Codigo/modelado_entrega3.py           # completo, ~7 min
python 3_Codigo/modelado_entrega3.py --rapido  # prueba en 1 min (escribe en una carpeta temporal)
```

El script lee `Contenido Entrega 2/Dataset Codificado/dataset_codificado.zip`. Usa semilla fija, así que da siempre los mismos resultados.
