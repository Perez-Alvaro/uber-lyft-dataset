# Entrega 3 · Modelado y análisis de resultados (versión final)

Grupo 11 · Ciencia de Datos 5K1 · UTN FRC · Uber y Lyft en Boston

> La carpeta `Contenido Entrega 3/` es un **borrador** (versión preliminar) y quedó sin tocar como registro. **Esta es la versión que se entrega y se presenta.** Qué cambió y por qué: [`7_Revision_version_preliminar/`](7_Revision_version_preliminar/REVISION_ENTREGA3_PRELIMINAR.md).

## Qué abrir según lo que necesites

| Necesito… | Abrir |
|---|---|
| El informe para entregar | [`1_Informe/Entrega3_Grupo11.docx`](1_Informe/) |
| Presentar en la defensa oral | [`2_Presentacion_Colab/Presentacion_Entrega3_Grupo11.ipynb`](2_Presentacion_Colab/) (abrir en Colab con el botón del principio) |
| Ver la presentación sin abrir Colab | [`2_Presentacion_Colab/Presentacion_Entrega3_Grupo11.pdf`](2_Presentacion_Colab/Presentacion_Entrega3_Grupo11.pdf) |
| Ver o cambiar el código de los modelos | [`3_Codigo/modelado_entrega3.py`](3_Codigo/) |
| Los datasets listos para modelar | [`4_Datasets/datasets modelado/`](4_Datasets/datasets%20modelado/) |
| Los datasets balanceados | [`4_Datasets/datasets balanceados/`](4_Datasets/datasets%20balanceados/) (con su propio LEEME) |
| Un gráfico | [`5_Graficos/`](5_Graficos/): `figNN` = número de figura del informe |
| Un número exacto | [`6_Resultados/metricas.json`](6_Resultados/) y las tablas CSV |
| Un resumen breve de toda la entrega (para la docente) | [`DEFENSA_PROFE.md`](DEFENSA_PROFE.md) |
| Qué cambió respecto de la versión anterior | [`CAMBIOS_RESPECTO_VERSION_ANTERIOR.md`](CAMBIOS_RESPECTO_VERSION_ANTERIOR.md) |
| Entender en detalle cómo hicimos cada modelo | [`Modelos/README.md`](Modelos/README.md) |
| Entender cómo se predice el surge (explicación simple) | [`COMO_SE_PREDICE_EL_SURGE.md`](COMO_SE_PREDICE_EL_SURGE.md) |
| Entender el K-Means de productos | [`EXPLICACION_KMEANS_PRODUCTOS.md`](EXPLICACION_KMEANS_PRODUCTOS.md) |

## Estructura

```
Contenido Entrega 3 mejoras/
├── LEEME.md                              ← este archivo
├── DEFENSA_PROFE.md                      resumen breve de toda la entrega, para la docente
├── CAMBIOS_RESPECTO_VERSION_ANTERIOR.md  qué cambió respecto de la versión anterior y por qué
├── COMO_SE_PREDICE_EL_SURGE.md          explicación simple del modelo de recargo
├── EXPLICACION_KMEANS_PRODUCTOS.md       por qué usamos K-Means en los productos y qué nos dice
├── Modelos/
│   └── README.md                         cómo hicimos cada modelo, paso a paso (detallado)
├── 1_Informe/
│   └── Entrega3_Grupo11.docx             informe en formato paper (mismo estilo que la Entrega 2)
├── 2_Presentacion_Colab/
│   ├── Presentacion_Entrega3_Grupo11.ipynb   notebook para la defensa oral (ya ejecutado)
│   └── Presentacion_Entrega3_Grupo11.pdf     la misma presentación en PDF (sin código)
├── 3_Codigo/
│   ├── modelado_entrega3.py              genera TODO lo de las carpetas 4, 5 y 6 (~15 min)
│   └── requirements.txt
├── 4_Datasets/
│   ├── datasets modelado/
│   │   ├── dataset_modelado_price.zip    636.568 × 75 · objetivo price (Uber + Lyft)
│   │   └── dataset_modelado_surge.zip    255.953 × 65 · objetivo has_surge (Lyft sin Shared)
│   └── datasets balanceados/
│       ├── LEEME_datasets_balanceados.md
│       ├── surge_train_submuestreo.zip   32.094 filas · 50% con recargo
│       ├── surge_train_smote.zip         361.022 filas · 50% con recargo
│       └── surge_test_sin_balancear.zip  59.395 filas · 8,3% con recargo (proporción real)
├── 5_Graficos/                           fig01 a fig11, igual que en el informe
├── 6_Resultados/                         metricas.json + CSV (prefijos precio_, recargo_, productos_)
└── 7_Revision_version_preliminar/
    └── REVISION_ENTREGA3_PRELIMINAR.md   qué estaba mal en la versión preliminar y qué se corrigió
```

## Los resultados en siete líneas

1. **Modelos:** probamos regresión lineal (Ridge) y logística, árbol de decisión, random forest y gradient boosting, cada uno con varias configuraciones (grillas extendidas hasta que el valor elegido quedara adentro). El modelo final se eligió por **validación cruzada temporal**, nunca mirando la prueba; una validación cruzada mezclada sirvió de control y mostró resultados inflados.
2. **Precio:** el modelo elegido (random forest con surge) se equivoca en promedio **USD 1,08** (IC 95%: 1,07 a 1,09; R² = 0,967) y predice el **75%** de los viajes con error de hasta 10%. Sin el multiplicador: USD 1,32 y R² = 0,928. Lo explican el producto y la distancia; la hora y el clima no aportan.
3. **Recargo:** es difícil de anticipar (ROC-AUC entre 0,65 y 0,68). El modelo elegido (gradient boosting con pesos de clase) detecta el **51%** de los recargos con 13,5% de precisión, contra 8,3% del azar, y supera con certeza a la regla simple por zona de origen.
4. **Accuracy:** decir siempre "sin recargo" da 91,7% de accuracy y detecta 0 recargos. Por eso la accuracy del modelo (**68,6%**) se informa siempre junto con la **accuracy balanceada** (60,8% contra 50% del azar), el recall, el PR-AUC y sus intervalos de confianza.
5. **Matriz de beneficio:** un recargo evitado vale USD 8,73 y una falsa alarma cuesta, como supuesto, USD 1. Conviene avisar solo si la probabilidad de recargo supera el 11,4%: el umbral queda en 0,57 y el modelo gana USD 56 cada 1.000 cotizaciones. Conviene enfocarse en la **precisión**; si una falsa alarma costara USD 2 o más, no convendría avisar nunca.
6. **Balanceo:** comparamos sin balanceo, submuestreo, SMOTE y pesos de clase. Elegimos **pesos de clase** por validación; con el umbral ajustado, sin balanceo rinde casi igual: balancear mueve el umbral, no mejora el ranking.
7. **Patrón principal:** el recargo depende del **lugar** (ruta y zona de origen). Salir de Northeastern, Boston University, Fenway o Back Bay aumenta la chance de recargo.

## Cómo regenerar todo

```bash
pip install -r 3_Codigo/requirements.txt
python 3_Codigo/modelado_entrega3.py           # completo, ~15 min con 10 núcleos
python 3_Codigo/modelado_entrega3.py --rapido  # prueba en ~2 min (escribe en una carpeta temporal)
```

El script lee `Contenido Entrega 2/Dataset Codificado/dataset_codificado.zip` y usa semilla fija. Si la computadora tiene poca memoria, bajar `N_JOBS_PESADO` al principio del script.
