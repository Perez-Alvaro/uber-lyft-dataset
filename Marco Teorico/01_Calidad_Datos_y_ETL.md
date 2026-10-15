# GUÍA DE CALIDAD DE DATOS, LIMPIEZA Y PREPROCESAMIENTO (ETL)
**Cátedra:** Ciencia de Datos – UTN FRC  
**Rol del Agente:** Consultor y Desarrollador Experto en Pipelines de Datos y Calidad

---

## 1. Fundamentos de Calidad de Datos
En la cátedra se define que **los datos son de alta calidad cuando se ajustan al propósito previsto (*fit for purpose*) y representan fielmente la realidad del dominio**. 
- Los datos crudos (*raw data*) conducen a información procesable, la cual produce **conocimiento**, transformándose en **sabiduría** al aplicarse en la toma de decisiones.
- Datos de baja calidad generan malas decisiones de negocio y sesgos algorítmicos.
- La evaluación debe ser tanto **subjetiva** (criterio del negocio y expertos) como **objetiva** (métricas numéricas y reglas de validación).

### Las 6 Dimensiones Esenciales de la Calidad de Datos
Al evaluar y limpiar cualquier dataset, el agente **debe auditar y reportar explícitamente estas 6 dimensiones**:
1. **Amplitud / Completitud (*Completeness*):** Evaluar si los campos críticos están presentes o si hay un porcentaje excesivo de valores faltantes (`NaN`, `null`, cadenas vacías).
2. **Coherencia (*Consistency*):** Ausencia de contradicciones lógicas entre variables (ejemplo: edad negativa, fecha de alta posterior a fecha de baja, ingresos discordantes con nivel educativo).
3. **Exactitud (*Accuracy*):** Grado de concordancia entre los valores registrados y los valores reales.
4. **Formato (*Format / Syntactic Validity*):** Cumplimiento de estándares y tipos adecuados (fechas en formato ISO `YYYY-MM-DD`, teléfonos sin caracteres espurios, tipos numéricos parseados correctamente).
5. **Período de Tiempo (*Timeliness / Currency*):** Vigencia temporal de los datos respecto al problema a resolver (datos desactualizados pierden capacidad predictiva).
6. **Integridad (*Integrity*):** Validez relacional, ausencia de registros huérfanos o duplicados innecesarios.

---

## 2. Detección y Tratamiento de Anomalías

### 2.1 Datos Faltantes (Missing Values)
- **Diagnóstico:** Calcular porcentaje de nulos por columna (`df.isnull().mean() * 100`).
- **Estrategias de decisión obligatorias:**
  - Si una columna tiene **> 40-50% de nulos** y no es crítica para el dominio, considerar **eliminación de columna**.
  - Si las filas con nulos representan una fracción insignificante (< 2-3%), considerar **eliminación de filas (`dropna`)**.
  - **Imputación Unidimensional:**
    - Variables numéricas con distribución simétrica/normal: **Media (`mean`)**.
    - Variables numéricas asimétricas o con outliers: **Mediana (`median`)** (robusta ante colas pesadas).
    - Variables categóricas o discretas: **Moda (`mode`)** o creación explícita de la categoría `'DESCONOCIDO'`.
  - **Justificación Obligatoria:** Toda decisión de eliminación o imputación debe quedar registrada y justificada técnica y estadísticamente.

### 2.2 Tratamiento de Outliers (Valores Atípicos)
- **Método del Rango Intercuartílico (IQR - Criterio de Tukey):**
  $$\text{IQR} = Q_3 - Q_1$$
  - Límite inferior: $L_{\text{inf}} = Q_1 - 1.5 \times \text{IQR}$
  - Límite superior: $L_{\text{sup}} = Q_3 + 1.5 \times \text{IQR}$
  - Valores fuera de $[L_{\text{inf}}, L_{\text{sup}}]$ se clasifican como potenciales outliers.
- **Acción:** No eliminar outliers automáticamente sin evaluar el contexto del problema (pueden ser fraudes reales o eventos extremos válidos). Si son errores de carga, aplicar imputación o *capping / winsorizing*.

### 2.3 Tratamiento de Duplicados e Inconsistencias de Texto
- Identificar y remover filas duplicadas (`drop_duplicates()`).
- Normalización de strings: pasaje a minúsculas, eliminación de tildes, trim de espacios en blanco (`strip()`).
- Agrupamiento léxico y clustering de entidades para texto sucio (metodología OpenRefine: Fingerprint, Metaphone o Levenshtein).

---

## 3. Codificación de Variables Categóricas (Categorical Encoding)

### 3.1 One-Hot Encoding (OHE)
- **Concepto:** Convierte cada categoría en una columna binaria independiente (0 ó 1).
- **Cuándo usar:**
  - Variables nominales **sin orden intrínseco** (ejemplo: Estado Civil, Género, Color, Provincia).
  - Problemas lineales, modelos de distancia o árboles.
- **Buenas Prácticas:**
  - Si se utilizan modelos lineales o regresión logística, emplear `drop_first=True` para evitar colinealidad (la trampa de la variable ficticia).
  - Cuidar la explosión de dimensionalidad si la cardinalidad es alta (> 15-20 categorías).

### 3.2 Label / Ordinal Encoding
- **Cuándo usar:**
  - Variables categóricas con jerarquía u orden inherente (ejemplo: Nivel de Estudio: Primario < Secundario < Universitario < Posgrado; Rango de Ingreso: Bajo < Medio < Alto).

---

## 4. Fuentes de Datos Abiertos y Herramientas (Enfoque UTN)
- **Open Data:** Portales recomendados por la cátedra para datasets reales:
  - World Bank Open Data, OMS (WHO), Google Public Data Explorer, AWS Open Data Registry, datos.gob.ar, data.buenosaires.gob.ar, FiveThirtyEight, SNEEP (Sistema Nacional de Estadísticas sobre Ejecución de la Pena).
- **Herramienta complementaria de referencia:** OpenRefine para faceted browsing, transformación de celdas con GREL y conciliación de datos.

---

## 5. Plantilla de Código Python Reutilizable para ETL

```python
import pandas as pd
import numpy as np

def auditar_calidad(df: pd.DataFrame) -> pd.DataFrame:
    """Genera reporte inicial de calidad de datos por variable."""
    reporte = pd.DataFrame({
        'tipo_dato': df.dtypes,
        'conteo_total': len(df),
        'nulos': df.isnull().sum(),
        'pct_nulos': (df.isnull().sum() / len(df) * 100).round(2),
        'valores_unicos': df.nunique()
    })
    return reporte

def detectar_outliers_iqr(df: pd.DataFrame, columna: str):
    """Calcula límites IQR y detecta outliers."""
    q1 = df[columna].quantile(0.25)
    q3 = df[columna].quantile(0.75)
    iqr = q3 - q1
    limite_inf = q1 - 1.5 * iqr
    limite_sup = q3 + 1.5 * iqr
    outliers = df[(df[columna] < limite_inf) | (df[columna] > limite_sup)]
    return limite_inf, limite_sup, len(outliers)

def pipeline_etl_base(df: pd.DataFrame, cols_nominales: list, cols_ordinales: dict = None) -> pd.DataFrame:
    """Aplica pipeline de limpieza base y encoding."""
    df_clean = df.copy()
    
    # 1. Deduplicación
    df_clean = df_clean.drop_duplicates()
    
    # 2. Normalizar textos en columnas object
    for c in df_clean.select_dtypes(include='object').columns:
        df_clean[c] = df_clean[c].astype(str).str.strip().str.lower()
    
    # 3. One Hot Encoding con drop_first para modelos lineales
    if cols_nominales:
        df_clean = pd.get_dummies(df_clean, columns=cols_nominales, drop_first=True, dtype=int)
        
    # 4. Ordinal Encoding
    if cols_ordinales:
        for col, mapeo in cols_ordinales.items():
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].map(mapeo)
                
    return df_clean
```
