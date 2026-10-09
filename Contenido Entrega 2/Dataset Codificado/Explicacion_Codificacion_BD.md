# Codificación de Variables Categóricas
**Base de datos codificada** · Grupo 11 · Ciencia de Datos 5K1 · Uber y Lyft (Boston)

---

## 1. Por qué codificar
Los modelos (regresión, clasificación, PCA) solo trabajan con números. El dataset limpio con `has_surge` tenía 7 columnas de texto, entre ellas las que describen los servicios de Uber y Lyft (`cab_type`, `name` y `service_tier`). Sin codificarlas no se pueden usar como predictoras.

Se partió de `dataset_nueva_columna.csv` (636.568 filas × 27 columnas) y se reemplazó cada columna de texto por su versión numérica, con la técnica adecuada a su tipo de dato.

---

## 2. Qué se hizo con cada columna

| Columna original | Valores | Técnica | Resultado |
| :--- | :--- | :--- | :--- |
| `cab_type` | Uber, Lyft | Binaria (0/1) | `is_uber` (1 = Uber, 0 = Lyft) |
| `name` (servicio) | 12 productos | One Hot Encoding | 12 columnas `name_*` |
| `service_tier` | 6 niveles | Ordinal Encoding | `service_tier_ord` (0 a 5) |
| `time_slot` | 4 franjas | One Hot Encoding | 4 columnas `time_slot_*` |
| `source` | 12 zonas | One Hot Encoding | 12 columnas `source_*` |
| `destination` | 12 zonas | One Hot Encoding | 12 columnas `destination_*` |
| `short_summary` | 9 climas | One Hot Encoding | 9 columnas `short_summary_*` |

**Criterio:**
- Si la variable **no tiene orden** (productos, zonas, clima, franja): se usa **One Hot Encoding** (una columna por categoría con 1 o 0).
- Si tiene un **orden natural** (nivel de servicio): se usa **Ordinal Encoding** (un solo número que respeta ese orden).
- Si tiene **solo dos valores**: alcanza con una columna binaria 0/1.

---

## 3. Los servicios de Uber y Lyft

### `name` → One Hot Encoding
Cada cotización pasa a tener 12 columnas `name_*` y vale `1` solo la de su producto. Por ejemplo, un viaje en *Lux* queda con `name_Lux = 1` y las otras 11 en `0`. No se usó un número del 1 al 12 porque el modelo interpretaría un orden falso (que «Lux» es mayor que «UberX»).

### `service_tier` → Ordinal Encoding
Agrupa los servicios equivalentes de ambas plataformas en 6 niveles. Como el nivel sí tiene orden (el precio medio sube de forma escalonada), se codificó de 0 a 5:

| `service_tier_ord` | Nivel | Uber | Lyft | Precio medio |
| :---: | :--- | :--- | :--- | :---: |
| **0** | Compartido | UberPool | Shared | US$ 7,44 |
| **1** | Estándar | UberX, WAV | Lyft | US$ 9,72 |
| **2** | XL | UberXL | Lyft XL | US$ 15,51 |
| **3** | Premium | — | Lux | US$ 17,77 |
| **4** | Black | Black | Lux Black | US$ 21,76 |
| **5** | Black XL | Black SUV | Lux Black XL | US$ 31,27 |

### `cab_type` → Binaria
Con dos valores basta una columna: `is_uber`. Es lo mismo que aplicar One Hot Encoding y quitar una de las dos columnas, que sería redundante.

---

## 4. Cómo se hizo
Con `pandas`, en el script `codificar_bd.py` (incluido en la carpeta). Lo esencial:

```python
df["is_uber"] = (df["cab_type"] == "Uber").astype(int)
orden = {
    "Compartido": 0,
    "Estándar": 1,
    "XL": 2,
    "Premium": 3,
    "Black": 4,
    "Black XL": 5,
}
df["service_tier_ord"] = df["service_tier"].map(orden)
df = pd.get_dummies(
    df,
    columns=["name", "time_slot", "source", "destination", "short_summary"],
    dtype=int,
)
```

Antes de codificar se quitaron los espacios sobrantes de `short_summary` (venía como `" Rain "`). Se verificó que no cambió la cantidad de filas, que no hay nulos, que en cada grupo One Hot hay exactamente un 1 por fila y que `is_uber` coincide con los productos de Uber.

---

## 5. Resultado
- **636.568 filas** (sin cambios) y **71 columnas** (antes 27). Las columnas nuevas son todas 0/1, salvo `service_tier_ord`.
- Todas las columnas son numéricas excepto `id` y `datetime_local`, que no se codifican porque no son predictoras (identificador y fecha para separar los datos por día).
- **Archivos:** `dataset_codificado.csv`, su versión comprimida `dataset_codificado.zip` y `codificar_bd.py`.

---

## 6. Consideraciones para la próxima etapa (Entrega 3)

### Sobre la codificación
- **No usar juntas las tres codificaciones del servicio:** `name` ya determina `is_uber` y `service_tier_ord`. Elegir `name_*` (más detalle) o `is_uber` + `service_tier_ord` (más compacto).
- **Regresión lineal:** quitar una columna de cada grupo One Hot (`drop_first=True`), porque sus columnas suman siempre 1 (multicolinealidad perfecta). En modelos basados en árboles no hace falta.
- **Escalar antes de PCA o de modelos basados en distancias:** las columnas 0/1 conviven con otras de escala muy distinta (`pressure` ronda los 1.000 hPa). Sin estandarizar (`StandardScaler`), las variables más grandes dominarían el resultado.

### Sobre los modelos
- **Modelo de `price`:** usar $\log(\text{price})$ por la asimetría (los atípicos son precios reales) y entrenar con y sin `surge_multiplier` para medir cuánto aporta.
- **Modelo de `has_surge`:** filtrar `is_uber == 0` y `name_Shared == 0`, y excluir `price` y `surge_multiplier` (fuga de datos). Solo el 8,19% tiene recargo: evaluar con recall, F1 o AUC, no con exactitud (*accuracy*).
- **Validación por fecha:** las filas no son independientes (comparten el recargo por ruta y minuto). Separar entrenamiento y prueba por día con `datetime_local`, no al azar, para no obtener resultados sesgados u optimistas.
