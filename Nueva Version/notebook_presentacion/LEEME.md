# Notebook de la presentación – Entrega 2 (Grupo 11)

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Perez-Alvaro/uber-lyft-dataset/blob/main/Nueva%20Version/notebook_presentacion/notebook_graficos_entrega_2.ipynb)

`notebook_graficos_entrega_2.ipynb` es el soporte de la presentación oral (sin diapositivas). Tiene el orden de exposición para 5 minutos (50 s por integrante), los textos de cada parte, una tabla resumen, **18 gráficos** (10 para la exposición y 8 de respaldo), las pautas para la Entrega 3 y las preguntas probables de la defensa.

| Tiempo | Orador | Tema | Gráficos |
|:-:|---|---|:-:|
| 0:00 – 0:50 | Álvaro Pérez | Apertura: dataset, dos preguntas y resultado de la limpieza | Tabla resumen · 01 |
| 0:50 – 1:40 | Juan Ignacio Cremona | Nulos | 02 |
| 1:40 – 2:30 | Ignacio Gil | Selección de columnas, hora UTC y variables nuevas | 03 – 04 |
| 2:30 – 3:20 | Federico Gon | Copias, distancias imposibles y precios extremos | 05 – 06 |
| 3:20 – 4:10 | Sofía Medina | Las dos variables a predecir | 07 – 08 |
| 4:10 – 5:00 | Facundo Dagnino Dailly | Qué explica el recargo, pautas y cierre | 09 – 10 |

Los gráficos 11 a 18 son de respaldo, para responder preguntas.

**Ya viene ejecutado:** al abrirlo se ven los gráficos sin correr nada. También están sueltos en `graficos/`.

## Cómo ejecutarlo en Colab
1. Tocar el botón **Abrir en Colab** de arriba (o abrirlo desde GitHub con Colab).
2. **Entorno de ejecución → Ejecutar todas**.
3. Si aparece el aviso *"Este notebook no fue creado por Google"*, elegir **Ejecutar de todos modos**.

La primera celda de datos descarga del repositorio el dataset original y el final (unos 115 MB). En Colab tarda alrededor de un minuto. No hace falta instalar nada.

## Cómo ejecutarlo en la compu (VS Code o Jupyter)
1. Una sola vez, en una terminal abierta en esta carpeta: `pip install -r requirements.txt`
2. **VS Code:** abrir el `.ipynb` → *Select Kernel* (arriba a la derecha) → elegir ese Python → **Run All**.
   **Jupyter:** `jupyter notebook notebook_graficos_entrega_2.ipynb` → *Run → Run All Cells*.

La primera vez descarga los datos en la carpeta `datos/`; las siguientes los reutiliza.

## Notas
- La celda de preparación rehace la limpieza sobre el CSV original y **verifica** que dé exactamente las 636.568 filas del dataset final; si no coincide, se detiene con error.
- La letra es Calibri si está instalada (con Word o Windows). Si no está, por ejemplo en Colab, descarga **Carlito**, una fuente libre con las mismas medidas, para que los gráficos se vean igual.
- Sin internet: copiar `rideshare_kaggle.csv` y `dataset_nueva_columna.csv` (están en los .zip del repo) dentro de `datos/`.
