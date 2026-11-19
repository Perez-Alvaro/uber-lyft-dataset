"""Prueba: corrección de la matriz de beneficio pedida por la docente (Entrega 3 · Grupo 11).

Crítica: es peor que la app diga "sin recargo" y después haya recargo (falso negativo) que una falsa alarma.
En la Entrega 3 el falso negativo valía USD 0 ("igual que sin modelo"). Acá se le asigna un costo y se
vuelve a elegir el umbral de decisión, con el mismo procedimiento que el trabajo original:

  · Mismos datos, mismas predictoras, misma partición (prueba = 15 al 18/12/2018) y misma validación
    temporal en orden (4 folds).
  · Mismos modelos con los MISMOS hiperparámetros elegidos en la Entrega 3 (se leen de 6_Resultados/
    metricas.json). El costo del falso negativo no cambia esa elección: los modelos se eligieron por
    PR-AUC, que no depende del umbral. Lo único que cambia es el umbral.
  · El umbral se elige con las predicciones de VALIDACIÓN; la prueba solo se usa para medir.

Matriz de beneficio corregida (USD por cotización):
  VN  no avisa y no hay recargo            0
  FP  falsa alarma                         -costo_fp        (USD 1, igual que la Entrega 3)
  FN  dijo "sin recargo" y hubo recargo    -costo_fn        (NUEVO; antes 0)
  VP  avisó y había recargo                recargo_medio - costo_fp

Controles de que la reconstrucción es fiel: las probabilidades de prueba se comparan con
6_Resultados/recargo_predicciones_test.csv y, con costo_fn = 0, el umbral tiene que dar el de la Entrega 3.

No modifica nada de la Entrega 3: todo se escribe en esta carpeta (8_Pruebas_critica_FN/).
Uso: python costo_falso_negativo.py
"""
import json
import time
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.colors import LinearSegmentedColormap

from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, average_precision_score, balanced_accuracy_score, confusion_matrix,
                             precision_recall_curve, roc_auc_score)
from sklearn.preprocessing import StandardScaler, TargetEncoder
from sklearn.tree import DecisionTreeClassifier

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

AQUI = Path(__file__).resolve().parent                     # 8_Pruebas_critica_FN
E3 = AQUI.parent                                           # Contenido Entrega 3
ENTRADA = E3.parent / "Contenido Entrega 2" / "Dataset Codificado" / "dataset_codificado.zip"
METRICAS_E3 = E3 / "6_Resultados" / "metricas.json"
PRED_E3 = E3 / "6_Resultados" / "recargo_predicciones_test.csv"
GRAF = AQUI / "graficos"
RES = AQUI / "resultados"
for carpeta in (GRAF, RES):
    carpeta.mkdir(parents=True, exist_ok=True)

SEED = 42
FECHAS_TEST = ["2018-12-15", "2018-12-16", "2018-12-17", "2018-12-18"]
COSTO_FP = 1.0                                             # igual que la Entrega 3
T0 = time.time()
E3M = json.loads(METRICAS_E3.read_text(encoding="utf-8"))
SLUG = {"Regresión logística": "logistica", "Árbol de decisión": "arbol", "Random forest": "random_forest",
        "Gradient boosting": "gradient_boosting"}


def log(msg):
    print(f"[{time.time() - T0:6.0f}s] {msg}", flush=True)


class FechasEnOrden:
    """Copia exacta de la validación temporal de la Entrega 3."""

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
        for i in range(self.n_splits):
            yield np.flatnonzero(b <= i), np.flatnonzero(b == i + 1)


CV = FechasEnOrden(n_splits=4)

# ----------------------------------------------------------------------------------------------
# Datos: mismo armado que la Entrega 3 (Parte A)
# ----------------------------------------------------------------------------------------------
log(f"cargando {ENTRADA.name}")
df = pd.read_csv(ENTRADA)
df["fecha"] = df["datetime_local"].str[:10]
df["hour_sin"] = np.sin(2 * np.pi * df["hour_local"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hour_local"] / 24)
df["log_distance"] = np.log(df["distance"])
df["log_surge"] = np.log(df["surge_multiplier"])
df["origen"] = df.filter(like="source_").idxmax(axis=1).str.replace("source_", "").str.replace("_", " ")
df["destino"] = df.filter(like="destination_").idxmax(axis=1).str.replace("destination_", "").str.replace("_", " ")
df["ruta"] = df["origen"] + " → " + df["destino"]
REF_A = ["source_South_Station", "destination_South_Station", "time_slot_Mañana", "short_summary_Clear", "name_Lyft"]

lyft = df[(df["is_uber"] == 0) & (df["name_Shared"] == 0)].reset_index(drop=True)
EXCLUIR_A = ["id", "datetime_local", "fecha", "has_surge", "price", "surge_multiplier", "log_surge",
             "is_uber", "service_tier_ord", "log_distance", "origen", "destino"]
FEATS_A = [c for c in lyft.columns if c not in EXCLUIR_A and lyft[c].nunique() > 1]
FEATS_A_NUM = [c for c in FEATS_A if c != "ruta"]
test_a = lyft["fecha"].isin(FECHAS_TEST)
Xtr, ytr, gtr = lyft.loc[~test_a, FEATS_A], lyft.loc[~test_a, "has_surge"], lyft.loc[~test_a, "fecha"]
Xte, yte = lyft.loc[test_a, FEATS_A], lyft.loc[test_a, "has_surge"]
y_te = yte.values
log(f"Lyft sin Shared: {len(lyft):,} filas · {len(FEATS_A)} predictoras · train {len(Xtr):,} · test {len(Xte):,}")

con_recargo_tr = lyft.loc[~test_a & (lyft["has_surge"] == 1)]
RECARGO_MEDIO = float((con_recargo_tr["price"] - con_recargo_tr["price"] / con_recargo_tr["surge_multiplier"]).mean())
COSTOS_FN = {"Entrega 3 (FN = USD 0)": 0.0, "Mitad del recargo": RECARGO_MEDIO / 2,
             "Recargo medio (principal)": RECARGO_MEDIO, "Doble del recargo": 2 * RECARGO_MEDIO}
PRINCIPAL = "Recargo medio (principal)"
log(f"recargo medio USD {RECARGO_MEDIO:.4f} (Entrega 3: {E3M['A_matriz_beneficio']['recargo_medio']:.4f})")


def preprocesador(lineal):
    numericas = [c for c in FEATS_A_NUM if not (lineal and c in REF_A)]
    partes = [("ruta", TargetEncoder(target_type="binary", random_state=SEED), ["ruta"]),
              ("resto", "passthrough", numericas)]
    return ColumnTransformer(partes, verbose_feature_names_out=False).set_output(transform="pandas")


def pipe_pesos(modelo):
    """Preprocesamiento -> escalado -> modelo con pesos de clase (técnica elegida en la Entrega 3)."""
    lineal = isinstance(modelo, LogisticRegression)
    modelo = clone(modelo).set_params(class_weight="balanced")
    return ImbPipeline([("prep", preprocesador(lineal)), ("escala", StandardScaler().set_output(transform="pandas")),
                        ("modelo", modelo)])


BASE = {
    "Regresión logística": LogisticRegression(max_iter=3000, solver="lbfgs"),
    "Árbol de decisión": DecisionTreeClassifier(random_state=SEED),
    "Random forest": RandomForestClassifier(n_estimators=150, max_features="sqrt", random_state=SEED, n_jobs=-1),
    "Gradient boosting": HistGradientBoostingClassifier(max_iter=200, min_samples_leaf=100, l2_regularization=1.0,
                                                        early_stopping=False, random_state=SEED),
}
TEC = E3M["A_tecnica_elegida"]["clave"]
ELEGIDO = E3M["A_elegido"]
assert TEC == "pesos", "este script reproduce la técnica 'pesos de clase' elegida en la Entrega 3"

# ----------------------------------------------------------------------------------------------
# Reconstrucción de los modelos finales: predicciones de validación (eligen el umbral) y de prueba
# ----------------------------------------------------------------------------------------------
val, prueba = {}, {}
for nombre, modelo in BASE.items():
    params = E3M["A_tuning"][nombre][TEC]["params"]
    modelo = clone(modelo).set_params(**params)
    pipe = pipe_pesos(modelo)
    idx, pv = [], []
    for i_tr, i_va in CV.split(Xtr, ytr, gtr):
        pv.append(clone(pipe).fit(Xtr.iloc[i_tr], ytr.iloc[i_tr]).predict_proba(Xtr.iloc[i_va])[:, 1])
        idx.append(i_va)
    val[nombre] = (ytr.iloc[np.concatenate(idx)].values, np.concatenate(pv))
    prueba[nombre] = clone(pipe).fit(Xtr, ytr).predict_proba(Xte)[:, 1]
    log(f"{nombre} {params}: PR-AUC prueba {average_precision_score(y_te, prueba[nombre]):.4f} "
        f"(Entrega 3: {E3M['A_finales'][nombre]['umbral_opt']['pr_auc']:.4f})")

# Control 1: las probabilidades de prueba coinciden con las guardadas por la Entrega 3
guardadas = pd.read_csv(PRED_E3)
assert (guardadas["id"].values == lyft.loc[test_a, "id"].values).all(), "las filas de prueba no están en el mismo orden"
control = {n: float(np.abs(guardadas[f"prob_{SLUG[n]}"].values - prueba[n]).max()) for n in BASE}
log(f"control 1 · diferencia máxima con las probabilidades de la Entrega 3: {control}")


# ----------------------------------------------------------------------------------------------
# Matriz de beneficio con costo de falso negativo
# ----------------------------------------------------------------------------------------------
def beneficio(y, proba, umbral, costo_fn, costo_fp=COSTO_FP):
    """USD cada 1.000 cotizaciones. VN = 0 · FP = -costo_fp · FN = -costo_fn · VP = recargo medio - costo_fp."""
    aviso, y = np.asarray(proba) >= umbral, np.asarray(y)
    vp, fp = int((aviso & (y == 1)).sum()), int((aviso & (y == 0)).sum())
    fn = int((~aviso & (y == 1)).sum())
    return float((vp * (RECARGO_MEDIO - costo_fp) - fp * costo_fp - fn * costo_fn) / len(y) * 1000)


def umbral_beneficio(y, proba, costo_fn):
    """Mismo buscador de umbral que la Entrega 3 (cuantiles de la probabilidad + 'no avisar nunca')."""
    candidatos = np.append(np.unique(np.quantile(proba, np.linspace(0, 1, 801))), 1.0)
    valores = [beneficio(y, proba, t, costo_fn) for t in candidatos]
    k = int(np.argmax(valores))
    return float(candidatos[k]), float(valores[k])


def metricas(y, proba, umbral, costo_fn):
    pred = (np.asarray(proba) >= umbral).astype(int)
    tn, fp, fn, tp = confusion_matrix(y, pred, labels=[0, 1]).ravel()
    prec = tp / max(tp + fp, 1)
    rec = tp / max(tp + fn, 1)
    return {"umbral": float(umbral),
            "recargos_que_se_escapan": float(fn / max(tp + fn, 1)),          # FN / recargos reales
            "acierta_cuando_dice_sin_recargo": float(tn / max(tn + fn, 1)),  # valor predictivo negativo
            "avisa_en": float(pred.mean()),                                   # % de cotizaciones con aviso
            "recall": float(rec), "precision": float(prec), "f1": float(2 * prec * rec / max(prec + rec, 1e-12)),
            "accuracy": float(accuracy_score(y, pred)), "accuracy_balanceada": float(balanced_accuracy_score(y, pred)),
            "roc_auc": float(roc_auc_score(y, proba)), "pr_auc": float(average_precision_score(y, proba)),
            "beneficio_1000": beneficio(y, proba, umbral, costo_fn),
            "tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}


# Control 2: con costo_fn = 0 el umbral elegido en validación tiene que ser el de la Entrega 3
control2 = {n: (umbral_beneficio(*val[n], 0.0)[0], E3M["A_finales"][n]["umbral_opt"]["umbral"]) for n in BASE}
log("control 2 · umbral con FN = 0 (nuevo, Entrega 3): " + str({n: (round(a, 4), round(b, 4)) for n, (a, b) in control2.items()}))

# --- Escenarios de costo del falso negativo, modelo elegido -------------------------------------
y_val, p_val = val[ELEGIDO]
p_te = prueba[ELEGIDO]
escenarios, umbral_de = [], {}
for etiqueta, costo_fn in COSTOS_FN.items():
    t, b_val = umbral_beneficio(y_val, p_val, costo_fn)
    umbral_de[etiqueta] = t
    escenarios.append({"escenario": etiqueta, "costo_fn": costo_fn, "conviene_avisar_si_prob_supera": COSTO_FP / (RECARGO_MEDIO + costo_fn),
                       "beneficio_validacion": b_val, **metricas(y_te, p_te, t, costo_fn)})
    log(f"{etiqueta}: umbral {t:.4f} · se escapan {escenarios[-1]['recargos_que_se_escapan']:.3%} · "
        f"acierta 'sin recargo' {escenarios[-1]['acierta_cuando_dice_sin_recargo']:.3%} · avisa {escenarios[-1]['avisa_en']:.3%}")
esc = pd.DataFrame(escenarios)
esc.to_csv(RES / "escenarios_costo_fn.csv", index=False)

# Referencia: sin modelo (la app siempre dice "sin recargo")
sin_modelo = metricas(y_te, np.zeros_like(p_te), 0.5, RECARGO_MEDIO)

# --- Otras reglas para dar más peso al falso negativo (umbral elegido en validación) ------------
otras = []
prec_v, rec_v, thr_v = precision_recall_curve(y_val, p_val)
f2 = 5 * prec_v * rec_v / np.clip(4 * prec_v + rec_v, 1e-12, None)
otras.append({"regla": "Máximo F2 (recall pesa el doble)", **metricas(y_te, p_te, float(thr_v[int(np.nanargmax(f2[:-1]))]), RECARGO_MEDIO)})
for objetivo in (0.8, 0.9):
    t = float(np.quantile(p_val[y_val == 1], 1 - objetivo))
    otras.append({"regla": f"Detectar al menos el {objetivo:.0%} de los recargos", **metricas(y_te, p_te, t, RECARGO_MEDIO)})
pd.DataFrame(otras).to_csv(RES / "otras_reglas.csv", index=False)

# --- Los cuatro modelos con la matriz corregida ---------------------------------------------------
por_modelo = []
for nombre in BASE:
    t0, _ = umbral_beneficio(*val[nombre], 0.0)
    t1, _ = umbral_beneficio(*val[nombre], RECARGO_MEDIO)
    for etiqueta, t in [("Entrega 3 (FN = USD 0)", t0), (PRINCIPAL, t1)]:
        por_modelo.append({"modelo": nombre, "escenario": etiqueta, **metricas(y_te, prueba[nombre], t, RECARGO_MEDIO if etiqueta == PRINCIPAL else 0.0)})
pd.DataFrame(por_modelo).to_csv(RES / "modelos_matriz_corregida.csv", index=False)

# Línea base sin modelo de ML: tasa histórica de la zona de origen (umbral sobre el entrenamiento, como la E3)
tasa_origen = lyft.loc[~test_a].groupby("origen")["has_surge"].mean()
s_tr = lyft.loc[~test_a, "origen"].map(tasa_origen).values
s_te = lyft.loc[test_a, "origen"].map(tasa_origen).fillna(ytr.mean()).values
zona = {e: metricas(y_te, s_te, umbral_beneficio(ytr.values, s_tr, c)[0], c) for e, c in
        [("Entrega 3 (FN = USD 0)", 0.0), (PRINCIPAL, RECARGO_MEDIO)]}


# --- Intervalos de confianza 95% (bootstrap por horas, igual que la Entrega 3) ------------------
def bootstrap(umbral, n=1000):
    horas = lyft.loc[test_a, "datetime_local"].str[:13].values
    _, inv = np.unique(horas, return_inverse=True)
    bloques = [np.flatnonzero(inv == k) for k in range(inv.max() + 1)]
    rng = np.random.default_rng(SEED)
    aviso = p_te >= umbral
    vals = []
    for _ in range(n):
        idx = np.concatenate([bloques[k] for k in rng.integers(0, len(bloques), len(bloques))])
        y_b, a_b = y_te[idx], aviso[idx]
        tp, fn = (a_b & (y_b == 1)).sum(), (~a_b & (y_b == 1)).sum()
        tn = (~a_b & (y_b == 0)).sum()
        vals.append([fn / max(tp + fn, 1), tn / max(tn + fn, 1), a_b.mean()])
    lo, hi = np.percentile(vals, 2.5, axis=0), np.percentile(vals, 97.5, axis=0)
    return {k: [float(a), float(b)] for k, a, b in zip(["recargos_que_se_escapan", "acierta_cuando_dice_sin_recargo", "avisa_en"], lo, hi)}


ic = {e: bootstrap(umbral_de[e]) for e in ["Entrega 3 (FN = USD 0)", PRINCIPAL]}
log(f"IC 95%: {ic}")

# --- Por qué se mueve el umbral -------------------------------------------------------------------
# El puntaje del modelo no es una probabilidad real: con pesos de clase, cada recargo pesa ~6 veces más al
# entrenar y los puntajes quedan inflados. Para leer cada umbral se mide, en VALIDACIÓN, la tasa real de
# recargo de las cotizaciones con puntaje cercano (±0,02) y se compara con la que exige la matriz.
lectura_umbral = []
for etiqueta, costo_fn in COSTOS_FN.items():
    t = umbral_de[etiqueta]
    cerca = np.abs(p_val - t) <= 0.02
    lectura_umbral.append({"escenario": etiqueta, "costo_fn": costo_fn, "umbral": t,
                           "chance_minima_exigida": COSTO_FP / (RECARGO_MEDIO + costo_fn),
                           "tasa_real_cerca_del_umbral_validacion": float(y_val[cerca].mean()),
                           "cotizaciones_cerca": int(cerca.sum())})
    log(f"{etiqueta}: umbral {t:.3f} · chance mínima exigida {lectura_umbral[-1]['chance_minima_exigida']:.3%} · "
        f"tasa real cerca del umbral (validación) {lectura_umbral[-1]['tasa_real_cerca_del_umbral_validacion']:.3%}")
pd.DataFrame(lectura_umbral).to_csv(RES / "lectura_del_umbral.csv", index=False)

json.dump({"recargo_medio": RECARGO_MEDIO, "costo_fp": COSTO_FP, "modelo": ELEGIDO,
           "controles": {"max_dif_probabilidades": control,
                         "umbral_fn0_nuevo_vs_entrega3": {n: list(v) for n, v in control2.items()}},
           "sin_modelo": sin_modelo, "escenarios": escenarios, "otras_reglas": otras, "por_modelo": por_modelo,
           "zona_origen": zona, "ic95": ic, "lectura_umbral": lectura_umbral},
          open(RES / "resultados_costo_fn.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# ----------------------------------------------------------------------------------------------
# Gráficos (mismo estilo que la Entrega 3)
# ----------------------------------------------------------------------------------------------
FUENTE = "Calibri" if any(f.name == "Calibri" for f in font_manager.fontManager.ttflist) else "DejaVu Sans"
plt.rcParams.update({"font.family": FUENTE, "font.size": 11, "axes.titlesize": 12,
                     "axes.labelcolor": "#404040", "xtick.color": "#404040", "ytick.color": "#404040"})
AZUL, NARANJA, VIOLETA, GRIS, ROJO = "#1F5F8B", "#C0692E", "#7A5195", "#8C8C8C", "#B8432F"
pct = lambda x, d=1: f"{100 * x:.{d}f}%".replace(".", ",")
coma = lambda v, d=2: f"{v:.{d}f}".replace(".", ",")


def estilo(ax, grid="y"):
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color("#C8CED3")
    if grid:
        ax.grid(axis=grid, color="#E6E9EC", lw=0.8)
    ax.set_axisbelow(True)


def titular(fig, titulo, subtitulo):
    fig.suptitle(titulo, x=0.01, y=1.0, ha="left", va="bottom", fontsize=15, fontweight="bold", color="#1A1A1A")
    fig.text(0.01, 0.995, subtitulo, ha="left", va="top", fontsize=10.5, color="#595959")


def guardar(fig, nombre):
    fig.savefig(GRAF / nombre, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    log(f"gráfico {nombre}")


# Figura 1: matriz corregida + qué pasa con cada costo de falso negativo
fig, axes = plt.subplots(1, 2, figsize=(16, 4.9), gridspec_kw={"width_ratios": [0.8, 1.6]})
ax = axes[0]
valores = np.array([[0.0, -COSTO_FP], [-RECARGO_MEDIO, RECARGO_MEDIO - COSTO_FP]])
ax.imshow(np.sign(valores), cmap=LinearSegmentedColormap.from_list("b", ["#F4C7A8", "#FFFFFF", "#A9CDE6"]), vmin=-1, vmax=1)
textos = [["VN · dijo 'sin recargo' y no hubo\nUSD 0", f"FP · falsa alarma\n-USD {coma(COSTO_FP)}"],
          [f"FN · dijo 'sin recargo' y hubo\n-USD {coma(RECARGO_MEDIO)}\n(antes USD 0)",
           f"VP · avisó y había recargo\n+USD {coma(RECARGO_MEDIO - COSTO_FP)}"]]
for i in range(2):
    for j in range(2):
        ax.text(j, i, textos[i][j], ha="center", va="center", fontsize=9.5,
                fontweight="bold" if (i, j) == (1, 0) else "normal")
ax.set_xticks([0, 1], ["Predice sin recargo", "Predice con recargo"])
ax.set_yticks([0, 1], ["Sin recargo", "Con recargo"])
ax.set_ylabel("Real")
ax.set_title("Matriz de beneficio corregida (USD por cotización)", loc="left", fontsize=11)
for s in ax.spines.values():
    s.set_visible(False)
ax = axes[1]
filas = [("Sin modelo\n(siempre 'sin recargo')", sin_modelo)] + \
        [(f"FN = USD {coma(r['costo_fn'])}\n" + ("(Entrega 3)" if r["costo_fn"] == 0 else "(principal)" if r["escenario"] == PRINCIPAL else ""), r)
         for r in escenarios]
x = np.arange(len(filas))
ancho = 0.26
series = [("recargos_que_se_escapan", "Recargos que se escapan", ROJO),
          ("avisa_en", "Cotizaciones con aviso", "#BFC9D1"),
          ("acierta_cuando_dice_sin_recargo", "Acierta cuando dice 'sin recargo'", AZUL)]
for k, (clave, etiqueta, color) in enumerate(series):
    vals = [r[clave] for _, r in filas]
    barras = ax.bar(x + (k - 1) * ancho, vals, ancho * 0.95, color=color, label=etiqueta)
    for b, v in zip(barras, vals):
        ax.text(b.get_x() + b.get_width() / 2, v + 0.015, pct(v), ha="center", fontsize=8, color="#404040")
ax.set_xticks(x, [f for f, _ in filas], fontsize=9)
ax.set_ylim(0, 1.15)
ax.yaxis.set_major_formatter(lambda v, _: f"{v:.0%}")
ax.legend(frameon=False, ncol=3, fontsize=9, loc="upper left")
ax.set_title(f"{ELEGIDO}: período de prueba (15 al 18/12) con el umbral elegido en validación", loc="left", fontsize=11)
estilo(ax)
titular(fig, "Si el falso negativo cuesta, la app avisa más y se escapan muchos menos recargos",
        f"Recargo medio USD {coma(RECARGO_MEDIO)} · falsa alarma USD {coma(COSTO_FP)} · con FN = USD {coma(RECARGO_MEDIO)} conviene avisar "
        f"si la probabilidad de recargo supera {pct(COSTO_FP / (2 * RECARGO_MEDIO))} (antes {pct(COSTO_FP / RECARGO_MEDIO)})")
fig.tight_layout()
guardar(fig, "figFN1_matriz_corregida_y_escenarios.png")

# Figura 2: matrices de confusión antes / después (modelo elegido)
CMAP = LinearSegmentedColormap.from_list("e3", ["#FFFFFF", "#9DC3E0", AZUL])
fig, axes = plt.subplots(1, 2, figsize=(11, 4.4))
for ax, e in zip(axes, ["Entrega 3 (FN = USD 0)", PRINCIPAL]):
    r = next(s for s in escenarios if s["escenario"] == e)
    cm = np.array([[r["tn"], r["fp"]], [r["fn"], r["tp"]]])
    ax.imshow(cm / cm.sum(axis=1, keepdims=True), cmap=CMAP, vmin=0, vmax=1)
    for i in range(2):
        for j in range(2):
            v = cm[i, j] / cm[i].sum()
            etq = [["VN · acierto", "FP · falsa alarma"], ["FN · se escapó", "VP · avisado"]][i][j]
            ax.text(j, i, f"{etq}\n{cm[i, j]:,}".replace(",", ".") + f"\n{pct(v)} de la fila", ha="center", va="center",
                    fontsize=9.5, color="white" if v > 0.55 else "#1A1A1A", fontweight="bold" if (i, j) == (1, 0) else "normal")
    ax.set_xticks([0, 1], ["Sin recargo", "Con recargo"])
    ax.set_yticks([0, 1], ["Sin recargo", "Con recargo"])
    ax.set_xlabel("Predicho")
    ax.set_ylabel("Real")
    nombre_e = "Antes · FN = USD 0" if r["costo_fn"] == 0 else f"Después · FN = USD {coma(r['costo_fn'])}"
    ax.set_title(f"{nombre_e}\numbral {coma(r['umbral'])} · se escapan {pct(r['recargos_que_se_escapan'])} · "
                 f"acierta 'sin recargo' {pct(r['acierta_cuando_dice_sin_recargo'])}", loc="left", fontsize=10.5)
    for s in ax.spines.values():
        s.set_visible(False)
titular(fig, "Antes y después de darle costo al falso negativo", f"{ELEGIDO} con pesos de clase · período de prueba (15 al 18/12/2018)")
fig.tight_layout()
guardar(fig, "figFN2_matrices_antes_despues.png")

log("listo")
