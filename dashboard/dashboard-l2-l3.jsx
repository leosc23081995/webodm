// L2 Análises Estratégicas + L3 Drill-down

(function () {
  const { useMemo, useState } = React;
  const D = window.DASH;
  const { LineChart, HBars, Sparkline, Heatmap, fmtBRL, fmtCompact, fmtPct, fmtMonthShort } = window;

  // ===================== L2 ANÁLISES =====================
  function L2Analises({ empresa }) {
    const reconc = D.reconciliacao;
    // Compute classifications counts
    const gapData = reconc.map(r => ({ month: r.month, paga: r.paga, recebe: r.recebe, gap: r.diff, status: r.status }));
    const totalGap = D.kpis.intercompany.gap;

    // Remuneração ao controle — derive monthly from despesas REUN (account 401010021 - distrib. lucros)
    const distLucros = D.despesasReunidos.find(d => d.conta === "401010021");
    const distLucrosMonthly = distLucros ? distLucros.values.filter(v => v.month !== "TOTAL") : [];

    // Custo financeiro — accounts: parcelamento federal, juros etc.
    // Use account 420010004 + 401010002 + others; simplification: use only "JUROS / EMPRESTIMOS" if found
    const juros = D.despesasReunidos.filter(d =>
      d.nome && (d.nome.includes("JUROS") || d.nome.includes("FINANCEIR") || d.nome.includes("BANCAR") || d.nome.includes("EMPRESTIMO"))
    );
    // Aggregate over months
    const finMonths = D.despesasReunidos[0].values.filter(v => v.month !== "TOTAL").map(v => v.month);
    const finData = finMonths.map(m => {
      let s = 0;
      juros.forEach(j => { s += j.values.find(v => v.month === m)?.value || 0; });
      return { month: m, valor: s };
    });

    // Use 401120001 REFORMAS, 402020002 CUSTO SERV, etc for stacked context
    return (
      <div className="layer-L2">
        <div className="page-head">
          <div className="page-eyebrow-bar">
            <span className="stripe"></span>
            <span className="txt">L2 · Vetores Estratégicos · 15 minutos</span>
          </div>
          <h1 className="page-title">Análises críticas</h1>
          <p className="page-sub">Concentração de receita, reconciliação intercompany, remuneração ao controle, custo financeiro — os 4 vetores que mais movem o resultado.</p>
        </div>

        {/* Module 01 — Concentração */}
        <div className="mod-sec">
          <span className="num">01</span>
          <div className="ttl">Concentração de receita<span className="sub">risco existencial REUNIDOS</span></div>
          <span className="meta">SUSAM = 87,6%</span>
        </div>

        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="card accent-crit hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">Concentração de receita · REUNIDOS</div>
                <div className="card-sub">Top 5 clientes · % da CAR consolidada</div>
              </div>
              <span className="pill solid-crit">87,6% em 1 cliente</span>
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
                        <span style={{ fontSize: 12, color: "var(--ink)" }}>{c.nome}</span>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: barC, fontWeight: 600 }}>{fmtPct(c.pct, 1)}</span>
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
            </div>
            <div className="card-foot">
              <span><span className="risk-dot crit"></span>SUSAM/CMED · clifor 820</span>
              <span>R$ 222M em 29m</span>
            </div>
          </div>

          <div className="card accent-crit hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">Cenário · perda do contrato SUSAM</div>
                <div className="card-sub">Simulação direta</div>
              </div>
              <span className="pill solid-crit">Existencial</span>
            </div>
            <div className="card-body">
              <div className="kpi-grid cols-3" style={{ borderRadius: 6, marginBottom: 14 }}>
                <div className="kpi-cell has-stripe stripe-info">
                  <div className="kpi-l">CAR atual</div>
                  <div className="kpi-v" style={{ fontSize: 20 }}>{fmtCompact(D.kpis.reunidos.car)}</div>
                </div>
                <div className="kpi-cell has-stripe stripe-crit">
                  <div className="kpi-l">CAR sem SUSAM</div>
                  <div className="kpi-v alert" style={{ fontSize: 20 }}>{fmtCompact(D.kpis.reunidos.car - D.topClientesReun[0].total)}</div>
                </div>
                <div className="kpi-cell has-stripe stripe-crit">
                  <div className="kpi-l">Perda</div>
                  <div className="kpi-v alert" style={{ fontSize: 20 }}>−{fmtCompact(D.topClientesReun[0].total)}</div>
                </div>
              </div>
              <div className="banner crit">
                <span className="badge">Diagnóstico</span>
                <div>
                  Em cenário de não-renovação, REUNIDOS opera com <strong>R$ 31,5M/29m (R$ 1,08M/mês)</strong>, insuficiente
                  para cobrir CAP atual de <strong>R$ 12,9M/mês</strong>. Diversificação comercial é urgente.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module 02 — Intercompany */}
        <div className="mod-sec">
          <span className="num">02</span>
          <div className="ttl">Reconciliação intercompany<span className="sub">REUNIDOS paga × DESCART recebe</span></div>
          <span className="meta">Gap acumulado · R$ 16,6M</span>
        </div>

        <div className="card accent-warn hover-lift" style={{ marginBottom: 12 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Gap mensal · 29 meses</div>
              <div className="card-sub">REUNIDOS paga (clifor 133) vs DESCART recebe (clifor 46)</div>
            </div>
            <div className="legend">
              <span><span className="swatch" style={{background: "#1c1917"}}></span>Pago</span>
              <span><span className="swatch" style={{background: "#1d4ed8"}}></span>Recebido</span>
              <span><span className="swatch" style={{background: "#b91c1c"}}></span>Gap</span>
            </div>
          </div>
          <div className="card-body">
            <LineChart
              data={gapData}
              series={[
                { key: "paga", label: "Pago", color: "#1c1917" },
                { key: "recebe", label: "Recebido", color: "#1d4ed8" },
                { key: "gap", label: "Gap", color: "#b91c1c" },
              ]}
              height={220}
              dotted={["gap"]}
              zero
            />
          </div>
          <div className="card-foot">
            <span><span className="risk-dot warn"></span>Acumulado · pago R$ 37,5M · recebido R$ 20,9M · gap R$ 16,6M</span>
            <span>44% não reconhecido</span>
          </div>
        </div>

        {/* Reconciliação table — colored rows */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
            <div>
              <div className="card-title">Detalhe mensal · status por linha</div>
              <div className="card-sub">Severidade da diferença mês a mês</div>
            </div>
            <div className="legend">
              <span><span className="risk-dot crit"></span>Gap crítico</span>
              <span><span className="risk-dot warn"></span>Moderado</span>
              <span><span className="risk-dot ok"></span>OK</span>
            </div>
          </div>
          <div className="card-body flush" style={{ maxHeight: 280, overflow: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th className="r">REUN paga</th>
                  <th className="r">DESC recebe</th>
                  <th className="r">Diferença</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reconc.map((r, i) => {
                  const s = (r.status || "").toLowerCase();
                  const rowCls = s.includes("crítico") || s.includes("critico") ? "row-crit" : s.includes("moderado") ? "row-warn" : s === "ok" ? "row-ok" : "";
                  const pillCls = s.includes("crítico") || s.includes("critico") ? "solid-crit" : s.includes("moderado") ? "solid-warn" : s === "ok" ? "solid-ok" : "neutral";
                  return (
                    <tr key={i} className={rowCls}>
                      <td className="clifor">{r.month}</td>
                      <td className="r">{fmtCompact(r.paga)}</td>
                      <td className="r">{fmtCompact(r.recebe)}</td>
                      <td className="r" style={{ color: r.diff > 0 ? "var(--red)" : r.diff < 0 ? "var(--blue)" : "var(--ink)" }}>
                        {r.diff > 0 ? "+" : ""}{fmtCompact(r.diff)}
                      </td>
                      <td><span className={"pill " + pillCls}>{r.status || "—"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 03 — Remuneração + Financeiro */}
        <div className="mod-sec">
          <span className="num">03</span>
          <div className="ttl">Remuneração ao controle e Custo financeiro<span className="sub">saídas ao acionista e juros</span></div>
          <span className="meta">R$ 12,8M sócios · R$ 53M juros</span>
        </div>

        <div className="grid-2">
          <div className="card accent-violet hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">Remuneração ao controle</div>
                <div className="card-sub">Distribuição lucros + pagamentos diretos a sócios</div>
              </div>
              <span className="pill solid-violet">29 meses</span>
            </div>
            <div className="card-body">
              <table className="tbl" style={{ marginBottom: 14 }}>
                <thead>
                  <tr>
                    <th>Beneficiário</th>
                    <th>Origem</th>
                    <th className="r">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="risk-dot violet"></span><span className="strong">GESTA Participações</span><div style={{ fontSize: 10.5, color: "var(--ink-4)", marginLeft: 14 }}>holding sócios</div></td>
                    <td>REUNIDOS</td>
                    <td className="r" style={{ fontWeight: 600, color: "var(--violet)" }}>{fmtCompact(D.kpis.remuneracao.gesta)}</td>
                  </tr>
                  <tr>
                    <td><span className="risk-dot violet"></span><span className="strong">Cláudio</span><div style={{ fontSize: 10.5, color: "var(--ink-4)", marginLeft: 14 }}>diretor</div></td>
                    <td>DESCART</td>
                    <td className="r">{fmtCompact(D.kpis.remuneracao.claudio)}</td>
                  </tr>
                  <tr>
                    <td><span className="risk-dot violet"></span><span className="strong">Leonardo</span><div style={{ fontSize: 10.5, color: "var(--ink-4)", marginLeft: 14 }}>presidente</div></td>
                    <td>DESCART</td>
                    <td className="r">{fmtCompact(D.kpis.remuneracao.leonardo)}</td>
                  </tr>
                  <tr className="row-total">
                    <td colSpan="2"><span className="strong">TOTAL</span></td>
                    <td className="r strong">{fmtCompact(D.kpis.remuneracao.total)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="banner violet">
                <span className="badge">Mensal</span>
                <div><strong>R$ 442.839 / mês</strong> equivalente — considerar via DLPA quando possível.</div>
              </div>
            </div>
          </div>

          <div className="card accent-crit hover-lift">
            <div className="card-head">
              <div>
                <div className="card-title">Custo financeiro · contas selecionadas</div>
                <div className="card-sub">{juros.length} contas · juros, financeiros, empréstimos</div>
              </div>
              <span className="pill solid-crit">22% do resultado</span>
            </div>
            <div className="card-body">
              <LineChart
                data={finData}
                series={[{ key: "valor", label: "Despesa fin.", color: "#b91c1c" }]}
                height={180}
                area
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, marginTop: 14, border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
                <div className="kpi-cell has-stripe stripe-crit" style={{ padding: "12px 12px 12px 18px" }}>
                  <div className="kpi-l">Bradesco Empr.</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 }}>R$ 32M</div>
                </div>
                <div className="kpi-cell has-stripe stripe-warn" style={{ padding: "12px 12px 12px 18px", borderLeft: "1px solid var(--line)" }}>
                  <div className="kpi-l">PERT</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 }}>R$ 8,7M</div>
                </div>
                <div className="kpi-cell has-stripe stripe-warn" style={{ padding: "12px 12px 12px 18px", borderLeft: "1px solid var(--line)" }}>
                  <div className="kpi-l">B.B. Giro</div>
                  <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 }}>R$ 12M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== L3 DRILL-DOWN =====================
  function L3Drill({ empresa }) {
    const [view, setView] = useState("CAP");
    const [query, setQuery] = useState("");
    const [depth, setDepth] = useState(15);

    const capRows = empresa === "DESCART" ? D.capDescart : D.capReunidos;
    const carRows = empresa === "DESCART" ? D.carDescart : D.carReunidos;
    const rows = view === "CAP" ? capRows : carRows;
    const months = rows[0].values.filter(v => v.month !== "TOTAL").map(v => v.month);

    const filtered = useMemo(() => {
      let r = [...rows];
      if (query) {
        const q = query.toLowerCase();
        r = r.filter(x => (x.nome || "").toLowerCase().includes(q) || (x.clifor || "").toLowerCase().includes(q));
      }
      // Sort by total desc
      r.sort((a, b) => b.total - a.total);
      return r.slice(0, depth);
    }, [rows, query, depth]);

    // Total per month for sparkline
    const allTotal = months.map(m => filtered.reduce((s, r) => s + (r.values.find(v => v.month === m)?.value || 0), 0));

    return (
      <div className="layer-L3">
        <div className="page-head">
          <div className="page-eyebrow-bar">
            <span className="stripe"></span>
            <span className="txt">L3 · Drill-down · navegação livre</span>
          </div>
          <h1 className="page-title">Detalhe mensal · CAP & CAR</h1>
          <p className="page-sub">Heatmap por clifor × mês. Toggle CAP/CAR, filtro por nome, profundidade variável. Cada célula mostra o pagamento/recebimento agregado no mês.</p>
        </div>

        {/* Module 01 — Heatmap CAP/CAR */}
        <div className="mod-sec">
          <span className="num">01</span>
          <div className="ttl">Heatmap CAP / CAR<span className="sub">intensidade ∝ valor</span></div>
          <span className="meta">{filtered.length} clifor · {months.length} meses</span>
        </div>

        <div className="card accent-layer" style={{ marginBottom: 16 }}>
          <div className="card-head" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, flexWrap: "wrap" }}>
              <div className="seg">
                <button className={view === "CAP" ? "on" : ""} onClick={() => setView("CAP")}>CAP — Pagamentos</button>
                <button className={view === "CAR" ? "on" : ""} onClick={() => setView("CAR")}>CAR — Recebimentos</button>
              </div>
              <div className="search">
                <span style={{ color: "var(--ink-4)", fontSize: 13 }}>⌕</span>
                <input
                  placeholder="Buscar clifor ou nome..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="seg">
                <button className={depth === 10 ? "on" : ""} onClick={() => setDepth(10)}>Top 10</button>
                <button className={depth === 15 ? "on" : ""} onClick={() => setDepth(15)}>Top 15</button>
                <button className={depth === 30 ? "on" : ""} onClick={() => setDepth(30)}>Top 30</button>
              </div>
            </div>
            <span className="pill solid-violet">{filtered.length} de {rows.length}</span>
          </div>
          <div className="card-body flush">
            <Heatmap
              rows={filtered}
              months={months}
              getValue={(r, m) => r.values.find(v => v.month === m)?.value || 0}
              getLabel={(r) => r.nome || "—"}
              getMeta={(r) => `clifor ${r.clifor}`}
              cellW={36}
              cellH={26}
              palette={view === "CAP" ? "amber" : "blue"}
            />
          </div>
          <div className="card-foot">
            <span>Cor intensidade ∝ √(valor) · {view === "CAP" ? "tons âmbar" : "tons azul"} · tooltip na célula</span>
            <span>{view} · {empresa}</span>
          </div>
        </div>

        {/* Module 02 — Despesas */}
        <div className="mod-sec">
          <span className="num">02</span>
          <div className="ttl">Despesas operacionais<span className="sub">conta 4xx · REUNIDOS</span></div>
          <span className="meta">Top 12 contas</span>
        </div>

        <div className="card accent-warn">
          <div className="card-head">
            <div>
              <div className="card-title">Pivot mensal por conta contábil</div>
              <div className="card-sub">Ordenado pelo total acumulado em 29 meses</div>
            </div>
            <span className="pill solid-warn">29 meses</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <Heatmap
              rows={[...D.despesasReunidos].sort((a,b) => b.total - a.total).slice(0, 12)}
              months={months}
              getValue={(r, m) => r.values.find(v => v.month === m)?.value || 0}
              getLabel={(r) => r.nome || r.conta}
              getMeta={(r) => `conta ${r.conta}`}
              cellW={36}
              cellH={26}
              palette="amber"
            />
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { L2Analises, L3Drill });
})();
