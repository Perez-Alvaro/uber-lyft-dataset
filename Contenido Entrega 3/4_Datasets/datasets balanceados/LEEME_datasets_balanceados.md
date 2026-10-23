# Datasets balanceados (has_surge)

Cómo quedaron los datasets después de aplicar las técnicas de balanceo, y para qué sirve cada uno.

## El problema

En Lyft sin Shared solo el **8,19%** de las cotizaciones tiene recargo: hay 11 sin recargo por cada una con recargo. Si se entrena así, el modelo aprende a decir siempre "sin recargo", y aun así tiene **91,7% de accuracy** sin detectar un solo recargo.

## Los archivos

| Archivo | Filas | Sin recargo | Con recargo | Para qué es |
|---|---:|---:|---:|---|
| `surge_train_submuestreo.zip` | 32.094 | 16.047 (50%) | 16.047 (50%) | Entrenar con **submuestreo** |
| `surge_train_smote.zip` | 361.022 | 180.511 (50%) | 180.511 (50%) | Entrenar con **SMOTE** |
| `surge_test_sin_balancear.zip` | 59.395 | 54.467 (91,7%) | 4.928 (8,3%) | **Evaluar** (siempre con la proporción real) |

Como referencia, el entrenamiento original (sin balancear) tiene 196.558 filas: 180.511 sin recargo y 16.047 con recargo (8,2%). Está en `../datasets modelado/dataset_modelado_surge.zip`, con `particion == "train"`.

### Submuestreo (`surge_train_submuestreo`)

- Se conservan **todas** las cotizaciones con recargo (16.047) y se eligen **al azar** otras tantas sin recargo (`RandomUnderSampler`, `random_state=42`).
- Se descartan 164.464 filas: el 91% de la clase mayoritaria.
- Todas las filas son reales y tienen las mismas columnas que el dataset de modelado (incluida `ruta`).

### SMOTE (`surge_train_smote`)

- Se conservan las 196.558 filas reales y se agregan **164.464 cotizaciones sintéticas con recargo**, hasta llegar a 50/50.
- Cada fila sintética se crea interpolando entre una cotización con recargo y uno de sus 5 vecinos más cercanos (con las variables estandarizadas, igual que en el modelo) y después se vuelve a las unidades originales.
- La columna **`sintetica`** vale 1 en las filas inventadas y 0 en las reales. Las sintéticas no tienen `id` ni `ruta`.
- **Ojo:** en las filas sintéticas las dummies pueden tener valores intermedios, por ejemplo `source_Back_Bay = 0,37`. Es una cotización que no puede existir, y por eso SMOTE no ayuda con nuestros datos (sección 5.3 del informe).

### Test sin balancear (`surge_test_sin_balancear`)

- Son las cotizaciones del 15 al 18/12/2018, con la proporción real de recargos.
- **El test nunca se balancea.** Si se balanceara, las métricas medirían un mundo con 50% de recargos, que no existe, y con SMOTE se evaluaría sobre filas inventadas.

## Cuál usamos en el modelo final

**Ninguno de los dos balanceados.** La técnica elegida fue **pesos de clase** (`class_weight="balanced"`), que no cambia las filas: hace que un error en un recargo pese 6,12 y uno en un no-recargo 0,54. Se eligió **por validación** (sin mirar la prueba): el par con mayor PR-AUC en validación fue gradient boosting con pesos de clase (0,136). Además usa solo datos reales.

Estos archivos quedan para mostrar el efecto de cada técnica. Resultados del modelo elegido (gradient boosting) con cada técnica, cada una con sus propios hiperparámetros:

| Técnica | Accuracy | Accuracy balanceada | Recall | Precisión | PR-AUC validación |
|---|---:|---:|---:|---:|---:|
| Sin balanceo | 91,7% | 50,0% | 0,0% | 0,0% | 0,134 |
| Submuestreo | 53,8% | 62,8% | 73,6% | 12,2% | 0,130 |
| SMOTE | 91,6% | 50,1% | 0,3% | 15,9% | 0,116 |
| Pesos de clase (elegida) | 54,2% | 63,1% | 73,7% | 12,3% | 0,136 |

Accuracy, recall y precisión: período de prueba con umbral 0,5. El PR-AUC de validación es el que se usó para comparar.

## Cómo se generan

Los genera `3_Codigo/modelado_entrega3.py`, al final, en la sección "DATASETS DE MODELADO". Se cargan con:

```python
import pandas as pd
train = pd.read_csv("surge_train_smote.zip")
reales = train[train["sintetica"] == 0]
```
