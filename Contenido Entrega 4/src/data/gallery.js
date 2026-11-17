// Gráficos originales de las entregas anteriores (copiados a public/graficos)
const g = (file, entrega, titulo) => ({ id: file.replace('.png', ''), src: `${import.meta.env.BASE_URL}graficos/${file}`, entrega, titulo })

export const GALERIA = [
  g('surge_active_insights.png', 1, '¿Qué explica el recargo en Lyft? Primeros insights'),
  g('insights_1.png', 1, 'Shared nunca tiene recargo'),
  g('insights_2.png', 1, 'La zona de origen cambia el recargo hasta 7 veces'),
  g('insights_3.png', 1, 'Clima y hora: correlación prácticamente nula'),
  g('insights_4.png', 1, 'Lo que predice es la ruta, no el clima'),

  g('01_filas_antes_despues.png', 2, 'De 693.071 a 636.568 filas: se conserva el 91,8%'),
  g('02_nulos_antes_despues.png', 2, 'Los nulos eran todos de Taxi: al sacarlo, el dataset queda sin nulos'),
  g('03_columnas_antes_despues.png', 2, 'Columnas antes y después: de 57 a 27'),
  g('04_correlacion_clima_antes_despues.png', 2, 'Clima: de 36 variables que repetían información a 7 casi independientes'),
  g('05_distancias_imposibles.png', 2, 'Las 348 distancias eliminadas eran imposibles'),
  g('06_precio_por_producto.png', 2, 'La categoría de servicio ordena el precio: de USD 7 a USD 30'),
  g('07_peso_de_cada_factor.png', 2, 'Producto y distancia explican casi todo el precio'),
  g('08_recargo_distribucion.png', 2, 'Siete valores de multiplicador → una variable binaria has_surge'),
  g('09_recargo_por_zona.png', 2, 'El recargo se concentra en algunas zonas de origen'),
  g('10_precio_con_y_sin_recargo.png', 2, 'Con recargo, el mismo viaje cuesta bastante más'),
  g('11_cobertura_temporal.png', 2, 'Cobertura por fecha y por hora local'),
  g('12_coordenadas_clima_vs_zonas.png', 2, 'Las coordenadas son de la zona, no del viaje'),
  g('13_precio_distribucion.png', 2, 'El precio es asimétrico; en escala logarítmica se acerca a la simetría'),
  g('14_recargo_uber_vs_lyft.png', 2, 'Uber nunca informa el recargo'),
  g('15_recargo_por_producto.png', 2, 'Lyft Shared nunca tiene recargo'),
  g('16_precio_vs_distancia_por_nivel.png', 2, 'A igual distancia: Lyft más barato en económicos, Uber en Black'),
  g('17_clima_vs_objetivos.png', 2, 'El clima no se relaciona con el precio ni con el recargo'),
  g('18_recargo_por_hora.png', 2, 'El recargo a lo largo del día'),

  g('fig01_precio_real_vs_predicho.png', 3, 'Precio real vs predicho y error por producto'),
  g('fig02_precio_importancia_y_tarifas.png', 3, 'Importancia en el precio y tarifas aprendidas'),
  g('fig03_recargo_validacion_profundidad.png', 3, 'A mayor profundidad, el árbol empieza a memorizar'),
  g('fig04_recargo_balanceo.png', 3, 'Técnicas de balanceo y recall'),
  g('fig05_recargo_matrices_confusion.png', 3, 'Matrices de confusión de los modelos finales'),
  g('fig06_recargo_matriz_beneficio.png', 3, 'Matriz de beneficio y elección del umbral'),
  g('fig07_recargo_curvas_roc_pr.png', 3, 'Curvas ROC y Precisión-Recall'),
  g('fig08_recargo_importancia_odds_ratio.png', 3, 'Importancia y odds ratio del recargo'),
  g('fig09_recargo_arbol_reglas.png', 3, 'Las primeras reglas del árbol: la ruta decide'),
  g('fig10_recargo_deciles_riesgo.png', 3, 'El 20% de mayor riesgo concentra el 34,9% de los recargos'),
  g('fig11_productos_kmeans.png', 3, 'K-Means: 12 productos en 3 familias de tarifa'),
]

export const findImg = (id) => GALERIA.findIndex((x) => x.id === id)
