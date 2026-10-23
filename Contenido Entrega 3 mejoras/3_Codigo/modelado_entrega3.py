"""Entrega 3 — Modelado y análisis de resultados · Grupo 11 · Ciencia de Datos 5K1 (UTN FRC).

Entrada : Contenido Entrega 2/Dataset Codificado/dataset_codificado.zip  (636.568 filas x 71 columnas)
Salidas (dentro de "Contenido Entrega 3 mejoras"):
  4_Datasets/   datasets de modelado y datasets balanceados
  5_Graficos/   figuras, numeradas igual que en el informe
  6_Resultados/ métricas (metricas.json) y tablas CSV

Parte A · has_surge  -> clasificación binaria (Lyft sin Shared). Regresión logística, árbol de decisión,
                        random forest y gradient boosting; 4 técnicas de balanceo (cada una con su propia
                        búsqueda de hiperparámetros), elección del modelo por validación y ajuste del umbral.
                        Se compara contra líneas base triviales y contra la tasa histórica de la zona
                        de origen, y se verifica si balancear hace falta cuando el umbral ya se ajusta.
                        El umbral de decisión se elige con una matriz de beneficio (costo de una falsa
                        alarma frente al recargo evitado), con un análisis de sensibilidad del costo.
Parte B · price      -> regresión sobre log(price) (Uber + Lyft). Ridge, árbol y random forest, cada uno
                        con y sin surge_multiplier (cada variante con su propia búsqueda).
Parte C · productos  -> familias tarifarias de los 12 productos con K-Means (tarifa base y precio por
                        milla; codo + silueta).

Validación (compromiso de la Entrega 2): las filas no son independientes (comparten recargo por ruta y
minuto), así que NO se separa al azar.
  · Prueba final: fechas del 15 al 18/12/2018 (holdout temporal). No se usa para elegir nada.
  · Búsqueda de hiperparámetros y elección de modelos: validación temporal EN ORDEN dentro del
    entrenamiento (las fechas se agrupan en 5 bloques consecutivos; el fold i entrena con los bloques
    1..i y valida con el i+1: nunca se valida con fechas anteriores a las de entrenamiento).

Modelos lineales: cada grupo one-hot pierde una columna de referencia (equivale a drop_first, pero con la
referencia elegida para que se pueda interpretar): zona South Station (su tasa de recargo, 8,0%, es la
del promedio), producto Lyft (has_surge) o UberX (price), franja Mañana y clima Clear.

Uso: python modelado_entrega3.py            (completo, ~15 min con 10 núcleos)
     python modelado_entrega3.py --rapido   (muestra del 15% y grillas chicas, ~2 min; escribe en una
                                             carpeta temporal para no pisar los resultados oficiales)
Memoria: las búsquedas de random forest y gradient boosting corren con pocos procesos en paralelo
(N_JOBS_PESADO) para no agotar la RAM. Si la máquina tiene poca memoria, bajarlo a 1 o 2.
"""
import json
import sys
import tempfile
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
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import (accuracy_score, average_precision_score, balanced_accuracy_score, classification_report,
                             confusion_matrix, mean_absolute_error, mean_squared_error,
                             precision_recall_curve, r2_score, roc_auc_score, roc_curve,
                             silhouette_score)
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler, TargetEncoder
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, plot_tree

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

RAPIDO = "--rapido" in sys.argv
N_JOBS_PESADO = 2 if RAPIDO else 8      # procesos en paralelo para random forest y gradient boosting
SLUG = {"Regresión logística": "logistica", "Árbol de decisión": "arbol", "Random forest": "random_forest",
        "Gradient boosting": "gradient_boosting", "Ridge": "ridge"}
AQUI = Path(__file__).resolve().parent          # 3_Codigo
RAIZ = AQUI.parent                               # Contenido Entrega 3 mejoras
ENTRADA = RAIZ.parent / "Contenido Entrega 2" / "Dataset Codificado" / "dataset_codificado.zip"
SALIDA = Path(tempfile.gettempdir()) / "entrega3_rapido" if RAPIDO else RAIZ
GRAF = SALIDA / "5_Graficos"
RES = SALIDA / "6_Resultados"
DS = SALIDA / "4_Datasets" / "datasets modelado"
DSB = SALIDA / "4_Datasets" / "datasets balanceados"
for carpeta in (GRAF, RES, DS, DSB):
    carpeta.mkdir(parents=True, exist_ok=True)
for viejo in RES.glob("*.csv"):  # los nombres de las búsquedas cambiaron: se limpian los CSV anteriores
    viejo.unlink()

SEED = 42
FECHAS_TEST = ["2018-12-15", "2018-12-16", "2018-12-17", "2018-12-18"]
M = {}  # métricas que alimentan el informe
T0 = time.time()


def log(msg):
    print(f"[{time.time() - T0:6.0f}s] {msg}", flush=True)


class FechasEnOrden:
    """Validación temporal en orden. Agrupa las fechas en n_splits + 1 bloques consecutivos con una
    cantidad parecida de filas; el fold i entrena con los bloques 1..i y valida con el bloque i+1.
    Cada fecha cae entera en un solo bloque y nunca se valida con el pasado del entrenamiento."""

    def __init__(self, n_splits=4):
        self.n_splits = n_splits

    def get_n_splits(self, X=None, y=None, groups=None):
        return self.n_splits

    def bloques(self, groups):
        conteo = pd.Series(np.asarray(groups)).value_counts().sort_index()
        acumulado = (conteo.cumsum() / conteo.sum()).values
        bloque = np.clip(np.ceil(acumulado * (self.n_splits + 1) - 1e-9).astype(int) - 1, 0, self.n_splits)
        return dict(zip(conteo.index, bloque))

    def split(self, X, y=None, groups=None):
        mapa = self.bloques(groups)
        b = pd.Series(np.asarray(groups)).map(mapa).values
        assert len(set(mapa.values())) == self.n_splits + 1, "algún bloque de fechas quedó vacío"
        for i in range(self.n_splits):
            yield np.flatnonzero(b <= i), np.flatnonzero(b == i + 1)


CV = FechasEnOrden(n_splits=4)


# ----------------------------------------------------------------------------------------------
# Estilo de gráficos (mismo criterio visual que la Entrega 2). Calibri viene instalada en Windows;
# en macOS está dentro de Microsoft Word. Si no se encuentra, se usa DejaVu Sans (no cambia nada más).
# ----------------------------------------------------------------------------------------------
for ruta_fuente in Path("/Applications/Microsoft Word.app/Contents/Resources/DFonts").glob("[Cc]alibri*.ttf"):
    font_manager.fontManager.addfont(str(ruta_fuente))
FUENTE = "Calibri" if any(f.name == "Calibri" for f in font_manager.fontManager.ttflist) else "DejaVu Sans"
plt.rcParams.update({"font.family": FUENTE, "font.size": 11, "axes.titlesize": 12,
                     "axes.labelcolor": "#404040", "xtick.color": "#404040", "ytick.color": "#404040"})
AZUL, NARANJA, VERDE, VIOLETA, GRIS = "#1F5F8B", "#C0692E", "#4E8F5B", "#7A5195", "#8C8C8C"
COLOR_MODELO = {"Regresión logística": AZUL, "Árbol de decisión": NARANJA, "Random forest": VERDE,
                "Gradient boosting": VIOLETA, "Ridge": AZUL}
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


def quitar_columnas(X, cols):
    return X.drop(columns=[c for c in cols if c in X.columns])


def texto_params(params):
    return " · ".join(f"{k}={v}" for k, v in params.items())


# ----------------------------------------------------------------------------------------------
# Carga y variables auxiliares
# ----------------------------------------------------------------------------------------------
log(f"cargando {ENTRADA.name}")
df = pd.read_csv(ENTRADA)
M["dataset"] = {"filas": int(len(df)), "columnas": int(df.shape[1])}
df["fecha"] = df["datetime_local"].str[:10]
# La hora es cíclica (23 h está al lado de 0 h): seno y coseno se la presentan así a los modelos lineales.
df["hour_sin"] = np.sin(2 * np.pi * df["hour_local"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hour_local"] / 24)
df["log_distance"] = np.log(df["distance"])
df["log_surge"] = np.log(df["surge_multiplier"])
df["origen"] = df.filter(like="source_").idxmax(axis=1).str.replace("source_", "").str.replace("_", " ")
df["destino"] = df.filter(like="destination_").idxmax(axis=1).str.replace("destination_", "").str.replace("_", " ")
df["ruta"] = df["origen"] + " → " + df["destino"]
if RAPIDO:
    df = df.sample(frac=0.15, random_state=SEED).reset_index(drop=True)
es_test = df["fecha"].isin(FECHAS_TEST)

GRUPOS = {
    "Ruta (tasa histórica)": ["ruta"],
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
# Categorías de referencia de los modelos lineales (una columna menos por grupo one-hot)
REFERENCIA = ["source_South_Station", "destination_South_Station", "time_slot_Mañana", "short_summary_Clear"]
REF_A = REFERENCIA + ["name_Lyft"]
REF_B = REFERENCIA + ["name_UberX"]
M["referencias"] = {"zona": "South Station", "producto_recargo": "Lyft", "producto_precio": "UberX",
                    "franja": "Mañana", "clima": "Clear"}


def importancia_por_grupo(predecir, X, y, metrica, grupos, repeticiones=3):
    """Importancia por permutación de familias de variables: cuánto empeora la métrica al mezclar
    todas las columnas de un grupo a la vez (las dummies de un mismo grupo se mueven juntas).
    Se calcula con el modelo ya entrenado: solo sirve para interpretar, no se ajusta nada."""
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


def resumen_pruebas(res, metrica, mayor_es_mejor, simple, compleja, prefijo="modelo__"):
    """Arma la tabla de 'pruebas realizadas' de un modelo: la configuración elegida, la segunda mejor,
    una más simple y una más compleja, con su puntaje de validación y de entrenamiento."""
    res = res.copy()
    res["params_txt"] = res["params"].map(lambda p: texto_params({k.replace(prefijo, ""): v for k, v in p.items()}))
    orden = res.sort_values(f"mean_test_{metrica}", ascending=not mayor_es_mejor)
    filas, vistos = [], set()

    def agregar(fila, rol):
        if fila["params_txt"] in vistos:
            return
        vistos.add(fila["params_txt"])
        filas.append({"rol": rol, "params": fila["params_txt"],
                      "validacion": float(abs(fila[f"mean_test_{metrica}"])),
                      "entrenamiento": float(abs(fila[f"mean_train_{metrica}"]))})

    agregar(orden.iloc[0], "Elegida (mejor en validación)")
    agregar(orden.iloc[1], "Segunda mejor")
    for rol, objetivo in [("Más simple", simple), ("Más compleja", compleja)]:
        objetivo = {f"{prefijo}{k}": v for k, v in objetivo.items()}
        coincide = res[res["params"].map(lambda p: all(p.get(k) == v for k, v in objetivo.items()))]
        if len(coincide):
            agregar(coincide.iloc[0], rol)
    return filas


# ==============================================================================================
# PARTE A · has_surge (clasificación binaria con balanceo)
# ==============================================================================================
log("PARTE A · has_surge")
lyft = df[(df["is_uber"] == 0) & (df["name_Shared"] == 0)].reset_index(drop=True)
# Fuga de datos: price y surge_multiplier contienen la respuesta. is_uber y service_tier_ord son
# constantes o redundantes con name_* dentro de Lyft. Se quitan las columnas constantes (productos Uber).
EXCLUIR_A = ["id", "datetime_local", "fecha", "has_surge", "price", "surge_multiplier", "log_surge",
             "is_uber", "service_tier_ord", "log_distance", "origen", "destino"]
FEATS_A = [c for c in lyft.columns if c not in EXCLUIR_A and lyft[c].nunique() > 1]
FEATS_A_NUM = [c for c in FEATS_A if c != "ruta"]
test_a = lyft["fecha"].isin(FECHAS_TEST)
Xtr, ytr, gtr = lyft.loc[~test_a, FEATS_A], lyft.loc[~test_a, "has_surge"], lyft.loc[~test_a, "fecha"]
Xte, yte = lyft.loc[test_a, FEATS_A], lyft.loc[test_a, "has_surge"]
bloques = CV.bloques(gtr)
M["A_datos"] = {
    "filas": int(len(lyft)), "predictoras": len(FEATS_A), "positivos": int(lyft["has_surge"].sum()),
    "tasa": float(lyft["has_surge"].mean()), "train": int(len(Xtr)), "test": int(len(Xte)),
    "tasa_train": float(ytr.mean()), "tasa_test": float(yte.mean()),
    "fechas_train": int(gtr.nunique()), "fechas_test": len(FECHAS_TEST),
    "bloques_cv": [{"bloque": int(b) + 1, "fechas": [f for f, v in bloques.items() if v == b],
                    "filas": int(gtr.map(bloques).eq(b).sum())} for b in sorted(set(bloques.values()))],
    "tasa_por_origen": lyft.groupby("origen")["has_surge"].mean().sort_values().to_dict(),
}
log(f"Lyft sin Shared: {len(lyft):,} filas · {len(FEATS_A)} predictoras · train {len(Xtr):,} · test {len(Xte):,}")

# Matriz de beneficio (USD por cotización, comparado con no tener modelo). Supuestos del equipo:
#   VP: el pasajero avisado evita el recargo (comparando con Uber o esperando unos minutos), pero pierde el
#       tiempo de comparar: recargo medio - costo.
#   FP: compara o espera sin necesidad: -costo.
#   FN y VN: nada cambia respecto de no tener el modelo: 0.
# El recargo medio se mide en USD con las cotizaciones con recargo del entrenamiento. El costo de una falsa
# alarma es un supuesto (unos 5 minutos de tiempo); por eso se informa también la sensibilidad a ese valor.
con_recargo_tr = lyft.loc[~test_a & (lyft["has_surge"] == 1)]
RECARGO_MEDIO = float((con_recargo_tr["price"] - con_recargo_tr["price"] / con_recargo_tr["surge_multiplier"]).mean())
COSTO_FALSA_ALARMA = 1.0
COSTOS_SENSIBILIDAD = [0.5, 1.0, 1.5, 2.0, 3.0]
M["A_matriz_beneficio"] = {"recargo_medio": RECARGO_MEDIO, "costo_falsa_alarma": COSTO_FALSA_ALARMA,
                           "vp": RECARGO_MEDIO - COSTO_FALSA_ALARMA, "fp": -COSTO_FALSA_ALARMA, "fn": 0.0, "vn": 0.0,
                           "precision_minima": COSTO_FALSA_ALARMA / RECARGO_MEDIO}
log(f"matriz de beneficio: recargo medio USD {RECARGO_MEDIO:.2f} · costo falsa alarma USD {COSTO_FALSA_ALARMA:.2f}")
log(f"bloques de validación: {[(b['fechas'][0], b['fechas'][-1], b['filas']) for b in M['A_datos']['bloques_cv']]}")


def preprocesador(lineal, con_ruta=True):
    """Tasa histórica de recargo de la ruta (TargetEncoder: se calcula solo con las filas de
    entrenamiento de cada ajuste, con validación cruzada interna para no filtrar la respuesta)
    + el resto de las predictoras. Los modelos lineales pierden una categoría de referencia por grupo."""
    numericas = [c for c in FEATS_A_NUM if not (lineal and c in REF_A)]
    partes = [("resto", "passthrough", numericas)]
    if con_ruta:
        partes.insert(0, ("ruta", TargetEncoder(target_type="binary", random_state=SEED), ["ruta"]))
    return ColumnTransformer(partes, verbose_feature_names_out=False).set_output(transform="pandas")


def pipe_clf(modelo, tecnica, con_ruta=True):
    """Preprocesamiento -> escalado -> (balanceo) -> modelo. El balanceo vive dentro del pipeline de
    imblearn: solo se aplica al ajustar (entrenamiento de cada fold); la evaluación es sobre datos reales."""
    lineal = isinstance(modelo, LogisticRegression)
    pasos = [("prep", preprocesador(lineal, con_ruta)), ("escala", StandardScaler().set_output(transform="pandas"))]
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
            "accuracy_balanceada": balanced_accuracy_score(y, pred),
            "precision": rep["1"]["precision"], "recall": rep["1"]["recall"], "f1": rep["1"]["f1-score"],
            "f1_macro": rep["macro avg"]["f1-score"], "f1_weighted": rep["weighted avg"]["f1-score"],
            "roc_auc": roc_auc_score(y, proba), "pr_auc": average_precision_score(y, proba),
            "alertas": float(pred.mean()),  # proporción de cotizaciones marcadas "con recargo"
            "beneficio_1000": beneficio(y, proba, umbral),
            "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}


def beneficio(y, proba, umbral, costo=COSTO_FALSA_ALARMA):
    """Beneficio en USD cada 1.000 cotizaciones según la matriz de beneficio (VN y FN valen 0)."""
    aviso = np.asarray(proba) >= umbral
    y = np.asarray(y)
    vp, fp = int((aviso & (y == 1)).sum()), int((aviso & (y == 0)).sum())
    return float((vp * (RECARGO_MEDIO - costo) - fp * costo) / len(y) * 1000)


def umbral_beneficio(y, proba, costo=COSTO_FALSA_ALARMA):
    """Umbral que maximiza el beneficio. Incluye 'no avisar nunca' (umbral 1), que vale 0."""
    candidatos = np.append(np.unique(np.quantile(proba, np.linspace(0, 1, 801))), 1.0)
    valores = [beneficio(y, proba, t, costo) for t in candidatos]
    k = int(np.argmax(valores))
    return float(candidatos[k]), float(valores[k])


def umbral_f1(y, proba):
    """Umbral que maximiza el F1 de la clase 'con recargo'. Devuelve (umbral, F1)."""
    prec, rec, thr = precision_recall_curve(y, proba)
    f1 = 2 * prec * rec / np.clip(prec + rec, 1e-12, None)
    k = int(np.nanargmax(f1[:-1]))
    return float(thr[k]), float(f1[k])


def validacion_temporal(pipe, X, y, g):
    """Predicciones de validación de cada fold temporal (para elegir el umbral sin mirar la prueba)."""
    indices, probas_val, ap = [], [], []
    for i_tr, i_va in CV.split(X, y, g):
        p = clone(pipe).fit(X.iloc[i_tr], y.iloc[i_tr]).predict_proba(X.iloc[i_va])[:, 1]
        indices.append(i_va)
        probas_val.append(p)
        ap.append(average_precision_score(y.iloc[i_va], p))
    return np.concatenate(indices), np.concatenate(probas_val), float(np.mean(ap))


# --- A.0 Líneas base ---------------------------------------------------------------------------
base = []
for nombre, estrategia in [("Siempre 'sin recargo'", "most_frequent"), ("Siempre 'con recargo'", "constant"),
                           ("Azar con la tasa real", "stratified")]:
    dummy = DummyClassifier(strategy=estrategia, constant=1, random_state=SEED).fit(Xtr, ytr)
    base.append({"modelo": nombre, **metricas_clf(yte, dummy.predict_proba(Xte)[:, 1])})
# Línea base informada, sin modelo: la tasa de recargo de la zona de origen en el entrenamiento.
# Es lo mínimo que tiene que superar un modelo para decir que aprende algo más que "dónde sube".
# El umbral se elige con la matriz de beneficio sobre el entrenamiento, igual que en los modelos.
tasa_origen = lyft.loc[~test_a].groupby("origen")["has_surge"].mean()
s_tr = lyft.loc[~test_a, "origen"].map(tasa_origen).values
s_te = lyft.loc[test_a, "origen"].map(tasa_origen).fillna(ytr.mean()).values
umbral_origen, _ = umbral_beneficio(ytr, s_tr)
base.append({"modelo": "Tasa histórica de la zona de origen", **metricas_clf(yte, s_te, umbral_origen)})
M["A_lineas_base"] = base

# --- A.1 Búsqueda de hiperparámetros: una por modelo y por técnica de balanceo ------------------
TECNICAS = {"sin": "Sin balanceo", "rus": "Submuestreo (RUS 1:1)", "smote": "Sobremuestreo (SMOTE 1:1)",
            "pesos": "Pesos de clase (balanced)"}
# (modelo, grilla, procesos en paralelo, configuración "más simple", configuración "más compleja")
# Las grillas se extendieron hasta que el valor elegido quedara adentro y no en un extremo: si el mejor
# valor es el borde de la grilla, el óptimo podría estar más allá y el parámetro no queda justificado.
MODELOS_A = {
    "Regresión logística": (LogisticRegression(max_iter=3000, solver="lbfgs"),
                            {"modelo__C": [0.00001, 0.00003, 0.0001, 0.0003, 0.001, 0.01, 0.1, 1, 10]}, -1,
                            {"C": 0.00001}, {"C": 10}),
    "Árbol de decisión": (DecisionTreeClassifier(random_state=SEED),
                          {"modelo__max_depth": [3, 5, 7, 9, 12, 15, 20, 25, 30, 40],
                           "modelo__min_samples_leaf": [20, 100, 500, 1000, 2000],
                           "modelo__criterion": ["gini", "entropy"]}, -1,
                          {"max_depth": 3, "min_samples_leaf": 2000, "criterion": "gini"},
                          {"max_depth": 40, "min_samples_leaf": 20, "criterion": "gini"}),
    "Random forest": (RandomForestClassifier(n_estimators=150, max_features="sqrt", random_state=SEED, n_jobs=1),
                      {"modelo__max_depth": [7, 10, 16, 24], "modelo__min_samples_leaf": [5, 10, 50]},
                      N_JOBS_PESADO, {"max_depth": 7, "min_samples_leaf": 50},
                      {"max_depth": 24, "min_samples_leaf": 5}),
    "Gradient boosting": (HistGradientBoostingClassifier(max_iter=200, min_samples_leaf=100, l2_regularization=1.0,
                                                         early_stopping=False, random_state=SEED),
                          {"modelo__learning_rate": [0.02, 0.05, 0.1],
                           "modelo__max_leaf_nodes": [7, 15, 31]},
                          N_JOBS_PESADO, {"learning_rate": 0.02, "max_leaf_nodes": 7},
                          {"learning_rate": 0.1, "max_leaf_nodes": 31}),
}
if RAPIDO:
    MODELOS_A["Árbol de decisión"][1].update({"modelo__max_depth": [3, 9, 20, 40], "modelo__criterion": ["gini"]})
    MODELOS_A["Random forest"][0].set_params(n_estimators=40)
    MODELOS_A["Gradient boosting"][0].set_params(max_iter=60)

mejores_a, tuning_a, pruebas_a, busquedas = {}, {}, {}, {}
for nombre, (modelo, grilla, n_jobs, simple, compleja) in MODELOS_A.items():
    mejores_a[nombre], tuning_a[nombre] = {}, {}
    todas = []
    for clave, etiqueta in TECNICAS.items():
        gs = GridSearchCV(pipe_clf(modelo, clave), grilla, cv=CV, n_jobs=n_jobs, refit=False,
                          scoring={"pr_auc": "average_precision", "roc_auc": "roc_auc"}, return_train_score=True)
        gs.fit(Xtr, ytr, groups=gtr)
        res = pd.DataFrame(gs.cv_results_)
        i = int(res["mean_test_pr_auc"].idxmax())
        mejores_a[nombre][clave] = {k.replace("modelo__", ""): v for k, v in res.loc[i, "params"].items()}
        tuning_a[nombre][clave] = {"params": mejores_a[nombre][clave], "combinaciones": int(len(res)),
                                   "pr_auc_cv": float(res.loc[i, "mean_test_pr_auc"]),
                                   "pr_auc_cv_std": float(res.loc[i, "std_test_pr_auc"]),
                                   "roc_auc_cv": float(res.loc[i, "mean_test_roc_auc"]),
                                   "pr_auc_train": float(res.loc[i, "mean_train_pr_auc"])}
        busquedas[(nombre, clave)] = res
        todas.append(res.assign(tecnica=etiqueta))
        log(f"{nombre} · {etiqueta}: {mejores_a[nombre][clave]} · PR-AUC val {tuning_a[nombre][clave]['pr_auc_cv']:.3f}")
    pd.concat(todas).drop(columns="params").to_csv(RES / f"recargo_busqueda_{SLUG[nombre]}.csv", index=False)
M["A_tuning"] = tuning_a

# --- Elección de la técnica de balanceo y del modelo: por validación, sin mirar la prueba ----------
# Se elige el par (modelo, técnica) con mayor PR-AUC en validación. Todas las técnicas tuvieron su propia
# búsqueda de hiperparámetros, así que se comparan cada una con su mejor configuración.
pares = {(m, t): tuning_a[m][t]["pr_auc_cv"] for m in MODELOS_A for t in TECNICAS}
ELEGIDO, TEC_FINAL = max(pares, key=pares.get)
M["A_elegido"] = ELEGIDO
M["A_tecnica_elegida"] = {"clave": TEC_FINAL, "nombre": TECNICAS[TEC_FINAL], "pr_auc_val": pares[(ELEGIDO, TEC_FINAL)],
                          "mejor_por_modelo": {m: TECNICAS[max(TECNICAS, key=lambda t: tuning_a[m][t]["pr_auc_cv"])]
                                               for m in MODELOS_A}}
log(f"elegido por validación: {ELEGIDO} + {TECNICAS[TEC_FINAL]} (PR-AUC val {pares[(ELEGIDO, TEC_FINAL)]:.4f})")
for nombre, (_, _, _, simple, compleja) in MODELOS_A.items():
    pruebas_a[nombre] = resumen_pruebas(busquedas[(nombre, TEC_FINAL)], "pr_auc", True, simple, compleja)
M["A_pruebas"] = pruebas_a

# Curva de validación del árbol (pesos de clase): entrenamiento vs validación según la profundidad
res_arbol = busquedas[("Árbol de decisión", TEC_FINAL)]
mejor_hoja = mejores_a["Árbol de decisión"][TEC_FINAL]["min_samples_leaf"]
mejor_crit = mejores_a["Árbol de decisión"][TEC_FINAL]["criterion"]
curva = res_arbol[(res_arbol["param_modelo__min_samples_leaf"] == mejor_hoja)
                  & (res_arbol["param_modelo__criterion"] == mejor_crit)].copy()
curva["prof"] = curva["param_modelo__max_depth"].astype(int)
curva = curva.sort_values("prof")
fig, ax = plt.subplots(figsize=(8.5, 4.4))
ax.plot(curva["prof"], curva["mean_train_pr_auc"], "-o", color=GRIS, label="Entrenamiento")
ax.plot(curva["prof"], curva["mean_test_pr_auc"], "-o", color=NARANJA, label="Validación (fechas posteriores)")
ax.fill_between(curva["prof"], curva["mean_test_pr_auc"] - curva["std_test_pr_auc"],
                curva["mean_test_pr_auc"] + curva["std_test_pr_auc"], color=NARANJA, alpha=0.15)
ax.axvline(mejores_a["Árbol de decisión"][TEC_FINAL]["max_depth"], color="#404040", ls="--", lw=1)
ax.axhline(M["A_datos"]["tasa_train"], color=GRIS, ls=":", lw=1)
ax.text(curva["prof"].max(), M["A_datos"]["tasa_train"] + 0.003, "azar = tasa de recargo", ha="right",
        va="bottom", fontsize=9, color=GRIS)
ax.set_xticks(curva["prof"])
ax.set_xlabel("Profundidad máxima del árbol (max_depth)")
ax.set_ylabel("PR-AUC")
ax.legend(frameon=False, loc="upper left")
estilo(ax, "y")
titular(fig, "A mayor profundidad, entrenamiento y validación se separan: el árbol empieza a memorizar",
        f"PR-AUC en entrenamiento y validación temporal en orden (4 folds) · {TECNICAS[TEC_FINAL].lower()} · "
        f"min_samples_leaf = {mejor_hoja}, criterio = {mejor_crit}")
guardar(fig, "fig03_recargo_validacion_profundidad.png")

# --- A.2 Laboratorio de balanceo (cada técnica con sus propios hiperparámetros) ----------------
def modelo_final(nombre, tecnica):
    modelo = clone(MODELOS_A[nombre][0]).set_params(**mejores_a[nombre][tecnica])
    if nombre == "Random forest":
        modelo.set_params(n_jobs=-1)
    return modelo


# Distribución de clases que ve el modelo al entrenar con cada técnica
dist = []
Xtr_esc = StandardScaler().fit_transform(Xtr[FEATS_A_NUM])
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

balanceo, probas, pipes_finales = [], {}, {}
for nombre in MODELOS_A:
    for clave, etiqueta in TECNICAS.items():
        pipe = pipe_clf(modelo_final(nombre, clave), clave).fit(Xtr, ytr)
        p = pipe.predict_proba(Xte)[:, 1]
        probas[(nombre, clave)] = p
        if clave == TEC_FINAL:
            pipes_finales[nombre] = pipe
        balanceo.append({"modelo": nombre, "tecnica": etiqueta, "pr_auc_validacion": tuning_a[nombre][clave]["pr_auc_cv"],
                         **metricas_clf(yte, p)})
        log(f"{nombre} · {etiqueta}: recall {balanceo[-1]['recall']:.3f} · F1 {balanceo[-1]['f1']:.3f} · "
            f"PR-AUC {balanceo[-1]['pr_auc']:.3f}")
balanceo = pd.DataFrame(balanceo)
balanceo.to_csv(RES / "recargo_balanceo_test.csv", index=False)
M["A_balanceo"] = balanceo.to_dict("records")

fig, axes = plt.subplots(1, 2, figsize=(14, 4.6), gridspec_kw={"width_ratios": [1, 1.7]})
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
    sub_b = balanceo[balanceo["tecnica"] == etiqueta]
    xs = np.arange(len(sub_b)) + (j - 1.5) * ancho
    color = ["#BFC9D1", "#8FA9BF", "#E3A774", NARANJA][j]
    barras = ax.bar(xs, sub_b["recall"], ancho * 0.95, color=color, label=etiqueta)
    for b in barras:
        ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 0.015, pct(b.get_height()), ha="center",
                fontsize=7, color="#404040")
ax.set_xticks(np.arange(len(MODELOS_A)), list(MODELOS_A))
ax.set_ylabel("Recall de la clase 'con recargo' (umbral 0,5)")
ax.set_ylim(0, 1.08)
ax.yaxis.set_major_formatter(lambda v, _: f"{v:.0%}")
ax.legend(frameon=False, ncol=2, fontsize=8.5, loc="upper left")
ax.set_title("Cuántos recargos detecta cada combinación en el período de prueba", loc="left", fontsize=11)
estilo(ax, "y")
titular(fig, "Sin balanceo, ningún modelo detecta el recargo: el modelo aprende a decir siempre que no",
        "Lyft sin Shared · entrenamiento: fechas hasta el 14/12 · prueba: 15 al 18/12/2018 · el balanceo se aplica solo al entrenamiento")
fig.tight_layout()
guardar(fig, "fig04_recargo_balanceo.png")

# --- A.3 Elección del modelo (por validación) y umbral de decisión ------------------------------
# Umbral de cada modelo (con la técnica elegida) a partir de sus predicciones de validación: el que
# maximiza el beneficio de la matriz de beneficio. El umbral de máximo F1 se guarda para comparar.
finales_a, umbrales, aporte_ruta, val_preds = {}, {}, [], {}
for nombre in MODELOS_A:
    pipe = pipe_clf(modelo_final(nombre, TEC_FINAL), TEC_FINAL)
    idx_val, p_val, ap_con = validacion_temporal(pipe, Xtr, ytr, gtr)
    val_preds[nombre] = (ytr.iloc[idx_val].values, p_val)
    umbral_f1_val, f1_val = umbral_f1(ytr.iloc[idx_val], p_val)
    umbrales[nombre], benef_val = umbral_beneficio(ytr.iloc[idx_val].values, p_val)
    p = probas[(nombre, TEC_FINAL)]
    finales_a[nombre] = {"umbral_0.5": metricas_clf(yte, p, 0.5), "umbral_f1": metricas_clf(yte, p, umbral_f1_val),
                         "umbral_opt": metricas_clf(yte, p, umbrales[nombre]), "f1_validacion": f1_val,
                         "beneficio_validacion": benef_val,
                         "pr_auc_validacion": tuning_a[nombre][TEC_FINAL]["pr_auc_cv"]}
    # Aporte de la tasa histórica de la ruta: mismo modelo sin esa variable
    _, _, ap_sin = validacion_temporal(pipe_clf(modelo_final(nombre, TEC_FINAL), TEC_FINAL, con_ruta=False), Xtr, ytr, gtr)
    p_sin = pipe_clf(modelo_final(nombre, TEC_FINAL), TEC_FINAL, con_ruta=False).fit(Xtr, ytr).predict_proba(Xte)[:, 1]
    aporte_ruta.append({"modelo": nombre, "pr_auc_val_con": ap_con, "pr_auc_val_sin": ap_sin,
                        "pr_auc_test_con": average_precision_score(yte, p),
                        "pr_auc_test_sin": average_precision_score(yte, p_sin)})
    log(f"{nombre}: umbral {umbrales[nombre]:.3f} -> F1 test {finales_a[nombre]['umbral_opt']['f1']:.3f} · "
        f"ruta: PR-AUC val {ap_sin:.3f} -> {ap_con:.3f}")
M["A_finales"] = finales_a
M["A_aporte_ruta"] = aporte_ruta

# ¿Hace falta balancear si el umbral ya se ajusta? El mismo algoritmo sin balanceo (con sus propios
# hiperparámetros) y con el umbral elegido por la misma validación temporal, contra la técnica elegida.
sin_balanceo_umbral = []
for nombre in MODELOS_A:
    idx_val, p_val, _ = validacion_temporal(pipe_clf(modelo_final(nombre, "sin"), "sin"), Xtr, ytr, gtr)
    umbral_sin, _ = umbral_beneficio(ytr.iloc[idx_val].values, p_val)
    sin_balanceo_umbral.append({"modelo": nombre,
                                "sin_balanceo": metricas_clf(yte, probas[(nombre, "sin")], umbral_sin),
                                "tecnica_elegida": finales_a[nombre]["umbral_opt"]})
    log(f"{nombre} sin balanceo + umbral {umbral_sin:.3f}: beneficio test "
        f"{sin_balanceo_umbral[-1]['sin_balanceo']['beneficio_1000']:.0f} USD/1000")
M["A_sin_balanceo_umbral"] = sin_balanceo_umbral

# Sensibilidad al costo de una falsa alarma (modelo elegido): el umbral se vuelve a elegir en validación
# para cada costo y se mide en la prueba. Una alerta conviene si la probabilidad de recargo supera
# costo / recargo medio, así que cuanto más cuesta una falsa alarma, más selectivo tiene que ser el modelo.
y_val_el, p_val_el = val_preds[ELEGIDO]
sensibilidad = []
for costo in COSTOS_SENSIBILIDAD:
    t, b_val = umbral_beneficio(y_val_el, p_val_el, costo)
    r = metricas_clf(yte, probas[(ELEGIDO, TEC_FINAL)], t)
    sensibilidad.append({"costo": costo, "umbral": t, "beneficio_validacion": b_val,
                         "beneficio_1000": beneficio(yte, probas[(ELEGIDO, TEC_FINAL)], t, costo),
                         "precision_minima": costo / RECARGO_MEDIO, **{k: r[k] for k in
                         ("alertas", "accuracy", "accuracy_balanceada", "precision", "recall", "tp", "fp")}})
M["A_sensibilidad_costo"] = sensibilidad
log(f"sensibilidad: {[(s['costo'], round(s['umbral'], 3), round(s['beneficio_1000'])) for s in sensibilidad]}")

# Puntos de operación: hasta dónde se pueden bajar los falsos negativos y a cuántos falsos positivos cuesta.
# Para cada % de recargos que se quiere detectar, el umbral se fija en validación y se mide en la prueba.
p_el_test = probas[(ELEGIDO, TEC_FINAL)]
puntos = []
for objetivo in [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]:
    t = float(np.quantile(p_val_el[y_val_el == 1], 1 - objetivo))
    r = metricas_clf(yte, p_el_test, t)
    puntos.append({"recall_objetivo": objetivo, "umbral": t, **{k: r[k] for k in
                   ("recall", "precision", "alertas", "accuracy", "accuracy_balanceada", "tp", "fp", "fn", "tn",
                    "beneficio_1000")}})
M["A_puntos_operacion"] = puntos
# Techo del dominio: la mejor precisión que logra el modelo detectando al menos el 5% de los recargos
pr_te, rc_te, _ = precision_recall_curve(yte, p_el_test)
M["A_precision_maxima"] = {"precision": float(pr_te[rc_te >= 0.05].max()), "recall_minimo": 0.05}


def bootstrap_ic(grupos, calcular, n=1000):
    """IC 95% por bootstrap de bloques: se remuestrean horas completas, porque las cotizaciones de una misma
    hora comparten el recargo y no son independientes (remuestrear filas sueltas daría intervalos optimistas)."""
    rng = np.random.default_rng(SEED)
    _, inversa = np.unique(np.asarray(grupos), return_inverse=True)
    por_bloque = [np.flatnonzero(inversa == k) for k in range(inversa.max() + 1)]
    valores = np.array([calcular(np.concatenate([por_bloque[k] for k in rng.integers(0, len(por_bloque), len(por_bloque))]))
                        for _ in range(n)])
    return np.percentile(valores, 2.5, axis=0), np.percentile(valores, 97.5, axis=0), len(por_bloque)


# Niveles de certeza del modelo elegido en la prueba (con su umbral) y de su ventaja sobre la zona de origen
horas_te = lyft.loc[test_a, "datetime_local"].str[:13].values
y_np, aviso_el, umbral_el = yte.values, p_el_test >= umbrales[ELEGIDO], umbrales[ELEGIDO]
NOMBRES_IC_A = ["accuracy", "accuracy_balanceada", "precision", "recall", "f1", "roc_auc", "pr_auc", "beneficio_1000",
                "pr_auc_zona_origen", "ventaja_pr_auc_sobre_zona"]


def metricas_ic_a(idx):
    y_b, p_b, a_b = y_np[idx], p_el_test[idx], aviso_el[idx]
    tp, fp = (a_b & (y_b == 1)).sum(), (a_b & (y_b == 0)).sum()
    fn, tn = ((~a_b) & (y_b == 1)).sum(), ((~a_b) & (y_b == 0)).sum()
    prec, rec = tp / max(tp + fp, 1), tp / max(tp + fn, 1)
    ap, ap_zona = average_precision_score(y_b, p_b), average_precision_score(y_b, s_te[idx])
    return [(tp + tn) / len(idx), (rec + tn / max(tn + fp, 1)) / 2, prec, rec, 2 * prec * rec / max(prec + rec, 1e-12),
            roc_auc_score(y_b, p_b), ap, beneficio(y_b, p_b, umbral_el), ap_zona, ap - ap_zona]


bajo, alto, n_bloques = bootstrap_ic(horas_te, metricas_ic_a)
punto = metricas_ic_a(np.arange(len(y_np)))
M["A_ic95"] = {"modelo": ELEGIDO, "bloques": n_bloques, "replicas": 1000,
               "metricas": {k: {"valor": float(v), "bajo": float(b), "alto": float(a)}
                            for k, v, b, a in zip(NOMBRES_IC_A, punto, bajo, alto)}}
log(f"IC 95% ({n_bloques} horas): " + ", ".join(f"{k} {v:.3f} [{b:.3f}; {a:.3f}]"
                                               for k, v, b, a in zip(NOMBRES_IC_A, punto, bajo, alto)))
M["A_seleccion"] = [{"modelo": m, "params": texto_params(mejores_a[m][TEC_FINAL]),
                     "pr_auc_val": tuning_a[m][TEC_FINAL]["pr_auc_cv"], "pr_auc_val_std": tuning_a[m][TEC_FINAL]["pr_auc_cv_std"],
                     "roc_auc_val": tuning_a[m][TEC_FINAL]["roc_auc_cv"], "pr_auc_train": tuning_a[m][TEC_FINAL]["pr_auc_train"],
                     "f1_val": finales_a[m]["f1_validacion"]} for m in MODELOS_A]
log(f"modelo elegido por validación: {ELEGIDO}")

# Reporte de clasificación completo (macro y weighted) de los modelos finales
filas_rep = []
for nombre in MODELOS_A:
    pred = (probas[(nombre, TEC_FINAL)] >= umbrales[nombre]).astype(int)
    rep = classification_report(yte, pred, output_dict=True, zero_division=0)
    for clase in ["0", "1", "macro avg", "weighted avg"]:
        filas_rep.append({"modelo": nombre, "clase": clase, "precision": rep[clase]["precision"],
                          "recall": rep[clase]["recall"], "f1": rep[clase]["f1-score"],
                          "soporte": int(rep[clase]["support"])})
pd.DataFrame(filas_rep).to_csv(RES / "recargo_reporte_clasificacion.csv", index=False)
M["A_reporte"] = filas_rep

# Matrices de confusión de los modelos finales
fig, axes = plt.subplots(1, len(MODELOS_A), figsize=(17, 4.2))
for ax, nombre in zip(axes, MODELOS_A):
    r = finales_a[nombre]["umbral_opt"]
    cm = np.array([[r["tn"], r["fp"]], [r["fn"], r["tp"]]])
    ax.imshow(cm / cm.sum(axis=1, keepdims=True), cmap=CMAP, vmin=0, vmax=1)
    for i in range(2):
        for j in range(2):
            v = cm[i, j] / cm[i].sum()
            etiqueta = [["VN · acierto", "FP · falsa alarma"], ["FN · no detectado", "VP · detectado"]][i][j]
            ax.text(j, i, f"{etiqueta}\n{cm[i, j]:,}".replace(",", ".") + f"\n{pct(v)} de la fila", ha="center",
                    va="center", fontsize=9.5, color="white" if v > 0.55 else "#1A1A1A")
    ax.set_xticks([0, 1], ["Sin recargo", "Con recargo"])
    ax.set_yticks([0, 1], ["Sin recargo", "Con recargo"])
    ax.set_xlabel("Predicho")
    ax.set_ylabel("Real")
    marca = "  (elegido)" if nombre == ELEGIDO else ""
    ax.set_title(f"{nombre}{marca}\numbral {r['umbral']:.2f} · recall {pct(r['recall'])} · precisión {pct(r['precision'])}",
                 fontsize=10.5, loc="left")
    for s in ax.spines.values():
        s.set_visible(False)
titular(fig, "Matrices de confusión en el período de prueba (15 al 18/12)",
        "Modelos finales: hiperparámetros por validación temporal, pesos de clase y umbral elegido con la matriz de beneficio en esa validación")
fig.tight_layout()
guardar(fig, "fig05_recargo_matrices_confusion.png")

# Matriz de beneficio: valor de cada casilla, beneficio según el umbral y sensibilidad al costo
p_el = probas[(ELEGIDO, TEC_FINAL)]
coma = lambda v, d=2: f"{v:.{d}f}".replace(".", ",")
fig, axes = plt.subplots(1, 3, figsize=(17, 4.6), gridspec_kw={"width_ratios": [0.8, 1.35, 1]})
ax = axes[0]
valores = np.array([[0.0, -COSTO_FALSA_ALARMA], [0.0, RECARGO_MEDIO - COSTO_FALSA_ALARMA]])
ax.imshow(np.sign(valores), cmap=LinearSegmentedColormap.from_list("b", ["#F4C7A8", "#FFFFFF", "#A9CDE6"]),
          vmin=-1, vmax=1)
textos = [["VN · no avisa, no hay recargo\nUSD 0", f"FP · falsa alarma\n-USD {coma(COSTO_FALSA_ALARMA)}"],
          ["FN · recargo no avisado\nUSD 0 (igual que sin modelo)",
           f"VP · recargo evitado\n+USD {coma(RECARGO_MEDIO - COSTO_FALSA_ALARMA)}"]]
for i in range(2):
    for j in range(2):
        ax.text(j, i, textos[i][j], ha="center", va="center", fontsize=9.5)
ax.set_xticks([0, 1], ["Predice sin recargo", "Predice con recargo"])
ax.set_yticks([0, 1], ["Sin recargo", "Con recargo"])
ax.set_ylabel("Real")
ax.set_title("Matriz de beneficio (USD por cotización)", loc="left", fontsize=11)
for s in ax.spines.values():
    s.set_visible(False)
ax = axes[1]
grilla_t = np.linspace(np.quantile(p_el, 0.02), min(1.0, np.quantile(p_el, 0.9995)), 300)
ax.plot(grilla_t, [beneficio(yte, p_el, t) for t in grilla_t], color=VIOLETA, lw=2, label="Prueba")
ax.plot(grilla_t, [beneficio(y_val_el, p_val_el, t) for t in grilla_t], color=GRIS, lw=1.4, ls="--",
        label="Validación (elige el umbral)")
ax.axhline(0, color="#404040", lw=0.8)
ax.axvline(umbrales[ELEGIDO], color=VIOLETA, ls=":", lw=1.2)
r_opt = finales_a[ELEGIDO]["umbral_opt"]
ax.annotate(f"umbral elegido {coma(umbrales[ELEGIDO])}\nUSD {r_opt['beneficio_1000']:.0f} cada 1.000 cotizaciones",
            (umbrales[ELEGIDO], r_opt["beneficio_1000"]), xytext=(10, 12), textcoords="offset points", fontsize=9)
r_f1 = finales_a[ELEGIDO]["umbral_f1"]
ax.scatter([r_f1["umbral"]], [r_f1["beneficio_1000"]], color=NARANJA, zorder=3,
           label=f"Umbral de máximo F1 ({coma(r_f1['umbral'])})")
ax.set_xlabel("Umbral de decisión (puntaje mínimo para avisar)")
ax.set_ylabel("Beneficio (USD cada 1.000 cotizaciones)")
ax.set_title(f"{ELEGIDO}: beneficio según el umbral", loc="left", fontsize=11)
ax.legend(frameon=False, fontsize=8.5, loc="lower left")
estilo(ax, "both")
ax = axes[2]
sens = pd.DataFrame(sensibilidad)
barras = ax.bar([f"USD {coma(c)}" for c in sens["costo"]], sens["beneficio_1000"],
                color=[VIOLETA if c == COSTO_FALSA_ALARMA else "#C9B8D6" for c in sens["costo"]], width=0.6)
for b, (_, s) in zip(barras, sens.iterrows()):
    texto = "no conviene\navisar" if s["alertas"] == 0 else f"umbral {coma(s['umbral'])}\navisa {pct(s['alertas'])}"
    ax.text(b.get_x() + b.get_width() / 2, max(b.get_height(), 0) + 4, texto, ha="center", va="bottom", fontsize=8)
ax.axhline(0, color="#404040", lw=0.8)
ax.set_ylim(min(0, sens["beneficio_1000"].min()) - 10, sens["beneficio_1000"].max() * 1.45 + 10)
ax.set_xlabel("Costo supuesto de una falsa alarma")
ax.set_ylabel("Beneficio en la prueba (USD / 1.000)")
ax.set_title("Sensibilidad al costo de una falsa alarma", loc="left", fontsize=11)
estilo(ax, "y")
titular(fig, "La matriz de beneficio elige el umbral: avisar solo cuando el recargo esperado compensa la falsa alarma",
        f"Recargo medio evitado USD {coma(RECARGO_MEDIO)} (entrenamiento) · costo supuesto de una falsa alarma USD "
        f"{coma(COSTO_FALSA_ALARMA)} · conviene avisar si la probabilidad de recargo supera "
        f"{pct(COSTO_FALSA_ALARMA / RECARGO_MEDIO)}")
fig.tight_layout()
guardar(fig, "fig06_recargo_matriz_beneficio.png")

# Curvas ROC y Precisión-Recall
fig, axes = plt.subplots(1, 2, figsize=(12.5, 4.8))
for nombre in MODELOS_A:
    p = probas[(nombre, TEC_FINAL)]
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
guardar(fig, "fig07_recargo_curvas_roc_pr.png")

# --- A.4 Interpretación (con los modelos ya entrenados; la prueba no se usa para ajustar nada) ---
# (a) Importancia por familias de variables del modelo elegido (caída de PR-AUC al permutar)
pipe_elegido = pipes_finales[ELEGIDO]
base_ap, imp_a = importancia_por_grupo(lambda X: pipe_elegido.predict_proba(X)[:, 1], Xte, yte,
                                       average_precision_score, GRUPOS)
imp_a.to_csv(RES / "recargo_importancia_grupos.csv", index=False)
M["A_importancia"] = {"modelo": ELEGIDO, "base_pr_auc": float(base_ap), "grupos": imp_a.to_dict("records")}

# (b) Coeficientes de la regresión logística (odds ratio contra la categoría de referencia).
# La logística elegida por validación usa una C muy chica (regularización fuerte), que encoge los
# coeficientes hacia 0 y los odds ratio hacia 1. Para interpretar se ajusta la misma logística con
# regularización débil (C = 1); los odds ratio de la elegida se guardan para comparar.
C_INTERPRETAR = 1.0
lr_pipe = pipe_clf(LogisticRegression(C=C_INTERPRETAR, max_iter=3000, solver="lbfgs"), TEC_FINAL).fit(Xtr, ytr)
nombres_lr = list(lr_pipe.named_steps["prep"].get_feature_names_out())
binaria = lr_pipe.named_steps["prep"].transform(Xtr).isin([0, 1]).all()


def comparacion_lr(c):
    if not binaria[c]:
        return "+1 desvío"
    for prefijo, ref in [("source_", "South Station"), ("destination_", "South Station"), ("name_", "Lyft"),
                         ("time_slot_", "Mañana"), ("short_summary_", "Clear")]:
        if c.startswith(prefijo):
            return f"vs {ref}"
    return "sí vs no"


def tabla_odds(pipe):
    """Dummies: OR de pasar de la referencia (o de "no") a esa categoría. Continuas: OR por un desvío."""
    coef = pd.Series(pipe.named_steps["modelo"].coef_[0], index=nombres_lr)
    desv = pd.Series(pipe.named_steps["escala"].scale_, index=nombres_lr)
    tabla = pd.DataFrame({"coef_estandarizado": coef,
                          "odds_ratio": np.where(binaria, np.exp(coef / desv), np.exp(coef)),
                          "tipo": [comparacion_lr(c) for c in nombres_lr]})
    return tabla.reindex(tabla["coef_estandarizado"].abs().sort_values(ascending=False).index)


odds = tabla_odds(lr_pipe)
odds_elegida = tabla_odds(pipes_finales["Regresión logística"])
odds.assign(odds_ratio_logistica_elegida=odds_elegida["odds_ratio"]).to_csv(RES / "recargo_odds_ratio_logistica.csv")
M["A_odds"] = odds.reset_index(names="variable").to_dict("records")
M["A_odds_elegida"] = odds_elegida.reset_index(names="variable").to_dict("records")
M["A_odds_info"] = {"C_interpretar": C_INTERPRETAR, "C_elegida": mejores_a["Regresión logística"][TEC_FINAL]["C"],
                    "pr_auc_test_interpretar": average_precision_score(yte, lr_pipe.predict_proba(Xte)[:, 1])}

fig, axes = plt.subplots(1, 2, figsize=(13.5, 5.2), gridspec_kw={"width_ratios": [1, 1.25]})
ax = axes[0]
imp_plot = imp_a.iloc[::-1]
ax.barh(imp_plot["grupo"], imp_plot["caida"], xerr=imp_plot["desvio"], color=NARANJA, height=0.6,
        error_kw={"ecolor": "#404040", "lw": 1})
for yv, (v, e) in enumerate(zip(imp_plot["caida"], imp_plot["desvio"])):
    ax.text(max(v, 0) + e + 0.001, yv + 0.22, f"{v:.3f}".replace(".", ","), va="bottom", fontsize=9)
ax.axvline(0, color="#404040", lw=0.8)
ax.set_xlabel("Caída de PR-AUC al mezclar el grupo")
ax.set_title(f"{ELEGIDO} (elegido): qué familia de variables usa", loc="left", fontsize=11)
estilo(ax, "x")
ax = axes[1]
top = odds.head(14).iloc[::-1]
etiquetas = [f"{i.replace('source_', 'origen: ').replace('destination_', 'destino: ').replace('_', ' ')}"
             f"  ({t})" for i, t in zip(top.index, top["tipo"])]
ax.barh(etiquetas, top["odds_ratio"] - 1, left=1, color=[NARANJA if v > 1 else AZUL for v in top["odds_ratio"]],
        height=0.6)
ax.axvline(1, color="#404040", lw=1)
ax.set_xscale("log")
ax.xaxis.set_major_locator(matplotlib.ticker.FixedLocator([0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3]))
ax.xaxis.set_minor_locator(matplotlib.ticker.NullLocator())
ax.xaxis.set_major_formatter(lambda v, _: f"{v:g}".replace(".", ","))
ax.set_xlabel("Odds ratio (escala log) · >1 aumenta la chance de recargo")
ax.set_title(f"Regresión logística (C = {C_INTERPRETAR:g}): las 14 variables de mayor peso", loc="left", fontsize=11)
ax.tick_params(axis="y", labelsize=9)
estilo(ax, "x")
titular(fig, "El recargo depende sobre todo del lugar (ruta y zona de origen); la hora y el clima casi no aportan",
        "Importancia por permutación en el período de prueba (3 repeticiones; el modelo ya está entrenado) · "
        "odds ratio contra South Station (zona con la tasa promedio), con regularización débil para no encogerlos")
fig.tight_layout()
guardar(fig, "fig08_recargo_importancia_odds_ratio.png")

# (c) Árbol: primeros niveles de decisión. Los árboles no dependen de la escala: se dibuja sobre los
# datos sin estandarizar para que los umbrales se lean en unidades reales.
prep_dt = preprocesador(lineal=False).fit(Xtr, ytr)
dt_legible = modelo_final("Árbol de decisión", TEC_FINAL)
if TEC_FINAL == "pesos":
    dt_legible.set_params(class_weight="balanced")
dt_legible.fit(prep_dt.transform(Xtr), ytr)
fig, ax = plt.subplots(figsize=(16, 6.5))
plot_tree(dt_legible, max_depth=2, feature_names=[f.replace("_", " ") for f in prep_dt.get_feature_names_out()],
          class_names=["sin recargo", "con recargo"], filled=True, proportion=True, impurity=False,
          rounded=True, fontsize=9, ax=ax, precision=3)
titular(fig, "Las primeras reglas del árbol de decisión",
        "Tres primeros niveles · ruta = tasa histórica de recargo de la ruta en el entrenamiento · en las dummies, "
        "'≤ 0.5' significa 'no' · value = proporción [sin, con] recargo ponderada por los pesos de clase")
guardar(fig, "fig09_recargo_arbol_reglas.png")

# (d) Utilidad práctica: captura de recargos por decil de riesgo (modelo elegido)
dec = pd.DataFrame({"y": yte.values, "p": probas[(ELEGIDO, TEC_FINAL)]})
dec["decil"] = pd.qcut(dec["p"].rank(method="first", ascending=False), 10, labels=range(1, 11))
tabla_dec = dec.groupby("decil", observed=True).agg(tasa=("y", "mean"), positivos=("y", "sum"))
tabla_dec["captura_acum"] = tabla_dec["positivos"].cumsum() / dec["y"].sum()
tabla_dec["lift"] = tabla_dec["tasa"] / dec["y"].mean()
tabla_dec.to_csv(RES / "recargo_deciles_riesgo.csv")
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
        f"{ELEGIDO} con pesos de clase · período de prueba · tasa real de recargo en cada decil de probabilidad predicha")
guardar(fig, "fig10_recargo_deciles_riesgo.png")

# (e) Por qué validar por fecha: la misma receta con partición aleatoria da métricas infladas
X_all, y_all = lyft[FEATS_A], lyft["has_surge"]
Xa_tr, Xa_te, ya_tr, ya_te = train_test_split(X_all, y_all, test_size=0.25, stratify=y_all, random_state=SEED)
comparacion = []
for nombre in ["Árbol de decisión", "Random forest", "Gradient boosting"]:
    p_aleat = pipe_clf(modelo_final(nombre, TEC_FINAL), TEC_FINAL).fit(Xa_tr, ya_tr).predict_proba(Xa_te)[:, 1]
    comparacion.append({"modelo": nombre,
                        "roc_auc_aleatoria": roc_auc_score(ya_te, p_aleat),
                        "pr_auc_aleatoria": average_precision_score(ya_te, p_aleat),
                        "roc_auc_temporal": roc_auc_score(yte, probas[(nombre, TEC_FINAL)]),
                        "pr_auc_temporal": average_precision_score(yte, probas[(nombre, TEC_FINAL)])})
M["A_particion"] = comparacion
log(f"partición aleatoria vs temporal: {comparacion}")

# (f) Validación cruzada mezclada (StratifiedKFold, 5 folds, con mezcla) como complemento de la temporal.
# En cada fold el balanceo se aplica solo a los 4 folds de entrenamiento (pipeline de imblearn) y el fold
# de validación conserva la proporción real de recargos. Se compara con la validación cruzada temporal en
# orden, que es la que se usa para elegir: la mezcla deja cotizaciones del mismo minuto y ruta a ambos lados.
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
cv_mezclada = []
for nombre in MODELOS_A:
    res = cross_validate(pipe_clf(modelo_final(nombre, TEC_FINAL), TEC_FINAL), Xtr, ytr, cv=skf,
                         scoring={"pr_auc": "average_precision", "roc_auc": "roc_auc"},
                         n_jobs=1 if nombre == "Random forest" else 5)
    cv_mezclada.append({"modelo": nombre,
                        "pr_auc_mezclada": float(res["test_pr_auc"].mean()),
                        "pr_auc_mezclada_std": float(res["test_pr_auc"].std()),
                        "roc_auc_mezclada": float(res["test_roc_auc"].mean()),
                        "pr_auc_temporal": tuning_a[nombre][TEC_FINAL]["pr_auc_cv"],
                        "pr_auc_temporal_std": tuning_a[nombre][TEC_FINAL]["pr_auc_cv_std"],
                        "roc_auc_temporal": tuning_a[nombre][TEC_FINAL]["roc_auc_cv"]})
    log(f"{nombre}: CV mezclada PR-AUC {cv_mezclada[-1]['pr_auc_mezclada']:.3f} · "
        f"CV temporal {cv_mezclada[-1]['pr_auc_temporal']:.3f}")
M["A_cv_mezclada"] = cv_mezclada

# ==============================================================================================
# PARTE B · price (regresión sobre log(price))
# ==============================================================================================
log("PARTE B · price")
# Codificación del servicio: se usa name_* (más detalle) y no is_uber/service_tier_ord, que name ya determina.
EXCLUIR_B = ["id", "datetime_local", "fecha", "price", "has_surge", "surge_multiplier", "log_surge",
             "is_uber", "service_tier_ord", "origen", "destino", "ruta"]
FEATS_B = [c for c in df.columns if c not in EXCLUIR_B]
VARIANTES = {"sin surge": FEATS_B, "con surge": FEATS_B + ["log_surge"]}
y_log = np.log(df["price"])
tr_b, te_b = ~es_test, es_test
M["B_datos"] = {"filas": int(len(df)), "train": int(tr_b.sum()), "test": int(te_b.sum()),
                "predictoras": len(FEATS_B)}

# Subconjunto para la búsqueda de hiperparámetros de los árboles (cada ajuste sobre ~500 mil filas
# tarda minutos); el modelo final se reentrena con el entrenamiento completo.
rng = np.random.default_rng(SEED)
idx_tr = np.flatnonzero(tr_b.values)
sub = np.sort(rng.choice(idx_tr, size=min(150_000, len(idx_tr)), replace=False))

# (modelo, grilla, usar submuestra, procesos, configuración "más simple", "más compleja")
# Grillas extendidas para que el valor elegido quede adentro y no en un extremo (ver parte A).
MODELOS_B = {
    "Ridge": (Pipeline([("referencia", FunctionTransformer(quitar_columnas, kw_args={"cols": REF_B})),
                        ("escala", StandardScaler()), ("modelo", Ridge())]),
              {"modelo__alpha": [0.01, 0.1, 1, 10, 100, 1000, 10_000, 100_000]}, False, -1,
              {"alpha": 100_000}, {"alpha": 0.01}),
    "Árbol de decisión": (DecisionTreeRegressor(random_state=SEED),
                          {"max_depth": [6, 10, 14, 18, 24, 30], "min_samples_leaf": [5, 20, 100, 300]}, True, -1,
                          {"max_depth": 6, "min_samples_leaf": 300}, {"max_depth": 30, "min_samples_leaf": 5}),
    "Random forest": (RandomForestRegressor(n_estimators=60, max_features=0.5, random_state=SEED, n_jobs=1),
                      {"max_depth": [12, 16, 24, 32], "min_samples_leaf": [2, 5, 20, 50]}, True, N_JOBS_PESADO,
                      {"max_depth": 12, "min_samples_leaf": 50}, {"max_depth": 32, "min_samples_leaf": 2}),
}
mejores_b, tuning_b, pruebas_b = {}, {}, {}
for nombre, (modelo, grilla, en_submuestra, n_jobs, simple, compleja) in MODELOS_B.items():
    filas_cv = sub if en_submuestra else idx_tr
    prefijo = "modelo__" if nombre == "Ridge" else ""
    mejores_b[nombre], tuning_b[nombre] = {}, {}
    todas = []
    for variante, feats in VARIANTES.items():
        gs = GridSearchCV(modelo, grilla, cv=CV, n_jobs=n_jobs, refit=False, scoring="neg_root_mean_squared_error",
                          return_train_score=True)
        gs.fit(df[feats].iloc[filas_cv], y_log.iloc[filas_cv], groups=df["fecha"].iloc[filas_cv])
        res = pd.DataFrame(gs.cv_results_)
        i = int(res["mean_test_score"].idxmax())
        mejores_b[nombre][variante] = res.loc[i, "params"]
        tuning_b[nombre][variante] = {"params": {k.replace(prefijo, ""): v for k, v in res.loc[i, "params"].items()},
                                      "rmse_log_cv": float(-res.loc[i, "mean_test_score"]),
                                      "rmse_log_train": float(-res.loc[i, "mean_train_score"]),
                                      "combinaciones": int(len(res)), "filas_busqueda": int(len(filas_cv))}
        todas.append(res.assign(variante=variante))
        if variante == "con surge":
            # El score es -RMSE: más alto es mejor
            pruebas_b[nombre] = resumen_pruebas(res, "score", True, simple, compleja, prefijo=prefijo)
        log(f"{nombre} ({variante}): {tuning_b[nombre][variante]['params']} · RMSE log val "
            f"{tuning_b[nombre][variante]['rmse_log_cv']:.4f}")
    pd.concat(todas).drop(columns="params").to_csv(RES / f"precio_busqueda_{SLUG[nombre]}.csv", index=False)
M["B_tuning"] = tuning_b
M["B_pruebas"] = pruebas_b


def metricas_reg(y_usd, pred_usd, y_l, pred_l):
    return {"mae": mean_absolute_error(y_usd, pred_usd),
            "rmse": float(np.sqrt(mean_squared_error(y_usd, pred_usd))),
            "r2": r2_score(y_usd, pred_usd), "r2_log": r2_score(y_l, pred_l),
            "mape": float(np.mean(np.abs(pred_usd - y_usd) / y_usd)),
            # "Eficacia" en términos simples: porcentaje de viajes cuyo precio se predijo con error ≤ 10%
            "dentro_10pct": float(np.mean(np.abs(pred_usd - y_usd) / y_usd <= 0.10))}


precio_te = df.loc[te_b, "price"].values
# Línea base: mediana de precio de cada producto (solo "qué servicio pidió")
med_prod = df.loc[tr_b].assign(prod=df.loc[tr_b, GRUPOS["Producto"]].idxmax(axis=1)).groupby("prod")["price"].median()
pred_base = df.loc[te_b, GRUPOS["Producto"]].idxmax(axis=1).map(med_prod).values
regresion = [{"modelo": "Línea base: mediana por producto", "variante": "-",
              **metricas_reg(precio_te, pred_base, y_log[te_b], np.log(pred_base))}]
modelos_b, pred_b = {}, {}
for nombre, (modelo, *_) in MODELOS_B.items():
    for variante, feats in VARIANTES.items():
        m = clone(modelo).set_params(**mejores_b[nombre][variante])
        if nombre == "Random forest":
            m.set_params(n_estimators=150, n_jobs=-1)
        m.fit(df.loc[tr_b, feats], y_log[tr_b])
        pl = m.predict(df.loc[te_b, feats])
        # exp(predicción en log) estima la mediana condicional del precio
        regresion.append({"modelo": nombre, "variante": variante,
                          "rmse_log_validacion": tuning_b[nombre][variante]["rmse_log_cv"],
                          **metricas_reg(precio_te, np.exp(pl), y_log[te_b], pl)})
        modelos_b[(nombre, variante)] = m
        pred_b[(nombre, variante)] = np.exp(pl)
        log(f"{nombre} ({variante}): MAE {regresion[-1]['mae']:.3f} · R² {regresion[-1]['r2']:.4f}")
regresion = pd.DataFrame(regresion)
regresion.to_csv(RES / "precio_resultados_test.csv", index=False)
M["B_regresion"] = regresion.astype(object).where(regresion.notna(), None).to_dict("records")

# Modelo elegido: el de menor error en validación (no en la prueba)
mejor_b = regresion.iloc[1:].sort_values("rmse_log_validacion").iloc[0]
clave_b = (mejor_b["modelo"], mejor_b["variante"])
prod_te = df.loc[te_b, GRUPOS["Producto"]].idxmax(axis=1).str.replace("name_", "").str.replace("_", " ").values
err = pd.DataFrame({"producto": prod_te, "real": precio_te, "pred": pred_b[clave_b]})
err["abs"] = (err["real"] - err["pred"]).abs()
por_prod = err.groupby("producto").agg(mae=("abs", "mean"), precio_medio=("real", "mean")).sort_values("precio_medio")
por_prod["mae_rel"] = por_prod["mae"] / por_prod["precio_medio"]
por_prod.to_csv(RES / "precio_error_por_producto.csv")
M["B_mejor"] = {"modelo": clave_b[0], "variante": clave_b[1]}
M["B_por_producto"] = por_prod.reset_index().to_dict("records")

# Niveles de certeza del modelo de precio elegido y del mismo algoritmo sin surge (bootstrap por horas)
horas_b = df.loc[te_b, "datetime_local"].str[:13].values
otra_variante = (clave_b[0], "sin surge" if clave_b[1] == "con surge" else "con surge")
NOMBRES_IC_B = ["mae", "r2", "dentro_10pct"]
ic_b = {}
for clave in (clave_b, otra_variante):
    pred = pred_b[clave]

    def metricas_ic_b(idx, pred=pred):
        real, est = precio_te[idx], pred[idx]
        return [np.mean(np.abs(real - est)), r2_score(real, est), np.mean(np.abs(est - real) / real <= 0.10)]

    bajo, alto, n_bloques = bootstrap_ic(horas_b, metricas_ic_b)
    punto = metricas_ic_b(np.arange(len(precio_te)))
    ic_b[f"{clave[0]} ({clave[1]})"] = {k: {"valor": float(v), "bajo": float(b), "alto": float(a)}
                                       for k, v, b, a in zip(NOMBRES_IC_B, punto, bajo, alto)}
M["B_ic95"] = {"bloques": n_bloques, "replicas": 1000, "modelos": ic_b}
log(f"IC 95% precio: {ic_b}")

fig, axes = plt.subplots(1, 2, figsize=(13, 4.8), gridspec_kw={"width_ratios": [1, 1.2]})
ax = axes[0]
ax.hexbin(err["real"], err["pred"], gridsize=60, cmap=CMAP, mincnt=1, bins="log", linewidths=0)
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
guardar(fig, "fig01_precio_real_vs_predicho.png")

# Importancia por familias (R² en log) del modelo elegido (con el modelo ya entrenado)
modelo_b = modelos_b[clave_b]
feats_b = VARIANTES[clave_b[1]]
muestra_te = df.loc[te_b].sample(n=min(40_000, int(te_b.sum())), random_state=SEED)
base_r2, imp_b = importancia_por_grupo(lambda X: modelo_b.predict(X), muestra_te[feats_b],
                                       np.log(muestra_te["price"]), r2_score, GRUPOS)
imp_b.to_csv(RES / "precio_importancia_grupos.csv", index=False)
M["B_importancia"] = {"base_r2_log": float(base_r2), "grupos": imp_b.to_dict("records")}

# Curvas tarifarias aprendidas: precio predicho por producto según distancia (sin recargo).
# La distancia en línea recta se ajusta con la relación típica del dataset (recorrido / línea recta).
RELACION_RECORRIDO = float((df["distance"] / df["straight_line_miles"]).median())
M["B_relacion_recorrido"] = RELACION_RECORRIDO
base_pd = df.loc[te_b].sample(n=min(3000, int(te_b.sum())), random_state=SEED)
distancias = np.round(np.arange(0.5, 6.01, 0.5), 2)
curvas = []
for prod in GRUPOS["Producto"]:
    for d in distancias:
        Xp = base_pd[feats_b].copy()
        Xp[GRUPOS["Producto"]] = 0
        Xp[prod] = 1
        Xp["distance"], Xp["log_distance"], Xp["straight_line_miles"] = d, np.log(d), d / RELACION_RECORRIDO
        if "log_surge" in Xp:
            Xp["log_surge"] = 0.0
        curvas.append({"producto": prod.replace("name_", "").replace("_", " "), "distancia": d,
                       "precio": float(np.median(np.exp(modelo_b.predict(Xp))))})
curvas = pd.DataFrame(curvas)
curvas.to_csv(RES / "precio_curvas_tarifa.csv", index=False)
# Niveles equivalentes entre plataformas. Lux (nivel Premium) es exclusivo de Lyft: no tiene par en Uber.
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
ax.set_title(f"{clave_b[0]} ({clave_b[1]}): qué familia usa", loc="left", fontsize=11)
ax.set_xlim(0, imp_plot["caida"].max() * 1.2)
estilo(ax, "x")
ax = axes[1]
finales = []
for prod, color in [(u, AZUL) for _, u, _ in PARES] + [(l, NARANJA) for _, _, l in PARES] + [("Lux", "#E3A774")]:
    c = curvas[curvas["producto"] == prod]
    ax.plot(c["distancia"], c["precio"], color=color, lw=1.6, ls=":" if prod == "Lux" else "-")
    finales.append((c["precio"].iloc[-1], prod + (" (sin par en Uber)" if prod == "Lux" else ""), color))
etiquetas_finales(ax, finales, 6.1, separacion=curvas["precio"].max() * 0.045)
ax.set_xlim(0.4, 7.9)
ax.set_xlabel("Distancia (millas)")
ax.set_ylabel("Precio predicho (USD, sin recargo)")
ax.set_title("Tarifa aprendida por el modelo para cada producto", loc="left", fontsize=11)
estilo(ax, "both")
titular(fig, "El producto y la distancia explican el precio; el momento y el clima casi no aportan",
        "Importancia por permutación en una muestra del período de prueba · curvas: mediana de la predicción variando solo producto y distancia")
fig.tight_layout()
guardar(fig, "fig02_precio_importancia_y_tarifas.png")

# ==============================================================================================
# PARTE C · Familias tarifarias de los productos con K-Means (complementario)
# ==============================================================================================
log("PARTE C · productos")
# Tarifa base y precio por milla de cada producto: recta precio = base + por_milla × distancia, ajustada
# con los viajes SIN recargo del entrenamiento (así no se mezcla el surge ni se usa la prueba).
UBER = ["UberPool", "UberX", "WAV", "UberXL", "Black", "Black SUV"]
sin_recargo = df[tr_b & (df["surge_multiplier"] == 1)]
producto_sr = sin_recargo[GRUPOS["Producto"]].idxmax(axis=1).str.replace("name_", "").str.replace("_", " ")
filas = []
for prod, g in sin_recargo.groupby(producto_sr):
    por_milla, tarifa_base = np.polyfit(g["distance"], g["price"], 1)
    r2_recta = r2_score(g["price"], tarifa_base + por_milla * g["distance"])
    filas.append({"producto": prod, "plataforma": "Uber" if prod in UBER else "Lyft", "tarifa_base": tarifa_base,
                  "por_milla": por_milla, "r2_recta": r2_recta, "cotizaciones": len(g)})
productos = pd.DataFrame(filas).set_index("producto")
Z = StandardScaler().fit_transform(productos[["tarifa_base", "por_milla"]])
ks = list(range(2, 7))
inercia, silueta = [], []
for k in ks:
    km = KMeans(n_clusters=k, n_init=50, random_state=SEED).fit(Z)
    inercia.append(km.inertia_)
    silueta.append(silhouette_score(Z, km.labels_))
K_ELEGIDO = ks[int(np.argmax(silueta))]  # la silueta tiene un máximo claro
km = KMeans(n_clusters=K_ELEGIDO, n_init=50, random_state=SEED).fit(Z)
productos["cluster"] = km.labels_
# Grupos numerados por tarifa base (0 = el más barato) para que el número signifique algo
orden = productos.groupby("cluster")["tarifa_base"].mean().sort_values().index
productos["cluster"] = productos["cluster"].map({c: i for i, c in enumerate(orden)})
NOMBRES_GRUPO = ["Económico", "Intermedio", "Premium"] if K_ELEGIDO == 3 else [f"Grupo {i + 1}" for i in range(K_ELEGIDO)]
productos["grupo"] = productos["cluster"].map(lambda c: NOMBRES_GRUPO[c])
productos = productos.sort_values(["cluster", "tarifa_base"])
perfil = productos.groupby("cluster").agg(
    productos=("tarifa_base", "size"), tarifa_base_min=("tarifa_base", "min"), tarifa_base_max=("tarifa_base", "max"),
    por_milla_min=("por_milla", "min"), por_milla_max=("por_milla", "max"))
perfil["grupo"] = [NOMBRES_GRUPO[c] for c in perfil.index]
perfil["lista"] = [", ".join(productos[productos["cluster"] == c].index) for c in perfil.index]
productos.to_csv(RES / "productos_tarifa_clusters.csv")
perfil.to_csv(RES / "productos_perfil_clusters.csv")
# Por qué los viajes cortos son caros por milla (H4): precio por milla = base / distancia + por_milla
ejemplo = productos.loc["UberX"]
estandar = df[df["service_tier_ord"] == 1].assign(ppm=lambda d: d["price"] / d["distance"])
ppm_ruta = estandar.groupby(["origen", "destino"]).agg(ppm=("ppm", "median"), distancia=("distance", "mean"))
ruta_max = ppm_ruta["ppm"].idxmax()
M["C"] = {"productos": int(len(productos)), "k": K_ELEGIDO, "ks": ks, "inercia": [float(v) for v in inercia],
          "silueta": [float(v) for v in silueta], "tabla": productos.reset_index().to_dict("records"),
          "perfil": perfil.reset_index().to_dict("records"),
          "ejemplo_uberx": {"base": float(ejemplo["tarifa_base"]), "por_milla": float(ejemplo["por_milla"]),
                            "ppm_1_milla": float(ejemplo["tarifa_base"] / 1 + ejemplo["por_milla"]),
                            "ppm_5_millas": float(ejemplo["tarifa_base"] / 5 + ejemplo["por_milla"])},
          "ruta_max_ppm": {"ruta": f"{ruta_max[0]} → {ruta_max[1]}", "ppm": float(ppm_ruta.loc[ruta_max, "ppm"]),
                           "distancia": float(ppm_ruta.loc[ruta_max, "distancia"])}}
log(f"K-Means productos: k = {K_ELEGIDO} · silueta {max(silueta):.3f}")

fig, axes = plt.subplots(1, 3, figsize=(15.5, 4.6), gridspec_kw={"width_ratios": [1, 1, 1.7]})
axes[0].plot(ks, inercia, "-o", color=AZUL)
axes[0].axvline(K_ELEGIDO, color="#404040", ls="--", lw=1)
axes[0].set_title("Método del codo (inercia)", loc="left", fontsize=11)
axes[0].set_xlabel("k")
axes[1].plot(ks, silueta, "-o", color=NARANJA)
axes[1].axvline(K_ELEGIDO, color="#404040", ls="--", lw=1)
axes[1].set_ylim(0, 1)
axes[1].set_title("Coeficiente de silueta", loc="left", fontsize=11)
axes[1].set_xlabel("k")
paleta = [VERDE, AZUL, NARANJA, VIOLETA, GRIS, "#D4A017"]
ax = axes[2]
for c, g in productos.groupby("cluster"):
    for plataforma, marcador in [("Uber", "o"), ("Lyft", "s")]:
        sub_p = g[g["plataforma"] == plataforma]
        ax.scatter(sub_p["tarifa_base"], sub_p["por_milla"], s=90, color=paleta[c], marker=marcador, edgecolor="white",
                   label=f"{NOMBRES_GRUPO[c]}" if plataforma == "Uber" else None, zorder=3)
etiquetados = []
for prod, r in productos.iterrows():
    # Productos con tarifa casi igual (UberX y WAV): la segunda etiqueta va más abajo para no pisarse
    cerca = sum(abs(x - r["tarifa_base"]) < 0.6 and abs(y - r["por_milla"]) < 0.08 for x, y in etiquetados)
    ax.annotate(prod, (r["tarifa_base"], r["por_milla"]), xytext=(6, 4 - 12 * cerca), textcoords="offset points",
                fontsize=8.5, color="#404040")
    etiquetados.append((r["tarifa_base"], r["por_milla"]))
ax.scatter([], [], marker="o", color=GRIS, label="Uber")
ax.scatter([], [], marker="s", color=GRIS, label="Lyft")
ax.set_xlabel("Tarifa base estimada (USD)")
ax.set_ylabel("Precio por milla estimado (USD)")
ax.set_xlim(0, productos["tarifa_base"].max() * 1.18)
ax.set_title("Los 12 productos según su tarifa", loc="left", fontsize=11)
ax.legend(frameon=False, fontsize=8.5, loc="lower right")
for a in axes:
    estilo(a, "both")
titular(fig, f"Los 12 productos de Uber y Lyft forman {K_ELEGIDO} familias de tarifa",
        "K-Means sobre tarifa base y precio por milla (estandarizados), estimados con viajes sin recargo del entrenamiento · "
        f"k = {K_ELEGIDO}: máximo coeficiente de silueta")
fig.tight_layout()
guardar(fig, "fig11_productos_kmeans.png")

# ==============================================================================================
# DATASETS DE MODELADO (salida de la Entrega 3)
# ==============================================================================================
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
    pred_out[f"prob_{SLUG[nombre]}"] = probas[(nombre, TEC_FINAL)]
    pred_out[f"pred_{SLUG[nombre]}"] = (probas[(nombre, TEC_FINAL)] >= umbrales[nombre]).astype(int)
pred_out.to_csv(RES / "recargo_predicciones_test.csv", index=False)
M["datasets"] = {"surge": list(surge_out.shape), "price": list(price_out.shape)}

# Train de has_surge balanceado con las dos técnicas que modifican filas (submuestreo y SMOTE).
# Es ilustrativo: el modelo final usa pesos de clase, que no cambian el dataset. El test nunca se
# balancea: se exporta aparte con la proporción real de recargos.
train_real = surge_out[surge_out["particion"] == "train"].drop(columns="particion").reset_index(drop=True)
test_real = surge_out[surge_out["particion"] == "test"].drop(columns="particion").reset_index(drop=True)
rus = RandomUnderSampler(random_state=SEED)
rus.fit_resample(train_real[FEATS_A_NUM], train_real["has_surge"])
train_rus = train_real.iloc[np.sort(rus.sample_indices_)].reset_index(drop=True)
# SMOTE en el espacio escalado (igual que en el pipeline) y vuelta a las unidades originales.
# imblearn agrega las filas sintéticas al final, después de las reales.
esc = StandardScaler().fit(train_real[FEATS_A_NUM])
Xs, ys = SMOTE(random_state=SEED).fit_resample(esc.transform(train_real[FEATS_A_NUM]), train_real["has_surge"])
n_real = len(train_real)
train_smote = pd.DataFrame(esc.inverse_transform(Xs), columns=FEATS_A_NUM)
train_smote.iloc[:n_real] = train_real[FEATS_A_NUM].values
train_smote["has_surge"] = np.asarray(ys)
train_smote.insert(0, "ruta", list(train_real["ruta"]) + [None] * (len(train_smote) - n_real))
train_smote.insert(0, "sintetica", (np.arange(len(train_smote)) >= n_real).astype(int))
train_smote.insert(0, "id", list(train_real["id"]) + [None] * (len(train_smote) - n_real))
balanceados = {}
for tabla_out, nombre in [(train_rus, "surge_train_submuestreo"), (train_smote, "surge_train_smote"),
                          (test_real, "surge_test_sin_balancear")]:
    tabla_out.to_csv(DSB / f"{nombre}.zip", index=False,
                     compression={"method": "zip", "archive_name": f"{nombre}.csv"})
    balanceados[nombre] = {"filas": int(len(tabla_out)), "columnas": int(tabla_out.shape[1]),
                           "positivos": int(tabla_out["has_surge"].sum()),
                           "tasa": float(tabla_out["has_surge"].mean())}
    log(f"{nombre}: {len(tabla_out):,} filas · {pct(tabla_out['has_surge'].mean())} con recargo")
M["datasets_balanceados"] = balanceados

# ----------------------------------------------------------------------------------------------
with open(RES / "metricas.json", "w", encoding="utf-8") as f:
    json.dump(M, f, ensure_ascii=False, indent=2, default=lambda o: o.item() if hasattr(o, "item") else str(o))
log("listo")
