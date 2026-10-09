"""
Script de verificación y modelado experimental rápido para la Entrega 3.
Ejecuta el pipeline completo de:
1. Regresión de precio (Lineal vs Árbol)
2. Clasificación binaria Lyft has_surge con 4 técnicas de balanceo (Desbalanceado, Undersampling, SMOTE, Combinado)
3. Clasificación multiclase Uber service_tier a partir de distance y price_per_mile
Genera métricas y guarda gráficos para alimentar el informe y validar el notebook.
"""
import sys
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge, LogisticRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    r2_score, mean_squared_error, mean_absolute_error,
    confusion_matrix, classification_report,
    roc_auc_score, precision_recall_curve, auc,
    f1_score, recall_score, precision_score, accuracy_score
)
from imblearn.under_sampling import RandomUnderSampler
from imblearn.over_sampling import SMOTE
from imblearn.combine import SMOTEENN

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT_DIR / "Contenido Entrega 2" / "DataSet Segunda Entrega Sin Codificar" / "dataset_nueva_columna.zip"
OUTPUT_DIR = Path(__file__).resolve().parent / "graficos"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print(f"[*] Cargando dataset desde {DATA_PATH}...")
df = pd.read_csv(DATA_PATH)
print(f"[+] Dataset cargado: {df.shape[0]:,} filas x {df.shape[1]} columnas.")

# ==============================================================================
# 1. EXPERIMENTO REGRESIÓN: PRICE
# ==============================================================================
print("\n" + "="*70)
print("1. MODELOS DE REGRESIÓN (PRICE / LOG_PRICE)")
print("="*70)

# Muestra representativa de 100k filas para agilidad en tuning y pruebas
df_sample = df.sample(n=min(100000, len(df)), random_state=42).copy()

# Features predictoras: service_tier, distance, cab_type, time_slot, is_rush_hour, weather
reg_features = [
    'distance', 'straight_line_miles', 'service_tier', 'cab_type',
    'time_slot', 'is_rush_hour', 'is_weekend', 'temperature', 'humidity', 'windSpeed'
]
X_reg = pd.get_dummies(df_sample[reg_features], drop_first=True, dtype=float)
y_reg = df_sample['price'].values
y_reg_log = np.log(y_reg)

X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)
_, _, y_train_r_log, y_test_r_log = train_test_split(X_reg, y_reg_log, test_size=0.2, random_state=42)

# Regresión Lineal Directa
lr = LinearRegression()
lr.fit(X_train_r, y_train_r)
y_pred_lr = lr.predict(X_test_r)
r2_lr = r2_score(y_test_r, y_pred_lr)
rmse_lr = np.sqrt(mean_squared_error(y_test_r, y_pred_lr))

# Regresión Lineal Logarítmica
lr_log = LinearRegression()
lr_log.fit(X_train_r, y_train_r_log)
y_pred_lr_log = np.exp(lr_log.predict(X_test_r))
r2_lr_log = r2_score(y_test_r, y_pred_lr_log)
rmse_lr_log = np.sqrt(mean_squared_error(y_test_r, y_pred_lr_log))

# Árbol de Regresión
dt_r = DecisionTreeRegressor(max_depth=12, random_state=42)
dt_r.fit(X_train_r, y_train_r)
y_pred_dt_r = dt_r.predict(X_test_r)
r2_dt_r = r2_score(y_test_r, y_pred_dt_r)
rmse_dt_r = np.sqrt(mean_squared_error(y_test_r, y_pred_dt_r))

print(f"-> Regresión Lineal (Directa):     R² = {r2_lr:.4f} | RMSE = ${rmse_lr:.2f} USD")
print(f"-> Regresión Lineal (Logarítmica): R² = {r2_lr_log:.4f} | RMSE = ${rmse_lr_log:.2f} USD")
print(f"-> Árbol de Regresión (depth=12):   R² = {r2_dt_r:.4f} | RMSE = ${rmse_dt_r:.2f} USD")

# Guardar Gráfico de Residuos
plt.figure(figsize=(10, 5))
plt.subplot(1, 2, 1)
plt.scatter(y_test_r, y_pred_lr, alpha=0.15, color='#2b5c8f', s=10)
plt.plot([0, y_test_r.max()], [0, y_test_r.max()], 'r--', lw=2)
plt.title(f"Regresión Lineal (R² = {r2_lr:.3f})")
plt.xlabel("Precio Real ($)")
plt.ylabel("Precio Predicho ($)")

plt.subplot(1, 2, 2)
plt.scatter(y_test_r, y_pred_dt_r, alpha=0.15, color='#2e7d32', s=10)
plt.plot([0, y_test_r.max()], [0, y_test_r.max()], 'r--', lw=2)
plt.title(f"Árbol Regresor (R² = {r2_dt_r:.3f})")
plt.xlabel("Precio Real ($)")
plt.ylabel("Precio Predicho ($)")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "01_regresion_precio_predicciones.png", dpi=150)
plt.close()

# ==============================================================================
# 2. EXPERIMENTO CLASIFICACIÓN BINARIA: LYFT HAS_SURGE Y BALANCEO
# ==============================================================================
print("\n" + "="*70)
print("2. CLASIFICACIÓN BINARIA: LYFT HAS_SURGE & BALANCEO DE DATOS")
print("="*70)

# Filtrar Lyft sin Shared (donde vive el surge real)
df_lyft = df[(df['cab_type'] == 'Lyft') & (df['name'] != 'Shared')].copy()
print(f"Registros Lyft elegibles: {len(df_lyft):,}")
print("Distribución has_surge:\n", df_lyft['has_surge'].value_counts(normalize=True).round(4))

# Variables explicativas SIN FUGA (prohibido price y surge_multiplier)
surge_features = [
    'source', 'destination', 'hour_local', 'day_of_week', 'is_rush_hour',
    'is_weekend', 'time_slot', 'name', 'distance', 'temperature',
    'precipIntensity', 'humidity', 'windSpeed', 'visibility'
]
X_surge = pd.get_dummies(df_lyft[surge_features], drop_first=True, dtype=float)
y_surge = df_lyft['has_surge'].values

# Split Train / Test
X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(
    X_surge, y_surge, test_size=0.25, random_state=42, stratify=y_surge
)

# Escalamiento para Regresión Logística
scaler_s = StandardScaler()
X_train_s_scaled = scaler_s.fit_transform(X_train_s)
X_test_s_scaled = scaler_s.transform(X_test_s)

# Métodos de Balanceo a probar
balancing_methods = {}

# 1. Baseline (Desbalanceado)
balancing_methods['Desbalanceado (Base)'] = (X_train_s_scaled, y_train_s)

# 2. Undersampling (Eliminar clase mayoritaria 0 para igualar a 1:1)
rus = RandomUnderSampler(random_state=42, sampling_strategy=0.5) # Ratio 1:2
X_train_rus, y_train_rus = rus.fit_resample(X_train_s_scaled, y_train_s)
balancing_methods['Undersampling (Ratio 1:2)'] = (X_train_rus, y_train_rus)

# 3. SMOTE (Sobremuestreo sintético clase minoritaria)
smote = SMOTE(random_state=42, sampling_strategy=0.5) # Ratio 1:2
X_train_smote, y_train_smote = smote.fit_resample(X_train_s_scaled, y_train_s)
balancing_methods['Oversampling (SMOTE)'] = (X_train_smote, y_train_smote)

# 4. Combinado: Class Weight Balanced en el algoritmo
balancing_methods['Ponderación Algorítmica (Class Weight)'] = (X_train_s_scaled, y_train_s)

results_surge = []
conf_matrices = {}

for name, (X_tr, y_tr) in balancing_methods.items():
    print(f"\n--- Evaluando técnica: {name} ---")
    print(f"Dimensiones Train: {X_tr.shape[0]:,} filas | Proporción positivos: {np.mean(y_tr)*100:.2f}%")
    
    # Modelo Regresión Logística
    if 'Class Weight' in name:
        clf_lr = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)
    else:
        clf_lr = LogisticRegression(max_iter=1000, random_state=42)
    clf_lr.fit(X_tr, y_tr)
    y_pred_lr = clf_lr.predict(X_test_s_scaled)
    y_proba_lr = clf_lr.predict_proba(X_test_s_scaled)[:, 1]
    
    # Modelo Árbol
    if 'Class Weight' in name:
        clf_dt = DecisionTreeClassifier(max_depth=10, class_weight='balanced', random_state=42)
    else:
        clf_dt = DecisionTreeClassifier(max_depth=10, random_state=42)
    clf_dt.fit(X_tr, y_tr)
    y_pred_dt = clf_dt.predict(X_test_s_scaled)
    y_proba_dt = clf_dt.predict_proba(X_test_s_scaled)[:, 1]
    
    # Guardar métricas Logística
    cm_lr = confusion_matrix(y_test_s, y_pred_lr)
    rec_lr = recall_score(y_test_s, y_pred_lr)
    prec_lr = precision_score(y_test_s, y_pred_lr, zero_division=0)
    f1_lr = f1_score(y_test_s, y_pred_lr)
    roc_lr = roc_auc_score(y_test_s, y_proba_lr)
    
    # Guardar métricas Árbol
    cm_dt = confusion_matrix(y_test_s, y_pred_dt)
    rec_dt = recall_score(y_test_s, y_pred_dt)
    prec_dt = precision_score(y_test_s, y_pred_dt, zero_division=0)
    f1_dt = f1_score(y_test_s, y_pred_dt)
    roc_dt = roc_auc_score(y_test_s, y_proba_dt)
    
    results_surge.append({
        'Técnica': name, 'Modelo': 'Regresión Logística',
        'Recall (Surge)': rec_lr, 'Precision': prec_lr, 'F1-Score': f1_lr, 'ROC-AUC': roc_lr,
        'TP': cm_lr[1,1], 'FP': cm_lr[0,1], 'FN': cm_lr[1,0], 'TN': cm_lr[0,0]
    })
    results_surge.append({
        'Técnica': name, 'Modelo': 'Árbol Decisión',
        'Recall (Surge)': rec_dt, 'Precision': prec_dt, 'F1-Score': f1_dt, 'ROC-AUC': roc_dt,
        'TP': cm_dt[1,1], 'FP': cm_dt[0,1], 'FN': cm_dt[1,0], 'TN': cm_dt[0,0]
    })
    conf_matrices[f"{name} - Reg. Logística"] = cm_lr
    conf_matrices[f"{name} - Árbol"] = cm_dt
    
    print(f"Logística -> Recall: {rec_lr*100:.2f}% | Precision: {prec_lr*100:.2f}% | F1: {f1_lr:.4f} | ROC-AUC: {roc_lr:.4f}")
    print(f"Árbol     -> Recall: {rec_dt*100:.2f}% | Precision: {prec_dt*100:.2f}% | F1: {f1_dt:.4f} | ROC-AUC: {roc_dt:.4f}")

df_res_surge = pd.DataFrame(results_surge)

# Graficar Matrices de Confusión de las 4 técnicas
fig, axes = plt.subplots(2, 4, figsize=(18, 9))
idx = 0
for k, cm in conf_matrices.items():
    r, c = idx // 4, idx % 4
    ax = axes[r, c]
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False, ax=ax)
    ax.set_title(k, fontsize=10)
    ax.set_xlabel('Predicho (0=No, 1=Surge)')
    ax.set_ylabel('Real (0=No, 1=Surge)')
    idx += 1
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "02_matrices_confusion_surge_balanceo.png", dpi=150)
plt.close()

# ==============================================================================
# 3. EXPERIMENTO CLASIFICACIÓN MULTICLASE: UBER TIPO DE SERVICIO
# ==============================================================================
print("\n" + "="*70)
print("3. CLASIFICACIÓN MULTICLASE: UBER SERVICE_TIER (DISTANCIA & PRICE_PER_MILE)")
print("="*70)

df_uber = df[df['cab_type'] == 'Uber'].copy()
df_uber['distance_adj'] = df_uber['distance'].clip(lower=0.1)
df_uber['price_per_mile'] = df_uber['price'] / df_uber['distance_adj']

# Target: service_tier (5 clases: Compartido, Estándar, XL, Black, Black XL)
X_uber = df_uber[['distance', 'price', 'price_per_mile', 'straight_line_miles']].copy()
y_uber = df_uber['service_tier'].copy()

print(f"Registros Uber: {len(df_uber):,}")
print("Distribución de Clases service_tier:\n", y_uber.value_counts(normalize=True).round(4))

X_tr_u, X_te_u, y_tr_u, y_te_u = train_test_split(
    X_uber, y_uber, test_size=0.25, random_state=42, stratify=y_uber
)

scaler_u = StandardScaler()
X_tr_u_sc = scaler_u.fit_transform(X_tr_u)
X_te_u_sc = scaler_u.transform(X_te_u)

# 1. Regresión Logística Multiclase (Softmax)
clf_u_lr = LogisticRegression(max_iter=1000, random_state=42)
clf_u_lr.fit(X_tr_u_sc, y_tr_u)
y_pred_u_lr = clf_u_lr.predict(X_te_u_sc)
acc_u_lr = accuracy_score(y_te_u, y_pred_u_lr)
f1_u_lr = f1_score(y_te_u, y_pred_u_lr, average='macro')


# 2. Árbol de Clasificación Multiclase
clf_u_dt = DecisionTreeClassifier(max_depth=8, random_state=42)
clf_u_dt.fit(X_tr_u, y_tr_u)
y_pred_u_dt = clf_u_dt.predict(X_te_u)
acc_u_dt = accuracy_score(y_te_u, y_pred_u_dt)
f1_u_dt = f1_score(y_te_u, y_pred_u_dt, average='macro')

print(f"-> Regresión Logística Softmax: Accuracy = {acc_u_lr*100:.2f}% | Macro F1 = {f1_u_lr:.4f}")
print(f"-> Árbol Multiclase (depth=8):   Accuracy = {acc_u_dt*100:.2f}% | Macro F1 = {f1_u_dt:.4f}")

# Matrices de Confusión Multiclase
labels_order = ['Compartido', 'Estándar', 'XL', 'Black', 'Black XL']
cm_u_lr = confusion_matrix(y_te_u, y_pred_u_lr, labels=labels_order)
cm_u_dt = confusion_matrix(y_te_u, y_pred_u_dt, labels=labels_order)

fig, axes = plt.subplots(1, 2, figsize=(14, 6))
sns.heatmap(cm_u_lr, annot=True, fmt='d', cmap='Oranges', xticklabels=labels_order, yticklabels=labels_order, ax=axes[0])
axes[0].set_title(f"Uber Softmax (Acc = {acc_u_lr*100:.1f}%)")
axes[0].set_xlabel("Servicio Predicho")
axes[0].set_ylabel("Servicio Real")

sns.heatmap(cm_u_dt, annot=True, fmt='d', cmap='Greens', xticklabels=labels_order, yticklabels=labels_order, ax=axes[1])
axes[1].set_title(f"Uber Árbol (Acc = {acc_u_dt*100:.1f}%)")
axes[1].set_xlabel("Servicio Predicho")
axes[1].set_ylabel("Servicio Real")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "03_matriz_confusion_uber_multiclase.png", dpi=150)
plt.close()

# Fronteras de dispersión de precio vs distancia por servicio
plt.figure(figsize=(9, 6))
sample_plot = df_uber.sample(5000, random_state=42)
sns.scatterplot(
    data=sample_plot, x='distance', y='price', hue='service_tier',
    palette='tab10', alpha=0.5, s=25, hue_order=labels_order
)
plt.title("Uber: Separabilidad de Clases por Distancia y Precio")
plt.xlabel("Distancia (millas)")
plt.ylabel("Precio ($ USD)")
plt.legend(title="Service Tier")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "04_uber_separabilidad_servicios.png", dpi=150)
plt.close()

print("\n" + "="*70)
print("[OK] Experimento completado con éxito. Gráficos generados en:", OUTPUT_DIR)
print("="*70)
