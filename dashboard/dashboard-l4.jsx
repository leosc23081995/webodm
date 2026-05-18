// L4 Governança · Achados consolidados + queries + anomalias + contratos vencendo

(function () {
  const { useMemo, useState } = React;
  const D = window.DASH;
  const { fmtBRL, fmtCompact, fmtPct } = window;

  function sevOf(titulo) {
    if (!titulo) return "info";
    const t = titulo.toUpperCase();
    if (t.includes("CRÍTICO") || t.includes("CRITICO")) return "crit";
    if (t.includes("[ALTO]")) return "warn";
    if (t.includes("[MÉDIO]") || t.includes("[MEDIO]")) return "info";
    if (t.includes("[BAIXO]")) return "neutral";
    return "info";
  }
  function cleanTitle(t) {
    if (!t) return "";
    return t.replace(/^\[(CRÍTICO|CRITICO|ALTO|MÉDIO|MEDIO|BAIXO)\]\s*/i, "");
  }

  function L4Governanca({ empresa }) {
    const [filter, setFilter] = useState("ALL");
    const all = D.achados.map(a => ({ ...a, sev: sevOf(a.titulo), title: cleanTitle(a.titulo) }));
    const filtered = filter === "ALL" ? all : all.filter(a => a.sev === filter);

    const sevCounts = {
      crit: all.filter(a => a.sev === "crit").length,
      warn: all.filter(a => a.sev === "warn").length,
      info: all.filter(a => a.sev === "info").length,
      neutral: all.filter(a => a.sev === "neutral").length,
    };

    // contratos críticos
    const critContratos = D.contratos.filter(c => c.diasRest > 0 && c.diasRest < 60).sort((a,b) => a.diasRest - b.diasRest);

    return (
      <div className="layer-L4">
        <div className="page-head">
          <div className="page-eyebrow-bar">
            <span className="stripe"></span>
            <span className="txt">L4 · Governança & Auditoria</span>
          </div>
          <h1 className="page-title">Achados, anomalias e pendências</h1>
          <p className="page-sub">14 achados consolidados de 29 meses de análise. Filtro por severidade. Contratos vencendo nos próximos 60 dias listados abaixo.</p>
        </div>

        {/* Module 01 — Severity */}
        <div className="mod-sec">
          <span className="num">01</span>
          <div className="ttl">Severidade dos achados<span className="sub">distribuição por nível de ação</span></div>
          <span className="meta">14 itens · 4 níveis</span>
        </div>

        {/* Severity stats */}
        <div className="kpi-grid cols-4">
          <div className="kpi-cell has-stripe stripe-crit">
            <div className="kpi-l" style={{ color: "var(--red)" }}>Crítico</div>
            <div className="kpi-v alert">{sevCounts.crit}</div>
            <div className="kpi-sub">Ação imediata</div>
          </div>
          <div className="kpi-cell has-stripe stripe-warn">
            <div className="kpi-l" style={{ color: "var(--amber)" }}>Alto</div>
            <div className="kpi-v warn">{sevCounts.warn}</div>
            <div className="kpi-sub">Reunião próxima</div>
          </div>
          <div className="kpi-cell has-stripe stripe-info">
            <div className="kpi-l" style={{ color: "var(--blue)" }}>Médio</div>
            <div className="kpi-v" style={{ color: "var(--blue)" }}>{sevCounts.info}</div>
            <div className="kpi-sub">Roadmap trimestre</div>
          </div>
          <div className="kpi-cell has-stripe">
            <div className="kpi-l" style={{ color: "var(--ink-3)" }}>Baixo</div>
            <div className="kpi-v" style={{ color: "var(--ink-3)" }}>{sevCounts.neutral}</div>
            <div className="kpi-sub">Backlog</div>
          </div>
        </div>

        {/* Module 02 — Achados list */}
        <div className="mod-sec">
          <span className="num">02</span>
          <div className="ttl">Achados consolidados<span className="sub">filtrar por severidade</span></div>
          <span className="meta">{filtered.length} de {all.length}</span>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-head" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
            <div>
              <div className="card-title">Severidade · descrição · ação recomendada</div>
              <div className="card-sub">Linha colorida pela severidade</div>
            </div>
            <div className="seg">
              <button className={filter === "ALL" ? "on" : ""} onClick={() => setFilter("ALL")}>Todos</button>
              <button className={filter === "crit" ? "on" : ""} onClick={() => setFilter("crit")}>Crítico</button>
              <button className={filter === "warn" ? "on" : ""} onClick={() => setFilter("warn")}>Alto</button>
              <button className={filter === "info" ? "on" : ""} onClick={() => setFilter("info")}>Médio</button>
              <button className={filter === "neutral" ? "on" : ""} onClick={() => setFilter("neutral")}>Baixo</button>
            </div>
          </div>
          <div className="card-body flush">
            <div style={{ display: "grid", gridTemplateColumns: "92px 50px 1fr 320px", gap: 0, padding: "10px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              <span>Sev.</span>
              <span>#</span>
              <span>Achado · evidência</span>
              <span>Ação recomendada</span>
            </div>
            {filtered.map((a, i) => {
              const bg = a.sev === "crit" ? "var(--red-soft)" : a.sev === "warn" ? "var(--amber-soft)" : a.sev === "info" ? "var(--blue-soft)" : "transparent";
              const borderC = a.sev === "crit" ? "var(--red)" : a.sev === "warn" ? "var(--amber)" : a.sev === "info" ? "var(--blue)" : "var(--ink-4)";
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "92px 50px 1fr 320px", gap: 18, padding: "16px 18px", borderBottom: "1px solid var(--line)", alignItems: "start", borderLeft: `3px solid ${borderC}` }}>
                  <span>
                    <span className={"pill solid-" + (a.sev === "neutral" ? "neutral" : a.sev)}>
                      {a.sev === "crit" ? "Crítico" : a.sev === "warn" ? "Alto" : a.sev === "info" ? "Médio" : "Baixo"}
                    </span>
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-4)" }}>{String(a.num).padStart(2, "0")}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.005em", marginBottom: 6 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>{a.evidencia}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", paddingLeft: 14, borderLeft: "2px solid var(--line-2)", lineHeight: 1.55 }}>
                    {a.acao}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 03 — Contratos */}
        <div className="mod-sec">
          <span className="num">03</span>
          <div className="ttl">Contratos vencendo<span className="sub">próximos 60 dias</span></div>
          <span className="meta">{critContratos.length} críticos</span>
        </div>

        <div className="card accent-crit" style={{ marginBottom: 16 }}>
          <div className="card-head" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
            <div>
              <div className="card-title">Contratos críticos · ação urgente</div>
              <div className="card-sub">PROSERV concentra todos os vencimentos &lt; 60d</div>
            </div>
            <span className="pill solid-crit">{critContratos.length} contratos · &lt;60d</span>
          </div>
          <div className="card-body flush">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Fornecedor</th>
                  <th>Setor</th>
                  <th>Equipamento</th>
                  <th>Vencimento</th>
                  <th className="r">Dias rest.</th>
                  <th className="r">Mensal</th>
                  <th className="r">Total contrato</th>
                </tr>
              </thead>
              <tbody>
                {critContratos.map((c, i) => (
                  <tr key={i} className="row-crit">
                    <td><span className="strong">{c.empresa.replace("LAB. REUNIDOS", "REUNIDOS")}</span></td>
                    <td>{c.fornecedor}</td>
                    <td>{c.setor}</td>
                    <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.equipamento}</td>
                    <td className="clifor">{c.vencimento}</td>
                    <td className="r"><span className="pill solid-crit">{c.diasRest}d</span></td>
                    <td className="r">{c.valorMensal ? fmtCompact(c.valorMensal) : "—"}</td>
                    <td className="r">{c.totalContrato ? fmtCompact(c.totalContrato) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 04 — Anomalias técnicas */}
        <div className="mod-sec">
          <span className="num">04</span>
          <div className="ttl">Anomalias técnicas<span className="sub">inconsistências de dados e cadastro</span></div>
          <span className="meta">{D.anomalias.length} pontos</span>
        </div>

        <div className="card accent-info">
          <div className="card-head" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
            <div>
              <div className="card-title">Pontos de investigação</div>
              <div className="card-sub">Evidência + ação sugerida</div>
            </div>
            <span className="pill solid-info">Validação técnica</span>
          </div>
          <div className="card-body flush">
            {D.anomalias.map((a, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 320px", gap: 16, padding: "14px 18px", borderBottom: i === D.anomalias.length - 1 ? "none" : "1px solid var(--line)", alignItems: "start" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>{String(a.num).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{a.titulo}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{a.evidencia}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", paddingLeft: 14, borderLeft: "2px solid var(--line-2)", lineHeight: 1.5 }}>{a.acao}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { L4Governanca });
})();
