// L0 Síntese Executiva + L1 Operação
// Depends: window.DASH, chart primitives, formatters.

(function () {
  const { useMemo, useState } = React;
  const D = window.DASH;
  const { LineChart, HBars, Sparkline, StackBars, fmtBRL, fmtCompact, fmtPct, fmtMonthShort } = window;

  // helper: monthly series for P&L
  const monthsAll = D.intercompany.map(d => d.month); // 41 months
  const monthsAxis = useAll => useAll ? monthsAll : monthsAll.filter(m => m >= "2024-01");

  // ===================== L0 SÍNTESE =====================
  function L0Sintese({ empresa }) {
    // Combined timeline derived from reconciliacao + intercompany + saz
    // For the main chart use reconciliacao (29 months 2024-01 → 2026-05)
    const carReunidosMonths = D.carReunidos[0].values; // months in 30 cols incl. TOTAL
    const months = carReunidosMonths.filter(v => v.month !== "TOTAL").map(v => v.month);

    // Aggregate CAR/CAP/Despesa per month for selected empresa
    function aggCAR(rows, m) { return rows.reduce((s, r) => s + (r.values.find(x => x.month === m)?.value || 0), 0); }
    function aggCAP(rows, m) { return rows.reduce((s, r) => s + (r.values.find(x => x.month === m)?.value || 0), 0); }

    const carRows = empresa === "DESCART" ? D.carDescart : D.carReunidos;
    const capRows = empresa === "DESCART" ? D.capDescart : D.capReunidos;
    const despRows = empresa === "DESCART" ? null : D.despesasReunidos;

    const timeline = months.map(m => {
      const car = aggCAR(carRows, m);
      const cap = aggCAP(capRows, m);
      const desp = despRows ? aggCAR(despRows, m) : 0;
      return { month: m, car, cap, resultado: car - desp };
    });

    const k = empresa === "DESCART" ? D.kpis.descart : D.kpis.reunidos;

    return (
      <div className="layer-L0">
        <div className="page-head">
          <div className="page-eyebrow-bar">
            <span className="stripe"></span>
            <span className="txt">L0 · Síntese Executiva · 90 segundos</span>
          </div>
          <h1 className="page-title">Módulo Financeiro · {empresa}</h1>
          <p className="page-sub">Visão consolidada de 29 meses (jan/24 → mai/26). Tudo o que a diretoria precisa pra decidir se há ação urgente.</p>
        </div>

        {/* Module 01 — KPIs */}
        <div className="mod-sec">
          <span className="num">01</span>
          <div className="ttl">KPIs consolidados<span className="sub">posição acumulada 29 meses</span></div>
          <span className="meta">Receita · Pagamentos · Resultado</span>
        </div>
        <div className="kpi-grid cols-4">
          <div className="kpi-cell has-stripe stripe-info">
            <div className="kpi-l">CAR · 29m</div>
            <div className="kpi-v">{fmtCompact(k.car)}<span className="u">BRL</span></div>
            <div className="kpi-sub">Receita reconhecida</div>
          </div>
          <div className="kpi-cell has-stripe stripe-warn">
            <div className="kpi-l">CAP · 29m</div>
            <div className="kpi-v">{fmtCompact(k.cap)}<span className="u">BRL</span></div>
            <div className="kpi-sub">Pagamentos a fornec.</div>
          </div>
          <div className="kpi-cell has-stripe stripe-violet">
            <div className="kpi-l">Despesa 4xx</div>
            <div className="kpi-v">{fmtCompact(k.despesa)}<span className="u">BRL</span></div>
            <div className="kpi-sub">Operacional via LF</div>
          </div>
          <div className="kpi-cell has-stripe stripe-ok">
            <div className="kpi-l">Resultado bruto</div>
            <div className="kpi-v ok">{fmtCompact(k.resultado)}<span className="u">BRL</span>
              <span className="trend up"><span className="arrow">▲</span>{fmtPct(k.resultado / k.car, 0)}</span>
            </div>
            <div className="kpi-sub">CAR − Despesa</div>
          </div>
        </div>

        {/* Module 02 — Alertas */}
        <div className="mod-sec">
          <span className="num">02</span>
          <div className="ttl">Alertas críticos<span className="sub">vetores que exigem decisão</span></div>
          <span className="meta">3 ativos · ordenados por impacto</span>
        </div>
        <div className="alert-band">
          <div className="alert-tile">
            <span className="sev crit">● Crítico</span>
            <div className="at-title">Concentração extrema de receita</div>
            <div className="at-body">SUSAM/CMED concentra <strong style={{color: "var(--red)"}}>87,6%</strong> da CAR REUNIDOS. Sem diversificação, perda do contrato implica colapso operacional.</div>
            <div className="at-metric crit">87,6<span className="u">%</span></div>
          </div>
          <div className="alert-tile">
            <span className="sev warn">▲ Alto</span>
            <div className="at-title">Gap intercompany não reconhecido</div>
            <div className="at-body">REUNIDOS pagou R$ 37,5M à DESCART · DESCART reconheceu apenas R$ 20,9M. <strong style={{color: "var(--amber)"}}>R$ 16,6M circulam sem registro de receita.</strong></div>
            <div className="at-metric warn">16,6<span className="u">M BRL · 44%</span></div>
          </div>
          <div className="alert-tile">
            <span className="sev warn">▲ Alto</span>
            <div className="at-title">Capital de giro drena resultado</div>
            <div className="at-body">Bradesco empréstimo R$ 32M + PERT R$ 8,7M + B.B. Giro R$ 12M. <strong style={{color: "var(--amber)"}}>R$ 17,5M em juros</strong> nos 29 meses.</div>
            <div className="at-metric warn">22<span className="u">% do resultado</span></div>
          </div>
        </div>

        {/* Module 03 — Timeline */}
        <div className="mod-sec">
          <span className="num">03</span>
          <div className="ttl">Curva 29 meses<span className="sub">tendência consolidada</span></div>
          <span className="meta">CAR · CAP · Resultado</span>
        </div>
        <div className="grid-tall">
          <div className="card accent-layer hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">CAR vs CAP vs Resultado</div>
                <div className="card-sub">Linha temporal mensal · {empresa}</div>
              </div>
              <div className="legend">
                <span><span className="swatch" style={{background: "#1d4ed8"}}></span>CAR</span>
                <span><span className="swatch" style={{background: "#b45309"}}></span>CAP</span>
                <span><span className="swatch" style={{background: "#15803d"}}></span>Resultado</span>
              </div>
            </div>
            <div className="card-body">
              <LineChart
                data={timeline}
                series={[
                  { key: "car", label: "CAR", color: "#1d4ed8" },
                  { key: "cap", label: "CAP", color: "#b45309" },
                  { key: "resultado", label: "Resultado", color: "#15803d" },
                ]}
                height={260}
                area
                showDots={false}
              />
            </div>
            <div className="card-foot">
              <span>fonte · CAR + CAP + Despesas 4xx</span>
              <span>{months.length} meses · jan/24 — mai/26</span>
            </div>
          </div>

          <div className="card accent-crit hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">Top 5 clientes · REUNIDOS</div>
                <div className="card-sub">Risco de concentração</div>
              </div>
              <span className="card-tag">29 meses</span>
            </div>
            <div className="card-body">
              {D.topClientesReun.map((c, i) => {
                const sev = c.risco === "CRÍTICO" ? "crit" : c.risco === "INTERCO" ? "violet" : c.risco === "MODERADO" ? "warn" : "ok";
                const barC = c.risco === "CRÍTICO" ? "#b91c1c" : c.risco === "INTERCO" ? "#6d28d9" : c.risco === "MODERADO" ? "#b45309" : "#15803d";
                return (
                  <div key={i} style={{ padding: "10px 0", borderBottom: i === D.topClientesReun.length - 1 ? "none" : "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", overflow: "hidden", paddingRight: 8 }}>
                        <span className={`risk-dot ${sev}`}></span>
                        <span style={{ fontSize: 11.5, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nome}</span>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)", fontWeight: 500 }}>{fmtPct(c.pct, 1)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="bar-track" style={{ flex: 1 }}>
                        <div className="bar-fill" style={{ width: (c.pct * 100) + "%", background: barC }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", width: 60, textAlign: "right" }}>{fmtCompact(c.total)}</span>
                    </div>
                  </div>
                );
              })}
              <div className="banner crit" style={{ marginTop: 14 }}>
                <span className="badge">Crítico</span>
                <div>
                  <strong>SUSAM/CMED · 87,6% da receita.</strong> Perda do contrato → CAR cai para R$ 31,5M/29m, insuficiente para CAP atual.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== L1 OPERAÇÃO =====================
  function L1Operacao({ empresa }) {
    // Sazonalidade DESCART (we have 40 months for descart)
    const saz = D.sazonalidadeDescart;
    const sazFiltered = saz.filter(s => s.month >= "2024-01");

    // CAR/CAP totals per month for selected empresa
    const carRows = empresa === "DESCART" ? D.carDescart : D.carReunidos;
    const capRows = empresa === "DESCART" ? D.capDescart : D.capReunidos;
    const months = carRows[0].values.filter(v => v.month !== "TOTAL").map(v => v.month);

    function agg(rows, m) { return rows.reduce((s, r) => s + (r.values.find(x => x.month === m)?.value || 0), 0); }
    const pnl = months.map(m => {
      const car = agg(carRows, m);
      const cap = agg(capRows, m);
      return { month: m, car, cap, resultado: car - cap };
    });

    // Locação per setor
    const setores = D.setores.filter(s => s.setor !== "TOTAL GERAL" && s.total > 0);

    // Intercompany margin trend
    const ic = D.intercompany.filter(m => m.month >= "2024-01");

    return (
      <div className="layer-L1">
        <div className="page-head">
          <div className="page-eyebrow-bar">
            <span className="stripe"></span>
            <span className="txt">L1 · Performance por Empresa · 5 minutos</span>
          </div>
          <h1 className="page-title">Operação · como cada empresa se comporta</h1>
          <p className="page-sub">P&L mensal, sazonalidade de pedidos e composição da locação por setor analítico.</p>
        </div>

        {/* Module 01 */}
        <div className="mod-sec">
          <span className="num">01</span>
          <div className="ttl">P&L mensal e Sazonalidade<span className="sub">comportamento ao longo de 29 meses</span></div>
          <span className="meta">CAR vs CAP · Venda vs Custo</span>
        </div>

        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="card accent-info hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">P&L mensal · {empresa}</div>
                <div className="card-sub">CAR vs CAP · diferença mensal</div>
              </div>
              <div className="legend">
                <span><span className="swatch" style={{background: "#1d4ed8"}}></span>CAR</span>
                <span><span className="swatch" style={{background: "#b45309"}}></span>CAP</span>
              </div>
            </div>
            <div className="card-body">
              <LineChart data={pnl} height={220} area
                series={[
                  { key: "car", label: "CAR", color: "#1d4ed8" },
                  { key: "cap", label: "CAP", color: "#b45309" },
                ]} />
            </div>
          </div>

          <div className="card accent-info hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">Sazonalidade DESCART · venda × custo</div>
                <div className="card-sub">Total da empresa, todos os clientes</div>
              </div>
              <div className="legend">
                <span><span className="swatch" style={{background: "#1d4ed8"}}></span>Venda</span>
                <span><span className="swatch" style={{background: "#a8a29e"}}></span>Custo</span>
              </div>
            </div>
            <div className="card-body">
              <LineChart data={sazFiltered} height={220} area
                x="month"
                series={[
                  { key: "venda", label: "Venda", color: "#1d4ed8" },
                  { key: "custo", label: "Custo", color: "#a8a29e" },
                ]} />
            </div>
          </div>
        </div>

        {/* Module 02 */}
        <div className="mod-sec">
          <span className="num">02</span>
          <div className="ttl">Intercompany e Locação<span className="sub">fluxos internos e custo de equipamentos</span></div>
          <span className="meta">DESCART → REUN · contratos vigentes</span>
        </div>

        <div className="grid-tall">
          <div className="card accent-warn hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">Intercompany · margem mensal</div>
                <div className="card-sub">DESCART → REUNIDOS · 41 meses</div>
              </div>
              <div className="legend">
                <span><span className="swatch" style={{background: "#1d4ed8"}}></span>Venda</span>
                <span><span className="swatch" style={{background: "#a8a29e"}}></span>Custo</span>
                <span><span className="swatch" style={{background: "#15803d"}}></span>Margem</span>
              </div>
            </div>
            <div className="card-body">
              <LineChart data={ic} height={220} area
                series={[
                  { key: "venda", label: "Venda", color: "#1d4ed8" },
                  { key: "custo", label: "Custo", color: "#a8a29e" },
                  { key: "margem", label: "Margem", color: "#15803d" },
                ]} />
            </div>
            <div className="card-foot">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="risk-dot warn"></span>11 dos últimos 16 meses com margem negativa</span>
              <span>fonte · sheet 5</span>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-head">
              <div className="card-title">Locação · valor mensal por setor</div>
              <span className="card-tag">Total / mês</span>
            </div>
            <div className="card-body">
              {setores.map((s, i) => {
                const max = Math.max(...setores.map(x => x.total));
                const sevC = s.pct > 0.5 ? "#1d4ed8" : s.pct > 0.1 ? "#1c1917" : "#a8a29e";
                return (
                  <div key={i} style={{ padding: "8px 0", borderBottom: i === setores.length - 1 ? "none" : "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: "var(--ink)" }}>{s.setor}</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)", fontSize: 11 }}>{fmtPct(s.pct, 1)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="bar-track" style={{ flex: 1 }}>
                        <div className="bar-fill" style={{ width: (s.total / max * 100) + "%", background: sevC }}></div>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)", minWidth: 60, textAlign: "right" }}>{fmtCompact(s.total)}</span>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
                <div>
                  <div className="kpi-l">Vigentes</div>
                  <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, fontFamily: "var(--font-mono)" }}>{D.kpis.contratos.vigentes}</div>
                </div>
                <div>
                  <div className="kpi-l">Mensal</div>
                  <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, fontFamily: "var(--font-mono)" }}>{fmtCompact(D.kpis.contratos.mensalTotal)}</div>
                </div>
                <div>
                  <div className="kpi-l" style={{ color: "var(--red)" }}>Críticos</div>
                  <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, fontFamily: "var(--font-mono)", color: "var(--red)" }}>
                    {D.kpis.contratos.criticos}
                    <span style={{ fontSize: 10, color: "var(--ink-3)", marginLeft: 4 }}>&lt;60d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { L0Sintese, L1Operacao });
})();
