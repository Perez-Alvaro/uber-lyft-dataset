# Explicación de la Entrega 2 — Limpieza y preparación de datos (ETL)

Resumen para que todo el grupo tenga la misma idea de qué se hizo. El detalle completo está en el informe y en el notebook de la Entrega 2.

## 1. Qué hay nuevo en el repo
| Archivo | Qué es |
|---|---|
| `Nueva Version/CSV Nueva Columna/dataset_nueva_columna.zip` | **Dataset final** limpio, con la nueva columna `has_surge` (636.568 filas × 27 columnas). Va en .zip porque el CSV pesa 126 MB y GitHub no acepta más de 100 MB. |
| `Nueva Version/notebook_presentacion/` | **Notebook de la defensa oral** (5 min), listo para abrir en Colab desde GitHub: orden por integrante, tabla resumen, 18 gráficos y preguntas probables. |
| `README.md` | Actualizado con el segundo objetivo, el pipeline y cómo usar el dataset. |
| `Explicacion_Entrega_2.md` | Este archivo. |

`limpiar_dataset.py` y `feature_engineering.py` no se modificaron. El segundo es una exploración anterior (ver punto 2).

## 2. El cambio principal: un segundo objetivo
La cátedra pidió una segunda variable a predecir. Quedaron dos:

| | Objetivo 1 | Objetivo 2 (nuevo) |
|---|---|---|
| Variable | `price` | `has_surge` |
| Pregunta | ¿Cuánto cuesta el viaje? | ¿El viaje tiene recargo por demanda? |
| Tipo | Regresión | Clasificación binaria |
| Datos | Uber + Lyft | **Solo Lyft, sin Shared** (255.953 viajes, 8,19% con recargo) |

**`has_surge` = 1 si `surge_multiplier` > 1; si no, 0.** Por qué así:
- **Solo Lyft:** Uber muestra siempre ×1 (en sus 385.663 registros), así que no sirve.
- **Sin Shared:** Lyft Shared nunca tiene recargo (0 de 51.233); solo agregaría ceros.
- **Sí/no y no el multiplicador:** los valores altos casi no existen (×2,5: 154 casos; ×3: 12).
- **Por qué vale la pena:** con recargo, el mismo viaje cuesta en promedio un **46% más**.
- **Descartado:** `is_surge` (en `feature_engineering.py`) infería el recargo de Uber a partir del precio por milla. Probada sobre Lyft, cuando marca recargo acierta solo el 61% de las veces, así que no es confiable.

## 3. Qué limpiamos
| Problema | Qué hicimos | Filas |
|---|---|---|
| Taxi no tiene ningún precio (100% vacío) | Eliminar Taxi | −55.095 |
| Copias de una misma cotización | Eliminar | −1.060 |
| Distancias imposibles (< 0,1 mi entre zonas distintas, solo Uber) | Eliminar | −348 |
| Precios muy altos (outliers) | **Conservar**: el 85% se explica por recargo o distancia | 0 |
| **Resultado** | | **693.071 → 636.568** (92%) |

**Trampas del dataset original que corregimos:**
- **La hora estaba en UTC** (hora de Londres), no en hora de Boston: `hour`, `day` y `datetime` estaban corridos 5 horas. Recalculamos la hora local.
- **El clima no es el de la zona del viaje:** hay un solo registro de clima por hora, de una zona cualquiera. Lo usamos como clima de la ciudad por hora.
- **`latitude`/`longitude` no son del viaje**, sino del registro de clima. Se eliminaron.
- **Faltan días:** hay datos en 18 de 24 fechas. Ojo con conclusiones por día de la semana.

## 4. Columnas: de 57 a 27
- **Se sacaron 41:** 31 de clima repetido o sin relación con la tarifa (máximos/mínimos diarios, sus horarios, sensación térmica, ozono, etc.), 6 de tiempo en UTC (`timestamp`, `datetime`, `hour`, `day`, `month`, `timezone`), 2 coordenadas del clima y 2 copias (`visibility.1`, `product_id`).
- **Se conservaron 16 originales:** `id`, `cab_type`, `name`, `source`, `destination`, `distance`, `surge_multiplier`, `price` y 8 de clima (`temperature`, `humidity`, `windSpeed`, `visibility`, `precipIntensity`, `cloudCover`, `pressure`, `short_summary`).
- **Se agregaron 11 nuevas:**

| Variable | Cómo se crea |
|---|---|
| `datetime_local` | `timestamp` (UTC) convertido a hora de Boston (UTC − 5 h) |
| `hour_local` | Hora de `datetime_local` (0–23) |
| `day_of_week` | Día de la semana (0 = lunes … 6 = domingo) |
| `is_weekend` | 1 si es sábado o domingo |
| `time_slot` | Franja: Madrugada (0–5), Mañana (6–11), Tarde (12–17), Noche (18–23) |
| `is_rush_hour` | 1 si es día hábil entre 7–9 h o 16–19 h |
| `is_dark` | 1 si es antes del amanecer o después del atardecer (`sunriseTime`/`sunsetTime`) |
| `is_raining` | 1 si `precipIntensity` > 0 |
| `service_tier` | Nivel equivalente entre plataformas: Compartido, Estándar, XL, Premium, Black, Black XL |
| `straight_line_miles` | Distancia en línea recta entre las zonas de origen y destino (coordenadas de **OpenStreetMap**, fuente externa) |
| `has_surge` | 1 si `surge_multiplier` > 1 (**objetivo 2**) |

## 5. Lo que ya muestran los datos
- **Precio:** el tipo de viaje explica el 77% y la distancia el 12%; juntos, el 92%. El clima y la hora casi no influyen.
- **Recargo:** depende sobre todo de la zona (Back Bay 13% vs North End 2%). La hora lo mueve poco (7%–10%) y la lluvia no lo cambia.

## 6. Cómo usar el dataset en la Entrega 3
1. **Para `price`:** todas las filas. `id` y `datetime_local` no son predictoras. Conviene modelar `log(price)`.
2. **Para `has_surge`:** filtrar `cab_type == "Lyft"` y `name != "Shared"`, y **no usar `price` ni `surge_multiplier`**: ya contienen la respuesta (fuga de datos).
3. **Validar agrupando por fecha:** los viajes de la misma ruta y minuto comparten el recargo; si se mezclan al azar, las métricas salen infladas.
4. Para `has_surge`, medir con PR-AUC, recall y F1 (no accuracy): decir siempre "no" ya acierta el 92%.
