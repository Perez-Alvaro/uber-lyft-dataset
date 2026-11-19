# Prueba · Costo del falso negativo (crítica de la docente)

**Crítica:** es peor que la app diga "sin recargo" y después haya recargo (falso negativo) que una falsa alarma.
En la Entrega 3 la matriz de beneficio le daba al falso negativo **USD 0** ("igual que sin modelo"), así que el
umbral (0,57) dejaba escapar casi la mitad de los recargos.

**Qué cambia:** solo la matriz de beneficio y, con ella, el umbral. El falso negativo pasa a valer
**−USD 8,73** (el recargo medio: lo que paga de más el pasajero que confió en la app). Los modelos y sus
hiperparámetros son **los mismos** de la Entrega 3 (se eligieron por PR-AUC, que no depende del umbral).
El umbral se elige en validación temporal y la prueba (15 al 18/12/2018) solo se usa para medir.

| Matriz de beneficio | VN | FP | FN | VP |
|---|---|---|---|---|
| Entrega 3 | 0 | −1 | **0** | +7,73 |
| Corregida | 0 | −1 | **−8,73** | +7,73 |

## Resultados (Gradient boosting, período de prueba)

| | Antes (FN = USD 0) | Después (FN = USD 8,73) |
|---|---|---|
| Umbral | 0,57 | **0,35** |
| Recargos que se escapan | 47,3% (2.329 de 4.928) | **10,0% (491)** |
| Acierta cuando dice "sin recargo" | 94,2% | **97,3%** |
| Cotizaciones con aviso | 32,5% | 69,3% |
| Precisión | 13,5% | 10,8% |

IC 95% (bootstrap por horas): recargos que se escapan 8,6% a 11,5% (antes 44,3% a 50,1%).

Sensibilidad al costo del FN: USD 4,37 → se escapan 15,5% · USD 8,73 → 10,0% · USD 17,47 → 1,4%.

**Por qué el umbral baja a 0,35:** con FN = 0 conviene avisar si la chance real de recargo supera 11,4%
(1 / 8,73); con FN = 8,73, alcanza con 5,7% (1 / 17,47). El puntaje del modelo está inflado por los pesos de
clase: medido en validación, cerca de 0,57 la tasa real de recargo es 10,8% y cerca de 0,35 es 5,9%.

**Para tener en cuenta:** la reconstrucción del gradient boosting no es idéntica bit a bit a la de la Entrega 3
(mismo PR-AUC 0,1401; umbral con FN = 0 de 0,570 contra 0,572), probablemente por correr en otra máquina.
La comparación antes/después usa las mismas predicciones, así que es justa.

## Archivos

- `costo_falso_negativo.py`: la prueba completa (~1,5 min). Lee el dataset de la Entrega 2 y los
  hiperparámetros de `../6_Resultados/metricas.json`. No modifica nada de la Entrega 3.
- `resultados/`: `escenarios_costo_fn.csv` (cada costo de FN), `modelos_matriz_corregida.csv` (los 4 modelos),
  `otras_reglas.csv` (F2 y recall mínimo 80/90%), `lectura_del_umbral.csv` y `resultados_costo_fn.json`.
- `graficos/`: `figFN1_matriz_corregida_y_escenarios.png` y `figFN2_matrices_antes_despues.png`.

```bash
pip install -r ../3_Codigo/requirements.txt
python costo_falso_negativo.py
```
