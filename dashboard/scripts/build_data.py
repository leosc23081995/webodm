#!/usr/bin/env python3
"""Build dashboard-data.js from the two source spreadsheets.

Reads:
  dashboard/data/WB2_Categoria_Completa.xlsx
  dashboard/data/PREVISAO_DE_CONSUMO_TUBOS.xlsx

Writes:
  dashboard/dashboard-data.js   (exposes window.DASH)

Importable as a library: build(wb2_path, prev_path, out_path) -> dict of stats.
"""
from __future__ import annotations

import json
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUT_FILE = ROOT / "dashboard-data.js"

DEFAULT_WB2 = DATA_DIR / "WB2_Categoria_Completa.xlsx"
DEFAULT_PREV = DATA_DIR / "PREVISAO_DE_CONSUMO_TUBOS.xlsx"


def _num(x, default=0.0):
    if x is None:
        return default
    try:
        return float(x)
    except (TypeError, ValueError):
        return default


def _s(x):
    return None if x is None else str(x).strip()


def _r2(x):
    return round(_num(x), 2)


def _month_cols(header):
    return [
        (idx, str(col))
        for idx, col in enumerate(header)
        if col and len(str(col)) == 7 and str(col)[4] == "-"
    ]


def _load_categorias(sh):
    out = []
    for row in sh.iter_rows(min_row=5, values_only=True):
        cat, banco, linhas, qtd, venda, sig = row[:6]
        if not cat:
            continue
        out.append({
            "categoria": _s(cat),
            "banco": _s(banco),
            "linhas": int(_num(linhas)),
            "qtdItens": int(_num(qtd)),
            "vendaTotal": _r2(venda),
            "significado": _s(sig),
        })
    return out


def _load_fabricantes(sh):
    out = []
    for row in sh.iter_rows(min_row=4, values_only=True):
        banco, cod, fab, qprod, qlin, qtot, venda = row[:7]
        if not fab:
            continue
        out.append({
            "banco": _s(banco),
            "cod": _s(cod),
            "fabricante": _s(fab),
            "qtdProdutos": int(_num(qprod)),
            "qtdLinhas": int(_num(qlin)),
            "qtdTotal": int(_num(qtot)),
            "venda29m": _r2(venda),
        })
    out.sort(key=lambda r: r["venda29m"], reverse=True)
    return out


def _load_fcm(sh):
    rows = list(sh.iter_rows(values_only=True))
    month_cols = _month_cols(rows[2])
    months = [m for _, m in month_cols]
    items = []
    for row in rows[3:]:
        fab, cat = row[0], row[1]
        if not fab:
            continue
        items.append({
            "fabricante": _s(fab),
            "categoria": _s(cat),
            "values": {m: _r2(row[idx]) for idx, m in month_cols},
            "total": _r2(row[-1]),
        })
    return items, months


def _load_simple_pivot(sh, key1, key2, val_label):
    rows = list(sh.iter_rows(values_only=True))
    month_cols = _month_cols(rows[2])
    out = []
    for row in rows[3:]:
        a, b = row[0], row[1]
        if not a:
            continue
        item = {
            key1: _s(a),
            key2: _s(b),
            "values": {m: _r2(row[idx]) for idx, m in month_cols},
            "total": _r2(row[-1]),
        }
        out.append(item)
    out.sort(key=lambda r: r["total"], reverse=True)
    return out


def _load_equipamentos(sh):
    rows = list(sh.iter_rows(values_only=True))
    month_cols = _month_cols(rows[2])
    out = []
    for row in rows[3:]:
        cod, prod, fab = row[0], row[1], row[2]
        if not prod:
            continue
        out.append({
            "cod": _s(cod),
            "produto": _s(prod),
            "fabricante": _s(fab),
            "values": {m: _r2(row[idx]) for idx, m in month_cols},
            "total": _r2(row[-1]),
        })
    out.sort(key=lambda r: r["total"], reverse=True)
    return out


def _load_previsao(wbp):
    ws = wbp["RESUMO"]
    header_row = list(ws.iter_rows(min_row=5, max_row=5, values_only=True))[0]
    unit_headers = []
    for idx in range(7, ws.max_column):
        name = header_row[idx]
        if name:
            unit_headers.append((idx, str(name).strip()))

    produtos = []
    total_estoque = 0
    for row in ws.iter_rows(min_row=6, max_row=ws.max_row, values_only=True):
        desc = row[0]
        if not desc or str(desc).strip().lower().startswith("total"):
            continue
        estoque = int(_num(row[1]))
        unidades = {}
        for idx, name in unit_headers:
            v = row[idx]
            if v is None or _num(v) == 0:
                continue
            unidades[name] = int(_num(v))
        total_estoque += estoque
        produtos.append({
            "produto": str(desc).strip(),
            "saldoEstoque": estoque,
            "mediaConsumoDia": _r2(row[2]),
            "mediaConsumoMes": _r2(row[3]),
            "previsaoDias": _r2(row[4]),
            "previsaoMeses": _r2(row[5]),
            "demandasUnidades": unidades,
        })

    ws_mat = wbp["MATRIZ"]
    matriz = []
    for row in ws_mat.iter_rows(min_row=3, values_only=True):
        cod_supra, cod_fab, prod, fab, und, estoque = row[:6]
        if not prod:
            continue
        matriz.append({
            "codSupra": _s(cod_supra),
            "codFab": _s(cod_fab),
            "produto": _s(prod),
            "fabricante": _s(fab),
            "unidade": _s(und),
            "estoque": int(_num(estoque)),
        })

    return {
        "data": "—",
        "periodo": "—",
        "totalEstoque": total_estoque,
        "produtos": produtos,
        "matriz": matriz,
    }


def _agg_by_month(items, months, predicate):
    out = {m: 0.0 for m in months}
    for r in items:
        if not predicate(r):
            continue
        for m in months:
            out[m] += r["values"].get(m, 0.0)
    return [{"month": m, "venda": _r2(out[m])} for m in months]


def build(wb2_path: Path = DEFAULT_WB2, prev_path: Path = DEFAULT_PREV,
          out_path: Path = OUT_FILE) -> dict:
    wb2_path = Path(wb2_path)
    prev_path = Path(prev_path)
    out_path = Path(out_path)

    wb = openpyxl.load_workbook(wb2_path, data_only=True)

    categorias = _load_categorias(wb["1. Sumário Categorias"])
    fabricantes_all = _load_fabricantes(wb["2. Lista Fabricantes"])
    fabricantes = fabricantes_all[:50]
    fab_month_cat, months = _load_fcm(wb["3. Fab x Mês x Categoria"])
    equipamentos_all = _load_equipamentos(wb["4. EQUIPAMENTOS"])
    equipamentos = equipamentos_all[:30]
    consumiveis_all = _load_equipamentos(wb["5. CONSUMIVEIS Top500"])
    consumiveis = consumiveis_all[:50]
    comodato_all = _load_simple_pivot(wb["7. COMODATO"], "fabricante", "equipamento", "venda")
    comodato = comodato_all[:30]
    devolucao_all = _load_simple_pivot(wb["8. DEVOLUCAO"], "fabricante", "produto", "venda")
    devolucao = devolucao_all[:30]
    transf_all = _load_simple_pivot(wb["9. TRANSF INTERNA"], "fabricante", "produto", "venda")
    transf_interna = transf_all[:30]

    wbp = openpyxl.load_workbook(prev_path, data_only=True)
    previsao = _load_previsao(wbp)

    # Monthly aggregates per category
    interco_monthly = _agg_by_month(fab_month_cat, months, lambda r: r["categoria"] == "VENDA_INTERCO")
    venda_ext_monthly = _agg_by_month(fab_month_cat, months, lambda r: r["categoria"] == "VENDA_EXTERNA")

    intercompany = [{
        "month": r["month"], "pedidos": 0, "itens": 0, "custo": 0,
        "venda": r["venda"], "margem": 0, "margemPct": 0,
    } for r in interco_monthly]

    ext_by_bank = {c["banco"]: c["vendaTotal"] for c in categorias if c["categoria"] == "VENDA_EXTERNA"}
    total_ext = sum(ext_by_bank.values()) or 1.0
    pct_descart = ext_by_bank.get("DESCART", 0) / total_ext
    pct_reun = ext_by_bank.get("REUNIDOS", 0) / total_ext

    def _saz(pct):
        return [{
            "month": r["month"], "pedidos": 0, "itens": 0, "clientes": 0,
            "custo": 0, "venda": _r2(r["venda"] * pct), "margem": 0, "margemPct": 0,
        } for r in venda_ext_monthly]

    sazonalidade_descart = _saz(pct_descart)
    sazonalidade_reunidos = _saz(pct_reun)

    # Contratos from comodato
    contratos = []
    for c in comodato[:30]:
        active_months = max(1, sum(1 for v in c["values"].values() if v > 0))
        contratos.append({
            "empresa": "DESCART",
            "fornecedor": c["fabricante"],
            "setor": "—",
            "equipamento": c["equipamento"],
            "vencimento": "—",
            "diasRest": 0,
            "valorMensal": _r2(c["total"] / active_months),
            "total29m": c["total"],
        })

    top_fab = []
    total_fab_venda = sum(f["venda29m"] for f in fabricantes) or 1.0
    for f in fabricantes[:5]:
        top_fab.append({
            "nome": f["fabricante"],
            "origem": f["banco"],
            "total": f["venda29m"],
            "pct": round(f["venda29m"] / total_fab_venda, 4),
            "risco": "ALTO" if f["venda29m"] / total_fab_venda > 0.3 else "MEDIO",
        })

    total_venda_externa = sum(c["vendaTotal"] for c in categorias if c["categoria"] == "VENDA_EXTERNA")
    total_intercompany = sum(c["vendaTotal"] for c in categorias if c["categoria"] == "VENDA_INTERCO")
    total_transf = sum(c["vendaTotal"] for c in categorias if c["categoria"] == "TRANSF_INTERNA")
    total_comodato = sum(c["vendaTotal"] for c in categorias if c["categoria"] == "COMODATO")
    total_devol = sum(c["vendaTotal"] for c in categorias if c["categoria"] == "DEVOLUCAO")
    total_linhas = sum(c["linhas"] for c in categorias)
    total_qtd = sum(c["qtdItens"] for c in categorias)

    kpis = {
        "reunidos": {
            "vendaExterna": _r2(ext_by_bank.get("REUNIDOS", 0)),
            "car": _r2(ext_by_bank.get("REUNIDOS", 0)),
            "cap": 0, "despesa": 0,
            "resultado": _r2(ext_by_bank.get("REUNIDOS", 0)),
        },
        "descart": {
            "vendaExterna": _r2(ext_by_bank.get("DESCART", 0)),
            "car": _r2(ext_by_bank.get("DESCART", 0)),
            "cap": 0, "despesa": 0,
            "resultado": _r2(ext_by_bank.get("DESCART", 0)),
        },
        "intercompany": {"valor": _r2(total_intercompany), "gap": _r2(total_intercompany)},
        "contratos": {
            "vigentes": len(contratos),
            "mensalTotal": _r2(sum(c["valorMensal"] for c in contratos)),
            "criticos": sum(1 for c in contratos if c["valorMensal"] > 50000),
        },
        "remuneracao": {"gesta": 0, "claudio": 0, "leonardo": 0, "total": 0},
        "transferenciaInterna": _r2(total_transf),
        "comodato": _r2(total_comodato),
        "devolucao": _r2(total_devol),
        "meses": len(months),
        "totalRegistros": total_linhas,
        "totalItens": total_qtd,
        "totalFabricantes": len(fabricantes_all),
        "totalEquipamentos": len(equipamentos_all),
        "totalConsumiveis": len(consumiveis_all),
    }

    top_fab1 = fabricantes_all[0] if fabricantes_all else None
    top_com1 = comodato_all[0] if comodato_all else None

    achados = [
        {
            "num": "1",
            "titulo": "[CRÍTICO] TRANSF_INTERNA domina o volume financeiro",
            "evidencia": f"R$ {total_transf/1e6:.1f}M em transferências internas DESCART → unidades em 29 meses, contra R$ {total_venda_externa/1e6:.2f}M de venda externa.",
            "acao": "Validar precificação de transferência como custo/receita em DRE.",
        },
        {
            "num": "2",
            "titulo": "Concentração de fornecedor: " + (top_fab1["fabricante"] if top_fab1 else "—"),
            "evidencia": (f"{top_fab1['fabricante']} = R$ {top_fab1['venda29m']/1e6:.2f}M ({top_fab1['banco']}) — {top_fab1['qtdProdutos']} produtos." if top_fab1 else "—"),
            "acao": "Mapear contratos e SLAs do fornecedor principal; segunda fonte.",
        },
        {
            "num": "3",
            "titulo": "Comodato relevante",
            "evidencia": (f"COMODATO = R$ {total_comodato/1e6:.2f}M em equipamentos cedidos. Top: {top_com1['equipamento']} ({top_com1['fabricante']}) — R$ {top_com1['total']/1e6:.2f}M." if top_com1 else "—"),
            "acao": "Revisar contrapartida em reagentes para cada equipamento em comodato.",
        },
        {
            "num": "4",
            "titulo": "Devolução acumulada",
            "evidencia": f"R$ {total_devol/1e6:.2f}M em devoluções em 29 meses ({len(devolucao_all)} SKUs).",
            "acao": "Análise causa-raiz das devoluções por SKU e fabricante.",
        },
    ]

    anomalias = []
    for eq in equipamentos_all[:10]:
        vals = list(eq["values"].values())
        if not vals:
            continue
        mx = max(vals)
        if mx > 0 and mx / max(1.0, eq["total"]) > 0.85:
            for m, v in eq["values"].items():
                if v == mx:
                    anomalias.append({
                        "num": str(len(anomalias) + 1),
                        "titulo": f"Pico isolado: {eq['produto'][:60]}",
                        "evidencia": f"{m} concentrou R$ {v/1e6:.2f}M ({v/eq['total']*100:.0f}% do total 29m do SKU). Fabricante: {eq['fabricante']}.",
                        "acao": "Validar nota fiscal — possível lançamento único de comodato.",
                    })
                    break

    for p in previsao["produtos"]:
        if 0 < p["previsaoDias"] < 30 and p["mediaConsumoDia"] > 0:
            anomalias.append({
                "num": str(len(anomalias) + 1),
                "titulo": f"Estoque crítico: {p['produto']}",
                "evidencia": f"Saldo {p['saldoEstoque']} und cobre apenas {p['previsaoDias']:.0f} dias ao consumo médio de {p['mediaConsumoDia']:.0f}/dia.",
                "acao": "Disparar pedido de reposição — risco de ruptura em até 30 dias.",
            })

    dash = {
        "months": months,
        "intercompany": intercompany,
        "sazonalidadeDescart": sazonalidade_descart,
        "sazonalidadeReunidos": sazonalidade_reunidos,
        "capDescart": [], "capReunidos": [],
        "carDescart": [], "carReunidos": [],
        "reconciliacao": [],
        "despesasDescart": [], "despesasReunidos": [],
        "contratos": contratos,
        "setores": [],
        "anomalias": anomalias,
        "achados": achados,
        "topClientesReun": top_fab,
        "kpis": kpis,
        "categorias": categorias,
        "fabricantes": fabricantes,
        "fabricantesTodos": fabricantes_all,
        "fabricantesMensal": [
            {"fabricante": r["fabricante"], "categoria": r["categoria"],
             "values": r["values"], "total": r["total"]}
            for r in sorted(fab_month_cat, key=lambda x: x["total"], reverse=True)[:100]
        ],
        "equipamentos": equipamentos,
        "consumiveis": consumiveis,
        "comodato": comodato,
        "devolucao": devolucao,
        "transfInterna": transf_interna,
        "previsao": previsao,
        "_meta": {
            "geradoEm": "build_data.py",
            "fontes": [str(wb2_path.name), str(prev_path.name)],
            "periodo": f"{months[0]} a {months[-1]}" if months else "",
        },
    }

    out_path.write_text(
        "// Auto-generated by dashboard/scripts/build_data.py — do not edit by hand.\n"
        "window.DASH = " + json.dumps(dash, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )

    return {
        "out": str(out_path),
        "bytes": out_path.stat().st_size,
        "months": len(months),
        "categorias": len(categorias),
        "fabricantes": len(fabricantes_all),
        "equipamentos": len(equipamentos_all),
        "consumiveis": len(consumiveis_all),
        "comodato": len(comodato_all),
        "devolucao": len(devolucao_all),
        "transfInterna": len(transf_all),
        "previsaoProdutos": len(previsao["produtos"]),
        "achados": len(achados),
        "anomalias": len(anomalias),
    }


if __name__ == "__main__":
    stats = build()
    for k, v in stats.items():
        print(f"  {k}: {v}")
