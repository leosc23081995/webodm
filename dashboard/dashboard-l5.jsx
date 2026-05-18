// L5 · Engenharia de Dados — pipeline, queries, mapping, novas fontes

(function () {
  const { useState } = React;
  const D = window.DASH;

  // Highlight SQL roughly (no real parser, just tokens)
  function highlightSQL(src) {
    const KEYWORDS = ["SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","OUTER","ON","GROUP","BY","ORDER","HAVING","UNION","ALL","AS","AND","OR","NOT","IN","IS","NULL","CASE","WHEN","THEN","ELSE","END","DECLARE","WITH","CTE","SUM","COUNT","AVG","MAX","MIN","FORMAT","CAST","CONVERT","COALESCE","DISTINCT","LIKE","BETWEEN","INSERT","UPDATE","SET","TOP","DESC","ASC","INTO"];
    let out = src
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // comments
    out = out.replace(/(--[^\n]*)/g, '<span class="cm">$1</span>');
    // strings
    out = out.replace(/('([^'\\]|\\.)*')/g, '<span class="str">$1</span>');
    // numbers
    out = out.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
    // keywords (case-insensitive, word boundary)
    const re = new RegExp("\\b(" + KEYWORDS.join("|") + ")\\b", "gi");
    out = out.replace(re, '<span class="kw">$1</span>');
    // tables/aliases: tokens like dbo.table_name
    out = out.replace(/\b(dbo\.[a-z_]+)\b/g, '<span class="tbl">$1</span>');
    // @vars
    out = out.replace(/(@\w+)/g, '<span class="var">$1</span>');
    return out;
  }

  function highlightPython(src) {
    const KEYWORDS = ["import","from","as","def","return","with","if","else","elif","for","in","while","try","except","raise","pass","class","lambda","not","and","or","is","None","True","False","yield","global","nonlocal"];
    let out = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    out = out.replace(/(#[^\n]*)/g, '<span class="cm">$1</span>');
    out = out.replace(/('([^'\\]|\\.)*'|"([^"\\]|\\.)*")/g, '<span class="str">$1</span>');
    out = out.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
    const re = new RegExp("\\b(" + KEYWORDS.join("|") + ")\\b", "g");
    out = out.replace(re, '<span class="kw">$1</span>');
    out = out.replace(/\b([A-Z][A-Za-z_]+)\b/g, '<span class="fn">$1</span>');
    return out;
  }

  function CodeBlock({ lang, name, code }) {
    const [copied, setCopied] = useState(false);
    const highlighted = lang === "sql" ? highlightSQL(code) : highlightPython(code);
    function copy() {
      try { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch (e) {}
    }
    return (
      <div className="code-wrap">
        <div className="code-header">
          <div>
            <span className="lang">{lang.toUpperCase()}</span>
            <span className="name" style={{ marginLeft: 14 }}>{name}</span>
          </div>
          <button className={"copy-btn " + (copied ? "copied" : "")} onClick={copy}>{copied ? "✓ Copiado" : "Copiar"}</button>
        </div>
        <pre className="code-block" dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
    );
  }

  // Architecture diagram
  function ArchDiagram() {
    return (
      <div className="arch-diagram">
        <svg viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="ah-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#78716c" />
            </marker>
            <marker id="ah-arrow-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#0e7490" />
            </marker>
          </defs>

          {/* === STAGE 1 — SOURCES === */}
          <g>
            <text x="60" y="36" fontSize="10" letterSpacing="0.16em" fill="#a8a29e" fontFamily="JetBrains Mono">FONTES</text>
            {/* SGC REUNIDOS */}
            <g transform="translate(60 60)">
              <rect width="170" height="62" rx="6" fill="#fff" stroke="#d6d3d1" />
              <rect x="0" y="0" width="4" height="62" rx="2" fill="#1d4ed8" />
              <text x="16" y="24" fontSize="12.5" fontWeight="600" fill="#1c1917">SGC · REUNIDOS</text>
              <text x="16" y="42" fontSize="10.5" fontFamily="JetBrains Mono" fill="#78716c">SQL Server · 199 tabelas</text>
              <text x="16" y="55" fontSize="10" fontFamily="JetBrains Mono" fill="#a8a29e">empr_codigo = 1</text>
            </g>
            {/* SGC DESCART */}
            <g transform="translate(60 140)">
              <rect width="170" height="62" rx="6" fill="#fff" stroke="#d6d3d1" />
              <rect x="0" y="0" width="4" height="62" rx="2" fill="#b91c1c" />
              <text x="16" y="24" fontSize="12.5" fontWeight="600" fill="#1c1917">SGC2 · DESCART</text>
              <text x="16" y="42" fontSize="10.5" fontFamily="JetBrains Mono" fill="#78716c">SQL Server · 199 tabelas</text>
              <text x="16" y="55" fontSize="10" fontFamily="JetBrains Mono" fill="#a8a29e">empr_codigo = 17086</text>
            </g>
            {/* Externos */}
            <g transform="translate(60 220)">
              <rect width="170" height="62" rx="6" fill="#fff" stroke="#d6d3d1" />
              <rect x="0" y="0" width="4" height="62" rx="2" fill="#6d28d9" />
              <text x="16" y="24" fontSize="12.5" fontWeight="600" fill="#1c1917">Workbooks anexos</text>
              <text x="16" y="42" fontSize="10.5" fontFamily="JetBrains Mono" fill="#78716c">v6 · Cat. Completa · Tubos</text>
              <text x="16" y="55" fontSize="10" fontFamily="JetBrains Mono" fill="#a8a29e">.xlsx · .csv</text>
            </g>
          </g>

          {/* === STAGE 2 — ETL === */}
          <g transform="translate(310 60)">
            <text x="0" y="-24" fontSize="10" letterSpacing="0.16em" fill="#a8a29e" fontFamily="JetBrains Mono">EXTRAÇÃO</text>
            <rect width="220" height="222" rx="6" fill="#ecfeff" stroke="#0e7490" />
            <text x="20" y="28" fontSize="12.5" fontWeight="600" fill="#0e7490">ETL · Python</text>
            <text x="20" y="46" fontSize="10.5" fontFamily="JetBrains Mono" fill="#0e7490">pipeline.py</text>
            <line x1="0" y1="56" x2="220" y2="56" stroke="#a5f3fc" />
            {[
              ["1.", "Extract — pyodbc"],
              ["2.", "Transform — pandas"],
              ["3.", "Reconcile — IC R↔D"],
              ["4.", "Aggregate — pivot mensal"],
              ["5.", "Validate — checksum"],
              ["6.", "Emit — dashboard-data.js"],
            ].map(([n, t], i) => (
              <g key={i} transform={`translate(20 ${76 + i * 22})`}>
                <text x="0" y="12" fontSize="10.5" fontFamily="JetBrains Mono" fill="#0e7490">{n}</text>
                <text x="22" y="12" fontSize="11.5" fill="#164e63">{t}</text>
              </g>
            ))}
          </g>

          {/* === STAGE 3 — DATA LAYER === */}
          <g transform="translate(610 100)">
            <text x="0" y="-24" fontSize="10" letterSpacing="0.16em" fill="#a8a29e" fontFamily="JetBrains Mono">CAMADA DE DADOS</text>
            <rect width="200" height="160" rx="6" fill="#fff" stroke="#d6d3d1" />
            <rect x="0" y="0" width="200" height="32" rx="6" fill="#0f172a" />
            <text x="14" y="21" fontSize="11" fontFamily="JetBrains Mono" fill="#86efac">{`{ }`} dashboard-data.js</text>
            {[
              ["carReunidos", "30 clifor × 29m"],
              ["capReunidos", "30 × 29m"],
              ["despesasReunidos", "50 contas"],
              ["reconciliacao", "29 meses"],
              ["contratos", "90 itens"],
              ["achados", "14 + 8"],
            ].map(([k, v], i) => (
              <g key={i} transform={`translate(14 ${50 + i * 18})`}>
                <text x="0" y="10" fontSize="10.5" fontFamily="JetBrains Mono" fill="#0f172a">{k}</text>
                <text x="200 - 14" textAnchor="end" x="186" y="10" fontSize="10" fontFamily="JetBrains Mono" fill="#78716c">{v}</text>
              </g>
            ))}
          </g>

          {/* === STAGE 4 — DASHBOARD === */}
          <g transform="translate(890 60)">
            <text x="0" y="-24" fontSize="10" letterSpacing="0.16em" fill="#a8a29e" fontFamily="JetBrains Mono">APRESENTAÇÃO</text>
            <rect width="250" height="222" rx="6" fill="#fff" stroke="#d6d3d1" />
            <text x="20" y="28" fontSize="12.5" fontWeight="600" fill="#1c1917">Dashboard LRA</text>
            <text x="20" y="46" fontSize="10.5" fontFamily="JetBrains Mono" fill="#78716c">React · 5 camadas</text>
            <line x1="0" y1="56" x2="250" y2="56" stroke="#e7e5e4" />
            {[
              ["L0", "Síntese Executiva", "#b91c1c"],
              ["L1", "Operação", "#1d4ed8"],
              ["L2", "Análises críticas", "#b45309"],
              ["L3", "Drill-down", "#6d28d9"],
              ["L4", "Governança", "#15803d"],
              ["L5", "Engenharia de dados", "#0e7490"],
            ].map(([n, t, c], i) => (
              <g key={i} transform={`translate(20 ${72 + i * 24})`}>
                <rect x="0" y="0" width="22" height="14" rx="2" fill={c + "22"} stroke={c} />
                <text x="11" y="11" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600" fill={c}>{n}</text>
                <text x="32" y="11" fontSize="11.5" fill="#1c1917">{t}</text>
              </g>
            ))}
          </g>

          {/* Arrows */}
          <path d="M 230 91 L 310 130" stroke="#78716c" strokeWidth="1.2" fill="none" markerEnd="url(#ah-arrow)" />
          <path d="M 230 171 L 310 171" stroke="#78716c" strokeWidth="1.2" fill="none" markerEnd="url(#ah-arrow)" />
          <path d="M 230 251 L 310 215" stroke="#78716c" strokeWidth="1.2" fill="none" markerEnd="url(#ah-arrow)" />
          <path d="M 530 171 L 610 180" stroke="#0e7490" strokeWidth="1.6" fill="none" markerEnd="url(#ah-arrow-c)" />
          <path d="M 810 180 L 890 171" stroke="#0e7490" strokeWidth="1.6" fill="none" markerEnd="url(#ah-arrow-c)" />

          {/* Bottom label — frequency */}
          <g transform="translate(420 322)">
            <rect x="0" y="0" width="120" height="22" rx="3" fill="#0f172a" />
            <text x="60" y="14" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="0.12em" fill="#86efac">FREQ · DIÁRIA 03:00</text>
          </g>
          <g transform="translate(720 322)">
            <rect x="0" y="0" width="120" height="22" rx="3" fill="#0f172a" />
            <text x="60" y="14" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="0.12em" fill="#fcd34d">ATÔMICO · COMMIT</text>
          </g>
        </svg>
      </div>
    );
  }

  // === SQL queries ===
  const SQL_CAR = `-- CAR Mensal por Clifor (REUNIDOS ou DESCART)
-- Resultado idêntico às abas 18/19/22/24 do workbook v6
SELECT
  cf.codigo                          AS clifor,
  cf.razao_social                    AS nome,
  FORMAT(c.data_emissao, 'yyyy-MM')  AS mes,
  SUM(c.total)                       AS total
FROM dbo.Conta c
JOIN dbo.cliente_fornecedor cf
  ON cf.codigo = c.clifor_codigo
WHERE c.id_pagar_receber = 2          -- 2 = a receber (CAR)
  AND c.empr_codigo     = @empresa   -- 1 = REUN · 17086 = DESCART
  AND c.data_emissao   >= '2024-01-01'
  AND c.data_emissao    < '2026-06-01'
GROUP BY
  cf.codigo, cf.razao_social,
  FORMAT(c.data_emissao, 'yyyy-MM')
ORDER BY mes, total DESC;`;

  const SQL_CAP = `-- CAP Mensal por Fornecedor (espelho do CAR)
SELECT
  cf.codigo                          AS clifor,
  cf.razao_social                    AS nome,
  FORMAT(c.data_emissao, 'yyyy-MM')  AS mes,
  SUM(c.total)                       AS total
FROM dbo.Conta c
JOIN dbo.cliente_fornecedor cf
  ON cf.codigo = c.clifor_codigo
WHERE c.id_pagar_receber = 1          -- 1 = a pagar (CAP)
  AND c.empr_codigo     = @empresa
  AND c.data_emissao   >= '2024-01-01'
GROUP BY
  cf.codigo, cf.razao_social,
  FORMAT(c.data_emissao, 'yyyy-MM');`;

  const SQL_DESP = `-- Despesas Mensais por Conta Contábil (grupo 4xx)
-- Alimenta abas 26 e 27 (Despesas Det REUNIDOS / DESCART)
SELECT
  pc.codigo                          AS conta,
  pc.descricao                       AS nome_conta,
  FORMAT(lc.data_lancamento, 'yyyy-MM') AS mes,
  SUM(lc.valor)                      AS valor
FROM dbo.lancamento_contabil lc
JOIN dbo.plano_contas pc
  ON pc.codigo = lc.conta_codigo
WHERE pc.codigo LIKE '4%'             -- todas as contas 4xx (resultado)
  AND lc.empr_codigo = @empresa
  AND lc.data_lancamento >= '2024-01-01'
GROUP BY pc.codigo, pc.descricao,
         FORMAT(lc.data_lancamento, 'yyyy-MM')
ORDER BY conta, mes;`;

  const SQL_IC = `-- Reconciliação Intercompany REUNIDOS ↔ DESCART
-- REUN paga DESCART (clifor 133) vs DESCART recebe REUN (clifor 46)
WITH paga AS (
  SELECT FORMAT(data_emissao, 'yyyy-MM') AS mes,
         SUM(total) AS valor_pago
  FROM   dbo.Conta
  WHERE  empr_codigo      = 1        -- REUNIDOS
    AND  id_pagar_receber = 1
    AND  clifor_codigo    = 133      -- DESCART como fornecedor
  GROUP BY FORMAT(data_emissao, 'yyyy-MM')
),
recebe AS (
  SELECT FORMAT(data_emissao, 'yyyy-MM') AS mes,
         SUM(total) AS valor_recebido
  FROM   dbo.Conta
  WHERE  empr_codigo      = 17086    -- DESCART
    AND  id_pagar_receber = 2
    AND  clifor_codigo    = 46       -- REUNIDOS como cliente
  GROUP BY FORMAT(data_emissao, 'yyyy-MM')
)
SELECT  COALESCE(p.mes, r.mes)              AS mes,
        COALESCE(p.valor_pago, 0)           AS paga,
        COALESCE(r.valor_recebido, 0)       AS recebe,
        COALESCE(p.valor_pago, 0)
          - COALESCE(r.valor_recebido, 0)   AS gap,
        CASE
          WHEN ABS(COALESCE(p.valor_pago,0) - COALESCE(r.valor_recebido,0)) > 500000 THEN 'GAP CRÍTICO'
          WHEN ABS(COALESCE(p.valor_pago,0) - COALESCE(r.valor_recebido,0)) > 100000 THEN 'GAP MODERADO'
          ELSE 'OK'
        END                                 AS status
FROM    paga p
FULL OUTER JOIN recebe r ON p.mes = r.mes
ORDER BY mes;`;

  const SQL_CONC = `-- Top N clientes / fornecedores por concentração (29m)
-- Detecta SUSAM e outros riscos de concentração
SELECT TOP 10
  cf.codigo                       AS clifor,
  cf.razao_social                 AS nome,
  SUM(c.total)                    AS total_29m,
  SUM(c.total) * 100.0
    / SUM(SUM(c.total)) OVER ()   AS pct_total
FROM dbo.Conta c
JOIN dbo.cliente_fornecedor cf ON cf.codigo = c.clifor_codigo
WHERE c.id_pagar_receber = 2     -- CAR
  AND c.empr_codigo      = 1     -- REUNIDOS
  AND c.data_emissao    >= '2024-01-01'
GROUP BY cf.codigo, cf.razao_social
ORDER BY total_29m DESC;`;

  // === Python pipeline ===
  const PY_PIPELINE = `# pipeline.py — extrai do SGC/SGC2 e gera dashboard-data.js
# Rodar: python pipeline.py  (cron diário 03:00)

import os, json, sys
from pathlib import Path
import pyodbc
import pandas as pd

# -----------------------------------------------------------
# Conexões
# -----------------------------------------------------------
def connect(server: str, db: str) -> pyodbc.Connection:
    return pyodbc.connect(
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={server};DATABASE={db};"
        f"UID={os.environ['SGC_USER']};PWD={os.environ['SGC_PASS']};"
        "TrustServerCertificate=yes;"
    )

# -----------------------------------------------------------
# Extractors — cada função retorna DataFrame pronto pra dashboard
# -----------------------------------------------------------
def extract_car(conn, empresa: int) -> pd.DataFrame:
    sql = open('sql/car_mensal.sql').read()
    return pd.read_sql(sql, conn, params={'empresa': empresa})

def extract_cap(conn, empresa: int) -> pd.DataFrame:
    sql = open('sql/cap_mensal.sql').read()
    return pd.read_sql(sql, conn, params={'empresa': empresa})

def extract_intercompany(conn_reun, conn_desc) -> pd.DataFrame:
    paga = pd.read_sql(open('sql/ic_paga.sql').read(),   conn_reun)
    rec  = pd.read_sql(open('sql/ic_recebe.sql').read(), conn_desc)
    df = paga.merge(rec, on='mes', how='outer').fillna(0)
    df['gap']    = df['valor_pago'] - df['valor_recebido']
    df['status'] = df['gap'].apply(classify_gap)
    return df.sort_values('mes')

def classify_gap(gap: float) -> str:
    abs_gap = abs(gap)
    if abs_gap > 500_000: return 'GAP CRÍTICO'
    if abs_gap > 100_000: return 'GAP MODERADO'
    return 'OK'

# -----------------------------------------------------------
# Transform — formato esperado pelo dashboard
# -----------------------------------------------------------
def pivot_for_heatmap(df: pd.DataFrame) -> list:
    """Converte long → wide com lista de {month, value} por linha."""
    out = []
    for (clifor, nome), grp in df.groupby(['clifor', 'nome']):
        values = [{'month': r.mes, 'value': float(r.total)}
                  for r in grp.itertuples()]
        out.append({
            'clifor': str(clifor),
            'nome':   nome,
            'values': values,
            'total':  float(grp['total'].sum()),
        })
    return sorted(out, key=lambda x: -x['total'])[:30]

# -----------------------------------------------------------
# Main
# -----------------------------------------------------------
def build_payload() -> dict:
    with connect(os.environ['SGC_HOST'],  'SGC')  as r, \\
         connect(os.environ['SGC2_HOST'], 'SGC2') as d:

        payload = {
            'carReunidos':       pivot_for_heatmap(extract_car(r, 1)),
            'capReunidos':       pivot_for_heatmap(extract_cap(r, 1)),
            'carDescart':        pivot_for_heatmap(extract_car(d, 17086)),
            'capDescart':        pivot_for_heatmap(extract_cap(d, 17086)),
            'reconciliacao':     extract_intercompany(r, d).to_dict('records'),
            'despesasReunidos':  pivot_for_heatmap(extract_desp(r, 1)),
            'months':            month_range('2024-01', '2026-05'),
            'kpis':              compute_kpis(r, d),
            'updated_at':        pd.Timestamp.now().isoformat(),
        }
    return payload

def emit_dashboard_data(payload: dict, target: Path):
    body = f"window.DASH = {json.dumps(payload, ensure_ascii=False)};"
    target.write_text(body, encoding='utf-8')
    print(f"✓ {target} · {target.stat().st_size:,} bytes")

if __name__ == '__main__':
    payload = build_payload()
    emit_dashboard_data(payload, Path('dashboard-data.js'))`;

  function L5DataFlow({ empresa }) {
    const candidateTables = [
      { name: "Conta", cols: 28, role: "CAP/CAR · títulos a pagar/receber", uses: "M0.1 · M3.1 · M3.2 · M2.2" },
      { name: "cliente_fornecedor", cols: 258, role: "Cadastro clifor (97 ativos)", uses: "M0.4 · M3.* · M4.4" },
      { name: "lancamento_contabil", cols: 22, role: "Movimentos por conta 4xx", uses: "M3.3 · M2.4" },
      { name: "lancamento_financeiro", cols: 33, role: "Movimentos bancários / caixa", uses: "M2.4 · M3.3" },
      { name: "nota_fiscal_venda", cols: 265, role: "NF-e de venda (origem CAR)", uses: "M1.1 · M1.2 · M2.1" },
      { name: "nota_fiscal_venda_item", cols: 165, role: "Itens NF-e (mat./equip.)", uses: "M1.3 · Categoria" },
      { name: "compra", cols: 158, role: "Compras (origem CAP)", uses: "M1.1 · M3.1" },
      { name: "compra_item", cols: 81, role: "Itens de compra (matéria-prima)", uses: "M1.3" },
      { name: "boletim_recebimento", cols: 19, role: "Entrada de mercadoria", uses: "M1.4" },
      { name: "condicao_pagamento", cols: 33, role: "Parcelamento padrão", uses: "M3.4" },
      { name: "centro_custo", cols: 12, role: "Centros de custo (setor analítico)", uses: "M1.4 · L1" },
      { name: "balanco_estoque", cols: 17, role: "Snapshot estoque", uses: "Previsão Tubos" },
    ];

    const moduleMapping = [
      { id: "M0.1", name: "KPIs consolidados", src: "Conta · cliente_fornecedor", agg: "SUM(total) GROUP BY id_pagar_receber, empr_codigo" },
      { id: "M0.2", name: "Alertas críticos", src: "Conta · lancamento_contabil", agg: "Regras: concentração >70% · gap IC >500k · 4xx fin >20%" },
      { id: "M0.3", name: "Curva 29m", src: "Conta", agg: "FORMAT(data,'yyyy-MM') GROUP BY mes, id_pagar_receber" },
      { id: "M1.1", name: "P&L mensal", src: "Conta", agg: "CAR − CAP por mês" },
      { id: "M1.2", name: "Sazonalidade", src: "nota_fiscal_venda · _item", agg: "SUM(venda·custo·margem) por mês" },
      { id: "M2.1", name: "Concentração receita", src: "Conta · cliente_fornecedor", agg: "TOP 10 clifor por SUM(total) WHERE recebe=2" },
      { id: "M2.2", name: "Reconciliação IC", src: "Conta (2 bancos)", agg: "FULL OUTER JOIN paga(133) vs recebe(46)" },
      { id: "M2.3", name: "Remuneração ao controle", src: "Conta · lancamento_contabil", agg: "Clifor 712(GESTA) + conta 401010021" },
      { id: "M2.4", name: "Custo financeiro", src: "lancamento_contabil", agg: "Contas LIKE '%JUROS%' OR '%BRADESCO%' OR '%PERT%'" },
      { id: "M3.1", name: "Heatmap CAP", src: "Conta", agg: "Pivot clifor × mês" },
      { id: "M3.2", name: "Heatmap CAR", src: "Conta", agg: "Pivot clifor × mês (id_pagar_receber=2)" },
      { id: "M3.3", name: "Despesas 4xx", src: "lancamento_contabil · plano_contas", agg: "Pivot conta × mês WHERE conta LIKE '4%'" },
      { id: "M3.4", name: "Contratos locação", src: "compra · compra_item", agg: "Filtro tipo=LOCACAO · soma mensal" },
      { id: "M4.1", name: "Achados", src: "Static / regras", agg: "Calculados sobre todos os agregados acima" },
      { id: "M4.4", name: "Dimensões", src: "cliente_fornecedor · plano_contas", agg: "Read-only · indexado" },
    ];

    return (
      <div className="layer-L5">
        <div className="page-head">
          <div className="page-eyebrow-bar">
            <span className="stripe"></span>
            <span className="txt">L5 · Engenharia de Dados · pipeline</span>
          </div>
          <h1 className="page-title">Como o dashboard é alimentado</h1>
          <p className="page-sub">Fluxo SGC/SGC2 → ETL → camada JSON → telas. Catálogo das tabelas-chave, queries SQL prontas pra cada módulo e código Python que regenera o <code style={{ background: "var(--bg-2)", padding: "1px 6px", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 12 }}>dashboard-data.js</code> a partir do banco real.</p>
        </div>

        {/* Module 01 — Architecture */}
        <div className="mod-sec">
          <span className="num">01</span>
          <div className="ttl">Arquitetura de dados<span className="sub">do banco operacional à tela da diretoria</span></div>
          <span className="meta">4 estágios · daily refresh</span>
        </div>

        <ArchDiagram />

        {/* Module 02 — Catalog */}
        <div className="mod-sec">
          <span className="num">02</span>
          <div className="ttl">Catálogo de tabelas SGC<span className="sub">12 tabelas que cobrem 95% dos relatórios</span></div>
          <span className="meta">199 tabelas candidatas totais</span>
        </div>

        <div className="card accent-layer">
          <div className="card-head">
            <div>
              <div className="card-title">Tabelas-chave · prioridade de mapeamento</div>
              <div className="card-sub">Conta · cliente_fornecedor · lancamento_contabil são o tripé central</div>
            </div>
            <span className="pill solid-info">Ordenado por uso</span>
          </div>
          <div className="card-body flush">
            <div className="cat-row" style={{ background: "var(--surface-2)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-3)", textTransform: "uppercase" }}>
              <span>#</span>
              <span>Tabela</span>
              <span style={{ textAlign: "right" }}>Colunas</span>
              <span>Linhas (est.)</span>
              <span>Papel · módulos do dash</span>
            </div>
            {candidateTables.map((t, i) => (
              <div key={i} className="cat-row">
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-4)", fontSize: 11 }}>{String(i+1).padStart(2, "0")}</span>
                <span className="cat-name">dbo.{t.name}</span>
                <span className="cat-cols"><span className="v">{t.cols}</span></span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
                  {t.name === "Conta" ? "~21k" : t.name === "cliente_fornecedor" ? "~25k" : t.name === "lancamento_contabil" ? "~150k" : "—"}
                </span>
                <span className="cat-uses">{t.role} <span style={{ color: "var(--ink-4)", marginLeft: 4 }}>· {t.uses}</span></span>
              </div>
            ))}
          </div>
          <div className="card-foot">
            <span>Fonte · SGC_01_tabelas_financeiras_candidatas.csv (199 entradas)</span>
            <span>SGC_02_colunas_financeiras_candidatas.csv · 3.963 colunas</span>
          </div>
        </div>

        {/* Module 03 — SQL */}
        <div className="mod-sec">
          <span className="num">03</span>
          <div className="ttl">Queries SQL<span className="sub">prontas pra rodar — copie, cole no SSMS</span></div>
          <span className="meta">5 templates · cobrem 90% do dashboard</span>
        </div>

        <div className="grid-2" style={{ marginBottom: 16 }}>
          <CodeBlock lang="sql" name="sql/car_mensal.sql · M3.2" code={SQL_CAR} />
          <CodeBlock lang="sql" name="sql/cap_mensal.sql · M3.1" code={SQL_CAP} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <CodeBlock lang="sql" name="sql/intercompany_recon.sql · M2.2 (CTE + FULL OUTER JOIN)" code={SQL_IC} />
        </div>
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <CodeBlock lang="sql" name="sql/despesas_4xx.sql · M3.3" code={SQL_DESP} />
          <CodeBlock lang="sql" name="sql/concentracao.sql · M2.1" code={SQL_CONC} />
        </div>

        {/* Module 04 — Mapping */}
        <div className="mod-sec">
          <span className="num">04</span>
          <div className="ttl">Mapeamento módulo × tabela<span className="sub">cada card do dashboard puxa de onde</span></div>
          <span className="meta">{moduleMapping.length} módulos</span>
        </div>

        <div className="card accent-warn">
          <div className="card-body flush">
            <div className="map-row" style={{ background: "var(--surface-2)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-3)", textTransform: "uppercase" }}>
              <span>Módulo</span>
              <span>Nome</span>
              <span>Tabelas SGC</span>
              <span>Lógica de agregação</span>
            </div>
            {moduleMapping.map((m, i) => (
              <div key={i} className="map-row">
                <span className="mod-id">{m.id}</span>
                <span className="mod-name">{m.name}</span>
                <span className="src-tbl"><code>{m.src}</code></span>
                <span style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>{m.agg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module 05 — Python pipeline */}
        <div className="mod-sec" style={{ marginTop: 28 }}>
          <span className="num">05</span>
          <div className="ttl">Pipeline · Python<span className="sub">extract → transform → emit dashboard-data.js</span></div>
          <span className="meta">pyodbc · pandas · cron 03:00</span>
        </div>

        <CodeBlock lang="python" name="pipeline.py · ETL principal" code={PY_PIPELINE} />

        {/* Module 06 — New sources */}
        <div className="mod-sec" style={{ marginTop: 28 }}>
          <span className="num">06</span>
          <div className="ttl">Novas fontes a integrar<span className="sub">aguardando posicionamento no dashboard</span></div>
          <span className="meta">2 anexos · workbooks externos</span>
        </div>

        <div className="grid-2">
          <div className="new-source">
            <div className="ns-title">WB2 · Categoria Completa</div>
            <div className="ns-meta">WB2_Categoria_Completa.xlsx · 9 abas · 27.406 registros</div>
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55, margin: "8px 0" }}>
              Reclassifica os pedidos em 4 categorias econômicas (VENDA_EXTERNA, VENDA_INTERCO, TRANSF_INTERNA, COMODATO) com fabricante × mês.
              Liga direto a M1.2 (sazonalidade) e M1.3 (ABC) com granularidade muito maior que o v6 atual.
            </p>
            <div className="ns-stats">
              <div className="cell"><div className="lbl">Registros</div><div className="val">27.406</div></div>
              <div className="cell"><div className="lbl">Fabricantes</div><div className="val">13</div></div>
              <div className="cell"><div className="lbl">SKUs</div><div className="val">574</div></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <span className="pill solid-info">→ M1.2</span>
              <span className="pill solid-info">→ M1.3</span>
              <span className="pill solid-info">→ M1.4</span>
              <span className="pill neutral">backfill</span>
            </div>
          </div>

          <div className="new-source">
            <div className="ns-title">Previsão de Consumo · Tubos</div>
            <div className="ns-meta">PREVISAO_CONSUMO_TUBOS.xlsx · 2 abas · 4 SKUs principais</div>
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55, margin: "8px 0" }}>
              Saldo em estoque, média/dia, previsão em dias. Conecta a M1.4 (consumo por unidade) e a um novo módulo de
              <strong> S&OP / supply chain</strong> ainda não desenhado.
            </p>
            <div className="ns-stats">
              <div className="cell"><div className="lbl">SKUs</div><div className="val">4</div></div>
              <div className="cell"><div className="lbl">Unidades</div><div className="val">REUN · DESC · NTO</div></div>
              <div className="cell"><div className="lbl">Horizonte</div><div className="val">90 dias</div></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <span className="pill solid-info">→ M1.4</span>
              <span className="pill solid-warn">novo M·S&OP</span>
              <span className="pill neutral">balanco_estoque</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="banner info" style={{ marginTop: 28 }}>
          <span className="badge">Próximos passos</span>
          <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
            <strong>1.</strong> Validar nomes reais de colunas em <code style={{ fontFamily: "var(--font-mono)", background: "var(--surface)", padding: "1px 4px", borderRadius: 2 }}>dbo.lancamento_contabil</code> (data_lancamento vs data) — algumas instalações do SGC variam.
            <strong style={{ marginLeft: 12 }}>2.</strong> Criar <code style={{ fontFamily: "var(--font-mono)", background: "var(--surface)", padding: "1px 4px", borderRadius: 2 }}>VIEW dbo.vw_plano_4xx</code> consolidando contas que devem entrar no resultado.
            <strong style={{ marginLeft: 12 }}>3.</strong> Agendar pipeline.py em CRON (03:00) e adicionar checksum no header da página.
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { L5DataFlow });
})();
