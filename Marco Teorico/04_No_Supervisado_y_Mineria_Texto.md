# GUÍA DE APRENDIZAJE NO SUPERVISADO Y MINERÍA DE TEXTO
**Cátedra:** Ciencia de Datos – UTN FRC  
**Rol del Agente:** Especialista en Segmentación (Clustering), Reglas de Asociación y NLP / Minería de Texto

---

## 1. Concepto y Alcance del Aprendizaje No Supervisado
- Se aplica cuando **no existe una variable objetivo (*target*) etiquetada**.
- Su propósito es descubrir agrupamientos naturales, estructuras latentes y patrones de coexistencia o correlación en los datos.
- Principales ramas vistas en la cátedra:
  1. **Clustering (Agrupamiento)**: Particional (K-Means) y Jerárquico.
  2. **Reglas de Asociación**: Algoritmos Apriori y FP-Growth.
  3. **Procesamiento de Lenguaje Natural (PLN / NLP) y Minería de Texto**: Análisis de sentimiento (VADER/Lexicones).

---

## 2. Clustering (Agrupamiento)

### 2.1 K-Means (Particional)
- Agrupa las muestras en $k$ grupos fijados a priori, minimizando la inercia (distancia cuadrática media de cada punto a su centroide asignado).
- **Inercia (*Within-Cluster Sum of Squares - WCSS*):**
  $$\text{WCSS} = \sum_{j=1}^{k} \sum_{x_i \in C_j} ||x_i - \mu_j||^2$$
  Accesible en Scikit-Learn mediante `model.inertia_`.
- **Determinación del $k$ Óptimo:**
  1. **Método del Codo (*Elbow Method*):** Graficar WCSS vs $k$. El punto de inflexión donde la ganancia marginal de inercia se aplana indica el $k$ candidato.
  2. **Coeficiente de Silueta (*Silhouette Score*):** Métrica complementaria superior. Mide qué tan cerca está cada muestra de los puntos de su propio cluster ($a$) comparado con el cluster más cercano ($b$):
     $$s = \frac{b - a}{\max(a, b)}$$
     - Rango de $-1$ a $+1$.
     - Valores cercanos a $+1$ indican asignación excelente y clusters bien separados.
     - Valores cercanos a $0$ indican solapamiento.
     - Valores negativos indican mala asignación de clusters.
     - **Análisis de perfil de silueta:** Se busca un valor promedio alto y siluetas con espesor parejo entre grupos.

### 2.2 Agrupamiento Jerárquico (*Hierarchical Clustering*)
- Algoritmo aglomerativo (bottom-up) que genera una jerarquía en forma de árbol (**Dendrograma**).
- No requiere especificar $k$ de antemano; el corte del dendrograma define el número de grupos.
- Métodos de enlace (*linkage*): `'ward'` (minimiza varianza), `'complete'` (distancia máxima), `'average'`.

---

## 3. Reglas de Asociación: Apriori vs FP-Growth
Utilizadas comúnmente en análisis de canasta de mercado (*Market Basket Analysis*).

### 3.1 Métricas Clave de una Regla $X \rightarrow Y$:
- **Soporte (*Support*):** Frecuencia con la que el conjunto de ítems $X \cup Y$ aparece en el total de transacciones:
  $$\text{Support}(X \rightarrow Y) = \frac{\text{Transacciones con } X \text{ e } Y}{\text{Total de Transacciones}}$$
- **Confianza (*Confidence*):** Certeza condicional de que si se compra $X$, también se compre $Y$:
  $$\text{Confidence}(X \rightarrow Y) = \frac{\text{Support}(X \cup Y)}{\text{Support}(X)}$$
- **Lift:** Fuerza de la regla sobre la ocurrencia aleatoria e independiente:
  $$\text{Lift}(X \rightarrow Y) = \frac{\text{Confidence}(X \rightarrow Y)}{\text{Support}(Y)}$$
  ($\text{Lift} > 1$ indica asociación positiva; $= 1$ independencia; $< 1$ sustitución).

### 3.2 Comparativa Directa exigida por la Cátedra:
| Criterio | Algoritmo Apriori | Algoritmo FP-Growth (*Frequent Pattern*) |
|---|---|---|
| **Estrategia** | Generación iterativa de candidatos (*candidate generation*) | Construcción de estructura compacta en árbol (**FP-Tree**) |
| **Escaneos de Dataset** | Múltiples pasadas por la base de datos para cada tamaño $k$ | **Solo 2 escaneos** de la base de datos |
| **Uso de Memoria** | Alto consumo (explosión combinatoria de candidatos) | Eficiente y compacto en memoria |
| **Velocidad** | Lento en grandes volúmenes de datos | **Mucho más rápido** en datasets dispersos y masivos |

---

## 4. Minería de Texto y Análisis de Sentimiento
- Extracción de información estructurada a partir de texto libre utilizando PLN.
- **Preprocesamiento típico:** Tokenización, remoción de signos de puntuación, stopwords (palabras vacías) y lematización/stemming.
- **Análisis de Sentimiento Basado en Léxicos (VADER en NLTK):**
  - Evalúa la valencia emocional de palabras considerando intensificadores, negaciones y signos de puntuación.
  - Métricas de salida: `pos`, `neu`, `neg`, y `compound` (puntuación normalizada de $-1$ a $+1$):
    - Positivo: `compound >= 0.05`
    - Neutro: `-0.05 < compound < 0.05`
    - Negativo: `compound <= -0.05`

---

## 5. Script Reutilizable para K-Means y Minería de Texto

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer

def evaluar_elbow_y_silhouette(X, k_range=range(2, 9)):
    """Calcula inercia y silhouette scores para determinar el k óptimo."""
    inertias = []
    silhouettes = []
    
    for k in k_range:
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X)
        inertias.append(km.inertia_)
        silhouettes.append(silhouette_score(X, km.labels_))
        
    fig, ax1 = plt.subplots(figsize=(8, 4))
    ax1.plot(k_range, inertias, 'bo-', label='Inercia (Elbow)')
    ax1.set_xlabel('Número de Clusters (k)')
    ax1.set_ylabel('Inercia (WCSS)', color='b')
    
    ax2 = ax1.twinx()
    ax2.plot(k_range, silhouettes, 'r*--', label='Silhouette Score')
    ax2.set_ylabel('Silhouette Score', color='r')
    plt.title('Método del Codo y Coeficiente de Silueta')
    plt.show()

def analizar_sentimientos_vader(textos: list):
    """Analiza una lista de textos con el lexicón VADER de NLTK."""
    nltk.download('vader_lexicon', quiet=True)
    sia = SentimentIntensityAnalyzer()
    resultados = []
    for t in textos:
        scores = sia.polarity_scores(str(t))
        compound = scores['compound']
        cat = 'Positivo' if compound >= 0.05 else ('Negativo' if compound <= -0.05 else 'Neutro')
        resultados.append({'texto': t, 'compound': compound, 'clasificacion': cat, **scores})
    return resultados
```
