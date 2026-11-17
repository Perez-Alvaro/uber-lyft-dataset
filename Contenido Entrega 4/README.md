# Entrega 4 · Presentación final (Data Storytelling)

Presentación web tipo diapositivas para la defensa de hasta 10 minutos (guion estimado: 8:41): 27 slides (una idea por slide, todas con gráfico o animación) más 1 de anexo con preguntas probables. Tema claro por defecto.

**Hilo conductor: el recorrido por las 4 entregas.** La barra de progreso de abajo muestra en qué entrega estamos y cada slide indica de qué entrega viene su contenido. La slide 2 muestra cómo la pregunta de la Entrega 1 (solo el precio) se partió en dos variables en la Entrega 2.

**Las dos variables tienen color propio en toda la presentación:**
- **Verde · Precio:** parte estructural, regresión.
- **Ámbar · Recargo:** parte dinámica, clasificación.

Arriba a la derecha de cada slide hay un distintivo que dice a qué variable se refiere.

| Entrega | Slides | Ejes de la cátedra que cubre |
|---|---|---|
| E1 · Dominio | 3–7 | Introducción al dominio |
| E2 · ETL y exploración | 8–17 | Qué predecimos · Algo importante del ETL · Hallazgos |
| E3 · Modelado | 18–22 | Qué modelos usamos |
| E4 · Valor y cierre | 23–27 | Qué valor ofrecemos · Hipótesis · Conclusión |

Los gráficos originales de las entregas 1 a 3 aparecen **dentro de la slide** donde se habla de ellos (clic para ampliar).

## Cómo correrla

```bash
cd "Contenido Entrega 4"
npm install      # solo la primera vez
npm run dev      # abre http://localhost:5173
```

Para generar una versión estática (por ejemplo, para llevarla en un pendrive): `npm run build`. Se genera en `dist/` y se previsualiza con `npm run preview`.
Las fuentes están incluidas en el proyecto, así que la presentación funciona sin internet.

## Durante la presentación

| Tecla | Acción |
|---|---|
| → · Espacio · PgDn | Siguiente (también con un presentador inalámbrico) |
| ← · PgUp | Anterior |
| **P** | Abre el **modo presentador** en otra ventana: guion de cada slide, cronómetro con el tiempo objetivo, próxima slide. Las dos ventanas están sincronizadas |
| F | Pantalla completa |
| O | Vista general de todas las slides |
| T | Cambiar entre tema claro y oscuro |
| B | Ocultar o mostrar la barra inferior |

Parámetros de URL útiles: `?oscuro` fuerza el tema oscuro y `?estatico` desactiva las animaciones (sirve si la computadora es lenta).

Sugerencia para el día de la defensa: proyectar la ventana principal en pantalla completa (F) y tener abierta en la notebook la ventana del presentador (P).

## Slides interactivas

- **Slide 14 · Uber vs Lyft:** comparador por nivel de servicio y distancia, con las tarifas que aprendió el random forest.
- **Slide 21 · Modelos de recargo:** comparación de validación (para elegir), comparación de la prueba final y curvas Precisión-Recall de los 4 modelos.
- **Slide 24 · Umbral:** control deslizante del umbral de decisión. El gráfico y el ahorro neto se actualizan con las 59.395 predicciones reales de la prueba. Un celular ilustra el ahorro por aviso correcto para el pasajero.

## De dónde salen los datos

Todos los números vienen del repositorio. No hay valores inventados.

- `src/data/metrics.js`: métricas de `Contenido Entrega 3/6_Resultados/metricas.json`, de los CSV de esa carpeta y de los gráficos de la Entrega 2. Las cifras corregidas siguen la sección 11 de `Contexto.md`.
- `src/data/curvas.json`: curvas ROC/PR y beneficio por umbral, calculados a partir de `recargo_predicciones_test.csv` con `scripts/generar_curvas.py`. En el umbral 0,5722 reproduce exactamente VP 2.534, FP 16.265 y +USD 56,11.
- `src/data/tarifas.json`: `precio_curvas_tarifa.csv` (tarifa predicha sin recargo por producto y distancia).
- `public/graficos/`: copias de los PNG de `Contenido Entrega 1`, `Contenido Entrega 2/graficos` y `Contenido Entrega 3/5_Graficos`.
- Las posiciones de las zonas en el mapa son aproximadas (centros de OpenStreetMap).

Para regenerar las curvas:

```bash
python3 scripts/generar_curvas.py "../Contenido Entrega 3/6_Resultados/recargo_predicciones_test.csv" src/data/curvas.json
```

## Estructura

```
src/
  App.jsx            motor de la presentación (teclado, escala, ampliar gráficos, vista general)
  Presenter.jsx      ventana del presentador (guion + cronómetro)
  slides.jsx         las 28 slides y el guion oral de cada una
  components/charts.jsx  gráficos SVG propios
  data/              métricas, curvas, tarifas y lista de gráficos
  styles.css         tema claro/oscuro y animaciones
```
