# GUÍA DE MODELOS SUPERVISADOS: CLASIFICACIÓN, AJUSTE Y BALANCEO
**Cátedra:** Ciencia de Datos – UTN FRC  
**Rol del Agente:** Especialista en Modelado Predictivo, Optimización de Hiperparámetros y Métricas de Clasificación

---

## 1. Distinción Teórica: Regresión vs Clasificación
- **Variables Cuantitativas (Numéricas):** Valores continuos o discretos (ej. salario, precio, edad, tiempo). El modelado predictivo correspondiente es **Regresión** (ej. Regresión Lineal, evaluada por $R^2$, MSE, RMSE).
- **Variables Cualitativas (Categóricas):** Toman valores en $K$ clases o categorías disjuntas (ej. fraude sí/no, incumplimiento de pago, diagnóstico médico, cliente retenido). El modelado correspondiente es **Clasificación**.

---

## 2. Algoritmos de Clasificación Clave de la Cátedra

### 2.1 Regresión Logística (*Logistic Regression*)
- Modela la probabilidad a posteriori de pertenecer a una clase binaria mediante la **función sigmoide**:
  $$P(Y=1|X) = p(X) = \frac{1}{1 + e^{-(\beta_0 + \beta_1 X_1 + \dots + \beta_p X_p)}}$$
  El logit o log-odds es lineal:
  $$\log\left(\frac{p(X)}{1 - p(X)}\right) = \beta_0 + \beta_1 X_1 + \dots + \beta_p X_p$$
- **Umbral de Decisión (*Threshold*):** Tradicionalmente 0.5. Puede calibrarse para priorizar recall o precisión según el impacto de los falsos negativos vs falsos positivos.
- **Hiperparámetros clave:**
  - `C`: Inverso de la fuerza de regularización (valores pequeños aumentan regularización).
  - `penalty`: Norma de penalización (`'l1'`, `'l2'`, `'elasticnet'`).
  - `solver`: `'liblinear'`, `'lbfgs'`, `'saga'`.

### 2.2 Árboles de Decisión (*Decision Trees*)
- Segmentan recursivamente el espacio de características maximizando la pureza del nodo (criterios: **Gini** o **Entropía**).
- **Hiperparámetros de control de sobreajuste:**
  - `max_depth`: Profundidad máxima del árbol.
  - `min_samples_split`: Mínimo de muestras requeridas para dividir un nodo.
  - `min_samples_leaf`: Mínimo de muestras requeridas en un nodo hoja.

### 2.3 Random Forest y Ensambles
- Conjunto (*ensemble*) de árboles de decisión entrenados con bagging y selección aleatoria de atributos.
- **Hiperparámetros:** `n_estimators`, `max_features`, `max_depth`.

### 2.4 AdaBoost (*Adaptive Boosting*)
- Algoritmo secuencial que combina clasificadores débiles (*weak learners*, típicamente árboles de un solo nivel o *decision stumps*).
- En cada iteración se incrementa el peso de las instancias erróneamente clasificadas, forzando a los siguientes clasificadores a enfocarse en los casos difíciles.
- **Hiperparámetros:** `n_estimators`, `learning_rate`.

---

## 3. El Problema del Desbalance de Clases (*Class Imbalance*)
Se presenta cuando la clase minoritaria (de interés, ej. fraude o enfermos) representa un porcentaje muy reducido (ej. 1% a 10%).
- **Consecuencia:** Un modelo ingenuo que prediga siempre la clase mayoritaria obtendrá un **Accuracy del 95% o 99%**, pero un **Recall de 0%** en la clase crítica.

### 3.1 Técnicas de Mitigación
1. **Submuestreo de la clase mayoritaria (*Random Under-sampling*):** Reduce aleatoriamente registros de la clase mayoritaria. Puede perder información valiosa si la muestra resultante es muy pequeña.
2. **Sobremuestreo de la clase minoritaria (*SMOTE - Synthetic Minority Over-sampling Technique*):** Genera ejemplos sintéticos interpolando entre vecinos cercanos de la clase minoritaria (`imblearn.over_sampling.SMOTE`).
3. **Ajuste de Pesos de Clase (*Class Weighting*):** Penaliza más fuertemente los errores cometidos en la clase minoritaria durante la función de pérdida (en scikit-learn: `class_weight='balanced'`). **Técnica preferida por no distorsionar la muestra real**.

---

## 4. Matriz de Confusión y Métricas de Evaluación
Para un problema binario donde Positivo = Clase de Interés:

| | Predicho Negativo (0) | Predicho Positivo (1) |
|---|---|---|
| **Real Negativo (0)** | Verdadero Negativo (**TN**) | Falso Positivo (**FP**) - *Error Tipo I* |
| **Real Positivo (1)** | Falso Negativo (**FN**) - *Error Tipo II* | Verdadero Positivo (**TP**) |

### Fórmulas Obligatorias:
- **Accuracy (Exactitud global):**
  $$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$
  *(Engañosa en datasets desbalanceados).*
- **Precision (Precisión):**
  $$\text{Precision} = \frac{TP}{TP + FP}$$
  ¿De todo lo que predije positivo, cuánto fue realmente positivo?
- **Recall / Sensibilidad (Exhaustividad):**
  $$\text{Recall} = \frac{TP}{TP + FN}$$
  ¿De todos los positivos reales, cuántos logré detectar?
- **F1-Score:**
  $$F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
  Media armónica entre precisión y recall.
- **Promedios Multiclase:**
  - **Macro Avg:** Promedio simple de la métrica por clase (da igual peso a clases pequeñas que a grandes).
  - **Weighted Avg:** Promedio ponderado por el soporte (*support*) de cada clase.

### Curva ROC y Métrica AUC
- **Curva ROC:** Gráfica del *True Positive Rate* (TPR / Recall) vs *False Positive Rate* ($\text{FPR} = \frac{FP}{FP+TN}$) al variar el umbral de decisión.
- **AUC-ROC:** Área bajo la curva. Valor de 0.5 representa clasificador aleatorio; 1.0 representa clasificador perfecto.

---

## 5. Script Reutilizable: Entrenamiento, Balanceo y Evaluación Completa

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
from imblearn.over_sampling import SMOTE

def entrenar_evaluar_clasificador(X, y, modelo, nombre="Modelo"):
    """Divide datos, entrena y genera matriz de confusión y curvas ROC."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    modelo.fit(X_train, y_train)
    y_pred = modelo.predict(X_test)
    y_proba = modelo.predict_proba(X_test)[:, 1] if hasattr(modelo, "predict_proba") else None
    
    print(f"=== REPORTE DE EVALUACIÓN: {nombre} ===")
    print(classification_report(y_test, y_pred))
    print("Matriz de Confusión:")
    print(confusion_matrix(y_test, y_pred))
    
    if y_proba is not None:
        auc = roc_auc_score(y_test, y_proba)
        print(f"AUC-ROC Score: {auc:.4f}")
        
        fpr, tpr, _ = roc_curve(y_test, y_proba)
        plt.figure(figsize=(6, 5))
        plt.plot(fpr, tpr, label=f'{nombre} (AUC = {auc:.2f})', color='darkorange')
        plt.plot([0, 1], [0, 1], 'k--', label='Azar (AUC = 0.5)')
        plt.xlabel('Tasa de Falsos Positivos (FPR)')
        plt.ylabel('Tasa de Verdaderos Positivos (TPR / Recall)')
        plt.title('Curva ROC')
        plt.legend()
        plt.show()
        
    return modelo

def aplicar_smote(X_train, y_train):
    """Aplica balanceo sintético SMOTE al conjunto de entrenamiento únicamente."""
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X_train, y_train)
    return X_res, y_res
```
