import csv, json, sys
src, out = sys.argv[1], sys.argv[2]
rows = list(csv.DictReader(open(src)))
y = [int(r['has_surge']) for r in rows]
N = len(y); P = sum(y); Nn = N - P
models = {'logistica':'Regresión logística','arbol':'Árbol de decisión','random_forest':'Random forest','gradient_boosting':'Gradient boosting'}
VP, FP = 7.73380071041316, -1.0
res = {'n': N, 'positivos': P, 'curvas': {}, 'umbral': []}
for k, name in models.items():
    s = [float(r['prob_'+k]) for r in rows]
    order = sorted(range(N), key=lambda i: -s[i])
    tp = fp = 0; roc = [[0,0]]; pr = []; auc = 0; prev_fpr = 0; prev_tpr = 0
    ap = 0; prev_rec = 0
    i = 0
    while i < N:
        j = i
        while j < N and s[order[j]] == s[order[i]]:
            if y[order[j]]: tp += 1
            else: fp += 1
            j += 1
        tpr = tp / P; fpr = fp / Nn; prec = tp / (tp + fp)
        auc += (fpr - prev_fpr) * (tpr + prev_tpr) / 2
        ap += (tpr - prev_rec) * prec
        roc.append([fpr, tpr]); pr.append([tpr, prec])
        prev_fpr, prev_tpr, prev_rec = fpr, tpr, tpr
        i = j
    def thin(pts, n=120):
        if len(pts) <= n: return pts
        step = len(pts) / n
        return [pts[int(k*step)] for k in range(n)] + [pts[-1]]
    # thin by x spacing for smoothness
    def thin_x(pts, dx=0.008):
        outp = [pts[0]]
        for p in pts[1:]:
            if p[0] - outp[-1][0] >= dx: outp.append(p)
        if outp[-1] != pts[-1]: outp.append(pts[-1])
        return [[round(a,4), round(b,4)] for a,b in outp]
    pr_t = [p for p in pr if p[0] >= 0.01]
    res['curvas'][name] = {'roc': thin_x(roc), 'pr': thin_x(pr_t), 'roc_auc': round(auc,4), 'ap': round(ap,4)}
# threshold sweep for GB
s = [float(r['prob_gradient_boosting']) for r in rows]
t = 0.20
while t <= 0.80001:
    tp = sum(1 for a,b in zip(s,y) if a >= t and b); fp = sum(1 for a,b in zip(s,y) if a >= t and not b)
    fn = P - tp; tn = Nn - fp
    ben = (tp*VP + fp*FP) / N * 1000
    res['umbral'].append({'t': round(t,3), 'tp': tp, 'fp': fp, 'fn': fn, 'tn': tn, 'b': round(ben,2)})
    t += 0.005
# exact check at chosen threshold
t = 0.5722009525552081
tp = sum(1 for a,b in zip(s,y) if a >= t and b); fp = sum(1 for a,b in zip(s,y) if a >= t and not b)
print('check', tp, fp, (tp*VP - fp)/N*1000)
json.dump(res, open(out,'w'), ensure_ascii=False, separators=(',',':'))
for k,v in res['curvas'].items(): print(k, v['roc_auc'], v['ap'], len(v['roc']), len(v['pr']))
best = max(res['umbral'], key=lambda d: d['b']); print('best', best)
