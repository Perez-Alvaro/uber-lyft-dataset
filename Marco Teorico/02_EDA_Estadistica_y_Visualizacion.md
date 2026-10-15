# GUÍA DE ANÁLISIS EXPLORATORIO DE DATOS (EDA) Y ESTADÍSTICA
**Cátedra:** Ciencia de Datos – UTN FRC  
**Rol del Agente:** Consultor en Análisis Exploratorio, Inferencia Descriptiva y Selección de Gráficos

---

## 1. Objetivos del Análisis Exploratorio de Datos (AED / EDA)
El AED es el paso obligatorio previo a cualquier modelado de Machine Learning.
Sus objetivos fundamentales según el marco teórico de la cátedra son:
1. Comprender la estructura, tipos de variables y dimensiones del conjunto de datos.
2. Identificar relaciones, asociaciones y correlaciones entre variables.
3. Detectar anomalías, patrones atípicos y distribuciones subyacentes.
4. Generar hipótesis de negocio y definir el enfoque de preprocesamiento o modelado.

---

## 2. Marco Estadístico Esencial

### 2.1 Medidas de Posición (Tendencia Central)
- **Media Aritmética ($\bar{x}$):**
  $$\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$$
  Sensible a valores extremos (outliers).
- **Mediana ($\tilde{x}$ o $Q_2$):** Valor central ordenado. Si $n$ es impar, es el dato central; si $n$ es par, es el promedio de los dos centrales. Es la medida robusta por excelencia para distribuciones sesgadas.
- **Moda:** Valor de mayor frecuencia absoluta. Aplica a variables numéricas discretas y categóricas.

### 2.2 Medidas de Dispersión
- **Varianza ($s^2$ o $\sigma^2$):** Promedio de las desviaciones al cuadrado respecto a la media.
- **Desviación Estándar ($s$ o $\sigma$):** Raíz cuadrada de la varianza. Expresada en la misma unidad que la variable original.
- **Rango Intercuartílico ($\text{IQR}$):** Diferencia entre el percentil 75 ($Q_3$) y el percentil 25 ($Q_1$). No se ve afectado por extremos.

---

## 3. Guía de Visualización y Lectura de Gráficos

### 3.1 Anatomía e Interpretación del Boxplot (Diagrama de Caja)
El boxplot es la herramienta primaria exigida por la cátedra para estudiar la distribución univariada:
- **Línea central en la caja:** Mediana ($Q_2$).
- **Límites de la caja:** Cuartil 1 ($Q_1$) y Cuartil 3 ($Q_3$).
- **Altura de la caja:** Rango Intercuartílico ($\text{IQR} = Q_3 - Q_1$), conteniendo el 50% central de las observaciones.
- **Bigotes (Whiskers):** Se extienden hasta el dato más lejano dentro de $[Q_1 - 1.5\text{IQR}, Q_3 + 1.5\text{IQR}]$.
- **Puntos aislados:** Candidatos a outliers (más allá de $1.5\text{IQR}$).
- **Interpretación del sesgo:**
  - Si la mediana está más cerca de $Q_1$ y el bigote superior es más largo $\rightarrow$ Asimetría positiva (sesgo a la derecha).
  - Si la mediana está más cerca de $Q_3$ y el bigote inferior es más largo $\rightarrow$ Asimetría negativa (sesgo a la izquierda).
  - Si la mediana está centrada y los bigotes son iguales $\rightarrow$ Distribución simétrica (aproximadamente normal).

### 3.2 Errores Habituales de Visualización (Criterios de la Cátedra)
- Utilizar gráficos de torta/circular con más de 3 o 4 categorías (preferir gráficos de barras horizontales ordenadas).
- Truncar el eje Y en gráficos de barras (distorsiona la proporción visual de magnitudes).
- Graficar variables temporales con gráficos de dispersión sin líneas de tendencia.
- Saturar visualizaciones con elementos decorativos (*chartjunk*) que oscurezcan el insight.

---

## 4. Reducción de Dimensionalidad e Ingeniería de Características en EDA

### 4.1 Feature Engineering (Ingeniería de Características)
Proceso de utilizar el conocimiento de dominio para transformar y crear variables:
- **Combinación de atributos:** Crear ratios de negocio (ej. $\text{IMC} = \frac{\text{peso}}{\text{altura}^2}$, Deuda/Ingreso, Ticket Promedio).
- **Extracción temporal:** Extraer de fechas componentes como día de la semana, mes, fin de semana, franja horaria.
- **Binning / Discretización:** Agrupar variables continuas en intervalos (ej. grupos etarios: Jóvenes, Adultos, Mayores).

### 4.2 Reducción de Dimensionalidad: PCA (Principal Component Analysis)
- **Concepto:** Técnica no supervisada que transforma variables numéricas correlacionadas en un nuevo conjunto de ejes ortogonales (no correlacionados) denominados **Componentes Principales**.
- **Propósito:**
  1. Mitigar la *maldición de la dimensionalidad*.
  2. Permitir visualización en 2D o 3D de datasets multivariados.
  3. Reducir ruido y redundancia colineal antes del modelado.
- **Requisito Crítico:** PCA es sensible a la escala. **Siempre se debe estandarizar** (`StandardScaler`: media 0, varianza 1) antes de aplicar PCA.
- **Métrica Clave:** **Ratio de Varianza Explicada Acumulada** (`explained_variance_ratio_.cumsum()`). Se busca retener el número de componentes que expliquen entre el 80% y 95% de la varianza total.

---

## 5. Script Reutilizable para EDA Automatizado y PCA

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

def reporte_estadistico_eda(df: pd.DataFrame, num_cols: list):
    """Calcula métricas de tendencia central y dispersión completas."""
    resumen = []
    for col in num_cols:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        resumen.append({
            'variable': col,
            'media': df[col].mean(),
            'mediana': df[col].median(),
            'desv_estandar': df[col].std(),
            'varianza': df[col].var(),
            'iqr': q3 - q1,
            'skewness': df[col].skew()
        })
    return pd.DataFrame(resumen)

def matriz_correlacion(df: pd.DataFrame, num_cols: list):
    """Grafica mapa de calor de correlaciones Pearson."""
    plt.figure(figsize=(10, 8))
    corr = df[num_cols].corr()
    sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1)
    plt.title('Matriz de Correlación de Pearson')
    plt.tight_layout()
    plt.show()

def aplicar_pca_visualizacion(df: pd.DataFrame, feature_cols: list, label_col: str = None, n_comp: int = 2):
    """Estandariza, aplica PCA y evalúa la varianza explicada."""
    X = df[feature_cols].dropna()
    
    # 1. Estandarización obligatoria
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 2. PCA
    pca = PCA(n_components=n_comp)
    X_pca = pca.fit_transform(X_scaled)
    
    var_exp = pca.explained_variance_ratio_
    print(f"Varianza explicada por componente: {var_exp}")
    print(f"Varianza acumulada total: {var_exp.sum():.4f}")
    
    # 3. Graficación 2D
    plt.figure(figsize=(8, 6))
    if label_col and label_col in df.columns:
        sns.scatterplot(x=X_pca[:, 0], y=X_pca[:, 1], hue=df.loc[X.index, label_col], palette='viridis')
    else:
        plt.scatter(X_pca[:, 0], X_pca[:, 1], alpha=0.7)
    plt.xlabel(f'PC1 ({var_exp[0]*100:.1f}% var)')
    plt.ylabel(f'PC2 ({var_exp[1]*100:.1f}% var)')
    plt.title('Proyección 2D mediante PCA')
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    plt.show()
    return pca, X_pca
```
