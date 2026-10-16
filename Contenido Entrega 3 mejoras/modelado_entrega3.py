"""Entrega 3 — Modelado y análisis de resultados · Grupo 11 · Ciencia de Datos 5K1 (UTN FRC).

Entrada : ../Contenido Entrega 2/Dataset Codificado/dataset_codificado.zip  (636.568 filas x 71 columnas)
Salidas : graficos/*.png · resultados/*.csv · resultados/metricas.json

Parte A · has_surge  -> clasificación binaria (Lyft sin Shared). Regresión logística, árbol de decisión
                        y random forest; comparación de 4 técnicas de balanceo y ajuste del umbral.
Parte B · price      -> regresión sobre log(price) (Uber + Lyft). Ridge, árbol y random forest,
                        con y sin surge_multiplier.
Parte C · rutas      -> segmentación complementaria con K-Means (codo + silueta).

Validación (compromiso de la Entrega 2): las filas no son independientes (comparten recargo por ruta y
minuto), así que NO se separa al azar. Prueba = fechas del 15 al 18/12/2018 (holdout temporal) y la
búsqueda de hiperparámetros usa GroupKFold agrupando por fecha dentro del entrenamiento.

Uso: python modelado_entrega3.py            (completo, ~15-25 min con 8+ núcleos)
     python modelado_entrega3.py --rapido   (muestra del 15% y grillas chicas, para probar el código)
"""
import json
import sys
import time
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
import matplotlib.ticker

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.colors import LinearSegmentedColormap

from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.under_sampling import RandomUnderSampler
from sklearn.base import clone
from sklearn.cluster import KMeans
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (accuracy_score, average_precision_score, classification_report,
                             confusion_matrix, mean_absolute_error, mean_squared_error,
                             precision_recall_curve, r2_score, roc_auc_score, roc_curve,
                             silhouette_score)
from sklearn.model_selection import GridSearchCV, GroupKFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, plot_tree

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

RAPIDO = "--rapido" in sys.argv
AQUI = Path(__file__).resolve().parent
ENTRADA = AQUI.parent / "Contenido Entrega 2" / "Dataset Codificado" / "dataset_codificado.zip"
GRAF = AQUI / "graficos"
RES = AQUI / "resultados"
GRAF.mkdir(exist_ok=True)
RES.mkdir(exist_ok=True)

SEED = 42
FECHAS_TEST = ["2018-12-15", "2018-12-16", "2018-12-17", "2018-12-18"]
CV = GroupKFold(n_splits=5)
M = {}  # métricas que alimentan el informe
T0 = time.time()


def log(msg):
    print(f"[{time.time() - T0:6.0f}s] {msg}", flush=True)


# ----------------------------------------------------------------------------------------------
# Estilo de gráficos (mismo criterio visual que la Entrega 2)
# ----------------------------------------------------------------------------------------------
for ruta in Path("/Applications/Microsoft Word.app/Contents/Resources/DFonts").glob("[Cc]alibri*.ttf"):
    font_manager.fontManager.addfont(str(ruta))
FUENTE = "Calibri" if any(f.name == "Calibri" for f in font_manager.fontManager.ttflist) else "DejaVu Sans"
plt.rcParams.update({"font.family": FUENTE, "font.size": 11, "axes.titlesize": 12,
                     "axes.labelcolor": "#404040", "xtick.color": "#404040", "ytick.color": "#404040"})
AZUL, NARANJA, VERDE, GRIS = "#1F5F8B", "#C0692E", "#4E8F5B", "#8C8C8C"
COLOR_MODELO = {"Regresión logística": AZUL, "Árbol de decisión": NARANJA, "Random forest": VERDE,
                "Ridge": AZUL}
CMAP = LinearSegmentedColormap.from_list("e3", ["#FFFFFF", "#9DC3E0", AZUL])


def estilo(ax, grid="x"):
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color("#C8CED3")
    if grid:
        ax.grid(axis=grid, color="#E6E9EC", lw=0.8)
    ax.set_axisbelow(True)


def titular(fig, titulo, subtitulo):
    fig.suptitle(titulo, x=0.01, y=1.0, ha="left", va="bottom", fontsize=15, fontweight="bold",
                 color="#1A1A1A")
    fig.text(0.01, 0.995, subtitulo, ha="left", va="top", fontsize=10.5, color="#595959")


def guardar(fig, nombre):
    fig.savefig(GRAF / nombre, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    log(f"gráfico {nombre}")


def etiquetas_finales(ax, items, x, separacion):
    """Escribe etiquetas al final de las curvas, separándolas verticalmente para que no se pisen."""
    items = sorted(items)
    ys = [items[0][0]]
    for y, _, _ in items[1:]:
        ys.append(max(y, ys[-1] + separacion))
    for yv, (_, texto, color) in zip(ys, items):
        ax.text(x, yv, texto, color=color, fontsize=8.5, va="center")


def pct(x):
    return f"{100 * x:.1f}%".replace(".", ",")


# ----------------------------------------------------------------------------------------------
# Carga y variables auxiliares
# ----------------------------------------------------------------------------------------------
log(f"cargando {ENTRADA.name}")
df = pd.read_csv(ENTRADA)
M["dataset"] = {"filas": int(len(df)), "columnas": int(df.shape[1])}
df["fecha"] = df["datetime_local"].str[:10]
# La hora es cíclica (23 h está al lado de 0 h): seno y coseno se la presentan así a la regresión logística.
df["hour_sin"] = np.sin(2 * np.pi * df["hour_local"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hour_local"] / 24)
df["log_distance"] = np.log(df["distance"])
df["log_surge"] = np.log(df["surge_multiplier"])
if RAPIDO:
    df = df.sample(frac=0.15, random_state=SEED).reset_index(drop=True)
es_test = df["fecha"].isin(FECHAS_TEST)

GRUPOS = {
    "Zona de origen": [c for c in df.columns if c.startswith("source_")],
    "Zona de destino": [c for c in df.columns if c.startswith("destination_")],
    "Hora y día": ["hour_local", "hour_sin", "hour_cos", "day_of_week", "is_weekend", "is_rush_hour",
                   "is_dark"] + [c for c in df.columns if c.startswith("time_slot_")],
    "Clima": ["temperature", "humidity", "windSpeed", "visibility", "precipIntensity", "is_raining",
              "cloudCover", "pressure"] + [c for c in df.columns if c.startswith("short_summary_")],
    "Producto": [c for c in df.columns if c.startswith("name_")],
    "Distancia": ["distance", "straight_line_miles", "log_distance"],
    "Recargo (surge)": ["log_surge"],
}


def importancia_por_grupo(predecir, X, y, metrica, grupos, repeticiones=3):
    """Importancia por permutación de familias de variables: cuánto empeora la métrica al mezclar
    todas las columnas de un grupo a la vez (las dummies de un mismo grupo se mueven juntas)."""
    rng = np.random.default_rng(SEED)
    base = metrica(y, predecir(X))
    filas = []
    for grupo, cols in grupos.items():
        cols = [c for c in cols if c in X.columns]
        if not cols:
            continue
        caidas = []
        for _ in range(repeticiones):
            Xp = X.copy()
            Xp[cols] = X[cols].values[rng.permutation(len(X))]
            caidas.append(base - metrica(y, predecir(Xp)))
        filas.append({"grupo": grupo, "caida": float(np.mean(caidas)), "desvio": float(np.std(caidas))})
    return base, pd.DataFrame(filas).sort_values("caida", ascending=False)


# ==============================================================================================
# PARTE A · has_surge (clasificación binaria con balanceo)
# ==============================================================================================
log("PARTE A · has_surge")
lyft = df[(df["is_uber"] == 0) & (df["name_Shared"] == 0)].reset_index(drop=True)
# Fuga de datos: price y surge_multiplier contienen la respuesta. is_uber y service_tier_ord son
# constantes o redundantes con name_* dentro de Lyft. Se quitan las columnas constantes (productos Uber).
EXCLUIR_A = ["id", "datetime_local", "fecha", "has_surge", "price", "surge_multiplier", "log_surge",
             "is_uber", "service_tier_ord", "log_distance"]
FEATS_A = [c for c in lyft.columns if c not in EXCLUIR_A and lyft[c].nunique() > 1]
test_a = lyft["fecha"].isin(FECHAS_TEST)
Xtr, ytr, gtr = lyft.loc[~test_a, FEATS_A], lyft.loc[~test_a, "has_surge"], lyft.loc[~test_a, "fecha"]
Xte, yte = lyft.loc[test_a, FEATS_A], lyft.loc[test_a, "has_surge"]
M["A_datos"] = {
    "filas": int(len(lyft)), "predictoras": len(FEATS_A), "positivos": int(lyft["has_surge"].sum()),
    "tasa": float(lyft["has_surge"].mean()), "train": int(len(Xtr)), "test": int(len(Xte)),
    "tasa_train": float(ytr.mean()), "tasa_test": float(yte.mean()),
    "fechas_train": int(gtr.nunique()), "fechas_test": len(FECHAS_TEST),
}
log(f"Lyft sin Shared: {len(lyft):,} filas · {len(FEATS_A)} predictoras · train {len(Xtr):,} · test {len(Xte):,}")


def pipe_clf(modelo, tecnica):
    """Escalado -> (balanceo) -> modelo. El balanceo vive dentro del pipeline de imblearn, así que
    solo se aplica al ajustar (train de cada fold); la evaluación siempre es sobre datos reales."""
    pasos = [("escala", StandardScaler())]
    if tecnica == "rus":
        pasos.append(("balanceo", RandomUnderSampler(random_state=SEED)))
    elif tecnica == "smote":
        pasos.append(("balanceo", SMOTE(random_state=SEED, k_neighbors=5)))
    modelo = clone(modelo)
    if tecnica == "pesos":
        modelo.set_params(class_weight="balanced")
    pasos.append(("modelo", modelo))
    return ImbPipeline(pasos)


def metricas_clf(y, proba, umbral=0.5):
    pred = (proba >= umbral).astype(int)
    tn, fp, fn, tp = confusion_matrix(y, pred, labels=[0, 1]).ravel()
    rep = classification_report(y, pred, output_dict=True, zero_division=0)
    return {"umbral": float(umbral), "accuracy": accuracy_score(y, pred),
            "precision": rep["1"]["precision"], "recall": rep["1"]["recall"], "f1": rep["1"]["f1-score"],
            "f1_macro": rep["macro avg"]["f1-score"], "f1_weighted": rep["weighted avg"]["f1-score"],
            "roc_auc": roc_auc_score(y, proba), "pr_auc": average_precision_score(y, proba),
            "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}


# --- A.0 Líneas base ---------------------------------------------------------------------------
base = []
for nombre, estrategia in [("Siempre 'sin recargo'", "most_frequent"), ("Azar con la tasa real", "stratified")]:
    dummy = DummyClassifier(strategy=estrategia, random_state=SEED).fit(Xtr, ytr)
    base.append({"modelo": nombre, **metricas_clf(yte, dummy.predict_proba(Xte)[:, 1])})
M["A_lineas_base"] = base

# --- A.1 Búsqueda de hiperparámetros (GroupKFold por fecha, métrica PR-AUC) ---------------------
MODELOS_A = {
    "Regresión logística": (LogisticRegression(max_iter=3000, solver="lbfgs"),
                            {"modelo__C": [0.0001, 0.0003, 0.001, 0.01, 0.1, 1, 10]}),
    "Árbol de decisión": (DecisionTreeClassifier(random_state=SEED),
                          {"modelo__max_depth": [3, 5, 7, 9, 12, 15, 20, 25, 30, 40],
                           "modelo__min_samples_leaf": [20, 100, 500],
                           "modelo__criterion": ["gini", "entropy"]}),
    "Random forest": (RandomForestClassifier(n_estimators=150, max_features="sqrt", random_state=SEED, n_jobs=1),
                      {"modelo__max_depth": [10, 16, None], "modelo__min_samples_leaf": [10, 50, 200]}),
}
if RAPIDO:
    MODELOS_A["Árbol de decisión"][1].update({"modelo__max_depth": [5, 9, 15], "modelo__criterion": ["gini"]})
    MODELOS_A["Random forest"][0].set_params(n_estimators=40)

mejores_a, tuning_a = {}, {}
for nombre, (modelo, grilla) in MODELOS_A.items():
    gs = GridSearchCV(pipe_clf(modelo, "pesos"), grilla, cv=CV, n_jobs=-1, refit=False,
                      scoring={"pr_auc": "average_precision", "roc_auc": "roc_auc"},
                      return_train_score=True)
    gs.fit(Xtr, ytr, groups=gtr)
    res = pd.DataFrame(gs.cv_results_)
    res.to_csv(RES / f"A_busqueda_{nombre.split()[0].lower()}.csv", index=False)
    i = int(res["mean_test_pr_auc"].idxmax())
    mejores_a[nombre] = {k.replace("modelo__", ""): v for k, v in res.loc[i, "params"].items()}
    tuning_a[nombre] = {"params": mejores_a[nombre], "combinaciones": int(len(res)),
                        "pr_auc_cv": float(res.loc[i, "mean_test_pr_auc"]),
                        "pr_auc_cv_std": float(res.loc[i, "std_test_pr_auc"]),
                        "roc_auc_cv": float(res.loc[i, "mean_test_roc_auc"]),
                        "pr_auc_train": float(res.loc[i, "mean_train_pr_auc"])}
    if nombre == "Árbol de decisión":
        res_arbol = res
    log(f"{nombre}: mejores {mejores_a[nombre]} · PR-AUC CV {tuning_a[nombre]['pr_auc_cv']:.3f}")
M["A_tuning"] = tuning_a

# Curva de validación del árbol: entrenamiento vs validación según la profundidad
mejor_hoja = mejores_a["Árbol de decisión"]["min_samples_leaf"]
mejor_crit = mejores_a["Árbol de decisión"]["criterion"]
curva = res_arbol[(res_arbol["param_modelo__min_samples_leaf"] == mejor_hoja)
                  & (res_arbol["param_modelo__criterion"] == mejor_crit)].copy()
curva["prof"] = curva["param_modelo__max_depth"].astype(int)
curva = curva.sort_values("prof")
fig, ax = plt.subplots(figsize=(8.5, 4.4))
ax.plot(curva["prof"], curva["mean_train_pr_auc"], "-o", color=GRIS, label="Entrenamiento")
ax.plot(curva["prof"], curva["mean_test_pr_auc"], "-o", color=NARANJA, label="Validación (fechas no vistas)")
ax.fill_between(curva["prof"], curva["mean_test_pr_auc"] - curva["std_test_pr_auc"],
                curva["mean_test_pr_auc"] + curva["std_test_pr_auc"], color=NARANJA, alpha=0.15)
ax.axvline(mejores_a["Árbol de decisión"]["max_depth"], color="#404040", ls="--", lw=1)
ax.axhline(M["A_datos"]["tasa_train"], color=GRIS, ls=":", lw=1)
ax.text(curva["prof"].max(), M["A_datos"]["tasa_train"] + 0.003, "azar = tasa de recargo", ha="right",
        va="bottom", fontsize=9, color=GRIS)
ax.set_xticks(curva["prof"])
ax.set_xlabel("Profundidad máxima del árbol (max_depth)")
ax.set_ylabel("PR-AUC")
ax.legend(frameon=False, loc="upper left")
estilo(ax, "y")
titular(fig, "A mayor profundidad, entrenamiento y validación se separan: el árbol empieza a memorizar",
        f"PR-AUC en entrenamiento y validación cruzada agrupada por fecha (5 folds) · min_samples_leaf = {mejor_hoja}, "
        f"criterio = {mejor_crit}")
guardar(fig, "01_validacion_profundidad_arbol.png")

# --- A.2 Laboratorio de balanceo (mismos hiperparámetros, cuatro técnicas) ----------------------
TECNICAS = {"sin": "Sin balanceo", "rus": "Submuestreo (RUS 1:1)", "smote": "Sobremuestreo (SMOTE 1:1)",
            "pesos": "Pesos de clase (balanced)"}


def modelo_final(nombre):
    modelo = clone(MODELOS_A[nombre][0]).set_params(**mejores_a[nombre])
    if nombre == "Random forest":
        modelo.set_params(n_jobs=-1)
    return modelo


# Distribución de clases que ve el modelo al entrenar con cada técnica
dist = []
Xtr_esc = StandardScaler().fit_transform(Xtr)
for clave, etiqueta in TECNICAS.items():
    if clave == "rus":
        _, yb = RandomUnderSampler(random_state=SEED).fit_resample(Xtr_esc, ytr)
    elif clave == "smote":
        _, yb = SMOTE(random_state=SEED).fit_resample(Xtr_esc, ytr)
    else:
        yb = ytr
    dist.append({"tecnica": etiqueta, "clase_0": int((yb == 0).sum()), "clase_1": int((yb == 1).sum())})
dist = pd.DataFrame(dist)
peso_1 = len(ytr) / (2 * ytr.sum())
peso_0 = len(ytr) / (2 * (len(ytr) - ytr.sum()))
M["A_distribucion"] = dist.to_dict("records")
M["A_pesos"] = {"peso_0": float(peso_0), "peso_1": float(peso_1)}

balanceo, probas = [], {}
for nombre in MODELOS_A:
    for clave, etiqueta in TECNICAS.items():
        pipe = pipe_clf(modelo_final(nombre), clave).fit(Xtr, ytr)
        p = pipe.predict_proba(Xte)[:, 1]
        probas[(nombre, clave)] = p
        balanceo.append({"modelo": nombre, "tecnica": etiqueta, **metricas_clf(yte, p)})
        log(f"{nombre} · {etiqueta}: recall {balanceo[-1]['recall']:.3f} · F1 {balanceo[-1]['f1']:.3f} · "
            f"PR-AUC {balanceo[-1]['pr_auc']:.3f}")
balanceo = pd.DataFrame(balanceo)
balanceo.to_csv(RES / "A_balanceo_test.csv", index=False)
M["A_balanceo"] = balanceo.to_dict("records")

fig, axes = plt.subplots(1, 2, figsize=(13, 4.6), gridspec_kw={"width_ratios": [1, 1.5]})
ax = axes[0]
y_pos = np.arange(len(dist))[::-1]
ax.barh(y_pos, dist["clase_0"], color="#BFC9D1", label="Sin recargo (0)")
ax.barh(y_pos, dist["clase_1"], left=dist["clase_0"], color=NARANJA, label="Con recargo (1)")
for yp, (_, r) in zip(y_pos, dist.iterrows()):
    tot = r["clase_0"] + r["clase_1"]
    ax.text(tot * 1.01, yp, f"{tot:,.0f}".replace(",", ".") + f"  ·  {pct(r['clase_1'] / tot)} positivos",
            va="center", fontsize=9, color="#404040")
ax.text(len(ytr) * 0.02, y_pos[-1] - 0.42, f"pesos: clase 0 = {peso_0:.2f} · clase 1 = {peso_1:.2f}",
        fontsize=8.5, color="#404040", style="italic")
ax.set_yticks(y_pos, dist["tecnica"])
ax.set_xlim(0, dist[["clase_0", "clase_1"]].sum(axis=1).max() * 1.55)
ax.set_xlabel("Filas de entrenamiento")
ax.xaxis.set_major_formatter(lambda v, _: f"{v / 1000:.0f} mil")
ax.legend(frameon=False, loc="upper right", fontsize=9)
ax.set_title("Lo que ve el modelo al entrenar", loc="left", fontsize=11)
estilo(ax, "x")
ax = axes[1]
ancho = 0.2
for j, (clave, etiqueta) in enumerate(TECNICAS.items()):
    sub = balanceo[balanceo["tecnica"] == etiqueta]
    xs = np.arange(len(sub)) + (j - 1.5) * ancho
    color = ["#BFC9D1", "#8FA9BF", "#E3A774", NARANJA][j]
    barras = ax.bar(xs, sub["recall"], ancho * 0.95, color=color, label=etiqueta)
    for b, f1 in zip(barras, sub["f1"]):
        ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 0.015, pct(b.get_height()), ha="center",
                fontsize=7.5, color="#404040")
ax.set_xticks(np.arange(3), list(MODELOS_A))
ax.set_ylabel("Recall de la clase 'con recargo' (umbral 0,5)")
ax.set_ylim(0, 1.05)
ax.yaxis.set_major_formatter(lambda v, _: f"{v:.0%}")
ax.legend(frameon=False, ncol=2, fontsize=8.5, loc="upper left")
ax.set_title("Cuántos recargos detecta cada combinación en el período de prueba", loc="left", fontsize=11)
estilo(ax, "y")
titular(fig, "Sin balanceo, ningún modelo detecta el recargo: el modelo aprende a decir siempre que no",
        "Lyft sin Shared · entrenamiento: fechas hasta el 14/12 · prueba: 15 al 18/12/2018 · el balanceo se aplica solo al entrenamiento")
fig.tight_layout()
guardar(fig, "02_balanceo_distribucion_y_recall.png")

# --- A.3 Umbral de decisión (elegido con predicciones fuera de fold sobre el entrenamiento) -------
finales_a, umbrales = {}, {}
for nombre in MODELOS_A:
    # Técnica elegida por PR-AUC en prueba sería espiar el test: se elige "pesos" por criterio de la
    # cátedra (no distorsiona la muestra) y se verifica en la tabla de balanceo que no pierde frente al resto.
    pipe = pipe_clf(modelo_final(nombre), "pesos")
    oof = cross_val_predict(pipe, Xtr, ytr, groups=gtr, cv=CV, method="predict_proba",
                            n_jobs=1 if nombre == "Random forest" else -1)[:, 1]
    prec, rec, thr = precision_recall_curve(ytr, oof)
    f1 = 2 * prec * rec / np.clip(prec + rec, 1e-12, None)
    k = int(np.nanargmax(f1[:-1]))
    umbrales[nombre] = float(thr[k])
    p = probas[(nombre, "pesos")]
    finales_a[nombre] = {"umbral_0.5": metricas_clf(yte, p, 0.5), "umbral_opt": metricas_clf(yte, p, thr[k]),
                         "f1_oof": float(f1[k])}
    log(f"{nombre}: umbral F1-óptimo {thr[k]:.3f} -> F1 test {finales_a[nombre]['umbral_opt']['f1']:.3f}")
M["A_finales"] = finales_a

# Reporte de clasificación completo (macro y weighted) de los modelos finales
filas_rep = []
for nombre in MODELOS_A:
    pred = (probas[(nombre, "pesos")] >= umbrales[nombre]).astype(int)
    rep = classification_report(yte, pred, output_dict=True, zero_division=0)
    for clase in ["0", "1", "macro avg", "weighted avg"]:
        filas_rep.append({"modelo": nombre, "clase": clase, "precision": rep[clase]["precision"],
                          "recall": rep[clase]["recall"], "f1": rep[clase]["f1-score"],
                          "soporte": int(rep[clase]["support"])})
pd.DataFrame(filas_rep).to_csv(RES / "A_reporte_clasificacion.csv", index=False)
M["A_reporte"] = filas_rep

# Matrices de confusión de los modelos finales
fig, axes = plt.subplots(1, 3, figsize=(13, 4.2))
for ax, nombre in zip(axes, MODELOS_A):
    r = finales_a[nombre]["umbral_opt"]
    cm = np.array([[r["tn"], r["fp"]], [r["fn"], r["tp"]]])
    ax.imshow(cm / cm.sum(axis=1, keepdims=True), cmap=CMAP, vmin=0, vmax=1)
    for i in range(2):
        for j in range(2):
            v = cm[i, j] / cm[i].sum()
            ax.text(j, i, f"{cm[i, j]:,}".replace(",", ".") + f"\n{pct(v)} de la fila", ha="center",
                    va="center", fontsize=10, color="white" if v > 0.55 else "#1A1A1A")
    ax.set_xticks([0, 1], ["Sin recargo", "Con recargo"])
    ax.set_yticks([0, 1], ["Sin recargo", "Con recargo"])
    ax.set_xlabel("Predicho")
    ax.set_ylabel("Real")
    ax.set_title(f"{nombre}\numbral {r['umbral']:.2f} · recall {pct(r['recall'])} · precisión {pct(r['precision'])}",
                 fontsize=10.5, loc="left")
    for s in ax.spines.values():
        s.set_visible(False)
titular(fig, "Matrices de confusión en el período de prueba (15 al 18/12)",
        "Modelos finales: hiperparámetros por validación agrupada, pesos de clase y umbral elegido sobre el entrenamiento")
fig.tight_layout()
guardar(fig, "03_matrices_confusion_finales.png")

# Curvas ROC y Precisión-Recall
fig, axes = plt.subplots(1, 2, figsize=(12.5, 4.8))
for nombre in MODELOS_A:
    p = probas[(nombre, "pesos")]
    fpr, tpr, _ = roc_curve(yte, p)
    axes[0].plot(fpr, tpr, color=COLOR_MODELO[nombre], lw=2, label=f"{nombre} (AUC {roc_auc_score(yte, p):.3f})")
    pr, rc, _ = precision_recall_curve(yte, p)
    axes[1].plot(rc, pr, color=COLOR_MODELO[nombre], lw=2,
                 label=f"{nombre} (PR-AUC {average_precision_score(yte, p):.3f})")
axes[0].plot([0, 1], [0, 1], ls="--", color=GRIS, lw=1, label="Azar (AUC 0,5)")
axes[1].axhline(yte.mean(), ls="--", color=GRIS, lw=1, label=f"Azar (tasa real {pct(yte.mean())})")
axes[0].set_xlabel("Tasa de falsos positivos (FPR)")
axes[0].set_ylabel("Tasa de verdaderos positivos (recall)")
axes[0].set_title("Curva ROC", loc="left")
axes[1].set_xlabel("Recall (recargos detectados)")
axes[1].set_ylabel("Precisión (alertas correctas)")
axes[1].set_title("Curva Precisión-Recall", loc="left")
axes[1].set_ylim(0, 0.6)
for ax in axes:
    ax.legend(frameon=False, fontsize=9, loc="lower right" if ax is axes[0] else "upper right")
    estilo(ax, "both")
titular(fig, "Los modelos ordenan el riesgo mejor que el azar, pero con poco margen",
        "Período de prueba · con 8% de positivos, la curva Precisión-Recall es más exigente que la ROC")
fig.tight_layout()
guardar(fig, "04_curvas_roc_pr.png")

# --- A.4 Interpretación ------------------------------------------------------------------------
# (a) Importancia por familias de variables (random forest, caída de PR-AUC al permutar)
rf_pipe = pipe_clf(modelo_final("Random forest"), "pesos").fit(Xtr, ytr)
base_ap, imp_a = importancia_por_grupo(lambda X: rf_pipe.predict_proba(X)[:, 1], Xte, yte,
                                       average_precision_score, GRUPOS)
imp_a.to_csv(RES / "A_importancia_grupos.csv", index=False)
M["A_importancia"] = {"base_pr_auc": float(base_ap), "grupos": imp_a.to_dict("records")}

# (b) Coeficientes de la regresión logística (odds ratio)
lr_pipe = pipe_clf(modelo_final("Regresión logística"), "pesos").fit(Xtr, ytr)
coef = pd.Series(lr_pipe.named_steps["modelo"].coef_[0], index=FEATS_A)
desv = pd.Series(lr_pipe.named_steps["escala"].scale_, index=FEATS_A)
binaria = Xtr.isin([0, 1]).all()
# Para dummies: OR de pasar de 0 a 1. Para continuas: OR por un desvío estándar.
odds = pd.DataFrame({"coef_estandarizado": coef,
                     "odds_ratio": np.where(binaria, np.exp(coef / desv), np.exp(coef)),
                     "tipo": np.where(binaria, "0 → 1", "+1 desvío")})
odds = odds.reindex(odds["coef_estandarizado"].abs().sort_values(ascending=False).index)
odds.to_csv(RES / "A_odds_ratio_logistica.csv")
M["A_odds"] = odds.head(15).reset_index(names="variable").to_dict("records")

fig, axes = plt.subplots(1, 2, figsize=(13.5, 5.2), gridspec_kw={"width_ratios": [1, 1.25]})
ax = axes[0]
imp_plot = imp_a.iloc[::-1]
ax.barh(imp_plot["grupo"], imp_plot["caida"], xerr=imp_plot["desvio"], color=NARANJA, height=0.6,
        error_kw={"ecolor": "#404040", "lw": 1})
for yv, (v, e) in enumerate(zip(imp_plot["caida"], imp_plot["desvio"])):
    ax.text(max(v, 0) + e + 0.001, yv + 0.22, f"{v:.3f}".replace(".", ","), va="bottom", fontsize=9)
ax.axvline(0, color="#404040", lw=0.8)
ax.set_xlabel("Caída de PR-AUC al mezclar el grupo")
ax.set_title("Random forest: qué familia de variables usa", loc="left", fontsize=11)
estilo(ax, "x")
ax = axes[1]
top = odds.head(14).iloc[::-1]
etiquetas = [f"{i.replace('source_', 'origen: ').replace('destination_', 'destino: ').replace('_', ' ')}"
             f"  ({t})" for i, t in zip(top.index, top["tipo"])]
ax.barh(etiquetas, top["odds_ratio"] - 1, left=1, color=[NARANJA if v > 1 else AZUL for v in top["odds_ratio"]],
        height=0.6)
ax.axvline(1, color="#404040", lw=1)
ax.set_xscale("log")
ax.xaxis.set_major_locator(matplotlib.ticker.FixedLocator([0.3, 0.5, 0.75, 1, 1.5, 2]))
ax.xaxis.set_minor_locator(matplotlib.ticker.NullLocator())
ax.xaxis.set_major_formatter(lambda v, _: f"{v:g}".replace(".", ","))
ax.set_xlabel("Odds ratio (escala log) · >1 aumenta la chance de recargo")
ax.set_title("Regresión logística: las 14 variables de mayor peso", loc="left", fontsize=11)
ax.tick_params(axis="y", labelsize=9)
estilo(ax, "x")
titular(fig, "El recargo depende sobre todo de la zona de origen; la hora y el clima casi no aportan",
        "Importancia por permutación en el período de prueba (3 repeticiones) y odds ratio de la regresión logística")
fig.tight_layout()
guardar(fig, "05_importancia_y_odds_ratio.png")

# (c) Árbol: primeros niveles de decisión
# Los árboles no dependen de la escala: se ajusta sin StandardScaler para que los umbrales se lean en
# unidades reales (mismas particiones que el modelo del pipeline).
dt_legible = modelo_final("Árbol de decisión").set_params(class_weight="balanced").fit(Xtr, ytr)
fig, ax = plt.subplots(figsize=(16, 6.5))
plot_tree(dt_legible, max_depth=2, feature_names=[f.replace("_", " ") for f in FEATS_A],
          class_names=["sin recargo", "con recargo"], filled=True, proportion=True, impurity=False,
          rounded=True, fontsize=9, ax=ax, precision=2)
titular(fig, "Las primeras reglas del árbol de decisión",
        "Tres primeros niveles · en las dummies, '≤ 0.5' significa 'no' · value = proporción [sin, con] recargo "
        "ponderada por los pesos de clase")
guardar(fig, "06_arbol_primeros_niveles.png")

# (d) Utilidad práctica: captura de recargos por decil de riesgo
p_rf = probas[("Random forest", "pesos")]
dec = pd.DataFrame({"y": yte.values, "p": p_rf})
dec["decil"] = pd.qcut(dec["p"].rank(method="first", ascending=False), 10, labels=range(1, 11))
tabla_dec = dec.groupby("decil", observed=True).agg(tasa=("y", "mean"), positivos=("y", "sum"))
tabla_dec["captura_acum"] = tabla_dec["positivos"].cumsum() / dec["y"].sum()
tabla_dec["lift"] = tabla_dec["tasa"] / dec["y"].mean()
tabla_dec.to_csv(RES / "A_deciles_riesgo.csv")
M["A_deciles"] = tabla_dec.reset_index().astype({"decil": int}).to_dict("records")

fig, ax = plt.subplots(figsize=(9, 4.4))
ax.bar(tabla_dec.index.astype(int), tabla_dec["tasa"], color=[NARANJA] * 2 + ["#E3B48F"] * 8, width=0.7)
ax.axhline(dec["y"].mean(), color="#404040", ls="--", lw=1)
ax.text(10.4, dec["y"].mean(), f"promedio {pct(dec['y'].mean())}", va="bottom", ha="right", fontsize=9)
for d, r in tabla_dec.iterrows():
    ax.text(int(d), r["tasa"] + 0.003, pct(r["tasa"]), ha="center", fontsize=9)
ax.set_xticks(range(1, 11), [f"D{i}" for i in range(1, 11)])
ax.set_xlabel("Decil de riesgo predicho (D1 = 10% de cotizaciones con mayor probabilidad)")
ax.set_ylabel("Tasa real de recargo")
ax.yaxis.set_major_formatter(lambda v, _: f"{v:.0%}")
estilo(ax, "y")
titular(fig, f"El 20% de mayor riesgo concentra el {pct(tabla_dec['captura_acum'].iloc[1])} de los recargos",
        "Random forest con pesos de clase · período de prueba · tasa real de recargo en cada decil de probabilidad predicha")
guardar(fig, "07_deciles_riesgo.png")

# (e) Por qué validar por fecha: la misma receta con partición aleatoria da métricas infladas
X_all, y_all = lyft[FEATS_A], lyft["has_surge"]
Xa_tr, Xa_te, ya_tr, ya_te = train_test_split(X_all, y_all, test_size=0.25, stratify=y_all, random_state=SEED)
comparacion = []
for nombre in ["Árbol de decisión", "Random forest"]:
    p_aleat = pipe_clf(modelo_final(nombre), "pesos").fit(Xa_tr, ya_tr).predict_proba(Xa_te)[:, 1]
    comparacion.append({"modelo": nombre,
                        "roc_auc_aleatoria": roc_auc_score(ya_te, p_aleat),
                        "pr_auc_aleatoria": average_precision_score(ya_te, p_aleat),
                        "roc_auc_temporal": roc_auc_score(yte, probas[(nombre, "pesos")]),
                        "pr_auc_temporal": average_precision_score(yte, probas[(nombre, "pesos")])})
M["A_particion"] = comparacion
log(f"partición aleatoria vs temporal: {comparacion}")

# ==============================================================================================
# PARTE B · price (regresión sobre log(price))
# ==============================================================================================
log("PARTE B · price")
# Codificación del servicio: se usa name_* (más detalle) y no is_uber/service_tier_ord, que name ya determina.
EXCLUIR_B = ["id", "datetime_local", "fecha", "price", "has_surge", "surge_multiplier", "log_surge",
             "is_uber", "service_tier_ord"]
FEATS_B = [c for c in df.columns if c not in EXCLUIR_B]
VARIANTES = {"sin surge": FEATS_B, "con surge": FEATS_B + ["log_surge"]}
y_log = np.log(df["price"])
tr_b, te_b = ~es_test, es_test
g_b = df.loc[tr_b, "fecha"]
M["B_datos"] = {"filas": int(len(df)), "train": int(tr_b.sum()), "test": int(te_b.sum()),
                "predictoras": len(FEATS_B)}

# Subconjunto para la búsqueda de hiperparámetros de los árboles (mismo criterio de grupos por fecha)
rng = np.random.default_rng(SEED)
idx_tr = np.flatnonzero(tr_b.values)
sub = rng.choice(idx_tr, size=min(150_000, len(idx_tr)), replace=False)

MODELOS_B = {
    "Ridge": (Pipeline([("escala", StandardScaler()), ("modelo", Ridge())]),
              {"modelo__alpha": [0.01, 0.1, 1, 10, 100, 1000]}, False),
    "Árbol de decisión": (DecisionTreeRegressor(random_state=SEED),
                          {"max_depth": [6, 10, 14, 18, 24], "min_samples_leaf": [5, 20, 100]}, True),
    "Random forest": (RandomForestRegressor(n_estimators=60, max_features=0.5, random_state=SEED, n_jobs=1),
                      {"max_depth": [12, 16, 24], "min_samples_leaf": [2, 5, 20]}, True),
}
mejores_b, tuning_b = {}, {}
Xb_full = df[VARIANTES["con surge"]]
for nombre, (modelo, grilla, en_submuestra) in MODELOS_B.items():
    filas_cv = sub if en_submuestra else idx_tr
    gs = GridSearchCV(modelo, grilla, cv=CV, n_jobs=-1, refit=False, scoring="neg_root_mean_squared_error",
                      return_train_score=True)
    gs.fit(Xb_full.iloc[filas_cv], y_log.iloc[filas_cv], groups=df["fecha"].iloc[filas_cv])
    res = pd.DataFrame(gs.cv_results_)
    res.to_csv(RES / f"B_busqueda_{nombre.split()[0].lower()}.csv", index=False)
    i = int(res["mean_test_score"].idxmax())
    mejores_b[nombre] = res.loc[i, "params"]
    tuning_b[nombre] = {"params": {k.replace("modelo__", ""): v for k, v in mejores_b[nombre].items()},
                        "rmse_log_cv": float(-res.loc[i, "mean_test_score"]),
                        "rmse_log_train": float(-res.loc[i, "mean_train_score"]),
                        "combinaciones": int(len(res)), "filas_busqueda": int(len(filas_cv))}
    log(f"{nombre}: mejores {mejores_b[nombre]} · RMSE log CV {tuning_b[nombre]['rmse_log_cv']:.4f}")
M["B_tuning"] = tuning_b


def metricas_reg(y_usd, pred_usd, y_l, pred_l):
    return {"mae": mean_absolute_error(y_usd, pred_usd),
            "rmse": float(np.sqrt(mean_squared_error(y_usd, pred_usd))),
            "r2": r2_score(y_usd, pred_usd), "r2_log": r2_score(y_l, pred_l),
            "mape": float(np.mean(np.abs(pred_usd - y_usd) / y_usd))}


precio_te = df.loc[te_b, "price"].values
# Línea base: mediana de precio de cada producto (solo "qué servicio pidió")
med_prod = df.loc[tr_b].assign(prod=df.loc[tr_b, GRUPOS["Producto"]].idxmax(axis=1)).groupby("prod")["price"].median()
pred_base = df.loc[te_b, GRUPOS["Producto"]].idxmax(axis=1).map(med_prod).values
regresion = [{"modelo": "Línea base: mediana por producto", "variante": "-",
              **metricas_reg(precio_te, pred_base, y_log[te_b], np.log(pred_base))}]
modelos_b, pred_b = {}, {}
for nombre, (modelo, _, _) in MODELOS_B.items():
    for variante, feats in VARIANTES.items():
        m = clone(modelo).set_params(**mejores_b[nombre])
        if nombre == "Random forest":
            m.set_params(n_estimators=150, n_jobs=-1)
        m.fit(df.loc[tr_b, feats], y_log[tr_b])
        pl = m.predict(df.loc[te_b, feats])
        # exp(predicción en log) estima la mediana condicional del precio
        regresion.append({"modelo": nombre, "variante": variante,
                          **metricas_reg(precio_te, np.exp(pl), y_log[te_b], pl)})
        modelos_b[(nombre, variante)] = m
        pred_b[(nombre, variante)] = np.exp(pl)
        log(f"{nombre} ({variante}): MAE {regresion[-1]['mae']:.3f} · R² {regresion[-1]['r2']:.4f}")
regresion = pd.DataFrame(regresion)
regresion.to_csv(RES / "B_regresion_test.csv", index=False)
M["B_regresion"] = regresion.to_dict("records")

# Error por producto del mejor modelo
mejor_b = regresion.iloc[1:].sort_values("mae").iloc[0]
clave_b = (mejor_b["modelo"], mejor_b["variante"])
prod_te = df.loc[te_b, GRUPOS["Producto"]].idxmax(axis=1).str.replace("name_", "").str.replace("_", " ").values
err = pd.DataFrame({"producto": prod_te, "real": precio_te, "pred": pred_b[clave_b]})
err["abs"] = (err["real"] - err["pred"]).abs()
por_prod = err.groupby("producto").agg(mae=("abs", "mean"), precio_medio=("real", "mean")).sort_values("precio_medio")
por_prod["mae_rel"] = por_prod["mae"] / por_prod["precio_medio"]
por_prod.to_csv(RES / "B_error_por_producto.csv")
M["B_mejor"] = {"modelo": clave_b[0], "variante": clave_b[1]}
M["B_por_producto"] = por_prod.reset_index().to_dict("records")

fig, axes = plt.subplots(1, 2, figsize=(13, 4.8), gridspec_kw={"width_ratios": [1, 1.2]})
ax = axes[0]
hb = ax.hexbin(err["real"], err["pred"], gridsize=60, cmap=CMAP, mincnt=1, bins="log", linewidths=0)
lim = [0, max(err["real"].max(), err["pred"].max()) * 1.02]
ax.plot(lim, lim, color=NARANJA, ls="--", lw=1.2)
ax.set_xlim(lim)
ax.set_ylim(lim)
ax.set_xlabel("Precio real (USD)")
ax.set_ylabel("Precio predicho (USD)")
ax.set_title(f"{clave_b[0]} ({clave_b[1]}) · R² {mejor_b['r2']:.3f} · MAE USD {mejor_b['mae']:.2f}".replace(".", ","),
             loc="left", fontsize=10.5)
estilo(ax, "both")
ax = axes[1]
cols = [AZUL if p in ["UberPool", "UberX", "WAV", "UberXL", "Black", "Black SUV"] else NARANJA for p in por_prod.index]
ax.barh(por_prod.index, por_prod["mae"], color=cols, height=0.65)
for yv, (p, r) in enumerate(por_prod.iterrows()):
    ax.text(r["mae"] + 0.02, yv, f"USD {r['mae']:.2f} ({pct(r['mae_rel'])})".replace(".", ",", 1), va="center", fontsize=8.5)
ax.set_xlabel("Error absoluto medio (USD) · entre paréntesis, relativo al precio medio")
ax.set_xlim(0, por_prod["mae"].max() * 1.45)
ax.set_title("Error por producto (azul: Uber · naranja: Lyft)", loc="left", fontsize=10.5)
estilo(ax, "x")
titular(fig, "El precio se predice con un error típico de pocos dólares",
        "Regresión sobre log(price) · período de prueba 15 al 18/12/2018 · Uber + Lyft")
fig.tight_layout()
guardar(fig, "08_regresion_real_vs_predicho.png")

# Importancia por familias (R² en log) para el random forest con surge, y comparación con el EDA (η²/R²)
rf_b = modelos_b[("Random forest", "con surge")]
muestra_te = df.loc[te_b].sample(n=min(40_000, int(te_b.sum())), random_state=SEED)
base_r2, imp_b = importancia_por_grupo(lambda X: rf_b.predict(X), muestra_te[VARIANTES["con surge"]],
                                       np.log(muestra_te["price"]), r2_score, GRUPOS)
imp_b.to_csv(RES / "B_importancia_grupos.csv", index=False)
M["B_importancia"] = {"base_r2_log": float(base_r2), "grupos": imp_b.to_dict("records")}

# Curvas tarifarias aprendidas: precio predicho por producto según distancia (sin recargo)
base_pd = df.loc[te_b].sample(n=min(3000, int(te_b.sum())), random_state=SEED)
distancias = np.round(np.arange(0.5, 6.01, 0.5), 2)
curvas = []
for prod in GRUPOS["Producto"]:
    for d in distancias:
        Xp = base_pd[VARIANTES["con surge"]].copy()
        Xp[GRUPOS["Producto"]] = 0
        Xp[prod] = 1
        Xp["distance"], Xp["log_distance"], Xp["straight_line_miles"], Xp["log_surge"] = d, np.log(d), d / 1.57, 0.0
        curvas.append({"producto": prod.replace("name_", "").replace("_", " "), "distancia": d,
                       "precio": float(np.median(np.exp(rf_b.predict(Xp))))})
curvas = pd.DataFrame(curvas)
curvas.to_csv(RES / "B_curvas_tarifa.csv", index=False)
PARES = [("Compartido", "UberPool", "Shared"), ("Estándar", "UberX", "Lyft"), ("XL", "UberXL", "Lyft XL"),
         ("Black", "Black", "Lux Black"), ("Black XL", "Black SUV", "Lux Black XL")]
dif_h2 = []
for nivel, u, l in PARES:
    pu = curvas[curvas["producto"] == u].set_index("distancia")["precio"]
    pl_ = curvas[curvas["producto"] == l].set_index("distancia")["precio"]
    dif_h2.append({"nivel": nivel, "uber": u, "lyft": l, "dif_lyft_vs_uber": float((pl_ / pu - 1).mean())})
M["B_h2"] = dif_h2

fig, axes = plt.subplots(1, 2, figsize=(13, 4.8), gridspec_kw={"width_ratios": [1, 1.25]})
ax = axes[0]
imp_plot = imp_b.iloc[::-1]
ax.barh(imp_plot["grupo"], imp_plot["caida"], color=AZUL, height=0.6)
for yv, v in enumerate(imp_plot["caida"]):
    ax.text(max(v, 0) + 0.01, yv, f"{v:.3f}".replace(".", ","), va="center", fontsize=9)
ax.set_xlabel("Caída de R² (log) al mezclar el grupo")
ax.set_title("Random forest (con surge): qué familia usa", loc="left", fontsize=11)
ax.set_xlim(0, imp_plot["caida"].max() * 1.2)
estilo(ax, "x")
ax = axes[1]
finales = []
for nivel, u, l in PARES:
    for prod, color in [(u, AZUL), (l, NARANJA)]:
        c = curvas[curvas["producto"] == prod]
        ax.plot(c["distancia"], c["precio"], color=color, lw=1.6)
        finales.append((c["precio"].iloc[-1], prod, color))
etiquetas_finales(ax, finales, 6.1, separacion=curvas["precio"].max() * 0.045)
ax.set_xlim(0.4, 7.3)
ax.set_xlabel("Distancia (millas)")
ax.set_ylabel("Precio predicho (USD, sin recargo)")
ax.set_title("Tarifa aprendida por el modelo para cada producto", loc="left", fontsize=11)
estilo(ax, "both")
titular(fig, "El producto y la distancia explican el precio; el momento y el clima casi no aportan",
        "Importancia por permutación en una muestra del período de prueba · curvas: mediana de la predicción variando solo producto y distancia")
fig.tight_layout()
guardar(fig, "09_importancia_precio_y_curvas.png")

# ==============================================================================================
# PARTE C · Segmentación de rutas con K-Means (complementario)
# ==============================================================================================
log("PARTE C · rutas")
df["origen"] = df[GRUPOS["Zona de origen"]].idxmax(axis=1).str.replace("source_", "").str.replace("_", " ")
df["destino"] = df[GRUPOS["Zona de destino"]].idxmax(axis=1).str.replace("destination_", "").str.replace("_", " ")
# UberX, WAV y Lyft: mismo nivel de servicio, para comparar el precio por milla entre rutas
estandar = df[df["service_tier_ord"] == 1].assign(ppm=lambda d: d["price"] / d["distance"])
rutas = estandar.groupby(["origen", "destino"]).agg(distancia=("distance", "mean"), precio_milla=("ppm", "median"))
lyft_r = df[(df["is_uber"] == 0) & (df["name_Shared"] == 0)]
rutas["tasa_recargo"] = lyft_r.groupby(["origen", "destino"])["has_surge"].mean()
rutas = rutas.dropna()
Z = StandardScaler().fit_transform(rutas[["distancia", "precio_milla", "tasa_recargo"]])
ks = list(range(2, 9))
inercia, silueta = [], []
for k in ks:
    km = KMeans(n_clusters=k, n_init=20, random_state=SEED).fit(Z)
    inercia.append(km.inertia_)
    silueta.append(silhouette_score(Z, km.labels_))
k_opt = ks[int(np.argmax(silueta))]
km = KMeans(n_clusters=k_opt, n_init=20, random_state=SEED).fit(Z)
rutas["cluster"] = km.labels_
perfil = rutas.groupby("cluster").agg(rutas=("distancia", "size"), distancia=("distancia", "mean"),
                                      precio_milla=("precio_milla", "mean"), tasa_recargo=("tasa_recargo", "mean"))
perfil = perfil.sort_values("precio_milla", ascending=False)
rutas.to_csv(RES / "C_rutas_clusters.csv")
perfil.to_csv(RES / "C_perfil_clusters.csv")
ejemplos = {int(c): [f"{o} → {d}" for o, d in g.sort_values("tasa_recargo", ascending=False).index[:3]]
            for c, g in rutas.groupby("cluster")}
M["C"] = {"rutas": int(len(rutas)), "k": int(k_opt), "inercia": [float(v) for v in inercia],
          "silueta": [float(v) for v in silueta], "perfil": perfil.reset_index().to_dict("records"),
          "ejemplos": ejemplos}

fig, axes = plt.subplots(1, 3, figsize=(15, 4.5), gridspec_kw={"width_ratios": [1, 1, 1.5]})
axes[0].plot(ks, inercia, "-o", color=AZUL)
axes[0].set_title("Método del codo (inercia)", loc="left", fontsize=11)
axes[0].set_xlabel("k")
axes[1].plot(ks, silueta, "-o", color=NARANJA)
axes[1].axvline(k_opt, color="#404040", ls="--", lw=1)
axes[1].set_ylim(0, 0.6)
axes[1].set_title("Coeficiente de silueta (casi plano)", loc="left", fontsize=11)
axes[1].set_xlabel("k")
paleta = [AZUL, NARANJA, VERDE, "#7A5195", "#B5B5B5", "#D4A017", "#2F4B7C", "#A05195"]
for c, g in rutas.groupby("cluster"):
    axes[2].scatter(g["precio_milla"], g["tasa_recargo"], s=25 + 25 * g["distancia"], color=paleta[c],
                    alpha=0.8, label=f"Grupo {c + 1} ({len(g)} rutas)", edgecolor="white")
axes[2].set_xlabel("Precio mediano por milla, nivel Estándar (USD)")
axes[2].set_ylabel("Tasa de recargo en Lyft")
axes[2].yaxis.set_major_formatter(lambda v, _: f"{v:.0%}")
axes[2].set_title("Rutas por grupo (tamaño = distancia media)", loc="left", fontsize=11)
axes[2].legend(frameon=False, fontsize=8.5)
for ax in axes:
    estilo(ax, "both")
titular(fig, f"Las {len(rutas)} rutas se ordenan en {k_opt} perfiles tarifarios",
        "K-Means sobre distancia media, precio por milla y tasa de recargo (variables estandarizadas)")
fig.tight_layout()
guardar(fig, "10_kmeans_rutas.png")

# ==============================================================================================
# DATASETS DE MODELADO (salida de la Entrega 3)
# ==============================================================================================
if not RAPIDO:
    DS = AQUI / "datasets"
    DS.mkdir(exist_ok=True)
    surge_out = lyft[["id", "datetime_local", "fecha"] + FEATS_A + ["has_surge"]].copy()
    surge_out.insert(3, "particion", np.where(test_a, "test", "train"))
    price_out = df[["id", "datetime_local", "fecha"] + VARIANTES["con surge"] + ["surge_multiplier", "price"]].copy()
    price_out.insert(3, "particion", np.where(es_test, "test", "train"))
    price_out["log_price"] = np.log(price_out["price"])
    for tabla_out, nombre in [(surge_out, "dataset_modelado_surge"), (price_out, "dataset_modelado_price")]:
        tabla_out.to_csv(DS / f"{nombre}.zip", index=False,
                         compression={"method": "zip", "archive_name": f"{nombre}.csv"})
        log(f"{nombre}: {tabla_out.shape[0]:,} x {tabla_out.shape[1]}")
    pred_out = lyft.loc[test_a, ["id", "datetime_local", "has_surge"]].copy()
    for nombre in MODELOS_A:
        pred_out[f"prob_{nombre.split()[0].lower()}"] = probas[(nombre, "pesos")]
        pred_out[f"pred_{nombre.split()[0].lower()}"] = (probas[(nombre, "pesos")] >= umbrales[nombre]).astype(int)
    pred_out.to_csv(RES / "A_predicciones_test.csv", index=False)
    M["datasets"] = {"surge": list(surge_out.shape), "price": list(price_out.shape)}

# ----------------------------------------------------------------------------------------------
with open(RES / ("metricas_rapido.json" if RAPIDO else "metricas.json"), "w", encoding="utf-8") as f:
    json.dump(M, f, ensure_ascii=False, indent=2, default=lambda o: o.item() if hasattr(o, "item") else str(o))
log("listo")
